// Screenshots of the app's screens at phone size, from its web build, with the server faked.
// 1) cd mobile && npx expo export --platform web --output-dir dist-web
// 2) cd ../craftcv && SP=<folder> node ../mobile/scripts/screenshots.mjs [signedin|signedout|onboard|more|loader]
// CV previews use web stand-ins (CvPreview.web.tsx, CvThumb.web.tsx); the phone app uses WebViews.
// Screenshots of the mobile app's web build at phone size, with the server faked.
// Run from craftcv/ (for express + puppeteer):  node <this> [signedin|signedout|onboard|more]
import { createRequire } from 'module'
// express and puppeteer come from the website's packages (run this from craftcv/)
const require = createRequire(process.cwd() + '/')
const express = require('express')
const puppeteer = require('puppeteer')
const { SAMPLE_CV } = await import(new URL('../../craftcv/src/composables/sampleCv.js', import.meta.url).href)

const SP = process.env.SP
const mode = process.argv[2] || 'signedin'
const dir = require('path').resolve(process.cwd(), '../mobile/dist-web')
const st = express(); st.use(express.static(dir)); st.get(/.*/, (q, s) => s.sendFile(dir + '/index.html'))
const s2 = st.listen(0); const site = 'http://127.0.0.1:' + s2.address().port

const user = { id: 'u1', email: 'christabel@example.com', name: 'Christabel Nayram Tengey', plan: 'free', onboarded: mode !== 'onboard', provider: 'email', emailVerified: true, hasPassword: true, aiPersonalize: true, industry: 'tech', goal: 'new-job', experience: 'senior' }
const long = { ...SAMPLE_CV, experiences: [...SAMPLE_CV.experiences, ...SAMPLE_CV.experiences.map((e, i) => ({ ...e, id: 10 + i })), ...SAMPLE_CV.experiences.map((e, i) => ({ ...e, id: 20 + i }))] }
const drafts = [
  { id: '11111111-1111-1111-1111-111111111111', title: 'Christabel Nayram Tengey · Senior Product Manager', template: 'modern:indigo', data: { ...(mode === 'more' ? long : SAMPLE_CV), jobOffer: '' }, createdAt: new Date().toISOString(), updatedAt: new Date(Date.now() - 3600e3).toISOString() },
  { id: '22222222-2222-2222-2222-222222222222', title: 'Christabel Nayram Tengey · Product Lead', template: 'classic:charcoal', data: { ...(mode === 'more' ? long : SAMPLE_CV), title: 'Product Lead' }, createdAt: new Date().toISOString(), updatedAt: new Date(Date.now() - 86400e3 * 3).toISOString() },
]

const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push(e.message.slice(0, 200)))
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.setRequestInterception(true)
p.on('request', r => {
  const u = new URL(r.url())
  if (!u.host.includes('cvmaster.live')) return r.continue()
  const headers = { 'Access-Control-Allow-Origin': site, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type, X-CVMaster-Client', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE' }
  if (r.method() === 'OPTIONS') return r.respond({ status: 204, headers })
  // loader mode: the blog's articles never arrive, so the blog stays on its loader
  if (mode === 'loader' && u.pathname.startsWith('/api/posts')) return
  const signed = mode !== 'signedout'
  let status = 200, body = {}
  if (u.pathname === '/api/auth/me') { if (signed) body = user; else { status = 401; body = { error: 'Unauthorized' } } }
  else if (u.pathname === '/api/drafts') body = signed ? drafts : []
  else if (u.pathname === '/api/ai/quota') body = { tier: 'verified', limit: 30, freeLeft: 27, credits: 0 }
  else if (u.pathname === '/api/notifications') body = [{ id: 'n1', type: 'referral', title: 'You earned a free CV', body: 'Kofi got their CV with your link. Your next clean PDF is on us.', link: null, read: false, time: Date.now() - 3600e3 }, { id: 'n2', type: 'welcome', title: 'Welcome to CVMaster', body: 'Your account is ready. Start building your CV now.', link: null, read: true, time: Date.now() - 86400e3 * 2 }]
  else if (u.pathname === '/api/referral/info') body = { code: 'CHRISTABEL7', credits: 1, count: 3, rewarded: 1, recentCount: 1, welcomeAi: 25, link: 'https://www.cvmaster.live?ref=CHRISTABEL7' }
  else if (u.pathname === '/api/newsletter/me') body = { status: 'subscribed' }
  else if (u.pathname === '/api/payment/paid-drafts') body = { draftIds: ['22222222-2222-2222-2222-222222222222'], legacyAll: false }
  else if (u.pathname.startsWith('/api/payment/status/')) body = { paid: false }
  else if (u.pathname === '/api/reviews/mine') body = { review: null, canReview: true }
  else if (u.pathname === '/api/me/next') body = { key: 'job', title: 'Match your CV to a job', body: 'Paste a job offer to see your ATS score and what’s missing.', action: 'job', draftId: drafts[0].id, favLayout: 'sidebar', personal: true }
  else if (u.pathname === '/api/events') body = { ok: true, kept: 1 }
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

if (mode === 'signedout') {
  await shot('1-welcome')
  await tap('Skip'); await wait(700); await shot('2-welcome-last')
  await tap('Create free account'); await wait(1500); await shot('3-signup')
  await tap('Have an invite code?'); await wait(400); await shot('4-signup-code')
}
if (mode === 'loader') {
  await p.goto(site + '/blog'); await wait(3500); await p.screenshot({ path: SP + '/app/loader-a.png' }); await wait(450); await p.screenshot({ path: SP + '/app/loader-b.png' })
}
if (mode === 'signedin') {
  await shot('1-mycvs')
  await tap('Open'); await wait(1500); await shot('2-editor')
  await tap('Edit CV'); await wait(1500); await shot('3-edit-content')
  await tap('Design'); await wait(2500); await shot('4-edit-design')
  await p.evaluate(() => { const s = [...document.querySelectorAll('div')].filter(d => d.scrollHeight > d.clientHeight + 50 && getComputedStyle(d).overflowY !== 'visible').pop(); if (s) s.scrollTop = 2600 }); await wait(600); await shot('5-edit-design-settings')
  await tap('Done'); await wait(800)
  await tap('Templates'); await wait(3000); await shot('6-templates')
  await tap('Settings'); await wait(1500); await shot('7-settings')
  await tap('Change'); await wait(800); await p.keyboard.type('old-password'); await p.keyboard.press('Tab'); await p.keyboard.type('Sunrise-2026'); await wait(300); await p.evaluate(() => { const s = [...document.querySelectorAll('div')].filter(d => d.scrollHeight > d.clientHeight + 50 && getComputedStyle(d).overflowY !== 'visible').pop(); if (s) s.scrollTop = 330 }); await wait(600); await shot('7b-settings-password'); await tap('Cancel'); await wait(500)
  await p.evaluate(() => { const s = [...document.querySelectorAll('div')].filter(d => d.scrollHeight > d.clientHeight + 50 && getComputedStyle(d).overflowY !== 'visible').pop(); if (s) s.scrollTop = 900 }); await wait(500); await shot('8-settings-invite')
  await p.evaluate(() => { const s = [...document.querySelectorAll('div')].filter(d => d.scrollHeight > d.clientHeight + 50 && getComputedStyle(d).overflowY !== 'visible').pop(); if (s) s.scrollTop = 99999 }); await wait(500); await shot('9-settings-bottom')
}
if (mode === 'more') {
  await tap('Open'); await wait(2500); await shot('1-editor-long')
  await p.evaluate(() => { const f = document.querySelector('iframe'); const d = f?.contentDocument; const br = d?.querySelector('.brk'); if (br) br.scrollIntoView({ block: 'center' }) }); await wait(500); await shot('2-editor-endofpage')
  await tap('Shrink to fit'); await wait(2500); await shot('3-editor-shrunk')
  await tap('Export PDF'); await wait(2000); await shot('4-export')
  await p.goBack?.(); await p.goto(site + '/notifications'); await wait(2000); await shot('5-notifications')
  await p.goto(site + '/feedback'); await wait(1500); await shot('6-feedback')
  await p.goto(site + '/story'); await wait(1500); await tap('Microphone'); await wait(800); await shot('7-story-mic')
  await p.goto(site + '/'); await wait(2500)
  await tap('Take a 1-minute tour'); await p.evaluate(() => {})
  await p.goto(site + '/settings'); await wait(2000); await tap('Start tour'); await wait(1500); await shot('8-tour-1')
  await tap('Next'); await wait(1500); await shot('9-tour-mycvs')
  await tap('Next'); await wait(1500); await shot('10-tour-new')
  await tap('Next'); await wait(2000); await shot('11-tour-templates')
  await tap('Next'); await wait(2000); await tap('Next'); await wait(2000); await shot('12-tour-export')
}
if (mode === 'lang') {
  await tap('Settings'); await wait(1200)
  await p.evaluate(() => document.querySelector('[aria-label="Language"]')?.click()); await wait(600)
  await tap('Français'); await wait(1200); await shot('1-french')
  console.log('pill shows:', await p.evaluate(() => document.querySelector('[aria-label="Langue"]')?.textContent), '| title:', await p.evaluate(() => document.body.innerText.includes('Paramètres')))
}
if (mode === 'onboard') { await wait(1500); await shot('1-onboard'); await tap('Technology'); await tap('A new job'); await tap('Mid-level'); await shot('2-onboard-picked'); await tap('Start building'); await wait(1500); await shot('3-tour') }

console.log(mode, 'page errors:', errs.length ? errs : 'none')
await b.close(); s2.close()
