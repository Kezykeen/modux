import type { BuildSelection, CatalogItem, CategoryDef, CategoryId, Rarity } from '@/shared/types'

export type KitId = 'street' | 'ninja'

export interface KitDef {
  id: KitId
  name: string
  tagline: string
  description: string
  /** Soft wash behind the gallery card. */
  accentFrom: string
  accentTo: string
  chips: string[]
  categories: CategoryDef[]
  catalog: CatalogItem[]
  defaultSelection: BuildSelection
  bodyPaths: string[]
  /** One-sided posed meshes that should be duplicated across X. */
  mirrorXPaths?: string[]
}

export const RARITY_META: Record<Rarity, { label: string; color: string; glow: string }> = {
  common: { label: 'Common', color: '#9ca3af', glow: 'rgba(156,163,175,0.35)' },
  rare: { label: 'Rare', color: '#38bdf8', glow: 'rgba(56,189,248,0.4)' },
  epic: { label: 'Epic', color: '#c084fc', glow: 'rgba(192,132,252,0.45)' },
  legendary: { label: 'Legendary', color: '#fbbf24', glow: 'rgba(251,191,36,0.5)' },
}

const asset = (path: string) => encodeURI(path)
const render = (name: string) => encodeURI(`/assets/Renders/${name}.webp`)

const STREET_CATEGORIES: CategoryDef[] = [
  { id: 'hair', label: 'Hair', side: 'left', anchor: 32, hint: 'Head and hair' },
  { id: 'pants', label: 'Pants', side: 'left', anchor: 70, hint: 'Bottoms' },
  { id: 'accessory', label: 'Accessories', side: 'right', anchor: 32, hint: 'Bags and charms' },
  { id: 'shoes', label: 'Shoes', side: 'right', anchor: 70, hint: 'Footwear' },
]

const NINJA_CATEGORIES: CategoryDef[] = [
  { id: 'hair', label: 'Hair', side: 'left', anchor: 28, hint: 'Hairstyles' },
  { id: 'pants', label: 'Pants', side: 'left', anchor: 70, hint: 'Bottoms' },
  { id: 'accessory', label: 'Accessories', side: 'right', anchor: 28, hint: 'Mask, bag and companions' },
  { id: 'shoes', label: 'Shoes', side: 'right', anchor: 70, hint: 'Footwear' },
]

function createItems(kitId: KitId) {
  let uid = 0
  return (
    categoryId: CategoryId,
    name: string,
    price: number,
    rarity: Rarity,
    colorFrom: string,
    colorTo: string,
    assetPath: string,
    popularity = 50,
    hasRender = false,
  ): CatalogItem => ({
    // Street keeps the original unprefixed ids so saved collections still match.
    id: kitId === 'street' ? `${categoryId}-${uid++}` : `${kitId}-${categoryId}-${uid++}`,
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
}

function byName(catalog: CatalogItem[], name: string) {
  const id = catalog.find((entry) => entry.name === name)?.id
  if (!id) throw new Error(`Unknown catalog item: ${name}`)
  return id
}

const streetItem = createItems('street')
const STREET_CATALOG: CatalogItem[] = [
  streetItem('hair', 'Hair', 5.99, 'rare', '#1f1b24', '#0a0810', '/assets/Hair/Hair.glb', 88),
  streetItem('pants', 'Pants', 6.99, 'rare', '#111827', '#0f172a', '/assets/Pants/Pants.glb', 84),
  streetItem('shoes', 'Shoes', 5.99, 'common', '#e2e8f0', '#334155', '/assets/Shoes/Shoes.glb', 80),
  streetItem('accessory', 'Bag', 8.99, 'epic', '#4c1d95', '#1e1b4b', '/assets/Accessories/Bag.glb', 90),
  streetItem('accessory', 'Charm', 4.99, 'rare', '#38bdf8', '#0c4a6e', '/assets/Accessories/Charm.glb', 72),
]

const ninjaItem = createItems('ninja')
const NINJA_CATALOG: CatalogItem[] = [
  ninjaItem('hair', 'Ninja Hair', 6.49, 'rare', '#1c1917', '#0c0a09', '/assets/Ninja_Hero/Hair_low.glb', 86),
  ninjaItem('pants', 'Ninja Pants', 7.49, 'rare', '#1e1b4b', '#0f172a', '/assets/Ninja_Hero/Pants_low.glb', 84),
  ninjaItem('shoes', 'Ninja Shoes', 6.49, 'common', '#44403c', '#1c1917', '/assets/Ninja_Hero/Shoes_low.glb', 78),
  ninjaItem('accessory', 'Ninja Mask', 5.99, 'rare', '#111827', '#0b1220', '/assets/Ninja_Hero/Mask_low.glb', 91),
  ninjaItem('accessory', 'Sword Bag', 9.99, 'epic', '#4c1d95', '#1e1b4b', '/assets/Ninja_Hero/Swordbag_low.glb', 88),
  ninjaItem('accessory', 'Arm Guards', 7.99, 'epic', '#7c3aed', '#1e1b4b', '/assets/Ninja_Hero/Acce_02_low.glb', 82),
  ninjaItem('accessory', 'Cyber Kitten', 14.99, 'legendary', '#fbbf24', '#78350f', '/assets/Ninja_Hero/KittenCyber_low.glb', 96),
]

export const KITS: KitDef[] = [
  {
    id: 'street',
    name: 'Streetwear',
    tagline: 'Varsity chibi',
    description: 'Casual hero in a bomber jacket — bag, charm, and everyday gear.',
    accentFrom: 'rgba(245,158,11,0.38)',
    accentTo: 'rgba(236,72,153,0.16)',
    chips: ['Magnetic', 'Street', '1:6'],
    categories: STREET_CATEGORIES,
    catalog: STREET_CATALOG,
    defaultSelection: {
      hair: byName(STREET_CATALOG, 'Hair'),
      top: '',
      pants: byName(STREET_CATALOG, 'Pants'),
      shoes: byName(STREET_CATALOG, 'Shoes'),
      weapon: [],
      accessory: [],
    },
    bodyPaths: [asset('/assets/Body/Body.glb'), asset('/assets/Body/Hand.glb')],
  },
  {
    id: 'ninja',
    name: 'Ninja Hero',
    tagline: 'Covert operative',
    description: 'A second figure with its own body, head, and ninja gear — mask, blade bag, and cyber kitten.',
    accentFrom: 'rgba(99,102,241,0.42)',
    accentTo: 'rgba(168,85,247,0.18)',
    chips: ['Covert', 'Cyber', '1:6'],
    categories: NINJA_CATEGORIES,
    catalog: NINJA_CATALOG,
    defaultSelection: {
      hair: byName(NINJA_CATALOG, 'Ninja Hair'),
      top: '',
      pants: byName(NINJA_CATALOG, 'Ninja Pants'),
      shoes: byName(NINJA_CATALOG, 'Ninja Shoes'),
      weapon: [],
      accessory: [],
    },
    bodyPaths: [
      asset('/assets/Ninja_Hero/Body.glb'),
      asset('/assets/Ninja_Hero/Hand_low.glb'),
      asset('/assets/Ninja_Hero/Head_low.glb'),
    ],
    mirrorXPaths: [asset('/assets/Ninja_Hero/Hand_low.glb')],
  },
]

export const DEFAULT_KIT_ID: KitId = 'street'

const KIT_BY_ID = Object.fromEntries(KITS.map((kit) => [kit.id, kit])) as Record<KitId, KitDef>

export function isKitId(value: string): value is KitId {
  return value === 'street' || value === 'ninja'
}

export function getKit(id: KitId): KitDef {
  return KIT_BY_ID[id]
}

/** Union of every kit — collections / progress track parts across figures. */
export const CATALOG: CatalogItem[] = KITS.flatMap((kit) => kit.catalog)

/** Street kit aliases so preload and older imports keep a stable default. */
export const CATEGORIES = STREET_CATEGORIES
export const DEFAULT_SELECTION = KITS[0]!.defaultSelection
export const BODY_ASSET_PATHS = KITS[0]!.bodyPaths
export const BODY_ASSET_PATH = BODY_ASSET_PATHS[0]
