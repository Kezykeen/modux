import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'
import { uploadSnapshotSchema } from '../schemas/domain.js'
import { requireSessionUser } from '../utils/session.js'
import { HttpError } from '../utils/http-error.js'
import { snapshotUrl } from '../utils/snapshot-url.js'
import { extensionForMime, parseImageDataUrl } from '../utils/data-url.js'
import { assertSnapshotAccess, snapshotKeyForUser, storage } from '../services/storage.js'

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/api/uploads/snapshot', async (request) => {
    const user = await requireSessionUser(request)
    const { image } = uploadSnapshotSchema.parse(request.body)

    const { buffer, contentType } = parseImageDataUrl(image)
    if (buffer.length > env.MAX_SNAPSHOT_BYTES) {
      throw new HttpError(400, 'Image too large')
    }

    const key = snapshotKeyForUser(user.id, extensionForMime(contentType))
    await storage.put(key, buffer, contentType)

    return {
      snapshotKey: key,
      url: snapshotUrl(key),
    }
  })

  app.get('/api/assets/*', async (request, reply) => {
    const user = await requireSessionUser(request)
    const key = (request.params as { '*': string })['*']

    if (!key) {
      throw new HttpError(404, 'Not found')
    }

    try {
      assertSnapshotAccess(key, user.id)
    } catch {
      throw new HttpError(403, 'Forbidden')
    }

    const object = await storage.get(key)
    if (!object) {
      throw new HttpError(404, 'Not found')
    }

    reply.header('Content-Type', object.contentType)
    reply.header('Cache-Control', 'private, max-age=3600')
    return reply.send(object.body)
  })
}
