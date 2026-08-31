import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CatalogItem, Rarity } from '@/shared/types'
import { toast } from '@/shared/components'
import { useAuth } from '@/features/auth/context/AuthContext'
import { getCart, syncCart } from '@/lib/api/cart'
import { placeOrder as apiPlaceOrder } from '@/lib/api/orders'
import { uploadSnapshot } from '@/lib/api/uploads'
import { cachedQuery, invalidateCache, writeCache } from '@/lib/cache/query-cache'
import type { CartItemDto, CartItemInput, CartTotalsDto, OrderStatus } from '@/lib/api/types'
import { FALLBACK_SNAPSHOT, resolveSnapshotUrl } from '@/lib/assets'
import {
  clearGuestSnapshots,
  getGuestSnapshot,
  removeGuestSnapshot,
  setGuestSnapshot,
} from '@/lib/guest-snapshots'
import { orderDtoToPlaced } from '../utils/order-map'
import { invalidateOrdersCache } from '@/features/orders/hooks/useOrders'

const CART_CACHE_KEY = 'cart'

export interface CartItem {
  id: string
  name: string
  rarity: Rarity
  price: number
  quantity: number
  partCount: number
  partNames: string[]
  snapshotKey: string | null
  /** Browser display URL (API asset URL or guest session preview). */
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
  id: string
  orderNumber: string
  status: OrderStatus
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
  isLoading: boolean
  pendingItemIds: ReadonlySet<string>
  syncingItemIds: ReadonlySet<string>
  subtotal: number
  promoCode: string | null
  promoApplied: boolean
  discount: number
  shippingMethod: ShippingMethod
  setShippingMethod: (m: ShippingMethod) => void
  shippingCost: number
  tax: number
  total: number
  addBuild: (input: { items: CatalogItem[]; snapshot: string }) => Promise<void>
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  applyPromo: (code: string) => boolean
  clearPromo: () => void
  clearCart: () => void
  lastOrder: PlacedOrder | null
  placeOrder: (address: ShippingAddress) => Promise<PlacedOrder>
  setLastOrder: (order: PlacedOrder | null) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const GUEST_CART_KEY = 'modux-cart'
const GUEST_PROMO_KEY = 'modux-promo'
const LEGACY_AUTH_KEY = 'modux-auth'
const LEGACY_USER_KEY = 'modux-user'
const LEGACY_ORDER_KEY = 'modux-last-order'

export const VALID_PROMO = 'MODUX2026'
const PROMO_RATE = 0.1
const TAX_RATE = 0.08
const EXPRESS_COST = 4.99

type GuestCartStored = {
  id: string
  name: string
  rarity: Rarity
  price: number
  quantity: number
  partCount: number
  partNames: string[]
}

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
  return BUILD_NAMES[rarity][seed % BUILD_NAMES[rarity].length]
}

function cartItemFromDto(dto: CartItemDto): CartItem {
  return {
    id: dto.id,
    name: dto.name,
    rarity: dto.rarity,
    price: dto.price,
    quantity: dto.quantity,
    partCount: dto.partCount,
    partNames: dto.partNames,
    snapshotKey: dto.snapshotKey,
    snapshot: resolveSnapshotUrl(dto.snapshotUrl),
  }
}

function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GuestCartStored[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => ({
      ...item,
      snapshotKey: null,
      snapshot: getGuestSnapshot(item.id) ?? FALLBACK_SNAPSHOT,
    }))
  } catch {
    return []
  }
}

function readGuestPromo(): string | null {
  try {
    const code = localStorage.getItem(GUEST_PROMO_KEY)
    return code === VALID_PROMO ? code : null
  } catch {
    return null
  }
}

function persistGuestCart(items: CartItem[]) {
  try {
    const lean: GuestCartStored[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      rarity: item.rarity,
      price: item.price,
      quantity: item.quantity,
      partCount: item.partCount,
      partNames: item.partNames,
    }))
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lean))
  } catch {
    /* quota */
  }
}

function persistGuestPromo(code: string | null) {
  try {
    if (code) localStorage.setItem(GUEST_PROMO_KEY, code)
    else localStorage.removeItem(GUEST_PROMO_KEY)
  } catch {
    /* ignore */
  }
}

function clearLegacyAuthStorage() {
  try {
    localStorage.removeItem(LEGACY_AUTH_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
    localStorage.removeItem(LEGACY_ORDER_KEY)
    localStorage.removeItem('modux-snapshots')
  } catch {
    /* ignore */
  }
}

function computeLocalTotals(
  items: CartItem[],
  shippingMethod: ShippingMethod,
  promoCode: string | null,
): CartTotalsDto {
  const subtotal = money(items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const promoApplied = promoCode === VALID_PROMO
  const discount = promoApplied ? money(subtotal * PROMO_RATE) : 0
  const shipping = shippingMethod === 'express' ? EXPRESS_COST : 0
  const taxable = money(Math.max(0, subtotal - discount))
  const tax = money(taxable * TAX_RATE)
  const total = money(taxable + shipping + tax)
  return { subtotal, discount, shipping, tax, total, promoApplied }
}

function toSyncItems(items: CartItem[]): CartItemInput[] {
  return items.map((item) => ({
    name: item.name,
    rarity: item.rarity,
    price: item.price,
    quantity: item.quantity,
    partCount: item.partCount,
    partNames: item.partNames,
    ...(item.snapshotKey ? { snapshotKey: item.snapshotKey } : {}),
  }))
}

async function uploadGuestItemSnapshot(item: CartItem): Promise<CartItem> {
  const dataUrl = getGuestSnapshot(item.id)
  if (!dataUrl) {
    return { ...item, snapshotKey: null, snapshot: FALLBACK_SNAPSHOT }
  }
  const uploaded = await uploadSnapshot(dataUrl)
  removeGuestSnapshot(item.id)
  return {
    ...item,
    snapshotKey: uploaded.snapshotKey,
    snapshot: resolveSnapshotUrl(uploaded.url),
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [shippingMethod, setShippingMethodState] = useState<ShippingMethod>('express')
  const [serverTotals, setServerTotals] = useState<CartTotalsDto | null>(null)
  const [cartLoading, setCartLoading] = useState(true)
  const [pendingItemIds, setPendingItemIds] = useState<ReadonlySet<string>>(new Set())
  const [syncingItemIds, setSyncingItemIds] = useState<ReadonlySet<string>>(new Set())
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(null)
  const [nameSeed, setNameSeed] = useState(0)
  const mergeDoneRef = useRef(false)
  const itemsRef = useRef(items)
  const syncingRef = useRef(new Set<string>())
  const pendingRef = useRef(new Set<string>())

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const applyServerResponse = useCallback((res: Awaited<ReturnType<typeof syncCart>>) => {
    setItems(res.items.map(cartItemFromDto))
    setPromoCode(res.promoCode)
    setShippingMethodState(res.shippingMethod)
    setServerTotals(res.totals)
  }, [])

  const syncAuthenticatedCart = useCallback(
    async (nextItems: CartItem[], nextPromo: string | null, nextShipping: ShippingMethod) => {
      const res = await syncCart({
        items: toSyncItems(nextItems),
        promoCode: nextPromo,
        shippingMethod: nextShipping,
      })
      writeCache(CART_CACHE_KEY, res)
      applyServerResponse(res)
    },
    [applyServerResponse],
  )

  const loadGuestState = useCallback(() => {
    setItems(readGuestCart())
    setPromoCode(readGuestPromo())
    setShippingMethodState('express')
    setServerTotals(null)
    setCartLoading(false)
  }, [])

  const mergeGuestIntoServer = useCallback(async () => {
    const guestItems = readGuestCart()
    const guestPromo = readGuestPromo()

    try {
      const server = await cachedQuery(CART_CACHE_KEY, getCart, 60_000)
      const uploadedGuest = await Promise.all(guestItems.map(uploadGuestItemSnapshot))
      clearGuestSnapshots()

      const serverItems = server.items.map(cartItemFromDto)
      const mergedItems = uploadedGuest.length > 0 ? [...uploadedGuest, ...serverItems] : serverItems

      const res = await syncCart({
        items: toSyncItems(mergedItems),
        promoCode: guestPromo ?? server.promoCode,
        shippingMethod: server.shippingMethod,
      })
      writeCache(CART_CACHE_KEY, res)
      applyServerResponse(res)

      persistGuestCart([])
      persistGuestPromo(null)
    } catch {
      loadGuestState()
      toast.error('Could not sync your cart. Showing saved items.')
    } finally {
      setCartLoading(false)
    }
  }, [applyServerResponse, loadGuestState])

  useEffect(() => {
    clearLegacyAuthStorage()
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      mergeDoneRef.current = false
      loadGuestState()
      return
    }

    if (!mergeDoneRef.current) {
      mergeDoneRef.current = true
      setCartLoading(true)
      mergeGuestIntoServer()
    }
  }, [authLoading, isAuthenticated, loadGuestState, mergeGuestIntoServer])

  const persistGuest = useCallback((next: CartItem[], nextPromo: string | null) => {
    setItems(next)
    setPromoCode(nextPromo)
    setServerTotals(null)
    persistGuestCart(next)
    persistGuestPromo(nextPromo)
  }, [])

  const addBuild = useCallback(
    async ({ items: catalogItems, snapshot }: { items: CatalogItem[]; snapshot: string }) => {
      if (catalogItems.length === 0) return

      const rarity = highestRarity(catalogItems)
      const price = catalogItems.reduce((sum, i) => sum + i.price, 0)
      const id = `build-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const buildName = nameForBuild(rarity, nameSeed)
      setNameSeed((s) => s + 1)

      const item: CartItem = {
        id,
        name: buildName,
        rarity,
        price,
        quantity: 1,
        partCount: catalogItems.length,
        partNames: catalogItems.map((i) => i.name),
        snapshotKey: null,
        snapshot,
      }

      const previousItems = itemsRef.current
      const next = [item, ...previousItems]

      if (!isAuthenticated) {
        setGuestSnapshot(id, snapshot)
        persistGuest(next, promoCode)
        toast.success(`${buildName} added to your bag`)
        return
      }

      setItems(next)
      pendingRef.current.add(id)
      setPendingItemIds(new Set(pendingRef.current))

      try {
        const uploaded = await uploadSnapshot(snapshot)
        const syncedItem: CartItem = {
          ...item,
          snapshotKey: uploaded.snapshotKey,
          snapshot: resolveSnapshotUrl(uploaded.url),
        }
        const syncedNext = [syncedItem, ...previousItems]
        await syncAuthenticatedCart(syncedNext, promoCode, shippingMethod)
        toast.success(`${buildName} added to your bag`)
      } catch {
        setItems(previousItems)
        toast.error('Could not add build to your bag. Please try again.')
        throw new Error('addBuild failed')
      } finally {
        pendingRef.current.delete(id)
        setPendingItemIds(new Set(pendingRef.current))
      }
    },
    [nameSeed, isAuthenticated, promoCode, shippingMethod, persistGuest, syncAuthenticatedCart],
  )

  const removeItem = useCallback(
    (id: string) => {
      if (syncingRef.current.has(id) || pendingRef.current.has(id)) return

      const previous = itemsRef.current
      const next = previous.filter((i) => i.id !== id)
      removeGuestSnapshot(id)

      if (!isAuthenticated) {
        persistGuest(next, promoCode)
        return
      }

      setItems(next)
      syncingRef.current.add(id)
      setSyncingItemIds(new Set(syncingRef.current))

      syncAuthenticatedCart(next, promoCode, shippingMethod)
        .catch(() => {
          setItems(previous)
          toast.error('Could not remove item. Please try again.')
        })
        .finally(() => {
          syncingRef.current.delete(id)
          setSyncingItemIds(new Set(syncingRef.current))
        })
    },
    [isAuthenticated, promoCode, shippingMethod, persistGuest, syncAuthenticatedCart],
  )

  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      if (syncingRef.current.has(id) || pendingRef.current.has(id)) return

      const previous = itemsRef.current
      const next =
        quantity < 1
          ? previous.filter((i) => i.id !== id)
          : previous.map((i) => (i.id === id ? { ...i, quantity } : i))

      if (quantity < 1) removeGuestSnapshot(id)

      if (!isAuthenticated) {
        persistGuest(next, promoCode)
        return
      }

      setItems(next)
      syncingRef.current.add(id)
      setSyncingItemIds(new Set(syncingRef.current))

      syncAuthenticatedCart(next, promoCode, shippingMethod)
        .catch(() => {
          setItems(previous)
          toast.error('Could not update quantity. Please try again.')
        })
        .finally(() => {
          syncingRef.current.delete(id)
          setSyncingItemIds(new Set(syncingRef.current))
        })
    },
    [isAuthenticated, promoCode, shippingMethod, persistGuest, syncAuthenticatedCart],
  )

  const applyPromo = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase()
      if (normalized !== VALID_PROMO) return false

      if (isAuthenticated) {
        syncAuthenticatedCart(items, normalized, shippingMethod)
          .then(() => toast.success('Promo code applied — 10% off'))
          .catch(() => {
            setPromoCode(normalized)
            toast.error('Could not apply promo code. Try again.')
          })
      } else {
        persistGuest(items, normalized)
        toast.success('Promo code applied — 10% off')
      }
      return true
    },
    [items, isAuthenticated, shippingMethod, persistGuest, syncAuthenticatedCart],
  )

  const clearPromo = useCallback(() => {
    if (isAuthenticated) {
      syncAuthenticatedCart(items, null, shippingMethod)
        .then(() => toast.info('Promo code removed'))
        .catch(() => {
          setPromoCode(null)
          toast.error('Could not remove promo code.')
        })
    } else {
      persistGuest(items, null)
      toast.info('Promo code removed')
    }
  }, [items, isAuthenticated, shippingMethod, persistGuest, syncAuthenticatedCart])

  const clearCart = useCallback(() => {
    clearGuestSnapshots()
    if (isAuthenticated) {
      syncAuthenticatedCart([], null, shippingMethod).catch(() => {
        setItems([])
        toast.error('Could not clear cart.')
      })
    } else {
      persistGuest([], null)
    }
  }, [isAuthenticated, shippingMethod, persistGuest, syncAuthenticatedCart])

  const setShippingMethod = useCallback(
    (method: ShippingMethod) => {
      if (isAuthenticated) {
        syncAuthenticatedCart(items, promoCode, method).catch(() => {
          setShippingMethodState(method)
          toast.error('Could not update shipping method.')
        })
      } else {
        setShippingMethodState(method)
      }
    },
    [items, promoCode, isAuthenticated, syncAuthenticatedCart],
  )

  const localTotals = useMemo(
    () => computeLocalTotals(items, shippingMethod, promoCode),
    [items, shippingMethod, promoCode],
  )

  const totals = serverTotals ?? localTotals

  const placeOrderFn = useCallback(async (address: ShippingAddress): Promise<PlacedOrder> => {
    try {
      const { order } = await apiPlaceOrder(address)
      const placed = orderDtoToPlaced(order)
      invalidateCache(CART_CACHE_KEY)
      invalidateOrdersCache()
      setLastOrder(placed)
      setItems([])
      setPromoCode(null)
      setServerTotals(null)
      clearGuestSnapshots()
      toast.success('Order placed successfully')
      return placed
    } catch {
      toast.error('Could not place your order. Please try again.')
      throw new Error('placeOrder failed')
    }
  }, [])

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      isLoading: authLoading || cartLoading,
      pendingItemIds,
      syncingItemIds,
      subtotal: totals.subtotal,
      promoCode,
      promoApplied: totals.promoApplied,
      discount: totals.discount,
      shippingMethod,
      setShippingMethod,
      shippingCost: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      addBuild,
      removeItem,
      setQuantity,
      applyPromo,
      clearPromo,
      clearCart,
      lastOrder,
      placeOrder: placeOrderFn,
      setLastOrder,
    }),
    [
      items,
      itemCount,
      authLoading,
      cartLoading,
      pendingItemIds,
      syncingItemIds,
      totals,
      promoCode,
      shippingMethod,
      setShippingMethod,
      addBuild,
      removeItem,
      setQuantity,
      applyPromo,
      clearPromo,
      clearCart,
      lastOrder,
      placeOrderFn,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
