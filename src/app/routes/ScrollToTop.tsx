import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll window (and any page scroll roots) to top on route change. Skips hash navigations. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return

    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, hash])

  return null
}
