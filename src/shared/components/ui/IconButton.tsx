import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { playClickSfx } from '@/audio'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  active?: boolean
  label: string
}

export function IconButton({
  children,
  active,
  label,
  className = '',
  onClick,
  ...rest
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={(event) => {
        playClickSfx()
        onClick?.(event)
      }}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 disabled:pointer-events-none disabled:opacity-35 ${
        active
          ? 'border-primary-3/60 bg-primary/15 text-primary-2 shadow-[0_0_16px_rgba(168,85,247,0.4)]'
          : 'border-white/8 bg-white/[0.03] text-muted hover:border-white/20 hover:text-ink'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
