import { useGLTF, useTexture } from '@react-three/drei'
import { BODY_ASSET_PATH, CATALOG, DEFAULT_SELECTION } from '@/data/catalog'
// Deep import — avoid `@/features/viewport` barrel (Stage → AssetWarmup → preload cycle).
import { ASSET_TEXTURES, ALL_TEXTURE_URLS, collectTextureUrls } from '@/features/viewport/assetTextures'
import type { BuildSelection, CatalogItem } from '@/shared/types'

const MAGNETIC_IMAGE = '/magnetic.webp'

function equippedItems(selection: BuildSelection): CatalogItem[] {
  const ids: string[] = []
  for (const value of Object.values(selection)) {
    if (Array.isArray(value)) ids.push(...value)
    else if (typeof value === 'string') ids.push(value)
  }
  return ids
    .map((id) => CATALOG.find((entry) => entry.id === id))
    .filter((item): item is CatalogItem => Boolean(item))
}

/** Body plus the four parts that ship on the default build (~12 MB, not the full catalog). */
export const CRITICAL_GLB_PATHS = [
  BODY_ASSET_PATH,
  ...equippedItems(DEFAULT_SELECTION).map((item) => item.assetPath),
]

export const CRITICAL_PREVIEW_PATHS = [
  ...equippedItems(DEFAULT_SELECTION)
    .map((item) => item.previewPath)
    .filter((path): path is string => Boolean(path)),
]

export const CRITICAL_IMAGE_PATHS = [MAGNETIC_IMAGE, ...CRITICAL_PREVIEW_PATHS]

const criticalPending = new Set(CRITICAL_GLB_PATHS)
const readyListeners = new Set<() => void>()
let defaultAvatarReady = false

/** Called when a default-outfit part has assembled (or mounted with no intro). */
export function markCriticalAssetReady(path: string) {
  if (defaultAvatarReady) return
  criticalPending.delete(path)
  if (criticalPending.size > 0) return
  defaultAvatarReady = true
  for (const listener of readyListeners) listener()
  readyListeners.clear()
}

/** Fires once the default avatar is on screen, or after a timeout if load stalls. */
export function whenDefaultAvatarReady(cb: () => void) {
  if (defaultAvatarReady) {
    cb()
    return () => {}
  }

  let done = false
  const finish = () => {
    if (done) return
    done = true
    readyListeners.delete(finish)
    window.clearTimeout(timeout)
    cb()
  }

  readyListeners.add(finish)
  const timeout = window.setTimeout(() => {
    defaultAvatarReady = true
    finish()
  }, 8000)

  return () => {
    done = true
    readyListeners.delete(finish)
    window.clearTimeout(timeout)
  }
}

function criticalTextureUrls() {
  const urls = new Set<string>()
  for (const path of CRITICAL_GLB_PATHS) {
    for (const url of collectTextureUrls(ASSET_TEXTURES[path])) urls.add(url)
  }
  return [...urls]
}

type IdleWindow = typeof window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

function scheduleIdle(cb: () => void, timeout = 2500) {
  const w = window as IdleWindow
  if (typeof w.requestIdleCallback === 'function') {
    return w.requestIdleCallback(cb, { timeout })
  }
  return window.setTimeout(cb, 400)
}

/** Warm the default avatar in GLTFLoader's cache before the canvas mounts. */
export function preloadCritical3DAssets() {
  for (const path of CRITICAL_GLB_PATHS) useGLTF.preload(path)
  for (const url of criticalTextureUrls()) useTexture.preload(url)
}

/** Kick off thumbnail downloads without blocking the main thread. */
export function preloadCriticalImages() {
  for (const url of CRITICAL_IMAGE_PATHS) {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
  }
}

/** Remaining catalog GLBs and loose maps — after the default avatar is visible. */
export function scheduleDeferredCatalogPreload() {
  whenDefaultAvatarReady(() => {
    const criticalGlbs = new Set(CRITICAL_GLB_PATHS)
    const criticalTextures = new Set(criticalTextureUrls())
    const deferredGlbs = CATALOG.map((item) => item.assetPath).filter((path) => !criticalGlbs.has(path))
    const deferredTextures = ALL_TEXTURE_URLS.filter((url) => !criticalTextures.has(url))

    let glbIndex = 0
    let textureIndex = 0

    const step = () => {
      if (glbIndex < deferredGlbs.length) {
        useGLTF.preload(deferredGlbs[glbIndex])
        glbIndex += 1
        scheduleIdle(step)
        return
      }
      if (textureIndex < deferredTextures.length) {
        useTexture.preload(deferredTextures[textureIndex])
        textureIndex += 1
        scheduleIdle(step)
      }
    }

    scheduleIdle(step, 800)
  })
}
