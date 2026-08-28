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
  item('hair', 'Cyber Black Hair', 5.99, 'rare', '#1f1b24', '#0a0810', '/assets/Hair/Cyber Black Hair.glb', 88),
  item('hair', 'Cyber Grey Hair', 4.99, 'common', '#6b6574', '#2a2630', '/assets/Hair/Cyber Grey Hair.glb', 74),

  item('top', 'Techwear Top', 9.99, 'rare', '#4c1d95', '#1e1b4b', '/assets/Top/Techwear Top.glb', 90),
  item('top', 'Cyber Moon Top', 12.99, 'epic', '#7c3aed', '#312e81', '/assets/Top/Cyber Moon Top/Cyber Moon Top.glb', 86),

  item('pants', 'Black Pants', 5.49, 'common', '#1e293b', '#0b1220', '/assets/Pants/Black Pants.glb', 62),
  item('pants', 'Cyber Black Pants', 6.99, 'rare', '#111827', '#0f172a', '/assets/Pants/Cyber Black Pants.glb', 84),
  item('pants', 'Cyber Moon Pants', 8.99, 'epic', '#5b21b6', '#1e1b4b', '/assets/Pants/Cyber Moon Pants/Cyber Moon Pants.glb', 81),

  item('shoes', 'Black Strips', 5.99, 'common', '#e2e8f0', '#334155', '/assets/Shoes/Black Strips.glb', 80),
  item('shoes', 'Purple Strips', 6.49, 'rare', '#a855f7', '#4c1d95', '/assets/Shoes/Purple Strips.glb', 77),
  item('shoes', 'Chunky Sneakers', 7.49, 'rare', '#64748b', '#1e293b', '/assets/Shoes/Chunky Sneakers.glb', 71),

  item('weapon', 'Double Katana', 14.99, 'epic', '#94a3b8', '#0f172a', '/assets/Weapon/Double Katana.glb', 92),
  item('weapon', 'Neon Shield', 16.99, 'legendary', '#22d3ee', '#6d28d9', '/assets/Weapon/Neon Shield.glb', 89),

  item('accessory', 'Ninja Mask', 5.99, 'rare', '#38bdf8', '#0c4a6e', '/assets/Accessories/Ninja Mask.glb', 85),
  item('accessory', 'Techwear Chain', 6.99, 'common', '#94a3b8', '#334155', '/assets/Accessories/Techwear Chain.glb', 72),
  item('accessory', 'Shadow Horns', 10.99, 'epic', '#a855f7', '#ec4899', '/assets/Accessories/Shadow Horns.glb', 93),
  item('accessory', 'Shadow Shoulder Pet', 12.99, 'legendary', '#fbbf24', '#78350f', '/assets/Accessories/Shadow Shoulder Pet.glb', 96),
]

const byName = (name: string) => {
  const id = CATALOG.find((entry) => entry.name === name)?.id
  if (!id) throw new Error(`Unknown catalog item: ${name}`)
  return id
}

/** Hair, tops, pants and shoes always start equipped and cannot be emptied. */
export const DEFAULT_SELECTION: BuildSelection = {
  hair: byName('Cyber Black Hair'),
  top: byName('Techwear Top'),
  pants: byName('Cyber Black Pants'),
  shoes: byName('Black Strips'),
  weapon: [],
  accessory: [],
}

export const BODY_ASSET_PATH = encodeURI('/assets/Body.glb')
