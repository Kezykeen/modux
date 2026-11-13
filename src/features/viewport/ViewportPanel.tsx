import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, RefreshCw, Maximize, Minimize } from "lucide-react";
import { Stage, type StageHandle } from "./Stage";
import { Flat2DView } from "./Flat2DView";
import { ConnectorPoint } from "./ConnectorPoint";
import { ConnectorLines } from "./ConnectorLines";
import { CONNECTOR_GATE_MS } from "./connectorIntro";
import { SegmentedToggle, IconButton } from '@/shared/components'
import { CATEGORIES } from '@/data/catalog'
import { useBuild, useSnapshot, type ViewMode } from '@/features/builder'

export function ViewportPanel() {
  const { viewMode, setViewMode } = useBuild()
  const { registerCapture } = useSnapshot()
  const [displayMode, setDisplayMode] = useState<"digital" | "physical">(
    "digital",
  );
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [showRig, setShowRig] = useState(false)
  const stageRef = useRef<StageHandle>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastSnapshotRef = useRef<string | null>(null)

  const is2d = viewMode === '2d'

  useEffect(() => {
    registerCapture(() => {
      const live = stageRef.current?.snapshot() ?? null
      if (live) {
        lastSnapshotRef.current = live
        return live
      }
      return lastSnapshotRef.current ?? snapshot
    })
    return () => registerCapture(null)
  }, [registerCapture, snapshot])

  useEffect(() => {
    if (viewMode !== "3d") {
      setShowRig(false)
      return
    }
    const timer = window.setTimeout(() => setShowRig(true), CONNECTOR_GATE_MS)
    return () => window.clearTimeout(timer)
  }, [viewMode])

  // After the stage expands for 2D, grab a high-res still for cart/download cache.
  useEffect(() => {
    if (!is2d) return
    let cancelled = false
    const capture = () => {
      if (cancelled) return
      const next = stageRef.current?.snapshot() ?? null
      if (!next) return
      setSnapshot(next)
      lastSnapshotRef.current = next
    }
    // Wait for layout + WebGL resize to the full-height presentation size.
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(capture)
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(id)
    }
  }, [is2d])

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode)
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen?.();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 items-center justify-between px-0.5 max-lg:hidden">
        <span className="text-[11px] font-bold tracking-[0.2em] text-muted-2">
          VIEW MODE
        </span>
        <SegmentedToggle
          layoutId="view-mode"
          value={viewMode}
          onChange={handleViewMode}
          options={[
            { value: "3d", label: "3D" },
            { value: "2d", label: "2D" },
          ]}
          className="max-lg:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        />
      </div>

      <div
        ref={containerRef}
        className={`relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/8 bg-[#070510] shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] [--connector-inner-stop:71%] max-lg:rounded-none max-lg:border-x-0 max-lg:border-t-0 max-lg:shadow-[inset_0_0_120px_rgba(0,0,0,0.75),0_0_80px_rgba(124,58,237,0.12)] ${
          isFullscreen ? "bg-void p-8" : ""
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-linear-to-t from-[#070510] via-[#070510]/85 to-transparent max-lg:block min-[1401px]:hidden" />

        <div className="pointer-events-none absolute top-3 left-4 z-10 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-muted-2/70 max-lg:top-2.5 max-lg:left-3 max-lg:rounded-full max-lg:border max-lg:border-white/8 max-lg:bg-black/35 max-lg:px-2 max-lg:py-0.5 max-lg:text-[9px] max-lg:backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-2" />
          <span className="hidden min-[1401px]:inline">MODU-X · LIVE PREVIEW</span>
          <span className="min-[1401px]:hidden">MODU-X · LIVE</span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-end px-3 pt-3 min-[1401px]:hidden max-lg:px-3 max-lg:pt-2.5">
          <SegmentedToggle
            layoutId="view-mode-mobile"
            value={viewMode}
            onChange={handleViewMode}
            options={[
              { value: "3d", label: "3D" },
              { value: "2d", label: "2D" },
            ]}
            className="pointer-events-auto shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          />
        </div>

        {/* Keep the WebGL stage mounted in both modes so 2D is a sharp frozen
            live render at full viewport size — not a stretched JPEG of the short 3D panel. */}
        <div
          className={`absolute inset-0 ${is2d ? "pointer-events-none" : ""}`}
        >
          <Stage
            ref={stageRef}
            autoRotate={!is2d && autoRotate}
            interactive={!is2d}
            presentation={is2d}
            overlayRef={containerRef}
          />
        </div>

        <AnimatePresence>
          {is2d ? (
            <motion.div
              key="2d-chrome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-0 z-20"
            >
              <Flat2DView onCapture={() => stageRef.current?.snapshot() ?? lastSnapshotRef.current} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showRig ? (
            <motion.div
              key="lines"
              className="pointer-events-none absolute inset-0 z-5 max-lg:hidden"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <ConnectorLines />
            </motion.div>
          ) : null}
          {showRig
            ? CATEGORIES.map((cat, i) => (
                <div key={cat.id} className="max-lg:hidden lg:contents">
                  <ConnectorPoint category={cat} index={i} />
                </div>
              ))
            : null}
        </AnimatePresence>

        {!is2d ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-4 min-[1401px]:hidden">
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/12 bg-abyss/80 px-1.5 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55),0_0_0_1px_rgba(168,85,247,0.15)] backdrop-blur-xl">
              <IconButton
                label="Reset view"
                onClick={() => stageRef.current?.reset()}
              >
                <RotateCcw className="h-4 w-4" />
              </IconButton>
              <IconButton
                label="Toggle auto-rotate"
                active={autoRotate}
                onClick={() => setAutoRotate((v) => !v)}
              >
                <RefreshCw
                  className={`h-4 w-4 ${autoRotate ? "animate-spin-slow" : ""}`}
                />
              </IconButton>
              <IconButton label="Fullscreen" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </IconButton>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-between px-0.5 max-lg:hidden">
        <div className="flex items-center gap-2">
          <IconButton
            label="Reset view"
            disabled={is2d}
            onClick={() => stageRef.current?.reset()}
          >
            <RotateCcw className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="Toggle auto-rotate"
            active={autoRotate}
            disabled={is2d}
            onClick={() => setAutoRotate((v) => !v)}
          >
            <RefreshCw
              className={`h-4 w-4 ${autoRotate ? "animate-spin-slow" : ""}`}
            />
          </IconButton>
          <IconButton label="Fullscreen" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </IconButton>
        </div>

        <SegmentedToggle
          layoutId="display-mode"
          value={displayMode}
          onChange={setDisplayMode}
          options={[
            { value: "digital", label: "Digital View" },
            { value: "physical", label: "Physical View" },
          ]}
        />
      </div>
    </div>
  );
}
