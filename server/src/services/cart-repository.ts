import type { Prisma, PrismaClient } from '@prisma/client'

type DbClient = PrismaClient | Prisma.TransactionClient

export async function getOrCreateCart(db: DbClient, userId: string) {
  const existing = await db.cart.findUnique({
    where: { userId },
    include: { items: true },
  })
  if (existing) return existing

  return db.cart.create({
    data: { userId },
    include: { items: true },
  })
}
