import { AnimatePresence, motion } from 'motion/react'
import { ShoppingCart, X, ArrowRight, PackageOpen } from 'lucide-react'
import { useBuild } from '../../state/BuildContext'
import { CATEGORY_ICONS } from '../icons/categoryIcons'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { MagneticButton } from '../MagneticButton'

export function YourBuildPanel() {
  const { buildItems, buildPrice, removeItem } = useBuild()
  const priceDisplay = useAnimatedNumber(buildPrice)

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col rounded-2xl border border-white/8 bg-panel/60 p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-muted-2">YOUR BUILD</h3>
        <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10.5px] font-bold text-ink">
          {buildItems.length} {buildItems.length === 1 ? 'ITEM' : 'ITEMS'}
        </span>
      </div>

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
        {buildItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 py-4 text-center">
            <PackageOpen className="h-6 w-6 text-muted-2" />
            <p className="text-[11.5px] text-muted-2">No parts selected yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <AnimatePresence mode="popLayout">
              {buildItems.map((item) => {
                const Icon = CATEGORY_ICONS[item.categoryId]
                return (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-white/8"
                  >
                    <div
                      className="relative flex aspect-square items-center justify-center"
                      style={{ background: `linear-gradient(150deg, ${item.colorFrom}, ${item.colorTo})` }}
                    >
                      <Icon className="h-4 w-4 text-white/85" />
                      <button
                        onClick={() => removeItem(item.categoryId)}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover:opacity-100"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                    <div className="bg-panel-2/90 px-1 py-1">
                      <p className="truncate text-[9.5px] font-semibold text-ink/90">{item.name}</p>
                      <p className="text-[9.5px] font-bold text-primary-2">${item.price.toFixed(2)}</p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-3 border-t border-white/8 pt-3">
        <div className="mb-2.5 flex items-end justify-between">
          <span className="text-[11px] font-semibold tracking-wide text-muted-2">BUILD PRICE</span>
          <span className="font-display text-2xl font-bold text-white">
            $<span className="tabular-nums">{priceDisplay}</span>
          </span>
        </div>
        <MagneticButton
          strength={8}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary-3 to-primary py-2.5 text-[13px] font-bold text-white shadow-[0_4px_24px_rgba(168,85,247,0.4)] transition-shadow hover:shadow-[0_4px_32px_rgba(168,85,247,0.6)]"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <ShoppingCart className="h-4 w-4" />
          <span>Order Physical Charm</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </MagneticButton>
        <p className="mt-2 text-center text-[10.5px] text-muted-2">Free shipping over $50 · Ships worldwide</p>
      </div>
    </div>
  )
}
