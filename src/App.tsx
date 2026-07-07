import {
  ChevronDown,
  GitBranch,
  Search,
  FileText,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react'

import { t, tr, lang, isRtl, langKey, langFromPath, LANG_NAMES, ALL_LANGS, type Lang } from './i18n'
import { landingContent } from './landing-content'
import { samplesFor } from './samples'
import { DEFAULT_SKIN_ID } from './config/defaults'
import '@vscode/codicons/dist/codicon.css'
import 'material-symbols/rounded.css'
import './App.css'

// Google's real icon font (Material Symbols Outlined), rendered via ligatures —
// exactly what Google Docs uses. Write the icon name; the font draws the glyph.

/* ------------------------------------------------------------------ *
 * Types & constants
 * ------------------------------------------------------------------ */

export type {
  SkinId,
  LoadState,
  PageKind,
  Summary,
  ReaderDoc,
  DocumentRecord,
  Skin,
} from './core/types'
import type {
  SkinId,
  LoadState,
  PageKind,
  Summary,
  ReaderDoc,
  DocumentRecord,
} from './core/types'
import {
  storageKey,
  onboardKey,
  coachKey,
  panicDocumentId,
} from './core/types'
import {
  getSiteLabel,
  extractLinks,
  extractImages,
  inferProjectName,
  safeHttpUrl,
} from './core/content'
import { getAlias, setAlias } from './core/alias'
import { initAnalytics, track, trackPageView, bucket } from './core/analytics'
import {
  WordFrame,
} from './skins/shared'
import { ExcelBudgetSkin } from './skins/excel'
import { VscMenuBar, ActivityBar } from './skins/vscode'
import { getSkin, skins, skinById, SkinBrandLogo } from './skins'
import { SkinControlsProvider } from './skins/controls'
import { skinLabel, skinAppName } from './skins/labels'

/* ------------------------------------------------------------------ *
 * URL / reader plumbing
 * ------------------------------------------------------------------ */

function normalizeUrl(input: string) {
  const trimmed = input.trim()
  if (!trimmed) throw new Error(t('errEnterUrl'))
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const url = new URL(withProtocol)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(t('errHttpOnly'))
  }
  return url.toString()
}

function safeStorageGet(key: string) {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    if (typeof localStorage === 'undefined') return false
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function safeStorageRemove(key: string) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key)
  } catch {
    // ignore storage failures
  }
}

function looksLikeUrl(input: string) {
  const value = input.trim()
  if (!value || /\s/.test(value)) return false
  if (/^https?:\/\//i.test(value)) return true
  return /^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(value)
}

function stripFrontmatter(text: string) {
  if (!text.startsWith('---')) return { metadata: {} as Record<string, string>, body: text.trim() }
  const end = text.indexOf('\n---', 3)
  if (end === -1) return { metadata: {} as Record<string, string>, body: text.trim() }
  const rawMeta = text.slice(3, end).trim()
  const body = text.slice(end + 4).trim()
  const metadata: Record<string, string> = {}
  rawMeta.split('\n').forEach((line) => {
    const match = line.match(/^([^:]+):\s*(.*)$/)
    if (!match) return
    metadata[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  })
  return { metadata, body }
}

function parseReaderResponse(raw: string, fallbackUrl: string): ReaderDoc {
  const frontmatter = stripFrontmatter(raw)
  let title = frontmatter.metadata.title || ''
  let sourceUrl = safeHttpUrl(frontmatter.metadata.url, fallbackUrl) ?? fallbackUrl
  let markdown = cleanReaderMarkdown(frontmatter.body)

  if (!Object.keys(frontmatter.metadata).length) {
    const titleMatch = raw.match(/^Title:\s*(.+)$/m)
    const sourceMatch = raw.match(/^URL Source:\s*(.+)$/m)
    const contentIndex = raw.indexOf('Markdown Content:')
    title = titleMatch?.[1]?.trim() || ''
    sourceUrl = safeHttpUrl(sourceMatch?.[1], fallbackUrl) ?? fallbackUrl
    markdown = cleanReaderMarkdown(
      contentIndex >= 0
        ? raw.slice(contentIndex + 'Markdown Content:'.length).trim()
        : raw.trim(),
    )
  }

  if (!title) title = inferTitle(markdown, sourceUrl)

  return {
    title,
    sourceUrl,
    markdown,
    fetchedAt: formatTime(new Date()),
    raw,
    summary: summarizeMarkdown(markdown, sourceUrl),
  }
}

function cleanReaderMarkdown(markdown: string) {
  let unwrapped = markdown
    // Some readers (Firecrawl on <br>-heavy pages like paulgraham.com) leave raw
    // <br> tags that react-markdown renders as literal text. A run of 2+ is a
    // paragraph break; a single one is a soft line-wrap → rejoin with a space.
    .replace(/\s*(?:<br\s*\/?>\s*){2,}/gi, '\n\n')
    .replace(/\s*<br\s*\/?>\s*/gi, ' ')
    // Jina swaps inline data-URI images for a literal placeholder token; the
    // whole image is noise once the data is gone.
    .replace(/!?\\?\[[^\]]*\\?\]\(<?Base64-Image-Removed>?\)/gi, '')
  // A markdown link whose text got split across a blank line never parses —
  // react-markdown renders a literal "…text.](url)". Rejoin the pieces into
  // one inline link. Run a few passes: long teasers can span several breaks.
  for (let pass = 0; pass < 3; pass++) {
    const joined = unwrapped.replace(
      /\[([^\][\n]{1,240})\n{2,}([^\][\n]{0,240}\]\()/g,
      '[$1 $2',
    )
    if (joined === unwrapped) break
    unwrapped = joined
  }
  const rawLines = stripEscapeArtifacts(unwrapped.split('\n'))
  // Boilerplate like "domain.com is blocked" arrives with a blank line between
  // the domain and the error code — compare against the next *solid* line.
  const nextSolid = (index: number) => {
    for (let j = index + 1; j < rawLines.length; j++) {
      if (rawLines[j].trim()) return rawLines[j]
    }
    return ''
  }
  const lines = stripLeadingLayoutTable(
    stripAppPromoBlocks(
      rawLines.filter(
        (line, index) => !isReaderBoilerplateLine(line, nextSolid(index)) && !isSpacerTableRow(line),
      ),
    ),
  )
  return unwrapProseCell(trimLeadingNav(lines)).join('\n').replace(/\n{4,}/g, '\n\n\n').trim()
}

// Jina/Firecrawl escape stray characters and line breaks with backslashes that
// react-markdown then shows literally ("foo\ \ bar", "ERR\_BLOCKED"). Clean them
// outside code fences only, so shell continuations in real code survive.
function stripEscapeArtifacts(lines: string[]) {
  let fence: { ch: string; len: number } | null = null
  return lines.map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)
    if (marker) {
      const ch = marker[1][0]
      const len = marker[1].length
      if (fence === null) fence = { ch, len }
      else if (fence.ch === ch && len >= fence.len) fence = null
      return line
    }
    if (fence) return line
    return line
      .replace(/^\\+\s+/, '') // leading "\ " artifacts
      .replace(/\s\\+(\s)/g, '$1') // stray backslashes floating between words
      .replace(/\s*\\+$/, '') // trailing hard-break backslashes
  })
}

// "Scan to download our app" banners: drop the promo line AND the bare QR-code
// image right above it, so a news homepage doesn't open on a giant QR code.
function isAppPromoLine(line: string) {
  const t = readerBoilerplateCandidate(line)
  return (
    /^扫[一描码][描码]?\s*(下载|安装|关注)?/.test(t) ||
    /^(扫码|扫描)(下载|安装|关注)/.test(t) ||
    /^(下载|打开)\s*(APP|App|客户端|应用)/.test(t) ||
    /^立即(下载|体验|打开)$/.test(t) ||
    /^(Download|Get|Open)\s+(our\s+|the\s+)?app\b/i.test(t)
  )
}

function stripAppPromoBlocks(lines: string[]) {
  const bareImage = /^\s*\[?!\[[^\]]*\]\([^)]+\)\]?(\([^)]+\))?\s*$/
  const drop = new Set<number>()
  lines.forEach((line, index) => {
    if (!isAppPromoLine(line)) return
    drop.add(index)
    let j = index - 1
    while (j >= 0 && !lines[j].trim()) j--
    if (j >= 0 && bareImage.test(lines[j])) drop.add(j)
  })
  return drop.size ? lines.filter((_, index) => !drop.has(index)) : lines
}

// A pipe row whose every cell is empty, a separator, or a bare (linked) image —
// i.e. an HTML layout spacer, never real content. Safe to drop wherever it sits.
function isSpacerTableRow(line: string) {
  const t = line.trim()
  // pg's layout rows use a leading pipe but often no trailing pipe.
  if (!/^\|/.test(t) || !t.includes('|', 1)) return false
  const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
  return cells.every(
    (c) => !c || /^[-:\s]+$/.test(c) || /^\[?!\[[^\]]*\]\([^)]*\)\]?(\([^)]*\))?$/.test(c),
  )
}

// paulgraham.com (via Firecrawl) nests the whole essay inside one table cell:
// `| ![alt](logo) July 2023 If you collected... |`. When a table row is really
// one long prose cell, unwrap it to a plain paragraph so it renders as an
// article, not a one-cell table. Conservative: only very long single cells.
function unwrapProseCell(lines: string[]) {
  return lines.map((line) => {
    const t = line.trim()
    if (!/^\|/.test(t) || !t.includes('|', 1)) return line
    const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
    const filled = cells.filter(Boolean)
    if (filled.length !== 1) return line
    const cell = filled[0].replace(/^!?\[[^\]]*\]\([^)]*\)\s*/, '') // drop a leading logo image
    return cell.length > 200 ? cell : line
  })
}

// Some readers (Firecrawl on old-school sites like paulgraham.com) emit the
// page's nested HTML layout as leading markdown tables full of one-word nav
// links or spacer images. Repeatedly drop leading tables whose cells look
// navish (short, no prose), so real data tables further down are untouched.
function stripLeadingLayoutTable(lines: string[]) {
  let cursor = 0
  for (;;) {
    let i = cursor
    while (i < lines.length && !lines[i].trim()) i++
    const tableStart = i
    const tableRows: string[] = []
    while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
      tableRows.push(lines[i])
      i++
    }
    if (tableRows.length < 2) break
    const cells = tableRows
      .flatMap((row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|'))
      .map((c) => c.trim())
      .filter((c) => c && !/^[-:\s]+$/.test(c))
    const shortCells = cells.filter(
      (c) => c.replace(/!?\[[^\]]*\]|\([^)]*\)/g, '').trim().length <= 24,
    )
    // Empty spacer table, or >80% short tokens → layout/nav, not real data.
    const navish = !cells.length || shortCells.length / cells.length >= 0.8
    if (!navish) break
    lines = lines.slice(0, tableStart).concat(lines.slice(i))
    cursor = tableStart
  }
  return lines
}

// Drop a nav-heavy preamble (site sidebar / link menu) that sits before the
// first real paragraph. No-op for normal articles that open with prose.
function trimLeadingNav(lines: string[]) {
  const isNavish = (raw: string) => {
    const t = raw.trim()
    if (!t) return false
    return (
      /^[-*+]\s*\[[^\]]+\]\([^)]+\)/.test(t) ||
      /^\[[^\]]+\]\([^)]+\)$/.test(t) ||
      /^[•·☑✓▪●]/.test(t) ||
      /^[-*+]\s+\S{1,24}$/.test(t)
    )
  }
  const firstProse = lines.findIndex((line) => {
    const t = line.trim()
    return t.length > 120 && !/^[#>\-*+|![]/.test(t)
  })
  if (firstProse <= 0) return lines
  const navCount = lines.slice(0, firstProse).filter(isNavish).length
  return navCount >= 5 ? lines.slice(firstProse) : lines
}

function readerBoilerplateCandidate(line = '') {
  return line
    .trim()
    .replace(/\\+\s*$/, '')
    // Un-escape reader backslash-escapes ("ERR\_BLOCKED\_BY\_CLIENT") so the
    // boilerplate patterns below match what the page actually said.
    .replace(/\\([_*[\]()#`~<>.-])/g, '$1')
    .replace(/^#{1,6}\s*/, '')
    .replace(/^[•·☑✓\-*]\s*/, '')
    .trim()
}

function isReaderBoilerplateLine(line: string, nextLine = '') {
  const clean = readerBoilerplateCandidate(line)
  if (!clean) return false
  // Video-player seek buttons scraped as bare "+10 / -10 / 10" lines. Only the
  // raw line (no list prefix) counts, so "- 10" in a real list survives.
  if (/^[+-]?\d{1,3}$/.test(line.trim())) return true
  const nextClean = readerBoilerplateCandidate(nextLine)
  const blockedWidgetDomain =
    /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(clean) &&
    /^(is blocked|ERR_[A-Z_]+|blocked by an? (extension|ad ?blocker))/i.test(nextClean)
  if (blockedWidgetDomain) return true
  return [
    /^\[?(Skip|Jump) to (main content|content|navigation|search)\]?/i,
    /^\[Keyboard shortcuts?( for .*)?\]\([^)]+\)$/i,
    /^\[Accessibility help\]\([^)]+\)$/i,
    /move to sidebar/i,
    /^Main menu\b/i,
    /^Navigation$/i,
    /^Contribute$/i,
    /^Personal tools$/i,
    /^Toggle .*(subsection|section|the table of contents)/i,
    /^\[?edit\]?(\([^)]*\))?( links| source| section)?$/i,
    /^Retrieved from /i,
    /^Advertisement$/i,
    /^ADVERTISEMENT$/i,
    /^Listen to this article$/i,
    /^Share$/i,
    // Embedded video-player chrome (BBC & friends leak the whole control strip).
    /^(LIVE|START|PLAY|PAUSE|REPLAY)$/,
    /^Auto-?play$/i,
    /^Play next item automatically$/i,
    /^Video quality$/i,
    /^(Highest|Lowest|Auto(matic)?) available$/i,
    /^(Captions?|Subtitles?)( off| on)?$/i,
    /^(Enter|Exit) fullscreen$/i,
    /^(Mute|Unmute|Rewind|Fast forward)$/i,
    /^Playback (speed|rate)$/i,
    /^\d+(\.\d+)?x$/,
    /^\d{1,2}:\d{2}(:\d{2})?$/,
    /^(Duration|Elapsed( time)?|Remaining( time)?)[:.]?$/i,
    // Blocked third-party widgets (ad-blocker / extension) leaking into scrapes.
    /^[a-z0-9.-]+\.[a-z]{2,}\s+is blocked$/i,
    /^is blocked$/i,
    /blocked by an? (extension|ad ?blocker)/i,
    /^ERR_[A-Z_]+$/,
    /^Try disabling your (extensions?|ad ?blocker)/i,
    /^(Reload|Retry)$/,
    // Cookie / consent boilerplate.
    /^(Accept|Reject)( all)?( cookies)?$/i,
    /^We (use|value) cookies/i,
    /^This (site|website) uses cookies/i,
    // GitHub / SPA session + template noise.
    /^You (signed (in|out)|switched accounts) (with|on) another tab/i,
    /Reload to refresh your session/i,
    /^Dismiss alert$/i,
    /^\{\{.*\}\}$/,
    /^You can[’']t perform that action at this time\.?$/i,
  ].some((pattern) => pattern.test(clean))
}

function assertHealthyReaderDoc(doc: ReaderDoc) {
  const title = doc.title.trim()
  const markdown = doc.markdown.trim()
  const plain = markdown
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
    .replace(/[#>*_`~|[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const lowerTitle = title.toLowerCase()
  const lowerPlain = plain.toLowerCase()

  const blockedPatterns = [
    '403 forbidden',
    '401 unauthorized',
    'access denied',
    'attention required',
    'just a moment',
    'enable javascript',
    'too many requests',
    'not acceptable',
    'service unavailable',
  ]

  const blocked = blockedPatterns.find(
    (pattern) => lowerTitle.includes(pattern) || lowerPlain === pattern,
  )
  if (blocked) {
    throw new Error(`Reader returned "${title || blocked}" instead of article content`)
  }
  if (!markdown) throw new Error('This page returned no readable content')

  const hasSubstance =
    doc.summary.words >= 20 ||
    doc.summary.links >= 6 ||
    doc.summary.images >= 3 ||
    doc.summary.headings >= 2
  if (!hasSubstance) {
    throw new Error('Reader returned too little readable content for this URL')
  }
}

function inferTitle(markdown: string, url: string) {
  const heading = markdown.match(/^#{1,2}\s+(.+)$/m)?.[1]?.trim()
  if (heading) return heading
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'Untitled document'
  }
}

function summarizeMarkdown(markdown: string, baseUrl?: string): Summary {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
    .replace(/[#>*_`~|[\]()]/g, ' ')
  return {
    words: plain.trim() ? plain.trim().split(/\s+/).length : 0,
    headings: (markdown.match(/^#{1,6}\s+/gm) || []).length,
    links: extractLinks(markdown, baseUrl).length,
    images: extractImages(markdown, baseUrl).length,
    tables: (markdown.match(/^\|.+\|$/gm) || []).length,
  }
}

function formatTime(date: Date) {
  return date.toLocaleString('en-US', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// The doc id IS the source URL, base64url-encoded (RFC 4648 §5): reversible and
// not truncated, so a copied #/<id> link — from the address bar OR the Share
// button — decodes straight back to the URL and opens the same article on any
// device, with no server and no visible "http" in the link. UTF-8 safe (URLs can
// carry non-ASCII paths).
function b64urlEncode(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(id: string): string | null {
  try {
    const b64 = id.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64.length % 4 ? b64 + '='.repeat(4 - (b64.length % 4)) : b64
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

// The reversible encoding of the source URL is the id.
function createId(url: string) {
  return b64urlEncode(url)
}

function loadStoredDocuments(): DocumentRecord[] {
  try {
    const value = safeStorageGet(storageKey)
    if (!value) return []
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return dedupeStoredDocuments(parsed.filter(isStoredDocument).map(hydrateDocument))
  } catch {
    return []
  }
}

function isStoredDocument(value: unknown): value is DocumentRecord {
  if (!value || typeof value !== 'object') return false
  const doc = value as Partial<DocumentRecord>
  return Boolean(doc.sourceUrl && safeHttpUrl(doc.sourceUrl) && doc.markdown && doc.fileName)
}

function hydrateDocument(doc: DocumentRecord): DocumentRecord {
  const sourceUrl = safeHttpUrl(doc.sourceUrl) ?? doc.sourceUrl
  const skin = skins.some((skin) => skin.id === doc.skin) ? doc.skin : DEFAULT_SKIN_ID
  return {
    ...doc,
    id: createId(sourceUrl),
    sourceUrl,
    skin,
    fileName: doc.fileName || makeFileName(doc.title, skin),
    pageKind: doc.pageKind || inferPageKind(sourceUrl, doc.markdown, doc.title),
    projectName: doc.projectName || inferProjectName(sourceUrl),
    sizeBytes: doc.sizeBytes || new Blob([doc.raw || doc.markdown]).size,
    openCount: doc.openCount || 1,
    lastSyncedAt: doc.lastSyncedAt || doc.lastOpenedAt || doc.fetchedAt,
  }
}

function dedupeStoredDocuments(docs: DocumentRecord[]) {
  const seen = new Set<string>()
  return docs.filter((doc) => {
    if (seen.has(doc.sourceUrl)) return false
    seen.add(doc.sourceUrl)
    return true
  })
}

/* ------------------------------------------------------------------ *
 * Reader providers with front-end-only fallback:
 *   Jina CN (r.jinaai.cn) · Jina Global (r.jina.ai) · Firecrawl keyless.
 * Order adapts to the network (timezone/language + remembered last-good),
 * with a short cooldown on failure. No API key ever ships in the client.
 * ------------------------------------------------------------------ */

type ProviderId = 'jinacn' | 'jina' | 'firecrawl'

const readerSourceKey = 'sneakread-reader-source'
const readerCooldownKey = 'sneakread-reader-cd'
const readerGoodKey = 'sneakread-reader-good'

// Jina's cache is the fast path (a cached page returns in ~1-2s; a forced
// fresh render of a heavy news page can take 10-20s AND burns rate-limit
// budget). Casual reading is fine with minutes-old content — only an explicit
// user Refresh bypasses the cache.
const jinaHeaders = (noCache: boolean): Record<string, string> => ({
  ...(noCache ? { 'X-No-Cache': 'true' } : {}),
  'X-Respond-With': 'markdown+frontmatter',
  'X-Retain-Images': 'all',
  'X-Retain-Links': 'all',
  'X-Timeout': '20',
})

async function readViaJina(
  base: string,
  url: string,
  signal: AbortSignal,
  noCache: boolean,
): Promise<ReaderDoc> {
  const res = await fetch(base + url, { headers: jinaHeaders(noCache), signal })
  const text = await res.text()
  if (!res.ok) throw new Error(text.slice(0, 160) || `Reader ${res.status}`)
  const parsed = parseReaderResponse(text, url)
  assertHealthyReaderDoc(parsed)
  return parsed
}

async function readViaFirecrawl(
  url: string,
  signal: AbortSignal,
  _noCache: boolean,
): Promise<ReaderDoc> {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
    signal,
  })
  if (!res.ok) throw new Error(`Firecrawl ${res.status}`)
  const json = (await res.json()) as {
    success?: boolean
    data?: { markdown?: string; metadata?: { title?: string; sourceURL?: string } }
  }
  if (!json.success || !json.data?.markdown) throw new Error('Firecrawl returned no content')
  const markdown = cleanReaderMarkdown(json.data.markdown)
  const sourceUrl = safeHttpUrl(json.data.metadata?.sourceURL, url) ?? url
  const parsed: ReaderDoc = {
    title: json.data.metadata?.title || inferTitle(markdown, sourceUrl),
    sourceUrl,
    markdown,
    fetchedAt: formatTime(new Date()),
    raw: json.data.markdown,
    summary: summarizeMarkdown(markdown, sourceUrl),
  }
  assertHealthyReaderDoc(parsed)
  return parsed
}

const providers: Record<
  ProviderId,
  {
    label: string
    timeout: number
    read: (u: string, s: AbortSignal, noCache: boolean) => Promise<ReaderDoc>
  }
> = {
  jinacn: {
    label: 'Jina CN',
    timeout: 8000,
    read: (u, s, nc) => readViaJina('https://r.jinaai.cn/', u, s, nc),
  },
  jina: {
    label: 'Jina Global',
    timeout: 8000,
    read: (u, s, nc) => readViaJina('https://r.jina.ai/', u, s, nc),
  },
  firecrawl: { label: 'Firecrawl', timeout: 18000, read: readViaFirecrawl },
}

function cnLeaning(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (/Shanghai|Chongqing|Urumqi|Hong_Kong|Macau|Harbin/i.test(tz)) return true
  } catch {
    // ignore
  }
  const langs = (
    (navigator.languages && navigator.languages.join(',')) ||
    navigator.language ||
    ''
  ).toLowerCase()
  return /zh-cn|zh-hans|(^|,)zh(,|$|-)/.test(langs)
}

function readReaderCooldowns(): Record<string, number> {
  try {
    return JSON.parse(safeStorageGet(readerCooldownKey) || '{}')
  } catch {
    return {}
  }
}

function getProviderOrder(override: string): ProviderId[] {
  const base: ProviderId[] = cnLeaning()
    ? ['jinacn', 'firecrawl', 'jina']
    : ['jina', 'jinacn', 'firecrawl']
  let order = base
  if (override && override !== 'auto' && override in providers) {
    order = [override as ProviderId, ...base.filter((id) => id !== override)]
  } else {
    const good = safeStorageGet(readerGoodKey)
    if (good && good in providers) {
      order = [good as ProviderId, ...base.filter((id) => id !== good)]
    }
  }
  const cd = readReaderCooldowns()
  const now = Date.now()
  const fresh = order.filter((id) => !(cd[id] > now))
  const cooled = order.filter((id) => cd[id] > now)
  return [...fresh, ...cooled]
}

function rememberReaderGood(id: ProviderId) {
  try {
    safeStorageSet(readerGoodKey, id)
    const cd = readReaderCooldowns()
    delete cd[id]
    safeStorageSet(readerCooldownKey, JSON.stringify(cd))
  } catch {
    // ignore
  }
}

function rememberReaderFail(id: ProviderId) {
  try {
    const cd = readReaderCooldowns()
    cd[id] = Date.now() + 8 * 60 * 1000
    safeStorageSet(readerCooldownKey, JSON.stringify(cd))
  } catch {
    // ignore
  }
}

// Hedged fallback (instead of strictly serial tries): the preferred provider
// starts immediately; the next one launches after a short head start — or the
// instant the previous one fails — and the first success wins while the rest
// are aborted. Worst-case latency drops from the sum of all timeouts (~34s)
// to the staggered-chain bound (~13-22s), and a slow or rate-limited provider
// no longer holds the whole read hostage for its full timeout.
const HEDGE_DELAY_MS = 2200

async function readWithFallback(
  url: string,
  outerSignal: AbortSignal,
  override: string,
  noCache = false,
): Promise<ReaderDoc> {
  const order = getProviderOrder(override)
  return new Promise<ReaderDoc>((resolve, reject) => {
    const controllers: AbortController[] = []
    const errors: unknown[] = []
    let started = 0
    let failed = 0
    let settled = false
    let hedgeTimer: number | undefined

    const abortAll = () => controllers.forEach((ctrl) => ctrl.abort())

    const finishSuccess = (id: ProviderId, doc: ReaderDoc) => {
      if (settled) return
      settled = true
      window.clearTimeout(hedgeTimer)
      rememberReaderGood(id)
      abortAll()
      resolve(doc)
    }

    const finishFailure = () => {
      if (settled) return
      settled = true
      window.clearTimeout(hedgeTimer)
      // Prefer a real reader error over the generic aborts our own timeouts throw.
      const meaningful = errors.find(
        (error) => !(error instanceof DOMException && error.name === 'AbortError'),
      )
      reject(meaningful ?? errors[errors.length - 1] ?? new Error('All readers failed'))
    }

    const launchNext = () => {
      if (settled || started >= order.length) return
      const id = order[started]
      started += 1
      const ctrl = new AbortController()
      controllers.push(ctrl)
      const onOuterAbort = () => ctrl.abort()
      outerSignal.addEventListener('abort', onOuterAbort)
      const timeoutTimer = window.setTimeout(() => ctrl.abort(), providers[id].timeout)
      if (started < order.length) {
        hedgeTimer = window.setTimeout(launchNext, HEDGE_DELAY_MS)
      }
      providers[id]
        .read(url, ctrl.signal, noCache)
        .then((doc) => finishSuccess(id, doc))
        .catch((error) => {
          errors.push(error)
          if (!outerSignal.aborted && !settled) rememberReaderFail(id)
          failed += 1
          if (outerSignal.aborted || failed >= order.length) {
            finishFailure()
            return
          }
          // A dead provider shouldn't make the next one wait out the hedge delay.
          window.clearTimeout(hedgeTimer)
          launchNext()
        })
        .finally(() => {
          window.clearTimeout(timeoutTimer)
          outerSignal.removeEventListener('abort', onOuterAbort)
        })
    }

    if (outerSignal.aborted) {
      reject(new DOMException('aborted', 'AbortError'))
      return
    }
    outerSignal.addEventListener('abort', abortAll, { once: true })
    launchNext()
  })
}

// Classify internal reader errors (always English, see assertHealthyReaderDoc)
// once — the class drives both the localized message and the analytics label.
type ReaderErrorKind = 'timeout' | 'empty' | 'thin' | 'blocked' | 'input' | 'other'

function readerErrorKind(loadError: unknown): ReaderErrorKind {
  if (loadError instanceof DOMException && loadError.name === 'AbortError') return 'timeout'
  const raw = loadError instanceof Error ? loadError.message : ''
  if (/timed? ?out/i.test(raw)) return 'timeout'
  if (/no readable content/i.test(raw)) return 'empty'
  if (/too little readable/i.test(raw)) return 'thin'
  if (/instead of article content/i.test(raw)) return 'blocked'
  if (raw === t('errEnterUrl') || raw === t('errHttpOnly')) return 'input'
  return 'other'
}

function loadErrorMessage(loadError: unknown) {
  const raw = loadError instanceof Error ? loadError.message : ''
  if (raw) console.warn('[reader]', raw)
  switch (readerErrorKind(loadError)) {
    case 'timeout':
      return t('errTimeout')
    case 'empty':
      return t('errNoContent')
    case 'thin':
      return t('errTooLittle')
    case 'blocked':
      return t('errBlocked')
    case 'input':
      // Locale-produced messages (normalizeUrl) pass through untouched.
      return raw
    default:
      return t('errUnknown')
  }
}

/* ------------------------------------------------------------------ *
 * Content extraction / shaping
 * ------------------------------------------------------------------ */

/* content helpers (extractHeadings/Links/Images, articleBody, emailBody, …)
 * now live in ./core/content */

function inferPageKind(url: string, markdown: string, title = ''): PageKind {
  const summary = summarizeMarkdown(markdown, url)
  const links = extractLinks(markdown, url).length
  const titleIsHost = title === getSiteLabel(url)
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.replace(/\/+$/, '')
    const segments = path.split('/').filter(Boolean)
    if (!segments.length) return 'home'
    if (/item\?id=|comments|forum|discussion/i.test(url)) return 'article'
    const joined = segments.join('/')
    const looksDated =
      /(^|\/)\d{4}\/\d{2}\/\d{2}(\/|$)/.test(joined) ||
      /(^|\/)\d{4}\/[a-z]{3}\/\d{1,2}(\/|$)/i.test(joined)
    const looksArticlePath =
      looksDated ||
      /(^|\/)(article|articles|post|posts|story|stories|wiki)\//i.test(joined) ||
      /(^|\/)news\/articles\//i.test(joined)
    const lastSegment = segments[segments.length - 1] || ''
    const sluggyDetail = lastSegment.length > 18 && /[-_]/.test(lastSegment)
    const looksListPath =
      /(^|\/)(archive|archives|articles|blog|news|world|section|sections|category|categories|tag|topics|latest|search)(\/|$)/i.test(
        joined,
      )
    if (looksArticlePath && summary.words >= 120) return 'article'
    if (looksListPath && !looksDated) return 'list'
    if (sluggyDetail && summary.words >= 350 && !titleIsHost) return 'article'
    if (links > 50 && summary.words < 1200) return 'list'
  } catch {
    return 'unknown'
  }
  if (summary.words >= 700 && !titleIsHost) return 'article'
  if (links > 40) return 'list'
  return 'unknown'
}

function makeFileName(title: string, skin: SkinId) {
  let clean = title
    .replace(/[\\/:*?"<>|#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (clean.length > 60) {
    // Cut at a word boundary — a filename chopped mid-word reads as fake.
    clean = clean.slice(0, 60).replace(/\s+\S*$/, '')
  }
  const base = clean || 'Notes'
  return `${base}.${skinById(skin).extension}`
}

function upsertRecord(records: DocumentRecord[], record: DocumentRecord) {
  return [record, ...records.filter((current) => current.id !== record.id)].slice(0, 30)
}

function createPanicDocument(now: string): DocumentRecord {
  // The boss sheet speaks the boss's language — a Chinese office running an
  // English-only budget is its own tell.
  const zh = lang === 'zh'
  const markdown = (zh
    ? [
        '# Q3 预算复盘',
        '',
        '| 部门 | 预算 | 实际 | 差异 |',
        '| --- | ---: | ---: | ---: |',
        '| 平台 | 124000 | 119400 | -4600 |',
        '| 增长 | 98000 | 101200 | 3200 |',
        '| 支持 | 42000 | 40900 | -1100 |',
        '| 研发 | 36000 | 37200 | 1200 |',
        '',
        '## 备注',
        '- 预算执行在季度审批范围内。',
        '- 供应商续约待财务复核。',
        '- 数字核对完成前不对外发送。',
      ]
    : [
        '# Q3 Budget Review',
        '',
        '| Department | Forecast | Actual | Variance |',
        '| --- | ---: | ---: | ---: |',
        '| Platform | 124000 | 119400 | -4600 |',
        '| Growth | 98000 | 101200 | 3200 |',
        '| Support | 42000 | 40900 | -1100 |',
        '| Research | 36000 | 37200 | 1200 |',
        '',
        '## Notes',
        '- Forecast remains within the approved quarterly range.',
        '- Vendor renewals are pending finance review.',
        '- No external distribution until numbers are reconciled.',
      ]
  ).join('\n')
  return {
    id: panicDocumentId,
    title: zh ? 'Q3 预算复盘' : 'Q3 Budget Review',
    sourceUrl: 'https://intranet.example.com/budget',
    markdown,
    raw: markdown,
    fetchedAt: now,
    summary: summarizeMarkdown(markdown),
    fileName: zh ? 'Q3 预算复盘.xlsx' : 'Q3 Budget Review.xlsx',
    skin: 'excel',
    pageKind: 'article',
    lastOpenedAt: now,
    projectName: zh ? '财务规划' : 'Finance Planning',
    sizeBytes: new Blob([markdown]).size,
    openCount: 1,
    lastSyncedAt: now,
  }
}

// A localized welcome "document" rendered by every non-Word/VS-Code home skin,
// so the "Open as…" gallery previews EVERY disguise in its real chrome. The
// sample links are live — the stage click handler routes them through the
// reader in the previewed skin.
function createHomeDocument(skin: SkinId): DocumentRecord {
  const c = landingContent(lang)
  const brand = tr(lang, 'brand')
  const tagline = tr(lang, 'tagline')
  const markdown = [
    c.heroSub,
    '',
    `> **⌘K / Ctrl K** — ${tr(lang, 'wTip')}`,
    '',
    ...samplesFor(lang).map((s) => `- [${s.label}](${s.url})`),
    '',
    `## ${c.featuresTitle}`,
    ...c.features.map((f) => `- **${f.t}** — ${f.d}`),
    '',
    `## ${c.faqTitle}`,
    ...c.faqs.flatMap((q) => [`### ${q.q}`, '', q.a, '']),
  ].join('\n')
  const now = formatTime(new Date())
  return {
    id: 'home-welcome',
    title: `${brand} · ${tagline}`,
    sourceUrl: 'https://sneakread.com/',
    markdown,
    raw: markdown,
    fetchedAt: now,
    summary: summarizeMarkdown(markdown),
    fileName: makeFileName(`${brand} — Getting Started`, skin),
    skin,
    pageKind: 'article',
    lastOpenedAt: now,
    projectName: brand,
    sizeBytes: new Blob([markdown]).size,
    openCount: 1,
    lastSyncedAt: now,
  }
}

function setFavicon(skin: SkinId) {
  // Derived from the skin registry (accent + glyph) — no central list to keep in
  // sync, so a new skin's favicon comes for free once its module is dropped in.
  const meta = skinById(skin)
  // Escape XML-special chars — VS Code's glyph is "<>", which is invalid raw SVG.
  const glyph = meta.faviconGlyph.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const fontSize = meta.faviconGlyph.length > 1 ? 22 : 30
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="${meta.accent}"/><text x="32" y="44" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="white">${glyph}</text></svg>`
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/* ------------------------------------------------------------------ *
 * Hash routing (deep link the active file + skin, invisibly)
 * ------------------------------------------------------------------ */

type Route = {
  docId: string | null
  skin: SkinId | null
  u: string | null
  uSkin: SkinId | null
}

function routeFromHash(): Route {
  const raw = window.location.hash.replace(/^#/, '')
  const asSkin = (v: string | null) => (skins.some((s) => s.id === v) ? (v as SkinId) : null)
  // Share / sample deep link: #u=<encoded-url>&skin=<skin>
  if (raw.startsWith('u=')) {
    const params = new URLSearchParams(raw)
    return { docId: null, skin: null, u: params.get('u'), uSkin: asSkin(params.get('skin')) }
  }
  // Internal doc route: #/<docId>?skin=<skin>
  const [path, queryString = ''] = raw.replace(/^\/?/, '').split('?')
  const params = new URLSearchParams(queryString)
  let docId: string | null = null
  if (path) {
    // A malformed percent-sequence (e.g. "#/%E0%A4%A") makes decodeURIComponent
    // throw and would crash boot. base64url ids never need decoding anyway.
    try {
      docId = decodeURIComponent(path)
    } catch {
      docId = path
    }
  }
  return {
    docId,
    skin: asSkin(params.get('skin')),
    u: null,
    uSkin: null,
  }
}

function updateHash(docId: string | null, skin: SkinId, push = false) {
  const next = docId ? `#/${encodeURIComponent(docId)}?skin=${skin}` : '#/'
  if (window.location.hash === next) return
  // Opening a *different* document pushes a history entry so the browser Back
  // button steps back through articles (still disguised) instead of leaving
  // the site; skin switches and home just rewrite the current entry.
  if (push) window.history.pushState(null, '', next)
  else window.history.replaceState(null, '', next)
}

/* ================================================================== *
 * App
 * ================================================================== */

function AppShell() {
  const [records, setRecords] = useState<DocumentRecord[]>(loadStoredDocuments)
  const initialRoute = useRef(routeFromHash())
  const [activeId, setActiveId] = useState<string | null>(initialRoute.current.docId)
  // The deep-linked skin, captured once — the skin-apply effect below nulls the
  // route copy, so grab it here for the "open a shared link we don't have" path.
  const bootSkin = useRef<SkinId | null>(
    initialRoute.current.skin ?? initialRoute.current.uSkin,
  )
  const didInitialSync = useRef(false)
  const [status, setStatus] = useState<LoadState>('idle')
  const [error, setError] = useState('')
  const [loadingUrl, setLoadingUrl] = useState('')
  // The disguise the loading skeleton wears — the one the page will open in.
  const [loadingSkin, setLoadingSkin] = useState<SkinId>(DEFAULT_SKIN_ID)
  const [onboarded, setOnboarded] = useState(
    () => safeStorageGet(onboardKey) === '1',
  )
  // The menu-coach shows once PER SKIN: every disguise mounts its real menu in
  // a different spot ("File", "…", the hamburger, a title bar), so learning it
  // once in Word doesn't help in DingTalk. Legacy value '1' resets to empty —
  // one more nudge per skin is cheap; a lost user is not.
  const [coachSeen, setCoachSeen] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(safeStorageGet(coachKey) || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const dismissCoach = () => {
    setCoachSeen((current) => {
      if (current.includes(activeSkin)) return current
      const next = [...current, activeSkin]
      safeStorageSet(coachKey, JSON.stringify(next))
      return next
    })
  }
  // The home now has its own prominent URL box, so don't auto-open the palette
  // over it — ⌘K still opens it on demand.
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [bossMode, setBossMode] = useState(false)
  const [panic, setPanic] = useState(false)
  const [panicPrev, setPanicPrev] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const manualCancelRef = useRef(false)
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  // Which skin the home/welcome shows (Word by default; VS Code via the CTA).
  // homeSkin = which welcome shell the home shows (only Word/VS Code have one).
  // openSkin = the disguise the NEXT opened article uses (any skin, chosen in the
  // "Open as…" gallery). Decoupled so picking Notion/Slack/Lark sets the default
  // and highlights the gallery WITHOUT leaving the home chrome/title/favicon out
  // of sync (they keep reflecting the real Word/VS Code shell on screen).
  const [homeSkin, setHomeSkin] = useState<SkinId>(DEFAULT_SKIN_ID)
  const [openSkin, setOpenSkin] = useState<SkinId>(DEFAULT_SKIN_ID)
  // Picking any skin previews it live: Word/VS Code show their interactive
  // welcome shells; every other skin renders the welcome document in its own
  // real chrome (see createHomeDocument).
  const pickHomeSkin = (id: SkinId) => {
    if (id !== homeSkin) track('skin_switch', { from_skin: homeSkin, to_skin: id, surface: 'home' })
    setOpenSkin(id)
    setHomeSkin(id)
  }

  const panicDoc = useMemo(() => createPanicDocument(formatTime(new Date())), [panic])
  const homeDoc = useMemo(() => createHomeDocument(homeSkin), [homeSkin])
  const activeDoc = panic
    ? panicDoc
    : records.find((record) => record.id === activeId) ?? null
  const activeSkin: SkinId = panic ? 'excel' : activeDoc?.skin ?? homeSkin
  const activeSkinMeta = skinById(activeSkin)

  // Persist library
  useEffect(() => {
    const counts = [30, 15, 8, 3, 1]
    for (const count of counts) {
      if (safeStorageSet(storageKey, JSON.stringify(records.slice(0, count)))) {
        return
      }
    }
  }, [records])

  // Title bar + favicon reflect the disguise, never "Moyu"
  useEffect(() => {
    if (panic) {
      document.title = `${panicDoc.fileName} - Excel`
      setFavicon('excel')
      return
    }
    // The home tab title tracks the home skin (default Word), matching the
    // filename shown in its chrome — not a hardcoded VS Code.
    // Feishu/Lark rename the app by region, so resolve the display name per language.
    const appName = skinAppName(activeSkinMeta, lang)
    const homeName =
      activeSkin === 'vscode'
        ? 'Welcome'
        : `${tr(lang, 'brand')} — Getting Started.${activeSkinMeta.extension}`
    document.title = activeDoc
      ? `${activeDoc.fileName} - ${appName}`
      : `${homeName} - ${appName}`
    setFavicon(activeSkin)
  }, [activeDoc, activeSkin, activeSkinMeta.appName, panic])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [])

  // Keep hash in sync (invisible deep link)
  const lastHashDocId = useRef<string | null>(initialRoute.current.docId)
  useEffect(() => {
    if (panic) return
    // Don't clobber a booting deep link (#/<id> or #u=) to "#/" before the boot
    // effect below resolves it — otherwise a copied share link is lost if the
    // fetch is slow/fails. Skip exactly the first sync in that case; once the doc
    // opens, activeDoc changes and this effect re-runs to write #/<id>.
    if (!didInitialSync.current) {
      didInitialSync.current = true
      if (!activeDoc && (initialRoute.current.docId || initialRoute.current.u)) return
    }
    const docId = activeDoc ? activeDoc.id : null
    updateHash(docId, activeSkin, docId !== null && docId !== lastHashDocId.current)
    lastHashDocId.current = docId
  }, [activeDoc, activeSkin, panic])

  // Browser Back/Forward: each opened article pushed a history entry, so
  // stepping through history swaps documents without leaving the disguise.
  useEffect(() => {
    const onPop = () => {
      const route = routeFromHash()
      setPanic(false)
      lastHashDocId.current = route.docId
      if (!route.docId) {
        setActiveId(null)
        return
      }
      const known = records.find((record) => record.id === route.docId)
      if (known) {
        if (route.skin && route.skin !== known.skin) {
          const skin = route.skin
          setRecords((current) =>
            current.map((record) =>
              record.id === route.docId ? { ...record, skin } : record,
            ),
          )
        }
        setActiveId(route.docId)
        setStatus('ready')
        return
      }
      // A history entry for a doc we no longer hold (e.g. pruned) — the id is
      // the base64url source URL, so just re-open it.
      const decoded = b64urlDecode(route.docId)
      const safe = decoded ? safeHttpUrl(decoded) : null
      if (safe) openUrl(safe, route.skin ?? undefined)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  })

  // Apply the deep-linked skin once records are available
  useEffect(() => {
    const wanted = initialRoute.current.skin
    if (!wanted) return
    initialRoute.current.skin = null
    setRecords((current) =>
      current.map((record) =>
        record.id === initialRoute.current.docId ? { ...record, skin: wanted } : record,
      ),
    )
  }, [])

  const openUrl = async (rawInput: string, forcedSkin?: SkinId, force = false) => {
    let targetUrl: string
    try {
      targetUrl = normalizeUrl(rawInput)
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Invalid URL')
      setStatus('error')
      return
    }

    setPanic(false)
    const existing = records.find((record) => record.sourceUrl === targetUrl)
    if (existing && !force) {
      const now = formatTime(new Date())
      const updated: DocumentRecord = {
        ...existing,
        skin: forcedSkin ?? existing.skin,
        lastOpenedAt: now,
        lastSyncedAt: now,
        openCount: (existing.openCount || 1) + 1,
      }
      setRecords((current) => upsertRecord(current, updated))
      setActiveId(updated.id)
      setStatus('ready')
      track('document_open', {
        skin: updated.skin,
        page_kind: updated.pageKind,
        source_domain: getSiteLabel(targetUrl),
        cached: true,
      })
      return
    }

    setStatus('loading')
    setError('')
    setLoadingUrl(targetUrl)
    setLoadingSkin(forcedSkin ?? DEFAULT_SKIN_ID)
    const controller = new AbortController()
    abortRef.current = controller
    manualCancelRef.current = false
    const fetchStartedAt = performance.now()
    const durationBucket = () =>
      bucket(performance.now() - fetchStartedAt, [1000, 3000, 8000, 20000])
    try {
      const override = safeStorageGet(readerSourceKey) || 'auto'
      // `force` = the user's explicit Refresh — the only case worth a slow,
      // rate-limited fresh render instead of Jina's warm cache.
      const parsed = await readWithFallback(targetUrl, controller.signal, override, force)
      track('reader_fetch', {
        ok: true,
        source_domain: getSiteLabel(targetUrl),
        provider: safeStorageGet(readerGoodKey) || 'unknown',
        duration_bucket: durationBucket(),
      })
      // One canonical URL for the whole record: the reader may report a
      // redirected/canonical sourceUrl that differs from targetUrl. The id MUST
      // derive from the same URL that's stored (and that hydrateDocument re-hashes
      // on reload) or the address-bar/#share id won't resolve back to this doc.
      const canonicalUrl = parsed.sourceUrl
      const pageKind = inferPageKind(canonicalUrl, parsed.markdown, parsed.title)
      // Open in the default skin (Word). The disguise never auto-switches; only
      // the user changes it (File menu). Link-clicks keep the current skin.
      const skin = forcedSkin ?? DEFAULT_SKIN_ID
      const record: DocumentRecord = {
        ...parsed,
        id: createId(canonicalUrl),
        fileName: makeFileName(parsed.title, skin),
        skin,
        pageKind,
        lastOpenedAt: parsed.fetchedAt,
        projectName: inferProjectName(canonicalUrl),
        sizeBytes: new Blob([parsed.raw]).size,
        openCount: 1,
        lastSyncedAt: parsed.fetchedAt,
      }
      setRecords((current) => upsertRecord(current, record))
      setActiveId(record.id)
      setStatus('ready')
      track('document_open', {
        skin,
        page_kind: pageKind,
        source_domain: getSiteLabel(canonicalUrl),
        words_bucket: bucket(parsed.summary.words, [100, 500, 2000, 5000]),
        cached: false,
      })
    } catch (loadError) {
      if (manualCancelRef.current) {
        manualCancelRef.current = false
        setStatus('idle')
        setError('')
        return
      }
      track('reader_fetch', {
        ok: false,
        source_domain: getSiteLabel(targetUrl),
        error_kind: readerErrorKind(loadError),
        duration_bucket: durationBucket(),
      })
      setError(loadErrorMessage(loadError))
      setStatus('error')
    } finally {
      abortRef.current = null
    }
  }

  const cancelLoad = () => {
    manualCancelRef.current = true
    abortRef.current?.abort()
    setStatus('idle')
  }

  // Clicks on links inside rendered content stay in-app: load through the
  // reader in the current skin, so you browse article-to-article disguised.
  const onStageClick = (event: ReactMouseEvent) => {
    const target = event.target as HTMLElement
    const trigger = target.closest?.('[data-appmenu]')
    if (trigger) {
      event.preventDefault()
      dismissCoach()
      const rect = trigger.getBoundingClientRect()
      // Keep the menu on screen: flip above bottom-edge mounts (status bars),
      // clamp against the right edge for trailing "…" buttons. The height
      // estimate mirrors the menu's CSS max-height (82vh).
      const estimatedH = window.innerHeight * 0.82
      const menuW = 260
      let y = rect.bottom + 4
      if (y + estimatedH > window.innerHeight - 8) {
        y = Math.max(8, Math.min(rect.top - estimatedH - 4, window.innerHeight - estimatedH - 8))
      }
      const x = Math.max(8, Math.min(rect.left, window.innerWidth - menuW - 8))
      setMenuAnchor((current) => (current ? null : { x, y }))
      return
    }
    const anchor = target.closest?.('a[href]') as HTMLAnchorElement | null
    if (!anchor) return
    // Explicit new-tab / download links keep native behavior. Links inside a
    // document AND inside the home-preview welcome doc both route through the
    // reader in the current disguise.
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return
    const href = anchor.getAttribute('href') || ''
    const safeHref = safeHttpUrl(href, activeDoc?.sourceUrl)
    if (!safeHref) {
      event.preventDefault()
      return
    }
    // In-page anchors (footnotes, table-of-contents jumps) resolve to the same
    // article + a #fragment — scroll to the target instead of re-fetching the
    // whole page (which would drop the reader back at the top).
    if (activeDoc) {
      try {
        const dest = new URL(safeHref)
        const cur = new URL(activeDoc.sourceUrl)
        const sameDoc =
          dest.origin === cur.origin && dest.pathname === cur.pathname && dest.search === cur.search
        if (dest.hash && sameDoc) {
          event.preventDefault()
          const el = document.getElementById(decodeURIComponent(dest.hash.slice(1)))
          el?.scrollIntoView({ behavior: 'smooth' })
          return
        }
      } catch {
        // fall through to normal open
      }
    }
    event.preventDefault()
    if (event.metaKey || event.ctrlKey) {
      window.open(safeHref, '_blank', 'noopener,noreferrer')
      return
    }
    openUrl(safeHref, panic ? undefined : activeDoc?.skin ?? homeSkin)
  }

  const goHome = () => {
    setPanic(false)
    // Keep the current disguise on the way home — never break character.
    if (activeDoc) {
      setHomeSkin(activeDoc.skin)
      setOpenSkin(activeDoc.skin)
    }
    setActiveId(null)
  }

  const setLanguage = (code: Lang) => {
    if (code === lang) return
    track('language_change', { from: lang, to: code })
    safeStorageSet(langKey, code)
    window.location.reload()
  }

  const finishOnboarding = (openPalette: boolean) => {
    safeStorageSet(onboardKey, '1')
    setOnboarded(true)
    track('onboarding_done', { cta: openPalette })
    if (openPalette) setPaletteOpen(true)
  }

  const changeSkin = (skin: SkinId) => {
    setPanic(false)
    if (!activeDoc) return
    track('skin_switch', { from_skin: activeDoc.skin, to_skin: skin })
    setRecords((current) =>
      current.map((record) =>
        record.id === activeDoc.id
          ? { ...record, skin, fileName: makeFileName(record.title, skin) }
          : record,
      ),
    )
  }

  const refreshActive = () => {
    if (panic || !activeDoc) return
    openUrl(activeDoc.sourceUrl, activeDoc.skin, true)
  }

  const openRecord = (record: DocumentRecord) => {
    setPanic(false)
    setActiveId(record.id)
    setStatus('ready')
    setRecords((current) =>
      upsertRecord(current, { ...record, lastOpenedAt: formatTime(new Date()) }),
    )
  }

  const togglePanic = () => {
    setPaletteOpen(false)
    track('panic', { action: panic ? 'close' : 'open' })
    if (panic) {
      setPanic(false)
      if (panicPrev) setActiveId(panicPrev)
      setPanicPrev(null)
      return
    }
    setPanicPrev(activeId)
    setPanic(true)
  }

  const toggleBossMode = () => {
    track('boss_auto_hide', { on: !bossMode })
    setBossMode((value) => !value)
  }

  const enterFullscreen = () => {
    const el = document.documentElement
    if (document.fullscreenElement) document.exitFullscreen?.()
    else el.requestFullscreen?.().catch(() => {})
  }

  const copySource = async () => {
    if (activeDoc) await navigator.clipboard.writeText(activeDoc.raw).catch(() => {})
  }

  // A self-contained link that re-opens the same page in the same disguise for
  // anyone (the source URL + skin travel in the hash, so it survives sharing).
  // Wrapped in a one-line in-joke so every share carries its own pitch.
  const copyShareLink = async () => {
    if (!activeDoc) return
    // Same reversible form as the address bar: #/<base64url(url)>?skin=… — opaque
    // (no visible http), and the recipient's app decodes it back to the article.
    // Keep the current path (language / deploy base) so the link opens correctly.
    const link = `${window.location.origin}${window.location.pathname}#/${activeDoc.id}?skin=${activeSkin}`
    const blurb = t('shareBlurb', { app: skinAppName(activeSkinMeta, lang), link })
    await navigator.clipboard.writeText(blurb).catch(() => {})
    track('share_copy', { skin: activeSkin })
  }

  // Personalized disguise: ask for the name shown on avatars / watermark.
  const [, bumpAlias] = useState(0)
  const promptAlias = () => {
    const next = window.prompt(t('aliasPrompt'), getAlias())
    if (next === null) return
    setAlias(next)
    track('alias_set', { set: Boolean(next.trim()) })
    bumpAlias((value) => value + 1)
  }

  // Open a shared / sample deep link (#u=<url>&skin=<skin>). Read the route
  // captured synchronously at mount — the hash-sync effect above runs first and
  // would otherwise clobber #u= before we get here.
  useEffect(() => {
    const { u, uSkin, docId } = initialRoute.current
    // Legacy share form #u=<encoded-url>&skin=…
    if (u) {
      window.history.replaceState(null, '', window.location.pathname)
      openUrl(u, uSkin ?? DEFAULT_SKIN_ID)
      return
    }
    // A #/<id> link we don't have locally (opened on a friend's device, or a
    // copied address-bar link): the id is the base64url-encoded source URL —
    // decode it and open the same article. Our own docs already resolve via
    // records.find, so only the not-found case needs decoding.
    if (docId && !records.some((record) => record.id === docId)) {
      const decoded = b64urlDecode(docId)
      const safe = decoded ? safeHttpUrl(decoded) : null
      if (safe) openUrl(safe, bootSkin.current ?? DEFAULT_SKIN_ID)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Global keyboard: palette + boss key
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac')
      const meta = isMac ? event.metaKey : event.ctrlKey

      if (meta && ['k', 'p', 'l'].includes(event.key.toLowerCase())) {
        event.preventDefault()
        setPaletteOpen(true)
        return
      }
      if (meta && event.key === '.') {
        event.preventDefault()
        togglePanic()
        return
      }
      if (event.key === 'Escape') {
        if (paletteOpen) {
          setPaletteOpen(false)
        } else if (menuAnchor) {
          setMenuAnchor(null)
        } else if (aboutOpen) {
          setAboutOpen(false)
        } else {
          event.preventDefault()
          togglePanic()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Warm Monaco (the ~3.6MB real VS Code editor chunk) only when a VS Code
  // surface is on deck — a Word-home visitor should never download an IDE.
  // The skin degrades gracefully anyway (static CodeEditor until Monaco lands).
  useEffect(() => {
    if (activeSkin === 'vscode' || openSkin === 'vscode') {
      void import('./monacoCode')
    }
  }, [activeSkin, openSkin])

  // Analytics: sanitized SPA page_views (a stable virtual path — never the
  // hash, which encodes the source URL) + palette opens.
  useEffect(() => {
    trackPageView(activeDoc ? '/read' : window.location.pathname, {
      skin: activeSkin,
      ...(activeDoc ? { source_domain: getSiteLabel(activeDoc.sourceUrl) } : {}),
      language: lang,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  useEffect(() => {
    if (paletteOpen) track('palette_open')
  }, [paletteOpen])

  useEffect(() => {
    if (menuAnchor) track('menu_open', { skin: activeSkin })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuAnchor])

  // Boss auto-hide when the window loses focus
  useEffect(() => {
    if (!bossMode) return
    const onBlur = () => {
      if (!panic) {
        setPanicPrev(activeId)
        setPanic(true)
      }
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [bossMode, panic, activeId])

  const commands = useMemo<PaletteCommand[]>(() => {
    const list: PaletteCommand[] = []
    skins.forEach((skin) => {
      const label = skinLabel(skin, lang)
      list.push({
        id: `skin-${skin.id}`,
        title: t('openAs', { app: label }),
        hint: skinAppName(skin, lang),
        keywords: `skin open as ${skin.id} ${label} ${skin.label}`,
        // With a document open this re-skins it; on the home it swaps the
        // live preview — either way the command always does something.
        enabled: true,
        run: () => (activeDoc ? changeSkin(skin.id) : pickHomeSkin(skin.id)),
      })
    })
    list.push(
      {
        id: 'refresh',
        title: t('cmdRefresh'),
        hint: activeDoc ? getSiteLabel(activeDoc.sourceUrl) : '',
        keywords: 'reload refetch refresh',
        enabled: Boolean(activeDoc),
        run: refreshActive,
      },
      {
        id: 'share',
        title: t('cmdShare'),
        hint: activeDoc ? getSiteLabel(activeDoc.sourceUrl) : '',
        keywords: 'share link copy send friend',
        enabled: Boolean(activeDoc),
        run: copyShareLink,
      },
      {
        id: 'copy',
        title: t('cmdCopy'),
        hint: '',
        keywords: 'copy clipboard source',
        enabled: Boolean(activeDoc),
        run: copySource,
      },
      {
        id: 'open-original',
        title: t('cmdOriginal'),
        hint: activeDoc ? getSiteLabel(activeDoc.sourceUrl) : '',
        keywords: 'browser external original source',
        enabled: Boolean(activeDoc),
        run: () =>
          activeDoc && window.open(activeDoc.sourceUrl, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'fullscreen',
        title: t('cmdFullscreen'),
        hint: t('cmdFullscreenHint'),
        keywords: 'fullscreen present full screen',
        enabled: true,
        run: enterFullscreen,
      },
      {
        id: 'boss',
        title: bossMode ? t('bossOn') : t('bossOff'),
        hint: t('bossHint'),
        keywords: 'boss blur safe hide auto',
        enabled: true,
        run: toggleBossMode,
      },
      {
        id: 'panic',
        title: t('cmdPanic'),
        hint: 'Esc',
        keywords: 'panic safe boss excel budget',
        enabled: true,
        run: togglePanic,
      },
    )
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc, bossMode])

  const recents = records.filter((record) => record.id !== panicDocumentId)

  return (
    <div
      className={`stage skin-${activeSkin}${activeDoc ? '' : ' home-stage'}`}
      onClick={onStageClick}
    >
      {activeDoc ? (
        <SkinControlsProvider value={{ activeSkin, skins, onSwitchSkin: changeSkin }}>
          <SkinSurface doc={activeDoc} skin={activeSkin} />
        </SkinControlsProvider>
      ) : homeSkin === 'vscode' ? (
        <VscodeWelcome
          lang={lang}
          onOpen={(url) => openUrl(url, openSkin)}
          records={recents}
          onOpenRecord={openRecord}
          status={status}
          error={error}
          inApp
          onPickSkin={pickHomeSkin}
          homeSkin={openSkin}
        />
      ) : homeSkin === 'word' ? (
        <WordWelcome
          lang={lang}
          onOpen={(url) => openUrl(url, openSkin)}
          records={recents}
          onOpenRecord={openRecord}
          status={status}
          error={error}
          inApp
          onPickSkin={pickHomeSkin}
          homeSkin={openSkin}
        />
      ) : (
        // Live preview: the welcome document rendered by the picked skin's own
        // chrome. Sample links inside it open through the reader as usual.
        <SkinControlsProvider
          value={{ activeSkin: homeSkin, skins, onSwitchSkin: pickHomeSkin }}
        >
          <SkinSurface doc={homeDoc} skin={homeSkin} />
        </SkinControlsProvider>
      )}

      {status === 'loading' && (
        <LoadingOverlay url={loadingUrl} skin={loadingSkin} onCancel={cancelLoad} />
      )}

      {paletteOpen && (
        <CommandPalette
          commands={commands}
          records={recents}
          onClose={() => setPaletteOpen(false)}
          onOpenUrl={(url, skin) => {
            setPaletteOpen(false)
            // Honor the disguise the user chose: explicit > current doc > home gallery pick.
            openUrl(url, skin ?? activeDoc?.skin ?? openSkin)
          }}
          onOpenRecord={(record) => {
            setPaletteOpen(false)
            openRecord(record)
          }}
        />
      )}

      {menuAnchor && (
        <AppMenu
          anchor={menuAnchor}
          activeSkin={activeSkin}
          canDoc={Boolean(activeDoc)}
          bossMode={bossMode}
          onClose={() => setMenuAnchor(null)}
          actions={{
            openPalette: () => setPaletteOpen(true),
            goHome,
            // On the home there is no document yet — "Open as X" switches the
            // live home preview instead of silently doing nothing.
            setSkin: activeDoc ? changeSkin : pickHomeSkin,
            setLang: setLanguage,
            alias: promptAlias,
            setReaderSource: (source) => {
              if (source === 'auto') safeStorageRemove(readerSourceKey)
              else safeStorageSet(readerSourceKey, source)
              // A changed source only matters for the next fetch; clear
              // cooldowns so the forced provider is actually tried.
              safeStorageRemove(readerCooldownKey)
              if (!panic && activeDoc) openUrl(activeDoc.sourceUrl, activeDoc.skin, true)
            },
            refresh: refreshActive,
            share: copyShareLink,
            copy: copySource,
            original: () => {
              if (!activeDoc) return
              track('original_open', { source_domain: getSiteLabel(activeDoc.sourceUrl) })
              window.open(activeDoc.sourceUrl, '_blank', 'noopener,noreferrer')
            },
            fullscreen: enterFullscreen,
            toggleBoss: toggleBossMode,
            panic: togglePanic,
            help: () => setAboutOpen(true),
          }}
        />
      )}

      {/* Teach on the first opened document, not on the landing — the ⌘K/Esc
          knowledge only makes sense once there is something to hide. */}
      {((Boolean(activeDoc) && !onboarded) || aboutOpen) && (
        <Onboarding
          onStart={() => (onboarded ? setAboutOpen(false) : finishOnboarding(false))}
          onSkip={() => (onboarded ? setAboutOpen(false) : finishOnboarding(false))}
        />
      )}

      {onboarded &&
        !coachSeen.includes(activeSkin) &&
        !panic &&
        !aboutOpen &&
        !menuAnchor &&
        !paletteOpen &&
        activeDoc && <FileCoach skin={activeSkin} onDismiss={dismissCoach} />}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * First-run coach-mark: points at the File menu so users learn the
 * disguise chrome hides real controls (language, share, boss key).
 * ------------------------------------------------------------------ */

function FileCoach({ skin, onDismiss }: { skin: SkinId; onDismiss: () => void }) {
  const [rect, setRect] = useState<{ left: number; top: number; bottom: number } | null>(null)

  useEffect(() => {
    let raf = 0
    const measure = () => {
      const el = document.querySelector('[data-appmenu="file"]') as HTMLElement | null
      if (!el) {
        // Chrome may not be painted yet on the first frame; retry next tick.
        raf = window.requestAnimationFrame(measure)
        return
      }
      const r = el.getBoundingClientRect()
      setRect({ left: r.left, top: r.top, bottom: r.bottom })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [skin])

  if (!rect) return null
  // Keep the callout on screen: mounts live in every corner of the chrome
  // (top File tabs, right-edge "…" buttons, bottom status bars), so clamp
  // horizontally and flip above bottom-edge anchors. Mirrors the app-menu
  // positioning logic. Sizes match .coach-callout CSS (max-width 280).
  const calloutW = 280
  const calloutH = 150
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - calloutW - 12))
  const flipped = rect.bottom + 12 + calloutH > window.innerHeight - 8
  const top = flipped ? Math.max(8, rect.top - calloutH - 12) : rect.bottom + 12
  return (
    <div className="coach-layer" dir={isRtl ? 'rtl' : undefined}>
      <div
        className="coach-ring"
        style={{ left: rect.left - 6, top: rect.top - 4 }}
        aria-hidden
      />
      <div className={`coach-callout${flipped ? ' is-flipped' : ''}`} style={{ left, top }}>
        <div className="coach-arrow" />
        <strong>{t('coachTitle')}</strong>
        <p>{t('coachBody')}</p>
        <button type="button" className="coach-got" onClick={onDismiss}>
          {t('coachGot')}
        </button>
      </div>
    </div>
  )
}

type MenuActions = {
  openPalette: () => void
  goHome: () => void
  setSkin: (skin: SkinId) => void
  setLang: (code: Lang) => void
  alias: () => void
  setReaderSource: (source: string) => void
  refresh: () => void
  share: () => void
  copy: () => void
  original: () => void
  fullscreen: () => void
  toggleBoss: () => void
  panic: () => void
  help: () => void
}

function AppMenu({
  anchor,
  activeSkin,
  canDoc,
  bossMode,
  onClose,
  actions,
}: {
  anchor: { x: number; y: number }
  activeSkin: SkinId
  canDoc: boolean
  bossMode: boolean
  onClose: () => void
  actions: MenuActions
}) {
  const [langOpen, setLangOpen] = useState(false)
  const [readerOpen, setReaderOpen] = useState(false)
  const [readerPref, setReaderPref] = useState(() => {
    return safeStorageGet(readerSourceKey) || 'auto'
  })
  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }
  return (
    <>
      <div className="menu-scrim" onClick={onClose} />
      <div
        className="app-menu"
        style={{ top: anchor.y, left: anchor.x }}
        dir={isRtl ? 'rtl' : undefined}
      >
        <button type="button" className="menu-item" onClick={run(actions.openPalette)}>
          <span>{t('wOpenUrl')}</span>
          <span className="menu-kbd">⌘K</span>
        </button>
        <button type="button" className="menu-item" onClick={run(actions.goHome)}>
          <span>{t('mHome')}</span>
        </button>
        <div className="menu-sep" />
        {skins.map((skin) => (
          <button
            key={skin.id}
            type="button"
            className="menu-item"
            onClick={run(() => actions.setSkin(skin.id))}
          >
            <span>{t('openAs', { app: skinLabel(skin, lang) })}</span>
            {skin.id === activeSkin && <span className="menu-check">✓</span>}
          </button>
        ))}
        <div className="menu-sep" />
        <button
          type="button"
          className="menu-item"
          onClick={() => setLangOpen((value) => !value)}
        >
          <span>{t('mLanguage')}</span>
          <span className="menu-caret">{langOpen ? '▾' : '▸'}</span>
        </button>
        {langOpen &&
          ALL_LANGS.map((code) => (
            <button
              key={code}
              type="button"
              className="menu-item menu-sub"
              onClick={run(() => actions.setLang(code))}
            >
              <span>{LANG_NAMES[code]}</span>
              {code === lang && <span className="menu-check">✓</span>}
            </button>
          ))}
        <button type="button" className="menu-item" onClick={run(actions.alias)}>
          <span>{t('mAlias')}</span>
        </button>
        <button
          type="button"
          className="menu-item"
          onClick={() => setReaderOpen((value) => !value)}
        >
          <span>{t('mReader')}</span>
          <span className="menu-caret">{readerOpen ? '▾' : '▸'}</span>
        </button>
        {readerOpen &&
          (
            [
              ['auto', t('mReaderAuto')],
              ['jinacn', 'Jina CN'],
              ['jina', 'Jina Global'],
              ['firecrawl', 'Firecrawl'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="menu-item menu-sub"
              onClick={run(() => {
                setReaderPref(value)
                actions.setReaderSource(value)
              })}
            >
              <span>{label}</span>
              {value === readerPref && <span className="menu-check">✓</span>}
            </button>
          ))}
        <div className="menu-sep" />
        <button
          type="button"
          className="menu-item"
          disabled={!canDoc}
          onClick={run(actions.share)}
        >
          <span>{t('cmdShare')}</span>
        </button>
        <button
          type="button"
          className="menu-item"
          disabled={!canDoc}
          onClick={run(actions.refresh)}
        >
          <span>{t('cmdRefresh')}</span>
        </button>
        <button
          type="button"
          className="menu-item"
          disabled={!canDoc}
          onClick={run(actions.copy)}
        >
          <span>{t('cmdCopy')}</span>
        </button>
        <button
          type="button"
          className="menu-item"
          disabled={!canDoc}
          onClick={run(actions.original)}
        >
          <span>{t('cmdOriginal')}</span>
        </button>
        <button type="button" className="menu-item" onClick={run(actions.fullscreen)}>
          <span>{t('cmdFullscreen')}</span>
        </button>
        <button type="button" className="menu-item" onClick={run(actions.toggleBoss)}>
          <span>{bossMode ? t('bossOn') : t('bossOff')}</span>
        </button>
        <button type="button" className="menu-item" onClick={run(actions.panic)}>
          <span>{t('cmdPanic')}</span>
          <span className="menu-kbd">Esc</span>
        </button>
        <div className="menu-sep" />
        <button type="button" className="menu-item" onClick={run(actions.help)}>
          <span>{t('mHelp')}</span>
        </button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Command palette (native VS Code quick-open styling)
 * ------------------------------------------------------------------ */

type PaletteCommand = {
  id: string
  title: string
  hint: string
  keywords: string
  enabled: boolean
  run: () => void
}

function CommandPalette({
  commands,
  records,
  onClose,
  onOpenUrl,
  onOpenRecord,
}: {
  commands: PaletteCommand[]
  records: DocumentRecord[]
  onClose: () => void
  onOpenUrl: (url: string, skin?: SkinId) => void
  onOpenRecord: (record: DocumentRecord) => void
}) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const isUrl = looksLikeUrl(query)
  const q = query.trim().toLowerCase()

  type Item = { key: string; title: string; hint: string; run: () => void }
  const items: Item[] = []

  if (isUrl) {
    items.push({
      key: 'open-url',
      title: `${t('itemOpen')}  ${query.trim()}`,
      hint: 'Enter',
      run: () => {
        track('url_submit', { surface: 'palette' })
        onOpenUrl(query.trim())
      },
    })
  }

  commands
    .filter((command) => command.enabled)
    .filter((command) =>
      q && !isUrl
        ? `${command.title} ${command.keywords}`.toLowerCase().includes(q)
        : !isUrl,
    )
    .forEach((command) =>
      items.push({
        key: command.id,
        title: command.title,
        hint: command.hint,
        run: command.run,
      }),
    )

  if (!isUrl) {
    records
      .filter((record) =>
        q ? `${record.fileName} ${record.title} ${record.sourceUrl}`.toLowerCase().includes(q) : true,
      )
      .slice(0, 8)
      .forEach((record) =>
        items.push({
          key: `rec-${record.id}`,
          title: record.fileName,
          hint: getSiteLabel(record.sourceUrl),
          run: () => onOpenRecord(record),
        }),
      )

    if (records.length === 0 && !q) {
      samplesFor(lang).forEach((s) =>
        items.push({
          key: `sample-${s.url}`,
          title: `${t('itemOpen')}  ${s.label}`,
          hint: t('sample'),
          run: () => onOpenUrl(s.url),
        }),
      )
    }
  }

  const safeIndex = Math.min(index, Math.max(0, items.length - 1))

  return (
    <div className="palette-overlay" onMouseDown={onClose}>
      <div
        className="palette"
        dir={isRtl ? 'rtl' : undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="palette-input">
          <Search size={15} aria-hidden="true" />
          <input
            autoFocus
            value={query}
            spellCheck={false}
            placeholder={t('palettePlaceholder')}
            onChange={(event) => {
              setQuery(event.target.value)
              setIndex(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setIndex((value) => Math.min(value + 1, items.length - 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setIndex((value) => Math.max(value - 1, 0))
              } else if (event.key === 'Enter') {
                event.preventDefault()
                const item = items[safeIndex]
                if (item) {
                  item.run()
                  onClose()
                }
              } else if (event.key === 'Escape') {
                // Consume the key here: if it bubbles to the window handler the
                // palette-close re-renders first and the stale-free handler then
                // reads paletteOpen=false — and fires the boss key by mistake.
                event.stopPropagation()
                onClose()
              }
            }}
          />
        </div>
        <div className="palette-list">
          {items.length === 0 && <div className="palette-empty">{t('paletteEmpty')}</div>}
          {items.map((item, itemIndex) => (
            <button
              key={item.key}
              type="button"
              className={itemIndex === safeIndex ? 'palette-row is-active' : 'palette-row'}
              onMouseEnter={() => setIndex(itemIndex)}
              onClick={() => {
                item.run()
                onClose()
              }}
            >
              <span>{item.title}</span>
              {item.hint && <small>{item.hint}</small>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// An in-character loading screen: instead of a dark modal (the loudest possible
// break of the disguise), show the target app "opening a document" — a paper /
// panel skeleton with shimmering text bars and a quiet status strip. The source
// URL never appears full-size; only the hostname, small, in the status strip.
function LoadingOverlay({
  url,
  skin,
  onCancel,
}: {
  url: string
  skin: SkinId
  onCancel: () => void
}) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setSecs((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const meta = skinById(skin)
  const dark = skin === 'vscode' || skin === 'claude-code'
  // Office-family apps have a brand-colored title bar; everything else is light.
  const chromeColor = dark
    ? '#323233'
    : ['word', 'excel', 'outlook'].includes(skin)
      ? meta.accent
      : '#ffffff'
  const bars = [55, 92, 84, 68, 0, 88, 76, 92, 60, 0, 90, 82, 71]
  return (
    <div
      className={dark ? 'load-overlay is-dark' : 'load-overlay'}
      role="status"
      dir={isRtl ? 'rtl' : undefined}
    >
      <div className="load-chrome" style={{ background: chromeColor }} />
      {/* An indeterminate sweep right under the chrome: the one motion cue the
          eye catches instantly, and still in character (real Office/Docs show
          exactly this while opening a document). */}
      <div className="load-progress" aria-hidden="true">
        <span style={{ background: meta.accent }} />
      </div>
      <div className="load-canvas">
        <div className="load-doc">
          <span className="load-bar load-bar-title" aria-hidden="true" />
          {bars.slice(1).map((width, index) =>
            width === 0 ? (
              <span key={index} className="load-gap" aria-hidden="true" />
            ) : (
              <span
                key={index}
                className="load-bar"
                style={{ width: `${width}%` }}
                aria-hidden="true"
              />
            ),
          )}
        </div>
      </div>
      <div className="load-statusbar">
        <span className="load-spinner" aria-hidden="true" />
        <span className="load-status-text">
          {t('loadTitle')} {getSiteLabel(url)}
          {secs > 3 ? ` · ${secs}s` : ''}
        </span>
        <button type="button" className="load-cancel" onClick={onCancel}>
          {t('loadCancel')}
        </button>
      </div>
    </div>
  )
}

function Onboarding({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const isMac = navigator.platform.toLowerCase().includes('mac')
  const mod = isMac ? '⌘' : 'Ctrl'
  return (
    <div className="onboard-overlay" dir={isRtl ? 'rtl' : undefined}>
      <div className="onboard-card">
        <button type="button" className="onboard-close" aria-label="Close" onClick={onSkip}>
          ×
        </button>
        <div className="onboard-brand">{t('brand')}</div>
        <h1>{t('onboardTitle')}</h1>
        <p>{t('onboardBody')}</p>
        <ul className="onboard-list">
          <li>
            <span className="obk">
              <kbd>{mod}</kbd>
              <kbd>K</kbd>
            </span>
            <span>{t('onboardK')}</span>
          </li>
          <li>
            <span className="obk">
              <kbd>Esc</kbd>
            </span>
            <span>{t('onboardEsc')}</span>
          </li>
          <li>
            <span className="obk">↗</span>
            <span>{t('onboardFull')}</span>
          </li>
        </ul>
        <button type="button" className="onboard-start" onClick={onStart}>
          {t('onboardStart')} →
        </button>
        <small>{t('onboardOnce')}</small>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Shared rendering
 * ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ *
 * Skin dispatch
 * ------------------------------------------------------------------ */

export function SkinSurface({ doc, skin }: { doc: DocumentRecord; skin: SkinId }) {
  // The boss-key budget is a special Excel variant, dispatched here so the
  // registry Surface stays a plain component (no conditional Hooks).
  if (skin === 'excel' && doc.id === panicDocumentId) return <ExcelBudgetSkin doc={doc} />
  const def = getSkin(skin)
  if (!def) return null
  const Surface = def.Surface
  return <Surface doc={doc} />
}

/* ------------------------------------------------------------------ *
 * VS Code
 * ------------------------------------------------------------------ */

type HomeProps = {
  lang: Lang
  onOpen: (url: string) => void
  records?: DocumentRecord[]
  onOpenRecord?: (record: DocumentRecord) => void
  status?: LoadState
  error?: string
  showLangs?: boolean
  inApp?: boolean
  /** Pick a disguise from the home gallery (also sets the default for opening). */
  onPickSkin?: (id: SkinId) => void
  /** The skin the home is currently previewing/defaulting to (marks the gallery). */
  homeSkin?: SkinId
}

// The welcome content shared by every home skin. SSR-safe: the only interactive
// state is the URL input; sample links are real same-page hash anchors on the
// static landing so a first click works before hydration.
function HomeContent({
  lang,
  onOpen,
  records = [],
  onOpenRecord,
  status = 'idle',
  error = '',
  showLangs = false,
  inApp = false,
  onPickSkin,
  homeSkin,
}: HomeProps) {
  const [urlInput, setUrlInput] = useState('')
  const c = landingContent(lang)
  const brand = tr(lang, 'brand')
  const tagline = tr(lang, 'tagline')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = urlInput.trim()
    if (!value) return
    track('url_submit', { surface: 'home' })
    onOpen(value)
  }
  return (
    <div className="welcome">
      <div className="welcome-hero">
        {/* Same h1 text for SEO; visually the brand is an eyebrow and the
            tagline is the headline (no more brand-tagline shouting match). */}
        <h1>
          <span className="welcome-brand">{brand}</span>
          <span className="welcome-dot">·</span>
          <span className="welcome-tagline">{tagline}</span>
        </h1>
        <p className="welcome-sub">{c.heroSub}</p>
        <a
          className="welcome-proof"
          href="https://github.com/SneakRead/sneakread"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('outbound_cta', { target: 'github-hero' })}
        >
          ★ {tr(lang, 'openSource')} · GitHub
        </a>
        <form className="welcome-open" onSubmit={submit}>
          <input
            aria-label={c.cta}
            value={urlInput}
            spellCheck={false}
            placeholder="https://…"
            onChange={(event) => setUrlInput(event.target.value)}
          />
          <button type="submit">{tr(lang, 'itemOpen')}</button>
        </form>
        <div className="welcome-samples">
          {samplesFor(lang).map((s) =>
            inApp ? (
              <button
                key={s.url}
                type="button"
                onClick={() => {
                  track('sample_open', { source_domain: getSiteLabel(s.url) })
                  onOpen(s.url)
                }}
              >
                {s.label}
              </button>
            ) : (
              // Same-page hash anchor: works on the very first click (before
              // hydration). Uses the reversible #/<id> form (no visible http).
              <a key={s.url} href={`#/${createId(s.url)}`}>
                {s.label}
              </a>
            ),
          )}
        </div>
        <div className="welcome-tip">
          <kbd>⌘</kbd>
          <kbd>K</kbd> — {tr(lang, 'wTip')}
        </div>
        {status === 'error' && <p className="welcome-error">{error}</p>}
        {onPickSkin && (
          <div className="welcome-apps">
            <h2 className="welcome-apps-title">{tr(lang, 'homeOpenAs')}</h2>
            <div className="welcome-apps-grid">
              {skins.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`welcome-app${s.id === homeSkin ? ' is-active' : ''}`}
                  onClick={() => onPickSkin(s.id)}
                >
                  <SkinBrandLogo id={s.id} size={32} />
                  <span className="welcome-app-name">{skinLabel(s, lang)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {records.length > 0 && (
        <div className="welcome-section">
          <h2>{tr(lang, 'wRecent')}</h2>
          <div className="welcome-recents">
            {records.slice(0, 8).map((record) => (
              <button
                key={record.id}
                type="button"
                className="welcome-recent"
                onClick={() => onOpenRecord?.(record)}
              >
                <span>{record.fileName}</span>
                <small>{getSiteLabel(record.sourceUrl)}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="welcome-section">
        <h2>{c.featuresTitle}</h2>
        <ul className="welcome-features">
          {c.features.map((f) => (
            <li key={f.t}>
              <strong>{f.t}</strong>
              <span>{f.d}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="welcome-section">
        <h2>{c.faqTitle}</h2>
        <div className="welcome-faq">
          {c.faqs.map((q) => (
            <div key={q.q}>
              {/* Real h3s: crawlable structure for featured snippets / AI answers. */}
              <h3>{q.q}</h3>
              <p>{q.a}</p>
            </div>
          ))}
        </div>
      </div>

      {showLangs && (
        <nav className="welcome-langs" aria-label="Languages">
          {ALL_LANGS.map((l) => (
            <a key={l} href={l === 'en' ? '/' : `/${l}`}>
              {LANG_NAMES[l]}
            </a>
          ))}
        </nav>
      )}

      <footer className="welcome-footer">
        <a
          href="https://github.com/SneakRead/sneakread"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('outbound_cta', { target: 'github' })}
        >
          ★ {tr(lang, 'openSource')}
        </a>
        <span aria-hidden="true">·</span>
        <span>
          {tr(lang, 'builtBy')} 刘小排 (Liu Xiaopai)
        </span>
        <span aria-hidden="true">·</span>
        <a
          href="https://raphael.app"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('outbound_cta', { target: 'raphael' })}
        >
          Raphael AI
        </a>
      </footer>
    </div>
  )
}

// Default home: the welcome content inside a real Word document. The status
// bar reports a believable word count — "0 words" on a 4-page doc is a tell.
function approxWelcomeWords(pageLang: Lang) {
  const c = landingContent(pageLang)
  const text = [
    c.heroSub,
    ...c.features.map((f) => `${f.t} ${f.d}`),
    ...c.faqs.map((q) => `${q.q} ${q.a}`),
  ].join(' ')
  return /[一-鿿]/.test(text)
    ? text.replace(/\s/g, '').length
    : text.split(/\s+/).length
}

function WordWelcome(props: HomeProps) {
  return (
    <WordFrame
      fileName={`${tr(props.lang, 'brand')} — Getting Started.docx`}
      statusWords={approxWelcomeWords(props.lang)}
    >
      <article className="paper welcome-paper markdown-body">
        <HomeContent {...props} />
      </article>
    </WordFrame>
  )
}

// The home renders in the chosen skin (Word by default); the CTA swaps to the
// VS Code disguise. Owns its own skin so it works on the static landing too.
export function AppHome({
  homeSkin: initialSkin = DEFAULT_SKIN_ID,
  ...rest
}: HomeProps & { homeSkin?: SkinId }) {
  const [homeSkin, setHomeSkin] = useState<SkinId>(initialSkin)
  // Pre-boot / static landing: only Word & VS Code have welcome shells, so the
  // gallery only switches the shell for those; opening happens after boot.
  const pick = (id: SkinId) => {
    if (id === 'word' || id === 'vscode') setHomeSkin(id)
  }
  return (
    <div className={`stage skin-${homeSkin} home-stage`}>
      {homeSkin === 'vscode' ? (
        <VscodeWelcome {...rest} onPickSkin={pick} homeSkin={homeSkin} />
      ) : (
        <WordWelcome {...rest} onPickSkin={pick} homeSkin={homeSkin} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Launcher — VS Code welcome tab
 * ------------------------------------------------------------------ */

export function VscodeWelcome({
  lang: pageLang,
  onOpen,
  records = [],
  onOpenRecord,
  status = 'idle',
  error = '',
  showLangs = false,
  inApp = false,
  onPickSkin,
  homeSkin,
}: HomeProps) {
  return (
    <div className="vsc">
      <VscMenuBar />
      <div className="vsc-body">
        <ActivityBar />
        <aside className="vsc-side">
          <div className="vsc-side-title">
            EXPLORER
            <span>⋯</span>
          </div>
          <div className="vsc-tree-group">
            <div className="vsc-tree-head">
              <ChevronDown size={13} aria-hidden="true" /> OPEN EDITORS
            </div>
            <button type="button" className="vsc-file is-active" style={{ paddingLeft: 24 }}>
              <FileText size={14} aria-hidden="true" />
              <span>Welcome</span>
            </button>
          </div>
          <div className="vsc-tree-group">
            <div className="vsc-tree-head">
              <ChevronDown size={13} aria-hidden="true" /> RECENT
            </div>
            {records.length === 0 && <div className="vsc-empty-note">{tr(pageLang, 'wNoFiles')}</div>}
            {records.slice(0, 10).map((record) => (
              <button
                key={record.id}
                type="button"
                className="vsc-file"
                style={{ paddingLeft: 24 }}
                onClick={() => onOpenRecord?.(record)}
              >
                <FileText size={14} aria-hidden="true" />
                <span>{record.fileName}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="vsc-editor vsc-editor-welcome">
          <div className="vsc-tabs">
            <span className="vsc-tab is-active">
              <FileText size={13} aria-hidden="true" />
              Welcome
            </span>
          </div>
          <div className="vsc-editor-scroll">
            <HomeContent
              lang={pageLang}
              onOpen={onOpen}
              records={records}
              onOpenRecord={onOpenRecord}
              status={status}
              error={error}
              showLangs={showLangs}
              inApp={inApp}
              onPickSkin={onPickSkin}
              homeSkin={homeSkin}
            />
          </div>
        </section>
      </div>
      <div className="vsc-status">
        <span className="vsc-status-accent">
          <GitBranch size={12} aria-hidden="true" /> main
        </span>
        <span className="vsc-status-right">Ln 1, Col 1</span>
        <span>UTF-8</span>
        <span>Welcome</span>
      </div>
    </div>
  )
}

// Two-pass boot: the first client render byte-matches the prerendered SSR home
// (Word, path language, static anchors) so hydration is clean; the full stateful
// app boots on the next tick and takes over (reads localStorage, parses #u=, …).
function App() {
  const [booted, setBooted] = useState(false)
  useEffect(() => {
    setBooted(true)
    // Analytics stub is a no-op array push; the real tag loads at browser idle.
    initAnalytics()
  }, [])
  if (!booted) {
    const pathLang = langFromPath(
      typeof window === 'undefined' ? '/' : window.location.pathname,
    )
    return <AppHome lang={pathLang} showLangs onOpen={() => {}} />
  }
  return <AppShell />
}

export default App
