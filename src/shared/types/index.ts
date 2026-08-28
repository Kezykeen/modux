export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type CategoryId = 'hair' | 'top' | 'pants' | 'shoes' | 'weapon' | 'accessory'

export type ConnectorSide = 'left' | 'right'

export interface CategoryDef {
  id: CategoryId
  label: string
  side: ConnectorSide
  /** vertical anchor as a % of the stage height, used by the connector line */
  anchor: number
  /** short hint shown in the connector tooltip */
  hint: string
}

export interface CatalogItem {
  id: string
  categoryId: CategoryId
  name: string
  price: number
  rarity: Rarity
  colorFrom: string
  colorTo: string
  popularity: number
  /** Public URL for the native GLB used by the 3D preview. */
  assetPath: string
  /** Optional product render shown on cards; omitted when no matching file ships. */
  previewPath?: string
}

/**
 * Exclusive slots always hold one id. Accessories and weapons stack as an id
 * list and may be empty.
 */
export type BuildSelection = {
  hair: string
  top: string
  pants: string
  shoes: string
  weapon?: string[]
  accessory?: string[]
}

export const STACKABLE_CATEGORIES: CategoryId[] = ['accessory', 'weapon']

export function isStackableCategory(id: CategoryId): id is 'accessory' | 'weapon' {
  return id === 'accessory' || id === 'weapon'
}
