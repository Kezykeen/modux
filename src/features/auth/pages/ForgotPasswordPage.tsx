import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthCard, AuthShell, FieldLabel, TextInput } from '../components/AuthShell'
import { PrimaryLoadingButton } from '@/shared/components'

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }
    setSubmitting(true)
    const result = await requestPasswordReset(email.trim())
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSent(true)
  }

  return (
    <AuthShell>
      <AuthCard>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-3/15 text-primary-2 shadow-[0_0_24px_rgba(124,58,237,0.35)]">
            <Mail className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-[13px] text-muted">
            {sent
              ? 'If an account exists for that email, we sent a reset link.'
              : 'We’ll email you a link to reset your password'}
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col gap-4">
            <p className="text-center text-[13px] leading-relaxed text-muted">
              Check your inbox for <span className="font-semibold text-ink">{email}</span>.
              In local dev, the reset link is printed in the API server console.
            </p>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-panel-3 py-3.5 text-sm font-bold tracking-wide text-ink uppercase transition-colors hover:border-primary-3/40"
            >
              Back to Sign In
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="forgot-email">Email Address</FieldLabel>
              <TextInput
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="e.g. kenjiro@modux.design"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-400" role="alert">
                {error}
              </p>
            )}

            <PrimaryLoadingButton type="submit" loading={submitting} loadingLabel="Sending link…">
              Send Reset Link
              <ArrowRight className="h-3.5 w-3.5" />
            </PrimaryLoadingButton>

            <Link
              to="/login"
              className="text-center text-[12px] font-semibold text-primary-2 hover:text-primary"
            >
              Back to Sign In
            </Link>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  )
}
