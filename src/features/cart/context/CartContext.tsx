import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CatalogItem, Rarity } from '@/shared/types'

export interface CartItem {
  id: string
  name: string
  rarity: Rarity
  price: number
  quantity: number
  partCount: number
  partNames: string[]
  /** JPEG data URL of the customized 3D model at add time. */
  snapshot: string
}

export type ShippingMethod = 'standard' | 'express'

export interface ShippingAddress {
  firstName: string
  lastName: string
  street: string
  city: string
  state: string
  zip: string
  email: string
  phone: string
}

export interface PlacedOrder {
  orderNumber: string
  items: CartItem[]
  address: ShippingAddress
  shippingMethod: ShippingMethod
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  promoCode: string | null
  placedAt: string
  estDelivery: string
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  promoCode: string | null
  promoApplied: boolean
  discount: number
  shippingMethod: ShippingMethod
  setShippingMethod: (m: ShippingMethod) => void
  shippingCost: number
  tax: number
  total: number
  addBuild: (input: {
    items: CatalogItem[]
    snapshot: string
  }) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  applyPromo: (code: string) => boolean
  clearPromo: () => void
  clearCart: () => void
  lastOrder: PlacedOrder | null
  placeOrder: (address: ShippingAddress) => PlacedOrder
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_KEY = 'modux-cart'
const PROMO_KEY = 'modux-promo'
const ORDER_KEY = 'modux-last-order'
export const VALID_PROMO = 'MODUX2026'
const PROMO_RATE = 0.1
const TAX_RATE = 0.08
const EXPRESS_COST = 4.99

/** Banker’s-friendly cent rounding for display + totals. */
function money(n: number) {
  return Math.round(n * 100) / 100
}

const RARITY_RANK: Record<Rarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
}

const BUILD_NAMES: Record<Rarity, string[]> = {
  legendary: ['Void Hunter', 'Apex Phantom'],
  epic: ['Shadow Ninja', 'Cyber Ronin'],
  rare: ['Neon Warrior', 'Pulse Runner'],
  common: ['Street Cast', 'Base Frame'],
}

function highestRarity(items: CatalogItem[]): Rarity {
  return items.reduce<Rarity>(
    (best, item) => (RARITY_RANK[item.rarity] > RARITY_RANK[best] ? item.rarity : best),
    'common',
  )
}

function nameForBuild(rarity: Rarity, seed: number) {
  const pool = BUILD_NAMES[rarity]
  return pool[seed % pool.length]
}

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readPromo(): string | null {
  try {
    const code = localStorage.getItem(PROMO_KEY)
    return code === VALID_PROMO ? code : null
  } catch {
    return null
  }
}

function readLastOrder(): PlacedOrder | null {
  try {
    const raw = localStorage.getItem(ORDER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PlacedOrder
  } catch {
    return null
  }
}

function estDeliveryDate(method: ShippingMethod) {
  const days = method === 'express' ? 3 : 7
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart)
  const [promoCode, setPromoCode] = useState<string | null>(readPromo)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('express')
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(readLastOrder)
  const [nameSeed, setNameSeed] = useState(0)

  const persist = useCallback((next: CartItem[]) => {
    setItems(next)
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next))
    } catch {
      /* ignore quota */
    }
  }, [])

  const addBuild = useCallback(
    ({ items: catalogItems, snapshot }: { items: CatalogItem[]; snapshot: string }) => {
      if (catalogItems.length === 0) return
      const rarity = highestRarity(catalogItems)
      const price = catalogItems.reduce((sum, i) => sum + i.price, 0)
      const id = `build-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const item: CartItem = {
        id,
        name: nameForBuild(rarity, nameSeed),
        rarity,
        price,
        quantity: 1,
        partCount: catalogItems.length,
        partNames: catalogItems.map((i) => i.name),
        snapshot,
      }
      setNameSeed((s) => s + 1)
      persist([item, ...items])
    },
    [items, nameSeed, persist],
  )

  const removeItem = useCallback(
    (id: string) => {
      persist(items.filter((i) => i.id !== id))
    },
    [items, persist],
  )

  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity < 1) {
        persist(items.filter((i) => i.id !== id))
        return
      }
      persist(items.map((i) => (i.id === id ? { ...i, quantity } : i)))
    },
    [items, persist],
  )

  const applyPromo = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase()
    if (normalized !== VALID_PROMO) return false
    setPromoCode(normalized)
    try {
      localStorage.setItem(PROMO_KEY, normalized)
    } catch {
      /* ignore */
    }
    return true
  }, [])

  const clearPromo = useCallback(() => {
    setPromoCode(null)
    try {
      localStorage.removeItem(PROMO_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const clearCart = useCallback(() => {
    persist([])
    clearPromo()
  }, [persist, clearPromo])

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  )
  const promoApplied = promoCode === VALID_PROMO
  const discount = promoApplied ? money(subtotal * PROMO_RATE) : 0
  const shippingCost = shippingMethod === 'express' ? EXPRESS_COST : 0
  const taxable = money(Math.max(0, subtotal - discount))
  const tax = money(taxable * TAX_RATE)
  const total = money(taxable + shippingCost + tax)
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  const placeOrder = useCallback(
    (address: ShippingAddress) => {
      const order: PlacedOrder = {
        orderNumber: `#MOD-${Math.floor(20000 + Math.random() * 70000)}`,
        items: items.map((i) => ({ ...i })),
        address,
        shippingMethod,
        subtotal,
        shipping: shippingCost,
        tax,
        discount,
        total,
        promoCode,
        placedAt: new Date().toISOString(),
        estDelivery: estDeliveryDate(shippingMethod),
      }
      setLastOrder(order)
      try {
        localStorage.setItem(ORDER_KEY, JSON.stringify(order))
      } catch {
        /* ignore */
      }
      persist([])
      return order
    },
    [
      items,
      shippingMethod,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      promoCode,
      persist,
    ],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      promoCode,
      promoApplied,
      discount,
      shippingMethod,
      setShippingMethod,
      shippingCost,
      tax,
      total,
      addBuild,
      removeItem,
      setQuantity,
      applyPromo,
      clearPromo,
      clearCart,
      lastOrder,
      placeOrder,
    }),
    [
      items,
      itemCount,
      subtotal,
      promoCode,
      promoApplied,
      discount,
      shippingMethod,
      shippingCost,
      tax,
      total,
      addBuild,
      removeItem,
      setQuantity,
      applyPromo,
      clearPromo,
      clearCart,
      lastOrder,
      placeOrder,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
