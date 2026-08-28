import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion'
import { useInView, useReducedMotion } from 'motion/react'
import { easeOutExpo, midView } from '../motion'

export function CountUp({
  to,
  format,
  duration = 1.7,
  className = '',
}: {
  to: number
  format: (n: number) => string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, midView)
  const reduced = useReducedMotion()
  const [text, setText] = useState(() => format(0))

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setText(format(to))
      return
    }
    const controls = animate(0, to, {
      duration,
      ease: easeOutExpo,
      onUpdate: (latest) => setText(format(latest)),
    })
    return () => controls.stop()
  }, [inView, to, duration, reduced, format])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {text}
    </span>
  )
}
