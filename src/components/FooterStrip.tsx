import { Boxes, Gem, Infinity as InfinityIcon, Users2, Camera, PlaySquare, X as XIcon } from 'lucide-react'

const FEATURES = [
  { icon: Boxes, title: 'Modular Design', desc: 'Mix, match & upgrade parts' },
  { icon: Gem, title: 'High Quality', desc: 'Premium materials built to last' },
  { icon: InfinityIcon, title: 'Endless Possibilities', desc: 'Thousands of combinations' },
  { icon: Users2, title: 'Join the Community', desc: 'Share your builds & get featured' },
]

export function FooterStrip() {
  return (
    <footer className="mt-10 border-t border-white/6 pt-6 pb-8">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className="group flex animate-in-up items-start gap-3"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-panel-2 transition-all duration-300 group-hover:border-primary-3/50 group-hover:shadow-[0_0_16px_rgba(168,85,247,0.35)]">
              <Icon className="h-4 w-4 text-primary-2" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink">{title}</p>
              <p className="text-[11.5px] text-muted-2">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/6 pt-5 text-[11.5px] text-muted-2 sm:flex-row">
        <span>© {new Date().getFullYear()} MODU-X. All rights reserved.</span>
        <span className="hidden sm:inline">Follow us</span>
        <div className="flex items-center gap-2">
          {[Camera, PlaySquare, XIcon].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/8 text-muted transition-all hover:border-primary-3/50 hover:text-primary-2 hover:shadow-[0_0_12px_rgba(168,85,247,0.35)]"
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
