import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { placeOrderSchema } from '../schemas/domain.js'
import { requireSessionUser } from '../utils/session.js'
import { HttpError } from '../utils/http-error.js'
import { getOrCreateCart } from '../services/cart-repository.js'
import { computeCartTotals } from '../services/cart-pricing.js'
import { generateOrderNumber, estDeliveryDate } from '../utils/money.js'
import { toOrderDto } from '../services/serializers.js'
import type { OrderWithItems } from '../types/prisma.js'
import { toInputJson } from '../utils/json.js'

export async function orderRoutes(app: FastifyInstance) {
  app.get('/api/orders', async (request) => {
    const user = await requireSessionUser(request)
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { placedAt: 'desc' },
    })

    return {
      orders: orders.map((order) => toOrderDto(order, order.items)),
    }
  })

  app.get('/api/orders/:id', async (request) => {
    const user = await requireSessionUser(request)
    const { id } = request.params as { id: string }

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true },
    })

    if (!order) {
      throw new HttpError(404, 'Order not found')
    }

    return { order: toOrderDto(order, order.items) }
  })

  app.post('/api/orders', async (request) => {
    const user = await requireSessionUser(request)
    const { address } = placeOrderSchema.parse(request.body)

    const result = await prisma.$transaction(async (tx) => {
      const cart = await getOrCreateCart(tx, user.id)

      if (cart.items.length === 0) {
        throw new HttpError(400, 'Cart is empty')
      }

      const totals = computeCartTotals(cart.items, cart.shippingMethod, cart.promoCode)
      const orderNumber = generateOrderNumber()
      const estDelivery = estDeliveryDate(cart.shippingMethod)

      const order = await tx.order.create({
        data: {
          userId: user.id,
          orderNumber,
          shippingMethod: cart.shippingMethod,
          addressJson: toInputJson(address),
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          tax: totals.tax,
          discount: totals.discount,
          total: totals.total,
          promoCode: cart.promoCode,
          estDelivery,
          items: {
            create: cart.items.map((item) => ({
              name: item.name,
              rarity: item.rarity,
              price: item.price,
              quantity: item.quantity,
              partCount: item.partCount,
              partNames: toInputJson(item.partNames),
              snapshotKey: item.snapshotKey,
            })),
          },
        },
        include: { items: true },
      })

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
      await tx.cart.update({
        where: { id: cart.id },
        data: { promoCode: null },
      })

      return order as OrderWithItems
    })

    return { order: toOrderDto(result, result.items) }
  })
}
