import type { CatalogItem, CategoryDef, CategoryId, Rarity } from '../types'

export const CATEGORIES: CategoryDef[] = [
  { id: 'top', label: 'Top', side: 'left', anchor: 36, hint: 'Jackets, hoodies & tees' },
  { id: 'pants', label: 'Pants', side: 'left', anchor: 60, hint: 'Bottoms & layers' },
  { id: 'shoes', label: 'Shoes', side: 'left', anchor: 84, hint: 'Footwear' },
  { id: 'hair', label: 'Hair', side: 'right', anchor: 14, hint: 'Hairstyles' },
  { id: 'hats', label: 'Hats', side: 'right', anchor: 24, hint: 'Headwear' },
  { id: 'weapon', label: 'Weapon', side: 'right', anchor: 48, hint: 'Held accessories' },
]

export const RARITY_META: Record<Rarity, { label: string; color: string; glow: string }> = {
  common: { label: 'Common', color: '#9ca3af', glow: 'rgba(156,163,175,0.35)' },
  rare: { label: 'Rare', color: '#38bdf8', glow: 'rgba(56,189,248,0.4)' },
  epic: { label: 'Epic', color: '#c084fc', glow: 'rgba(192,132,252,0.45)' },
  legendary: { label: 'Legendary', color: '#fbbf24', glow: 'rgba(251,191,36,0.5)' },
}

let uid = 0
const item = (
  categoryId: CategoryId,
  name: string,
  price: number,
  rarity: Rarity,
  colorFrom: string,
  colorTo: string,
  popularity = 50,
): CatalogItem => ({
  id: `${categoryId}-${uid++}`,
  categoryId,
  name,
  price,
  rarity,
  colorFrom,
  colorTo,
  popularity,
})

export const CATALOG: CatalogItem[] = [
  // Hair
  item('hair', 'Cyber Spiky Hair', 4.99, 'common', '#3f3b47', '#0f0d14', 82),
  item('hair', 'Shadow Horns', 7.99, 'epic', '#7c3aed', '#2e1065', 96),
  item('hair', 'Purple Flame Aura', 8.99, 'epic', '#a855f7', '#ec4899', 91),
  item('hair', 'Silver Undercut', 5.49, 'rare', '#94a3b8', '#334155', 60),
  item('hair', 'Molten Braids', 6.99, 'rare', '#f97316', '#7c2d12', 54),
  item('hair', 'Void Mohawk', 9.99, 'legendary', '#22d3ee', '#0e7490', 71),

  // Hats
  item('hats', 'Tech Visor', 5.99, 'rare', '#38bdf8', '#0c4a6e', 88),
  item('hats', 'Ninja Mask', 3.99, 'common', '#1f2937', '#0b0f17', 66),
  item('hats', 'Cyber Headset', 6.99, 'rare', '#a855f7', '#4c1d95', 74),
  item('hats', 'Crown of Ash', 12.99, 'legendary', '#fbbf24', '#78350f', 95),
  item('hats', 'Riot Helm', 7.49, 'epic', '#f472b6', '#831843', 58),

  // Top
  item('top', 'Dark Hoodie', 4.99, 'common', '#27272a', '#09090b', 70),
  item('top', 'Techwear Jacket', 6.99, 'rare', '#4c1d95', '#1e1b4b', 84),
  item('top', 'Neon Trench Coat', 10.99, 'epic', '#ec4899', '#701a75', 77),
  item('top', 'Void Plate Armor', 15.99, 'legendary', '#7c3aed', '#1e1033', 93),
  item('top', 'Street Bomber', 5.49, 'common', '#334155', '#0f172a', 45),

  // Pants
  item('pants', 'Cyber Pants', 3.99, 'common', '#1e293b', '#0b1220', 62),
  item('pants', 'Chain Cargo', 6.49, 'rare', '#3730a3', '#1e1b4b', 71),
  item('pants', 'Shadow Leggings', 5.99, 'epic', '#581c87', '#1a0b2e', 80),
  item('pants', 'Molten Joggers', 4.49, 'common', '#7c2d12', '#1c0a03', 40),

  // Shoes
  item('shoes', 'Chunky Sneakers', 4.99, 'common', '#e2e8f0', '#334155', 68),
  item('shoes', 'Neon Runners', 6.99, 'rare', '#22d3ee', '#0e7490', 85),
  item('shoes', 'Void Boots', 8.99, 'epic', '#a855f7', '#2e1065', 79),
  item('shoes', 'Golden Treads', 13.99, 'legendary', '#fbbf24', '#713f12', 90),

  // Weapon
  item('weapon', 'Neon Katana', 9.99, 'epic', '#f472b6', '#831843', 97),
  item('weapon', 'Shock Baton', 5.99, 'rare', '#38bdf8', '#0c4a6e', 63),
  item('weapon', 'Twin Daggers', 7.49, 'rare', '#94a3b8', '#1f2937', 55),
  item('weapon', 'Reaper Scythe', 16.99, 'legendary', '#7c3aed', '#1e1033', 99),
]

export const DEFAULT_SELECTION: Partial<Record<CategoryId, string>> = {
  hair: CATALOG.find((c) => c.name === 'Shadow Horns')?.id,
  top: CATALOG.find((c) => c.name === 'Dark Hoodie')?.id,
  weapon: CATALOG.find((c) => c.name === 'Neon Katana')?.id,
}
