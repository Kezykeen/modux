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
import { CATALOG, DEFAULT_SELECTION } from '@/data/catalog'
import { armAssemblySfx } from '@/audio'
import { playRemoveSfx } from '@/audio'
import { isStackableCategory, type BuildSelection, type CategoryId } from '@/shared/types'

export type ActiveCategory = CategoryId | 'all'
export type ViewMode = '3d' | '2d'

interface BuildContextValue {
  selection: BuildSelection
  activeCategory: ActiveCategory
  setActiveCategory: (id: ActiveCategory) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  selectItem: (categoryId: CategoryId, itemId: string) => void
  removeItem: (categoryId: CategoryId, itemId: string) => void
  isSelected: (itemId: string) => boolean
  buildItems: typeof CATALOG
  buildPrice: number
  cartCount: number
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
    else if (typeof value === 'string') ids.push(value)
  }
  return ids
}

function stackOf(selection: BuildSelection, categoryId: CategoryId) {
  if (categoryId === 'accessory') return selection.accessory ?? []
  if (categoryId === 'weapon') return selection.weapon ?? []
  return []
}

export function BuildProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<BuildSelection>(DEFAULT_SELECTION)
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
    // Hair, tops, pants and shoes must keep one item on the avatar.
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

  const buildItems = useMemo(
    () =>
      selectedIds(selection)
        .map((id) => CATALOG.find((c) => c.id === id))
        .filter((item): item is (typeof CATALOG)[number] => Boolean(item)),
    [selection],
  )

  const buildPrice = useMemo(() => buildItems.reduce((sum, i) => sum + i.price, 0), [buildItems])

  const value = useMemo<BuildContextValue>(
    () => ({
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
