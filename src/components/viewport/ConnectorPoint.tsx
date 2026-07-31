import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { CATALOG, RARITY_META } from '../../data/catalog'
import { useBuild } from '../../state/BuildContext'
import { CATEGORY_ICONS } from '../icons/categoryIcons'
import type { CategoryDef } from '../../types'

interface ConnectorPointProps {
  category: CategoryDef
  index: number
}

export function ConnectorPoint({ category, index }: ConnectorPointProps) {
  const { selection, hoveredCategory, activeCategory, setHoveredCategory, setActiveCategory } = useBuild()
  const Icon = CATEGORY_ICONS[category.id]
  const selectedId = selection[category.id]
  const item = selectedId ? CATALOG.find((c) => c.id === selectedId) : undefined
  const isHovered = hoveredCategory === category.id
  const isActiveTab = activeCategory === category.id
  const isLeft = category.side === 'left'

  return (
    <motion.button
      initial={{ opacity: 0, x: isLeft ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHoveredCategory(category.id)}
      onMouseLeave={() => setHoveredCategory(null)}
      onClick={() => setActiveCategory(category.id)}
      className="pointer-events-auto absolute z-10 flex items-center gap-2"
      style={{
        top: `${category.anchor}%`,
        [isLeft ? 'left' : 'right']: '0.75rem',
        transform: 'translateY(-50%)',
        flexDirection: isLeft ? 'row' : 'row-reverse',
      }}
    >
      <span
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 ${
          isHovered || isActiveTab
            ? 'border-primary-2/70 bg-primary/25 text-white shadow-[0_0_18px_rgba(168,85,247,0.6)]'
            : 'border-white/12 bg-black/40 text-muted-2 group-hover:text-ink'
        }`}
      >
        <Icon className="h-4 w-4" />
        {item ? (
          <span
            className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-abyss animate-pulse-glow"
            style={{ background: RARITY_META[item.rarity].color }}
          />
        ) : (
          <span className="absolute -right-0.5 -bottom-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-white/15 ring-2 ring-abyss">
            <Plus className="h-1.5 w-1.5 text-white/70" />
          </span>
        )}
      </span>

      <span
        className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap backdrop-blur-md transition-all duration-200 ${
          isHovered || isActiveTab
            ? 'border-primary-2/50 bg-black/50 text-white'
            : 'border-white/8 bg-black/30 text-muted-2'
        }`}
      >
        {category.label.toUpperCase()}
      </span>
    </motion.button>
  )
}
