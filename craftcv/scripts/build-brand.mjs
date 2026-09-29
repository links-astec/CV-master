// Builds every CVMaster brand asset from one definition.
//   node scripts/build-brand.mjs
// Writes SVG logos to brand/ and public/, and renders the PNGs (Stripe icon and logo,
// Apple touch icon, social share image) with Puppeteer. Brand: "A — Trusted Check".
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..')
const out = (...p) => path.join(ROOT, ...p)
fs.mkdirSync(out('brand'), { recursive: true })

export const BRAND = {
  indigo: '#4338CA', night: '#14142B', mist: '#C7D2FE', lilac: '#A5B4FC', cloud: '#F5F5FA', pass: '#16A34A',
}

// The mark: a CV page with a tick, on an indigo tile. 64-unit grid.
const markInner = (tick = BRAND.indigo) => `
  <path d="M21 11h15l11 11v27a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4V15a4 4 0 0 1 4-4z" fill="#FFFFFF"/>
  <path d="M36 11v7.5a3.5 3.5 0 0 0 3.5 3.5H47z" fill="${BRAND.lilac}"/>
  <path d="M23 19.5h8" stroke="${BRAND.mist}" stroke-width="3" stroke-linecap="round"/>
  <path d="M23.5 37.5l6.5 6.5 12-12.5" fill="none" stroke="${tick}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
const markSvg = ({ rx = 15, bg = BRAND.indigo } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="${rx}" fill="${bg}"/>${markInner()}</svg>\n`

const fontB64 = fs.readFileSync(out('node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2')).toString('base64')
const fontFace = `@font-face{font-family:'Plus Jakarta Sans';font-weight:800;src:url(data:font/woff2;base64,${fontB64}) format('woff2')}`

// Horizontal lockup: mark + "CVMaster" wordmark. Text width is measured in Chrome.
function lockupSvg({ textWidth, dark = false }) {
  const h = 64, gap = 18, size = 44
  const w = Math.ceil(64 + gap + textWidth + 2)
  const cv = dark ? BRAND.lilac : BRAND.indigo
  const rest = dark ? '#FFFFFF' : BRAND.night
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<style>${fontFace}</style>
<rect width="64" height="64" rx="15" fill="${BRAND.indigo}"/>${markInner()}
<text x="${64 + gap}" y="47.5" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="${size}" letter-spacing="-1.5"><tspan fill="${cv}">CV</tspan><tspan fill="${rest}">Master</tspan></text>
</svg>\n`
}

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()

// Measure the wordmark with the real font
await page.setContent(`<style>${fontFace}</style><span id="t" style="font-family:'Plus Jakarta Sans';font-weight:800;font-size:44px;letter-spacing:-1.5px">CVMaster</span>`)
await page.evaluate(() => document.fonts.ready)
const textWidth = await page.evaluate(() => document.getElementById('t').getBoundingClientRect().width)

const files = {
  'brand/cvmaster-mark.svg': markSvg(),
  'brand/cvmaster-logo.svg': lockupSvg({ textWidth }),
  'brand/cvmaster-logo-white.svg': lockupSvg({ textWidth, dark: true }),
  'public/favicon.svg': markSvg({ rx: 14 }),
}
for (const [f, svg] of Object.entries(files)) fs.writeFileSync(out(f), svg)

async function png(file, html, w, h, transparent = true) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await page.setContent(`<!doctype html><html><head><style>${fontFace}html,body{margin:0;width:${w}px;height:${h}px;${transparent ? 'background:transparent' : ''}}</style></head><body>${html}</body></html>`)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: out(file), omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } })
}
const scaled = (svg, w, h) => svg.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)

// Stripe: square icon (Settings → Branding → Icon) and wide logo (→ Logo)
await png('brand/stripe-icon-512.png', scaled(markSvg(), 512, 512), 512, 512)
const lw = Math.ceil((64 + 18 + textWidth + 2) * 4)
await png('brand/stripe-logo.png', scaled(files['brand/cvmaster-logo.svg'], lw, 256), lw, 256)
await png('brand/cvmaster-logo-white.png', `<div style="background:${BRAND.night};width:${lw + 96}px;height:352px;display:flex;align-items:center;justify-content:center">${scaled(files['brand/cvmaster-logo-white.svg'], lw, 256)}</div>`, lw + 96, 352, false)
// iOS rounds the corners itself, so the touch icon is a full square tile
await png('public/apple-touch-icon.png', scaled(markSvg({ rx: 0 }), 180, 180), 180, 180, false)

// Social share image (link previews on LinkedIn, WhatsApp, X…)
await png('public/og-image.png', `
<div style="width:1200px;height:630px;box-sizing:border-box;padding:72px 80px;background:${BRAND.cloud};font-family:'Plus Jakarta Sans',sans-serif;display:flex;flex-direction:column;justify-content:space-between">
  ${scaled(files['brand/cvmaster-logo.svg'], Math.round((64 + 18 + textWidth + 2) * 1.25), 80)}
  <div style="font-size:66px;font-weight:800;letter-spacing:-2.4px;line-height:1.06;color:${BRAND.night};max-width:980px">A CV that gets past the robots — and impresses the humans</div>
  <div style="display:flex;gap:14px">
    ${['Tailored to the job', 'ATS match check', 'One-page PDF', 'English &amp; Français'].map(t => `<span style="font-size:24px;font-weight:800;color:${BRAND.indigo};background:#E6E8FF;border-radius:999px;padding:12px 22px">${t}</span>`).join('')}
  </div>
</div>`, 1200, 630, false)

await browser.close()
console.log('brand assets written:', Object.keys(files).join(', '), '+ PNGs')
