import type { CartItem, ShippingMethod } from '@prisma/client'
import { decimalToNumber } from '../utils/money.js'

const VALID_PROMO = 'MODUX2026'
const PROMO_RATE = 0.1
const TAX_RATE = 0.08
const EXPRESS_COST = 4.99

function money(n: number) {
  return Math.round(n * 100) / 100
}

export type CartTotals = {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  promoApplied: boolean
}

export function computeCartTotals(
  items: CartItem[],
  shippingMethod: ShippingMethod,
  promoCode: string | null,
): CartTotals {
  const subtotal = money(
    items.reduce((sum, item) => sum + decimalToNumber(item.price) * item.quantity, 0),
  )
  const promoApplied = promoCode === VALID_PROMO
  const discount = promoApplied ? money(subtotal * PROMO_RATE) : 0
  const shipping = shippingMethod === 'express' ? EXPRESS_COST : 0
  const taxable = money(Math.max(0, subtotal - discount))
  const tax = money(taxable * TAX_RATE)
  const total = money(taxable + shipping + tax)

  return { subtotal, discount, shipping, tax, total, promoApplied }
}
