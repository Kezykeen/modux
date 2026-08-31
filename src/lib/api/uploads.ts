import { apiRequest } from './client'

export type UploadSnapshotResponse = {
  snapshotKey: string
  url: string
}

export function uploadSnapshot(image: string) {
  return apiRequest<UploadSnapshotResponse>('/api/uploads/snapshot', {
    method: 'POST',
    body: { image },
  })
}
