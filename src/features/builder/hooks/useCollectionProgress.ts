import { useMemo } from 'react'
import { useAuth } from '@/features/auth'
import { useCart } from '@/features/cart'
import { useCollections } from '@/features/collections'
import { useOrders } from '@/features/orders'
import { useBuild } from '../context/BuildContext'
import {
  collectCatalogIdsFromPartNames,
  collectCatalogIdsFromSelection,
  computeCollectionProgress,
  type CollectionProgress,
} from '../utils/collection-progress'

export function useCollectionProgress(): {
  progress: CollectionProgress
  isLoading: boolean
  isAuthenticated: boolean
} {
  const { isAuthenticated } = useAuth()
  const { selection } = useBuild()
  const { collections, isLoading: collectionsLoading } = useCollections()
  const { orders, isLoading: ordersLoading } = useOrders()
  const { items: cartItems, isLoading: cartLoading } = useCart()

  const progress = useMemo(() => {
    const ids: string[] = [
      ...collectCatalogIdsFromSelection(selection),
    ]

    for (const collection of collections) {
      ids.push(...collectCatalogIdsFromSelection(collection.partsJson))
    }

    for (const order of orders) {
      for (const item of order.items) {
        ids.push(...collectCatalogIdsFromPartNames(item.partNames))
      }
    }

    for (const item of cartItems) {
      ids.push(...collectCatalogIdsFromPartNames(item.partNames))
    }

    return computeCollectionProgress(ids)
  }, [selection, collections, orders, cartItems])

  const isLoading =
    isAuthenticated && (collectionsLoading || ordersLoading || cartLoading)

  return { progress, isLoading, isAuthenticated }
}
