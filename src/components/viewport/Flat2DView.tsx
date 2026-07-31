import { motion } from 'motion/react'
import { User } from 'lucide-react'
import { useBuild } from '../../state/BuildContext'
import { CATALOG } from '../../data/catalog'

export function Flat2DView() {
  const { selection } = useBuild()
  const items = Object.values(selection)
    .map((id) => CATALOG.find((c) => c.id === id))
    .filter(Boolean)

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.14),transparent_60%)]">
      <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-4"
      >
        <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-primary-3/30 bg-panel-2/80 shadow-[0_0_80px_rgba(168,85,247,0.25)] animate-float">
          <div
            className="absolute inset-3 rounded-full opacity-70 blur-md"
            style={{
              background: `conic-gradient(from 0deg, ${items[0]?.colorFrom ?? '#a855f7'}, ${items[1]?.colorFrom ?? '#ec4899'}, ${items[0]?.colorFrom ?? '#a855f7'})`,
            }}
          />
          <User className="relative z-10 h-20 w-20 text-white/90" strokeWidth={1.25} />
        </div>
        <div className="rounded-full border border-white/8 bg-black/30 px-4 py-1.5 text-[11px] font-semibold tracking-widest text-muted-2 backdrop-blur">
          2D PREVIEW · {items.length} PARTS EQUIPPED
        </div>
      </motion.div>
    </div>
  )
}
