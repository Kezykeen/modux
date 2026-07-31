// Lazy-loaded background soundtrack. The mp3 is never fetched until the user
// opts in (clicks the sound toggle), so it has zero cost on initial page load.
// We optionally warm the HTTP cache during idle time so playback feels instant
// once the user does opt in, without competing with critical render work.
import trackUrl from './Powerful(chosic.com).mp3'

const TARGET_VOLUME = 0.5
const FADE_IN_MS = 600
const FADE_OUT_MS = 350

let audio: HTMLAudioElement | null = null
let fadeHandle: number | null = null
let prefetched = false

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

/** Warms the browser's HTTP cache during idle time, without blocking anything. */
export function prefetchSoundtrack() {
  if (prefetched || typeof window === 'undefined') return
  prefetched = true

  const run = () => {
    fetch(trackUrl, { priority: 'low' } as RequestInit).catch(() => {
      // Best-effort only — a failed prefetch just means we fetch on demand instead.
    })
  }

  const w = window as typeof window & { requestIdleCallback?: (cb: () => void) => number }
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(run)
  } else {
    setTimeout(run, 2000)
  }
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
