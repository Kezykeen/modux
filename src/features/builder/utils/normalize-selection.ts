import { DEFAULT_SELECTION } from '@/data/catalog'
import type { BuildSelection } from '@/shared/types'

export function normalizeSelection(raw: unknown): BuildSelection {
  if (!raw || typeof raw !== 'object') return DEFAULT_SELECTION

  const value = raw as Record<string, unknown>
  const strings = (input: unknown) =>
    Array.isArray(input) ? input.filter((id): id is string => typeof id === 'string') : []

  return {
    hair: typeof value.hair === 'string' ? value.hair : DEFAULT_SELECTION.hair,
    top: typeof value.top === 'string' ? value.top : DEFAULT_SELECTION.top,
    pants: typeof value.pants === 'string' ? value.pants : DEFAULT_SELECTION.pants,
    shoes: typeof value.shoes === 'string' ? value.shoes : DEFAULT_SELECTION.shoes,
    weapon: strings(value.weapon),
    accessory: strings(value.accessory),
  }
}
