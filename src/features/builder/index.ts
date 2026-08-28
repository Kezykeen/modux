/**
 * Builder feature public API.
 * Import the page via `@/features/builder/pages/BuilderPage` from the router
 * so context consumers (e.g. viewport) do not create circular module graphs.
 */
export {
  BuildProvider,
  useBuild,
  useHover,
} from './context/BuildContext'
export type { ActiveCategory, ViewMode } from './context/BuildContext'

export { SnapshotProvider, useSnapshot } from './context/SnapshotContext'
export { SoundProvider, useSound } from './context/SoundContext'

export { Sidebar } from './components/Sidebar'
export { RightPanel } from './components/RightPanel'
export { YourBuildPanel } from './components/YourBuildPanel'
