import { listOrders } from '@/lib/api/orders'
import type { OrderDto } from '@/lib/api/types'
import { cachedQuery, invalidateCache } from '@/lib/cache/query-cache'
import { toast } from '@/shared/components'
import { useAuth } from '@/features/auth'
import { useCallback, useEffect, useState } from 'react'

const CACHE_KEY = 'orders'

export function useOrders() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(
    async (force = false) => {
      if (!isAuthenticated) {
        setOrders([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const { orders: rows } = await cachedQuery(CACHE_KEY, listOrders, 60_000, { force })
        setOrders(rows)
      } catch {
        toast.error('Could not load orders.')
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated],
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  return { orders, isLoading, refresh }
}

export function invalidateOrdersCache() {
  invalidateCache(CACHE_KEY)
  invalidateCache(/^order:/)
}
