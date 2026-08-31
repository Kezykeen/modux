import type { FastifyRequest } from 'fastify'
import { fromNodeHeaders } from 'better-auth/node'
import { auth, type SessionUser } from '../lib/auth.js'
import { HttpError } from './http-error.js'

export async function getSessionUser(request: FastifyRequest): Promise<SessionUser | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  })
  return session?.user ?? null
}

export async function requireSessionUser(request: FastifyRequest): Promise<SessionUser> {
  const user = await getSessionUser(request)
  if (!user) {
    throw new HttpError(401, 'Unauthorized')
  }
  return user
}
