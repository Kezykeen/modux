import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, LogOut, Package, User } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { toast } from '@/shared/components'

export function ProfileMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await logout()
      setOpen(false)
      navigate('/', { replace: true })
    } catch {
      toast.error('Could not sign out. Please try again.')
    } finally {
      setSigningOut(false)
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 items-center gap-1.5 rounded-full border pl-1 pr-2 transition-all ${
          open
            ? 'border-primary-3/50 bg-primary/10 shadow-[0_0_20px_rgba(124,58,237,0.25)]'
            : 'border-white/10 bg-white/[0.03] hover:border-primary-3/40 hover:bg-white/[0.06]'
        }`}
      >
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-3 to-pink text-[10px] font-bold text-white">
          {user?.image ? (
            <img src={user.image} alt="" className="h-full w-full object-cover" />
          ) : initials ? (
            initials
          ) : (
            <User className="h-3.5 w-3.5" />
          )}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted transition-transform ${open ? 'rotate-180 text-primary-2' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(100%+8px)] right-0 z-50 w-56 overflow-hidden rounded-xl border border-white/10 bg-panel-2/95 shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(168,85,247,0.15)] backdrop-blur-xl"
          >
            <div className="border-b border-white/8 px-4 py-3">
              <p className="truncate text-sm font-bold text-white">{user?.name ?? 'Account'}</p>
              <p className="truncate text-[11px] text-muted">{user?.email}</p>
            </div>

            <div className="p-1">
              <Link
                role="menuitem"
                to="/orders"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-white/5"
              >
                <Package className="h-4 w-4 text-primary-2" />
                Orders
              </Link>

              <button
                role="menuitem"
                type="button"
                disabled={signingOut}
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
