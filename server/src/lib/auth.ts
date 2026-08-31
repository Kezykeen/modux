import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { env } from '../config/env.js'
import { prisma } from './prisma.js'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CLIENT_ORIGIN],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      // Dev: reset link is logged to the API console. Wire a real provider (Resend, etc.) for production.
      if (env.NODE_ENV === 'development') {
        console.info(`[modux] Password reset for ${user.email}:\n  ${url}`)
      }
    },
    onPasswordReset: async ({ user }) => {
      if (env.NODE_ENV === 'development') {
        console.info(`[modux] Password reset completed for ${user.email}`)
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
})

export type SessionUser = typeof auth.$Infer.Session.user
