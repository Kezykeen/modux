import { motion } from 'motion/react'
import { Check, Flame } from 'lucide-react'
import type { CatalogItem } from '../../types'
import { RARITY_META } from '../../data/catalog'
import { CATEGORY_ICONS } from '../icons/categoryIcons'
import { useBuild } from '../../state/BuildContext'

interface ItemCardProps {
  item: CatalogItem
  layout: 'grid' | 'list'
}

export function ItemCard({ item, layout }: ItemCardProps) {
  const { selection, selectItem } = useBuild()
  const isSelected = selection[item.categoryId] === item.id
  const Icon = CATEGORY_ICONS[item.categoryId]
  const rarity = RARITY_META[item.rarity]
  const isHot = item.popularity >= 90

  if (layout === 'list') {
    return (
      <motion.button
        layout
        onClick={() => selectItem(item.categoryId, item.id)}
        whileTap={{ scale: 0.98 }}
        className={`group flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-colors ${
          isSelected ? 'border-primary-2/60 bg-primary/10' : 'border-white/8 bg-white/[0.02] hover:border-white/20'
        }`}
      >
        <div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `linear-gradient(135deg, ${item.colorFrom}, ${item.colorTo})` }}
        >
          <Icon className="h-4 w-4 text-white/85" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold text-ink">{item.name}</p>
          <p className="text-[11px] font-medium" style={{ color: rarity.color }}>
            {rarity.label}
          </p>
        </div>
        <span className="shrink-0 text-[12.5px] font-bold text-white">${item.price.toFixed(2)}</span>
        {isSelected && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Check className="h-3 w-3" />
          </span>
        )}
      </motion.button>
    )
  }

  return (
    <motion.button
      layout
      onClick={() => selectItem(item.categoryId, item.id)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-colors duration-200 ${
        isSelected
          ? 'border-primary-2/70 shadow-[0_0_0_1px_rgba(192,132,252,0.4),0_8px_24px_rgba(168,85,247,0.25)]'
          : 'border-white/8 hover:border-white/20'
      }`}
    >
      <div
        className="relative flex aspect-square items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${item.colorFrom}, ${item.colorTo})` }}
      >
        <div className="absolute inset-0 bg-black/10 transition-opacity duration-200 group-hover:bg-black/0" />
        <Icon className="h-7 w-7 text-white/80 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" strokeWidth={1.4} />

        <span
          className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold tracking-wide text-white/95 backdrop-blur-sm"
          style={{ background: `${rarity.color}33`, border: `1px solid ${rarity.color}66` }}
        >
          {rarity.label}
        </span>

        {isHot && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <Flame className="h-2.5 w-2.5 text-orange-400" />
          </span>
        )}

        {isSelected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center bg-primary-3/30 backdrop-blur-[1px]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_16px_rgba(168,85,247,0.8)]">
              <Check className="h-4 w-4" />
            </span>
          </motion.span>
        )}
      </div>

      <div className="flex flex-col gap-0.5 bg-panel-2/80 px-2 py-1.5">
        <p className="truncate text-[11.5px] font-semibold text-ink">{item.name}</p>
        <p className="text-[11.5px] font-bold text-primary-2">${item.price.toFixed(2)}</p>
      </div>
    </motion.button>
  )
}
