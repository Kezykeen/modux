import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Near-flat void with a single soft pool of light behind the avatar. Painted to a
 * texture and attached as the scene background, which three renders screen-aligned
 * — so it stays perfectly still while the camera orbits.
 */
function createBackgroundTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  ctx.fillStyle = '#050308'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const spotlight = ctx.createRadialGradient(256, 226, 8, 256, 226, 288)
  spotlight.addColorStop(0, 'rgba(124,58,237,0.38)')
  spotlight.addColorStop(0.32, 'rgba(91,33,182,0.19)')
  spotlight.addColorStop(0.62, 'rgba(46,16,101,0.07)')
  spotlight.addColorStop(1, 'rgba(5,3,8,0)')
  ctx.fillStyle = spotlight
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Dark violet IBL so metals pick up purple rays without a bright studio HDR. */
function createPurpleEnvironment(gl: THREE.WebGLRenderer) {
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color('#0a0612')
  envScene.add(new THREE.HemisphereLight('#a78bfa', '#050308', 0.65))
  // Strong key from left to match the main purple rim
  const key = new THREE.PointLight('#a855f7', 4.8, 14)
  key.position.set(-2.8, 2.2, 0.8)
  envScene.add(key)
  const fill = new THREE.PointLight('#c084fc', 2.4, 11)
  fill.position.set(2.2, 1.2, -1.0)
  envScene.add(fill)
  const accent = new THREE.PointLight('#7c3aed', 1.6, 9)
  accent.position.set(-1.2, -0.8, 2.2)
  envScene.add(accent)

  const pmrem = new THREE.PMREMGenerator(gl)
  const map = pmrem.fromScene(envScene, 0.06, 0.1, 12).texture
  pmrem.dispose()
  return map
}

export function SpotlightBackground() {
  const scene = useThree((state) => state.scene)
  const gl = useThree((state) => state.gl)
  const background = useMemo(() => createBackgroundTexture(), [])
  const environment = useMemo(() => createPurpleEnvironment(gl), [gl])

  useEffect(() => {
    if (background) scene.background = background
    scene.environment = environment
    // Deliberately faint: it exists to give the kit's metal parts something
    // violet to reflect. Without tone mapping to roll off highlights, anything
    // higher clips the shoulders and hair tips to white.
    scene.environmentIntensity = 0.14
    return () => {
      scene.background = null
      scene.environment = null
      background?.dispose()
      environment.dispose()
    }
  }, [scene, background, environment])

  return null
}
