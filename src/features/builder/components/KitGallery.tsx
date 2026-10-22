import { useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { KITS, type KitDef } from '@/data/catalog'
import { fadeUp, stagger } from '@/features/landing/motion'
import { useBuild } from '../context/BuildContext'

function preloadKit(kit: KitDef) {
  for (const path of kit.bodyPaths) useGLTF.preload(path)
  const equipped = Object.values(kit.defaultSelection).flatMap((value) =>
    Array.isArray(value) ? value : value ? [value] : [],
  )
  for (const id of equipped) {
    const item = kit.catalog.find((entry) => entry.id === id)
    if (item) useGLTF.preload(item.assetPath)
  }
}

const GRID_CLASS = {
  1: 'mx-auto max-w-md grid-cols-1',
  2: 'mx-auto max-w-5xl grid-cols-1 sm:grid-cols-2',
} as const

function galleryGridClass(count: number) {
  if (count <= 2) return GRID_CLASS[count as 1 | 2]
  return 'mx-auto max-w-7xl grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
}

function KitCard({ kit, index, current }: { kit: KitDef; index: number; current: boolean }) {
  const { chooseKit } = useBuild()
  const reduced = useReducedMotion()
  const cardRef = useRef<HTMLButtonElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 160, damping: 18, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 160, damping: 18, mass: 0.4 })
  const rotateX = useTransform(sy, [-40, 40], [6, -6])
  const rotateY = useTransform(sx, [-40, 40], [-8, 8])
  const glareX = useTransform(sx, [-40, 40], [18, 82])
  const glareY = useTransform(sy, [-40, 40], [22, 72])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.16), transparent 42%)`
  const ordinal = String(index + 1).padStart(2, '0')
  const categories = useMemo(
    () => [...new Set(kit.catalog.map((item) => item.categoryId))],
    [kit.catalog],
  )

  return (
    <motion.button
      type="button"
      ref={cardRef}
      variants={fadeUp}
      onMouseEnter={() => preloadKit(kit)}
      onFocus={() => preloadKit(kit)}
      onClick={() => chooseKit(kit.id)}
      onMouseMove={(e) => {
        const el = cardRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 80)
        my.set(((e.clientY - r.top) / r.height - 0.5) * 80)
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
      }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-black text-left transition ${
        current
          ? 'border-primary-2/50 shadow-[0_0_48px_rgba(124,58,237,0.22)]'
          : 'border-white/10 hover:border-primary-3/50 hover:shadow-[0_0_40px_rgba(124,58,237,0.16)]'
      }`}
      style={{ perspective: 1100 }}
    >
      <motion.div
        className="relative isolate flex min-h-[17.5rem] flex-col"
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 28%, ${kit.accentFrom}, ${kit.accentTo} 42%, transparent 70%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 landing-grid opacity-40" />
        <div className="pointer-events-none absolute inset-[-12%] flex items-center justify-center">
          <div className="animate-orbit absolute h-[70%] w-[70%] rounded-full border border-dashed border-primary/25" />
          <div className="animate-orbit-rev absolute h-[52%] w-[52%] rounded-full border border-white/8" />
        </div>
        {!reduced && (
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-20">
            <div className="hero-scan-line absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/35 to-transparent" />
          </div>
        )}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light"
          style={{ background: glare }}
        />

        <div className="relative z-20 flex items-start justify-between px-6 pt-6">
          <span className="font-display text-4xl font-bold tracking-tight text-white/15">
            {ordinal}
          </span>
          {current ? (
            <span className="rounded-full border border-primary-2/40 bg-primary/20 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-primary-2 uppercase">
              Current
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-muted-2 uppercase">
              {kit.catalog.length} parts
            </span>
          )}
        </div>

        <div className="relative z-20 mt-auto px-6 pb-5">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-primary-2 uppercase">
            {kit.tagline}
          </p>
          <h2 className="font-display mt-1 text-3xl font-bold tracking-tight text-white">
            {kit.name}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{kit.description}</p>
        </div>
      </motion.div>

      <div className="relative z-20 flex flex-1 flex-col gap-4 border-t border-white/8 bg-panel/80 px-6 py-5 backdrop-blur-md">
        <div className="flex flex-wrap gap-1.5">
          {kit.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-primary-2 uppercase"
            >
              {chip}
            </span>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-white/40">
          {categories.length} slots · {kit.bodyPaths.length} base meshes
        </p>
        <span className="btn-sheen mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-primary-3 px-4 py-2.5 text-[12px] font-semibold tracking-wide text-white uppercase shadow-[0_0_24px_rgba(124,58,237,0.4)] transition-colors group-hover:bg-primary">
          Customise
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.button>
  )
}

export function KitGallery() {
  const { resumeKitId } = useBuild()
  const reduced = useReducedMotion()
  const spotlightX = useMotionValue(70)
  const spotlightY = useMotionValue(38)
  const sx = useSpring(spotlightX, { stiffness: 80, damping: 22 })
  const sy = useSpring(spotlightY, { stiffness: 80, damping: 22 })
  const spotlight = useMotionTemplate`radial-gradient(620px circle at ${sx}% ${sy}%, rgba(168,85,247,0.16), transparent 42%)`

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-landing"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        spotlightX.set(((e.clientX - r.left) / r.width) * 100)
        spotlightY.set(((e.clientY - r.top) / r.height) * 100)
      }}
    >
      <div className="pointer-events-none absolute inset-0 landing-grid landing-grid-fade opacity-80" />
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_78%_12%,rgba(124,58,237,0.26),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_8%_88%,rgba(236,72,153,0.1),transparent_50%)]" />

      <div className="relative mx-auto flex w-full flex-1 flex-col px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-primary-2 uppercase backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Choose your figure
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-display mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.08]"
          >
            Pick a build to customise
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted sm:text-base"
          >
            Each figure is its own body and gear set. Switch anytime — new
            figures land in this gallery as the lineup grows.
          </motion.p>
        </motion.div>

        <motion.div
          className={`mt-10 grid w-full flex-1 gap-5 lg:mt-14 ${galleryGridClass(KITS.length)}`}
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          {KITS.map((kit, index) => (
            <KitCard
              key={kit.id}
              kit={kit}
              index={index}
              current={kit.id === resumeKitId}
            />
          ))}
        </motion.div>
      </div>

      {!reduced && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#020103] to-transparent" />
      )}
    </div>
  )
}
