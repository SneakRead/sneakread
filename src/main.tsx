import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
// Real, self-hosted UI fonts so the skins stop falling back to the OS system
// font. Inter stands in for Segoe UI, Carlito is metric-compatible with Calibri
// (Word/Excel), Roboto/Arimo cover Google Docs, Cascadia Code is VS Code's font.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/carlito/400.css'
import '@fontsource/carlito/700.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/arimo/400.css'
import '@fontsource/arimo/700.css'
import '@fontsource/cascadia-code/400.css'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!
const path = window.location.pathname.replace(/\/+$/, '') || '/'

// `/app` is a legacy alias for the old split. Rewrite `/app#u=…` → `/#u=…`
// (keeping the hash so old share links still open) and drop `/app`.
if (path === '/app' || path.startsWith('/app/')) {
  window.history.replaceState(null, '', '/' + window.location.hash)
}

// One React root for every path. `/` and `/<lang>` are prerendered (SSR'd home
// content) so they hydrate; the bare `/app` shell has an empty root so it renders.
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
if (root.firstChild) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
