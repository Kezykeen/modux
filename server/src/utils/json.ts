import type { Prisma } from '@prisma/client'

/** Cast validated JSON payloads to Prisma's input type without sharing frontend types. */
export function toInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}
