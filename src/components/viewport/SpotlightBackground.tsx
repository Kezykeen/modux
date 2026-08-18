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

export function SpotlightBackground() {
  const scene = useThree((state) => state.scene)
  const texture = useMemo(() => createBackgroundTexture(), [])

  useEffect(() => {
    if (!texture) return
    scene.background = texture
    return () => {
      scene.background = null
      texture.dispose()
    }
  }, [scene, texture])

  return null
}
