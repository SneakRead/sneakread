#!/usr/bin/env node
/**
 * verify-samples.mjs — acceptance test for SneakRead sample (recommended) URLs.
 *
 * Every sample URL must open through the product's reader pipeline (Jina Reader)
 * and return content that is actually worth reading. This script measures, for
 * each URL: fetch time, word count (markdown stripped), link count, image count,
 * QR-code / app-download-promo markers, and the page title.
 *
 * Verdict rules:
 *   PASS = a provider answered within TIMEOUT_MS AND (words >= 200 OR links >= 30)
 *          AND no QR / app-promo markers.
 *   WARN = a provider answered, but content is thin or QR/app-promo markers found.
 *   FAIL = all providers timed out / errored, or content is nearly empty
 *          (words < 60 AND links < 10).
 *
 * Providers (tried in order; timeouts mirror the product pipeline in App.tsx —
 * the timeout covers the full download, headers AND body):
 *   1. https://r.jinaai.cn/<url>   (China-mainland-friendly mirror, 8 s)
 *   2. https://r.jina.ai/<url>     (international, 8 s)
 *   3. Firecrawl keyless POST https://api.firecrawl.dev/v2/scrape (18 s)
 *
 * Keyless Jina/Firecrawl are rate-limited (~20 RPM). A burst of "all providers
 * timed out / 429" rows usually means throttling, not dead sites — so after the
 * main pool every FAIL is automatically re-tested serially (spaced out, after a
 * cooldown), and only URLs that still fail are reported as FAIL.
 *
 * Usage:
 *   node scripts/verify-samples.mjs --current          # test all URLs in src/samples.ts
 *   node scripts/verify-samples.mjs <url> [<url> ...]  # test candidate URLs
 * Options:
 *   --json         emit machine-readable JSON instead of the table
 *   --concurrency  worker count (default 3)
 *   --retries      serial retry passes over FAILed URLs (default 1; 0 disables)
 *
 * Exit code: 0 if no FAIL, 1 if any FAIL, 2 on usage/internal error.
 * No dependencies; requires Node 18+ (global fetch / AbortController).
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const TIMEOUT_MS = 8000 // per Jina provider, matches the product's 8 s budget
const FIRECRAWL_TIMEOUT_MS = 18000 // matches the product's Firecrawl budget
const PASS_WORDS = 200
const PASS_LINKS = 30
const THIN_WORDS = 60 // below this AND below THIN_LINKS => FAIL (nearly empty)
const THIN_LINKS = 10
const QR_PROMO_RE = /qrcode|二维码|扫码|扫描下载|download.*app/i
const STAGGER_MS = 1000 // gentle stagger between task starts to avoid rate limits

const JINA_HEADERS = {
  'X-Respond-With': 'markdown+frontmatter',
  'X-Retain-Images': 'all',
  'X-Retain-Links': 'all',
  'X-Timeout': '20',
  ...(process.env.JINA_API_KEY ? { Authorization: `Bearer ${process.env.JINA_API_KEY}` } : {}),
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

// Fetch and fully download the body within `timeoutMs` (the abort covers the
// body read too — a fast header + slow body must not sneak past the budget).
async function fetchTextWithTimeout(input, init, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(input, { ...init, signal: controller.signal, redirect: 'follow' })
    if (res.status === 429) throw new Error('rate limited (429)')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

async function viaJina(base, url) {
  const text = await fetchTextWithTimeout(`${base}/${url}`, { headers: JINA_HEADERS }, TIMEOUT_MS)
  if (!text || text.length < 40) throw new Error('empty response')
  return text
}

async function viaFirecrawl(url) {
  const text = await fetchTextWithTimeout(
    'https://api.firecrawl.dev/v2/scrape',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
    },
    FIRECRAWL_TIMEOUT_MS,
  )
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('bad JSON response')
  }
  const md = json?.data?.markdown
  if (!json?.success || !md || md.length < 40) throw new Error('empty response')
  const title = json?.data?.metadata?.title
  return title ? `---\ntitle: ${title}\n---\n${md}` : md
}

const PROVIDERS = [
  { name: 'jina-cn', run: (url) => viaJina('https://r.jinaai.cn', url) },
  { name: 'jina', run: (url) => viaJina('https://r.jina.ai', url) },
  { name: 'firecrawl', run: (url) => viaFirecrawl(url) },
]

// ---------------------------------------------------------------------------
// Content analysis
// ---------------------------------------------------------------------------

function splitFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { front: '', body: md }
  return { front: m[1], body: md.slice(m[0].length) }
}

function extractTitle(front, body) {
  const fm = front.match(/^title:\s*(["']?)(.*?)\1\s*$/m)
  if (fm?.[2]) return fm[2]
  const jina = body.match(/^Title:\s*(.+)$/m)
  if (jina?.[1]) return jina[1].trim()
  const h1 = body.match(/^#\s+(.+)$/m)
  if (h1?.[1]) return h1[1].trim()
  return ''
}

function stripMarkdown(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/!\[[^\]]*\]\([^()]*(?:\([^()]*\)[^()]*)*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^()]*(?:\([^()]*\)[^()]*)*\)/g, ' $1 ') // links -> text
    .replace(/https?:\/\/\S+/g, ' ') // bare URLs
    .replace(/[#>*_`~|=-]{1,}/g, ' ') // md decoration
}

// Word count that treats each CJK character as one word (Chinese/Japanese are
// not whitespace-delimited) and counts alphabetic/Arabic/Devanagari/Cyrillic
// runs as one word each.
function countWords(text) {
  const cjk = text.match(/[぀-ヿ㐀-䶿一-鿿豈-﫿ｦ-ﾟ]/gu) || []
  const words = text.match(/[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Greek}\p{Script=Hebrew}\p{Script=Hangul}\p{Script=Thai}0-9]+/gu) || []
  return cjk.length + words.length
}

function analyze(markdown) {
  const { front, body } = splitFrontmatter(markdown)
  const images = (body.match(/!\[[^\]]*\]\(/g) || []).length
  const links = (body.match(/(^|[^!])\[[^\]]*\]\(/g) || []).length
  const qrMatch = body.match(QR_PROMO_RE)
  return {
    title: extractTitle(front, body),
    words: countWords(stripMarkdown(body)),
    links,
    images,
    qr: Boolean(qrMatch),
    qrSnippet: qrMatch ? qrMatch[0].slice(0, 60).replace(/\s+/g, ' ') : '',
  }
}

function verdict(r) {
  if (!r.ok) return { status: 'FAIL', reason: r.error || 'all providers failed' }
  if (r.words < THIN_WORDS && r.links < THIN_LINKS)
    return { status: 'FAIL', reason: `nearly empty (${r.words} words, ${r.links} links)` }
  const rich = r.words >= PASS_WORDS || r.links >= PASS_LINKS
  if (rich && !r.qr) return { status: 'PASS', reason: '' }
  const reasons = []
  if (!rich) reasons.push(`thin (${r.words} words, ${r.links} links)`)
  if (r.qr) reasons.push(`qr/app promo: "${r.qrSnippet}"`)
  return { status: 'WARN', reason: reasons.join('; ') }
}

// ---------------------------------------------------------------------------
// Per-URL check with provider fallback
// ---------------------------------------------------------------------------

async function checkUrl(url) {
  const attempts = []
  for (const provider of PROVIDERS) {
    const t0 = Date.now()
    try {
      const markdown = await provider.run(url)
      const ms = Date.now() - t0
      const metrics = analyze(markdown)
      return { url, ok: true, provider: provider.name, ms, ...metrics, attempts }
    } catch (err) {
      const ms = Date.now() - t0
      const msg = err?.name === 'AbortError' ? 'timeout' : (err?.message || String(err))
      attempts.push(`${provider.name}: ${msg} (${ms}ms)`)
    }
  }
  return {
    url, ok: false, provider: '-', ms: 0, title: '', words: 0, links: 0,
    images: 0, qr: false, qrSnippet: '', error: attempts.join(' | '), attempts,
  }
}

// ---------------------------------------------------------------------------
// samples.ts parsing (--current)
// ---------------------------------------------------------------------------

function loadCurrentSamples() {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const file = path.resolve(here, '../src/samples.ts')
  const src = readFileSync(file, 'utf8')
  const out = []
  let lang = '?'
  for (const line of src.split('\n')) {
    const langMatch = line.match(/^\s{2}(\w+):\s*\[/)
    if (langMatch) lang = langMatch[1]
    const entry = line.match(/url:\s*'([^']+)'\s*,\s*label:\s*'([^']*)'/)
    if (entry) out.push({ lang, url: entry[1], label: entry[2] })
  }
  if (out.length === 0) throw new Error(`no sample URLs found in ${file}`)
  return out
}

// ---------------------------------------------------------------------------
// Runner (small worker pool)
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length)
  let next = 0
  let done = 0
  async function lane() {
    while (true) {
      const i = next++
      if (i >= items.length) return
      if (i >= concurrency) await sleep(STAGGER_MS)
      results[i] = await worker(items[i], i)
      done += 1
      // Live per-URL progress on stderr (stdout stays clean for --json).
      const r = results[i]
      const status = r ? verdict(r).status : 'FAIL'
      process.stderr.write(
        `[${String(done).padStart(3)}/${items.length}] ${status.padEnd(4)}  ${r?.ms ?? 0}ms  ${typeof items[i] === 'string' ? items[i] : items[i]?.url ?? ''}\n`,
      )
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, lane))
  return results
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function pad(s, n) {
  s = String(s)
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

function printTable(rows) {
  console.log('')
  console.log(
    pad('STATUS', 7) + pad('LANG', 6) + pad('MS', 7) + pad('WORDS', 7) +
    pad('LINKS', 7) + pad('IMGS', 6) + pad('QR', 4) + pad('VIA', 11) + 'URL',
  )
  console.log('-'.repeat(110))
  for (const r of rows) {
    console.log(
      pad(r.status, 7) + pad(r.lang ?? '-', 6) + pad(r.ok ? r.ms : '-', 7) +
      pad(r.ok ? r.words : '-', 7) + pad(r.ok ? r.links : '-', 7) +
      pad(r.ok ? r.images : '-', 6) + pad(r.qr ? 'Y' : '', 4) +
      pad(r.provider, 11) + r.url,
    )
    if (r.title) console.log(' '.repeat(7) + `title: ${r.title.slice(0, 90)}`)
    if (r.reason) console.log(' '.repeat(7) + `note:  ${r.reason}`)
    if (!r.ok && r.attempts?.length) console.log(' '.repeat(7) + `tried: ${r.attempts.join(' | ')}`)
  }
  const counts = rows.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {})
  console.log('-'.repeat(110))
  console.log(`total ${rows.length}  PASS ${counts.PASS || 0}  WARN ${counts.WARN || 0}  FAIL ${counts.FAIL || 0}`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const RETRY_COOLDOWN_MS = 20000 // let keyless rate-limit windows reset
const RETRY_SPACING_MS = 3000 // serial spacing between retried URLs

async function main() {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const numOpt = (name, dflt) => {
    const i = args.indexOf(name)
    if (i < 0) return dflt
    const value = Number(args[i + 1])
    // NaN survives `??` (it's not nullish) — validate explicitly.
    if (!Number.isFinite(value)) {
      console.error(`Invalid value for ${name}: ${args[i + 1]} (using ${dflt})`)
      return dflt
    }
    return Math.max(0, value)
  }
  const concurrency = Math.max(1, numOpt('--concurrency', 3))
  const retries = numOpt('--retries', 1)
  // Hard wall-clock budget (minutes) so CI never hangs on a dead network.
  const budgetMin = Math.max(1, numOpt('--budget-min', 12))
  const killer = setTimeout(() => {
    console.error(`\nAborted: exceeded the ${budgetMin}-minute total budget (--budget-min).`)
    process.exit(2)
  }, budgetMin * 60_000)
  killer.unref?.()
  const optValueIdxs = new Set(
    ['--concurrency', '--retries', '--budget-min'].map((n) => args.indexOf(n) + 1).filter((i) => i > 0),
  )
  const rest = args.filter((a, i) => !a.startsWith('--') && !optValueIdxs.has(i))

  let items
  if (args.includes('--current')) {
    items = loadCurrentSamples()
  } else if (rest.length > 0) {
    items = rest.map((url) => ({ lang: '-', url, label: '' }))
  } else {
    console.error('usage: node scripts/verify-samples.mjs --current | <url...> [--json] [--concurrency N] [--retries N]')
    process.exit(2)
  }

  const rows = await runPool(items, async (item) => {
    const r = await checkUrl(item.url)
    const v = verdict(r)
    return { ...item, ...r, ...v }
  }, concurrency)

  // Serial retry passes for FAILs: distinguishes throttling from dead sites.
  for (let pass = 1; pass <= retries; pass++) {
    const failIdxs = rows.flatMap((r, i) => (r.status === 'FAIL' ? [i] : []))
    if (failIdxs.length === 0) break
    console.error(`retry pass ${pass}: re-testing ${failIdxs.length} FAILed URL(s) serially after ${RETRY_COOLDOWN_MS / 1000}s cooldown...`)
    await sleep(RETRY_COOLDOWN_MS)
    for (const i of failIdxs) {
      const r = await checkUrl(rows[i].url)
      const v = verdict(r)
      rows[i] = { ...rows[i], ...r, ...v, retriedPass: pass }
      await sleep(RETRY_SPACING_MS)
    }
  }

  if (json) {
    console.log(JSON.stringify(rows, null, 2))
  } else {
    printTable(rows)
  }
  process.exit(rows.some((r) => r.status === 'FAIL') ? 1 : 0)
}

main().catch((err) => {
  console.error('fatal:', err)
  process.exit(2)
})
