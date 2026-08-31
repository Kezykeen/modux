import { apiRequest } from './client'
import type { OrderDto, ShippingAddressDto } from './types'

export function listOrders() {
  return apiRequest<{ orders: OrderDto[] }>('/api/orders')
}

export function getOrder(id: string) {
  return apiRequest<{ order: OrderDto }>(`/api/orders/${id}`)
}

export function placeOrder(address: ShippingAddressDto) {
  return apiRequest<{ order: OrderDto }>('/api/orders', {
    method: 'POST',
    body: { address },
  })
}
