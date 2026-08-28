import type { Control } from 'react-hook-form'
import { FormField } from './FormField'
import { formatPhone } from './formatters'
import type { CheckoutFormValues } from './schema'

export function ShippingAddressFields({ control }: { control: Control<CheckoutFormValues> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField control={control} name="firstName" label="First Name" autoComplete="given-name" placeholder="Alex" />
      <FormField control={control} name="lastName" label="Last Name" autoComplete="family-name" placeholder="Vesper" />
      <FormField
        control={control}
        name="street"
        label="Street Address"
        className="sm:col-span-2"
        autoComplete="street-address"
        placeholder="1042 Cybernetic Way"
      />
      <FormField control={control} name="city" label="City" autoComplete="address-level2" placeholder="Neo-Metropolis" />
      <FormField control={control} name="state" label="State / Province" autoComplete="address-level1" placeholder="CA" />
      <FormField control={control} name="zip" label="Zip / Postal Code" autoComplete="postal-code" placeholder="94016" />
      <FormField
        control={control}
        name="email"
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="alex@modux.design"
      />
      <FormField
        control={control}
        name="phone"
        label="Phone Number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+1 (555) 010-2947"
        transform={formatPhone}
      />
    </div>
  )
}
