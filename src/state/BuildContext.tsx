import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CATALOG, DEFAULT_SELECTION } from '../data/catalog'
import type { CategoryId } from '../types'

export type ActiveCategory = CategoryId | 'all'

interface BuildContextValue {
  selection: Partial<Record<CategoryId, string>>
  hoveredCategory: CategoryId | null
  setHoveredCategory: (id: CategoryId | null) => void
  activeCategory: ActiveCategory
  setActiveCategory: (id: ActiveCategory) => void
  selectItem: (categoryId: CategoryId, itemId: string) => void
  removeItem: (categoryId: CategoryId) => void
  isSelected: (itemId: string) => boolean
  buildItems: typeof CATALOG
  buildPrice: number
  cartCount: number
}

const BuildContext = createContext<BuildContextValue | null>(null)

export function BuildProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Partial<Record<CategoryId, string>>>(DEFAULT_SELECTION)
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null)
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('all')

  const selectItem = useCallback((categoryId: CategoryId, itemId: string) => {
    setSelection((prev) => {
      const alreadySelected = prev[categoryId] === itemId
      const next = { ...prev }
      if (alreadySelected) {
        delete next[categoryId]
      } else {
        next[categoryId] = itemId
      }
      return next
    })
  }, [])

  const removeItem = useCallback((categoryId: CategoryId) => {
    setSelection((prev) => {
      const next = { ...prev }
      delete next[categoryId]
      return next
    })
  }, [])

  const isSelected = useCallback(
    (itemId: string) => Object.values(selection).includes(itemId),
    [selection],
  )

  const buildItems = useMemo(
    () => Object.values(selection).map((id) => CATALOG.find((c) => c.id === id)!).filter(Boolean),
    [selection],
  )

  const buildPrice = useMemo(() => buildItems.reduce((sum, i) => sum + i.price, 0), [buildItems])

  const value: BuildContextValue = {
    selection,
    hoveredCategory,
    setHoveredCategory,
    activeCategory,
    setActiveCategory,
    selectItem,
    removeItem,
    isSelected,
    buildItems,
    buildPrice,
    cartCount: buildItems.length,
  }

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>
}

export function useBuild() {
  const ctx = useContext(BuildContext)
  if (!ctx) throw new Error('useBuild must be used within BuildProvider')
  return ctx
}
