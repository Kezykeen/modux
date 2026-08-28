import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CommerceLayout } from '@/widgets'
import { useAuth } from '@/features/auth'
import { useCart } from '../context/CartContext'
import { CheckoutForm } from '../checkout/CheckoutForm'

export function CheckoutPage() {
  const { isAuthenticated, user } = useAuth()
  const { items, lastOrder } = useCart()
  const [placing, setPlacing] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />
  }

  // placeOrder clears the cart — hold the page until confirmation navigation finishes
  if (items.length === 0 && !placing) {
    return <Navigate to={lastOrder ? '/order-confirmation' : '/cart'} replace />
  }

  return (
    <CommerceLayout>
      <CheckoutForm defaultEmail={user?.email} onPlacingChange={setPlacing} />
    </CommerceLayout>
  )
}
