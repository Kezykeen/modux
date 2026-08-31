import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Magnet,
} from 'lucide-react'
import { CommerceLayout, rarityTone } from '@/widgets'
import { useCart } from '../context/CartContext'
import { PromoCodeField } from '../components/PromoCodeField'
import { MagneticButton, ModuxLoader, CartPageSkeleton, Spinner } from '@/shared/components'
import { playClickSfx } from '@/audio'
import clsx from 'clsx'

const POPULAR = [
  {
    name: 'Shadow Ninja',
    items: 8,
    img: '/assets/Renders/Cyber Character.webp',
  },
  {
    name: 'Neon Warrior',
    items: 6,
    img: '/assets/Renders/Cyber Moon Character.webp',
  },
  {
    name: 'Cyber Ronin',
    items: 9,
    img: '/assets/Renders/Cyber Character.webp',
  },
]

export function CartPage() {
  const navigate = useNavigate()
  const {
    items,
    itemCount,
    isLoading,
    pendingItemIds,
    syncingItemIds,
    subtotal,
    promoApplied,
    discount,
    shippingCost,
    tax,
    total,
    removeItem,
    setQuantity,
    shippingMethod,
  } = useCart()

  if (isLoading) {
    return (
      <CommerceLayout>
        <CartPageSkeleton />
      </CommerceLayout>
    )
  }

  if (items.length === 0) {
    return (
      <CommerceLayout>
        <motion.div
          className="mx-auto flex max-w-xl flex-col items-center gap-10 py-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex w-full flex-col items-center gap-8 rounded-3xl border border-white/8 bg-panel p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-3xl border border-white/8 bg-panel-2">
              <div className="absolute inset-6 animate-pulse-glow rounded-full bg-primary-3/20 blur-xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-panel-3">
                <ShoppingBag className="h-10 w-10 text-primary-2" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-white">Your bag is empty</h1>
              <p className="mt-2 text-sm text-muted">Build a character and it&apos;ll show up here.</p>
            </div>
            <MagneticButton
              onClick={() => navigate('/customize')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-3 px-7 py-3.5 text-sm font-extrabold tracking-wide text-white uppercase shadow-[0_0_28px_rgba(124,58,237,0.45)] hover:bg-primary"
            >
              Start Building
              <ArrowRight className="h-3.5 w-3.5" />
            </MagneticButton>
          </div>

          <div className="w-full text-center">
            <p className="text-[11px] font-bold tracking-widest text-primary-2 uppercase">
              Popular Builds
            </p>
            <p className="mt-1 text-sm text-muted">
              Or get started with one of our ready-to-cast favorites
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-4">
              {POPULAR.map((p, i) => (
                <motion.button
                  key={p.name}
                  type="button"
                  onClick={() => navigate('/customize')}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="w-40 rounded-2xl border border-white/8 bg-panel-2 p-3 text-left transition-all hover:-translate-y-1 hover:border-primary-3/40"
                >
                  <div className="mb-3 h-28 overflow-hidden rounded-[10px] bg-abyss">
                    <img src={p.img} alt={p.name} className="h-full w-full object-contain" />
                  </div>
                  <p className="truncate text-xs font-bold text-white">{p.name}</p>
                  <p className="text-[10px] text-muted">{p.items} items</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </CommerceLayout>
    )
  }

  return (
    <CommerceLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Your Bag</h1>
        <p className="mt-1 text-sm text-muted">Review your builds before casting</p>
      </motion.div>

      <div className="mt-8 grid gap-8 pb-24 lg:grid-cols-[1fr_360px] lg:pb-0">
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const isPending = pendingItemIds.has(item.id)
              const isSyncing = syncingItemIds.has(item.id)
              const isBusy = isPending || isSyncing

              return (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 380, damping: 28 }}
                  className={clsx(
                    'relative flex flex-col gap-4 rounded-2xl border border-white/8 bg-panel p-4 sm:flex-row sm:items-start',
                    isBusy && 'border-primary-3/25',
                  )}
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-abyss">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.35),transparent_65%)]" />
                    <img
                      src={item.snapshot}
                      alt={item.name}
                      className={clsx(
                        'relative z-10 h-full w-full object-cover transition-opacity',
                        isPending && 'opacity-70',
                      )}
                    />
                    {isPending && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-abyss/75 backdrop-blur-[2px]">
                        <ModuxLoader size="sm" label="Uploading snapshot" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-white">{item.name}</h2>
                        <p className={`mt-0.5 text-xs font-semibold uppercase ${rarityTone[item.rarity]}`}>
                          {item.rarity} Build · {item.partCount} parts selected
                        </p>
                      </div>
                      <p className="font-display text-lg font-bold text-white tabular-nums">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.partNames.slice(0, 5).map((name) => (
                        <span
                          key={name}
                          className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted"
                        >
                          {name}
                        </span>
                      ))}
                      {item.partNames.length > 5 && (
                        <span className="rounded-md border border-white/8 px-2 py-0.5 text-[10px] text-muted-2">
                          +{item.partNames.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div
                        className={clsx(
                          'inline-flex items-center gap-1 rounded-lg border border-white/8 bg-panel-2 p-1',
                          isBusy && 'opacity-60',
                        )}
                      >
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={isBusy}
                          onClick={() => {
                            playClickSfx()
                            setQuantity(item.id, item.quantity - 1)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-white/6 hover:text-ink disabled:cursor-not-allowed"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="flex w-7 items-center justify-center text-sm font-semibold tabular-nums text-ink">
                          {isSyncing ? <Spinner size="xs" /> : item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={isBusy}
                          onClick={() => {
                            playClickSfx()
                            setQuantity(item.id, item.quantity + 1)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-white/6 hover:text-ink disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          playClickSfx()
                          removeItem(item.id)
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSyncing ? (
                          <>
                            <Spinner size="xs" /> Removing…
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="h-fit rounded-2xl border border-white/8 bg-panel p-6 lg:sticky lg:top-[calc(3.5rem+env(safe-area-inset-top,0px)+1rem)]"
        >
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold tracking-wide text-white uppercase">Order Summary</h2>
            <span className="rounded-full bg-primary-3/20 px-2.5 py-1 text-[10px] font-bold tracking-wide text-primary-2 uppercase">
              {itemCount} {itemCount === 1 ? 'Build' : 'Builds'} Selected
            </span>
          </div>

          <PromoCodeField className="mb-5" />

          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular-nums text-ink">${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>{shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping'}</dt>
              <dd className="tabular-nums text-ink">
                {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
              </dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Estimated Tax</dt>
              <dd className="tabular-nums text-ink">${tax.toFixed(2)}</dd>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-emerald-400">
                <dt>Promo Code Discount (10%)</dt>
                <dd className="tabular-nums">-${discount.toFixed(2)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-5 flex items-end justify-between border-t border-white/8 pt-4">
            <div>
              <p className="text-xs text-muted">Grand Total</p>
              <p className="font-display text-3xl font-extrabold text-white tabular-nums">
                ${total.toFixed(2)}
              </p>
            </div>
            {promoApplied && (
              <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-bold tracking-wide text-emerald-400 uppercase">
                Save ${discount.toFixed(2)}
              </span>
            )}
          </div>

          <MagneticButton
            onClick={() => {
              playClickSfx()
              navigate('/checkout')
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-3 py-3.5 text-sm font-bold tracking-wide text-white uppercase shadow-[0_0_28px_rgba(124,58,237,0.45)] hover:bg-primary"
          >
            <ShoppingBag className="h-4 w-4" />
            Proceed to Checkout
            <ArrowRight className="h-3.5 w-3.5" />
          </MagneticButton>

          <Link
            to="/customize"
            className="mt-3 block text-center text-xs font-semibold tracking-wide text-muted uppercase transition-colors hover:text-primary-2"
          >
            Continue Building
          </Link>
        </motion.aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-abyss/95 p-4 backdrop-blur-xl pb-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-muted-2 uppercase">Total</p>
            <p className="font-display text-2xl font-extrabold text-white tabular-nums">
              ${total.toFixed(2)}
            </p>
          </div>
          <MagneticButton
            onClick={() => {
              playClickSfx()
              navigate('/checkout')
            }}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-3 px-5 py-3 text-sm font-bold tracking-wide text-white uppercase shadow-[0_0_28px_rgba(124,58,237,0.45)] hover:bg-primary"
          >
            <ShoppingBag className="h-4 w-4" />
            Checkout
            <ArrowRight className="h-3.5 w-3.5" />
          </MagneticButton>
        </div>
      </div>

      <div className="mt-8 mb-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold tracking-wide text-muted uppercase sm:mt-10 sm:gap-6">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary-2" /> Secure Checkout
        </span>
        <span className="text-white/20">·</span>
        <span className="inline-flex items-center gap-2">
          <Magnet className="h-3.5 w-3.5 text-primary-2" /> Magnetic Assembly
        </span>
        <span className="text-white/20">·</span>
        <span className="inline-flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-primary-2" /> Ships Worldwide
        </span>
      </div>
    </CommerceLayout>
  )
}
