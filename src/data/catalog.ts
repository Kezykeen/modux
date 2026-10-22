import type { BuildSelection, CatalogItem, CategoryDef, CategoryId, Rarity } from '@/shared/types'

export const CATEGORIES: CategoryDef[] = [
  { id: 'head', label: 'Head', side: 'left', anchor: 22, hint: 'Face and skull' },
  { id: 'hair', label: 'Hair', side: 'left', anchor: 40, hint: 'Hairstyles' },
  { id: 'pants', label: 'Pants', side: 'left', anchor: 72, hint: 'Bottoms' },
  { id: 'body', label: 'Body', side: 'right', anchor: 22, hint: 'Torso' },
  { id: 'accessory', label: 'Accessories', side: 'right', anchor: 46, hint: 'Bags, mask and charms' },
  { id: 'shoes', label: 'Shoes', side: 'right', anchor: 72, hint: 'Footwear' },
]

export const RARITY_META: Record<Rarity, { label: string; color: string; glow: string }> = {
  common: { label: 'Common', color: '#9ca3af', glow: 'rgba(156,163,175,0.35)' },
  rare: { label: 'Rare', color: '#38bdf8', glow: 'rgba(56,189,248,0.4)' },
  epic: { label: 'Epic', color: '#c084fc', glow: 'rgba(192,132,252,0.45)' },
  legendary: { label: 'Legendary', color: '#fbbf24', glow: 'rgba(251,191,36,0.5)' },
}

const asset = (path: string) => encodeURI(path)

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
  extras?: { extraPaths?: string[]; mirrorXPaths?: string[] },
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
  extraPaths: extras?.extraPaths?.map(asset),
  mirrorXPaths: extras?.mirrorXPaths?.map(asset),
  previewPath: undefined,
})

export const CATALOG: CatalogItem[] = [
  item('hair', 'Hair', 5.99, 'rare', '#1f1b24', '#0a0810', '/assets/Hair/Hair_Bacon.glb', 88),
  item('pants', 'Pants', 6.99, 'rare', '#111827', '#0f172a', '/assets/Pants/Pants.glb', 84),
  item('shoes', 'Shoes', 5.99, 'common', '#e2e8f0', '#334155', '/assets/Shoes/Shoes.glb', 80),
  item('accessory', 'Bag', 8.99, 'epic', '#4c1d95', '#1e1b4b', '/assets/Accessories/Bag.glb', 90),
  item('accessory', 'Charm', 4.99, 'rare', '#38bdf8', '#0c4a6e', '/assets/Accessories/Charm.glb', 72),
  item('body', 'Street Body', 12.99, 'rare', '#1f2937', '#111827', '/assets/Body/Body.glb', 92, {
    extraPaths: ['/assets/Body/Hand.glb'],
  }),
  item('head', 'Street Head', 7.99, 'rare', '#e8c4a8', '#7c4a2d', '/assets/Hair/Head_Bacon.glb', 90),
  item('body', 'Ninja Body', 12.99, 'epic', '#1e1b4b', '#0f172a', '/assets/Ninja_Hero/Body.glb', 86, {
    extraPaths: ['/assets/Ninja_Hero/Hand_low.glb'],
    mirrorXPaths: ['/assets/Ninja_Hero/Hand_low.glb'],
  }),
  item('head', 'Ninja Head', 7.99, 'epic', '#e8c4a8', '#1c1917', '/assets/Ninja_Hero/Head_low.glb', 88),
  item('hair', 'Ninja Hair', 6.49, 'rare', '#1c1917', '#0c0a09', '/assets/Ninja_Hero/Hair_low.glb', 86),
  item('pants', 'Ninja Pants', 7.49, 'rare', '#1e1b4b', '#0f172a', '/assets/Ninja_Hero/Pants_low.glb', 84),
  item('shoes', 'Ninja Shoes', 6.49, 'common', '#44403c', '#1c1917', '/assets/Ninja_Hero/Shoes_low.glb', 78),
  item('accessory', 'Ninja Mask', 5.99, 'rare', '#111827', '#0b1220', '/assets/Ninja_Hero/Mask_low.glb', 91),
  item('accessory', 'Sword Bag', 9.99, 'epic', '#4c1d95', '#1e1b4b', '/assets/Ninja_Hero/Swordbag_low.glb', 88),
  item('accessory', 'Arm Guards', 7.99, 'epic', '#7c3aed', '#1e1b4b', '/assets/Ninja_Hero/Acce_02_low.glb', 82),
  item('accessory', 'Cyber Kitten', 14.99, 'legendary', '#fbbf24', '#78350f', '/assets/Ninja_Hero/KittenCyber_low.glb', 96),
]

const byName = (name: string) => {
  const id = CATALOG.find((entry) => entry.name === name)?.id
  if (!id) throw new Error(`Unknown catalog item: ${name}`)
  return id
}

/** Hair, pants, shoes, head and body always start equipped and cannot be emptied. */
export const DEFAULT_SELECTION: BuildSelection = {
  body: byName('Street Body'),
  head: byName('Street Head'),
  hair: byName('Hair'),
  top: '',
  pants: byName('Pants'),
  shoes: byName('Shoes'),
  weapon: [],
  accessory: [],
}

const defaultBody = CATALOG.find((entry) => entry.id === DEFAULT_SELECTION.body)

/** Body mesh plus companion hands for the default figure. */
export const BODY_ASSET_PATHS = [
  asset('/assets/Body/Body.glb'),
  ...(defaultBody?.extraPaths ?? [asset('/assets/Body/Hand.glb')]),
]

export const BODY_ASSET_PATH = BODY_ASSET_PATHS[0]
