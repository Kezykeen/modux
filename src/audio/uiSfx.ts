// Short interface sounds, synthesised to match the electric language of the
// connector bolts and the assembly burst.
import { getAudioContext, getNoiseBuffer, getSfxBus, releaseAfter } from './audioEngine'

const HOVER_LEVEL = 0.11
const REMOVE_LEVEL = 0.26
const CLICK_LEVEL = 0.18
/** Hovering across several cards quickly shouldn't machine-gun the crackle. */
const HOVER_THROTTLE_MS = 90
const CLICK_THROTTLE_MS = 45

let lastHover = 0
let lastClick = 0

/** A dry static tick, as if the connector had just arced. */
export function playHoverSfx() {
  const now = performance.now()
  if (now - lastHover < HOVER_THROTTLE_MS) return
  lastHover = now

  const ctx = getAudioContext()
  if (!ctx) return

  const start = ctx.currentTime
  const bus = ctx.createGain()
  bus.gain.value = HOVER_LEVEL
  bus.connect(getSfxBus(ctx))

  // Crackle — a narrow band of noise, gone almost as soon as it lands.
  const crackle = ctx.createBufferSource()
  crackle.buffer = getNoiseBuffer(ctx)
  // Random offset so repeated hovers never sample identical noise.
  const offset = Math.random()

  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 3.2
  band.frequency.setValueAtTime(2600, start)
  band.frequency.exponentialRampToValueAtTime(4600, start + 0.09)

  const crackleGain = ctx.createGain()
  crackleGain.gain.setValueAtTime(0.0001, start)
  crackleGain.gain.exponentialRampToValueAtTime(0.7, start + 0.005)
  crackleGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13)

  crackle.connect(band).connect(crackleGain).connect(bus)
  crackle.start(start, offset)
  crackle.stop(start + 0.15)

  // Arc — a thin descending tone that gives the tick a pitch.
  const arc = ctx.createOscillator()
  arc.type = 'triangle'
  arc.frequency.setValueAtTime(1900, start)
  arc.frequency.exponentialRampToValueAtTime(820, start + 0.11)

  const arcGain = ctx.createGain()
  arcGain.gain.setValueAtTime(0.0001, start)
  arcGain.gain.exponentialRampToValueAtTime(0.3, start + 0.008)
  arcGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12)

  arc.connect(arcGain).connect(bus)
  arc.start(start)
  arc.stop(start + 0.14)

  releaseAfter(bus, 0.35)
}

/** A tight confirm tick for tabs, toggles, and icon controls. */
export function playClickSfx() {
  const now = performance.now()
  if (now - lastClick < CLICK_THROTTLE_MS) return
  lastClick = now

  const ctx = getAudioContext()
  if (!ctx) return

  const start = ctx.currentTime
  const bus = ctx.createGain()
  bus.gain.value = CLICK_LEVEL
  bus.connect(getSfxBus(ctx))

  // Body — a short low thump so the click reads as a press, not a spark.
  const body = ctx.createOscillator()
  body.type = 'sine'
  body.frequency.setValueAtTime(220, start)
  body.frequency.exponentialRampToValueAtTime(110, start + 0.06)

  const bodyGain = ctx.createGain()
  bodyGain.gain.setValueAtTime(0.0001, start)
  bodyGain.gain.exponentialRampToValueAtTime(0.55, start + 0.004)
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08)

  body.connect(bodyGain).connect(bus)
  body.start(start)
  body.stop(start + 0.09)

  // Ping — the electric edge that matches the rest of the UI language.
  const ping = ctx.createOscillator()
  ping.type = 'triangle'
  ping.frequency.setValueAtTime(1640, start)
  ping.frequency.exponentialRampToValueAtTime(980, start + 0.07)

  const pingGain = ctx.createGain()
  pingGain.gain.setValueAtTime(0.0001, start)
  pingGain.gain.exponentialRampToValueAtTime(0.45, start + 0.003)
  pingGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09)

  ping.connect(pingGain).connect(bus)
  ping.start(start)
  ping.stop(start + 0.1)

  // Tip — a hair of noise so it doesn't sound like a pure beep.
  const tip = ctx.createBufferSource()
  tip.buffer = getNoiseBuffer(ctx)

  const tipBand = ctx.createBiquadFilter()
  tipBand.type = 'bandpass'
  tipBand.Q.value = 2.4
  tipBand.frequency.setValueAtTime(3200, start)

  const tipGain = ctx.createGain()
  tipGain.gain.setValueAtTime(0.0001, start)
  tipGain.gain.exponentialRampToValueAtTime(0.28, start + 0.002)
  tipGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05)

  tip.connect(tipBand).connect(tipGain).connect(bus)
  tip.start(start, Math.random())
  tip.stop(start + 0.06)

  releaseAfter(bus, 0.22)
}

/** Power-down: the inverse gesture of the assembly burst. */
export function playRemoveSfx() {
  const ctx = getAudioContext()
  if (!ctx) return

  const start = ctx.currentTime
  const bus = ctx.createGain()
  bus.gain.value = REMOVE_LEVEL
  bus.connect(getSfxBus(ctx))

  // Drain — a falling tone behind a closing filter.
  const drain = ctx.createOscillator()
  drain.type = 'sawtooth'
  drain.frequency.setValueAtTime(560, start)
  drain.frequency.exponentialRampToValueAtTime(88, start + 0.3)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.Q.value = 4
  lowpass.frequency.setValueAtTime(3200, start)
  lowpass.frequency.exponentialRampToValueAtTime(260, start + 0.32)

  const drainGain = ctx.createGain()
  drainGain.gain.setValueAtTime(0.0001, start)
  drainGain.gain.exponentialRampToValueAtTime(0.6, start + 0.02)
  drainGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.36)

  drain.connect(lowpass).connect(drainGain).connect(bus)
  drain.start(start)
  drain.stop(start + 0.38)

  // Vent — the short hiss of the part dissolving off the model.
  const vent = ctx.createBufferSource()
  vent.buffer = getNoiseBuffer(ctx)

  const ventFilter = ctx.createBiquadFilter()
  ventFilter.type = 'bandpass'
  ventFilter.Q.value = 1.4
  ventFilter.frequency.setValueAtTime(3800, start)
  ventFilter.frequency.exponentialRampToValueAtTime(600, start + 0.26)

  const ventGain = ctx.createGain()
  ventGain.gain.setValueAtTime(0.0001, start)
  ventGain.gain.exponentialRampToValueAtTime(0.4, start + 0.012)
  ventGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3)

  vent.connect(ventFilter).connect(ventGain).connect(bus)
  vent.start(start, Math.random())
  vent.stop(start + 0.32)

  releaseAfter(bus, 0.6)
}
