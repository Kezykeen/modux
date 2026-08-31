import { CATALOG } from '@/data/catalog'
import type { BuildSelection, Rarity } from '@/shared/types'

const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary']

const catalogById = new Map(CATALOG.map((item) => [item.id, item]))
const catalogByName = new Map(CATALOG.map((item) => [item.name, item]))

export type CollectionProgress = {
  collected: number
  total: number
  progressPercent: number
  byRarity: { rarity: Rarity; label: string; count: number; color: string }[]
}

export function collectCatalogIdsFromSelection(selection: unknown): string[] {
  if (!selection || typeof selection !== 'object') return []

  const s = selection as BuildSelection
  const ids: string[] = []

  if (typeof s.hair === 'string') ids.push(s.hair)
  if (typeof s.top === 'string') ids.push(s.top)
  if (typeof s.pants === 'string') ids.push(s.pants)
  if (typeof s.shoes === 'string') ids.push(s.shoes)
  if (Array.isArray(s.weapon)) ids.push(...s.weapon.filter((id) => typeof id === 'string'))
  if (Array.isArray(s.accessory)) ids.push(...s.accessory.filter((id) => typeof id === 'string'))

  return ids.filter((id) => catalogById.has(id))
}

export function collectCatalogIdsFromPartNames(names: string[]): string[] {
  return names.flatMap((name) => {
    const item = catalogByName.get(name)
    return item ? [item.id] : []
  })
}

export function computeCollectionProgress(catalogIds: Iterable<string>): CollectionProgress {
  const unique = new Set<string>()
  for (const id of catalogIds) {
    if (catalogById.has(id)) unique.add(id)
  }

  const counts: Record<Rarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  }

  for (const id of unique) {
    const item = catalogById.get(id)
    if (item) counts[item.rarity] += 1
  }

  const total = CATALOG.length
  const collected = unique.size
  const progressPercent = total > 0 ? (collected / total) * 100 : 0

  return {
    collected,
    total,
    progressPercent,
    byRarity: RARITIES.map((rarity) => ({
      rarity,
      label: rarity.charAt(0).toUpperCase() + rarity.slice(1),
      count: counts[rarity],
      color: `bg-rarity-${rarity}`,
    })),
  }
}
