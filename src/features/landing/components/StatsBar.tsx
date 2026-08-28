import { PRESS } from '../data'
import { Reveal } from './Reveal'
import { CountUp } from './CountUp'

const STATS = [
  {
    to: 50,
    format: (n: number) => `${Math.round(n)}K+`,
    unit: 'Creators',
    label: 'Verified Active',
  },
  {
    to: 200,
    format: (n: number) => `${Math.round(n)}K+`,
    unit: 'Figures',
    label: 'Shipped Worldwide',
  },
  {
    to: 4.9,
    format: (n: number) => n.toFixed(1),
    unit: '★ Review',
    label: 'Average Rating',
  },
] as const

export function StatsBar() {
  return (
    <section className="relative border-y border-white/8 bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-2/70 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="text-center">
              <p className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-[2rem]">
                <CountUp to={stat.to} format={stat.format} duration={1.8 + i * 0.12} />{' '}
                <span className="font-bold">{stat.unit}</span>
              </p>
              <p className="mt-1.5 text-xs tracking-wide text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-center gap-6">
          <span className="shrink-0 font-display text-[11px] font-extrabold tracking-[0.22em] text-muted-2 uppercase">
            As Seen In
          </span>
          <PressMarquee />
        </div>
      </div>
    </section>
  )
}

function PressMarquee() {
  const lane = [...PRESS, ...PRESS]

  return (
    <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-[200%] animate-marquee">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex w-1/2 shrink-0 items-center justify-evenly"
            aria-hidden={copy === 1}
          >
            {lane.map((name, i) => (
              <span
                key={`${copy}-${name}-${i}`}
                className="font-display text-sm font-bold tracking-wide text-muted-2 whitespace-nowrap transition-colors hover:text-white"
              >
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
