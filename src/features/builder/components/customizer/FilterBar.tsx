import { Grid3x3, List } from 'lucide-react'
import { Dropdown } from '@/shared/components'

interface FilterBarProps {
  rarity: string
  onRarityChange: (v: string) => void
  sort: string
  onSortChange: (v: string) => void
  layout: 'grid' | 'list'
  onLayoutChange: (v: 'grid' | 'list') => void
}

const RARITY_OPTIONS = ['All', 'Common', 'Rare', 'Epic', 'Legendary']
const SORT_OPTIONS = ['Popular', 'Price: Low', 'Price: High', 'Newest']

export function FilterBar({ rarity, onRarityChange, sort, onSortChange, layout, onLayoutChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Dropdown label="Rarity" options={RARITY_OPTIONS} value={rarity} onChange={onRarityChange} className="min-w-0 flex-1" />
      <Dropdown label="Sort" options={SORT_OPTIONS} value={sort} onChange={onSortChange} className="min-w-0 flex-1" />
      <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-white/8 bg-white/[0.03] p-0.5">
        <button
          onClick={() => onLayoutChange('grid')}
          className={`rounded-md p-1.5 transition-colors ${layout === 'grid' ? 'bg-primary/20 text-primary-2' : 'text-muted-2 hover:text-ink'}`}
        >
          <Grid3x3 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onLayoutChange('list')}
          className={`rounded-md p-1.5 transition-colors ${layout === 'list' ? 'bg-primary/20 text-primary-2' : 'text-muted-2 hover:text-ink'}`}
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
