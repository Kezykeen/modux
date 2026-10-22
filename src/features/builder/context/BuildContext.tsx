import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DEFAULT_KIT_ID,
  getKit,
  isKitId,
  type KitDef,
  type KitId,
} from '@/data/catalog'
import { armAssemblySfx } from '@/audio'
import { playRemoveSfx } from '@/audio'
import { isStackableCategory, type BuildSelection, type CatalogItem, type CategoryId } from '@/shared/types'
import { inferKitId, normalizeSelection } from '../utils/normalize-selection'

export type ActiveCategory = CategoryId | 'all'
export type ViewMode = '3d' | '2d'

type CustomizeLocationState = {
  selection?: BuildSelection
  kitId?: KitId
} | null

interface BuildContextValue {
  kit: KitDef
  kitId: KitId
  kitPicked: boolean
  resumeKitId: KitId | null
  catalog: CatalogItem[]
  selection: BuildSelection
  activeCategory: ActiveCategory
  setActiveCategory: (id: ActiveCategory) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  selectItem: (categoryId: CategoryId, itemId: string) => void
  removeItem: (categoryId: CategoryId, itemId: string) => void
  isSelected: (itemId: string) => boolean
  buildItems: CatalogItem[]
  buildPrice: number
  cartCount: number
  chooseKit: (id: KitId) => void
  changeKit: () => void
  loadSelection: (selection: BuildSelection, kitId?: KitId) => void
}

interface HoverContextValue {
  hoveredCategory: CategoryId | null
  setHoveredCategory: (id: CategoryId | null) => void
}

const BuildContext = createContext<BuildContextValue | null>(null)
const HoverContext = createContext<HoverContextValue | null>(null)

function selectedIds(selection: BuildSelection): string[] {
  const ids: string[] = []
  for (const value of Object.values(selection)) {
    if (Array.isArray(value)) ids.push(...value)
    else if (typeof value === 'string' && value.length > 0) ids.push(value)
  }
  return ids
}

function stackOf(selection: BuildSelection, categoryId: CategoryId) {
  if (categoryId === 'accessory') return selection.accessory ?? []
  if (categoryId === 'weapon') return selection.weapon ?? []
  return []
}

function applyKit(id: KitId, selection?: BuildSelection) {
  return {
    kitId: id,
    selection: selection ? normalizeSelection(selection, id) : getKit(id).defaultSelection,
  }
}

export function BuildProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const pending = (location.state as CustomizeLocationState)?.selection
  const pendingKit =
    (location.state as CustomizeLocationState)?.kitId ??
    (pending ? inferKitId(pending) : null)

  const [kitId, setKitId] = useState<KitId>(pendingKit && isKitId(pendingKit) ? pendingKit : DEFAULT_KIT_ID)
  const kit = getKit(kitId)
  const [kitPicked, setKitPicked] = useState(() => Boolean(pending))
  const [resumeKitId, setResumeKitId] = useState<KitId | null>(() =>
    pending ? (pendingKit && isKitId(pendingKit) ? pendingKit : DEFAULT_KIT_ID) : null,
  )

  const [selection, setSelection] = useState<BuildSelection>(() =>
    pending ? normalizeSelection(pending, kitId) : kit.defaultSelection,
  )
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null)
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('all')
  const [viewMode, setViewModeState] = useState<ViewMode>('3d')

  const selectionRef = useRef(selection)
  const viewModeRef = useRef(viewMode)
  const kitIdRef = useRef(kitId)
  useEffect(() => {
    selectionRef.current = selection
  }, [selection])
  useEffect(() => {
    viewModeRef.current = viewMode
  }, [viewMode])
  useEffect(() => {
    kitIdRef.current = kitId
  }, [kitId])

  useEffect(() => {
    if (!location.pathname.startsWith('/customize')) return
    const state = location.state as CustomizeLocationState
    const incoming = state?.selection
    if (!incoming) return
    const nextKit = state?.kitId && isKitId(state.kitId) ? state.kitId : inferKitId(incoming)
    const applied = applyKit(nextKit, incoming)
    setKitId(applied.kitId)
    setResumeKitId(applied.kitId)
    setSelection(applied.selection)
    setKitPicked(true)
    setActiveCategory('all')
    setViewModeState('3d')
    setHoveredCategory(null)
    navigate('/customize', { replace: true, state: null })
  }, [location.key, location.pathname, location.state, navigate])

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
    if (mode === '2d') setHoveredCategory(null)
  }, [])

  const chooseKit = useCallback((id: KitId) => {
    if (id !== kitIdRef.current) {
      setKitId(id)
      setSelection(getKit(id).defaultSelection)
    }
    setResumeKitId(id)
    setKitPicked(true)
    setActiveCategory('all')
    setViewModeState('3d')
    setHoveredCategory(null)
  }, [])

  const changeKit = useCallback(() => {
    setKitPicked(false)
    setHoveredCategory(null)
    setViewModeState('3d')
  }, [])

  const selectItem = useCallback((categoryId: CategoryId, itemId: string) => {
    if (viewModeRef.current === '2d') return
    const current = selectionRef.current

    if (isStackableCategory(categoryId)) {
      const stack = stackOf(current, categoryId)
      const isApplying = !stack.includes(itemId)
      if (isApplying) armAssemblySfx()
      else playRemoveSfx()

      setSelection((prev) => {
        const existing = stackOf(prev, categoryId)
        return {
          ...prev,
          [categoryId]: existing.includes(itemId)
            ? existing.filter((id) => id !== itemId)
            : [...existing, itemId],
        }
      })
      return
    }

    if (current[categoryId] === itemId) return

    armAssemblySfx()
    setSelection((prev) => ({ ...prev, [categoryId]: itemId }))
  }, [])

  const removeItem = useCallback((categoryId: CategoryId, itemId: string) => {
    if (viewModeRef.current === '2d') return
    if (!isStackableCategory(categoryId)) return

    const current = selectionRef.current
    if (!stackOf(current, categoryId).includes(itemId)) return

    playRemoveSfx()
    setSelection((prev) => ({
      ...prev,
      [categoryId]: stackOf(prev, categoryId).filter((id) => id !== itemId),
    }))
  }, [])

  const isSelected = useCallback(
    (itemId: string) => selectedIds(selection).includes(itemId),
    [selection],
  )

  const loadSelection = useCallback((next: BuildSelection, nextKitId?: KitId) => {
    const resolvedKit = nextKitId ?? inferKitId(next)
    const applied = applyKit(resolvedKit, next)
    setKitId(applied.kitId)
    setResumeKitId(applied.kitId)
    setSelection(applied.selection)
    setKitPicked(true)
    setActiveCategory('all')
    setViewModeState('3d')
    setHoveredCategory(null)
  }, [])

  const buildItems = useMemo(
    () =>
      selectedIds(selection)
        .map((id) => kit.catalog.find((c) => c.id === id))
        .filter((item): item is CatalogItem => Boolean(item)),
    [selection, kit.catalog],
  )

  const buildPrice = useMemo(() => buildItems.reduce((sum, i) => sum + i.price, 0), [buildItems])

  const value = useMemo<BuildContextValue>(
    () => ({
      kit,
      kitId,
      kitPicked,
      resumeKitId,
      catalog: kit.catalog,
      selection,
      activeCategory,
      setActiveCategory,
      viewMode,
      setViewMode,
      selectItem,
      removeItem,
      isSelected,
      buildItems,
      buildPrice,
      cartCount: buildItems.length,
      chooseKit,
      changeKit,
      loadSelection,
    }),
    [
      kit,
      kitId,
      kitPicked,
      resumeKitId,
      selection,
      activeCategory,
      viewMode,
      setViewMode,
      selectItem,
      removeItem,
      isSelected,
      buildItems,
      buildPrice,
      chooseKit,
      changeKit,
      loadSelection,
    ],
  )

  const hoverValue = useMemo<HoverContextValue>(
    () => ({ hoveredCategory, setHoveredCategory }),
    [hoveredCategory],
  )

  return (
    <BuildContext.Provider value={value}>
      <HoverContext.Provider value={hoverValue}>{children}</HoverContext.Provider>
    </BuildContext.Provider>
  )
}

export function useBuild() {
  const ctx = useContext(BuildContext)
  if (!ctx) throw new Error('useBuild must be used within BuildProvider')
  return ctx
}

export function useHover() {
  const ctx = useContext(HoverContext)
  if (!ctx) throw new Error('useHover must be used within BuildProvider')
  return ctx
}
