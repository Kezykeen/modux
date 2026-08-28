import { motion } from 'motion/react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { Control } from 'react-hook-form'
import { FormField, FieldError, antifillProps } from './FormField'
import { formatCardNumber, formatCvv, formatExpiry } from './formatters'
import type { CheckoutFormValues, PaymentTab } from './schema'

const TABS: [PaymentTab, string][] = [
  ['card', 'Credit Card'],
  ['crypto', 'CrypPay / Web3 Wallet'],
]

export function PaymentFields({
  control,
  paymentTab,
  paymentDeclined,
  paymentTabError,
  onTabChange,
}: {
  control: Control<CheckoutFormValues>
  paymentTab: PaymentTab
  paymentDeclined: boolean
  paymentTabError?: string
  onTabChange: (tab: PaymentTab) => void
}) {
  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`rounded-xl border px-3 py-2.5 text-xs font-bold tracking-wide uppercase transition-all ${
              paymentTab === id
                ? 'border-primary text-primary-2'
                : 'border-white/8 text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <FieldError message={paymentTabError} />

      {paymentTab === 'card' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="cardName"
            label="Cardholder Name"
            className="sm:col-span-2"
            placeholder="Alex Vesper"
            errorOverride={paymentDeclined}
            {...antifillProps}
          />
          <FormField
            control={control}
            name="cardNumber"
            label="Card Number"
            className="sm:col-span-2"
            inputMode="numeric"
            placeholder="ACCT-000015"
            transform={formatCardNumber}
            errorOverride={paymentDeclined}
            {...antifillProps}
          />
          <FormField
            control={control}
            name="expiry"
            label="Expiration Date"
            inputMode="numeric"
            placeholder="MM/YY"
            transform={formatExpiry}
            errorOverride={paymentDeclined}
            {...antifillProps}
          />
          <FormField
            control={control}
            name="cvv"
            label="CVV"
            inputMode="numeric"
            placeholder="123"
            maxLength={4}
            transform={formatCvv}
            errorOverride={paymentDeclined}
            {...antifillProps}
          />
          {paymentDeclined && (
            <motion.p
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="sm:col-span-2 flex items-center gap-2 text-sm text-red-400"
            >
              <AlertTriangle className="h-4 w-4" />
              Card was declined. Try another method.
            </motion.p>
          )}
          <p className="sm:col-span-2 text-[11px] text-muted-2">
            Tip: use card <span className="text-muted">4242 4242 4242 4242</span> to succeed, or{' '}
            <span className="text-muted">4000 0000 0000 0002</span> to see the decline state.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-primary-3/40 bg-primary-3/5 p-6 text-center">
          <p className="text-sm text-muted">
            Connect a wallet to pay with CrypPay. For this demo, switch back to Credit Card to
            complete checkout.
          </p>
        </div>
      )}

      {paymentDeclined && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-3 px-6 py-3 text-sm font-bold tracking-wide text-white uppercase shadow-[0_0_24px_rgba(124,58,237,0.4)] hover:bg-primary"
          >
            Try Again
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onTabChange('crypto')}
            className="text-xs font-semibold text-muted hover:text-primary-2"
          >
            Use a different payment method
          </button>
        </div>
      )}
    </>
  )
}
