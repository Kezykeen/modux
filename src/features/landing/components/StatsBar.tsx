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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <span className="shrink-0 text-center font-display text-[11px] font-extrabold tracking-[0.22em] text-muted-2 uppercase sm:text-left">
            As Seen In
          </span>
          <PressMarquee />
        </div>
      </div>
    </section>
  )
}

function PressName({ name }: { name: string }) {
  return (
    <span className="font-display text-sm font-bold tracking-wide whitespace-nowrap text-muted-2">
      {name}
    </span>
  )
}

function PressMarquee() {
  // Repeat enough names so each half of the track is wider than the marquee
  // viewport (~1100px on desktop). Two identical halves + translateX(-50%) = seamless loop.
  const half = Array(3).fill(PRESS).flat()
  const track = [...half, ...half]

  return (
    <div className="w-full min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div className="flex w-max animate-marquee [animation-duration:36s] sm:[animation-duration:52s]">
        {track.map((name, i) => (
          <span key={`${name}-${i}`} className="shrink-0 px-4 sm:px-6">
            <PressName name={name} />
          </span>
        ))}
      </div>
    </div>
  )
}
