import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  preloadCritical3DAssets,
  preloadCriticalImages,
  scheduleDeferredCatalogPreload,
} from './assets/preload'
import './index.css'
import App from './App.tsx'

preloadCritical3DAssets()
preloadCriticalImages()
scheduleDeferredCatalogPreload()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
