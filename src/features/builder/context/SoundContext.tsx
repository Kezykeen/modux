import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { startSoundtrack, stopSoundtrack, warmSoundtrack } from '@/audio'

interface SoundContextValue {
  enabled: boolean
  isLoading: boolean
  toggle: () => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Once the user mutes deliberately, the autoplay fallback must stay quiet.
  const mutedByUser = useRef(false)

  useEffect(() => {
    let disposed = false
    // Kick the download off immediately. Autoplay may still be blocked, but
    // the bytes will already be buffered by the time a gesture unlocks us.
    warmSoundtrack()

    const play = async () => {
      if (disposed || mutedByUser.current) return false
      try {
        await startSoundtrack()
        if (!disposed) setEnabled(true)
        return true
      } catch {
        // Autoplay policy, almost always — we retry off the next gesture.
        return false
      }
    }

    const detach = () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
    }

    const unlock = () => {
      void play().then((started) => {
        if (started || mutedByUser.current) detach()
      })
    }

    void play().then((started) => {
      if (started || disposed) return
      window.addEventListener('pointerdown', unlock)
      window.addEventListener('keydown', unlock)
      window.addEventListener('touchstart', unlock)
    })

    return () => {
      disposed = true
      detach()
    }
  }, [])

  const toggle = () => {
    if (enabled) {
      mutedByUser.current = true
      setEnabled(false)
      stopSoundtrack()
      return
    }

    mutedByUser.current = false
    setIsLoading(true)
    startSoundtrack()
      .then(() => setEnabled(true))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  return <SoundContext.Provider value={{ enabled, isLoading, toggle }}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
