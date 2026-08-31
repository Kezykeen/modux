import clsx from 'clsx'
import { ModuxLoader } from './ModuxLoader'

type PageLoaderProps = {
  /** Screen-reader label */
  label?: string
  /** Show a subtle branded caption under the loader */
  showLabel?: boolean
  className?: string
  compact?: boolean
  fullscreen?: boolean
}

/** App-wide loading indicator — use for session bootstrap, lazy routes, etc. */
export function PageLoader({
  label = 'Loading',
  showLabel = false,
  className,
  compact = false,
  fullscreen = false,
}: PageLoaderProps) {
  const content = (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 py-10' : 'gap-4 py-20',
      )}
    >
      <ModuxLoader size={fullscreen ? 'lg' : 'md'} label={label} />
      {showLabel && (
        <p className="font-display text-[11px] font-bold tracking-[0.35em] text-primary-2/80 uppercase">
          {label}
        </p>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div
        className={clsx(
          'bg-noise flex min-h-dvh items-center justify-center bg-void',
          className,
        )}
      >
        {content}
      </div>
    )
  }

  return <div className={className}>{content}</div>
}
