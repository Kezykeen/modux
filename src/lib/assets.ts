import { API_BASE } from '@/lib/api/config'

export const FALLBACK_SNAPSHOT = '/assets/Renders/Cyber Character.webp'

/** Display URL for a cart/collection/order snapshot. */
export function resolveSnapshotUrl(snapshotUrl: string | null | undefined, fallback = FALLBACK_SNAPSHOT) {
  if (!snapshotUrl) return fallback
  if (snapshotUrl.startsWith('http')) return snapshotUrl
  if (snapshotUrl.startsWith('/')) {
    return API_BASE ? `${API_BASE.replace(/\/$/, '')}${snapshotUrl}` : snapshotUrl
  }
  return snapshotUrl
}
