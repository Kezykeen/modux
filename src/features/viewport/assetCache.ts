// Prepared avatar parts, cached for the lifetime of the page.
//
// Cloning a GLB and cloning its materials is cheap; what is not cheap is what
// the GPU does the first time those materials are drawn — link a shader program
// and upload every texture. Building fresh materials on each apply (and
// disposing them on each remove) meant paying that cost on every single toggle,
// which stalled the frame and made the avatar's rotation stutter. Preparing an
// asset once and reusing it keeps repeat applies free.
import * as THREE from 'three'
import { applyAssetTextures, styleKitMaterial, type AssetTextureSpec, type LoadedTexturesByUrl } from './assetTextures'
import { createTraceMaterial } from './assemblyTrace'

const GLOW_COLOR = new THREE.Color('#cbaaff')

export type GlowUniform = { value: number }

export type PreparedAsset = {
  model: THREE.Object3D
  uniforms: GlowUniform[]
}

export type TraceMaterials = {
  stroke: THREE.ShaderMaterial
  shockwave: THREE.ShaderMaterial
}

const assets = new Map<string, PreparedAsset>()
const traceMaterials = new Map<string, TraceMaterials>()
const mounted = new Set<string>()

/**
 * Adds a view-dependent rim term to a material's emissive output, so a hovered
 * part catches light along its silhouette instead of washing out uniformly.
 */
function withRimGlow(source: THREE.Material) {
  const material = source.clone()
  const uniform: GlowUniform = { value: 0 }

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uGlow = uniform
    shader.uniforms.uGlowColor = { value: GLOW_COLOR }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uGlow;\nuniform vec3 uGlowColor;',
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float rim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.4);
        totalEmissiveRadiance += uGlowColor * uGlow * (0.08 + rim * 1.05);`,
      )
  }
  material.customProgramCacheKey = () => 'modux-rim-glow'

  return { material, uniform }
}

/**
 * Fold GLTF node scale/rotation (the 0.01 + 90° X Blender export) into the
 * mesh geometry. Outlines and shaders then share the same local space as the
 * drawn triangles — without this, EdgesGeometry is in centimetres while the
 * mesh is in metres, and the assembly stroke is wildly oversized.
 */
function bakeNodeTransforms(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true)
  const rootInverse = root.matrixWorld.clone().invert()
  const relative = new THREE.Matrix4()
  const meshes: THREE.Mesh[] = []

  root.traverse((object) => {
    if (object instanceof THREE.Mesh) meshes.push(object)
  })

  // Multi-material GLBs split one node into a group plus child meshes. The
  // scale lives on the group; baking it into the geometry and leaving the
  // group in place applies it twice (body and head collapse).
  for (const object of meshes) {
    relative.multiplyMatrices(rootInverse, object.matrixWorld)
    const geometry = object.geometry.clone()
    geometry.applyMatrix4(relative)
    if (geometry.attributes.tangent) geometry.deleteAttribute('tangent')
    object.geometry = geometry
  }

  root.traverse((object) => {
    object.position.set(0, 0, 0)
    object.quaternion.identity()
    object.scale.set(1, 1, 1)
    object.rotation.set(0, 0, 0)
  })

  root.updateMatrixWorld(true)
}

const MIRROR_X = new THREE.Matrix4().makeScale(-1, 1, 1)

/** Duplicate a one-sided posed mesh onto the opposite side of the figure. */
function mirrorGeometryX(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const geometry = object.geometry.clone()
    geometry.applyMatrix4(MIRROR_X)
    const index = geometry.index
    if (index) {
      const arr = index.array
      for (let i = 0; i < arr.length; i += 3) {
        const tmp = arr[i]!
        arr[i] = arr[i + 2]!
        arr[i + 2] = tmp
      }
      index.needsUpdate = true
    }
    if (geometry.attributes.tangent) geometry.deleteAttribute('tangent')
    geometry.computeVertexNormals()
    object.geometry = geometry
  })
}

/**
 * The clone, its rim-glow materials and its bound textures, built on first use.
 * Cache keys are unique per mounted instance — a mirrored copy cannot share
 * the original Object3D.
 */
export function getPreparedAsset(
  path: string,
  scene: THREE.Object3D,
  spec: AssetTextureSpec | undefined,
  textures: LoadedTexturesByUrl,
  cacheKey = path,
): PreparedAsset {
  const cached = assets.get(cacheKey)
  if (cached) return cached

  const model = scene.clone(true)
  bakeNodeTransforms(model)
  if (cacheKey.endsWith('#mirror-x')) mirrorGeometryX(model)
  const uniforms: GlowUniform[] = []

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.castShadow = true
    object.receiveShadow = true

    const applied = (
      Array.isArray(object.material) ? object.material : [object.material]
    ).map((entry: THREE.Material) => {
      const { material, uniform } = withRimGlow(entry)
      applyAssetTextures(object, material, spec, textures)
      styleKitMaterial(path, material)
      if (material instanceof THREE.MeshStandardMaterial) {
        const maps = [material.map, material.normalMap, material.emissiveMap, material.roughnessMap]
        for (const map of maps) {
          if (map) map.anisotropy = Math.max(map.anisotropy, 8)
        }
      }
      uniforms.push(uniform)
      return material
    })
    object.material = Array.isArray(object.material) ? applied : applied[0]
  })

  const prepared = { model, uniforms }
  assets.set(cacheKey, prepared)
  return prepared
}

export function getTraceMaterials(
  path: string,
  center: THREE.Vector3,
  radius = 0.25,
): TraceMaterials {
  const cached = traceMaterials.get(path)
  if (cached) return cached

  const built = {
    stroke: createTraceMaterial(center, radius),
    shockwave: createTraceMaterial(center, radius),
  }
  traceMaterials.set(path, built)
  return built
}

/** Reused materials carry the last assembly's uniforms; rewind them. */
export function resetTraceMaterials(materials: TraceMaterials) {
  for (const material of [materials.stroke, materials.shockwave]) {
    material.uniforms.uReveal.value = 0
    material.uniforms.uFlash.value = 0
    material.uniforms.uOpacity.value = 1
    material.uniforms.uJitter.value = material.userData.restJitter ?? 0.0008
  }
}

/** Warming must not touch a part that is currently on the avatar. */
export function markAssetMounted(path: string, isMounted: boolean) {
  if (isMounted) mounted.add(path)
  else mounted.delete(path)
}

export function isAssetMounted(path: string) {
  return mounted.has(path)
}
