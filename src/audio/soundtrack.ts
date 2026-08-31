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

export function isSoundtrackPlaying() {
  if (!audio) return false
  return !audio.paused && audio.volume > 0.01
}

export function isSoundtrackAudible() {
  if (!audio) return false
  return !audio.paused && audio.volume > TARGET_VOLUME * 0.5
}

/**
 * Starts the HTTP fetch without playing. Never calls load() while playing —
 * load() resets the element and causes silent UI/state drift.
 */
export function warmSoundtrack() {
  if (typeof window === 'undefined') return
  const el = getAudio()
  if (!el.paused) return
  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return
  el.load()
}

export async function startSoundtrack() {
  const el = getAudio()
  cancelFade()
  try {
    await el.play()
    fadeTo(el, TARGET_VOLUME, FADE_IN_MS)
    return true
  } catch {
    return false
  }
}

/** Resume after navigation without reloading or re-fading from zero. */
export async function resumeSoundtrack() {
  const el = getAudio()
  cancelFade()
  try {
    if (el.paused) {
      await el.play()
    }
    if (el.volume < TARGET_VOLUME * 0.85) {
      fadeTo(el, TARGET_VOLUME, 120)
    }
    return !el.paused && el.volume > 0.01
  } catch {
    return false
  }
}

export function stopSoundtrack() {
  if (!audio) return
  const el = audio
  fadeTo(el, 0, FADE_OUT_MS, () => {
    el.pause()
  })
}
