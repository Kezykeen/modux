import type { BuildSelection, CatalogItem, CategoryDef, CategoryId, Rarity } from '@/shared/types'

/** Two per side, ordered head-to-toe so each card sits near the part it edits. */
export const CATEGORIES: CategoryDef[] = [
  { id: 'hair', label: 'Hair', side: 'left', anchor: 32, hint: 'Head and hair' },
  { id: 'pants', label: 'Pants', side: 'left', anchor: 70, hint: 'Bottoms' },
  { id: 'accessory', label: 'Accessories', side: 'right', anchor: 32, hint: 'Bags and charms' },
  { id: 'shoes', label: 'Shoes', side: 'right', anchor: 70, hint: 'Footwear' },
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
  item('hair', 'Hair', 5.99, 'rare', '#1f1b24', '#0a0810', '/assets/Hair/Hair.glb', 88, false),
  item('pants', 'Pants', 6.99, 'rare', '#111827', '#0f172a', '/assets/Pants/Pants.glb', 84, false),
  item('shoes', 'Shoes', 5.99, 'common', '#e2e8f0', '#334155', '/assets/Shoes/Shoes.glb', 80, false),
  item('accessory', 'Bag', 8.99, 'epic', '#4c1d95', '#1e1b4b', '/assets/Accessories/Bag.glb', 90, false),
  item('accessory', 'Charm', 4.99, 'rare', '#38bdf8', '#0c4a6e', '/assets/Accessories/Charm.glb', 72, false),
]

const byName = (name: string) => {
  const id = CATALOG.find((entry) => entry.name === name)?.id
  if (!id) throw new Error(`Unknown catalog item: ${name}`)
  return id
}

/** Hair, pants and shoes always start equipped and cannot be emptied. */
export const DEFAULT_SELECTION: BuildSelection = {
  hair: byName('Hair'),
  top: '',
  pants: byName('Pants'),
  shoes: byName('Shoes'),
  weapon: [],
  accessory: [],
}

/** Body and hands stay on the figure; clothing and gear composite on top. */
export const BODY_ASSET_PATHS = [
  asset('/assets/Body/Body.glb'),
  asset('/assets/Body/Hand.glb'),
]

export const BODY_ASSET_PATH = BODY_ASSET_PATHS[0]
