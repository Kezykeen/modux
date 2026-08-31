import { createAuthClient } from 'better-auth/react'
import { API_BASE } from '@/lib/api/config'

export const authClient = createAuthClient({
  baseURL: API_BASE || undefined,
})

export const CLIENT_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
