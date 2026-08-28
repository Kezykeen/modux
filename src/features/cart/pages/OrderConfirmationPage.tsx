import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, MapPin, Package, Truck } from 'lucide-react'
import { CommerceLayout, rarityTone } from '@/widgets'
import { useCart } from '../context/CartContext'
import { useAuth } from '@/features/auth'

const STEPS = [
  { id: 'placed', label: 'Order Placed', detail: 'Completed', status: 'completed' as const },
  { id: 'processing', label: 'Processing', detail: 'In Progress', status: 'current' as const },
  { id: 'shipped', label: 'Shipped', detail: 'Pending', status: 'pending' as const },
  { id: 'delivered', label: 'Delivered', detail: 'Pending', status: 'pending' as const },
]

export function OrderConfirmationPage() {
  const navigate = useNavigate()
  const { lastOrder } = useCart()
  const { user } = useAuth()

  if (!lastOrder) {
    return <Navigate to="/cart" replace />
  }

  const firstName = lastOrder.address.firstName || user?.name?.split(' ')[0] || 'there'
  const itemCount = lastOrder.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <CommerceLayout>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Success hero */}
          <motion.section
            className="flex flex-col items-center gap-6 rounded-3xl border border-white/8 bg-panel p-8"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-[32px] border-2 border-emerald-500 bg-emerald-500/12 text-emerald-400 shadow-[0_0_32px_rgba(16,185,129,0.25)]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.12 }}
            >
              <Check className="h-6 w-6" strokeWidth={3} />
            </motion.div>

            <div className="text-center">
              <h1 className="font-display text-3xl font-black text-white sm:text-[2rem]">
                Order Placed Successfully!
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
                Thank you for your order, {firstName}. We&apos;re getting your modular parts ready
                for assembly and charm casting.
              </p>
            </div>

            <div className="flex w-full flex-col divide-y divide-white/8 rounded-xl border border-white/8 bg-panel-3 sm:flex-row sm:divide-x sm:divide-y-0">
              {[
                {
                  label: 'Order Number',
                  value: lastOrder.orderNumber,
                  tone: 'text-primary-2',
                },
                {
                  label: 'Est. Delivery',
                  value: lastOrder.estDelivery,
                  tone: 'text-white',
                },
                {
                  label: 'Shipping Status',
                  value: 'Processing',
                  tone: 'text-emerald-400',
                },
              ].map((cell, i) => (
                <motion.div
                  key={cell.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="flex flex-1 flex-col items-center gap-1 px-4 py-4"
                >
                  <p className="text-[10px] font-bold tracking-wide text-muted-2 uppercase">
                    {cell.label}
                  </p>
                  <p className={`font-display text-lg font-extrabold ${cell.tone}`}>{cell.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Shipment tracker */}
          <motion.section
            className="rounded-[20px] border border-white/8 bg-panel p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-3/15 text-primary-2">
                <Truck className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-bold tracking-wide text-white uppercase">
                Shipment Tracker
              </h2>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
              {STEPS.map((step, i) => {
                const isLast = i === STEPS.length - 1
                return (
                  <div key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex shrink-0 items-center gap-3">
                      <div
                        className={`relative flex h-7 w-7 items-center justify-center rounded-full ${
                          step.status === 'completed'
                            ? 'bg-emerald-500 text-white'
                            : step.status === 'current'
                              ? 'bg-primary-3 text-white shadow-[0_0_16px_rgba(124,58,237,0.55)] ring-2 ring-primary-2/40'
                              : 'border border-white/15 bg-panel-2 text-muted-2'
                        }`}
                      >
                        {step.status === 'completed' ? (
                          <Check className="h-3 w-3" strokeWidth={3} />
                        ) : (
                          <span
                            className={`h-2 w-2 rounded-full ${
                              step.status === 'current'
                                ? 'animate-pulse bg-white'
                                : 'bg-current'
                            }`}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-[13px] font-bold ${
                            step.status === 'pending' ? 'font-medium text-muted' : 'text-white'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] text-muted-2">{step.detail}</p>
                      </div>
                    </div>

                    {!isLast && (
                      <div className="mx-1 hidden h-0.5 min-w-4 flex-1 sm:block">
                        <motion.div
                          className={`h-full rounded-full ${
                            step.status === 'completed' ? 'bg-emerald-500' : 'bg-white/10'
                          }`}
                          initial={
                            step.status === 'completed' ? { scaleX: 0 } : undefined
                          }
                          animate={
                            step.status === 'completed' ? { scaleX: 1 } : undefined
                          }
                          style={{ transformOrigin: 'left' }}
                          transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.section>

          {/* Delivery details */}
          <motion.section
            className="rounded-[20px] border border-white/8 bg-panel p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-3/15 text-primary-2">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-bold tracking-wide text-white uppercase">
                Delivery Details
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[11px] font-bold tracking-wide text-muted-2 uppercase">
                  Shipping Address
                </p>
                <p className="text-sm font-bold text-white">
                  {lastOrder.address.firstName} {lastOrder.address.lastName}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {lastOrder.address.street}
                  <br />
                  {lastOrder.address.city}, {lastOrder.address.state} {lastOrder.address.zip}
                  <br />
                  United States
                </p>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-bold tracking-wide text-muted-2 uppercase">
                  Shipping Method
                </p>
                <p className="text-sm font-bold text-white">
                  {lastOrder.shippingMethod === 'express'
                    ? 'Express Holographic Shipping'
                    : 'Standard Delivery'}
                </p>
                <p className="mt-1 text-[13px] text-muted">
                  {lastOrder.shippingMethod === 'express'
                    ? '2 - 3 Business Days (Secured Box)'
                    : '5 - 7 Business Days'}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-400">
                  <Package className="h-3.5 w-3.5" />
                  Insured Delivery
                </p>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Order summary */}
        <motion.aside
          className="h-fit rounded-[20px] border border-white/8 bg-panel p-6 lg:sticky lg:top-20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18 }}
        >
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">
              Order Summary
            </h2>
            <span className="rounded-md bg-primary-3/15 px-2 py-1 text-[10px] font-bold text-primary-2 uppercase">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'} Recapped
            </span>
          </div>

          <ul className="mb-5 space-y-0">
            {lastOrder.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 border-b border-white/8 py-3 first:pt-0 last:border-b-0"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-abyss">
                  <img
                    src={item.snapshot}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{item.name}</p>
                  <p className={`text-[10px] font-bold uppercase ${rarityTone[item.rarity]}`}>
                    {item.rarity}
                    {item.quantity > 1 ? ` · ×${item.quantity}` : ''}
                  </p>
                </div>
                <span className="text-[13px] font-semibold tabular-nums text-white">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mb-4 h-px bg-white/8" />

          <dl className="space-y-2 text-[12px] text-muted">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="text-[13px] tabular-nums text-white">
                ${lastOrder.subtotal.toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>
                {lastOrder.shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping'}
              </dt>
              <dd className="text-[13px] tabular-nums text-white">
                {lastOrder.shipping === 0 ? 'FREE' : `$${lastOrder.shipping.toFixed(2)}`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Estimated Tax</dt>
              <dd className="text-[13px] tabular-nums text-white">
                ${lastOrder.tax.toFixed(2)}
              </dd>
            </div>
            {lastOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <dt>Promo Code Discount (10%)</dt>
                <dd className="text-[13px] tabular-nums">-${lastOrder.discount.toFixed(2)}</dd>
              </div>
            )}
          </dl>

          <div className="my-4 h-px bg-white/8" />

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-normal tracking-wide text-muted-2 uppercase">
                Grand Total
              </p>
              <p className="font-display text-2xl font-black tabular-nums text-white">
                ${lastOrder.total.toFixed(2)}
              </p>
            </div>
            {lastOrder.discount > 0 && (
              <span className="rounded-md bg-emerald-500/12 px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase">
                Saved ${lastOrder.discount.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mb-4 h-px bg-white/8" />

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/customize')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-3 py-3.5 text-xs font-extrabold tracking-wide text-white uppercase shadow-[0_0_28px_rgba(124,58,237,0.45)] transition-colors hover:bg-primary"
            >
              <MapPin className="h-3.5 w-3.5" />
              Track My Order
            </button>
            <Link
              to="/customize"
              className="flex w-full items-center justify-center rounded-xl border border-white/8 bg-panel-3 py-3.5 text-xs font-extrabold tracking-wide text-muted uppercase transition-colors hover:border-primary-3/40 hover:text-ink"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.aside>
      </div>
    </CommerceLayout>
  )
}
