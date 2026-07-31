import { CategoryTabs } from './customizer/CategoryTabs'
import { ItemGrid } from './customizer/ItemGrid'
import { YourBuildPanel } from './build/YourBuildPanel'

export function RightPanel() {
  return (
    <div className="inline-flex h-full min-h-0 max-w-full flex-col gap-3">
      <div className="rounded-2xl border border-white/8 bg-panel/60 p-2">
        <CategoryTabs />
      </div>

      <div className="min-w-0 rounded-2xl border border-white/8 bg-panel/60 p-2.5">
        <ItemGrid />
      </div>

      <div className="min-w-0">
        <YourBuildPanel />
      </div>
    </div>
  )
}
