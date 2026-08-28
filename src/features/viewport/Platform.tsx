/** Pedestal the avatar stands on. Procedural — the source assets ship no base mesh. */
const TOP_Y = -0.93

export function Platform() {
  return (
    <group position={[0, TOP_Y, 0]}>
      <mesh receiveShadow position={[0, -0.045, 0]}>
        <cylinderGeometry args={[0.64, 0.68, 0.09, 64]} />
        <meshStandardMaterial color="#120d1e" roughness={0.42} metalness={0.7} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.5, 0.545, 96]} />
        <meshBasicMaterial color="#d8b4fe" toneMapped={false} transparent opacity={0.85} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[0.6, 0.625, 96]} />
        <meshBasicMaterial color="#a855f7" toneMapped={false} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
