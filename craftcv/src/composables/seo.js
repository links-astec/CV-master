// Page title, description and canonical URL for search engines and link previews.
// index.html carries the homepage values (and the structured data); this keeps them right
// as the single-page app changes route. Each page exists in English (/path) and French
// (/path?lang=fr); hreflang links tell search engines about both.
import { lang } from '../i18n/index.js'

export const SITE = 'https://www.cvmaster.live'

const PAGES = {
  en: {
    '/':          { title: 'CVMaster — Free AI CV Builder: ATS-Friendly CVs Tailored to Any Job',
                    description: 'Build a professional CV in minutes, free. Tailor it to any job offer with AI, check your ATS match score and download a one-page PDF. 50 templates, English and French.' },
    '/templates': { title: '50 Free CV Templates — ATS-Friendly & Creative | CVMaster',
                    description: 'Choose from 50 CV templates in 12 colours: plain ATS-friendly layouts for online applications and creative designs for print. Switch any time, free.' },
    '/privacy':   { title: 'Privacy Policy — CVMaster', description: 'How CVMaster handles your data, payments, refunds and complaints — in plain language.' },
    '/terms':     { title: 'Terms of Service — CVMaster', description: 'How CVMaster handles your data, payments, refunds and complaints — in plain language.' },
    '/editor':    { title: 'Editor — CVMaster' },
    '/settings':  { title: 'Settings — CVMaster' },
  },
  fr: {
    '/':          { title: 'CVMaster — Créateur de CV gratuit avec IA : un CV compatible ATS adapté à chaque offre',
                    description: 'Créez un CV professionnel en quelques minutes, gratuitement. Adaptez-le à chaque offre d’emploi avec l’IA, vérifiez votre score ATS et téléchargez un PDF d’une page. 50 modèles, en français et en anglais.' },
    '/templates': { title: '50 modèles de CV gratuits — compatibles ATS et créatifs | CVMaster',
                    description: 'Choisissez parmi 50 modèles de CV en 12 couleurs : des mises en page sobres compatibles ATS pour les candidatures en ligne et des designs créatifs pour l’impression. Changez quand vous voulez, gratuitement.' },
    '/privacy':   { title: 'Politique de confidentialité — CVMaster', description: 'Comment CVMaster traite vos données, les paiements, les remboursements et les réclamations — en termes simples.' },
    '/terms':     { title: 'Conditions d’utilisation — CVMaster', description: 'Comment CVMaster traite vos données, les paiements, les remboursements et les réclamations — en termes simples.' },
    '/editor':    { title: 'Éditeur — CVMaster' },
    '/settings':  { title: 'Paramètres — CVMaster' },
  },
}
const NOINDEX = new Set(['/editor', '/settings'])

function page(path) {
  const l = lang.value === 'fr' ? 'fr' : 'en'
  const p = PAGES[l][path] || PAGES.en[path] || { title: 'CVMaster' }
  return { ...p, path, noindex: NOINDEX.has(path) }
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
  meta('property', 'og:locale', lang.value === 'fr' ? 'fr_FR' : 'en_GB')
  meta('property', 'og:locale:alternate', lang.value === 'fr' ? 'en_GB' : 'fr_FR')
  if (path) {
    const en = SITE + path, fr = SITE + path + '?lang=fr'
    const url = lang.value === 'fr' ? fr : en
    link('canonical', url)
    meta('property', 'og:url', url)
    if (!noindex) { link('alternate', en, 'en'); link('alternate', fr, 'fr'); link('alternate', en, 'x-default') }
  }
}

// The Privacy & Terms page is one route with two tabs
export function seoForRoute(route) {
  if (route.path === '/legal') return page(route.query.tab === 'terms' ? '/terms' : '/privacy')
  return page(route.path)
}
