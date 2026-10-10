// Screenshots of the app's screens at phone size, from its web build, with the server faked.
// 1) cd mobile && npx expo export --platform web --output-dir dist-web
// 2) cd ../craftcv && SP=<folder> node ../mobile/scripts/screenshots.mjs [signedin|guest|onboard]
// CV previews use web stand-ins (CvPreview.web.tsx, CvThumb.web.tsx); the phone app uses WebViews.
// Screenshots of the mobile app's web build at phone size, with the server faked.
// Run from craftcv/ (for express + puppeteer):  node <this> [signedin|guest|onboard]
import { createRequire } from 'module'
// express and puppeteer come from the website's packages (run this from craftcv/)
const require = createRequire(process.cwd() + '/')
const express = require('express')
const puppeteer = require('puppeteer')
const { SAMPLE_CV } = await import(new URL('../../craftcv/src/composables/sampleCv.js', import.meta.url).href)

const SP = process.env.SP
const mode = process.argv[2] || 'signedin'
const dir = process.cwd() + '/../mobile/dist-web'
const st = express(); st.use(express.static(dir)); st.get(/.*/, (q, s) => s.sendFile(dir + '/index.html'))
const s2 = st.listen(0); const site = 'http://127.0.0.1:' + s2.address().port

const user = { id: 'u1', email: 'amara@example.com', name: 'Amara Mensah', plan: 'free', onboarded: mode !== 'onboard', provider: 'email', emailVerified: true }
const drafts = [
  { id: '11111111-1111-1111-1111-111111111111', title: 'Amara Mensah · Senior Product Manager', template: 'modern:indigo', data: { ...SAMPLE_CV, jobOffer: '' }, createdAt: new Date().toISOString(), updatedAt: new Date(Date.now() - 3600e3).toISOString() },
  { id: '22222222-2222-2222-2222-222222222222', title: 'Amara Mensah · Product Lead', template: 'classic:charcoal', data: { ...SAMPLE_CV, title: 'Product Lead' }, createdAt: new Date().toISOString(), updatedAt: new Date(Date.now() - 86400e3 * 3).toISOString() },
]

const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push(e.message.slice(0, 200)))
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.setRequestInterception(true)
p.on('request', r => {
  const u = new URL(r.url())
  if (!u.host.includes('cvmaster.live')) return r.continue()
  const headers = { 'Access-Control-Allow-Origin': site, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE' }
  if (r.method() === 'OPTIONS') return r.respond({ status: 204, headers })
  const signed = mode !== 'guest'
  let status = 200, body = {}
  if (u.pathname === '/api/auth/me') { if (signed) body = user; else { status = 401; body = { error: 'Unauthorized' } } }
  else if (u.pathname === '/api/drafts') body = signed ? drafts : []
  else if (u.pathname === '/api/ai/quota') body = { tier: signed ? 'free' : 'guest', limit: signed ? 30 : 5, freeLeft: signed ? 27 : 5, credits: 0 }
  else if (u.pathname.startsWith('/api/drafts/')) body = drafts[0]
  r.respond({ status, contentType: 'application/json', headers, body: JSON.stringify(body) })
})
const wait = (ms) => new Promise(r => setTimeout(r, ms))
const shot = async (n) => { await wait(1100); await p.screenshot({ path: `${SP}/app/${mode}-${n}.png` }) }
const tap = (text) => p.evaluate((tx) => {
  const el = [...document.querySelectorAll('[role="button"],[role="tab"],[role="radio"],button,a,div')].reverse().find(e => e.textContent.trim() === tx)
  el?.click(); return !!el
}, text)

await p.goto(site + '/'); await wait(3000)
// get past the welcome screens (first launch)
if (await tap('Skip')) { await wait(500); await tap('Build my CV for free'); await wait(1500) }

if (mode === 'signedin') {
  await shot('1-mycvs')
  await p.evaluate(() => window.scrollTo(0, 0))
  await tap('Open'); await wait(1500); await shot('2-editor')
  await tap('Edit CV'); await wait(1500); await shot('3-edit-content')
  await tap('Work Experience'); await wait(800); await shot('4-edit-experience')
  await tap('Design'); await wait(800); await shot('5-edit-design')
  await tap('Job match'); await wait(800); await shot('6-edit-job')
  await tap('Done'); await wait(800)
  await p.evaluate(() => document.querySelector('[aria-label="Menu"]')?.click()); await wait(800); await shot('7-menu')
}
if (mode === 'onboard') { await wait(1500); await shot('1-onboard'); await tap('Technology'); await tap('A new job'); await tap('Mid-level'); await shot('2-onboard-picked'); await tap('Start building'); await wait(1500); await shot('3-tour') }
if (mode === 'guest') { await tap('Settings'); await wait(800); await tap('Create free account'); await wait(1200); await shot('1-auth') }

console.log(mode, 'page errors:', errs.length ? errs : 'none')
await b.close(); s2.close()
