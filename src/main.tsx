import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  preloadCritical3DAssets,
  preloadCriticalImages,
  scheduleDeferredCatalogPreload,
} from "@/assets/preload";
import App from "@/app/App";
import "./index.css";

preloadCritical3DAssets();
preloadCriticalImages();
scheduleDeferredCatalogPreload();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
