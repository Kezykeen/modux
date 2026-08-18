// Shared Web Audio plumbing. Every UI effect is synthesised at runtime rather
// than shipped as a file, so they cost no bytes and stay perfectly in sync with
// the animations that trigger them. One context is reused across all of them —
// browsers cap how many a page may create.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

let context: AudioContext | null = null
let noise: AudioBuffer | null = null
let saturation: Float32Array<ArrayBuffer> | null = null
let sfxBus: GainNode | null = null
let muted = false

export function getAudioContext() {
  if (typeof window === 'undefined') return null

  if (!context) {
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
    if (!Ctor) return null
    context = new Ctor()
  }

  // Browsers start the context suspended until a gesture; resuming is a no-op
  // once it is already running.
  if (context.state === 'suspended') void context.resume()
  return context
}

/**
 * Every effect ends here rather than at the destination, which gives the mute
 * control one node to close instead of chasing voices that are already playing.
 */
export function getSfxBus(ctx: AudioContext) {
  if (!sfxBus) {
    sfxBus = ctx.createGain()
    sfxBus.gain.value = muted ? 0 : 1
    sfxBus.connect(ctx.destination)
  }
  return sfxBus
}

export function setSfxMuted(value: boolean) {
  muted = value
  if (!sfxBus) return
  // Ramped rather than stepped, so muting mid-effect doesn't click.
  const ctx = sfxBus.context
  sfxBus.gain.cancelScheduledValues(ctx.currentTime)
  sfxBus.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.02)
}

/** White noise, generated once and shared by every effect that needs it. */
export function getNoiseBuffer(ctx: AudioContext) {
  if (!noise) {
    const length = Math.floor(ctx.sampleRate * 2)
    noise = ctx.createBuffer(1, length, ctx.sampleRate)
    const channel = noise.getChannelData(0)
    for (let i = 0; i < length; i += 1) channel[i] = Math.random() * 2 - 1
  }
  return noise
}

/** Soft-clip curve — adds grit to loud transients and keeps peaks in bounds. */
export function getSaturationCurve() {
  if (!saturation) {
    const samples = 1024
    saturation = new Float32Array(samples)
    for (let i = 0; i < samples; i += 1) {
      const x = (i * 2) / samples - 1
      saturation[i] = Math.tanh(x * 2.4)
    }
  }
  return saturation
}

/** Frees a one-shot voice's bus once its tail has finished ringing. */
export function releaseAfter(node: AudioNode, seconds: number) {
  window.setTimeout(() => node.disconnect(), seconds * 1000)
}
