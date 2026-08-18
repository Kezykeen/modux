import { motion } from 'motion/react'
import { playClickSfx } from '../audio/uiSfx'

interface SegmentedToggleProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  layoutId: string
  className?: string
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  className = '',
}: SegmentedToggleProps<T>) {
  return (
    <div className={`inline-flex items-center gap-0.5 rounded-full border border-white/8 bg-white/[0.03] p-1 ${className}`}>
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => {
              playClickSfx()
              onChange(opt.value)
            }}
            className={`relative rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold tracking-wide whitespace-nowrap transition-colors ${
              isActive ? 'text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-3 to-primary shadow-[0_0_16px_rgba(168,85,247,0.5)]"
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
