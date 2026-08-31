import type { FastifyInstance } from 'fastify'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../lib/auth.js'
import { env } from '../config/env.js'

export async function authRoutes(app: FastifyInstance) {
  app.route({
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    url: '/api/auth/*',
    async handler(request, reply) {
      const url = new URL(request.url, env.BETTER_AUTH_URL)
      const headers = fromNodeHeaders(request.headers)

      const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
      const body = hasBody && request.body !== undefined ? JSON.stringify(request.body) : undefined

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body,
      })

      const response = await auth.handler(req)

      reply.status(response.status)
      response.headers.forEach((value, key) => {
        reply.header(key, value)
      })

      const text = await response.text()
      return reply.send(text.length ? text : null)
    },
  })
}
