import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface AuthUser {
  name: string
  email: string
}

interface AuthContextValue {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (user?: Partial<AuthUser>) => void
  signUp: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_KEY = 'modux-auth'
const USER_KEY = 'modux-user'

function readStoredAuth(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStoredAuth)
  const [user, setUser] = useState<AuthUser | null>(readUser)

  const persist = useCallback((value: boolean, nextUser: AuthUser | null) => {
    setIsAuthenticated(value)
    setUser(nextUser)
    try {
      if (value) {
        localStorage.setItem(AUTH_KEY, '1')
        if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      } else {
        localStorage.removeItem(AUTH_KEY)
        localStorage.removeItem(USER_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const login = useCallback(
    (partial?: Partial<AuthUser>) => {
      const next: AuthUser = {
        name: partial?.name || user?.name || 'Alex Vesper',
        email: partial?.email || user?.email || 'alex@modux.design',
      }
      persist(true, next)
    },
    [persist, user],
  )

  const signUp = useCallback(
    (next: AuthUser) => {
      persist(true, next)
    },
    [persist],
  )

  const logout = useCallback(() => persist(false, null), [persist])

  const value = useMemo(
    () => ({ isAuthenticated, user, login, signUp, logout }),
    [isAuthenticated, user, login, signUp, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
