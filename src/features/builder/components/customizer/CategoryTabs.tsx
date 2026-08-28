import { motion } from 'motion/react'
import { LayoutGrid } from 'lucide-react'
import { CATEGORIES } from '@/data/catalog'
import { useBuild, type ActiveCategory } from '../../context/BuildContext'
import { CATEGORY_ICONS } from '@/shared/icons'
import { playClickSfx } from '@/audio'

const TABS: { id: ActiveCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  ...CATEGORIES.map((c) => ({ id: c.id as ActiveCategory, label: c.label })),
]

export function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useBuild()

  return (
    <div className="inline-flex items-center gap-0.5">
      {TABS.map((tab) => {
        const isActive = activeCategory === tab.id
        const Icon = tab.id === 'all' ? LayoutGrid : CATEGORY_ICONS[tab.id as keyof typeof CATEGORY_ICONS]
        return (
          <button
            key={tab.id}
            onClick={() => {
              playClickSfx()
              setActiveCategory(tab.id)
            }}
            className="relative rounded-md px-1.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors"
          >
            {isActive && (
              <motion.span
                layoutId="category-tab-active"
                className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary-3/80 to-primary-3/40 shadow-[0_0_14px_rgba(168,85,247,0.45)]"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-1 ${
                isActive ? 'text-white' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
