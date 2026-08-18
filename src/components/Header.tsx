import { useState } from 'react'
import { motion } from 'motion/react'
import { Search, Gem, ShoppingBag } from 'lucide-react'
import { useBuild } from '../state/BuildContext'
import { SoundToggle } from './SoundToggle'

const NAV_ITEMS = ['Customize', 'Collection', 'Shop', 'Bundles', 'Gallery', 'About']

export function Header() {
  const [active, setActive] = useState('Customize')
  const { cartCount } = useBuild()

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-white/5 bg-abyss/80 backdrop-blur-xl">
      <div className="flex h-14 w-full items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-10">
          <a href="#" className="group flex flex-col leading-none select-none">
            <span className="font-display text-xl font-bold tracking-tight text-white">
              MODU<span className="text-primary-2 transition-colors group-hover:text-pink">-X</span>
            </span>
            <span className="text-[9px] font-medium tracking-[0.25em] text-muted-2">
              BUILD · COLLECT · CONNECT
            </span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={`relative rounded-full px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors ${
                  active === item ? 'text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {active === item && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/8 shadow-[0_0_0_1px_rgba(168,85,247,0.4),0_0_20px_rgba(168,85,247,0.25)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{item}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <label className="group relative hidden items-center md:flex">
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
            aria-label="Cart"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] transition-colors hover:border-primary-3/60 hover:bg-white/[0.06]"
          >
            <ShoppingBag className="h-4 w-4 text-ink transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-[0_0_10px_rgba(168,85,247,0.7)]"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          <button
            aria-label="Profile"
            className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-primary-3 to-pink transition-transform hover:scale-105"
          />
        </div>
      </div>
    </header>
  )
}
