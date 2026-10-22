import type { BuildSelection, CatalogItem, CategoryDef, CategoryId, Rarity } from '@/shared/types'

export const CATEGORIES: CategoryDef[] = [
  { id: 'head', label: 'Head', side: 'left', anchor: 22, hint: 'Face and skull' },
  { id: 'hair', label: 'Hair', side: 'left', anchor: 47, hint: 'Hairstyles' },
  { id: 'pants', label: 'Pants', side: 'left', anchor: 72, hint: 'Bottoms' },
  { id: 'body', label: 'Body', side: 'right', anchor: 22, hint: 'Torso' },
  { id: 'accessory', label: 'Accessories', side: 'right', anchor: 47, hint: 'Bags, mask and charms' },
  { id: 'shoes', label: 'Shoes', side: 'right', anchor: 72, hint: 'Footwear' },
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
  extras?: { extraPaths?: string[]; mirrorXPaths?: string[]; preview?: string },
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
  previewPath: extras?.preview ? render(extras.preview) : undefined,
})

export const CATALOG: CatalogItem[] = [
  item('hair', 'Hair', 5.99, 'rare', '#1f1b24', '#0a0810', '/assets/Bacon_Hero/Hair_low.glb', 88, {
    preview: 'Bacon_Hero_Hair',
  }),
  item('pants', 'Pants', 6.99, 'rare', '#111827', '#0f172a', '/assets/Bacon_Hero/Pants.glb', 84, {
    preview: 'Bacon_Hero_Pants',
  }),
  item('shoes', 'Shoes', 5.99, 'common', '#e2e8f0', '#334155', '/assets/Bacon_Hero/Shoes.glb', 80, {
    preview: 'Bacon_Hero_Shoes',
  }),
  item('accessory', 'Bag', 8.99, 'epic', '#4c1d95', '#1e1b4b', '/assets/Bacon_Hero/Bag_low.glb', 90, {
    preview: 'Bacon_Hero_Bag',
  }),
  item('body', 'Bacon Body', 12.99, 'rare', '#1f2937', '#111827', '/assets/Bacon_Hero/Body_low.glb', 92, {
    extraPaths: ['/assets/Bacon_Hero/Hand_low.001.glb'],
    preview: 'Bacon_Hero_Body',
  }),
  item('head', 'Bacon Head', 7.99, 'rare', '#e8c4a8', '#7c4a2d', '/assets/Bacon_Hero/Head_low.001.glb', 90, {
    preview: 'Bacon_Hero_Head',
  }),
  item('body', 'Ninja Body', 12.99, 'epic', '#1e1b4b', '#0f172a', '/assets/Shadow_Ninja/Body_low.001.glb', 86, {
    extraPaths: ['/assets/Shadow_Ninja/Hand_low.glb'],
    preview: 'Shadow_Ninja_Body',
  }),
  item('head', 'Ninja Head', 7.99, 'epic', '#e8c4a8', '#1c1917', '/assets/Shadow_Ninja/Head_low.glb', 88, {
    preview: 'Shadow_Ninja_Head',
  }),
  item('hair', 'Ninja Hair', 6.49, 'rare', '#1c1917', '#0c0a09', '/assets/Shadow_Ninja/Hair_low.001.glb', 86, {
    preview: 'Shadow_Ninja_Hair',
  }),
  item('pants', 'Ninja Pants', 7.49, 'rare', '#1e1b4b', '#0f172a', '/assets/Shadow_Ninja/Pants_low.glb', 84, {
    preview: 'Shadow_Ninja_Pants',
  }),
  item('shoes', 'Ninja Shoes', 6.49, 'common', '#44403c', '#1c1917', '/assets/Shadow_Ninja/Shoes_low.glb', 78, {
    preview: 'Shadow_Ninja_Shoes',
  }),
  item('accessory', 'Ninja Mask', 5.99, 'rare', '#111827', '#0b1220', '/assets/Shadow_Ninja/Mask_low.glb', 91, {
    preview: 'Mask',
  }),
  item('accessory', 'Sword Bag', 9.99, 'epic', '#4c1d95', '#1e1b4b', '/assets/Shadow_Ninja/Swordbag_low.glb', 88, {
    preview: 'SwordBag',
  }),
  item('accessory', 'Katana', 11.99, 'legendary', '#e2e8f0', '#334155', '/assets/Shadow_Ninja/Sword_low.glb', 94, {
    preview: 'Sword',
  }),
  item('accessory', 'Head Crest', 6.49, 'rare', '#7c3aed', '#1e1b4b', '/assets/Shadow_Ninja/Acce_01_low.glb', 80, {
    preview: 'Acce_01',
  }),
  item('accessory', 'Arm Guards', 7.99, 'epic', '#7c3aed', '#1e1b4b', '/assets/Shadow_Ninja/Acce_02_low.glb', 82, {
    preview: 'Arm_guards',
  }),
  item('accessory', 'Cyber Kitten', 14.99, 'legendary', '#fbbf24', '#78350f', '/assets/Shadow_Ninja/KittenCyber_low.glb', 96, {
    preview: 'Kitty_Cyborg',
  }),
]

const byName = (name: string) => {
  const id = CATALOG.find((entry) => entry.name === name)?.id
  if (!id) throw new Error(`Unknown catalog item: ${name}`)
  return id
}

/** Hair, pants, shoes, head and body always start equipped and cannot be emptied. */
export const DEFAULT_SELECTION: BuildSelection = {
  body: byName('Bacon Body'),
  head: byName('Bacon Head'),
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
  defaultBody?.assetPath ?? asset('/assets/Bacon_Hero/Body_low.glb'),
  ...(defaultBody?.extraPaths ?? [asset('/assets/Bacon_Hero/Hand_low.001.glb')]),
]

export const BODY_ASSET_PATH = BODY_ASSET_PATHS[0]
