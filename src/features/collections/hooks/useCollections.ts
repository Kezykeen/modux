import { listCollections, createCollection, deleteCollection } from '@/lib/api/collections'
import { ApiError } from '@/lib/api/client'
import type { CollectionDto } from '@/lib/api/types'
import { uploadSnapshot } from '@/lib/api/uploads'
import { cachedQuery, invalidateCache } from '@/lib/cache/query-cache'
import { toast } from '@/shared/components'
import { useAuth } from '@/features/auth'
import { useCallback, useEffect, useRef, useState } from 'react'

const CACHE_KEY = 'collections'

export function useCollections() {
  const { isAuthenticated } = useAuth()
  const [collections, setCollections] = useState<CollectionDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingIds, setDeletingIds] = useState<ReadonlySet<string>>(new Set())
  const deletingRef = useRef(new Set<string>())

  const refresh = useCallback(
    async (force = false) => {
      if (!isAuthenticated) {
        setCollections([])
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const { collections: rows } = await cachedQuery(
          CACHE_KEY,
          listCollections,
          60_000,
          { force },
        )
        setCollections(rows)
      } catch {
        const message = 'Could not load collections.'
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated],
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(
    async (name: string, partsJson: Record<string, unknown>, snapshotDataUrl?: string) => {
      try {
        let snapshotKey: string | undefined
        if (snapshotDataUrl) {
          const uploaded = await uploadSnapshot(snapshotDataUrl)
          snapshotKey = uploaded.snapshotKey
        }
        const { collection } = await createCollection({
          name,
          partsJson,
          snapshotKey,
        })
        invalidateCache(CACHE_KEY)
        setCollections((prev) => [collection, ...prev])
        toast.success(`"${name}" saved to your collection`)
        return collection
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          toast.error(err.message)
        } else {
          toast.error('Could not save build. Please try again.')
        }
        throw new Error('save failed')
      }
    },
    [],
  )

  const remove = useCallback(
    async (id: string) => {
      if (deletingRef.current.has(id)) return
      deletingRef.current.add(id)
      setDeletingIds(new Set(deletingRef.current))

      setCollections((prev) => prev.filter((c) => c.id !== id))

      try {
        await deleteCollection(id)
        invalidateCache(CACHE_KEY)
        toast.success('Build removed from collection')
      } catch {
        await refresh(true)
        toast.error('Could not delete build. Please try again.')
      } finally {
        deletingRef.current.delete(id)
        setDeletingIds(new Set(deletingRef.current))
      }
    },
    [refresh],
  )

  return { collections, isLoading, error, deletingIds, refresh, save, remove }
}
