import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Skeleton } from '@/shared/components'
import { useCollectionProgress } from '../hooks/useCollectionProgress'

export function CollectionProgressCard({ className = '' }: { className?: string }) {
  const { progress, isLoading, isAuthenticated } = useCollectionProgress()
  const { collected, total, progressPercent, byRarity } = progress

  return (
    <div className={`rounded-xl border border-white/8 bg-panel/60 p-3.5 ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary-2" />
        <h3 className="text-[11px] font-bold tracking-[0.16em] text-ink">
          COLLECTION PROGRESS
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ) : (
        <>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white tabular-nums">{collected}</span>
            <span className="text-[11px] text-muted-2 tabular-nums">/ {total} items</span>
          </div>
          <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              key={progressPercent}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="h-full rounded-full bg-linear-to-r from-primary-3 via-primary to-pink shadow-[0_0_10px_rgba(168,85,247,0.6)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            {byRarity.map((rarity) => (
              <div
                key={rarity.rarity}
                className="flex items-center gap-2 text-[11px] text-muted"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${rarity.color}`} />
                <span className="flex-1">{rarity.label}</span>
                <span className="font-semibold text-ink/80 tabular-nums">{rarity.count}</span>
              </div>
            ))}
          </div>
          {!isAuthenticated ? (
            <p className="mt-2.5 text-[10px] leading-relaxed text-muted-2">
              Showing parts from your current build.{' '}
              <Link to="/login" state={{ from: '/customize' }} className="text-primary-2 hover:text-primary">
                Sign in
              </Link>{' '}
              to sync saved builds, cart, and orders.
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}
