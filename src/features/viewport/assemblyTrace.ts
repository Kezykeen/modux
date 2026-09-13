import * as THREE from 'three'

/** Seconds spent drawing the outline before the mesh materialises. */
export const TRACE_DURATION = 0.62
/** Seconds of discharge once the outline closes. */
export const BURST_DURATION = 0.36

/** Only edges past this angle survive, which keeps the trace readable and cheap. */
const EDGE_ANGLE = 26

const geometryCache = new Map<string, THREE.BufferGeometry | null>()

/**
 * Silhouette edges of an asset, flattened into one buffer in the avatar's local
 * space. Cached per asset path — the same GLB always yields the same outline, so
 * re-selecting an item never pays the extraction cost twice.
 */
export function getTraceGeometry(cacheKey: string, root: THREE.Object3D) {
  const cached = geometryCache.get(cacheKey)
  if (cached !== undefined) return cached

  const geometry = buildTraceGeometry(root)
  geometryCache.set(cacheKey, geometry)
  return geometry
}

/** Whether the outline is already built, so callers can skip the deferral. */
export function hasTraceGeometry(cacheKey: string) {
  return geometryCache.has(cacheKey)
}

function buildTraceGeometry(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true)

  const toLocal = root.matrixWorld.clone().invert()
  const matrix = new THREE.Matrix4()
  const vertex = new THREE.Vector3()
  const points: number[] = []

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    const edges = new THREE.EdgesGeometry(object.geometry, EDGE_ANGLE)
    const position = edges.getAttribute('position')
    matrix.multiplyMatrices(toLocal, object.matrixWorld)

    for (let i = 0; i < position.count; i += 1) {
      vertex.fromBufferAttribute(position, i).applyMatrix4(matrix)
      points.push(vertex.x, vertex.y, vertex.z)
    }

    edges.dispose()
  })

  if (points.length === 0) return null

  const positions = new Float32Array(points)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.computeBoundingBox()

  const center = new THREE.Vector3()
  geometry.boundingBox?.getCenter(center)

  // Ordering vertices by their angle around the centre makes the reveal sweep
  // around the perimeter, so the stroke reads as drawing the shape.
  const progress = new Float32Array(positions.length / 3)
  for (let i = 0; i < progress.length; i += 1) {
    const x = positions[i * 3] - center.x
    const y = positions[i * 3 + 1] - center.y
    progress[i] = (Math.atan2(y, x) + Math.PI) / (Math.PI * 2)
  }
  geometry.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1))
  geometry.computeBoundingSphere()
  geometry.userData.center = center
  geometry.userData.radius = geometry.boundingSphere?.radius ?? 0.2

  return geometry
}

const vertexShader = /* glsl */ `
  attribute float aProgress;
  uniform float uTime;
  uniform float uJitter;
  uniform vec3 uCenter;
  varying float vProgress;

  void main() {
    vProgress = aProgress;

    vec3 offset = position - uCenter;
    float noise = sin(position.x * 91.7 + position.y * 47.3 + position.z * 63.1 + uTime * 34.0);
    vec3 displaced = position + normalize(offset + 1e-4) * noise * uJitter;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uReveal;
  uniform float uFlash;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uHeadColor;
  varying float vProgress;

  void main() {
    float drawn = uReveal - vProgress;
    if (drawn < 0.0) discard;

    float head = exp(-drawn * 22.0);
    float tail = 0.16 + 0.5 * exp(-drawn * 2.2);
    float intensity = (tail + head * 2.2 + uFlash * 1.8) * uOpacity;

    vec3 color = mix(uColor, uHeadColor, clamp(head + uFlash, 0.0, 1.0));
    gl_FragColor = vec4(color * intensity, clamp(intensity, 0.0, 1.0));
  }
`

export function createTraceMaterial(center: THREE.Vector3, radius = 0.25) {
  const restJitter = THREE.MathUtils.clamp(radius * 0.016, 0.00028, 0.0024)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uReveal: { value: 0 },
      uFlash: { value: 0 },
      uOpacity: { value: 1 },
      uTime: { value: 0 },
      uJitter: { value: restJitter },
      uCenter: { value: center.clone() },
      uColor: { value: new THREE.Color('#8b5cf6') },
      uHeadColor: { value: new THREE.Color('#f3e8ff') },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
  material.userData.restJitter = restJitter
  return material
}
