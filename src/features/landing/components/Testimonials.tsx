import { motion } from 'motion/react'
import { TESTIMONIALS } from '../data'
import { midView } from '../motion'
import { Reveal, SectionHeading } from './Reveal'

export function Testimonials() {
  return (
    <section
      id="collection"
      className="scroll-mt-20 border-y border-white/6 bg-black px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Community Response"
            title="Loved by Creators Worldwide"
            subtitle="See why thousands of collectors, designers, and hobbyists are replacing standard desk toys with custom MODUX creations."
          />
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.07}>
              <blockquote className="flex h-full flex-col rounded-2xl border border-white/8 bg-panel-2 p-6 transition-all duration-300 hover:border-primary-3/35 hover:shadow-[0_0_32px_rgba(124,58,237,0.1)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${t.hue} text-xs font-bold text-white`}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-[11px] text-muted-2">{t.role}</p>
                    </div>
                  </div>
                  <span className="flex gap-0.5 text-xs tracking-wide text-rarity-legendary">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <motion.span
                        key={s}
                        initial={{ opacity: 0, scale: 0.4, y: 4 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={midView}
                        transition={{ delay: 0.15 + s * 0.06, duration: 0.35 }}
                      >
                        ★
                      </motion.span>
                    ))}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted">&ldquo;{t.quote}&rdquo;</p>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
