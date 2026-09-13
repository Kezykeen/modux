import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Vector3, type PerspectiveCamera } from "three";
import { useMediaQuery } from '@/shared/hooks';
import { AvatarModel } from "./AvatarModel";
import { AssetWarmup } from "./AssetWarmup";
import { Platform } from "./Platform";
import { SpotlightBackground } from "./SpotlightBackground";

export interface StageHandle {
  reset: () => void;
  /** JPEG data URL of the current presented frame, including bloom. */
  snapshot: () => string | null;
}

interface StageProps {
  autoRotate: boolean;
  /** Viewport overlay root — zoom writes a CSS var here for the connector lines. */
  overlayRef?: RefObject<HTMLElement | null>;
}

/** World-space extents of the avatar plus its pedestal, measured from the source GLBs. */
const AVATAR_HEIGHT = 1.72;
const AVATAR_WIDTH = 1.45;
const AVATAR_CENTER_Y = -0.16;
const FRAME_MARGIN = 1.52;
/** Closest allowed camera distance as a fraction of the framed (starting) distance. */
const MIN_ZOOM_RATIO = 0.52;
/** Connector landing stop at framed distance (matches previous INNER_STOP). */
const CONNECTOR_STOP_FAR = 71;
/** Landing stop when fully zoomed in — farther from centre so lines clear the silhouette. */
const CONNECTOR_STOP_NEAR = 82;

/**
 * Stable object identity matters: an inline literal would make R3F re-apply the
 * starting position on every Stage render, snapping the orbit back to the front.
 */
const CAMERA_CONFIG = {
  position: [0, AVATAR_CENTER_Y, 3.5] as [number, number, number],
  fov: 30,
};
/**
 * No tone mapping on purpose. ACES Filmic desaturates saturated coloured lights
 * toward white as they approach 1.0, which drained the purple/magenta rim down
 * to grey — the whole signature of this scene. Linear output keeps the violet.
 */
const GL_CONFIG = {
  antialias: true,
  preserveDrawingBuffer: true,
  powerPreference: "high-performance" as const,
};

const TARGET = new Vector3();
const ORBIT_DIRECTION = new Vector3();

/**
 * Frames the avatar from the canvas aspect instead of a fixed camera position, so
 * the first paint and every resize land on the same full-body composition.
 */
function CameraRig({
  controlsRef,
  frameRef,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.RefObject<any>;
  frameRef: React.RefObject<((preserveOrbit: boolean) => void) | null>;
}) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  const frame = useCallback(
    (preserveOrbit: boolean) => {
      const verticalFov = (camera.fov * Math.PI) / 180;
      const horizontalFov =
        2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const framedDistance = Math.max(
        (AVATAR_HEIGHT * FRAME_MARGIN) / (2 * Math.tan(verticalFov / 2)),
        (AVATAR_WIDTH * FRAME_MARGIN) / (2 * Math.tan(horizontalFov / 2)),
      );
      const minDistance = framedDistance * MIN_ZOOM_RATIO;

      const controls = controlsRef.current;
      TARGET.set(0, AVATAR_CENTER_Y, 0);
      ORBIT_DIRECTION.set(0, 0, 1);

      let nextDistance = framedDistance;

      // Re-framing keeps the orbit angle and the zoom ratio; only the absolute
      // distances scale with the new canvas size.
      if (preserveOrbit && controls) {
        ORBIT_DIRECTION.copy(camera.position).sub(controls.target);
        if (ORBIT_DIRECTION.lengthSq() < 1e-8) ORBIT_DIRECTION.set(0, 0, 1);
        ORBIT_DIRECTION.normalize();

        const prevMax = controls.maxDistance || framedDistance;
        const ratio = controls.getDistance() / prevMax;
        nextDistance = Math.min(
          framedDistance,
          Math.max(minDistance, framedDistance * ratio),
        );
      }

      camera.position
        .copy(TARGET)
        .addScaledVector(ORBIT_DIRECTION, nextDistance);
      camera.updateProjectionMatrix();

      if (controls) {
        controls.target.copy(TARGET);
        controls.maxDistance = framedDistance;
        controls.minDistance = minDistance;

        if (preserveOrbit) {
          controls.update();
        } else {
          // Reset has to land exactly front-on from any prior angle, and the
          // camera position assigned above is the only reliable statement of
          // that. setAzimuthalAngle cannot be used: it measures its delta from
          // the controls' *stale* internal theta rather than that position, so
          // from a rear view it queued a half-turn and glided away from front.
          //
          // Vertical drag can leave the tilt pinned (see ZoomOverlaySync), so
          // reopen the limits or phi gets clamped to that lock instead of level.
          controls.minPolarAngle = DEFAULT_POLAR_MIN;
          controls.maxPolarAngle = DEFAULT_POLAR_MAX;

          // With damping off, update() flushes leftover orbit momentum and
          // zeroes it, instead of easing it in over the next frames. Auto-rotate
          // is parked for the same reason: it would bias this frame's angle.
          const damping = controls.enableDamping;
          const autoRotating = controls.autoRotate;
          controls.enableDamping = false;
          controls.autoRotate = false;
          controls.update();

          // Momentum is cleared, so re-asserting the framed position now sticks:
          // update() derives the orbit straight from it and rebuilds it verbatim.
          camera.position
            .copy(TARGET)
            .addScaledVector(ORBIT_DIRECTION, nextDistance);
          controls.update();

          controls.enableDamping = damping;
          controls.autoRotate = autoRotating;
        }
      } else {
        camera.lookAt(TARGET);
      }
    },
    [camera, controlsRef],
  );

  const framed = useRef(false);

  useEffect(() => {
    frame(framed.current);
    framed.current = true;
  }, [frame, width, height]);

  useEffect(() => {
    frameRef.current = frame;
    return () => {
      frameRef.current = null;
    };
  }, [frame, frameRef]);

  return null;
}

/** How far the look-at point may travel vertically at full zoom (world units). */
const MAX_PAN_Y = 0.72;
/** Vertical pan unlocks once the user has zoomed in at least this far (0–1). */
const PAN_ENABLE_ZOOM = 0.06;
/** Pixels of vertical drag → world units at full zoom (kept low so it feels as heavy as orbit). */
const PAN_DRAG_SCALE = 0.0018;
const DEFAULT_POLAR_MIN = Math.PI / 2 - 0.45;
const DEFAULT_POLAR_MAX = Math.PI / 2 + 0.3;

/**
 * Zoom → connector CSS var, plus zoomed-in framing:
 * left/right drag still orbits (same as zoomed out); up/down pans vertically
 * so clipped hair/shoes are reachable. No sideways slide.
 */
function ZoomOverlaySync({
  controlsRef,
  overlayRef,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.RefObject<any>;
  overlayRef?: RefObject<HTMLElement | null>;
}) {
  const gl = useThree((state) => state.gl);
  const lastStop = useRef(-1);
  const zoomInRef = useRef(0);
  const lockedPolar = useRef<number | null>(null);

  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lastY = 0;

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      lastY = event.clientY;
    };

    const onMove = (event: PointerEvent) => {
      if (!dragging || zoomInRef.current <= PAN_ENABLE_ZOOM) return;
      const controls = controlsRef.current;
      if (!controls) return;

      const dy = event.clientY - lastY;
      lastY = event.clientY;
      if (dy === 0) return;

      const zoomIn = zoomInRef.current;
      // Drag up → raise framing (reveal shoes); drag down → lower (reveal hair).
      // Mild zoom scaling so close-up doesn't feel lighter than orbit.
      controls.target.y += dy * PAN_DRAG_SCALE * (0.75 + zoomIn * 0.35);
      const range = MAX_PAN_Y * zoomIn;
      controls.target.y = Math.min(
        AVATAR_CENTER_Y + range,
        Math.max(AVATAR_CENTER_Y - range, controls.target.y),
      );
      controls.target.x = 0;
      controls.target.z = 0;
      controls.update();
    };

    const onUp = () => {
      dragging = false;
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [controlsRef, gl]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const max = controls.maxDistance;
    const min = controls.minDistance;
    if (!(max > min)) return;

    const zoomIn = Math.max(
      0,
      Math.min(1, (max - controls.getDistance()) / (max - min)),
    );
    zoomInRef.current = zoomIn;

    const overlay = overlayRef?.current;
    if (overlay) {
      const stop =
        CONNECTOR_STOP_FAR +
        zoomIn * (CONNECTOR_STOP_NEAR - CONNECTOR_STOP_FAR);
      if (Math.abs(stop - lastStop.current) >= 0.05) {
        lastStop.current = stop;
        overlay.style.setProperty(
          "--connector-inner-stop",
          `${stop.toFixed(2)}%`,
        );
      }
    }

    // Keep left-drag as orbit. When zoomed, freeze tilt so vertical drag is
    // free for our pan listener instead of looking up/down at the model.
    const allowPan = zoomIn > PAN_ENABLE_ZOOM;
    controls.enablePan = false;

    if (allowPan) {
      if (lockedPolar.current == null) {
        lockedPolar.current = controls.getPolarAngle();
      }
      controls.minPolarAngle = lockedPolar.current;
      controls.maxPolarAngle = lockedPolar.current;
    } else {
      lockedPolar.current = null;
      controls.minPolarAngle = DEFAULT_POLAR_MIN;
      controls.maxPolarAngle = DEFAULT_POLAR_MAX;
      controls.target.y = AVATAR_CENTER_Y;
    }

    controls.target.x = 0;
    controls.target.z = 0;
  });

  return null;
}

function SnapshotBridge({
  snapshotRef,
}: {
  snapshotRef: React.RefObject<(() => string | null) | null>;
}) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const scratch = document.createElement("canvas");
    const ctx = scratch.getContext("2d");

    snapshotRef.current = () => {
      if (!ctx) return null;
      const source = gl.domElement;
      if (!source.width || !source.height) return null;

      scratch.width = source.width;
      scratch.height = source.height;
      ctx.drawImage(source, 0, 0);
      return scratch.toDataURL("image/jpeg", 0.92);
    };

    return () => {
      snapshotRef.current = null;
    };
  }, [gl, snapshotRef]);

  return null;
}

/** CSS only — no React state, so orbit and auto-rotate never hitch on grab. */
function CanvasGrabCursor() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const el = gl.domElement;
    el.style.cursor = "grab";
    const down = () => {
      el.style.cursor = "grabbing";
    };
    const up = () => {
      el.style.cursor = "grab";
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      el.style.cursor = "";
    };
  }, [gl]);

  return null;
}

export const Stage = forwardRef<StageHandle, StageProps>(function Stage(
  { autoRotate, overlayRef },
  ref,
) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const dpr: [number, number] = isMobile ? [1, 1.25] : [1, 2]
  const msaa = isMobile ? 0 : 4
  const shadowMapSize = isMobile ? 512 : 1024
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const frameRef = useRef<((preserveOrbit: boolean) => void) | null>(null);
  const snapshotRef = useRef<(() => string | null) | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      frameRef.current?.(false);
    },
    snapshot: () => snapshotRef.current?.() ?? null,
  }));

  return (
    <Canvas shadows dpr={dpr} camera={CAMERA_CONFIG} gl={GL_CONFIG}>
      <SpotlightBackground />

      {/* Kept low so the coloured rims read as light rather than as a wash. */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[2, 4, 2]}
        intensity={0.85}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-bias={-0.00018}
      />
      {/* The signature violet ray. Left and behind the shoulder on purpose: it
          rakes the left edge of the silhouette, which is what makes it read as
          a ray from the side. Moving it in front of the model instead spills
          purple flatly across the chest and the direction is lost. Slightly
          hotter than the old kit needed, since this one is dressed in black. */}
      <pointLight position={[-2.2, 1.5, -1.2]} intensity={8.5} color="#a855f7" />
      <pointLight position={[2, 0.6, 1.4]} intensity={4.5} color="#ec4899" />
      <pointLight position={[0, 2.4, 0]} intensity={2} color="#c084fc" />
      <pointLight position={[0, 0.8, 3]} intensity={2.2} color="#e9d5ff" />
      <pointLight position={[0, -0.6, 1.5]} intensity={1.4} color="#c026d3" />

      <Suspense fallback={null}>
        <AvatarModel />
      </Suspense>
      <AssetWarmup />
      <Platform />
      <ContactShadows
        position={[0, -0.925, 0]}
        opacity={0.5}
        scale={1.85}
        blur={1.15}
        far={0.95}
        resolution={512}
        color="#000000"
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableZoom
        zoomSpeed={0.85}
        autoRotate={autoRotate}
        autoRotateSpeed={0.7}
        minDistance={2.6}
        maxDistance={5.5}
        minPolarAngle={DEFAULT_POLAR_MIN}
        maxPolarAngle={DEFAULT_POLAR_MAX}
        target={[0, AVATAR_CENTER_Y, 0]}
        enableDamping
        dampingFactor={0.08}
      />
      <CameraRig controlsRef={controlsRef} frameRef={frameRef} />
      <ZoomOverlaySync controlsRef={controlsRef} overlayRef={overlayRef} />
      <SnapshotBridge snapshotRef={snapshotRef} />
      <CanvasGrabCursor />

      {/* Light MSAA softens silhouette stairsteps; bloom still owns the glow look. */}
      <EffectComposer multisampling={msaa}>
        {/* High threshold so only genuinely emissive pixels bloom — a low one was
            hazing the shoes and the pedestal into the surrounding darkness. */}
        <Bloom
          mipmapBlur
          intensity={0.45}
          luminanceThreshold={0.62}
          luminanceSmoothing={0.12}
        />
      </EffectComposer>
    </Canvas>
  );
});
