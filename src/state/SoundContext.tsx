import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { prefetchSoundtrack, startSoundtrack, stopSoundtrack } from '../audio/soundtrack'

interface SoundContextValue {
  enabled: boolean
  isLoading: boolean
  toggle: () => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    prefetchSoundtrack()
  }, [])

  const toggle = () => {
    if (enabled) {
      setEnabled(false)
      stopSoundtrack()
      return
    }
    setIsLoading(true)
    startSoundtrack()
      .then(() => setEnabled(true))
      .finally(() => setIsLoading(false))
  }

  return <SoundContext.Provider value={{ enabled, isLoading, toggle }}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
