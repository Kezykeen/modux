import type { OrderDto } from '@/lib/api/types'
import type { PlacedOrder } from '../context/CartContext'
import { resolveSnapshotUrl } from '@/lib/assets'

export function orderDtoToPlaced(order: OrderDto): PlacedOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      rarity: item.rarity,
      price: item.price,
      quantity: item.quantity,
      partCount: item.partCount,
      partNames: item.partNames,
      snapshotKey: item.snapshotKey,
      snapshot: resolveSnapshotUrl(item.snapshotUrl),
    })),
    address: order.address,
    shippingMethod: order.shippingMethod,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    discount: order.discount,
    total: order.total,
    promoCode: order.promoCode,
    placedAt: order.placedAt,
    estDelivery: order.estDelivery,
  }
}
