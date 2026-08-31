import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  AuthCard,
  AuthShell,
  FieldLabel,
  TextInput,
} from '../components/AuthShell'
import { playClickSfx } from '@/audio'
import { PrimaryLoadingButton } from '@/shared/components'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/customize'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.')
      return
    }
    setSubmitting(true)
    const result = await login(email.trim(), password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    playClickSfx()
    navigate(from, { replace: true })
  }

  return (
    <AuthShell>
      <AuthCard>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-3/15 text-primary-2 shadow-[0_0_24px_rgba(124,58,237,0.35)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-[13px] text-muted">
            Enter your credentials to enter the design workshop
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <TextInput
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="e.g. kenjiro@modux.design"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="login-password"
              trailing={
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-primary-2 hover:text-primary"
                >
                  Forgot Password?
                </Link>
              }
            >
              Password
            </FieldLabel>
            <div className="relative">
              <TextInput
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-red-400" role="alert">
              {error}
            </p>
          )}

          <PrimaryLoadingButton type="submit" loading={submitting} loadingLabel="Signing in…">
            Sign In
            <ArrowRight className="h-3.5 w-3.5" />
          </PrimaryLoadingButton>
        </form>

        <p className="mt-6 pt-1 text-center text-[12px] text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/signup" state={{ from }} className="font-bold text-primary-2 hover:text-primary">
            Sign Up
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  )
}
