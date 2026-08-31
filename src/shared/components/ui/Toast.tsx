import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import clsx from 'clsx'

export type ToastVariant = 'success' | 'error' | 'info'

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

type ToastInput = {
  message: string
  variant?: ToastVariant
  duration?: number
}

let toasts: ToastItem[] = []
const listeners = new Set<() => void>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return toasts
}

function dismiss(id: string) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

function push({ message, variant = 'info', duration = 4200 }: ToastInput) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const item: ToastItem = { id, message, variant, duration }
  toasts = [...toasts, item].slice(-4)
  emit()

  const timer = setTimeout(() => dismiss(id), duration)
  timers.set(id, timer)
}

export const toast = {
  success: (message: string, duration?: number) => push({ message, variant: 'success', duration }),
  error: (message: string, duration?: number) => push({ message, variant: 'error', duration: duration ?? 5200 }),
  info: (message: string, duration?: number) => push({ message, variant: 'info', duration }),
  dismiss,
}

const variantStyles: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; ring: string; iconColor: string; glow: string }
> = {
  success: {
    icon: CheckCircle2,
    ring: 'border-emerald-400/25',
    iconColor: 'text-emerald-400',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.12)]',
  },
  error: {
    icon: AlertCircle,
    ring: 'border-red-400/25',
    iconColor: 'text-red-400',
    glow: 'shadow-[0_0_24px_rgba(248,113,113,0.12)]',
  },
  info: {
    icon: Info,
    ring: 'border-primary-3/30',
    iconColor: 'text-primary-2',
    glow: 'shadow-[0_0_24px_rgba(124,58,237,0.18)]',
  },
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const style = variantStyles[item.variant]
  const Icon = style.icon

  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className={clsx(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-panel/95 p-3.5 backdrop-blur-md',
        style.ring,
        style.glow,
      )}
    >
      <Icon className={clsx('mt-0.5 h-4 w-4 shrink-0', style.iconColor)} />
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-ink">{item.message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 rounded-md p-0.5 text-muted transition-colors hover:text-ink"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

export function ToastViewport() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const handleDismiss = useCallback((id: string) => dismiss(id), [])

  useEffect(() => {
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5"
    >
      <AnimatePresence mode="popLayout">{items.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={handleDismiss} />
      ))}</AnimatePresence>
    </div>
  )
}
