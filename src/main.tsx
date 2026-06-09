import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.tsx'

const LOADER_MIN_MS = 1200
const loaderStart = performance.now()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

function hideAppLoader() {
  const loader = document.getElementById('app-loading')
  if (!loader) return
  loader.classList.add('app-loading--hidden')
  window.setTimeout(() => loader.remove(), 500)
}

// Wait for React to commit its first paint, then keep the loader up for a short
// minimum so it never flashes, before fading it out.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const elapsed = performance.now() - loaderStart
    window.setTimeout(hideAppLoader, Math.max(0, LOADER_MIN_MS - elapsed))
  })
})
