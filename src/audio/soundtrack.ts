// Background soundtrack. The element is warmed as early as possible so the
// 6MB+ download is already in flight (or finished) by the time a gesture
// unlocks playback — otherwise the first click waits on the network.
import trackUrl from './Powerful(chosic.com).mp3'

const TARGET_VOLUME = 0.5
/** Short enough that the track is heard almost immediately after unlock. */
const FADE_IN_MS = 280
const FADE_OUT_MS = 350

let audio: HTMLAudioElement | null = null
let fadeHandle: number | null = null

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio()
    audio.src = trackUrl
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    // Decode/transport errors shouldn't crash the app.
    audio.addEventListener('error', () => {
      console.warn('Soundtrack failed to load/play.')
    })
  }
  return audio
}

function cancelFade() {
  if (fadeHandle !== null) {
    cancelAnimationFrame(fadeHandle)
    fadeHandle = null
  }
}

function fadeTo(el: HTMLAudioElement, target: number, durationMs: number, onDone?: () => void) {
  cancelFade()
  const from = el.volume
  const start = performance.now()

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs)
    el.volume = Math.min(1, Math.max(0, from + (target - from) * t))
    if (t < 1) {
      fadeHandle = requestAnimationFrame(step)
    } else {
      fadeHandle = null
      onDone?.()
    }
  }

  fadeHandle = requestAnimationFrame(step)
}

/**
 * Starts the HTTP fetch without playing. Call on mount so autoplay unlock
 * (or the mute toggle) isn't paying the download cost on the critical path.
 */
export function warmSoundtrack() {
  if (typeof window === 'undefined') return
  const el = getAudio()
  // load() is a no-op once the browser already has enough buffered data.
  el.load()
}

export async function startSoundtrack() {
  const el = getAudio()
  cancelFade()
  await el.play()
  fadeTo(el, TARGET_VOLUME, FADE_IN_MS)
}

export function stopSoundtrack() {
  if (!audio) return
  const el = audio
  fadeTo(el, 0, FADE_OUT_MS, () => {
    el.pause()
  })
}
