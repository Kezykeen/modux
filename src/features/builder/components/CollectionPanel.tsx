import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Box, Save, Trash2 } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useBuild } from '../context/BuildContext'
import { useSnapshot } from '../context/SnapshotContext'
import { useCollections } from '@/features/collections'
import { parseSavedBuild } from '../utils/normalize-selection'
import { resolveSnapshotUrl } from '@/lib/assets'
import { LoadingButton, ModuxLoader, Skeleton, Spinner } from '@/shared/components'

export function CollectionPanel() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { selection, buildItems, loadSelection, kitId } = useBuild()
  const { capture } = useSnapshot()
  const { collections, isLoading, deletingIds, save, remove } = useCollections()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')

  const trimmedName = name.trim()
  const nameTaken = trimmedName.length > 0 &&
    collections.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/customize' } })
      return
    }
    const buildName = trimmedName
    if (!buildName || buildItems.length === 0 || saving || nameTaken) return
    setSaving(true)
    try {
      const snapshot = capture() || undefined
      await save(buildName, { kitId, ...selection } as Record<string, unknown>, snapshot)
      setName('')
    } catch {
      /* toast handled in hook */
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-white/8 bg-panel/60 p-4 text-center">
        <Box className="mx-auto h-8 w-8 text-primary-2" />
        <p className="mt-3 text-[12px] text-muted">Sign in to save builds to your collection.</p>
        <Link
          to="/login"
          state={{ from: '/customize' }}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary-2 uppercase"
        >
          Sign In
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-xl border border-white/8 bg-panel/60 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold tracking-[0.16em] text-ink">MY COLLECTION</h3>
        <Link to="/collections" className="text-[10px] font-bold text-primary-2 uppercase hover:text-primary">
          View all
        </Link>
      </div>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Build name"
          className={`min-w-0 flex-1 rounded-lg border bg-panel-3 px-2.5 py-2 text-[11px] text-ink outline-none focus:border-primary-3/50 ${
            nameTaken ? 'border-red-400/60' : 'border-white/8'
          }`}
        />
        <LoadingButton
          loading={saving}
          loadingLabel="Saving…"
          spinnerSize="xs"
          disabled={buildItems.length === 0 || !trimmedName || nameTaken}
          onClick={handleSave}
          className="inline-flex items-center gap-1 rounded-lg bg-primary-3 px-3 py-2 text-[10px] font-bold text-white uppercase"
        >
          <Save className="h-3 w-3" />
          Save
        </LoadingButton>
      </div>
      {nameTaken ? (
        <p className="text-[10px] text-red-400">That name is already in your collection.</p>
      ) : null}

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <ModuxLoader size="sm" label="Loading collection" />
            <div className="w-full space-y-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        ) : collections.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-muted">No saved builds yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {collections.slice(0, 8).map((collection) => {
              const isDeleting = deletingIds.has(collection.id)
              return (
                <li
                  key={collection.id}
                  className="flex items-center gap-2 rounded-lg border border-white/8 bg-panel-2/80 p-2"
                >
                  <img
                    src={resolveSnapshotUrl(collection.snapshotUrl)}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseSavedBuild(collection.partsJson)
                      loadSelection(parsed.selection, parsed.kitId)
                    }}
                    className="min-w-0 flex-1 text-left text-[11px] font-semibold text-ink hover:text-primary-2"
                  >
                    {collection.name}
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    disabled={isDeleting}
                    onClick={() => remove(collection.id)}
                    className="rounded p-1 text-muted hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? <Spinner size="xs" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="text-center text-[10px] text-muted-2">
        {collections.length} saved · {buildItems.length} parts in current build
      </p>
    </div>
  )
}
