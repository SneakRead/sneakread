// Real brand logos as inline SVG (current app versions). Recreated so the
// disguises read as the genuine apps — the mark is the first thing a boss sees.
import type { SkinId } from './core/types'

type LogoProps = { size?: number; className?: string }

export function VscodeLogo({ size = 20, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#0065A9"
        d="M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29L7.29 8.607 3.297 5.58a.999.999 0 0 0-1.28.057L.63 6.86a1 1 0 0 0 0 1.474L4.096 16 .63 19.667a1 1 0 0 0 0 1.474l1.387 1.221a.999.999 0 0 0 1.28.057l3.993-3.03 9.216 8.117a1.492 1.492 0 0 0 1.704.29l4.944-2.377A1.5 1.5 0 0 0 24 24.061V7.939a1.5 1.5 0 0 0-.85-1.352ZM18 8.75 11.376 16 18 23.25V8.75Z"
      />
    </svg>
  )
}

export function WordLogo({ size = 20, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#185ABD" d="M28 4H10a2 2 0 0 0-2 2v9h20V4Z" />
      <path fill="#103F91" d="M28 15h-6v18h6a2 2 0 0 0 2-2V15Z" />
      <path fill="#2B7CD3" d="M8 15h14v18H10a2 2 0 0 1-2-2V15Z" />
      <rect x="18" y="10" width="26" height="28" rx="3" fill="#41A5EE" />
      <path
        fill="#fff"
        d="M25 17h2.2l1.5 8.7 1.7-8.7h2.3l1.7 8.7 1.5-8.7H39l-2.6 14h-2.5l-1.7-8.4-1.7 8.4h-2.5L25 17Z"
      />
    </svg>
  )
}

export function ExcelLogo({ size = 20, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#107C41" d="M28 4H10a2 2 0 0 0-2 2v9h20V4Z" />
      <path fill="#0A5A2E" d="M28 15h-6v18h6a2 2 0 0 0 2-2V15Z" />
      <path fill="#21A366" d="M8 15h14v18H10a2 2 0 0 1-2-2V15Z" />
      <rect x="18" y="10" width="26" height="28" rx="3" fill="#33C481" />
      <path
        fill="#fff"
        d="M26.6 17h3.2l2.2 4 2.3-4h3.1l-3.7 6.9 3.9 7.1h-3.2l-2.4-4.4-2.4 4.4h-3.2l3.9-7.1L26.6 17Z"
      />
    </svg>
  )
}

export function OutlookLogo({ size = 20, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="20" y="10" width="24" height="28" rx="3" fill="#0F6CBD" />
      <path fill="#fff" d="M44 15.5v17l-12-6.5v-4L44 15.5Z" opacity=".9" />
      <path fill="#28A8EA" d="M44 14.5 32 21v6l12 6.2V14.5Z" />
      <path fill="#fff" d="M44 14.5 32 21l-1-1.6 11.6-6.3a1 1 0 0 1 1.4.9v.5Z" opacity=".4" />
      <rect x="6" y="14" width="20" height="20" rx="3" fill="#0364B8" />
      <path
        fill="#fff"
        d="M16 18.5c-3 0-5 2.3-5 5.5s2 5.5 5 5.5 5-2.3 5-5.5-2-5.5-5-5.5Zm0 8.6c-1.5 0-2.4-1.3-2.4-3.1s.9-3.1 2.4-3.1 2.4 1.3 2.4 3.1-.9 3.1-2.4 3.1Z"
      />
    </svg>
  )
}

export function DocsLogo({ size = 20, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M13 4h16.5L40 14.5V42a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
      />
      <path fill="#A1C2FA" d="M29.5 4 40 14.5h-9a1.5 1.5 0 0 1-1.5-1.5V4Z" />
      <path
        fill="#F1F5FE"
        d="M17 22h14v2H17v-2Zm0 5h14v2H17v-2Zm0 5h10v2H17v-2Z"
      />
    </svg>
  )
}

// Slack's four-colour rounded-lozenge pinwheel (the octothorpe mark). Canonical
// brand hues: blue #36C5F0, green #2EB67D, yellow #ECB22E, red #E01E5A.
export function SlackLogo({ size = 20, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.8 122.8" className={className} aria-hidden="true">
      <path
        fill="#E01E5A"
        d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zM32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
      />
      <path
        fill="#36C5F0"
        d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zM45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
      />
      <path
        fill="#2EB67D"
        d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zM90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
      />
      <path
        fill="#ECB22E"
        d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zM77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
      />
    </svg>
  )
}

// Notion's monochrome "N": a white page with a bold geometric N. No colour —
// the refusal of any accent is itself a Notion tell.
export function NotionLogo({ size = 20, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="5" y="3" width="38" height="42" rx="5" fill="#fff" stroke="#e6e5e1" strokeWidth="1.5" />
      <path
        d="M18 33V15l12 18V15"
        fill="none"
        stroke="#0f0f0f"
        strokeWidth="3.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

// Feishu / Lark app tile: a blue rounded square with a white swallow in flight
// and a single teal-green wing. The tile colour + wordmark carry recognition at
// rail size; the bird is a faithful-enough abstraction.
export function LarkLogo({ size = 20, className }: LogoProps) {
  const gid = 'lark-grad'
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A5CFF" />
          <stop offset="1" stopColor="#3370FF" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill={`url(#${gid})`} />
      <path
        d="M11 29c6-2 10-7 12-14 4 7 3 15-3 19-3 2-7 1-9-5z"
        fill="#0ACE97"
      />
      <path
        d="M14 13c8-1 15 2 20 9 3 5 4 10 3 15-4-8-10-13-18-14-3-1-5-5-5-10z"
        fill="#fff"
      />
    </svg>
  )
}

// Feishu / Lark doc file glyph: the Google-Docs-shaped sheet, but in Feishu blue
// #3370FF with a lighter folded corner.
export function LarkDocLogo({ size = 20, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#3370FF"
        d="M13 4h16.5L40 14.5V42a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
      />
      <path fill="#8CB2FF" d="M29.5 4 40 14.5h-9a1.5 1.5 0 0 1-1.5-1.5V4Z" />
      <path fill="#F1F5FE" d="M17 22h14v2H17v-2Zm0 5h14v2H17v-2Zm0 5h10v2H17v-2Z" />
    </svg>
  )
}

// Dispatch a skin id to its brand logo — used by the home "Open as…" gallery.
export function SkinLogo({ id, size = 26, className }: { id: SkinId; size?: number; className?: string }) {
  switch (id) {
    case 'word':
      return <WordLogo size={size} className={className} />
    case 'excel':
      return <ExcelLogo size={size} className={className} />
    case 'outlook':
      return <OutlookLogo size={size} className={className} />
    case 'docs':
      return <DocsLogo size={size} className={className} />
    case 'vscode':
      return <VscodeLogo size={size} className={className} />
    case 'notion':
      return <NotionLogo size={size} className={className} />
    case 'slack':
      return <SlackLogo size={size} className={className} />
    case 'lark':
      return <LarkLogo size={size} className={className} />
    case 'lark-docs':
      return <LarkDocLogo size={size} className={className} />
    default:
      return null
  }
}
