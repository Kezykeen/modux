import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  AuthCard,
  AuthShell,
  FieldLabel,
  SocialButtons,
  TextInput,
} from '../components/AuthShell'
import { playClickSfx } from '@/audio'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/customize'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const finish = () => {
    playClickSfx()
    login({
      name: email.includes('@') ? email.split('@')[0] : email || 'Alex Vesper',
      email: email.includes('@') ? email : `${email || 'alex'}@modux.design`,
    })
    navigate(from, { replace: true })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.')
      return
    }
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      finish()
    }, 550)
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
            <FieldLabel htmlFor="login-email">Email or Username</FieldLabel>
            <TextInput
              id="login-email"
              autoComplete="username"
              placeholder="e.g. shadow_ninja"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="login-password"
              trailing={
                <button
                  type="button"
                  className="text-[11px] font-semibold text-primary-2 hover:text-primary"
                >
                  Forgot Password?
                </button>
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

          <label className="flex cursor-pointer items-center gap-2 select-none">
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              onClick={() => setRemember((v) => !v)}
              className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                remember
                  ? 'border-primary-3 bg-primary-3 text-white'
                  : 'border-white/20 bg-transparent'
              }`}
            >
              {remember && (
                <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1.5 5.2 3.8 7.5 8.5 2.5" />
                </svg>
              )}
            </button>
            <span className="text-[12px] text-muted">Remember me for 30 days</span>
          </label>

          {error && (
            <p className="text-[12px] text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-3 py-3.5 text-sm font-bold tracking-wide text-white uppercase shadow-[0_0_28px_rgba(124,58,237,0.45)] transition-all hover:bg-primary disabled:opacity-70"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-4">
          <SocialButtons onContinue={finish} />
          <p className="pt-1 text-center text-[12px] text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/signup" state={{ from }} className="font-bold text-primary-2 hover:text-primary">
              Sign Up
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  )
}
