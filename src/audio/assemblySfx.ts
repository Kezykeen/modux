// Driven by the assembly animation's own frame loop rather than by the click, so
// a slow first paint can never desync the audio from the outline it accompanies.
import { TRACE_DURATION } from '@/features/viewport'
import {
  getAudioContext,
  getNoiseBuffer,
  getSaturationCurve,
  getSfxBus,
  releaseAfter,
} from './audioEngine'

const CHARGE_LEVEL = 0.2
const BURST_LEVEL = 0.42
/** A selection has to reach the model within this window to stay armed. */
const ARM_WINDOW_MS = 2500

let armedAt = 0

/**
 * Marks an item as applied. The charge only actually sounds once the model
 * starts drawing it, so page-load assemblies stay silent.
 */
export function armAssemblySfx() {
  getAudioContext()
  armedAt = performance.now()
}

/**
 * Called on the first frame of the outline trace. Returns whether the sound is
 * playing, so the caller knows whether to fire the matching burst.
 */
export function startAssemblySfx() {
  if (performance.now() - armedAt > ARM_WINDOW_MS) return false
  armedAt = 0

  const ctx = getAudioContext()
  if (!ctx) return false

  const start = ctx.currentTime
  const impact = start + TRACE_DURATION

  const bus = ctx.createGain()
  bus.gain.value = CHARGE_LEVEL
  bus.connect(getSfxBus(ctx))

  // A filtered tone climbing in step with the outline drawing itself.
  const charge = ctx.createOscillator()
  charge.type = 'sawtooth'
  charge.frequency.setValueAtTime(90, start)
  charge.frequency.exponentialRampToValueAtTime(720, impact)

  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 8
  band.frequency.setValueAtTime(260, start)
  band.frequency.exponentialRampToValueAtTime(2600, impact)

  const chargeGain = ctx.createGain()
  chargeGain.gain.setValueAtTime(0.0001, start)
  chargeGain.gain.exponentialRampToValueAtTime(0.5, impact - 0.03)
  chargeGain.gain.exponentialRampToValueAtTime(0.0001, impact + 0.02)

  charge.connect(band).connect(chargeGain).connect(bus)
  charge.start(start)
  charge.stop(impact + 0.04)

  // Airy static riding on top of the charge.
  const hiss = ctx.createBufferSource()
  hiss.buffer = getNoiseBuffer(ctx)

  const hissFilter = ctx.createBiquadFilter()
  hissFilter.type = 'highpass'
  hissFilter.frequency.setValueAtTime(900, start)
  hissFilter.frequency.exponentialRampToValueAtTime(5200, impact)

  const hissGain = ctx.createGain()
  hissGain.gain.setValueAtTime(0.0001, start)
  hissGain.gain.exponentialRampToValueAtTime(0.26, impact - 0.02)
  hissGain.gain.exponentialRampToValueAtTime(0.0001, impact + 0.02)

  hiss.connect(hissFilter).connect(hissGain).connect(bus)
  hiss.start(start)
  hiss.stop(impact + 0.04)

  releaseAfter(bus, TRACE_DURATION + 0.3)
  return true
}

/** The blast, fired the moment the mesh becomes visible. */
export function fireAssemblyBurstSfx() {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  // Compressor glues the layers and stops the stacked peaks from clipping.
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -14
  compressor.ratio.value = 8
  compressor.attack.value = 0.002
  compressor.release.value = 0.22

  const shaper = ctx.createWaveShaper()
  shaper.curve = getSaturationCurve()

  const bus = ctx.createGain()
  bus.gain.value = BURST_LEVEL
  shaper.connect(compressor).connect(bus).connect(getSfxBus(ctx))

  // Crack — the initial split-second transient.
  const crack = ctx.createBufferSource()
  crack.buffer = getNoiseBuffer(ctx)

  const crackFilter = ctx.createBiquadFilter()
  crackFilter.type = 'highpass'
  crackFilter.frequency.value = 2200

  const crackGain = ctx.createGain()
  crackGain.gain.setValueAtTime(1, now)
  crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)

  crack.connect(crackFilter).connect(crackGain).connect(shaper)
  crack.start(now)
  crack.stop(now + 0.09)

  // Boom — the low end that makes it read as an explosion rather than a click.
  const boom = ctx.createOscillator()
  boom.type = 'triangle'
  boom.frequency.setValueAtTime(180, now)
  boom.frequency.exponentialRampToValueAtTime(34, now + 0.4)

  const boomGain = ctx.createGain()
  boomGain.gain.setValueAtTime(0.0001, now)
  boomGain.gain.exponentialRampToValueAtTime(1, now + 0.012)
  boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)

  boom.connect(boomGain).connect(shaper)
  boom.start(now)
  boom.stop(now + 0.6)

  // Arc — the bright electric snap over the top.
  const arc = ctx.createOscillator()
  arc.type = 'square'
  arc.frequency.setValueAtTime(3000, now)
  arc.frequency.exponentialRampToValueAtTime(140, now + 0.3)

  const arcGain = ctx.createGain()
  arcGain.gain.setValueAtTime(0.0001, now)
  arcGain.gain.exponentialRampToValueAtTime(0.5, now + 0.008)
  arcGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)

  arc.connect(arcGain).connect(shaper)
  arc.start(now)
  arc.stop(now + 0.34)

  // Debris — the sizzling tail that rings out after the item lands.
  const tail = ctx.createBufferSource()
  tail.buffer = getNoiseBuffer(ctx)
  tail.playbackRate.value = 0.85

  const tailFilter = ctx.createBiquadFilter()
  tailFilter.type = 'bandpass'
  tailFilter.Q.value = 0.9
  tailFilter.frequency.setValueAtTime(4200, now)
  tailFilter.frequency.exponentialRampToValueAtTime(320, now + 0.7)

  const tailGain = ctx.createGain()
  tailGain.gain.setValueAtTime(0.0001, now)
  tailGain.gain.exponentialRampToValueAtTime(0.55, now + 0.02)
  tailGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75)

  tail.connect(tailFilter).connect(tailGain).connect(shaper)
  tail.start(now)
  tail.stop(now + 0.8)

  releaseAfter(bus, 1.1)
}
