import clsx from 'clsx'

type ModuxLoaderProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Screen-reader label; no visible text by default */
  label?: string
}

const sizeMap = {
  sm: 'h-12 w-12',
  md: 'h-20 w-20',
  lg: 'h-28 w-28',
} as const

const cubeSize = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
} as const

export function ModuxLoader({ size = 'md', className, label = 'Loading' }: ModuxLoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      className={clsx('relative flex items-center justify-center', sizeMap[size], className)}
    >
      {/* ambient glow */}
      <div className="loader-glow absolute inset-0 rounded-full bg-primary-3/25 blur-2xl" />

      {/* outer orbit ring */}
      <div className="loader-orbit absolute inset-0 rounded-full border border-dashed border-primary-3/25" />
      <div className="loader-orbit-rev absolute inset-[12%] rounded-full border border-primary/20" />

      {/* orbital nodes */}
      <span className="loader-node loader-node-a absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary-2 shadow-[0_0_10px_rgba(192,132,252,0.9)]" />
      <span className="loader-node loader-node-b absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan/80 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />

      {/* modular core — 4 charm blocks */}
      <div
        className={clsx(
          'relative z-10 grid grid-cols-2 gap-[3px] rounded-md border border-white/10 bg-panel/80 p-[3px] shadow-[0_0_24px_rgba(124,58,237,0.35)] backdrop-blur-sm',
          size === 'sm' && 'gap-[2px] p-[2px]',
        )}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={clsx(
              'loader-cube rounded-[2px] bg-gradient-to-br from-primary-2 to-primary-3',
              cubeSize[size],
            )}
            style={{ animationDelay: `${i * 0.14}s` }}
          />
        ))}
      </div>

      {/* scan sweep */}
      <div className="loader-scan pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <div className="loader-scan-line absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary-2/70 to-transparent" />
      </div>
    </div>
  )
}
