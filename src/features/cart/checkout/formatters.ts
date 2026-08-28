import { AsYouType } from 'libphonenumber-js'

const digits = (v: string) => v.replace(/\D/g, '')

export function formatCardNumber(value: string) {
  return digits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
}

export function formatExpiry(value: string) {
  const d = digits(value).slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`
}

export function formatCvv(value: string) {
  return digits(value).slice(0, 4)
}

export function formatPhone(value: string) {
  return new AsYouType('US').input(value)
}
