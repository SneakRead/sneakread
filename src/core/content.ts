// Pure content transforms shared by the app core and every skin: reader
// markdown → article body / email body, link/heading/image extraction, and
// small label helpers. No React, no app state.
import type { DocumentRecord, Summary } from './types'

export function getSiteLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'source'
  }
}

export function safeHttpUrl(value: string | null | undefined, baseUrl?: string) {
  const raw = value?.trim()
  if (!raw) return null
  try {
    const url = baseUrl ? new URL(raw, baseUrl) : new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

// Strip fenced code blocks so `# comment` / `## Heading` lines inside code aren't
// harvested as real document headings.
function stripCodeFences(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '')
}

export function extractHeadings(markdown: string) {
  const headings = Array.from(stripCodeFences(markdown).matchAll(/^#{1,6}\s+(.+)$/gm)).map(
    (match) => match[1].replace(/\s+#+$/, '').trim(),
  )
  return headings.length ? headings : ['Overview', 'Details', 'Links']
}

// Headings with their level — for the Lark/Feishu doc outline rail (目录).
export function extractOutline(markdown: string) {
  return Array.from(stripCodeFences(markdown).matchAll(/^(#{1,6})\s+(.+)$/gm)).map((match) => ({
    level: match[1].length,
    text: match[2].replace(/\s+#+$/, '').trim(),
  }))
}

export function extractLinks(markdown: string, baseUrl?: string) {
  return Array.from(markdown.matchAll(/(?<!!)\[([^\]]+)]\(([^)]+)\)/g))
    .map((match) => {
      const href = safeHttpUrl(match[2].trim(), baseUrl)
      if (!href) return null
      return {
        text: match[1].replace(/\s+/g, ' ').trim(),
        href,
      }
    })
    .filter((link): link is { text: string; href: string } => Boolean(link))
    .filter((link) => !link.text.startsWith('!['))
}

export function extractImages(markdown: string, baseUrl?: string) {
  return Array.from(markdown.matchAll(/!\[([^\]]*)]\(([^)]+)\)/g))
    .map((match) => {
      const src = safeHttpUrl(match[2].trim(), baseUrl)
      if (!src) return null
      return {
        alt: match[1].replace(/\s+/g, ' ').trim(),
        src,
      }
    })
    .filter((image): image is { alt: string; src: string } => Boolean(image))
}

export function extractParagraphs(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith('#') && !part.startsWith('|'))
    .slice(0, 12)
}

export function normalizeTitleForCompare(value: string) {
  return value
    .replace(/\s+#+$/, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
}

export function removeDuplicateLeadingHeading(markdown: string, title: string) {
  const lines = markdown.split('\n')
  const documentTitle = normalizeTitleForCompare(title)
  if (!documentTitle) return markdown
  const nextLines = lines.filter((line) => {
    const match = line.match(/^#{1,2}\s+(.+)$/)
    return !match || normalizeTitleForCompare(match[1]) !== documentTitle
  })
  if (nextLines.length === lines.length) return markdown
  return nextLines.join('\n').replace(/^\n+/, '').trim()
}

export function articleBody(doc: DocumentRecord) {
  return removeDuplicateLeadingHeading(doc.markdown, doc.title)
}

export function emailBody(doc: DocumentRecord) {
  const paragraphs = extractParagraphs(doc.markdown)
  const links = extractLinks(doc.markdown, doc.sourceUrl)
  return [
    'Hi team,',
    '',
    'Sharing the latest readout below for review.',
    '',
    ...paragraphs.slice(0, 6),
    ...(links.length
      ? [
          '',
          'References:',
          ...links.slice(0, 8).map((link, i) => {
            const label =
              link.text.replace(/^[[\s]+|[\]\s]+$/g, '').trim() || getSiteLabel(link.href)
            return `${i + 1}. [${label}](${link.href})`
          }),
        ]
      : []),
    '',
    'Best,',
    'Research Ops',
  ].join('\n')
}

// Initialism domains that read wrong when title-cased ("Bbc" screams fake).
const ACRONYM_SITES = new Set([
  'bbc', 'cnn', 'espn', 'nba', 'nfl', 'mlb', 'nhl', 'ufc', 'wwe', 'ign',
  'gq', 'npr', 'wsj', 'nyt', 'abc', 'cbs', 'nbc', 'itv', 'rte', 'cnbc',
])

export function inferProjectName(url: string) {
  const site = getSiteLabel(url)
  const root = site.split('.').slice(-2, -1)[0] || site
  if (root.length <= 4 && (ACRONYM_SITES.has(root.toLowerCase()) || !/[aeiouy]/i.test(root))) {
    return root.toUpperCase()
  }
  return `${root.charAt(0).toUpperCase()}${root.slice(1)}`
}

/* ------------------------------------------------------------------ *
 * Believable "recent activity" clocks for disguise chrome. Derived from the
 * real current time so a skin never shows a timestamp in the future — the
 * loudest tell of a fake. Pure helpers; skins call them at render time.
 * ------------------------------------------------------------------ */

export function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000)
}

export function clockLabel(date: Date, opts?: { ampm?: boolean }) {
  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  if (!opts?.ampm) return `${String(h).padStart(2, '0')}:${m}`
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}:${m} ${suffix}`
}

// "Jul 3" / "7月3日" style short labels for sidebar lists, N days back.
export function daysAgoLabel(daysBack: number, zh: boolean) {
  const d = new Date(Date.now() - daysBack * 86_400_000)
  if (zh) return daysBack === 1 ? '昨天' : `${d.getMonth() + 1}月${d.getDate()}日`
  if (daysBack === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Parse a stored DocumentRecord timestamp ("07/07/2026, 10:14"); fall back to
// now rather than "Invalid Date" leaking into chrome.
export function parseTimestamp(value: string | undefined) {
  const d = value ? new Date(value) : new Date()
  return Number.isNaN(d.getTime()) ? new Date() : d
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/* ------------------------------------------------------------------ *
 * Reader-output cleaning pipeline. Everything below is a pure string
 * transform — shared by the app (App.tsx) and by scripts/verify-samples.mjs
 * conceptually (the script mirrors these rules). Order of operations lives
 * in cleanReaderMarkdown; helpers are private.
 * ------------------------------------------------------------------ */

export function cleanReaderMarkdown(markdown: string) {
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
  // "Prose" is measured on the VISIBLE text: a long linked headline
  // ("[Watch the final live…](url)") is real content, not navigation —
  // otherwise link-dense homepages have their first prose line down in the
  // footer and everything above it gets eaten.
  const proseLength = (raw: string) => {
    const t = raw.trim()
    if (/^([#>|]|[-*+]\s|!\[)/.test(t)) return 0
    const visible = t
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .trim()
    return visible.length
  }
  const firstProse = lines.findIndex((line) => proseLength(line) > 120)
  if (firstProse <= 0) return lines
  // Safety valve: a preamble is a header, not half the document. If the
  // heuristic wants to delete most of the page, it is wrong — keep everything.
  if (firstProse > lines.length * 0.5) return lines
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

export function summarizeMarkdown(markdown: string, baseUrl?: string): Summary {
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
