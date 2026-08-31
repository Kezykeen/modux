import { type ReactNode } from 'react'
import { useAuth } from '@/features/auth'
import { PageLoader } from '@/shared/components'

/** Blocks the app until the initial session check completes. */
export function SessionGate({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader fullscreen label="Loading session" />
  }

  return children
}
