import { AnimatePresence, motion } from 'motion/react'
import { PreviewImage } from '../PreviewImage'
import { ShoppingCart, X, ArrowRight, PackageOpen } from 'lucide-react'
import { useBuild } from '../../state/BuildContext'
import { CATEGORY_ICONS } from '../icons/categoryIcons'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { MagneticButton } from '../MagneticButton'
import { isStackableCategory } from '../../types'

export function YourBuildPanel() {
  const { buildItems, buildPrice, removeItem } = useBuild()
  const priceDisplay = useAnimatedNumber(buildPrice)

  return (
    <div className="flex w-full min-w-0 flex-col rounded-xl border border-white/8 bg-panel/60 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-2">YOUR BUILD</h3>
        <span className="rounded-full bg-white/6 px-1.5 py-0.5 text-[10px] font-bold text-ink">
          {buildItems.length} {buildItems.length === 1 ? 'ITEM' : 'ITEMS'}
        </span>
      </div>

      <div className="thin-scrollbar min-w-0 overflow-x-auto overflow-y-hidden">
        {buildItems.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-2 text-center">
            <PackageOpen className="h-4 w-4 shrink-0 text-muted-2" />
            <p className="text-[11px] text-muted-2">No parts selected yet</p>
          </div>
        ) : (
          <div className="flex w-max gap-1.5 pb-0.5">
            <AnimatePresence mode="popLayout">
              {buildItems.map((item) => {
                const Icon = CATEGORY_ICONS[item.categoryId]
                const canRemove = isStackableCategory(item.categoryId)
                return (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    className="group relative flex w-17 shrink-0 flex-col overflow-hidden rounded-md border border-white/8"
                  >
                    <div
                      className="relative flex aspect-square items-center justify-center overflow-hidden"
                      style={
                        item.previewPath
                          ? undefined
                          : { background: `linear-gradient(150deg, ${item.colorFrom}, ${item.colorTo})` }
                      }
                    >
                      {item.previewPath ? (
                        <PreviewImage
                          src={item.previewPath}
                          priority
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon className="h-3.5 w-3.5 text-white/85" />
                      )}
                      {canRemove && (
                        <button
                          onClick={() => removeItem(item.categoryId, item.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover:opacity-100"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      )}
                    </div>
                    <div className="bg-panel-2/90 px-1 py-0.5">
                      <p className="truncate text-[8.5px] font-semibold leading-tight text-ink/90">{item.name}</p>
                      <p className="text-[8.5px] font-bold leading-tight text-primary-2">${item.price.toFixed(2)}</p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-2 border-t border-white/8 pt-2">
        <div className="mb-1.5 flex items-end justify-between">
          <span className="text-[10px] font-semibold tracking-wide text-muted-2">BUILD PRICE</span>
          <span className="font-display text-lg font-bold leading-none text-white">
            $<span className="tabular-nums">{priceDisplay}</span>
          </span>
        </div>
        <MagneticButton
          strength={8}
          className="group relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-primary-3 to-primary py-2 text-[12px] font-bold text-white shadow-[0_4px_20px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_4px_28px_rgba(168,85,247,0.55)]"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Order Physical Charm</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </MagneticButton>
        <p className="mt-1.5 text-center text-[10px] text-muted-2">Free shipping over $50 · Ships worldwide</p>
      </div>
    </div>
  )
}
