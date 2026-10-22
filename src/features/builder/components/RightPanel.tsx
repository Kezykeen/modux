import { CategoryTabs } from './customizer/CategoryTabs'
import { ItemGrid } from './customizer/ItemGrid'
import { YourBuildPanel } from './YourBuildPanel'
import { CollectionProgressCard } from './CollectionProgressCard'
import { useBuild } from '../context/BuildContext'

export function RightPanel() {
  const { viewMode } = useBuild()
  const locked = viewMode === '2d'

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col gap-2 max-lg:h-auto max-lg:gap-3">
      <div
        className={`thin-scrollbar relative shrink-0 overflow-x-auto rounded-xl border border-white/8 bg-panel/60 p-1.5 transition-opacity duration-300 ${
          locked ? 'pointer-events-none opacity-40' : ''
        }`}
      >
        <CategoryTabs />
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-col rounded-xl border border-white/8 bg-panel/60 p-2 max-lg:flex-none max-lg:p-2.5">
        <div
          className={`flex min-h-0 flex-col transition-opacity duration-300 min-[1401px]:flex-1 ${
            locked ? 'pointer-events-none opacity-35' : ''
          }`}
        >
          <ItemGrid />
        </div>
        {locked ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-void/40 backdrop-blur-[2px]">
            <p className="rounded-full border border-white/10 bg-black/45 px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-muted-2 uppercase">
              Switch to 3D to customise
            </p>
          </div>
        ) : null}
      </div>

      <CollectionProgressCard className="shrink-0 min-[1401px]:hidden" />

      <div
        className={`hidden min-w-0 shrink-0 transition-opacity duration-300 min-[1401px]:block ${
          locked ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <YourBuildPanel />
      </div>
    </div>
  )
}
