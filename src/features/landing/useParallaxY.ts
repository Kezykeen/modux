import { useRef } from 'react'
import { useReducedMotion, useScroll, useTransform } from 'motion/react'

/** Maps a target's travel through the viewport to a Y offset. */
export function useParallaxY(distance = 40) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return { ref, y: reduced ? 0 : y }
}
