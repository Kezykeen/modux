import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, RefreshCw, Maximize, Minimize } from "lucide-react";
import { Stage, type StageHandle } from "./Stage";
import { Flat2DView } from "./Flat2DView";
import { ConnectorPoint } from "./ConnectorPoint";
import { ConnectorLines } from "./ConnectorLines";
import { CONNECTOR_GATE_MS } from "./connectorIntro";
import { SegmentedToggle } from "../SegmentedToggle";
import { IconButton } from "../IconButton";
import { useBuild, type ViewMode } from '../../state/BuildContext'
import { CATEGORIES } from '../../data/catalog'

export function ViewportPanel() {
  const { viewMode, setViewMode } = useBuild()
  const [displayMode, setDisplayMode] = useState<"digital" | "physical">(
    "digital",
  );
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [showRig, setShowRig] = useState(false)
  const stageRef = useRef<StageHandle>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (viewMode !== "3d") {
      setShowRig(false)
      return
    }
    const timer = window.setTimeout(() => setShowRig(true), CONNECTOR_GATE_MS)
    return () => window.clearTimeout(timer)
  }, [viewMode])

  const handleViewMode = (mode: ViewMode) => {
    if (mode === '2d') {
      const next = stageRef.current?.snapshot() ?? null
      if (next) setSnapshot(next)
    }
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
      <div className="flex shrink-0 items-center justify-between px-0.5">
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
        />
      </div>

      <div
        ref={containerRef}
        className={`relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/8 bg-[#070510] shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] ${
          isFullscreen ? "bg-void p-8" : ""
        }`}
      >
        <div className="pointer-events-none absolute top-3 left-4 z-10 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-muted-2/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-2" />
          MODU-X · LIVE PREVIEW
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "3d" ? (
            <motion.div
              key="3d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              <Stage ref={stageRef} autoRotate={autoRotate} />
            </motion.div>
          ) : (
            <motion.div
              key="2d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              <Flat2DView snapshot={snapshot} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRig ? (
            <motion.div
              key="lines"
              className="pointer-events-none absolute inset-0 z-5"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <ConnectorLines />
            </motion.div>
          ) : null}
          {showRig
            ? CATEGORIES.map((cat, i) => (
                <ConnectorPoint key={cat.id} category={cat} index={i} />
              ))
            : null}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <IconButton
            label="Reset view"
            disabled={viewMode === '2d'}
            onClick={() => stageRef.current?.reset()}
          >
            <RotateCcw className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="Toggle auto-rotate"
            active={autoRotate}
            disabled={viewMode === '2d'}
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
