// Page title, description and canonical URL for search engines and link previews.
// index.html carries the homepage values (and the structured data); this keeps them right
// as the single-page app changes route. Each page exists in every interface language
// (/path in English, /path?lang=xx otherwise); hreflang links tell search engines about all of them.
// Titles and descriptions are translated through the i18n dictionaries like everything else.
import { lang, t, LANGS } from '../i18n/index.js'

export const SITE = 'https://www.cvmaster.live'

const PAGES = {
  '/':          { title: 'CVMaster | Free AI CV Builder: ATS-Friendly CVs Tailored to Any Job',
                  description: 'Free AI CV builder and CV maker: build a professional CV in minutes, tailor it to any job offer, check your ATS score and download a one-page PDF. 50 CV templates.' },
  '/templates': { title: '50 Free CV Templates. ATS-Friendly & Creative | CVMaster',
                  description: 'Choose from 50 CV templates in 12 colours: plain ATS-friendly layouts for online applications and creative designs for print. Switch any time, free.' },
  '/privacy':   { title: 'Privacy Policy | CVMaster', description: 'How CVMaster handles your data, payments, refunds and complaints, in plain language.' },
  '/terms':     { title: 'Terms of Service | CVMaster', description: 'How CVMaster handles your data, payments, refunds and complaints, in plain language.' },
  '/editor':    { title: 'Editor | CVMaster' },
  '/settings':  { title: 'Settings | CVMaster' },
}
const NOINDEX = new Set(['/editor', '/settings'])

function page(path) {
  const p = PAGES[path] || { title: 'CVMaster' }
  return { title: t(p.title), description: p.description && t(p.description), path, noindex: NOINDEX.has(path) }
}
// The homepage (shown by App while the landing page is up)
export const homeSeo = () => page('/')

function meta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
function link(rel, href, hreflang) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector(sel)
  if (!el) { el = document.createElement('link'); el.rel = rel; if (hreflang) el.hreflang = hreflang; document.head.appendChild(el) }
  el.href = href
}

export function setSeo({ title, description, path, noindex } = {}) {
  if (title) { document.title = title; meta('property', 'og:title', title); meta('name', 'twitter:title', title) }
  if (description) { meta('name', 'description', description); meta('property', 'og:description', description); meta('name', 'twitter:description', description) }
  meta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  meta('property', 'og:locale', (LANGS.find(l => l.code === lang.value) || LANGS[0]).locale.replace('-', '_'))
  if (path) {
    const urlFor = (code) => SITE + path + (code === 'en' ? '' : `?lang=${code}`)
    const url = urlFor(lang.value)
    link('canonical', url)
    meta('property', 'og:url', url)
    if (!noindex) {
      for (const l of LANGS) link('alternate', urlFor(l.code), l.code === 'zh' ? 'zh-Hans' : l.code)
      link('alternate', urlFor('en'), 'x-default')
    }
  }
}

// The Privacy & Terms page is one route with two tabs
export function seoForRoute(route) {
  if (route.path === '/legal') return page(route.query.tab === 'terms' ? '/terms' : '/privacy')
  return page(route.path)
}
