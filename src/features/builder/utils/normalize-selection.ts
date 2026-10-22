import { DEFAULT_KIT_ID, getKit, isKitId, type KitId } from '@/data/catalog'
import type { BuildSelection, CategoryId } from '@/shared/types'

function knownId(catalog: ReturnType<typeof getKit>['catalog'], id: unknown, categoryId: CategoryId, fallback: string) {
  if (typeof id !== 'string' || id.length === 0) return fallback
  return catalog.some((item) => item.id === id && item.categoryId === categoryId) ? id : fallback
}

function knownStack(catalog: ReturnType<typeof getKit>['catalog'], input: unknown, categoryId: CategoryId) {
  if (!Array.isArray(input)) return []
  return input.filter(
    (id): id is string =>
      typeof id === 'string' && catalog.some((item) => item.id === id && item.categoryId === categoryId),
  )
}

function collectIds(value: Record<string, unknown>): string[] {
  const ids: string[] = []
  for (const key of ['hair', 'top', 'pants', 'shoes'] as const) {
    if (typeof value[key] === 'string') ids.push(value[key] as string)
  }
  for (const key of ['weapon', 'accessory'] as const) {
    if (Array.isArray(value[key])) {
      ids.push(...value[key].filter((id): id is string => typeof id === 'string'))
    }
  }
  return ids
}

export function inferKitId(raw: unknown): KitId {
  if (raw && typeof raw === 'object') {
    const value = raw as Record<string, unknown>
    if (typeof value.kitId === 'string' && isKitId(value.kitId)) return value.kitId

    const ids = collectIds(value)
    if (ids.some((id) => id.startsWith('ninja-'))) return 'ninja'
    if (ids.some((id) => id.startsWith('street-'))) return 'street'
  }
  return DEFAULT_KIT_ID
}

export function normalizeSelection(raw: unknown, kitId: KitId = inferKitId(raw)): BuildSelection {
  const kit = getKit(kitId)
  const fallback = kit.defaultSelection
  if (!raw || typeof raw !== 'object') return fallback

  const value = raw as Record<string, unknown>
  const { catalog } = kit

  return {
    hair: knownId(catalog, value.hair, 'hair', fallback.hair),
    top: knownId(catalog, value.top, 'top', fallback.top),
    pants: knownId(catalog, value.pants, 'pants', fallback.pants),
    shoes: knownId(catalog, value.shoes, 'shoes', fallback.shoes),
    weapon: knownStack(catalog, value.weapon, 'weapon'),
    accessory: knownStack(catalog, value.accessory, 'accessory'),
  }
}

export function parseSavedBuild(raw: unknown): { kitId: KitId; selection: BuildSelection } {
  const kitId = inferKitId(raw)
  return { kitId, selection: normalizeSelection(raw, kitId) }
}
