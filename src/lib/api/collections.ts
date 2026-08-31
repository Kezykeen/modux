import { apiRequest } from './client'
import type { CollectionDto } from './types'

export function listCollections() {
  return apiRequest<{ collections: CollectionDto[] }>('/api/collections')
}

export function createCollection(body: {
  name: string
  partsJson: Record<string, unknown>
  snapshotKey?: string
}) {
  return apiRequest<{ collection: CollectionDto }>('/api/collections', {
    method: 'POST',
    body,
  })
}

export function deleteCollection(id: string) {
  return apiRequest<{ ok: boolean }>(`/api/collections/${id}`, { method: 'DELETE' })
}
