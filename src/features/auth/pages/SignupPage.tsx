import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  AuthCard,
  AuthShell,
  FieldLabel,
  TextInput,
} from '../components/AuthShell'
import { playClickSfx } from '@/audio'
import { PrimaryLoadingButton } from '@/shared/components'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/customize'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Fill in all fields to create your account.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    const result = await signUp(name.trim(), email.trim(), password)
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
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">Create Account</h1>
          <p className="text-[13px] text-muted">Sign up to access the design workshop</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
            <TextInput
              id="signup-name"
              autoComplete="name"
              placeholder="e.g. Kenjiro Sato"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="signup-email">Email Address</FieldLabel>
            <TextInput
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="e.g. kenjiro@modux.design"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <div className="relative">
              <TextInput
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
            <p className="mt-1 text-[11px] text-muted-2">At least 8 characters</p>
          </div>
          <div>
            <FieldLabel htmlFor="signup-confirm">Confirm Password</FieldLabel>
            <div className="relative">
              <TextInput
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-red-400" role="alert">
              {error}
            </p>
          )}

          <PrimaryLoadingButton type="submit" loading={submitting} loadingLabel="Creating account…">
            Sign Up
            <ArrowRight className="h-3.5 w-3.5" />
          </PrimaryLoadingButton>
        </form>

        <p className="mt-6 pt-1 text-center text-[13px] text-muted">
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="font-bold text-primary-2 hover:text-primary">
            Sign In
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  )
}
