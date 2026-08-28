import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { MagneticButton } from '@/shared/components'
import { CHARACTER } from '../data'
import { easeOutExpo, fadeUp, stagger } from '../motion'

function SplitLine({
  text,
  delay = 0,
  className = '',
}: {
  text: string
  delay?: number
  className?: string
}) {
  return (
    <span className="block overflow-hidden" style={{ perspective: 600 }}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={`mr-[0.28em] inline-block origin-bottom ${className}`}
          initial={{ y: '110%', opacity: 0, rotateX: 50 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ delay: delay + i * 0.07, duration: 0.78, ease: easeOutExpo }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

function HeroVisual() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 140, damping: 18, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 140, damping: 18, mass: 0.4 })
  const rotateX = useTransform(sy, [-48, 48], [7, -7])
  const rotateY = useTransform(sx, [-48, 48], [-9, 9])
  const glareX = useTransform(sx, [-48, 48], [18, 82])
  const glareY = useTransform(sy, [-48, 48], [22, 72])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18), transparent 42%)`

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto aspect-[540/500] w-full max-w-[540px]"
      style={{ perspective: 1100 }}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 96)
        my.set(((e.clientY - r.top) / r.height - 0.5) * 96)
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
      }}
      initial={{ opacity: 0, scale: 0.88, x: 48, filter: 'blur(12px)' }}
      animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1.05, delay: 0.18, ease: easeOutExpo }}
    >
      {/* Orbit rings */}
      <div className="pointer-events-none absolute inset-[-8%] flex items-center justify-center">
        <div className="animate-orbit absolute h-[92%] w-[92%] rounded-full border border-dashed border-primary/25" />
        <div className="animate-orbit-rev absolute h-[78%] w-[78%] rounded-full border border-white/8" />
      </div>

      <div className="relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-black">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(124,58,237,0.38), transparent 58%)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 landing-grid opacity-50" />

        {!reduced && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/2 overflow-hidden opacity-20">
            <div
              className="h-24 w-full bg-gradient-to-b from-transparent via-white/40 to-transparent"
              style={{ animation: 'scan 4.5s linear infinite' }}
            />
          </div>
        )}

        <motion.div
          className="relative flex h-full items-end justify-center px-6 pt-8 pb-2"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light"
            style={{ background: glare }}
          />
          <motion.img
            src={CHARACTER}
            alt="MODUX collectible character"
            className="relative z-10 h-[92%] w-auto max-w-[85%] object-contain drop-shadow-[0_24px_80px_rgba(124,58,237,0.55)]"
            animate={reduced ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Floating chips */}
      <motion.span
        className="absolute top-8 -left-3 z-20 hidden rounded-full border border-white/12 bg-black/70 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-primary-2 uppercase backdrop-blur sm:block"
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        Magnetic
      </motion.span>
      <motion.span
        className="absolute top-16 -right-2 z-20 hidden rounded-full border border-white/12 bg-black/70 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-rarity-legendary uppercase backdrop-blur sm:block"
        animate={reduced ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        Legendary
      </motion.span>
      <motion.span
        className="absolute bottom-16 -left-2 z-20 hidden rounded-full border border-white/12 bg-black/70 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-muted uppercase backdrop-blur sm:block"
        animate={reduced ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        1:6 Scale
      </motion.span>
    </motion.div>
  )
}

export function Hero() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 56])
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -72])
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])

  const spotlightX = useMotionValue(70)
  const spotlightY = useMotionValue(40)
  const sx = useSpring(spotlightX, { stiffness: 80, damping: 22 })
  const sy = useSpring(spotlightY, { stiffness: 80, damping: 22 })
  const spotlight = useMotionTemplate`radial-gradient(540px circle at ${sx}% ${sy}%, rgba(168,85,247,0.16), transparent 42%)`

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#020103]"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        spotlightX.set(((e.clientX - r.left) / r.width) * 100)
        spotlightY.set(((e.clientY - r.top) / r.height) * 100)
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 landing-grid landing-grid-fade"
        style={{ y: reduced ? 0 : gridY }}
      />
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_72%_42%,rgba(124,58,237,0.28),transparent_58%)]"
        style={{ y: reduced ? 0 : glowY }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_12%_88%,rgba(236,72,153,0.1),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020103] to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pt-12 pb-20 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-10 lg:pt-16 lg:pb-28">
        <motion.div
          className="flex flex-col gap-8"
          initial="hidden"
          animate="show"
          variants={stagger}
          style={{ y: reduced ? 0 : copyY }}
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
            </span>
            <span className="text-[12px] font-semibold tracking-[0.14em] text-white">COHORT 04 NOW LIVE</span>
          </motion.div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.55rem] lg:leading-[1.08]">
            <SplitLine text="Design Your Character." delay={0.12} />
            <span className="mt-1 block drop-shadow-[0_0_32px_rgba(168,85,247,0.55)]">
              <SplitLine
                text="We'll Make It Real."
                delay={0.42}
                className="bg-gradient-to-r from-primary-3 via-primary-2 to-white bg-clip-text text-transparent"
              />
            </span>
          </h1>

          <motion.p
            variants={fadeUp}
            className="max-w-lg text-base leading-7 text-muted sm:text-lg"
          >
            MODUX lets you build fully custom collectible figures — piece by piece, detail by detail.
            Design on screen, hold premium physical art in your hands.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            <MagneticButton
              onClick={() => navigate('/customize')}
              className="btn-sheen inline-flex items-center gap-2 rounded-xl bg-primary-3 px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase shadow-[0_0_32px_rgba(124,58,237,0.5)] transition-colors hover:bg-primary"
            >
              Start Creating
              <ArrowRight className="h-3.5 w-3.5" />
            </MagneticButton>
            <Link
              to="/#workflow"
              className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase transition-all hover:border-primary-3/50 hover:bg-white/[0.07]"
            >
              Watch How It Works
            </Link>
          </motion.div>

          {!reduced && (
            <motion.p
              variants={fadeUp}
              className="text-[11px] tracking-[0.2em] text-muted-2 uppercase"
            >
              Scroll to assemble
            </motion.p>
          )}
        </motion.div>

        <motion.div style={{ y: reduced ? 0 : visualY, scale: reduced ? 1 : visualScale }}>
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  )
}
