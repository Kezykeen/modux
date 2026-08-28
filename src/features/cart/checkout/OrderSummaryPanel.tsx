import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { rarityTone } from '@/widgets'
import { useCart } from '../context/CartContext'
import { PromoCodeField } from '../components/PromoCodeField'

export function OrderSummaryPanel({ submitting }: { submitting: boolean }) {
  const {
    items,
    itemCount,
    subtotal,
    promoApplied,
    discount,
    shippingMethod,
    shippingCost,
    tax,
    total,
  } = useCart()

  return (
    <aside className="h-fit rounded-2xl border border-white/8 bg-panel p-6 lg:sticky lg:top-20">
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-wide text-white uppercase">Order Summary</h2>
        <span className="rounded-full bg-primary-3/20 px-2.5 py-1 text-[10px] font-bold text-primary-2 uppercase">
          {itemCount} {itemCount === 1 ? 'Item' : 'Items'} Selected
        </span>
      </div>

      <ul className="mb-5 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-lg border border-white/8 bg-abyss">
              <img src={item.snapshot} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{item.name}</p>
              <p className={`text-[10px] font-bold uppercase ${rarityTone[item.rarity]}`}>
                {item.rarity}
                {item.quantity > 1 ? ` · ×${item.quantity}` : ''}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-ink">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <PromoCodeField className="mb-4" />

      <dl className="space-y-2 text-sm text-muted">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="tabular-nums text-ink">${subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping'}</dt>
          <dd className="tabular-nums text-ink">
            {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
          </dd>
        </div>
        <div className="flex justify-between">
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

      <div className="mt-4 flex items-end justify-between border-t border-white/8 pt-4">
        <p className="font-display text-3xl font-extrabold text-white tabular-nums">
          ${total.toFixed(2)}
        </p>
        {promoApplied && (
          <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase">
            Save ${discount.toFixed(2)}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-3 py-3.5 text-sm font-bold tracking-wide text-white uppercase shadow-[0_0_28px_rgba(124,58,237,0.45)] transition-all hover:bg-primary hover:shadow-[0_0_36px_rgba(168,85,247,0.55)] disabled:opacity-70"
      >
        {submitting ? 'Placing Order…' : 'Place Order & Cast Charm'}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>

      <p className="mt-3 text-center text-[10px] leading-relaxed text-muted-2">
        By placing this order you authorize MODUX to charge your payment method and begin custom
        assembly.
      </p>
      <Link
        to="/cart"
        className="mt-3 block text-center text-xs font-semibold text-muted hover:text-primary-2"
      >
        Back to bag
      </Link>
    </aside>
  )
}
