import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthCard, AuthShell, FieldLabel, TextInput } from '../components/AuthShell'
import { playClickSfx } from '@/audio'
import { PrimaryLoadingButton } from '@/shared/components'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const token = useMemo(() => params.get('token') ?? '', [params])
  const tokenError = params.get('error')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const invalidToken = tokenError === 'INVALID_TOKEN' || !token

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    const result = await resetPassword(password, token)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    playClickSfx()
    navigate('/login', { replace: true })
  }

  return (
    <AuthShell>
      <AuthCard>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-3/15 text-primary-2 shadow-[0_0_24px_rgba(124,58,237,0.35)]">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">New Password</h1>
          <p className="text-[13px] text-muted">Choose a strong password for your account</p>
        </div>

        {invalidToken ? (
          <div className="flex flex-col gap-4">
            <p className="text-center text-[13px] text-red-400" role="alert">
              This reset link is invalid or has expired.
            </p>
            <Link
              to="/forgot-password"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-3 py-3.5 text-sm font-bold tracking-wide text-white uppercase shadow-[0_0_28px_rgba(124,58,237,0.45)] transition-all hover:bg-primary"
            >
              Request a New Link
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="reset-password">New Password</FieldLabel>
              <div className="relative">
                <TextInput
                  id="reset-password"
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
            </div>
            <div>
              <FieldLabel htmlFor="reset-confirm">Confirm Password</FieldLabel>
              <div className="relative">
                <TextInput
                  id="reset-confirm"
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

            <PrimaryLoadingButton type="submit" loading={submitting} loadingLabel="Updating password…">
              Update Password
              <ArrowRight className="h-3.5 w-3.5" />
            </PrimaryLoadingButton>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  )
}
