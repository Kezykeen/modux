import { type ReactNode } from "react";
import { Boxes, Gem, Infinity as InfinityIcon } from "lucide-react";
import { Header } from "@/widgets/header";

export function CommerceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-noise flex min-h-dvh flex-col bg-void">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
      <footer className="mt-auto border-t border-white/5 bg-abyss/60 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 w-full text-[11px] font-semibold tracking-wide text-muted uppercase sm:gap-5">
            <span className="inline-flex items-center gap-2">
              <Boxes className="h-3.5 w-3.5 text-primary-2" /> Modular Design
            </span>
            <span className="inline-flex items-center gap-2">
              <Gem className="h-3.5 w-3.5 text-primary-2" /> High Quality
            </span>
            <span className="inline-flex items-center gap-2">
              <InfinityIcon className="h-3.5 w-3.5 text-primary-2" /> Endless
              Possibilities
            </span>
          </div>
          {/* <div className="flex gap-4 text-[11px] text-muted-2">
            <Link to="/" className="hover:text-ink">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-ink">
              Terms of Service
            </Link>
          </div> */}
        </div>
      </footer>
    </div>
  );
}

export const rarityTone: Record<string, string> = {
  legendary: "text-rarity-legendary",
  epic: "text-rarity-epic",
  rare: "text-rarity-rare",
  common: "text-rarity-common",
};
