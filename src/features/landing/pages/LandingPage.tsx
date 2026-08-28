import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from '@/widgets'
import {
  Features,
  FinalCta,
  Gallery,
  Hero,
  LandingFooter,
  Pricing,
  StatsBar,
  Testimonials,
  Workflow,
} from '../components'

export function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }, [location.hash])

  return (
    <div className="bg-landing min-h-dvh overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'.55\'/></svg>")',
        }}
      />
      <Header />
      <Hero />
      <StatsBar />
      <Workflow />
      <Gallery />
      <Features />
      <Testimonials />
      <Pricing />
      <FinalCta />
      <LandingFooter />
    </div>
  )
}
