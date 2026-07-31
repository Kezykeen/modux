import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CATALOG } from '../../data/catalog'
import { useBuild } from '../../state/BuildContext'
import type { CategoryId } from '../../types'

const DEFAULT_COLOR = '#413A52'
const SKIN_COLOR = '#e8c9a0'
const HAIR_DEFAULT = '#2a222f'

function useLerpedMaterial(hex: string, active: boolean) {
  const targetColor = useMemo(() => new THREE.Color(hex), [hex])
  const ref = useRef<THREE.Mesh>(null)
  const emissiveState = useRef(0.12)

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const mat = mesh.material as THREE.MeshStandardMaterial
    mat.color.lerp(targetColor, Math.min(1, delta * 6))
    const targetEmissive = active ? 0.9 : 0.12
    emissiveState.current = THREE.MathUtils.lerp(emissiveState.current, targetEmissive, Math.min(1, delta * 6))
    mat.emissiveIntensity = emissiveState.current
    const targetScale = active ? 1.06 : 1
    const s = THREE.MathUtils.lerp(mesh.scale.x, targetScale, Math.min(1, delta * 8))
    mesh.scale.setScalar(s)
  })

  return ref
}

function usePartColor(categoryId: CategoryId, fallback: string) {
  const { selection, hoveredCategory } = useBuild()
  const selectedId = selection[categoryId]
  const item = selectedId ? CATALOG.find((c) => c.id === selectedId) : undefined
  return {
    hex: item?.colorFrom ?? fallback,
    active: hoveredCategory === categoryId,
  }
}

function Capsule({
  categoryId,
  fallback,
  radius,
  length,
  position,
  rotation,
}: {
  categoryId: CategoryId
  fallback: string
  radius: number
  length: number
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  const { hex, active } = usePartColor(categoryId, fallback)
  const ref = useLerpedMaterial(hex, active)

  return (
    <mesh ref={ref} position={position} rotation={rotation} castShadow receiveShadow>
      <capsuleGeometry args={[radius, length, 6, 14]} />
      <meshStandardMaterial color={hex} emissive={hex} emissiveIntensity={0.12} roughness={0.35} metalness={0.55} />
    </mesh>
  )
}

function Box({
  categoryId,
  fallback,
  size,
  position,
}: {
  categoryId: CategoryId
  fallback: string
  size: [number, number, number]
  position: [number, number, number]
}) {
  const { hex, active } = usePartColor(categoryId, fallback)
  const ref = useLerpedMaterial(hex, active)

  return (
    <mesh ref={ref} position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={hex} emissive={hex} emissiveIntensity={0.12} roughness={0.4} metalness={0.4} />
    </mesh>
  )
}

function Hat() {
  const { selection } = useBuild()
  const item = selection.hats ? CATALOG.find((c) => c.id === selection.hats) : undefined
  if (!item) return null
  return (
    <group position={[0, 1.93, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.24, 0.27, 0.16, 20]} />
        <meshStandardMaterial color={item.colorFrom} emissive={item.colorFrom} emissiveIntensity={0.55} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.09, 0.05]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 20]} />
        <meshStandardMaterial color={item.colorTo} roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function Weapon() {
  const { selection } = useBuild()
  const item = selection.weapon ? CATALOG.find((c) => c.id === selection.weapon) : undefined
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.z = -0.5 + Math.sin(state.clock.elapsedTime * 1.4) * 0.03
  })

  if (!item) return null
  return (
    <group ref={groupRef} position={[0.42, 0.6, 0.08]} rotation={[0, 0, -0.5]}>
      <mesh castShadow>
        <boxGeometry args={[0.05, 0.75, 0.03]} />
        <meshStandardMaterial color={item.colorFrom} emissive={item.colorFrom} emissiveIntensity={0.8} roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.42, 0]} castShadow>
        <boxGeometry args={[0.11, 0.13, 0.04]} />
        <meshStandardMaterial color={item.colorTo} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function AvatarModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.y = -0.9 + Math.sin(state.clock.elapsedTime * 1.1) * 0.025
  })

  return (
    <group ref={groupRef}>
      <Capsule categoryId="hair" fallback={SKIN_COLOR} radius={0.17} length={0.06} position={[0, 1.58, 0]} />
      <Capsule categoryId="hair" fallback={HAIR_DEFAULT} radius={0.18} length={0.02} position={[0, 1.72, -0.02]} />
      <Hat />

      <Capsule categoryId="top" fallback={DEFAULT_COLOR} radius={0.2} length={0.36} position={[0, 1.14, 0]} />
      <Capsule categoryId="top" fallback={DEFAULT_COLOR} radius={0.068} length={0.38} position={[-0.27, 1.06, 0]} rotation={[0, 0, 0.1]} />
      <Capsule categoryId="top" fallback={DEFAULT_COLOR} radius={0.068} length={0.38} position={[0.27, 1.06, 0]} rotation={[0, 0, -0.1]} />

      <Capsule categoryId="pants" fallback={DEFAULT_COLOR} radius={0.195} length={0.12} position={[0, 0.78, 0]} />
      <Capsule categoryId="pants" fallback={DEFAULT_COLOR} radius={0.09} length={0.46} position={[-0.115, 0.38, 0]} />
      <Capsule categoryId="pants" fallback={DEFAULT_COLOR} radius={0.09} length={0.46} position={[0.115, 0.38, 0]} />

      <Box categoryId="shoes" fallback={DEFAULT_COLOR} size={[0.15, 0.08, 0.24]} position={[-0.115, 0.03, 0.05]} />
      <Box categoryId="shoes" fallback={DEFAULT_COLOR} size={[0.15, 0.08, 0.24]} position={[0.115, 0.03, 0.05]} />

      <Weapon />
    </group>
  )
}
