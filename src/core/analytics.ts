// Featherweight GA4 wrapper. Design rules:
// - Production host only (sneakread.com) — dev/preview/self-hosted send nothing.
// - Zero impact on first paint: the gtag stub is just an array push; the real
//   gtag.js <script> is injected at browser idle (requestIdleCallback, 1.5s
//   fallback), long after LCP. No queue of our own is needed — the official
//   stub IS the queue (dataLayer is replayed when the script arrives).
// - SPA: send_page_view is off; the app reports page_view on its own route
//   changes with a sanitized path.
// - Privacy: never send full URLs, document ids, titles, or user input.
//   Hostnames, skin ids, enum labels, and bucketed numbers only.
const GA_ID = 'G-Z465WJ76NB'

type GtagWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

export type EventParams = Record<string, string | number | boolean | undefined>

let started = false

function enabled() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'sneakread.com' || host === 'www.sneakread.com'
}

export function initAnalytics() {
  if (started || !enabled()) return
  started = true
  const w = window as GtagWindow
  w.dataLayer = w.dataLayer || []
  // The official stub must push the *arguments object*, not an array —
  // gtag.js distinguishes them when it drains the queue.
  // eslint-disable-next-line func-names
  w.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  }
  w.gtag('js', new Date())
  w.gtag('config', GA_ID, { send_page_view: false })
  const load = () => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(script)
  }
  const idle = (
    window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }
  ).requestIdleCallback
  if (idle) idle(load, { timeout: 4000 })
  else window.setTimeout(load, 1500)
}

export function track(event: string, params?: EventParams) {
  if (!enabled()) return
  const w = window as GtagWindow
  w.gtag?.('event', event, params)
}

// Sanitized SPA page_view: a stable virtual path ('/', '/zh/', '/read'), never
// the hash (which encodes the source URL).
export function trackPageView(path: string, params?: EventParams) {
  track('page_view', { page_path: path, ...params })
}

// Order-of-magnitude buckets keep metrics useful without leaking specifics.
export function bucket(value: number, edges: number[]): string {
  for (const edge of edges) {
    if (value < edge) return `<${edge}`
  }
  return `${edges[edges.length - 1]}+`
}
