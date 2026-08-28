import { type ReactNode, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { easeOutExpo, midView } from '../motion'

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, midView)

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: 0.75, delay, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle: string
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
      <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-primary-2 uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
        {subtitle}
      </p>
    </div>
  )
}
