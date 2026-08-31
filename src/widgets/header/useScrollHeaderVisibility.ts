import { useEffect, useRef, useState, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'

/** Always show the header when within this distance from the scroll top. */
const TOP_LOCK_PX = 20
/** Ignore tiny scroll jitter. */
const DELTA_THRESHOLD = 6

function findScrollRoot(node: HTMLElement | null): Element | Window {
  let el: HTMLElement | null = node?.parentElement ?? null
  while (el) {
    const { overflowY } = getComputedStyle(el)
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      return el
    }
    el = el.parentElement
  }
  return window
}

function readScrollY(root: Element | Window) {
  return root === window ? window.scrollY : (root as Element).scrollTop
}

/**
 * Hides the header while scrolling down; reveals it when scrolling up.
 * Always forced visible at the top — fast flings included.
 */
export function useScrollHeaderVisibility(headerRef: RefObject<HTMLElement | null>) {
  const location = useLocation()
  const [hidden, setHidden] = useState(false)
  const hiddenRef = useRef(false)
  const lastYRef = useRef(0)
  const tickingRef = useRef(false)

  useEffect(() => {
    hiddenRef.current = false
    setHidden(false)
    lastYRef.current = 0
  }, [location.pathname])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const root = findScrollRoot(header)
    lastYRef.current = readScrollY(root)

    const apply = () => {
      tickingRef.current = false
      const y = readScrollY(root)
      const delta = y - lastYRef.current
      lastYRef.current = y

      let nextHidden = hiddenRef.current

      if (y <= TOP_LOCK_PX) {
        nextHidden = false
      } else if (delta > DELTA_THRESHOLD) {
        nextHidden = true
      } else if (delta < -DELTA_THRESHOLD) {
        nextHidden = false
      }

      if (nextHidden === hiddenRef.current) return
      hiddenRef.current = nextHidden
      setHidden(nextHidden)
    }

    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      requestAnimationFrame(apply)
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    apply()
    return () => root.removeEventListener('scroll', onScroll)
  }, [headerRef, location.pathname])

  return hidden
}
