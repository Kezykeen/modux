import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Check } from 'lucide-react'

interface DropdownProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Dropdown({ label, options, value, onChange, className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
          open
            ? 'border-primary-3/60 bg-primary/10 text-white'
            : 'border-white/8 bg-white/[0.03] text-muted hover:border-white/20 hover:text-ink'
        }`}
      >
        <span className="truncate">
          <span className="text-muted-2">{label}: </span>
          {value}
        </span>
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-primary-2' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(100%+6px)] left-0 z-30 min-w-full overflow-hidden rounded-xl border border-white/10 bg-panel-2/95 p-1 shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(168,85,247,0.15)] backdrop-blur-xl"
          >
            {options.map((opt, i) => (
              <motion.button
                key={opt}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] whitespace-nowrap transition-colors ${
                  opt === value ? 'bg-primary/15 text-white' : 'text-muted hover:bg-white/5 hover:text-ink'
                }`}
              >
                {opt}
                {opt === value && <Check className="h-3 w-3 text-primary-2" />}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
