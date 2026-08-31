import type { Decimal } from '@prisma/client/runtime/library'

export function decimalToNumber(value: Decimal): number {
  return value.toNumber()
}

export function generateOrderNumber(): string {
  return `#MOD-${Math.floor(20000 + Math.random() * 70000)}`
}

export function estDeliveryDate(method: 'standard' | 'express'): string {
  const days = method === 'express' ? 3 : 7
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
