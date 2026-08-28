// Prepared avatar parts, cached for the lifetime of the page.
//
// Cloning a GLB and cloning its materials is cheap; what is not cheap is what
// the GPU does the first time those materials are drawn — link a shader program
// and upload every texture. Building fresh materials on each apply (and
// disposing them on each remove) meant paying that cost on every single toggle,
// which stalled the frame and made the avatar's rotation stutter. Preparing an
// asset once and reusing it keeps repeat applies free.
import * as THREE from 'three'
import { applyAssetTextures, type AssetTextureSpec, type LoadedTexturesByUrl } from './assetTextures'
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
 * The clone, its rim-glow materials and its bound textures, built on first use.
 * Every catalog path maps to exactly one avatar slot, so a single shared
 * instance per path can never be mounted in two places at once.
 */
export function getPreparedAsset(
  path: string,
  scene: THREE.Object3D,
  spec: AssetTextureSpec | undefined,
  textures: LoadedTexturesByUrl,
): PreparedAsset {
  const cached = assets.get(path)
  if (cached) return cached

  const model = scene.clone(true)
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
      uniforms.push(uniform)
      return material
    })
    object.material = Array.isArray(object.material) ? applied : applied[0]
  })

  const prepared = { model, uniforms }
  assets.set(path, prepared)
  return prepared
}

export function getTraceMaterials(path: string, center: THREE.Vector3): TraceMaterials {
  const cached = traceMaterials.get(path)
  if (cached) return cached

  const built = { stroke: createTraceMaterial(center), shockwave: createTraceMaterial(center) }
  traceMaterials.set(path, built)
  return built
}

/** Reused materials carry the last assembly's uniforms; rewind them. */
export function resetTraceMaterials(materials: TraceMaterials) {
  for (const material of [materials.stroke, materials.shockwave]) {
    material.uniforms.uReveal.value = 0
    material.uniforms.uFlash.value = 0
    material.uniforms.uOpacity.value = 1
    material.uniforms.uJitter.value = 0.005
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
