import type { Cart, CartItem, Order, OrderItem } from '@prisma/client'

export type CartWithItems = Cart & { items: CartItem[] }

export type OrderWithItems = Order & { items: OrderItem[] }
