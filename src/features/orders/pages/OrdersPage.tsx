import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Package } from 'lucide-react'
import { CommerceLayout } from '@/widgets'
import { useAuth } from '@/features/auth'
import { useOrders } from '../hooks/useOrders'
import { CommercePageSkeleton } from '@/shared/components'

export function OrdersPage() {
  const { isAuthenticated } = useAuth()
  const { orders, isLoading } = useOrders()

  if (!isAuthenticated) {
    return (
      <CommerceLayout>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-white">Order History</h1>
          <p className="mt-2 text-sm text-muted">Sign in to view your orders.</p>
          <Link
            to="/login"
            state={{ from: '/orders' }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-3 px-6 py-3 text-sm font-bold text-white uppercase hover:bg-primary"
          >
            Sign In
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CommerceLayout>
    )
  }

  if (isLoading) {
    return (
      <CommerceLayout>
        <CommercePageSkeleton />
      </CommerceLayout>
    )
  }

  return (
    <CommerceLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Order History</h1>
        <p className="mt-1 text-sm text-muted">Track and review past orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-panel p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-primary-2" />
          <p className="mt-4 font-display text-lg font-bold text-white">No orders yet</p>
          <Link to="/customize" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-2">
            Build something
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order, index) => (
            <motion.li
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                to={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/8 bg-panel p-4 transition-colors hover:border-primary-3/30"
              >
                <div>
                  <p className="font-bold text-white">{order.orderNumber}</p>
                  <p className="text-[12px] text-muted">
                    {new Date(order.placedAt).toLocaleDateString()} · {order.items.length} items ·{' '}
                    <span className="capitalize text-primary-2">{order.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold tabular-nums text-white">
                    ${order.total.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-muted">Est. {order.estDelivery}</p>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </CommerceLayout>
  )
}
