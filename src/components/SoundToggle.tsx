import { Volume2, VolumeX, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useSound } from '../state/SoundContext'

const BAR_HEIGHTS = [
  [3, 10, 5, 8, 3],
  [3, 6, 11, 5, 3],
  [3, 9, 4, 10, 3],
]

export function SoundToggle() {
  const { enabled, isLoading, toggle } = useSound()

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute soundtrack' : 'Play soundtrack'}
      title={enabled ? 'Mute soundtrack' : 'Play soundtrack'}
      className={`group relative flex h-9 items-center gap-2 rounded-full border px-3 transition-all duration-200 ${
        enabled
          ? 'border-primary-3/60 bg-primary/15 text-primary-2 shadow-[0_0_16px_rgba(168,85,247,0.4)]'
          : 'border-white/8 bg-white/[0.03] text-muted hover:border-white/20 hover:text-ink'
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : enabled ? (
        <Volume2 className="h-4 w-4 transition-transform group-hover:scale-110" />
      ) : (
        <VolumeX className="h-4 w-4 transition-transform group-hover:scale-110" />
      )}

      <span className="flex items-end gap-[2px]" style={{ height: 11 }}>
        {BAR_HEIGHTS.map((heights, i) => (
          <motion.span
            key={i}
            className={`w-[3px] rounded-full ${enabled ? 'bg-primary-2' : 'bg-current opacity-50'}`}
            animate={enabled ? { height: heights } : { height: heights[0] }}
            transition={
              enabled
                ? { duration: 0.85, repeat: Infinity, delay: i * 0.13, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
          />
        ))}
      </span>

      <span className="hidden text-[11px] font-semibold tracking-wide whitespace-nowrap sm:inline">
        {enabled ? 'Music On' : 'Music Off'}
      </span>
    </button>
  )
}
