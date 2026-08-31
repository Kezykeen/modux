import { type ReactNode } from 'react'
import { AuthProvider } from '@/features/auth'
import { CartProvider } from '@/features/cart'
import {
  BuildProvider,
  SnapshotProvider,
  SoundProvider,
} from '@/features/builder'
import { ToastViewport } from '@/shared/components'
import { SessionGate } from './SessionGate'

/**
 * Root composition of app-wide providers.
 * Order matters: auth → cart → builder state → snapshot registry → sound.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <BuildProvider>
          <SnapshotProvider>
            <SoundProvider>
              <SessionGate>
                {children}
              </SessionGate>
              <ToastViewport />
            </SoundProvider>
          </SnapshotProvider>
        </BuildProvider>
      </CartProvider>
    </AuthProvider>
  )
}
