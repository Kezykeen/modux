import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

export function Platform() {
  const ringRef = useRef<Mesh>(null)
  const ring2Ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.25
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.18
  })

  return (
    <group position={[0, -0.9, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.06, 64]} />
        <meshStandardMaterial color="#0d0a16" roughness={0.35} metalness={0.75} />
      </mesh>

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[1.0, 1.07, 64]} />
        <meshBasicMaterial color="#d8b4fe" toneMapped={false} transparent opacity={1} />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.036, 0]}>
        <ringGeometry args={[1.14, 1.18, 64]} />
        <meshBasicMaterial color="#f0abfc" toneMapped={false} transparent opacity={0.85} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.037, 0]}>
        <ringGeometry args={[1.33, 1.37, 64]} />
        <meshBasicMaterial color="#c084fc" toneMapped={false} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
