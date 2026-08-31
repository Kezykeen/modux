import type { Rarity } from '@/shared/types'

export type ShippingMethod = 'standard' | 'express'

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type ShippingAddressDto = {
  firstName: string
  lastName: string
  street: string
  city: string
  state: string
  zip: string
  email: string
  phone: string
}

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

export type CartTotalsDto = {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  promoApplied: boolean
}

export type CartResponse = {
  promoCode: string | null
  shippingMethod: ShippingMethod
  items: CartItemDto[]
  totals: CartTotalsDto
}

export type CartItemInput = {
  name: string
  rarity: Rarity
  price: number
  quantity: number
  partCount: number
  partNames: string[]
  snapshotKey?: string
}

export type SyncCartBody = {
  promoCode?: string | null
  shippingMethod?: ShippingMethod
  items: CartItemInput[]
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
  status: OrderStatus
  shippingMethod: ShippingMethod
  address: ShippingAddressDto
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

export type CollectionDto = {
  id: string
  name: string
  snapshotKey: string | null
  snapshotUrl: string | null
  partsJson: unknown
  createdAt: string
  updatedAt: string
}
