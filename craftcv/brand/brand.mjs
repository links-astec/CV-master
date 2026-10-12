// The CVMaster brand, defined once: the mark (a "C" that sweeps into a tick), the "CV master"
// wordmark, and the colours for light, dark and indigo backgrounds. Everything that shows the
// logo builds it from here: the website (BrandLogo.vue), the blog and emails (server), and
// scripts/build-brand.mjs, which renders the favicons, app icons, email logo and share image.
// Source artwork: brand/source/ (the designer's files).

// The mark: one stroke, drawn on a 340 × 80 grid shared with the wordmark
export const MARK_PATH = 'M59.9 23.3 A26 26 0 1 0 53 62.5 L104 12'
export const MARK_STROKE = 10

// The wordmark: "CV" (bold) and "master"
export const WORD_CV = 'M142.68 55.76L142.68 55.76Q138.72 55.76 135.88 54.38Q133.04 53 131.24 50.74Q129.44 48.48 128.58 45.86Q127.72 43.24 127.72 40.76L127.72 40.76L127.72 39.88Q127.72 37.16 128.60 34.50Q129.48 31.84 131.30 29.68Q133.12 27.52 135.90 26.22Q138.68 24.92 142.48 24.92L142.48 24.92Q146.44 24.92 149.48 26.40Q152.52 27.88 154.34 30.50Q156.16 33.12 156.48 36.64L156.48 36.64L149.88 36.64Q149.60 34.88 148.60 33.64Q147.60 32.40 146.02 31.72Q144.44 31.04 142.48 31.04L142.48 31.04Q140.52 31.04 139 31.72Q137.48 32.40 136.46 33.64Q135.44 34.88 134.90 36.58Q134.36 38.28 134.36 40.36L134.36 40.36Q134.36 42.40 134.90 44.10Q135.44 45.80 136.50 47.06Q137.56 48.32 139.12 48.98Q140.68 49.64 142.68 49.64L142.68 49.64Q145.72 49.64 147.82 48.16Q149.92 46.68 150.36 44.08L150.36 44.08L156.92 44.08Q156.56 47.28 154.78 49.94Q153 52.60 149.94 54.18Q146.88 55.76 142.68 55.76ZM177.28 55L166.60 55L157.72 25.80L164.48 25.80L171.32 49.68L172.68 49.68L179 25.80L185.56 25.80L177.28 55Z'
export const WORD_MASTER = 'M203.20 55L199.36 55L199.36 33.64L202.40 33.64L202.40 38.56Q202.56 38 202.76 37.48L202.76 37.48Q203.56 35.32 205.20 34.16Q206.84 33 209.36 33L209.36 33L209.52 33Q212.04 33 213.70 34.16Q215.36 35.32 216.16 37.48L216.16 37.48Q216.28 37.88 216.40 38.28L216.40 38.28Q216.52 37.88 216.68 37.48L216.68 37.48Q217.52 35.32 219.18 34.16Q220.84 33 223.36 33L223.36 33L223.52 33Q226.04 33 227.72 34.16Q229.40 35.32 230.22 37.50Q231.04 39.68 231.04 42.80L231.04 42.80L231.04 55L227.20 55L227.20 41.96Q227.20 39.36 225.92 37.94Q224.64 36.52 222.36 36.52L222.36 36.52Q220 36.52 218.56 38.02Q217.12 39.52 217.12 42.20L217.12 42.20L217.12 55L213.28 55L213.28 41.96Q213.28 39.36 212 37.94Q210.72 36.52 208.44 36.52L208.44 36.52Q206.08 36.52 204.64 38.02Q203.20 39.52 203.20 42.20L203.20 42.20L203.20 55ZM253.24 55L250.20 55L250.20 50.80Q249.92 51.68 249.52 52.40L249.52 52.40Q248.60 53.96 247.02 54.76Q245.44 55.56 243.20 55.56L243.20 55.56Q240.80 55.56 239.06 54.74Q237.32 53.92 236.38 52.36Q235.44 50.80 235.44 48.60L235.44 48.60Q235.44 46.32 236.46 44.80Q237.48 43.28 239.44 42.50Q241.40 41.72 244.16 41.72L244.16 41.72L249.56 41.72L249.56 41.20Q249.56 39 248.42 37.88Q247.28 36.76 245.08 36.76L245.08 36.76Q243.84 36.76 242.52 36.80Q241.20 36.84 240.00 36.88Q238.80 36.92 237.92 37L237.92 37L237.92 33.64Q238.80 33.56 239.78 33.50Q240.76 33.44 241.80 33.42Q242.84 33.40 243.80 33.40L243.80 33.40Q247.08 33.40 249.16 34.18Q251.24 34.96 252.24 36.72Q253.24 38.48 253.24 41.48L253.24 41.48L253.24 55ZM249.56 47.08L249.56 44.60L244.00 44.60Q241.68 44.60 240.44 45.72Q239.20 46.84 239.20 48.60Q239.20 50.36 240.44 51.44Q241.68 52.52 244.00 52.52L244.00 52.52Q245.36 52.52 246.60 52.02Q247.84 51.52 248.66 50.34Q249.48 49.16 249.56 47.08L249.56 47.08ZM266.48 55.64L266.48 55.64Q262.28 55.64 259.98 53.84Q257.68 52.04 257.60 48.92L257.60 48.92L261.20 48.92Q261.28 50.16 262.46 51.26Q263.64 52.36 266.48 52.36L266.48 52.36Q269.04 52.36 270.40 51.34Q271.76 50.32 271.76 48.84L271.76 48.84Q271.76 47.52 270.76 46.78Q269.76 46.04 267.52 45.80L267.52 45.80L265.20 45.56Q262.16 45.24 260.24 43.74Q258.32 42.24 258.32 39.52L258.32 39.52Q258.32 37.48 259.36 36.02Q260.40 34.56 262.24 33.78Q264.08 33 266.48 33L266.48 33Q270.08 33 272.32 34.60Q274.56 36.20 274.64 39.36L274.64 39.36L271.04 39.36Q271 38.08 269.86 37.18Q268.72 36.28 266.48 36.28L266.48 36.28Q264.24 36.28 263.08 37.20Q261.92 38.12 261.92 39.52L261.92 39.52Q261.92 40.72 262.74 41.44Q263.56 42.16 265.44 42.36L265.44 42.36L267.76 42.60Q271.20 42.96 273.28 44.50Q275.36 46.04 275.36 48.84L275.36 48.84Q275.36 50.84 274.22 52.38Q273.08 53.92 271.08 54.78Q269.08 55.64 266.48 55.64ZM291.72 55.24L288.44 55.24Q286.04 55.24 284.30 54.56Q282.56 53.88 281.62 52.22Q280.68 50.56 280.68 47.72L280.68 47.72L280.68 36.52L277 36.52L277 33.64L280.68 33.64L280.68 27.16L284.36 27.16L284.36 33.64L291.72 33.64L291.72 36.52L284.36 36.52L284.36 48.20Q284.36 49.92 285.30 50.86Q286.24 51.80 287.96 51.80L287.96 51.80L291.72 51.80L291.72 55.24ZM305.28 55.72L305.28 55.72Q302.48 55.72 300.44 54.76Q298.40 53.80 297.12 52.22Q295.84 50.64 295.22 48.68Q294.60 46.72 294.60 44.68L294.60 44.68L294.60 43.96Q294.60 41.88 295.22 39.92Q295.84 37.96 297.12 36.38Q298.40 34.80 300.38 33.86Q302.36 32.92 305.04 32.92L305.04 32.92Q308.52 32.92 310.78 34.42Q313.04 35.92 314.14 38.28Q315.24 40.64 315.24 43.32L315.24 43.32L315.24 45.04L298.28 45.04Q298.40 46.88 299.04 48.40L299.04 48.40Q299.76 50.24 301.32 51.30Q302.88 52.36 305.28 52.36L305.28 52.36Q307.80 52.36 309.38 51.24Q310.96 50.12 311.28 48.64L311.28 48.64L314.88 48.64Q314.44 50.84 313.12 52.44Q311.80 54.04 309.80 54.88Q307.80 55.72 305.28 55.72ZM298.44 42.16L298.44 42.16L311.48 42.16Q311.32 40.84 310.84 39.76L310.84 39.76Q310.12 38.12 308.68 37.20Q307.24 36.28 305.04 36.28L305.04 36.28Q302.76 36.28 301.26 37.32Q299.76 38.36 299.04 40.16L299.04 40.16Q298.64 41.08 298.44 42.16ZM323.72 55L319.88 55L319.88 33.64L322.92 33.64L322.92 40.04Q323.32 37.16 324.84 35.56L324.84 35.56Q326.88 33.40 331 33.40L331 33.40L331.72 33.40L331.72 36.84L330.36 36.84Q327.16 36.84 325.44 38.54Q323.72 40.24 323.72 43.44L323.72 43.44L323.72 55Z'

// Colours per background: the stroke fades from `from` to `to`; the wordmark is `text`
export const THEMES = {
  light: { from: '#14142B', to: '#4338CA', text: '#14142B' },   // on white / light grey
  dark:  { from: '#F3F4F6', to: '#8B85FF', text: '#F3F4F6' },   // on near-black (dark mode)
  blue:  { from: '#FFFFFF', to: '#A5B4FC', text: '#FFFFFF' },   // on indigo
}
export const COLORS = { indigo: '#4338CA', night: '#14142B', ink: '#0C0C10', lilac: '#A5B4FC', mist: '#C7D2FE', glow: '#8B85FF', cloud: '#F5F5FA' }

// Tight boxes around the drawing (stroke included), so the logo lines up with text
export const MARK_BOX = '8 6 102 66'        // the mark alone
export const LOCKUP_BOX = '8 9 326 64'      // mark + wordmark (the mark sits 3 units lower in the lockup)

const grad = (id, t) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0"><stop offset=".3" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/></linearGradient>`
const stroke = (paint, extra = '') => `<path d="${MARK_PATH}" pathLength="1" fill="none" stroke="${paint}" stroke-width="${MARK_STROKE}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`

// SVG strings. `id` keeps gradient ids unique when several logos share a page.
export function markSvg({ theme = 'light', id = 'cvm', size = null, title = 'CVMaster', attrs = '' } = {}) {
  const t = THEMES[theme]
  const dim = size ? ` width="${Math.round(size * 102 / 66)}" height="${size}"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_BOX}"${dim} role="img" aria-label="${title}"${attrs}><defs>${grad(id + 'g', t)}</defs>${stroke(`url(#${id}g)`)}</svg>`
}
export function lockupSvg({ theme = 'light', id = 'cvl', height = null, title = 'CVMaster', attrs = '' } = {}) {
  const t = THEMES[theme]
  const dim = height ? ` width="${Math.round(height * 326 / 64)}" height="${height}"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOCKUP_BOX}"${dim} role="img" aria-label="${title}"${attrs}><defs>${grad(id + 'g', t)}</defs><g transform="translate(0 3)">${stroke(`url(#${id}g)`)}</g><path fill="${t.text}" d="${WORD_CV}"/><path fill="${t.text}" d="${WORD_MASTER}"/></svg>`
}

// The app icon: indigo squircle, soft glow and sheen, the mark in white with a soft shadow.
// `square` gives a full-bleed square (iOS and Android round the corners themselves).
export function appIconSvg({ square = false, id = 'cvi', size = 128 } = {}) {
  const shape = square ? 'M0 0H128V128H0Z' : 'M64 0C113 0 128 15 128 64S113 128 64 128 0 113 0 64 15 0 64 0Z'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="${size}" height="${size}"><defs>
<linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6A60F2"/><stop offset=".5" stop-color="#4338CA"/><stop offset="1" stop-color="#2A2390"/></linearGradient>
<radialGradient id="${id}glow" cx=".5" cy=".52" r=".5"><stop offset="0" stop-color="#8B85FF" stop-opacity=".55"/><stop offset="1" stop-color="#8B85FF" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".22"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}mk" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0"><stop offset=".25" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#C7D2FE"/><stop offset="1" stop-color="#A5B4FC"/></linearGradient>
<filter id="${id}sh" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="3.5"/></filter>
<clipPath id="${id}clip"><path d="${shape}"/></clipPath></defs>
<g clip-path="url(#${id}clip)"><path d="${shape}" fill="url(#${id}bg)"/><rect width="128" height="128" fill="url(#${id}glow)"/><rect width="128" height="128" fill="url(#${id}sheen)"/>
<g transform="translate(20.3 35.1) scale(0.74)"><path d="${MARK_PATH}" transform="translate(0 6)" fill="none" stroke="#14142B" stroke-opacity=".45" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" filter="url(#${id}sh)"/><path d="${MARK_PATH}" fill="none" stroke="url(#${id}mk)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></g>
<path d="${shape}" fill="none" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="2"/></g></svg>`
}

// The favicon: the same squircle with a heavier mark, so it reads at 16 px
export function faviconSvg({ id = 'cvf' } = {}) {
  const shape = 'M64 0C113 0 128 15 128 64S113 128 64 128 0 113 0 64 15 0 64 0Z'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs>
<linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6A60F2"/><stop offset=".5" stop-color="#4338CA"/><stop offset="1" stop-color="#2A2390"/></linearGradient>
<radialGradient id="${id}glow" cx=".5" cy=".52" r=".5"><stop offset="0" stop-color="#8B85FF" stop-opacity=".55"/><stop offset="1" stop-color="#8B85FF" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}mk" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0"><stop offset=".25" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#C7D2FE"/><stop offset="1" stop-color="#A5B4FC"/></linearGradient>
<clipPath id="${id}clip"><path d="${shape}"/></clipPath></defs>
<g clip-path="url(#${id}clip)"><path d="${shape}" fill="url(#${id}bg)"/><rect width="128" height="128" fill="url(#${id}glow)"/><g transform="translate(14 30) scale(0.85)"><path d="${MARK_PATH}" fill="none" stroke="url(#${id}mk)" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/></g></g></svg>`
}

// The looping loader: the stroke draws itself, rests, then clears (SMIL, no script needed)
export function loaderSvg({ theme = 'light', id = 'cvld', size = 56, title = 'Loading' } = {}) {
  const t = THEMES[theme]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_BOX}" width="${Math.round(size * 102 / 66)}" height="${size}" role="img" aria-label="${title}"><defs>${grad(id + 'g', t)}</defs><path d="${MARK_PATH}" pathLength="1" fill="none" stroke="url(#${id}g)" stroke-width="${MARK_STROKE}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="1"><animate attributeName="stroke-dashoffset" values="1;0;0;-1" keyTimes="0;.45;.62;1" dur="1.9s" repeatCount="indefinite" calcMode="spline" keySplines=".65 0 .35 1;.65 0 .35 1;.65 0 .35 1"/></path></svg>`
}

// Logos that take their colours from the page's CSS (--logo-from, --logo-to, --logo-text), for
// pages with their own light and dark modes (blog, admin). Light colours are the fallback.
const themedGrad = (id) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0"><stop offset=".3" style="stop-color:var(--logo-from,#14142B)"/><stop offset="1" style="stop-color:var(--logo-to,#4338CA)"/></linearGradient>`
export function lockupThemed({ id = 'cvt', height = 28, cls = 'logo', animate = false } = {}) {
  return `<svg class="${cls}${animate ? ' logo-anim' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="${LOCKUP_BOX}" height="${height}" role="img" aria-label="CVMaster"><defs>${themedGrad(id + 'g')}</defs><g transform="translate(0 3)">${stroke(`url(#${id}g)`, ' class="logo-stroke"')}</g><path class="logo-word" style="fill:var(--logo-text,#14142B)" d="${WORD_CV}"/><path class="logo-word logo-word2" style="fill:var(--logo-text,#14142B)" d="${WORD_MASTER}"/></svg>`
}
export function markThemed({ id = 'cvmt', height = 28, cls = 'logo-mark' } = {}) {
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_BOX}" height="${height}" aria-hidden="true"><defs>${themedGrad(id + 'g')}</defs>${stroke(`url(#${id}g)`)}</svg>`
}
// CSS for the draw-in entrance of lockupThemed({ animate: true })
export const LOGO_ANIM_CSS = '.logo-anim .logo-stroke{stroke-dasharray:1 2;stroke-dashoffset:1;animation:logo-draw 1.15s cubic-bezier(.6,0,.25,1) .15s forwards}.logo-anim .logo-word{opacity:0;animation:logo-in .7s cubic-bezier(.2,.7,.2,1) .9s forwards}.logo-anim .logo-word2{animation-delay:1.02s}@keyframes logo-draw{to{stroke-dashoffset:0}}@keyframes logo-in{from{opacity:0;transform:translateX(-8px);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}@media (prefers-reduced-motion:reduce){.logo-anim .logo-stroke{stroke-dasharray:none;animation:none}.logo-anim .logo-word{opacity:1;animation:none}}'
