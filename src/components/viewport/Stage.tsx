import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Vector3, type PerspectiveCamera } from "three";
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
}

/** World-space extents of the avatar plus its pedestal, measured from the source GLBs. */
const AVATAR_HEIGHT = 1.6;
const AVATAR_WIDTH = 1.4;
const AVATAR_CENTER_Y = -0.22;
/** Breathing room kept around the avatar so horns and shoes never clip the frame. */
const FRAME_MARGIN = 1.28;
/**
 * Stable object identity matters: an inline literal would make R3F re-apply the
 * starting position on every Stage render, snapping the orbit back to the front.
 */
const CAMERA_CONFIG = {
  position: [0, AVATAR_CENTER_Y, 3.5] as [number, number, number],
  fov: 30,
};
const DPR: [number, number] = [1, 2];
const GL_CONFIG = { antialias: true, preserveDrawingBuffer: true };

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
      const distance = Math.max(
        (AVATAR_HEIGHT * FRAME_MARGIN) / (2 * Math.tan(verticalFov / 2)),
        (AVATAR_WIDTH * FRAME_MARGIN) / (2 * Math.tan(horizontalFov / 2)),
      );

      const controls = controlsRef.current;
      TARGET.set(0, AVATAR_CENTER_Y, 0);
      ORBIT_DIRECTION.set(0, 0, 1);

      // Re-framing only ever changes how far back the camera sits; the angle the
      // user (or auto-rotate) has orbited to is carried over untouched.
      if (preserveOrbit && controls) {
        ORBIT_DIRECTION.copy(camera.position).sub(controls.target);
        if (ORBIT_DIRECTION.lengthSq() < 1e-8) ORBIT_DIRECTION.set(0, 0, 1);
        ORBIT_DIRECTION.normalize();
      }

      camera.position.copy(TARGET).addScaledVector(ORBIT_DIRECTION, distance);
      camera.updateProjectionMatrix();

      if (controls) {
        controls.target.copy(TARGET);
        controls.update();
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
  { autoRotate },
  ref,
) {
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
    <Canvas shadows dpr={DPR} camera={CAMERA_CONFIG} gl={GL_CONFIG}>
      <SpotlightBackground />

      <ambientLight intensity={0.7} />
      <directionalLight
        position={[2, 4, 2]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-2, 1.5, -1.2]} intensity={7} color="#a855f7" />
      <pointLight position={[2, 0.6, 1.4]} intensity={4.5} color="#ec4899" />
      <pointLight position={[0, 2.4, 0]} intensity={2} color="#c084fc" />
      <pointLight position={[0, 0.8, 3]} intensity={2.4} color="#e9d5ff" />
      <pointLight position={[0, -0.6, 1.5]} intensity={1.4} color="#c026d3" />

      <Suspense fallback={null}>
        <AvatarModel />
      </Suspense>
      <AssetWarmup />
      <Platform />
      <ContactShadows
        position={[0, -0.925, 0]}
        opacity={0.45}
        scale={1.9}
        blur={1.1}
        far={0.9}
        resolution={512}
        color="#000000"
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableZoom={false}
        autoRotate={autoRotate}
        autoRotateSpeed={1.4}
        minDistance={2.6}
        maxDistance={5.5}
        minPolarAngle={Math.PI / 2 - 0.45}
        maxPolarAngle={Math.PI / 2 + 0.3}
        target={[0, AVATAR_CENTER_Y, 0]}
        enableDamping
        dampingFactor={0.08}
      />
      <CameraRig controlsRef={controlsRef} frameRef={frameRef} />
      <SnapshotBridge snapshotRef={snapshotRef} />
      <CanvasGrabCursor />

      <EffectComposer multisampling={0}>
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
