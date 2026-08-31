import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CommerceLayout, rarityTone } from '@/widgets'
import { getOrder } from '@/lib/api/orders'
import { orderDtoToPlaced } from '@/features/cart/utils/order-map'
import { cachedQuery } from '@/lib/cache/query-cache'
import type { PlacedOrder } from '@/features/cart'
import { OrderDetailSkeleton } from '@/shared/components'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<PlacedOrder | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    cachedQuery(`order:${id}`, () => getOrder(id), 60_000)
      .then(({ order: dto }) => setOrder(orderDtoToPlaced(dto)))
      .catch(() => setError('Order not found.'))
  }, [id])

  if (error) {
    return (
      <CommerceLayout>
        <p className="py-16 text-center text-red-400">{error}</p>
        <Link to="/orders" className="text-center text-sm text-primary-2">Back to orders</Link>
      </CommerceLayout>
    )
  }

  if (!order && !error) {
    return (
      <CommerceLayout>
        <OrderDetailSkeleton />
      </CommerceLayout>
    )
  }

  if (!order) {
    return null
  }

  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <CommerceLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">{order.orderNumber}</h1>
          <p className="mt-1 text-sm capitalize text-muted">
            {order.status} · Placed {new Date(order.placedAt).toLocaleDateString()}
          </p>
        </div>
        <Link to="/orders" className="text-sm font-semibold text-primary-2 hover:text-primary">
          All orders
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-white/8 bg-panel p-6">
          <h2 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">Items</h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 border-b border-white/8 pb-3 last:border-0">
                <img src={item.snapshot} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white">{item.name}</p>
                  <p className={`text-[10px] font-bold uppercase ${rarityTone[item.rarity]}`}>
                    {item.rarity}
                  </p>
                </div>
                <span className="tabular-nums text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="rounded-2xl border border-white/8 bg-panel p-6">
          <h2 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">Summary</h2>
          <dl className="space-y-2 text-sm text-muted">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="text-white">${order.subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="text-white">
                {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd className="text-white">${order.tax.toFixed(2)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <dt>Discount</dt>
                <dd>-${order.discount.toFixed(2)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex justify-between border-t border-white/8 pt-4">
            <span className="text-muted">Total ({itemCount} items)</span>
            <span className="font-display text-xl font-bold text-white">${order.total.toFixed(2)}</span>
          </div>
          <p className="mt-4 text-[12px] text-muted">Est. delivery {order.estDelivery}</p>
        </aside>
      </div>
    </CommerceLayout>
  )
}
