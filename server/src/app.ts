import Fastify from 'fastify'
import cors from '@fastify/cors'
import { ZodError } from 'zod'
import { env } from './config/env.js'
import { HttpError } from './utils/http-error.js'
import { healthRoutes } from './routes/health.js'
import { authRoutes } from './routes/auth.js'
import { collectionRoutes } from './routes/collections.js'
import { cartRoutes } from './routes/cart.js'
import { orderRoutes } from './routes/orders.js'
import { uploadRoutes } from './routes/uploads.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  })

  await app.register(cors, {
    origin: env.CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: error.message })
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Invalid request',
        details: error.issues.map((i) => ({ path: i.path, message: i.message })),
      })
    }

    app.log.error(error)
    return reply.status(500).send({ error: 'Internal server error' })
  })

  await app.register(healthRoutes)
  await app.register(authRoutes)
  await app.register(collectionRoutes)
  await app.register(cartRoutes)
  await app.register(orderRoutes)
  await app.register(uploadRoutes)

  return app
}
