// Page title, description and canonical URL for search engines and link previews.
// index.html carries the homepage values (and the structured data); this keeps them right
// as the single-page app changes route.
export const SITE = 'https://www.cvmaster.live'

export const HOME_SEO = {
  title: 'CVMaster — Free AI CV Builder: ATS-Friendly CVs Tailored to Any Job',
  description: 'Build a professional CV in minutes, free. Tailor it to any job offer with AI, check your ATS match score and download a one-page PDF. 50 templates, English and French.',
  path: '/',
}

export const ROUTE_SEO = {
  '/':          HOME_SEO,
  '/templates': { title: '50 Free CV Templates — ATS-Friendly & Creative | CVMaster',
                  description: 'Choose from 50 CV templates in 12 colours: plain ATS-friendly layouts for online applications and creative designs for print. Switch any time, free.', path: '/templates' },
  '/legal':     { title: 'Privacy & Terms — CVMaster', description: 'How CVMaster handles your data, payments, refunds and complaints — in plain English.', path: '/privacy' },
  '/editor':    { title: 'Editor — CVMaster', noindex: true },
  '/settings':  { title: 'Settings — CVMaster', noindex: true },
}

function meta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

export function setSeo({ title, description, path, noindex } = {}) {
  if (title) { document.title = title; meta('property', 'og:title', title); meta('name', 'twitter:title', title) }
  if (description) { meta('name', 'description', description); meta('property', 'og:description', description); meta('name', 'twitter:description', description) }
  meta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  if (path) {
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = SITE + path
    meta('property', 'og:url', SITE + path)
  }
}

// The Privacy & Terms page is one route with two tabs
export function seoForRoute(route) {
  if (route.path === '/legal') {
    const terms = route.query.tab === 'terms'
    return { title: terms ? 'Terms of Service — CVMaster' : 'Privacy Policy — CVMaster',
             description: ROUTE_SEO['/legal'].description, path: terms ? '/terms' : '/privacy' }
  }
  return ROUTE_SEO[route.path] || { title: 'CVMaster', path: route.path }
}
