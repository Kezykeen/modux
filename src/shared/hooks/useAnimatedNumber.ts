import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion'

export function useAnimatedNumber(value: number, decimals = 2) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    const controls = animate(from, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest: number) => setDisplay(latest),
    })
    prevRef.current = value
    return () => controls.stop()
  }, [value])

  return display.toFixed(decimals)
}
