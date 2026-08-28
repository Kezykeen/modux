import { Boxes, Gem, Infinity as InfinityIcon, Users2 } from 'lucide-react'
import { SocialLinks } from './SocialLinks'

const FEATURES = [
  { icon: Boxes, title: "Modular Design", desc: "Mix, match & upgrade parts" },
  { icon: Gem, title: "High Quality", desc: "Premium materials built to last" },
  {
    icon: InfinityIcon,
    title: "Endless Possibilities",
    desc: "Thousands of combinations",
  },
  {
    icon: Users2,
    title: "Join the Community",
    desc: "Share your builds & get featured",
  },
];

export function FooterStrip() {
  return (
    <footer className="mt-8 flex shrink-0 items-center justify-between gap-4 border-t border-white/6 pt-2 pb-1">
      <div className="hidden min-w-0 flex-1 items-center gap-5 min-[1401px]:xl:flex">
        {FEATURES.map(({ icon: Icon, title }) => (
          <div key={title} className="group flex min-w-0 items-center gap-2">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-panel-2 transition-all duration-300 group-hover:border-primary-3/50">
              <Icon className="h-3.5 w-3.5 text-primary-2" />
            </div>
            <p className="truncate text-[11px] font-semibold text-ink">
              {title}
            </p>
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 text-[11px] text-muted-2 min-[1401px]:xl:flex-none min-[1401px]:xl:justify-end">
        <span className="truncate">
          © {new Date().getFullYear()} MODU-X. All rights reserved.
        </span>
        <SocialLinks />
      </div>
    </footer>
  );
}
