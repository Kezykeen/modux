import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Boxes, Gem, Infinity as InfinityIcon, ArrowRight } from 'lucide-react'
import { SocialLinks } from '@/widgets'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-noise flex min-h-dvh flex-col bg-void">
      <header className="flex h-14 items-center justify-between border-b border-white/5 px-5 sm:px-8">
        <Link to="/" className="group flex flex-col leading-none">
          <span className="font-display text-xl font-bold text-white">
            MODU<span className="text-primary-2">-X</span>
          </span>
        </Link>
        <Link
          to="/"
          className="group flex items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-ink"
        >
          Back to main site
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[420px] w-[520px] animate-pulse-glow rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.28),transparent_65%)] blur-2xl" />
          <div className="absolute h-[280px] w-[280px] rounded-full border border-primary-3/20" />
          <div className="absolute h-[360px] w-[360px] rounded-full border border-primary/10" />
          <div className="absolute h-[440px] w-[440px] rounded-full border border-white/5" />
        </div>
        <motion.div
          className="relative z-10 w-full max-w-[440px]"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="flex flex-col gap-3 border-t border-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-wrap items-center gap-5 text-[11px] font-semibold tracking-wide text-muted uppercase">
          <span className="inline-flex items-center gap-2">
            <Boxes className="h-3.5 w-3.5 text-primary-2" /> Modular Design
          </span>
          <span className="inline-flex items-center gap-2">
            <Gem className="h-3.5 w-3.5 text-primary-2" /> High Quality
          </span>
          <span className="inline-flex items-center gap-2">
            <InfinityIcon className="h-3.5 w-3.5 text-primary-2" /> Endless Possibilities
          </span>
        </div>
        <SocialLinks />
      </footer>
    </div>
  )
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-panel/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-10">
      {children}
    </div>
  )
}

export function FieldLabel({
  children,
  htmlFor,
  trailing,
}: {
  children: ReactNode
  htmlFor?: string
  trailing?: ReactNode
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold tracking-wide text-muted-2 uppercase"
      >
        {children}
      </label>
      {trailing}
    </div>
  )
}

export const TextInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(function TextInput({ id, error, className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      id={id}
      className={`w-full rounded-[10px] border bg-panel-3 px-4 py-3 text-[13px] text-ink outline-none transition-all placeholder:text-muted-2 focus:border-primary-3/70 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)] ${
        error
          ? 'border-red-500/80 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
          : 'border-white/8'
      } ${className}`}
      {...props}
    />
  )
})

export function SocialButtons({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/8" />
        <span className="text-[10px] font-bold tracking-wide text-muted-2 uppercase">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-white/8" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['Google', 'Discord', 'Apple'].map((label) => (
          <button
            key={label}
            type="button"
            onClick={onContinue}
            className="rounded-[10px] border border-white/8 bg-panel-3 py-3 text-[12px] font-semibold text-muted transition-all hover:border-primary-3/40 hover:text-ink"
          >
            {label}
          </button>
        ))}
      </div>
    </>
  )
}
