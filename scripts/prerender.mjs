// Prerender each language landing page to static HTML for SEO, plus an /app
// shell (noindex), sitemap.xml and robots.txt. Runs after the client + ssr
// builds. No framework — plain string surgery on Vite's dist/index.html.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve('dist')
const ssr = await import(path.resolve('dist-ssr/entry-ssr.js'))
const { renderLanding, seoHead, ALL_LANGS, SITE } = ssr

const template = await readFile(path.join(dist, 'index.html'), 'utf8')

async function writePage(rel, html) {
  const full = path.join(dist, rel, 'index.html')
  await mkdir(path.dirname(full), { recursive: true })
  await writeFile(full, html)
}

for (const lang of ALL_LANGS) {
  const head = seoHead(lang)
  const body = renderLanding(lang)
  const html = template
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    // The base meta description spans multiple lines — match across them so the
    // per-language one from seoHead() isn't duplicated.
    .replace(/<meta\s+name="description"[\s\S]*?\/?>\s*/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  await writePage(lang === 'en' ? '.' : lang, html)
}

// The app itself: no landing content, not indexed (content is user-supplied).
const appHtml = template
  .replace(/<title>[\s\S]*?<\/title>/, '<title>SneakRead</title>')
  .replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>')
await writePage('app', appHtml)

const urls = ALL_LANGS.map(
  (l) => `  <url><loc>${SITE}${l === 'en' ? '/' : '/' + l}</loc></url>`,
).join('\n')
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
await writeFile(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /app\nSitemap: ${SITE}/sitemap.xml\n`,
)

// GitHub Pages serves 404.html for any unmatched path. Ship the bare client
// shell (empty #root) so React routes it — unknown paths render the landing,
// deep links like /app still hit their own prerendered index.html first.
await writeFile(path.join(dist, '404.html'), template)

console.log(`prerendered ${ALL_LANGS.length} languages + /app, sitemap.xml, robots.txt, 404.html`)
