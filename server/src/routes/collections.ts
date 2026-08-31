import type { FastifyInstance } from 'fastify'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { createCollectionSchema } from '../schemas/domain.js'
import { requireSessionUser } from '../utils/session.js'
import { HttpError } from '../utils/http-error.js'
import { toCollectionDto } from '../services/serializers.js'
import { toInputJson } from '../utils/json.js'

export async function collectionRoutes(app: FastifyInstance) {
  app.get('/api/collections', async (request) => {
    const user = await requireSessionUser(request)
    const rows = await prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    })
    return { collections: rows.map(toCollectionDto) }
  })

  app.post('/api/collections', async (request) => {
    const user = await requireSessionUser(request)
    const body = createCollectionSchema.parse(request.body)

    const existing = await prisma.collection.findFirst({
      where: {
        userId: user.id,
        name: { equals: body.name, mode: 'insensitive' },
      },
      select: { id: true },
    })

    if (existing) {
      throw new HttpError(409, 'You already have a build with that name')
    }

    try {
      const collection = await prisma.collection.create({
        data: {
          userId: user.id,
          name: body.name,
          partsJson: toInputJson(body.partsJson),
          snapshotKey: body.snapshotKey,
        },
      })

      return { collection: toCollectionDto(collection) }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new HttpError(409, 'You already have a build with that name')
      }
      throw error
    }
  })

  app.delete('/api/collections/:id', async (request) => {
    const user = await requireSessionUser(request)
    const { id } = request.params as { id: string }

    const deleted = await prisma.collection.deleteMany({
      where: { id, userId: user.id },
    })

    if (deleted.count === 0) {
      throw new HttpError(404, 'Collection not found')
    }

    return { ok: true }
  })
}
