import { apiRequest } from './client'
import type { CartResponse, SyncCartBody } from './types'

export function getCart() {
  return apiRequest<CartResponse>('/api/cart')
}

export function syncCart(body: SyncCartBody) {
  return apiRequest<CartResponse>('/api/cart', { method: 'PUT', body })
}
