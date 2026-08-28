import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PLANS } from '../data'
import { Reveal, SectionHeading } from './Reveal'

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-[#050308] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Transparent Value"
            title="Simple, Transparent Pricing"
            subtitle="No hidden manufacturing costs. Choose the tier that matches your display goals and start designing instantly."
          />
        </Reveal>
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <article
                className={`relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'border-primary bg-panel-2 shadow-[0_0_0_1px_rgba(168,85,247,0.35),0_0_48px_rgba(124,58,237,0.25)] lg:-mt-3 lg:mb-0'
                    : 'border-white/8 bg-panel-2/80 hover:border-primary-3/35 hover:-translate-y-1'
                }`}
              >
                {plan.popular && (
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/30 via-transparent to-transparent opacity-60" />
                )}
                <div className="relative mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted">{plan.blurb}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${
                      plan.popular
                        ? 'bg-primary-3 text-white'
                        : 'border border-white/10 bg-white/[0.04] text-muted'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
                <div className="relative mb-6 flex items-end gap-1">
                  <span className="font-display text-4xl font-extrabold text-white">${plan.price}</span>
                  <span className="mb-1.5 text-sm text-muted">/ figure</span>
                </div>
                <div className="relative mb-6 h-px bg-white/8" />
                <ul className="relative mb-8 flex flex-1 flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/customize"
                  className={`relative inline-flex w-fit rounded-xl px-5 py-2.5 text-sm font-semibold uppercase transition-all ${
                    plan.popular
                      ? 'btn-sheen bg-primary-3 text-white shadow-[0_0_24px_rgba(124,58,237,0.4)] hover:bg-primary'
                      : 'border border-white/12 bg-white/[0.04] text-white hover:border-primary-3/50 hover:bg-white/[0.08]'
                  }`}
                >
                  Select Tier
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
