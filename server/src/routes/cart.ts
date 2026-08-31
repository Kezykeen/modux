import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { syncCartSchema } from '../schemas/domain.js'
import { requireSessionUser } from '../utils/session.js'
import { getOrCreateCart } from '../services/cart-repository.js'
import { computeCartTotals } from '../services/cart-pricing.js'
import { toCartItemDto } from '../services/serializers.js'
import type { CartWithItems } from '../types/prisma.js'
import { toInputJson } from '../utils/json.js'

export async function cartRoutes(app: FastifyInstance) {
  app.get('/api/cart', async (request) => {
    const user = await requireSessionUser(request)
    const cart = await getOrCreateCart(prisma, user.id)
    const totals = computeCartTotals(cart.items, cart.shippingMethod, cart.promoCode)

    return {
      promoCode: cart.promoCode,
      shippingMethod: cart.shippingMethod,
      items: cart.items.map(toCartItemDto),
      totals,
    }
  })

  app.put('/api/cart', async (request) => {
    const user = await requireSessionUser(request)
    const body = syncCartSchema.parse(request.body)

    const cart = await prisma.$transaction(async (tx) => {
      const base = await getOrCreateCart(tx, user.id)

      await tx.cartItem.deleteMany({ where: { cartId: base.id } })

      if (body.items.length > 0) {
        await tx.cartItem.createMany({
          data: body.items.map((item) => ({
            cartId: base.id,
            name: item.name,
            rarity: item.rarity,
            price: item.price,
            quantity: item.quantity,
            partCount: item.partCount,
            partNames: toInputJson(item.partNames),
            snapshotKey: item.snapshotKey,
          })),
        })
      }

      const updated = await tx.cart.update({
        where: { id: base.id },
        data: {
          promoCode: body.promoCode ?? base.promoCode,
          shippingMethod: body.shippingMethod ?? base.shippingMethod,
        },
        include: { items: true },
      })

      return updated as CartWithItems
    })

    const totals = computeCartTotals(cart.items, cart.shippingMethod, cart.promoCode)

    return {
      promoCode: cart.promoCode,
      shippingMethod: cart.shippingMethod,
      items: cart.items.map(toCartItemDto),
      totals,
    }
  })
}
