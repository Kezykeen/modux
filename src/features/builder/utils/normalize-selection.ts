import { CATALOG, DEFAULT_SELECTION } from '@/data/catalog'
import type { BuildSelection, CategoryId } from '@/shared/types'

function knownId(id: unknown, categoryId: CategoryId, fallback: string) {
  if (typeof id !== 'string' || id.length === 0) return fallback
  return CATALOG.some((item) => item.id === id && item.categoryId === categoryId) ? id : fallback
}

function knownStack(input: unknown, categoryId: CategoryId) {
  if (!Array.isArray(input)) return []
  return input.filter(
    (id): id is string =>
      typeof id === 'string' && CATALOG.some((item) => item.id === id && item.categoryId === categoryId),
  )
}

export function normalizeSelection(raw: unknown): BuildSelection {
  if (!raw || typeof raw !== 'object') return DEFAULT_SELECTION

  const value = raw as Record<string, unknown>

  return {
    hair: knownId(value.hair, 'hair', DEFAULT_SELECTION.hair),
    top: knownId(value.top, 'top', DEFAULT_SELECTION.top),
    pants: knownId(value.pants, 'pants', DEFAULT_SELECTION.pants),
    shoes: knownId(value.shoes, 'shoes', DEFAULT_SELECTION.shoes),
    weapon: knownStack(value.weapon, 'weapon'),
    accessory: knownStack(value.accessory, 'accessory'),
  }
}
