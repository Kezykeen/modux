import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Box, Trash2 } from 'lucide-react'
import { CommerceLayout } from '@/widgets'
import { useAuth } from '@/features/auth'
import { useCollections } from '../hooks/useCollections'
import { parseSavedBuild } from '@/features/builder/utils/normalize-selection'
import { resolveSnapshotUrl } from '@/lib/assets'
import { CollectionsPageSkeleton, Spinner } from '@/shared/components'

export function CollectionsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { collections, isLoading, error, deletingIds, remove } = useCollections()

  const loadBuild = (partsJson: unknown) => {
    const parsed = parseSavedBuild(partsJson)
    navigate('/customize', { state: { selection: parsed.selection } })
  }

  if (!isAuthenticated) {
    return (
      <CommerceLayout>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-white">My Collections</h1>
          <p className="mt-2 text-sm text-muted">Sign in to save and manage your builds.</p>
          <Link
            to="/login"
            state={{ from: '/collections' }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-3 px-6 py-3 text-sm font-bold text-white uppercase hover:bg-primary"
          >
            Sign In
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CommerceLayout>
    )
  }

  if (isLoading) {
    return (
      <CommerceLayout>
        <CollectionsPageSkeleton />
      </CommerceLayout>
    )
  }

  return (
    <CommerceLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">My Collections</h1>
        <p className="mt-1 text-sm text-muted">Saved builds ready to customize or order</p>
      </div>

      {error && (
        <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!error && collections.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-panel p-10 text-center">
          <Box className="mx-auto h-10 w-10 text-primary-2" />
          <p className="mt-4 font-display text-lg font-bold text-white">No saved builds yet</p>
          <p className="mt-2 text-sm text-muted">Customize an avatar and save it to your collection.</p>
          <Link
            to="/customize"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-2 hover:text-primary"
          >
            Start Building
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, index) => {
          const isDeleting = deletingIds.has(collection.id)
          return (
            <motion.article
              key={collection.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: isDeleting ? 0.5 : 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl border border-white/8 bg-panel p-4"
            >
              <div className="mb-3 h-36 overflow-hidden rounded-xl border border-white/8 bg-abyss">
                <img
                  src={resolveSnapshotUrl(collection.snapshotUrl)}
                  alt={collection.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-white">{collection.name}</h2>
                  <p className="text-[11px] text-muted">
                    Updated {new Date(collection.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Delete collection"
                  disabled={isDeleting}
                  onClick={() => remove(collection.id)}
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => loadBuild(collection.partsJson)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-panel-3 py-2.5 text-xs font-bold tracking-wide text-ink uppercase transition-colors hover:border-primary-3/40"
              >
                Load in Builder
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.article>
          )
        })}
      </div>
    </CommerceLayout>
  )
}
