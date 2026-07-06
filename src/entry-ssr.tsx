// Server entry for build-time prerendering of the per-language landing pages.
import { renderToString } from 'react-dom/server'
import { AppHome } from './App'
import { landingContent } from './landing-content'
import { tr, ALL_LANGS, type Lang } from './i18n'

export const SITE = 'https://sneakread.com'
export { ALL_LANGS }

const langPath = (l: Lang) => (l === 'en' ? '/' : `/${l}`)

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderLanding(lang: Lang): string {
  // The home IS the app (default Word chrome), prerendered for SEO and hydrated.
  return renderToString(<AppHome lang={lang} showLangs onOpen={() => {}} />)
}

export function seoHead(lang: Lang): string {
  const c = landingContent(lang)
  const url = SITE + langPath(lang)
  const alternates = [
    ...ALL_LANGS.map(
      (l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${langPath(l)}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`,
  ].join('\n    ')
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faqs.map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    })),
  }
  return [
    `<title>${esc(c.metaTitle)}</title>`,
    `<meta name="description" content="${esc(c.metaDesc)}" />`,
    `<link rel="canonical" href="${url}" />`,
    alternates,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(c.metaTitle)}" />`,
    `<meta property="og:description" content="${esc(c.metaDesc)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/og.png" />`,
    `<meta property="og:site_name" content="${esc(tr(lang, 'brand'))}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="robots" content="index,follow" />`,
    `<script type="application/ld+json">${JSON.stringify(faq)}</script>`,
  ].join('\n    ')
}
