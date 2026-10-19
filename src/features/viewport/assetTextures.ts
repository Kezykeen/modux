import * as THREE from 'three'

export type TextureSlot = {
  map?: string
  normalMap?: string
  emissiveMap?: string
}

/**
 * Loose maps that ship beside the GLBs. Atlas-based parts already embed Atlas
 * at full size, so those files stay as sources of truth inside the GLB. We only
 * bind a PNG when it fills a hole or replaces a stub.
 *
 * The current ninja kit embeds base color + normals, so this map is empty until
 * a part needs an override.
 */
export type AssetTextureSpec = TextureSlot & {
  byMaterial?: Record<string, TextureSlot>
}

export const ASSET_TEXTURES: Record<string, AssetTextureSpec> = {}

export function collectTextureUrls(spec?: AssetTextureSpec) {
  if (!spec) return []
  const urls = [spec.map, spec.normalMap, spec.emissiveMap]
  if (spec.byMaterial) {
    for (const slot of Object.values(spec.byMaterial)) {
      urls.push(slot.map, slot.normalMap, slot.emissiveMap)
    }
  }
  return [...new Set(urls.filter((url): url is string => Boolean(url)))]
}

export const ALL_TEXTURE_URLS = [
  ...new Set(Object.values(ASSET_TEXTURES).flatMap((spec) => collectTextureUrls(spec))),
]

const TEXTURE_DICTS = new Map<AssetTextureSpec, Record<string, string>>()

export function textureUrlDict(spec?: AssetTextureSpec): Record<string, string> {
  if (!spec) return {}
  const cached = TEXTURE_DICTS.get(spec)
  if (cached) return cached

  const urls = collectTextureUrls(spec)
  const dict = Object.fromEntries(urls.map((url) => [url, url]))
  TEXTURE_DICTS.set(spec, dict)
  return dict
}

const PREPARED = Symbol('modux-prepared-texture')

type PreparableTexture = THREE.Texture & { [PREPARED]?: boolean }

/**
 * glTF UVs expect flipY = false; TextureLoader defaults the opposite.
 *
 * Textures are shared between assets, so this runs more than once for the same
 * image. Raising needsUpdate again would re-upload it to the GPU — a stall
 * measured in whole frames for the 2K maps — so settings are applied once.
 */
function prepareTexture(texture: THREE.Texture, kind: 'color' | 'data') {
  const prepared = texture as PreparableTexture
  if (prepared[PREPARED]) return texture

  texture.flipY = false
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = kind === 'color' ? THREE.SRGBColorSpace : THREE.NoColorSpace
  texture.anisotropy = Math.max(texture.anisotropy, 8)
  texture.needsUpdate = true
  prepared[PREPARED] = true
  return texture
}

export type LoadedTexturesByUrl = Record<string, THREE.Texture>

/**
 * Binds loose maps onto a standard material and ensures the mesh can sample
 * normals (tangents are absent from every shipped GLB).
 */
export function applyAssetTextures(
  mesh: THREE.Mesh,
  material: THREE.Material,
  spec: AssetTextureSpec | undefined,
  textures: LoadedTexturesByUrl,
) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return material

  ensureTangents(mesh)

  if (material.normalMap) {
    material.normalScale.set(1, 1)
  }

  material.envMapIntensity = 0.35

  if (spec) {
    const slot = spec.byMaterial?.[material.name] ?? spec
    const map = slot.map ? textures[slot.map] : undefined
    const normalMap = slot.normalMap ? textures[slot.normalMap] : undefined
    const emissiveMap = slot.emissiveMap ? textures[slot.emissiveMap] : undefined

    if (map) {
      material.map = prepareTexture(map, 'color')
    }

    if (normalMap) {
      material.normalMap = prepareTexture(normalMap, 'data')
      material.normalScale.set(1, 1)
    }

    if (emissiveMap) {
      material.emissiveMap = prepareTexture(emissiveMap, 'color')
      if (material.emissive.r + material.emissive.g + material.emissive.b < 0.01) {
        material.emissive.set('#ffffff')
      }
      if (material.emissiveIntensity < 0.01) {
        material.emissiveIntensity = 1
      }
    }
  }

  material.needsUpdate = true
  return material
}

/** Hook for path-specific look tweaks. The chibi kit ships balanced PBR, so this is a no-op. */
export function styleKitMaterial(_path: string, material: THREE.Material) {
  return material
}

/** Designer GLBs embed normals but omit tangents — compute once per mesh. */
function ensureTangents(mesh: THREE.Mesh) {
  const { geometry } = mesh
  if (
    geometry instanceof THREE.BufferGeometry &&
    geometry.index &&
    geometry.attributes.normal &&
    geometry.attributes.uv &&
    !geometry.attributes.tangent
  ) {
    geometry.computeTangents()
  }
}
