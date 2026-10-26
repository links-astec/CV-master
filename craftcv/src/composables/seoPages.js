// What search engines see for each public page (English keys; translated through the i18n dictionaries).
// Used by the app (seo.js) and at build time (scripts/seo-pages.mjs), which writes each page's own HTML
// head in every language so the first HTML Google reads already has the right title and canonical URL.
export const PAGES = {
  '/':          { title: 'Free CV Maker & AI CV Builder: ATS-Friendly CVs | CVMaster',
                  description: 'CVMaster (CV Master) is a free AI CV builder and CV maker: build a professional CV in minutes, tailor it to any job offer, check your ATS score and download a one-page PDF. 50 CV templates.' },
  '/templates': { title: '50 Free CV Templates. ATS-Friendly & Creative | CVMaster',
                  description: 'Choose from 50 CV templates in 12 colours: plain ATS-friendly layouts for online applications and creative designs for print. Switch any time, free.' },
  '/pricing':   { title: 'Pricing: Free CV Builder, €0.99 per CV or the Job Hunt Pass | CVMaster',
                  description: 'CVMaster (CV Master) is free to build. Download a clean PDF for €0.99, or get every CV with the Job Hunt Pass: €6.99 a month or €14.99 every 3 months.' },
  '/privacy':   { title: 'Privacy Policy | CVMaster', description: 'How CVMaster handles your data, payments, refunds and complaints, in plain language.' },
  '/terms':     { title: 'Terms of Service | CVMaster', description: 'How CVMaster handles your data, payments, refunds and complaints, in plain language.' },
  '/editor':    { title: 'Editor | CVMaster' },
  '/settings':  { title: 'Settings | CVMaster' },
}
export const NOINDEX = new Set(['/editor', '/settings'])
// The pages search engines should find, in every language
export const PUBLIC_PATHS = ['/', '/templates', '/pricing', '/privacy', '/terms']
