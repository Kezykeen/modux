import type { BuildSelection, CatalogItem, CategoryDef, CategoryId, Rarity } from '@/shared/types'

/** Three per side, ordered head-to-toe so each card sits near the part it edits. */
export const CATEGORIES: CategoryDef[] = [
  { id: 'hair', label: 'Hair', side: 'left', anchor: 26, hint: 'Hairstyles' },
  { id: 'top', label: 'Tops', side: 'left', anchor: 50, hint: 'Jackets, hoodies & tees' },
  { id: 'pants', label: 'Pants', side: 'left', anchor: 74, hint: 'Bottoms & layers' },
  { id: 'weapon', label: 'Weapons', side: 'right', anchor: 26, hint: 'Blades & shields' },
  { id: 'accessory', label: 'Accessories', side: 'right', anchor: 50, hint: 'Details & ornaments' },
  { id: 'shoes', label: 'Shoes', side: 'right', anchor: 74, hint: 'Footwear' },
]

export const RARITY_META: Record<Rarity, { label: string; color: string; glow: string }> = {
  common: { label: 'Common', color: '#9ca3af', glow: 'rgba(156,163,175,0.35)' },
  rare: { label: 'Rare', color: '#38bdf8', glow: 'rgba(56,189,248,0.4)' },
  epic: { label: 'Epic', color: '#c084fc', glow: 'rgba(192,132,252,0.45)' },
  legendary: { label: 'Legendary', color: '#fbbf24', glow: 'rgba(251,191,36,0.5)' },
}

const asset = (path: string) => encodeURI(path)
const render = (name: string) => encodeURI(`/assets/Renders/${name}.webp`)

let uid = 0
const item = (
  categoryId: CategoryId,
  name: string,
  price: number,
  rarity: Rarity,
  colorFrom: string,
  colorTo: string,
  assetPath: string,
  popularity = 50,
  hasRender = true,
): CatalogItem => ({
  id: `${categoryId}-${uid++}`,
  categoryId,
  name,
  price,
  rarity,
  colorFrom,
  colorTo,
  popularity,
  assetPath: asset(assetPath),
  previewPath: hasRender ? render(name) : undefined,
})

export const CATALOG: CatalogItem[] = [
  item('hair', 'Hair', 5.99, 'rare', '#1f1b24', '#0a0810', '/assets/Hair/Hair.glb', 88),

  item('top', 'Torso', 9.99, 'rare', '#4c1d95', '#1e1b4b', '/assets/Top/Torso.glb', 90),

  item('pants', 'Legs', 6.99, 'rare', '#111827', '#0f172a', '/assets/Pants/Legs.glb', 84),

  item('shoes', 'Shoes', 5.99, 'common', '#e2e8f0', '#334155', '/assets/Shoes/Shoes.glb', 80),

  item('weapon', 'Sword', 14.99, 'epic', '#94a3b8', '#0f172a', '/assets/Weapon/Sword.glb', 92),
  item('weapon', 'Shield', 16.99, 'legendary', '#22d3ee', '#6d28d9', '/assets/Weapon/Shield.glb', 89),

  item('accessory', 'Mask', 5.99, 'rare', '#38bdf8', '#0c4a6e', '/assets/Accessories/Mask.glb', 85),
  item('accessory', 'Chain', 6.99, 'common', '#94a3b8', '#334155', '/assets/Accessories/Chain.glb', 72),
]

const byName = (name: string) => {
  const id = CATALOG.find((entry) => entry.name === name)?.id
  if (!id) throw new Error(`Unknown catalog item: ${name}`)
  return id
}

/** Hair, tops, pants and shoes always start equipped and cannot be emptied. */
export const DEFAULT_SELECTION: BuildSelection = {
  hair: byName('Hair'),
  top: byName('Torso'),
  pants: byName('Legs'),
  shoes: byName('Shoes'),
  weapon: [],
  accessory: [],
}

/** Head and hands are the always-on figure; clothing/gear composites on top. */
export const BODY_ASSET_PATHS = [
  asset('/assets/Body/Head.glb'),
  asset('/assets/Body/Hand.glb'),
]

export const BODY_ASSET_PATH = BODY_ASSET_PATHS[0]
