import { z } from 'zod'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import type { ShippingAddress } from '../context/CartContext'

const digits = (v: string) => v.replace(/\D/g, '')

const required = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

function isFutureExpiry(value: string) {
  const d = digits(value)
  if (d.length !== 4) return false
  const month = Number(d.slice(0, 2))
  const year = Number(d.slice(2))
  if (month < 1 || month > 12) return false
  const now = new Date()
  const yy = now.getFullYear() % 100
  const mm = now.getMonth() + 1
  return year > yy || (year === yy && month >= mm)
}

export const checkoutSchema = z
  .object({
    firstName: required('First name'),
    lastName: required('Last name'),
    street: required('Street address'),
    city: required('City'),
    state: required('State / province'),
    zip: required('ZIP / postal code').refine(
      (v) => digits(v).length >= 4,
      'Enter a valid ZIP / postal code',
    ),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    phone: z
      .string()
      .trim()
      .min(1, 'Phone number is required')
      .refine((value) => parsePhoneNumberFromString(value, 'US')?.isValid() ?? false, {
        message: 'Enter a valid phone number',
      }),
    paymentTab: z.enum(['card', 'crypto']),
    cardName: z.string(),
    cardNumber: z.string(),
    expiry: z.string(),
    cvv: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentTab !== 'card') {
      ctx.addIssue({
        code: 'custom',
        path: ['paymentTab'],
        message: 'Switch to Credit Card to complete checkout',
      })
      return
    }

    if (!data.cardName.trim()) {
      ctx.addIssue({ code: 'custom', path: ['cardName'], message: 'Cardholder name is required' })
    }

    const pan = digits(data.cardNumber)
    if (!pan) {
      ctx.addIssue({ code: 'custom', path: ['cardNumber'], message: 'Card number is required' })
    } else if (pan.length < 15 || pan.length > 16) {
      ctx.addIssue({ code: 'custom', path: ['cardNumber'], message: 'Enter a valid card number' })
    }

    if (!data.expiry.trim()) {
      ctx.addIssue({ code: 'custom', path: ['expiry'], message: 'Expiration is required' })
    } else if (!isFutureExpiry(data.expiry)) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiry'],
        message: 'Enter a valid future date (MM/YY)',
      })
    }

    if (!data.cvv.trim()) {
      ctx.addIssue({ code: 'custom', path: ['cvv'], message: 'CVV is required' })
    } else if (digits(data.cvv).length < 3) {
      ctx.addIssue({ code: 'custom', path: ['cvv'], message: 'CVV must be 3–4 digits' })
    }
  })

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
export type PaymentTab = CheckoutFormValues['paymentTab']

export const DECLINE_CARD = '4000000000000002'

export function isDeclinedCard(cardNumber: string) {
  return digits(cardNumber) === DECLINE_CARD
}

export function toShippingAddress(values: CheckoutFormValues): ShippingAddress {
  const { firstName, lastName, street, city, state, zip, email, phone } = values
  return { firstName, lastName, street, city, state, zip, email, phone }
}

export function defaultCheckoutValues(email = ''): CheckoutFormValues {
  return {
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    email,
    phone: '',
    paymentTab: 'card',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  }
}
