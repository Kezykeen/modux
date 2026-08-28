import { motion } from 'motion/react'
import { FEATURES } from '../data'
import { useParallaxY } from '../useParallaxY'
import { Reveal, SectionHeading } from './Reveal'

export function Features() {
  return (
    <section id="about" className="scroll-mt-20 bg-[#050308] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Premium Tech"
            title="Built for Creators"
            subtitle="We spent two years perfecting the mechanical engineering so your figures feel as premium as the high-resolution renders on screen."
          />
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-3">
          {FEATURES.map((feat, i) => (
            <Reveal key={feat.title} delay={i * 0.08}>
              <FeatureCard feat={feat} distance={24 + i * 10} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feat,
  distance,
}: {
  feat: (typeof FEATURES)[number]
  distance: number
}) {
  const { ref, y } = useParallaxY(distance)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-panel-2 transition-all duration-300 hover:border-primary-3/40 hover:shadow-[0_0_40px_rgba(124,58,237,0.12)]">
      <div className="flex items-start justify-between gap-3 p-7 pb-4">
        <h3 className="font-display text-xl font-bold text-white">{feat.title}</h3>
        <feat.icon className="h-6 w-6 shrink-0 text-primary-2 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]" />
      </div>
      <p className="px-7 pb-6 text-sm leading-relaxed text-muted">{feat.desc}</p>
      <div className="mt-auto overflow-hidden px-7 pb-7">
        <div ref={ref} className="overflow-hidden rounded-xl border border-white/6">
          <motion.img
            src={feat.img}
            alt={feat.title}
            style={{ y }}
            className="h-48 w-full scale-110 object-cover transition-transform duration-700 ease-out group-hover:scale-125"
          />
        </div>
      </div>
    </article>
  )
}
