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

export function Flat2DView({ snapshot }: { snapshot: string | null }) {
  const { cartCount } = useBuild();
  const [saved, setSaved] = useState(false);

  const handleDownload = () => {
    playClickSfx();
    if (!snapshot || saved) return;
    saveSnapshot(snapshot, stillFilename(cartCount));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#070510]">
      {snapshot ? (
        <img
          src={snapshot}
          alt="Snapshot of the current 3D build"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-[12px] text-muted-2">
          Switch to 3D first to capture a preview
        </div>
      )}

      {snapshot ? (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          <div className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-[10px] font-semibold tracking-[0.18em] text-muted-2 uppercase shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md">
            2D SNAPSHOT · {cartCount} {cartCount === 1 ? "part" : "parts"}{" "}
            EQUIPPED
          </div>
          <MagneticButton
            strength={10}
            onClick={handleDownload}
            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-primary-3 to-primary px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-white uppercase shadow-[0_0_24px_rgba(168,85,247,0.45)]"
          >
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <AnimatePresence mode="wait" initial={false}>
              {saved ? (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="relative z-10 flex items-center gap-2"
                >
                  <Check className="h-3.5 w-3.5" />
                  Downloaded
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="relative z-10 flex items-center gap-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </motion.span>
              )}
            </AnimatePresence>
          </MagneticButton>
        </div>
      ) : null}
    </div>
  );
}
