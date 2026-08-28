import { useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Box,
  Star,
  Heart,
  Info,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { MagneticButton } from '@/shared/components';
import { PreviewImage } from '@/shared/components';

const NAV = [
  { id: "builder", label: "Avatar Builder", icon: User },
  { id: "collection", label: "My Collection", icon: Box },
  { id: "saved", label: "Saved Looks", icon: Star },
  { id: "favorites", label: "Favorites", icon: Heart },
];

const RARITY_BREAKDOWN = [
  { label: "Common", color: "bg-rarity-common", value: 12 },
  { label: "Rare", color: "bg-rarity-rare", value: 7 },
  { label: "Epic", color: "bg-rarity-epic", value: 4 },
  { label: "Legendary", color: "bg-rarity-legendary", value: 1 },
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

      <div
        className="animate-in-up flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/8 bg-panel/60 p-3.5"
        style={{ animationDelay: "140ms" }}
      >
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary-2" />
          <h3 className="text-[11px] font-bold tracking-[0.16em] text-ink">
            COLLECTION PROGRESS
          </h3>
        </div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">24</span>
          <span className="text-[11px] text-muted-2">/ 120 items</span>
        </div>
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "20%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="h-full rounded-full bg-linear-to-r from-primary-3 via-primary to-pink shadow-[0_0_10px_rgba(168,85,247,0.6)]"
          />
        </div>
        <div className="flex flex-col gap-1">
          {RARITY_BREAKDOWN.map((rarity) => (
            <div
              key={rarity.label}
              className="flex items-center gap-2 text-[11px] text-muted"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${rarity.color}`} />
              <span className="flex-1">{rarity.label}</span>
              <span className="font-semibold text-ink/80 tabular-nums">
                {rarity.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
