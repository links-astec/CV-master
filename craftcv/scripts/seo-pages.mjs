// After `vite build`: each public page gets its own HTML in every language (dist/_seo/<page>.<lang>.html),
// with its own title, description, canonical URL, hreflang links and <html lang>, plus a full sitemap.
// vercel.json serves them by path and ?lang=, so the first HTML a search engine reads is already right
// (before, every page was served with the homepage's canonical URL and was dropped as a duplicate).
// The app itself is the same on every page.
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..')
const DIST = path.join(ROOT, 'dist')
const SITE = 'https://www.cvmaster.live'
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href)
const { PAGES, PUBLIC_PATHS } = await imp('src/composables/seoPages.js')
const LANGS = [['en', 'en-GB'], ['fr', 'fr-FR'], ['es', 'es-ES'], ['de', 'de-DE'], ['it', 'it-IT'], ['pt', 'pt-PT'], ['zh', 'zh-CN']]
const DICT = { en: {} }
for (const [code] of LANGS.slice(1)) DICT[code] = (await imp(`src/i18n/${code}.js`)).default
const hreflang = (code) => (code === 'zh' ? 'zh-Hans' : code)
const urlFor = (p, code) => SITE + p + (code === 'en' ? '' : `?lang=${code}`)
const slug = (p) => (p === '/' ? 'home' : p.slice(1))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const base = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const set = (html, re, value, label) => { if (!re.test(html)) throw new Error('seo-pages: not found in index.html: ' + label); return html.replace(re, value) }
fs.mkdirSync(path.join(DIST, '_seo'), { recursive: true })
let n = 0
for (const p of PUBLIC_PATHS) {
  for (const [code, locale] of LANGS) {
    const tr = (k) => DICT[code][k] || k
    const title = esc(tr(PAGES[p].title)), desc = esc(tr(PAGES[p].description || PAGES['/'].description)), url = urlFor(p, code)
    let h = base
    h = set(h, /<html lang="[^"]*"/, `<html lang="${hreflang(code)}"`, 'html lang')
    h = set(h, /<title>[^<]*<\/title>/, `<title>${title}</title>`, 'title')
    h = set(h, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${desc}" />`, 'description')
    h = set(h, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`, 'og:title')
    h = set(h, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${desc}" />`, 'og:description')
    h = set(h, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`, 'og:url')
    h = set(h, /<meta property="og:locale" content="[^"]*"\s*\/?>/, `<meta property="og:locale" content="${locale.replace('-', '_')}" />`, 'og:locale')
    h = set(h, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`, 'twitter:title')
    h = set(h, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${desc}" />`, 'twitter:description')
    h = set(h, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`, 'canonical')
    const alts = LANGS.map(([c]) => `<link rel="alternate" hreflang="${hreflang(c)}" href="${urlFor(p, c)}" />`).join('\n    ') + `\n    <link rel="alternate" hreflang="x-default" href="${urlFor(p, 'en')}" />`
    h = h.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>/g, '')
    h = h.replace(`<link rel="canonical" href="${url}" />`, `<link rel="canonical" href="${url}" />\n    ${alts}`)
    fs.writeFileSync(path.join(DIST, '_seo', `${slug(p)}.${code}.html`), h)
    n++
  }
}
// The sitemap: every public page in every language, each listing its translations
const day = new Date().toISOString().slice(0, 10)
const urls = PUBLIC_PATHS.flatMap(p => LANGS.map(([code]) => `  <url>
    <loc>${urlFor(p, code)}</loc>
    <lastmod>${day}</lastmod>
    <changefreq>${p === '/' || p === '/templates' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${p === '/' ? (code === 'en' ? '1.0' : '0.9') : p === '/templates' ? '0.8' : p === '/pricing' ? '0.7' : '0.3'}</priority>
${LANGS.map(([c]) => `    <xhtml:link rel="alternate" hreflang="${hreflang(c)}" href="${urlFor(p, c)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(p, 'en')}"/>
  </url>`))
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`)
console.log(`seo-pages: ${n} pages, sitemap with ${urls.length} addresses`)
