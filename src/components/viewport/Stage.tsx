import { forwardRef, useImperativeHandle, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { AvatarModel } from './AvatarModel'
import { Platform } from './Platform'

export interface StageHandle {
  reset: () => void
}

interface StageProps {
  autoRotate: boolean
}

export const Stage = forwardRef<StageHandle, StageProps>(function Stage({ autoRotate }, ref) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    reset: () => {
      controlsRef.current?.reset?.()
    },
  }))

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.85, 5.2], fov: 28 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#070510']} />
      <fog attach="fog" args={['#070510', 6, 11]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 4, 2]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-2, 1.5, -1.2]} intensity={7} color="#a855f7" />
      <pointLight position={[2, 0.6, 1.4]} intensity={4.5} color="#ec4899" />
      <pointLight position={[0, 2.4, 0]} intensity={2} color="#c084fc" />
      <pointLight position={[0, 0.8, 3]} intensity={2.4} color="#e9d5ff" />
      <pointLight position={[0, -0.6, 1.5]} intensity={3} color="#c026d3" />

      <Platform />
      <AvatarModel />

      <Sparkles count={35} scale={[2.6, 2, 2.6]} size={2.2} speed={0.25} color="#c084fc" opacity={0.5} position={[0, 0.6, 0]} />
      <ContactShadows position={[0, -0.9, 0]} opacity={0.65} scale={4} blur={2.6} far={2} color="#000000" />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={1.6}
        minDistance={3.6}
        maxDistance={6.5}
        minPolarAngle={Math.PI / 2 - 0.5}
        maxPolarAngle={Math.PI / 2 + 0.35}
        target={[0, 0.45, 0]}
        enableDamping
        dampingFactor={0.08}
      />

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.22} luminanceSmoothing={0.3} />
        <Vignette eskil={false} offset={0.25} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  )
})
