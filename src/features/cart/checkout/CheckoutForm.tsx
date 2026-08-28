import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle } from 'lucide-react'
import { playClickSfx } from '@/audio'
import { useCart } from '../context/CartContext'
import { SectionCard } from './FormField'
import { ShippingAddressFields } from './ShippingAddressFields'
import { ShippingMethodPicker } from './ShippingMethodPicker'
import { PaymentFields } from './PaymentFields'
import { OrderSummaryPanel } from './OrderSummaryPanel'
import {
  checkoutSchema,
  defaultCheckoutValues,
  isDeclinedCard,
  toShippingAddress,
  type CheckoutFormValues,
  type PaymentTab,
} from './schema'

type Props = {
  defaultEmail?: string
  onPlacingChange?: (placing: boolean) => void
}

export function CheckoutForm({ defaultEmail, onPlacingChange }: Props) {
  const navigate = useNavigate()
  const { shippingMethod, setShippingMethod, placeOrder } = useCart()
  const [paymentDeclined, setPaymentDeclined] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: defaultCheckoutValues(defaultEmail),
  })

  const paymentTab = watch('paymentTab')

  const onValid = async (values: CheckoutFormValues) => {
    setPaymentDeclined(false)

    if (isDeclinedCard(values.cardNumber)) {
      setPaymentDeclined(true)
      return
    }

    onPlacingChange?.(true)
    playClickSfx()

    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        placeOrder(toShippingAddress(values))
        navigate('/order-confirmation', { replace: true })
        resolve()
      }, 500)
    })
  }

  const switchTab = (tab: PaymentTab) => {
    setPaymentDeclined(false)
    clearErrors(['cardName', 'cardNumber', 'expiry', 'cvv', 'paymentTab'])
    setValue('paymentTab', tab)
  }

  return (
    <>
      <AnimatePresence>
        {paymentDeclined && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
            role="alert"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Payment couldn&apos;t be processed. Card was declined — try another method.
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={handleSubmit(onValid)}
        autoComplete="off"
        className="grid gap-8 lg:grid-cols-[1fr_360px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input type="text" name="prevent_autofill" className="hidden" tabIndex={-1} autoComplete="off" />

        <div className="flex flex-col gap-8">
          <SectionCard step={1} title="Shipping Address">
            <ShippingAddressFields control={control} />
          </SectionCard>

          <SectionCard step={2} title="Shipping Method">
            <ShippingMethodPicker value={shippingMethod} onChange={setShippingMethod} />
          </SectionCard>

          <SectionCard step={3} title="Payment Details">
            <PaymentFields
              control={control}
              paymentTab={paymentTab}
              paymentDeclined={paymentDeclined}
              paymentTabError={errors.paymentTab?.message}
              onTabChange={switchTab}
            />
          </SectionCard>
        </div>

        <OrderSummaryPanel submitting={isSubmitting} />
      </motion.form>
    </>
  )
}
