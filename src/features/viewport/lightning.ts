// Bolt geometry for the category connectors. Shapes are generated in a fixed
// 100 x VIEW_HEIGHT space and stretched to the connector by the SVG viewBox, so
// a strike costs a few dozen floats and no layout work.

export const VIEW_HEIGHT = 34
export const MID = VIEW_HEIGHT / 2
export const BRANCH_COUNT = 3

/** Subdivision passes: each one doubles the segment count. */
const DETAIL = 5
/** How much the throw shrinks per pass — lower is smoother, higher is noisier. */
const ROUGHNESS = 0.56
const FIRST_THROW = 13
/** Both ends are pinned to the anchors, easing in over this much of the span. */
const ANCHOR_RAMP = 14
const MAX_THROW = 15

type Point = { x: number; y: number }
type Branch = { at: Point; points: Point[] }
export type Bolt = { spine: Point[]; branches: Branch[] }

/** Pins the bolt to its two anchor dots without flattening the middle. */
function anchorFalloff(x: number) {
  return Math.min(1, x / ANCHOR_RAMP, (100 - x) / ANCHOR_RAMP)
}

/**
 * Midpoint displacement — the standard way to get a bolt that reads as natural
 * lightning: every segment kinks by a random amount, and each pass kinks the
 * result again at half the scale, so the line is jagged at every zoom level.
 */
function displace(): Point[] {
  let points: Point[] = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ]
  let throwRange = FIRST_THROW

  for (let pass = 0; pass < DETAIL; pass += 1) {
    const next: Point[] = [points[0]]

    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i]
      const b = points[i + 1]
      const x = (a.x + b.x) / 2
      const y = (a.y + b.y) / 2 + (Math.random() - 0.5) * 2 * throwRange

      next.push({ x, y }, b)
    }

    points = next
    throwRange *= ROUGHNESS
  }

  return points.map(({ x, y }) => ({
    x,
    y: Math.max(-MAX_THROW, Math.min(MAX_THROW, y * anchorFalloff(x))),
  }))
}

/** A fork that peels off the spine, thinning out into nothing. */
function fork(at: Point): Branch {
  const steps = 3 + Math.floor(Math.random() * 3)
  const away = Math.random() < 0.5 ? -1 : 1
  const reach = 9 + Math.random() * 15

  const points: Point[] = []
  let { x, y } = at

  for (let i = 0; i < steps; i += 1) {
    x += (reach / steps) * (0.55 + Math.random() * 0.9)
    y += away * (1.6 + Math.random() * 3.4)
    points.push({ x, y: Math.max(-MAX_THROW, Math.min(MAX_THROW, y)) })
  }

  return { at, points }
}

export function strike(): Bolt {
  const spine = displace()
  const branches: Branch[] = []

  // Forks are taken from the middle stretch only — one at either anchor would
  // read as a stray line rather than as part of the bolt.
  for (let i = 0; i < BRANCH_COUNT; i += 1) {
    const index = Math.floor((0.25 + Math.random() * 0.5) * spine.length)
    branches.push(fork(spine[index]))
  }

  return { spine, branches }
}

/**
 * Both path builders take a single 0–1 charge: 0 collapses the bolt to the flat
 * resting line, 1 throws it to full amplitude. Interpolating that number is what
 * morphs the connector between its two states.
 */
export function spinePath(bolt: Bolt, charge: number) {
  let path = `M 0 ${MID}`

  for (let i = 1; i < bolt.spine.length; i += 1) {
    const point = bolt.spine[i]
    path += ` L ${point.x.toFixed(2)} ${(MID + point.y * charge).toFixed(2)}`
  }

  return path
}

/** Forks grow out of the spine as the charge rises, rather than fading in. */
export function branchPath(bolt: Bolt, index: number, charge: number) {
  const branch = bolt.branches[index]
  if (!branch) return `M 0 ${MID}`

  let path = `M ${branch.at.x.toFixed(2)} ${(MID + branch.at.y * charge).toFixed(2)}`

  for (const point of branch.points) {
    const x = branch.at.x + (point.x - branch.at.x) * charge
    path += ` L ${x.toFixed(2)} ${(MID + point.y * charge).toFixed(2)}`
  }

  return path
}
