import { Link } from 'react-router-dom'
import { SocialLinks } from '@/widgets'

const BULLETS = [
  { label: 'Modular Design', src: '/assets/landing/footer/modular.svg' },
  { label: 'High Quality', src: '/assets/landing/footer/quality.svg' },
  { label: 'Endless Possibilities', src: '/assets/landing/footer/infinity.svg' },
] as const

export function LandingFooter() {
  return (
    <footer className="border-t border-white/6 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-6 text-[11px] font-semibold tracking-wide text-muted uppercase">
          {BULLETS.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2">
              <span className="flex size-3.5 items-center justify-center overflow-clip">
                <img src={item.src} alt="" width={12} height={12} className="size-3" />
              </span>
              {item.label}
            </span>
          ))}
        </div>
        <SocialLinks />
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-muted-2 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>
            © {new Date().getFullYear()} MODUX Inc. All digital creations are saved secure. Physical
            products subject to licensing limits.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-muted transition-colors hover:text-ink">
              Privacy Policy
            </Link>
            <Link to="#" className="text-muted transition-colors hover:text-ink">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
