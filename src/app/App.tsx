import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from './providers'
import { AppRouter } from './routes'

/**
 * Application root — providers + router only.
 * Feature UI lives under `src/features`; shared chrome under `src/shared`.
 */
export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  )
}

export default App
