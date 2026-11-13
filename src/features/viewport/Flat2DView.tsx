import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Download } from "lucide-react";
import { useBuild } from '@/features/builder';
import { MagneticButton } from '@/shared/components';
import { playClickSfx } from '@/audio';

function stillFilename(partCount: number) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `MODU-X-2D-SNAPSHOT-${partCount}p-${stamp}.jpg`;
}

function saveSnapshot(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

/**
 * Chrome for frozen 2D presentation. The sharp figure itself is the live WebGL
 * stage underneath — this overlay only handles save UI so we never stretch a
 * low-res JPEG over a full-height phone screen.
 */
export function Flat2DView({
  onCapture,
}: {
  onCapture: () => string | null;
}) {
  const { cartCount } = useBuild();
  const [saved, setSaved] = useState(false);

  const handleDownload = () => {
    playClickSfx();
    if (saved) return;
    const dataUrl = onCapture();
    if (!dataUrl) return;
    saveSnapshot(dataUrl, stillFilename(cartCount));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-[#070510] via-[#070510]/80 to-transparent px-3 pt-10 pb-3 max-lg:pb-2.5 min-[1401px]:bottom-4 min-[1401px]:bg-none min-[1401px]:px-4 min-[1401px]:pt-0 min-[1401px]:pb-0">
        <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/55 p-1 pl-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md max-lg:pl-2.5">
          <div className="min-w-0 text-[10px] font-semibold tracking-[0.14em] text-muted-2 uppercase max-lg:tracking-[0.1em]">
            <span className="max-lg:hidden">
              2D SNAPSHOT · {cartCount} {cartCount === 1 ? "part" : "parts"} equipped
            </span>
            <span className="hidden max-lg:inline">
              2D · {cartCount} {cartCount === 1 ? "part" : "parts"}
            </span>
          </div>
          <MagneticButton
            strength={10}
            onClick={handleDownload}
            className="group relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-linear-to-r from-primary-3 to-primary px-3.5 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase shadow-[0_0_24px_rgba(168,85,247,0.45)] max-lg:px-3 max-lg:py-1.5"
          >
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <AnimatePresence mode="wait" initial={false}>
              {saved ? (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="relative z-10 flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span className="max-lg:hidden">Downloaded</span>
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="relative z-10 flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Save</span>
                </motion.span>
              )}
            </AnimatePresence>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
