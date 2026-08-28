import type { Variants } from 'motion/react'

export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** A little later than peek-in — not mid-screen. */
export const midView = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -10% 0px',
} as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
}
