import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { MagneticButton } from '@/shared/components'
import { useParallaxY } from '../useParallaxY'
import { Reveal } from './Reveal'

export function FinalCta() {
  const navigate = useNavigate()
  const { ref, y } = useParallaxY(50)

  return (
    <section className="bg-[#020103] px-5 pb-16 sm:px-8 lg:px-10">
      <Reveal>
        <div
          ref={ref}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-primary-3/40 bg-gradient-to-br from-primary-3/20 via-[#0a0612] to-black px-6 py-14 text-center sm:px-12"
        >
          <motion.div
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
            style={{ y }}
          />
          <div className="pointer-events-none absolute inset-0 landing-grid opacity-40" />
          <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to Build Your First Character?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            No account needed to explore. Try out our intuitive 3D customizer tools. Sign up only when
            you are completely satisfied and ready to print.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton
              onClick={() => navigate('/customize')}
              className="btn-sheen inline-flex items-center gap-2 rounded-xl bg-primary-3 px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase shadow-[0_0_28px_rgba(124,58,237,0.5)] hover:bg-primary"
            >
              Get Started Free
              <ArrowRight className="h-3.5 w-3.5" />
            </MagneticButton>
            <button
              type="button"
              onClick={() => navigate('/customize')}
              className="rounded-xl border border-white/12 bg-white/[0.05] px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase transition-all hover:border-primary-3/50 hover:bg-white/[0.1]"
            >
              Explore Assets
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
