import type { CartItem, Collection, Order, OrderItem, Rarity } from '@prisma/client'
import { decimalToNumber } from '../utils/money.js'
import { snapshotUrl } from '../utils/snapshot-url.js'

export type CartItemDto = {
  id: string
  name: string
  rarity: Rarity
  price: number
  quantity: number
  partCount: number
  partNames: string[]
  snapshotKey: string | null
  snapshotUrl: string | null
}

export type CollectionDto = {
  id: string
  name: string
  snapshotKey: string | null
  snapshotUrl: string | null
  partsJson: unknown
  createdAt: string
  updatedAt: string
}

export type OrderItemDto = {
  id: string
  name: string
  rarity: Rarity
  price: number
  quantity: number
  partCount: number
  partNames: string[]
  snapshotKey: string | null
  snapshotUrl: string | null
}

export type OrderDto = {
  id: string
  orderNumber: string
  status: Order['status']
  shippingMethod: Order['shippingMethod']
  address: unknown
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  promoCode: string | null
  estDelivery: string
  placedAt: string
  items: OrderItemDto[]
}

export function toCartItemDto(item: CartItem): CartItemDto {
  return {
    id: item.id,
    name: item.name,
    rarity: item.rarity,
    price: decimalToNumber(item.price),
    quantity: item.quantity,
    partCount: item.partCount,
    partNames: item.partNames as string[],
    snapshotKey: item.snapshotKey,
    snapshotUrl: snapshotUrl(item.snapshotKey),
  }
}

export function toCollectionDto(collection: Collection): CollectionDto {
  return {
    id: collection.id,
    name: collection.name,
    snapshotKey: collection.snapshotKey,
    snapshotUrl: snapshotUrl(collection.snapshotKey),
    partsJson: collection.partsJson,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
  }
}

export function toOrderItemDto(item: OrderItem): OrderItemDto {
  return {
    id: item.id,
    name: item.name,
    rarity: item.rarity,
    price: decimalToNumber(item.price),
    quantity: item.quantity,
    partCount: item.partCount,
    partNames: item.partNames as string[],
    snapshotKey: item.snapshotKey,
    snapshotUrl: snapshotUrl(item.snapshotKey),
  }
}

export function toOrderDto(order: Order, items: OrderItem[]): OrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    shippingMethod: order.shippingMethod,
    address: order.addressJson,
    subtotal: decimalToNumber(order.subtotal),
    shipping: decimalToNumber(order.shipping),
    tax: decimalToNumber(order.tax),
    discount: decimalToNumber(order.discount),
    total: decimalToNumber(order.total),
    promoCode: order.promoCode,
    estDelivery: order.estDelivery,
    placedAt: order.placedAt.toISOString(),
    items: items.map(toOrderItemDto),
  }
}
