import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { STEPS } from '../data'
import { fadeUp, midView, stagger } from '../motion'
import { Reveal, SectionHeading } from './Reveal'

const CARD_SHIFT = [28, 48, 36, 56, 32]

export function Workflow() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  return (
    <section
      ref={ref}
      id="workflow"
      className="scroll-mt-20 bg-[#050308] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="The Workflow"
            title="From Screen to Shelf in 5 Steps"
            subtitle="Our streamlined companion app pipelines high-definition virtual designs directly into custom-manufactured hardware."
          />
        </Reveal>
        <motion.div
          className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          initial="hidden"
          whileInView="show"
          viewport={midView}
          variants={stagger}
        >
          <div className="pointer-events-none absolute top-10 right-8 left-8 hidden h-px bg-gradient-to-r from-transparent via-primary-3/50 to-transparent lg:block" />
          {STEPS.map((step, i) => (
            <StepCard
              key={step.n}
              step={step}
              progress={scrollYProgress}
              distance={CARD_SHIFT[i] ?? 36}
              reduced={Boolean(reduced)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function StepCard({
  step,
  progress,
  distance,
  reduced,
}: {
  step: (typeof STEPS)[number]
  progress: MotionValue<number>
  distance: number
  reduced: boolean
}) {
  const y = useTransform(progress, [0, 1], [distance, -distance])

  return (
    <motion.div variants={fadeUp} style={{ y: reduced ? 0 : y }}>
      <motion.div
        whileHover={{ y: -6, transition: { duration: 0.25 } }}
        className="group relative flex h-full flex-col rounded-2xl border border-white/8 bg-panel-2/80 p-6 transition-colors duration-300 hover:border-primary-3/45 hover:shadow-[0_0_40px_rgba(124,58,237,0.16)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="font-display text-3xl font-bold text-primary-2/90">{step.n}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-primary-2 transition-all duration-300 group-hover:border-primary-3/50 group-hover:bg-primary-3/15 group-hover:shadow-[0_0_16px_rgba(168,85,247,0.35)]">
            <step.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
        <h3 className="mb-2 text-base font-semibold text-white">{step.title}</h3>
        <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
      </motion.div>
    </motion.div>
  )
}
