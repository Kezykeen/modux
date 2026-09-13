import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ChevronUp, ShoppingCart, X, PackageOpen, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { useBuild } from '../context/BuildContext'
import { useCart } from '@/features/cart'
import { useSnapshot } from '../context/SnapshotContext'
import { useAnimatedNumber } from '@/shared/hooks'
import { MagneticButton, ModuxLoader, PreviewImage } from '@/shared/components'
import { CATEGORY_ICONS } from '@/shared/icons'
import { isStackableCategory } from '@/shared/types'
import { playClickSfx } from '@/audio'

const FALLBACK_SNAPSHOT = encodeURI('/assets/Renders/Ninja figurine.webp')

export function MobileBuildDock() {
  const navigate = useNavigate()
  const { buildItems, buildPrice, removeItem } = useBuild()
  const { addBuild } = useCart()
  const { capture } = useSnapshot()
  const priceDisplay = useAnimatedNumber(buildPrice)
  const [expanded, setExpanded] = useState(false)
  const [ordering, setOrdering] = useState(false)

  const handleOrder = () => {
    if (buildItems.length === 0 || ordering) return
    setOrdering(true)
    playClickSfx()

    const snap = capture() || FALLBACK_SNAPSHOT
    void addBuild({ items: buildItems, snapshot: snap }).finally(() => setOrdering(false))
    navigate('/cart')
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 min-[1401px]:hidden">
      <div className="pointer-events-auto mx-auto w-full max-w-lg px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <motion.div
          layout
          className="overflow-hidden rounded-2xl border border-white/10 bg-abyss/90 shadow-[0_-12px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(168,85,247,0.12)] backdrop-blur-xl"
        >
          <AnimatePresence initial={false}>
            {expanded && buildItems.length > 0 ? (
              <motion.div
                key="expanded"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                className="overflow-hidden border-b border-white/8"
              >
                <div className="px-3 pt-3 pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.18em] text-muted-2">
                      YOUR BUILD
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpanded(false)}
                      aria-label="Collapse build dock"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted"
                    >
                      <ChevronUp className="h-3.5 w-3.5 rotate-180" />
                    </button>
                  </div>
                  <div className="thin-scrollbar flex gap-2 overflow-x-auto pb-1">
                    {buildItems.map((item) => {
                      const Icon = CATEGORY_ICONS[item.categoryId]
                      const canRemove = isStackableCategory(item.categoryId)
                      return (
                        <div
                          key={item.id}
                          className="group relative flex w-16 shrink-0 flex-col overflow-hidden rounded-lg border border-white/8"
                        >
                          <div
                            className="relative flex aspect-square items-center justify-center overflow-hidden"
                            style={
                              item.previewPath
                                ? undefined
                                : {
                                    background: `linear-gradient(150deg, ${item.colorFrom}, ${item.colorTo})`,
                                  }
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
                            {canRemove ? (
                              <button
                                type="button"
                                onClick={() => removeItem(item.categoryId, item.id)}
                                className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white active:scale-95"
                                aria-label={`Remove ${item.name}`}
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            ) : null}
                          </div>
                          <div className="bg-panel-2/90 px-1 py-0.5">
                            <p className="truncate text-[8px] font-semibold text-ink/90">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex items-center gap-2 p-2.5">
            <button
              type="button"
              onClick={() => buildItems.length > 0 && setExpanded((v) => !v)}
              className={clsx(
                'flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left transition-colors',
                buildItems.length > 0 ? 'active:bg-white/[0.06]' : 'opacity-80',
              )}
            >
              {buildItems.length === 0 ? (
                <>
                  <PackageOpen className="h-4 w-4 shrink-0 text-muted-2" />
                  <span className="truncate text-[12px] font-medium text-muted-2">
                    Pick parts to build
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-[11px] font-bold text-primary-2 tabular-nums">
                    {buildItems.length}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold text-ink">
                      {buildItems.length} {buildItems.length === 1 ? 'part' : 'parts'} selected
                    </span>
                    <span className="block text-[10px] text-muted-2">Tap to review</span>
                  </span>
                  <ChevronUp
                    className={clsx(
                      'h-4 w-4 shrink-0 text-muted transition-transform',
                      expanded && 'rotate-180',
                    )}
                  />
                </>
              )}
            </button>

            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <span className="text-[9px] font-semibold tracking-wide text-muted-2 uppercase">
                Total
              </span>
              <span className="font-display text-lg font-bold leading-none text-white tabular-nums">
                ${priceDisplay}
              </span>
            </div>

            <MagneticButton
              strength={6}
              onClick={handleOrder}
              disabled={buildItems.length === 0 || ordering}
              className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-3 to-primary px-4 text-[12px] font-bold text-white shadow-[0_4px_24px_rgba(168,85,247,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {ordering ? (
                <>
                  <ModuxLoader size="sm" label="Adding to bag" />
                  …
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
