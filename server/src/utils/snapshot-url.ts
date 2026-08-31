import { env } from '../config/env.js'

/** Browser-loadable URL/path for a stored snapshot key. */
export function snapshotUrl(key: string | null | undefined): string | null {
  if (!key) return null
  if (env.ASSETS_PUBLIC_URL) {
    return `${env.ASSETS_PUBLIC_URL.replace(/\/$/, '')}/${key}`
  }
  const encoded = key.split('/').map((segment) => encodeURIComponent(segment)).join('/')
  // Relative path — same-origin in prod, or Vite proxy in dev (cookies work on <img>)
  return `/api/assets/${encoded}`
}
