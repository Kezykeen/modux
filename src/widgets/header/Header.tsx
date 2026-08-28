import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search, Gem, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useCart } from '@/features/cart'
import { SoundToggle } from '@/shared/components'

const NAV_ITEMS = [
  { label: 'Customize', to: '/customize' },
  { label: 'Collection', to: '/#collection', hash: 'collection' },
  { label: 'Shop', to: '/#pricing', hash: 'pricing' },
  { label: 'Bundles', to: '/#pricing', hash: 'pricing' },
  { label: 'Gallery', to: '/#gallery', hash: 'gallery' },
  { label: 'About', to: '/#about', hash: 'about' },
] as const

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const { isAuthenticated, logout } = useAuth()
  const [active, setActive] = useState(() =>
    location.pathname.startsWith('/customize') ? 'Customize' : '',
  )

  const handleNav = (item: (typeof NAV_ITEMS)[number]) => {
    setActive(item.label)
    if (item.to === '/customize') {
      navigate('/customize')
      return
    }
    if (location.pathname === '/') {
      const el = document.getElementById(item.hash)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate(item.to)
    }
  }

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-white/5 bg-abyss/80 backdrop-blur-xl">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-6 sm:gap-10">
          <Link to="/" className="group flex flex-col leading-none select-none">
            <span className="font-display text-xl font-bold tracking-tight text-white">
              MODU<span className="text-primary-2 transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_14px_rgba(192,132,252,0.85)]">-X</span>
            </span>
            <span className="text-[9px] font-medium tracking-[0.25em] text-muted-2">
              BUILD · COLLECT · CONNECT
            </span>
          </Link>

          <nav className="hidden items-center gap-1 min-[1401px]:lg:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item)}
                className={`relative rounded-full px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors ${
                  active === item.label ? 'text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {active === item.label && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/8 shadow-[0_0_0_1px_rgba(168,85,247,0.4),0_0_20px_rgba(168,85,247,0.25)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {isAuthenticated ? (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <label className="group relative hidden items-center min-[1401px]:md:flex">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-2 transition-colors group-focus-within:text-primary-2" />
              <input
                type="text"
                placeholder="Search parts..."
                className="w-36 rounded-full border border-white/8 bg-white/[0.03] py-2 pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 outline-none transition-all duration-300 focus:w-56 focus:border-primary-3/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
              />
            </label>

            <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
              <Gem className="h-3.5 w-3.5 text-primary-2" />
              <span className="text-[13px] font-semibold text-ink tabular-nums">2,450</span>
            </div>

            <SoundToggle />

            <button
              type="button"
              aria-label="Cart"
              onClick={() => navigate('/cart')}
              className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] transition-colors hover:border-primary-3/60 hover:bg-white/[0.06]"
            >
              <ShoppingBag className="h-4 w-4 text-ink transition-transform group-hover:scale-110" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-[0_0_10px_rgba(168,85,247,0.7)]"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            <button
              type="button"
              aria-label="Profile"
              onClick={logout}
              title="Sign out"
              className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-primary-3 to-pink transition-transform hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-semibold text-ink transition-all hover:border-primary-3/50 hover:bg-white/[0.08]"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-primary-3 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] transition-all hover:bg-primary hover:shadow-[0_0_32px_rgba(168,85,247,0.55)]"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
