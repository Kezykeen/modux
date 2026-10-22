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
import { CATALOG, DEFAULT_SELECTION } from '@/data/catalog'
import { armAssemblySfx } from '@/audio'
import { playRemoveSfx } from '@/audio'
import { isStackableCategory, type BuildSelection, type CatalogItem, type CategoryId } from '@/shared/types'
import { normalizeSelection } from '../utils/normalize-selection'

export type ActiveCategory = CategoryId | 'all'
export type ViewMode = '3d' | '2d'

interface BuildContextValue {
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
  loadSelection: (selection: BuildSelection) => void
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

export function BuildProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const pendingSelection = (location.state as { selection?: BuildSelection } | null)?.selection

  const [selection, setSelection] = useState<BuildSelection>(() =>
    pendingSelection ? normalizeSelection(pendingSelection) : DEFAULT_SELECTION,
  )
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null)
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('all')
  const [viewMode, setViewModeState] = useState<ViewMode>('3d')

  const selectionRef = useRef(selection)
  const viewModeRef = useRef(viewMode)
  useEffect(() => {
    selectionRef.current = selection
  }, [selection])
  useEffect(() => {
    viewModeRef.current = viewMode
  }, [viewMode])

  useEffect(() => {
    const pending = (location.state as { selection?: BuildSelection } | null)?.selection
    if (!pending) return
    setSelection(normalizeSelection(pending))
    navigate(location.pathname, { replace: true, state: null })
  }, [location.key, location.pathname, location.state, navigate])

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
    if (mode === '2d') setHoveredCategory(null)
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

  const loadSelection = useCallback((next: BuildSelection) => {
    setSelection(normalizeSelection(next))
  }, [])

  const buildItems = useMemo(
    () =>
      selectedIds(selection)
        .map((id) => CATALOG.find((c) => c.id === id))
        .filter((item): item is CatalogItem => Boolean(item)),
    [selection],
  )

  const buildPrice = useMemo(() => buildItems.reduce((sum, i) => sum + i.price, 0), [buildItems])

  const value = useMemo<BuildContextValue>(
    () => ({
      catalog: CATALOG,
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
      loadSelection,
    }),
    [
      selection,
      activeCategory,
      viewMode,
      setViewMode,
      selectItem,
      removeItem,
      isSelected,
      buildItems,
      buildPrice,
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
