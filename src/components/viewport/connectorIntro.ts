import { BURST_DURATION, TRACE_DURATION } from './assemblyTrace'

/** Matches the 3D canvas fade in ViewportPanel. */
export const STAGE_FADE_DURATION = 0.35

/**
 * Hold the six cards and lines until the avatar has finished assembling.
 * Stage fade + outline + burst, plus a short beat so the model can settle.
 */
export const CONNECTOR_GATE_MS = Math.round(
  (STAGE_FADE_DURATION + TRACE_DURATION + BURST_DURATION + 0.2) * 1000,
)

const ROW_STAGGER = 0.14
const SIDE_LAG = 0.08
/** Line starts drawing once the card has begun to land. */
const CARD_LEAD = 0.22

export const CONNECTOR_LINE_DURATION = 0.5

/** Hair/tops/pants are 0–2; weapons/accessories/shoes share those rows. */
export function connectorRow(index: number) {
  return index < 3 ? index : index - 3
}

/** Head-to-toe, left then right of each row. */
export function connectorCardDelay(index: number) {
  return connectorRow(index) * ROW_STAGGER + (index < 3 ? 0 : SIDE_LAG)
}

export function connectorLineDelay(index: number) {
  return connectorCardDelay(index) + CARD_LEAD
}

export function connectorLandingDelay(index: number) {
  return connectorLineDelay(index) + CONNECTOR_LINE_DURATION * 0.82
}
