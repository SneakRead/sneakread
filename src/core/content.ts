// Pure content transforms shared by the app core and every skin: reader
// markdown → article body / email body, link/heading/image extraction, and
// small label helpers. No React, no app state.
import type { DocumentRecord } from './types'

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

export function extractHeadings(markdown: string) {
  const headings = Array.from(markdown.matchAll(/^#{1,4}\s+(.+)$/gm)).map((match) =>
    match[1].replace(/\s+#+$/, '').trim(),
  )
  return headings.length ? headings : ['Overview', 'Details', 'Links']
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

export function inferProjectName(url: string) {
  const site = getSiteLabel(url)
  const root = site.split('.').slice(-2, -1)[0] || site
  return `${root.charAt(0).toUpperCase()}${root.slice(1)}`
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
