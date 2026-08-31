import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  /** Shown alongside spinner when loading; falls back to children */
  loadingLabel?: string
  spinnerSize?: 'xs' | 'sm' | 'md'
  children: ReactNode
}

export function LoadingButton({
  loading = false,
  loadingLabel,
  spinnerSize = 'sm',
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  const label = loading && loadingLabel ? loadingLabel : children

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-70',
        loading && 'relative',
        className,
      )}
      {...props}
    >
      {loading && (
        <Spinner
          size={spinnerSize}
          className={clsx(
            spinnerSize === 'xs' && 'border-white/30 border-t-white',
          )}
        />
      )}
      <span className={clsx('inline-flex items-center gap-2', loading && 'opacity-95')}>
        {label}
      </span>
    </button>
  )
}

/** Primary CTA styling used across auth + checkout flows */
export function PrimaryLoadingButton({
  loading = false,
  loadingLabel,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <LoadingButton
      loading={loading}
      loadingLabel={loadingLabel}
      spinnerSize="sm"
      className={clsx(
        'mt-1 flex w-full rounded-xl bg-primary-3 py-3.5 text-sm font-bold tracking-wide text-white uppercase shadow-[0_0_28px_rgba(124,58,237,0.45)] transition-all hover:bg-primary disabled:opacity-70',
        className,
      )}
      {...props}
    >
      {children}
    </LoadingButton>
  )
}
