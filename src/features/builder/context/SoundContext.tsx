import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { startSoundtrack, stopSoundtrack, warmSoundtrack, resumeSoundtrack, isSoundtrackPlaying, isSoundtrackAudible } from '@/audio'

interface SoundContextValue {
  enabled: boolean
  isLoading: boolean
  toggle: () => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']

function isAuthPath(path: string) {
  return AUTH_PATHS.some((p) => path.startsWith(p))
}

/** Routes where music should stop (landing + auth). App routes leave playback alone. */
function isQuietPath(path: string) {
  return path === '/' || isAuthPath(path)
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mutedByUser = useRef(false)
  const isPlayingRef = useRef(false)
  const wasAuthenticated = useRef(isAuthenticated)
  const unlockCleanup = useRef<(() => void) | null>(null)

  const clearUnlockListeners = () => {
    unlockCleanup.current?.()
    unlockCleanup.current = null
  }

  const tryPlay = () => {
    setIsLoading(true)
    return startSoundtrack()
      .then(() => {
        isPlayingRef.current = true
        setEnabled(true)
        return true
      })
      .catch(() => {
        isPlayingRef.current = false
        setEnabled(false)
        return false
      })
      .finally(() => setIsLoading(false))
  }

  const stopPlayback = () => {
    isPlayingRef.current = false
    stopSoundtrack()
    setEnabled(false)
  }

  const armGestureUnlock = () => {
    clearUnlockListeners()
    const unlock = () => {
      if (mutedByUser.current) return
      void tryPlay()
      clearUnlockListeners()
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    unlockCleanup.current = () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }

  useEffect(() => {
    const path = location.pathname

    if (isQuietPath(path)) {
      clearUnlockListeners()
      stopPlayback()
      return
    }

    if (path.startsWith('/customize')) {
      if (mutedByUser.current) {
        setEnabled(false)
        return
      }

      const alreadyPlaying = isSoundtrackPlaying() || isSoundtrackAudible()

      if (isPlayingRef.current || alreadyPlaying) {
        isPlayingRef.current = true
        if (!alreadyPlaying) {
          warmSoundtrack()
        }
        void resumeSoundtrack().then((ok) => {
          if (ok) {
            isPlayingRef.current = true
            setEnabled(true)
            return
          }
          isPlayingRef.current = false
          setEnabled(false)
          if (!mutedByUser.current) armGestureUnlock()
        })
        return
      }

      warmSoundtrack()
      void tryPlay().then((started) => {
        if (!started && !mutedByUser.current) armGestureUnlock()
      })
    }

    // All other app routes (cart, checkout, orders, …): do not stop or restart —
    // playback continues if the user already started music on customize.
  }, [location.pathname])

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      mutedByUser.current = false
      clearUnlockListeners()
      stopPlayback()
    }
    wasAuthenticated.current = isAuthenticated
  }, [isAuthenticated])

  useEffect(() => () => clearUnlockListeners(), [])

  const toggle = () => {
    if (enabled) {
      mutedByUser.current = true
      stopPlayback()
      return
    }

    mutedByUser.current = false
    void tryPlay()
  }

  return <SoundContext.Provider value={{ enabled, isLoading, toggle }}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
