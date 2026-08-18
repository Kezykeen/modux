import * as THREE from 'three'

export type TextureSlot = {
  map?: string
  normalMap?: string
  emissiveMap?: string
}

/**
 * Loose maps that ship beside the GLBs. Atlas-based parts already embed Atlas
 * and AtlasEmmission at full size, so those files stay as sources of truth
 * inside the GLB. We only bind a PNG when it fills a hole (Black Pants has no
 * normal) or replaces a stub (Cyber Moon variants, the 20KB torso colour).
 */
export type AssetTextureSpec = TextureSlot & {
  byMaterial?: Record<string, TextureSlot>
}

export const ASSET_TEXTURES: Record<string, AssetTextureSpec> = {
  [encodeURI('/assets/Body.glb')]: {
    byMaterial: {
      Head: { map: encodeURI('/assets/face.png') },
    },
  },
  [encodeURI('/assets/Pants/Black Pants.glb')]: {
    map: encodeURI('/assets/Pants/Pants_BaseColour.png'),
    normalMap: encodeURI('/assets/Pants/Pants_Normal.png'),
  },
  [encodeURI('/assets/Pants/Cyber Black Pants.glb')]: {
    byMaterial: {
      Trousers: {
        map: encodeURI('/assets/Pants/Pants_BaseColour.png'),
        normalMap: encodeURI('/assets/Pants/Pants_Normal.png'),
      },
    },
  },
  [encodeURI('/assets/Pants/Cyber Moon Pants/Cyber Moon Pants.glb')]: {
    byMaterial: {
      Trousers: {
        map: encodeURI('/assets/Pants/Cyber Moon Pants/CyberMoon_BaseColour.png'),
        normalMap: encodeURI('/assets/Pants/Pants_Normal.png'),
      },
    },
  },
  [encodeURI('/assets/Top/Techwear Top.glb')]: {
    byMaterial: {
      Jacket: {
        map: encodeURI('/assets/Top/Jacket_BaseColour.png'),
        normalMap: encodeURI('/assets/Top/Jacket_Normal.png'),
      },
      HoodieLogo: {
        map: encodeURI('/assets/Top/Torso_BaseColour.png'),
        normalMap: encodeURI('/assets/Top/Torso_Normal.png'),
      },
    },
  },
  [encodeURI('/assets/Top/Cyber Moon Top/Cyber Moon Top.glb')]: {
    byMaterial: {
      Jacket: {
        map: encodeURI('/assets/Top/Cyber Moon Top/CyberMoon_BaseColour.png'),
        normalMap: encodeURI('/assets/Top/Jacket_Normal.png'),
      },
      HoodieLogo: {
        map: encodeURI('/assets/Top/Torso_BaseColour.png'),
        normalMap: encodeURI('/assets/Top/Torso_Normal.png'),
      },
    },
  },
}

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
  if (!spec || !(material instanceof THREE.MeshStandardMaterial)) return material

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

  if (emissiveMap) {
    material.emissiveMap = prepareTexture(emissiveMap, 'color')
    // emissiveMap is multiplied by emissive; black (the glTF default) hides it.
    if (material.emissive.r + material.emissive.g + material.emissive.b < 0.01) {
      material.emissive.set('#ffffff')
    }
    if (material.emissiveIntensity < 0.01) {
      material.emissiveIntensity = 1
    }
  }

  material.needsUpdate = true
  return material
}
