export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type CategoryId = 'hair' | 'hats' | 'top' | 'pants' | 'shoes' | 'weapon'

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
}
