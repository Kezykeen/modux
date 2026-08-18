import { Scissors, Shirt, Footprints, Sparkles, Swords } from 'lucide-react'
import { PantsIcon } from './PantsIcon'
import type { CategoryId } from '../../types'
import type { ComponentType, SVGProps } from 'react'

export const CATEGORY_ICONS: Record<CategoryId, ComponentType<SVGProps<SVGSVGElement>>> = {
  hair: Scissors,
  top: Shirt,
  pants: PantsIcon,
  shoes: Footprints,
  weapon: Swords,
  accessory: Sparkles,
}
