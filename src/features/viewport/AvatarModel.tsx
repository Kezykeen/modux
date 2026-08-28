import { Suspense, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CATALOG, BODY_ASSET_PATH } from '@/data/catalog';
import { useBuild, useHover } from '@/features/builder';
import { type CatalogItem, type CategoryId } from '@/shared/types';
import {
  BURST_DURATION,
  TRACE_DURATION,
  getTraceGeometry,
  hasTraceGeometry,
} from "./assemblyTrace";
import {
  getPreparedAsset,
  getTraceMaterials,
  markAssetMounted,
  resetTraceMaterials,
} from "./assetCache";
import { fireAssemblyBurstSfx, startAssemblySfx } from '@/audio';
import { markCriticalAssetReady } from '@/assets/preload';
import {
  ASSET_TEXTURES,
  textureUrlDict,
  type LoadedTexturesByUrl,
} from "./assetTextures";

const EMPTY_TEXTURES: LoadedTexturesByUrl = {}

function NativeAssetInner({
  path,
  highlighted = false,
  animateIn = false,
}: {
  path: string
  highlighted?: boolean
  animateIn?: boolean
}) {
  const spec = ASSET_TEXTURES[path]
  if (!spec) {
    return (
      <NativeAssetModel
        path={path}
        highlighted={highlighted}
        animateIn={animateIn}
        spec={undefined}
        textures={EMPTY_TEXTURES}
      />
    )
  }

  return (
    <NativeAssetTextured
      path={path}
      highlighted={highlighted}
      animateIn={animateIn}
      spec={spec}
    />
  )
}

function NativeAssetTextured({
  path,
  highlighted,
  animateIn,
  spec,
}: {
  path: string
  highlighted: boolean
  animateIn: boolean
  spec: NonNullable<(typeof ASSET_TEXTURES)[string]>
}) {
  const textures = useTexture(textureUrlDict(spec)) as LoadedTexturesByUrl
  return (
    <NativeAssetModel
      path={path}
      highlighted={highlighted}
      animateIn={animateIn}
      spec={spec}
      textures={textures}
    />
  )
}

function NativeAssetModel({
  path,
  highlighted = false,
  animateIn = false,
  spec,
  textures,
}: {
  path: string
  highlighted?: boolean
  animateIn?: boolean
  spec: (typeof ASSET_TEXTURES)[string] | undefined
  textures: LoadedTexturesByUrl
}) {
  const { scene } = useGLTF(path)
  const glow = useRef(0)
  const lastIntensity = useRef(-1)
  const assembly = useRef(0)
  const settled = useRef(!animateIn)
  const audible = useRef(false)
  const discharged = useRef(false)

  // Prepared once per asset and reused. Visibility belongs to the assembly
  // timeline — writing it here on every memo rerun is what made textured
  // parts vanish on hover and tab changes.
  const { model, uniforms } = useMemo(
    () => getPreparedAsset(path, scene, spec, textures),
    [path, scene, spec, textures],
  )

  useLayoutEffect(() => {
    // Hide only on the first paint of an incoming part so the outline can
    // draw first. Later renders must not touch this — the cache is shared.
    if (animateIn && !settled.current) model.visible = false
  }, [animateIn, model])

  useEffect(() => {
    markAssetMounted(path, true);
    if (settled.current) markCriticalAssetReady(path)
    return () => markAssetMounted(path, false);
  }, [path]);

  // Extracting the outline walks every mesh, so it is only ever done once per
  // asset. If the warm-up has already built it we use it on the spot; if not,
  // it waits a frame rather than blocking the one that applied the item.
  const [trace, setTrace] = useState<THREE.BufferGeometry | null>(() =>
    animateIn && hasTraceGeometry(path) ? getTraceGeometry(path, model) : null,
  );
  const [traceReady, setTraceReady] = useState(
    !animateIn || hasTraceGeometry(path),
  );

  useEffect(() => {
    if (!animateIn || traceReady) return;

    let cancelled = false;
    const handle = window.requestAnimationFrame(() => {
      if (cancelled) return;
      setTrace(getTraceGeometry(path, model));
      setTraceReady(true);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(handle);
    };
  }, [animateIn, traceReady, path, model]);

  const traceMaterials = useMemo(() => {
    if (!trace) return null;
    return getTraceMaterials(path, trace.userData.center as THREE.Vector3);
  }, [trace, path]);

  const traceGroup = useRef<THREE.Group>(null);
  const shockwaveGroup = useRef<THREE.Group>(null);
  // Hold the clock until the outline exists, so the charge sound still lines up
  // with the first visible stroke.
  const awaitingTrace = animateIn && !traceReady && !settled.current;

  useFrame((state, delta) => {
    if (settled.current && glow.current === 0 && !highlighted) return

    let burst = 0;

    if (!settled.current && !awaitingTrace) {
      if (!trace || !traceMaterials) {
        model.visible = true;
        settled.current = true;
        markCriticalAssetReady(path);
      } else {
        // Sound is started here, not on click, so a slow first frame can't
        // leave the audio running ahead of the outline.
        if (assembly.current === 0) {
          resetTraceMaterials(traceMaterials);
          audible.current = startAssemblySfx();
        }

        assembly.current += delta;
        const elapsed = assembly.current;
        const { stroke, shockwave } = traceMaterials;
        stroke.uniforms.uTime.value = state.clock.elapsedTime;
        shockwave.uniforms.uTime.value = state.clock.elapsedTime;

        if (elapsed < TRACE_DURATION) {
          const progress = elapsed / TRACE_DURATION;
          stroke.uniforms.uReveal.value = 1 - Math.pow(1 - progress, 3);
        } else if (elapsed < TRACE_DURATION + BURST_DURATION) {
          const discharge = (elapsed - TRACE_DURATION) / BURST_DURATION;
          const fade = (1 - discharge) * (1 - discharge);

          if (!discharged.current) {
            discharged.current = true;
            if (audible.current) fireAssemblyBurstSfx();
          }

          model.visible = true;
          stroke.uniforms.uReveal.value = 1;
          stroke.uniforms.uFlash.value = fade;
          stroke.uniforms.uOpacity.value = fade;
          stroke.uniforms.uJitter.value = 0.005 + fade * 0.022;

          shockwave.uniforms.uReveal.value = 1;
          shockwave.uniforms.uFlash.value = fade;
          shockwave.uniforms.uOpacity.value = fade * 0.7;
          if (shockwaveGroup.current) {
            shockwaveGroup.current.visible = true;
            shockwaveGroup.current.scale.setScalar(1 + discharge * 0.16);
          }

          burst = fade * 1.5;
        } else {
          model.visible = true;
          settled.current = true;
          markCriticalAssetReady(path);
          if (traceGroup.current) traceGroup.current.visible = false;
        }
      }
    }

    const target = highlighted ? 1 : 0;
    if (target !== 0 || glow.current !== 0) {
      glow.current = THREE.MathUtils.damp(glow.current, target, 7, delta);
      if (Math.abs(glow.current - target) < 0.002) glow.current = target;
    }

    // Slow breathing keeps the highlight alive without drawing attention to itself.
    const shimmer = 0.86 + Math.sin(state.clock.elapsedTime * 2.4) * 0.14;
    const intensity = Math.max(glow.current * shimmer, burst);
    if (intensity !== lastIntensity.current) {
      for (const uniform of uniforms) uniform.value = intensity;
      lastIntensity.current = intensity;
    }
  });

  const center = trace?.userData.center as THREE.Vector3 | undefined;

  return (
    <>
      <primitive object={model} />
      {trace && traceMaterials && center ? (
        <group ref={traceGroup}>
          <lineSegments
            geometry={trace}
            material={traceMaterials.stroke}
            dispose={null}
          />
          {/* Scales about the asset's centre rather than the avatar origin. */}
          <group ref={shockwaveGroup} position={center} visible={false}>
            <lineSegments
              geometry={trace}
              material={traceMaterials.shockwave}
              position={[-center.x, -center.y, -center.z]}
              dispose={null}
            />
          </group>
        </group>
      ) : null}
    </>
  );
}

/**
 * Own Suspense boundary: a newly selected part may briefly suspend on its GLB
 * or textures. Without this, the parent boundary unmounted the whole avatar
 * for a frame — which is what made rotation and bobbing look like they paused.
 */
function NativeAsset(props: {
  path: string;
  highlighted?: boolean;
  animateIn?: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <NativeAssetInner {...props} />
    </Suspense>
  );
}

const MemoNativeAsset = memo(NativeAsset);

function SelectedSlotAsset({
  categoryId,
}: {
  categoryId: Exclude<CategoryId, 'accessory' | 'weapon'>
}) {
  const { selection } = useBuild();
  const { hoveredCategory } = useHover();
  const selectedId = selection[categoryId];
  const item = selectedId
    ? CATALOG.find((catalogItem) => catalogItem.id === selectedId)
    : undefined;

  if (!item) return null;
  // Keyed by item so swapping a slot remounts and replays the assembly.
  return (
    <MemoNativeAsset
      key={item.id}
      path={item.assetPath}
      highlighted={hoveredCategory === categoryId}
      animateIn
    />
  );
}

function SelectedStack({ categoryId }: { categoryId: 'accessory' | 'weapon' }) {
  const { selection } = useBuild()
  const { hoveredCategory } = useHover()
  const equipped = (selection[categoryId] ?? [])
    .map((id) => CATALOG.find((catalogItem) => catalogItem.id === id))
    .filter((item): item is CatalogItem => Boolean(item))

  return (
    <>
      {equipped.map((item) => (
        <MemoNativeAsset
          key={item.id}
          path={item.assetPath}
          highlighted={hoveredCategory === categoryId}
          animateIn
        />
      ))}
    </>
  )
}

export function AvatarModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      -0.9 + Math.sin(state.clock.elapsedTime * 1.1) * 0.025;
  });

  return (
    <group ref={groupRef}>
      <MemoNativeAsset path={BODY_ASSET_PATH} />
      <SelectedSlotAsset categoryId="shoes" />
      <SelectedSlotAsset categoryId="pants" />
      <SelectedSlotAsset categoryId="top" />
      <SelectedSlotAsset categoryId="hair" />
      <SelectedStack categoryId="weapon" />
      <SelectedStack categoryId="accessory" />
    </group>
  );
}
