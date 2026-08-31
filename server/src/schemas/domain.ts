import { z } from 'zod'

export const raritySchema = z.enum(['common', 'rare', 'epic', 'legendary'])

export const shippingMethodSchema = z.enum(['standard', 'express'])

export const shippingAddressSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  street: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  zip: z.string().trim().min(1),
  email: z.email(),
  phone: z.string().trim().min(1),
})

export const cartItemInputSchema = z.object({
  name: z.string().trim().min(1),
  rarity: raritySchema,
  price: z.number().positive(),
  quantity: z.int().positive(),
  partCount: z.int().positive(),
  partNames: z.array(z.string()),
  snapshotKey: z.string().trim().min(1).optional(),
})

export const syncCartSchema = z.object({
  promoCode: z.string().trim().min(1).nullable().optional(),
  shippingMethod: shippingMethodSchema.optional(),
  items: z.array(cartItemInputSchema),
})

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  partsJson: z.record(z.string(), z.unknown()),
  snapshotKey: z.string().trim().min(1).optional(),
})

export const placeOrderSchema = z.object({
  address: shippingAddressSchema,
})

export const uploadSnapshotSchema = z.object({
  image: z.string().min(1),
})
