import clsx from 'clsx'

type SpinnerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClass = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-[1.5px]',
  md: 'h-5 w-5 border-2',
  lg: 'h-10 w-10 border-2',
} as const

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block shrink-0 animate-spin rounded-full border-primary-3/25 border-t-primary',
        sizeClass[size],
        className,
      )}
    />
  )
}
