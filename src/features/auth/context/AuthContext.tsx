import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { authClient, CLIENT_ORIGIN } from '@/lib/auth/client'
import { clearCache } from '@/lib/cache/query-cache'

export interface AuthUser {
  id: string
  name: string
  email: string
  image?: string | null
}

type AuthResult = { ok: true } | { ok: false; error: string }

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  login: (email: string, password: string) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<AuthResult>
  resetPassword: (newPassword: string, token: string) => Promise<AuthResult>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapUser(
  sessionUser: { id: string; name: string; email: string; image?: string | null },
): AuthUser {
  return {
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    image: sessionUser.image,
  }
}

function errorMessage(error: { message?: string } | null | undefined, fallback: string) {
  return error?.message?.trim() || fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, refetch } = authClient.useSession()

  const user = session?.user ? mapUser(session.user) : null
  const isAuthenticated = Boolean(user)

  const refreshSession = useCallback(async () => {
    await refetch()
  }, [refetch])

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { error } = await authClient.signIn.email({ email, password })
      if (error) {
        return { ok: false, error: errorMessage(error, 'Sign in failed.') }
      }
      await refetch()
      return { ok: true }
    },
    [refetch],
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const { error } = await authClient.signUp.email({ name, email, password })
      if (error) {
        return { ok: false, error: errorMessage(error, 'Sign up failed.') }
      }
      await refetch()
      return { ok: true }
    },
    [refetch],
  )

  const logout = useCallback(async () => {
    await authClient.signOut()
    clearCache()
    await refetch()
  }, [refetch])

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${CLIENT_ORIGIN}/reset-password`,
    })
    if (error) {
      return { ok: false, error: errorMessage(error, 'Could not send reset email.') }
    }
    return { ok: true }
  }, [])

  const resetPassword = useCallback(
    async (newPassword: string, token: string): Promise<AuthResult> => {
      const { error } = await authClient.resetPassword({ newPassword, token })
      if (error) {
        return { ok: false, error: errorMessage(error, 'Could not reset password.') }
      }
      await refetch()
      return { ok: true }
    },
    [refetch],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading: isPending,
      user,
      login,
      signUp,
      logout,
      requestPasswordReset,
      resetPassword,
      refreshSession,
    }),
    [
      isAuthenticated,
      isPending,
      user,
      login,
      signUp,
      logout,
      requestPasswordReset,
      resetPassword,
      refreshSession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
