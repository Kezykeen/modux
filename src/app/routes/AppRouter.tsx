import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from '@/features/landing'
import {
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@/features/auth'
import {
  CartPage,
  CheckoutPage,
  OrderConfirmationPage,
} from '@/features/cart'
import { CollectionsPage } from '@/features/collections'
import { OrdersPage, OrderDetailPage } from '@/features/orders'

const BuilderPage = lazy(() =>
  import('@/features/builder/pages/BuilderPage').then((m) => ({
    default: m.BuilderPage,
  })),
)

import { PageLoader } from '@/shared/components'
import { ScrollToTop } from './ScrollToTop'

function BuilderFallback() {
  return <PageLoader fullscreen label="Loading customizer" />
}

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
      <Route path="/collections" element={<CollectionsPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
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
    </>
  )
}
