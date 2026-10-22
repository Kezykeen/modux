// Prepares every catalog part before it is ever selected.
//
// The expensive parts of applying an item are one-offs: linking the shader
// program, uploading the textures and extracting the outline. Doing them during
// idle time means the first apply of an item costs no more than the second, and
// the avatar keeps turning throughout.
import { Suspense, useEffect, useState } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CRITICAL_GLB_PATHS, whenDefaultAvatarReady } from '@/assets/preload'
import { useBuild } from '@/features/builder'
import { ASSET_TEXTURES, textureUrlDict, type LoadedTexturesByUrl } from './assetTextures'
import { getPreparedAsset, getTraceMaterials, isAssetMounted } from './assetCache'
import { getTraceGeometry } from './assemblyTrace'

function warmPaths(catalogPaths: string[]) {
  return catalogPaths.filter((path) => !CRITICAL_GLB_PATHS.includes(path))
}

type IdleWindow = typeof window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

function scheduleIdle(cb: () => void) {
  const w = window as IdleWindow
  if (typeof w.requestIdleCallback === 'function') {
    return w.requestIdleCallback(cb, { timeout: 2000 })
  }
  return window.setTimeout(cb, 300)
}

function cancelIdle(handle: number) {
  const w = window as IdleWindow
  if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(handle)
  else window.clearTimeout(handle)
}

function WarmAsset({ path }: { path: string }) {
  const spec = ASSET_TEXTURES[path]
  if (spec) return <WarmAssetTextured path={path} spec={spec} />
  return <WarmAssetModel path={path} spec={undefined} textures={{}} />
}

function WarmAssetTextured({
  path,
  spec,
}: {
  path: string
  spec: NonNullable<(typeof ASSET_TEXTURES)[string]>
}) {
  const textures = useTexture(textureUrlDict(spec)) as LoadedTexturesByUrl
  return <WarmAssetModel path={path} spec={spec} textures={textures} />
}

function WarmAssetModel({
  path,
  spec,
  textures,
}: {
  path: string
  spec: (typeof ASSET_TEXTURES)[string] | undefined
  textures: LoadedTexturesByUrl
}) {
  const { scene } = useGLTF(path)
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const rootScene = useThree((state) => state.scene)

  useEffect(() => {
    // A part already on the avatar is warmed by being drawn, and its visibility
    // belongs to the assembly animation.
    if (isAssetMounted(path)) return

    const asset = getPreparedAsset(path, scene, spec, textures)
    const trace = getTraceGeometry(path, asset.model)

    // Compile a detached copy so we never toggle the cached instance that
    // the avatar is (or will be) displaying.
    const compileRoot = asset.model.clone(true)
    compileRoot.visible = true

    const targets: THREE.Object3D[] = [compileRoot]
    if (trace) {
      const materials = getTraceMaterials(
        path,
        trace.userData.center as THREE.Vector3,
        (trace.userData.radius as number | undefined) ?? 0.25,
      )
      targets.push(new THREE.LineSegments(trace, materials.stroke))
    }

    void Promise.all(
      targets.map((target) => gl.compileAsync(target, camera, rootScene)),
    ).catch(() => {
      // A failed warm-up only means the first apply pays the usual cost.
    })

    // Textures otherwise upload on first draw, which is its own stall.
    for (const texture of Object.values(textures)) {
      if (texture) gl.initTexture(texture)
    }

    return undefined
  }, [path, scene, spec, textures, gl, camera, rootScene])

  return null
}

export function AssetWarmup() {
  const { kit } = useBuild()
  const [admitted, setAdmitted] = useState<string[]>([])

  // Unused catalog parts wait until the default avatar is on screen so they
  // never compete with the first download or compile.
  useEffect(() => {
    let cancelled = false
    let index = 0
    let handle = 0

    setAdmitted([])
    const paths = warmPaths([
      ...kit.bodyPaths,
      ...kit.catalog.map((item) => item.assetPath),
    ])

    const admit = () => {
      if (cancelled || index >= paths.length) return
      const next = paths[index]
      index += 1
      setAdmitted((previous) => [...previous, next])
      handle = scheduleIdle(admit)
    }

    const kitUsesLandingPreload = paths.every((path) => CRITICAL_GLB_PATHS.includes(path))
      || kit.bodyPaths.some((path) => CRITICAL_GLB_PATHS.includes(path))

    const stopReady = kitUsesLandingPreload
      ? whenDefaultAvatarReady(() => {
          if (cancelled) return
          handle = scheduleIdle(admit)
        })
      : (() => {
          handle = scheduleIdle(admit)
          return () => {}
        })()

    return () => {
      cancelled = true
      stopReady()
      cancelIdle(handle)
    }
  }, [kit.id, kit.bodyPaths, kit.catalog])

  return (
    <>
      {admitted.map((path) => (
        <Suspense key={path} fallback={null}>
          <WarmAsset path={path} />
        </Suspense>
      ))}
    </>
  )
}
