import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'

interface SnapshotContextValue {
  registerCapture: (fn: (() => string | null) | null) => void
  capture: () => string | null
}

const SnapshotContext = createContext<SnapshotContextValue | null>(null)

export function SnapshotProvider({ children }: { children: ReactNode }) {
  const captureRef = useRef<(() => string | null) | null>(null)

  const registerCapture = useCallback((fn: (() => string | null) | null) => {
    captureRef.current = fn
  }, [])

  const capture = useCallback(() => captureRef.current?.() ?? null, [])

  const value = useMemo(
    () => ({ registerCapture, capture }),
    [registerCapture, capture],
  )

  return (
    <SnapshotContext.Provider value={value}>{children}</SnapshotContext.Provider>
  )
}

export function useSnapshot() {
  const ctx = useContext(SnapshotContext)
  if (!ctx) throw new Error('useSnapshot must be used within SnapshotProvider')
  return ctx
}
