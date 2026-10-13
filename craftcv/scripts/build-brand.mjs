// Builds every CVMaster brand asset from the brand definition (brand/brand.mjs) and the
// designer's artwork (../final, copied into brand/ without its metadata).
//   node scripts/build-brand.mjs
// Writes the logo SVGs and logo animations to brand/, and the favicons, app and install icons,
// email logo, Stripe images, social profile picture and link-preview image (rendered with Puppeteer).
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import { COLORS, lockupSvg, appIconSvg, faviconSvg, MARK_PATH } from '../brand/brand.mjs'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..')
const out = (...p) => path.join(ROOT, ...p)
const SOURCE = path.resolve(ROOT, '..', 'final')
fs.mkdirSync(out('brand', 'animations'), { recursive: true })

// 1. The designer's files, without the embedded content-credentials block (it's most of each file)
const clean = (s) => s.replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/ xmlns:c2pa="[^"]*"/g, '')
  .replace(/CV master/g, 'CVMaster').replace(/ — /g, ' ')   // the name is CVMaster; no em dashes
if (fs.existsSync(SOURCE)) {
  const names = {
    'mark.svg': 'cvmaster-mark.svg', 'mark-dark.svg': 'cvmaster-mark-dark.svg', 'mark-on-blue.svg': 'cvmaster-mark-on-blue.svg',
    'app-icon.svg': 'cvmaster-app-icon.svg', 'app-icon-square.svg': 'cvmaster-app-icon-square.svg', 'favicon.svg': 'cvmaster-favicon.svg',
  }
  for (const [from, to] of Object.entries(names)) fs.writeFileSync(out('brand', to), clean(fs.readFileSync(path.join(SOURCE, from), 'utf8')) + '\n')
  for (const f of fs.readdirSync(SOURCE).filter(f => f.endsWith('.html'))) fs.writeFileSync(out('brand', 'animations', f), clean(fs.readFileSync(path.join(SOURCE, f), 'utf8')))
}

// 2. The logo (mark + CVMaster, the wordmark from the reveal animation) for light, dark and indigo backgrounds
for (const [theme, suffix] of [['light', ''], ['dark', '-dark'], ['blue', '-on-blue']]) fs.writeFileSync(out('brand', `cvmaster-logo${suffix}.svg`), lockupSvg({ theme, id: 'cvl' + suffix.replace('-', '') }) + '\n')

// Web SVGs
const BIMI = `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny-ps" viewBox="0 0 128 128"><title>CVMaster</title><rect width="128" height="128" fill="${COLORS.indigo}"/><g transform="translate(14 30) scale(0.85)"><path d="${MARK_PATH}" fill="none" stroke="#FFFFFF" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/></g></svg>\n`
fs.writeFileSync(out('public/favicon.svg'), faviconSvg() + '\n')
// BIMI: the brand picture mail apps show next to our emails (SVG Tiny PS: square, solid background)
fs.writeFileSync(out('public/bimi-logo.svg'), BIMI)

// 3. PNGs
const font = (w) => `@font-face{font-family:'Plus Jakarta Sans';font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(out(`node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${w}-normal.woff2`)).toString('base64')}) format('woff2')}`
const FONTS = [500, 700, 800].map(font).join('')
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
async function png(file, html, w, h, transparent = true) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await page.setContent(`<!doctype html><html><head><style>${FONTS}html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;${transparent ? 'background:transparent' : ''}}svg{display:block}</style></head><body>${html}</body></html>`)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: out(file), omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } })
}
const sized = (svg, w, h) => svg.replace(/<svg /, `<svg width="${w}" height="${h}" `).replace(/ width="\d+" height="\d+"(?=[^>]*width=)/, '')
const center = (inner, w, h, bg = 'transparent') => `<div style="width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;background:${bg}">${inner}</div>`

// Favicons and install icons
await png('public/favicon-48.png', sized(faviconSvg(), 48, 48), 48, 48)
await png('public/favicon-192.png', sized(faviconSvg(), 192, 192), 192, 192)
await png('public/icon-512.png', appIconSvg({ size: 512 }), 512, 512)
// Full-bleed square: phones (iOS touch icon, Android "maskable") round the corners themselves
await png('public/apple-touch-icon.png', appIconSvg({ square: true, size: 180 }), 180, 180, false)
await png('public/icon-maskable-512.png', appIconSvg({ square: true, size: 512 }), 512, 512, false)
// favicon.ico (Google search results show it): one 48 px PNG inside an ICO wrapper
{
  const p = fs.readFileSync(out('public/favicon-48.png'))
  const head = Buffer.alloc(22)
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4)
  head.writeUInt8(48, 6); head.writeUInt8(48, 7); head.writeUInt8(0, 8); head.writeUInt8(0, 9)
  head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(p.length, 14); head.writeUInt32LE(22, 18)
  fs.writeFileSync(out('public/favicon.ico'), Buffer.concat([head, p]))
}

// Email logo: the logo on its own white rounded tile, so it stays readable when a mail app's
// dark mode darkens the email. Drawn at 3× for phones; shown at 164 × 50 (server/index.js EMAIL_LOGO).
await png('public/email-logo-tile.png', `<div style="width:492px;height:150px;background:#fff;border-radius:30px;display:flex;align-items:center;justify-content:center">${lockupSvg({ height: 78 })}</div>`, 492, 150)
await png('public/email-logo.png', center(lockupSvg({ height: 96 }), 489, 96, '#fff'), 489, 96, false)

// Stripe (Settings → Branding): square icon and wide logo. Social profile picture.
await png('brand/stripe-icon-512.png', appIconSvg({ square: true, size: 512 }), 512, 512, false)
await png('brand/stripe-logo.png', center(lockupSvg({ height: 200 }), 1100, 256), 1100, 256)
await png('brand/profile-photo-800.png', appIconSvg({ square: true, size: 800 }), 800, 800, false)
await png('brand/cvmaster-logo.png', center(lockupSvg({ height: 200 }), 1200, 320, '#FFFFFF'), 1200, 320, false)
await png('brand/cvmaster-logo-dark.png', center(lockupSvg({ theme: 'dark', height: 200 }), 1200, 320, COLORS.ink), 1200, 320, false)
await png('brand/cvmaster-logo-on-blue.png', center(lockupSvg({ theme: 'blue', height: 200 }), 1200, 320, COLORS.indigo), 1200, 320, false)

// Link previews (LinkedIn, WhatsApp, X…): the homepage hero in miniature. The fanned CVs are a capture of
// the real hero (brand/og-stage.png, made by _srvtest/og-stage.mjs from the built site)
const STAGE = fs.existsSync(out('brand/og-stage.png')) ? 'data:image/png;base64,' + fs.readFileSync(out('brand/og-stage.png')).toString('base64') : ''
await png('public/og-image.png', `
<div style="position:relative;width:1200px;height:630px;overflow:hidden;box-sizing:border-box;background:radial-gradient(760px 380px at 50% 104%,#DCDAFF 0%,rgba(220,218,255,0) 72%),radial-gradient(520px 260px at 50% -6%,#EEEEFF 0%,rgba(238,238,255,0) 70%),#FBFBFD;font-family:'Plus Jakarta Sans',sans-serif;text-align:center">
  <div style="position:absolute;left:0;right:0;top:46px;display:flex;justify-content:center">${lockupSvg({ height: 40 })}</div>
  <div style="position:absolute;left:0;right:0;top:118px;font-size:66px;font-weight:800;letter-spacing:-2.6px;line-height:1.02;color:${COLORS.night}">A CV that gets you <span style="color:${COLORS.indigo}">the interview.</span></div>
  <div style="position:absolute;left:0;right:0;top:204px;font-size:24px;font-weight:500;color:#6B6B84;letter-spacing:-.2px">Build it in minutes. Tailor it to the job. Check it before you apply.</div>
  ${STAGE ? `<img src="${STAGE}" style="position:absolute;left:50%;top:268px;width:940px;transform:translateX(-50%)" />` : ''}
  <div style="position:absolute;left:0;right:0;bottom:0;height:70px;background:linear-gradient(180deg,rgba(251,251,253,0),rgba(251,251,253,.9))"></div>
</div>`, 1200, 630, false)

await browser.close()
// The old artwork is replaced, not kept beside the new
for (const f of ['brand/cvmaster-logo-white.svg', 'brand/cvmaster-logo-white.png']) if (fs.existsSync(out(f))) fs.unlinkSync(out(f))
console.log('brand assets written')
