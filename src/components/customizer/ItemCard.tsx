import { motion } from 'motion/react'
import { PreviewImage } from '../PreviewImage'
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
  const { isSelected, selectItem } = useBuild()
  const selected = isSelected(item.id)
  const Icon = CATEGORY_ICONS[item.categoryId]
  const rarity = RARITY_META[item.rarity]
  const isHot = item.popularity >= 90

  if (layout === 'list') {
    return (
      <motion.button
        layout
        onClick={() => selectItem(item.categoryId, item.id)}
        whileTap={{ scale: 0.98 }}
        className={`group flex w-full items-center gap-2.5 rounded-lg border p-1.5 text-left transition-colors ${
          selected ? 'border-primary-2/60 bg-primary/10' : 'border-white/8 bg-white/[0.02] hover:border-white/20'
        }`}
      >
        <div
          className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md"
          style={
            item.previewPath
              ? undefined
              : { background: `linear-gradient(135deg, ${item.colorFrom}, ${item.colorTo})` }
          }
        >
          {item.previewPath ? (
            <PreviewImage
              src={item.previewPath}
              priority={selected}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon className="h-3.5 w-3.5 text-white/85" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-ink">{item.name}</p>
          <p className="text-[10.5px] font-medium" style={{ color: rarity.color }}>
            {rarity.label}
          </p>
        </div>
        <span className="shrink-0 text-[12px] font-bold text-white">${item.price.toFixed(2)}</span>
        {selected && (
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
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-lg border text-left transition-colors duration-200 ${
        selected
          ? 'border-primary-2/70 shadow-[0_0_0_1px_rgba(192,132,252,0.35),0_6px_16px_rgba(168,85,247,0.22)]'
          : 'border-white/8 hover:border-white/20'
      }`}
    >
      <div
        className="relative flex aspect-5/4 w-full shrink-0 items-center justify-center overflow-hidden bg-black/40"
        style={
          item.previewPath
            ? undefined
            : { background: `linear-gradient(150deg, ${item.colorFrom}, ${item.colorTo})` }
        }
      >
        {item.previewPath ? (
          <PreviewImage
            src={item.previewPath}
            priority={selected}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Icon className="h-5 w-5 text-white/80 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" strokeWidth={1.4} />
        )}
        <div className="absolute inset-0 bg-black/10 transition-opacity duration-200 group-hover:bg-black/0" />

        <span
          className="absolute top-1 left-1 rounded-full px-1 py-px text-[7.5px] font-bold tracking-wide text-white/95 backdrop-blur-sm"
          style={{ background: `${rarity.color}33`, border: `1px solid ${rarity.color}66` }}
        >
          {rarity.label}
        </span>

        {isHot && (
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <Flame className="h-2 w-2 text-orange-400" />
          </span>
        )}

        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center bg-primary-3/30 backdrop-blur-[1px]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_12px_rgba(168,85,247,0.8)]">
              <Check className="h-3 w-3" />
            </span>
          </motion.span>
        )}
      </div>

      <div className="flex flex-col gap-px bg-panel-2/80 px-1.5 py-1">
        <p className="truncate text-[10.5px] font-semibold leading-tight text-ink">{item.name}</p>
        <p className="text-[10.5px] font-bold leading-tight text-primary-2">${item.price.toFixed(2)}</p>
      </div>
    </motion.button>
  )
}
