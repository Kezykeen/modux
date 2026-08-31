type CacheEntry<T> = {
  data: T
  fetchedAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export const CACHE_TTL = {
  short: 30_000,
  default: 60_000,
  long: 5 * 60_000,
} as const

export function readCache<T>(key: string, ttlMs: number): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > ttlMs) {
    store.delete(key)
    return null
  }
  return entry.data as T
}

export function writeCache<T>(key: string, data: T) {
  store.set(key, { data, fetchedAt: Date.now() })
}

export function invalidateCache(keyOrPattern: string | RegExp) {
  if (typeof keyOrPattern === 'string') {
    store.delete(keyOrPattern)
    return
  }
  for (const key of store.keys()) {
    if (keyOrPattern.test(key)) store.delete(key)
  }
}

export function clearCache() {
  store.clear()
}

export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = CACHE_TTL.default,
  { force = false }: { force?: boolean } = {},
): Promise<T> {
  if (!force) {
    const hit = readCache<T>(key, ttlMs)
    if (hit !== null) return hit
  }
  const data = await fetcher()
  writeCache(key, data)
  return data
}
