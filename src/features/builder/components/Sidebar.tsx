import { useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Box,
  Star,
  Heart,
  Info,
  ArrowRight,
} from "lucide-react";
import { MagneticButton } from '@/shared/components';
import { PreviewImage } from '@/shared/components';
import { CollectionPanel } from './CollectionPanel';
import { CollectionProgressCard } from './CollectionProgressCard';

const NAV = [
  { id: "builder", label: "Avatar Builder", icon: User },
  { id: "collection", label: "My Collection", icon: Box },
  { id: "saved", label: "Saved Looks", icon: Star },
  { id: "favorites", label: "Favorites", icon: Heart },
];

export function Sidebar() {
  const [activeNav, setActiveNav] = useState("builder");

  return (
    <aside className="flex h-full min-h-0 flex-col gap-3">
      <div className="animate-in-up shrink-0 rounded-xl border border-white/8 bg-panel/60 p-3.5">
        <h2 className="mb-3.5 px-0.5 text-sm font-bold tracking-[0.2em] text-primary-2">
          BUILD YOUR AVATAR
        </h2>
        <nav className="flex flex-col gap-2">
          {NAV.map(({ id, label, icon: Icon }) => {
            const isActive = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-linear-to-r from-primary-3/70 to-primary/60 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                    transition={{ type: "spring", stiffness: 450, damping: 38 }}
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg bg-white/0 transition-colors duration-200 group-hover:bg-white/5" />
                )}
                <Icon
                  className={`relative z-10 h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-muted group-hover:text-ink"
                  }`}
                />
                <span
                  className={`relative z-10 transition-colors ${isActive ? "text-white" : "text-muted group-hover:text-ink"}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div
        className="animate-in-up flex shrink-0 flex-col rounded-xl border border-white/8 bg-panel/60 p-3.5"
        style={{ animationDelay: "80ms" }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-bold tracking-[0.16em] text-ink">
            MAGNETIC SYSTEM
          </h3>
          <Info className="h-3.5 w-3.5 shrink-0 text-muted-2" strokeWidth={2} />
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-muted">
          All parts use strong neodymium magnets for secure hold and easy
          customization.
        </p>
        <PreviewImage
          src="/magnetic.webp"
          alt="Magnetic System"
          priority
          className="mb-3 w-full object-contain"
        />
        <MagneticButton className="group relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-primary-3/40 py-2 text-[11px] font-semibold tracking-[0.16em] text-primary-2 uppercase transition-colors hover:bg-primary/10">
          <span>Learn More</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </MagneticButton>
      </div>

      {activeNav === 'collection' ? (
        <CollectionPanel />
      ) : (
        <div className="animate-in-up min-h-0 flex-1" style={{ animationDelay: '140ms' }}>
          <CollectionProgressCard className="h-full" />
        </div>
      )}
    </aside>
  );
}
