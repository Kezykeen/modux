import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from '@/features/landing'
import { LoginPage, SignupPage } from '@/features/auth'
import {
  CartPage,
  CheckoutPage,
  OrderConfirmationPage,
} from '@/features/cart'

const BuilderPage = lazy(() =>
  import('@/features/builder/pages/BuilderPage').then((m) => ({
    default: m.BuilderPage,
  })),
)

function BuilderFallback() {
  return (
    <div className="bg-noise flex min-h-dvh items-center justify-center bg-void">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-3/30 border-t-primary" />
        <p className="text-sm text-muted">Loading customizer…</p>
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
      <Route
        path="/customize"
        element={
          <Suspense fallback={<BuilderFallback />}>
            <BuilderPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
