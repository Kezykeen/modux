/** Guest-only: pending snapshot data URLs until sign-in (sessionStorage, not persisted across browser restarts). */
const GUEST_SNAPSHOTS_KEY = 'modux-guest-snapshots'

type SnapshotMap = Record<string, string>

function readMap(): SnapshotMap {
  try {
    const raw = sessionStorage.getItem(GUEST_SNAPSHOTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SnapshotMap
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function writeMap(map: SnapshotMap) {
  try {
    sessionStorage.setItem(GUEST_SNAPSHOTS_KEY, JSON.stringify(map))
  } catch {
    /* quota */
  }
}

export function getGuestSnapshot(id: string): string | undefined {
  return readMap()[id]
}

export function setGuestSnapshot(id: string, dataUrl: string) {
  const map = readMap()
  map[id] = dataUrl
  writeMap(map)
}

export function removeGuestSnapshot(id: string) {
  const map = readMap()
  delete map[id]
  writeMap(map)
}

export function clearGuestSnapshots() {
  try {
    sessionStorage.removeItem(GUEST_SNAPSHOTS_KEY)
  } catch {
    /* ignore */
  }
}

export function readAllGuestSnapshots(): SnapshotMap {
  return readMap()
}
