// Do real CV parsers read our PDFs? Exports CVMaster CVs (the exact PDFs users download) and has them read by
// the CV-reading engines many ATSs use, then checks field by field what came back.
//
//   node --env-file=.env scripts/ats-check.mjs                 local text read only (no keys needed)
//   node --env-file=.env scripts/ats-check.mjs --engines=local,affinda,rchilli --layouts=ats --langs=en,fr
//
// Keys in .env (never commit them):
//   Affinda:  AFFINDA_API_KEY, AFFINDA_WORKSPACE, AFFINDA_DOCUMENT_TYPE   (dashboard: Settings → API keys; Workspace → Workflow → Integrations; Document types)
//   RChilli:  RCHILLI_USER_KEY, RCHILLI_SUB_USER_ID                        (from RChilli with the trial or contract)
// Options: --layouts=ats|all|modern,classic  --langs=en,fr  --limit=N (documents per engine, to save trial credits)
// Results are cached in reports/ats-check/cache (a document already read is never sent again) and the report is
// written to reports/ats-check/report-<date>.md and .json.
process.env.VERCEL = '1'; process.env.DISABLE_REMINDERS = 'true'; process.emitWarning = () => {}
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { pathToFileURL } from 'url'

const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1] || d
const ENGINES = arg('engines', 'local').split(',').filter(Boolean)
const LANGS = arg('langs', 'en').split(',').filter(Boolean)
const LIMIT = Number(arg('limit', '0')) || Infinity
const OUT = path.resolve('../reports/ats-check'); const CACHE = path.join(OUT, 'cache')
fs.mkdirSync(CACHE, { recursive: true })

const { cvPdfForChecks } = await import(pathToFileURL(path.resolve('server/index.js')).href)
const { LAYOUTS } = await import(pathToFileURL(path.resolve('src/composables/cvRenderer.js')).href)
const { SAMPLE_CV, SAMPLE_CV_FR } = await import(pathToFileURL(path.resolve('src/composables/sampleCv.js')).href)
const pick = arg('layouts', 'ats')
const layouts = pick === 'all' ? LAYOUTS : pick === 'ats' ? LAYOUTS.filter(l => l.kind === 'ats') : LAYOUTS.filter(l => pick.split(',').includes(l.id))
const CVS = { en: SAMPLE_CV, fr: SAMPLE_CV_FR }

// ── What a parser should find on the sample CV ──
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9@.+]+/g, ' ').trim()
const digits = (s) => String(s ?? '').replace(/\D/g, '')
function expected(cv) {
  const yearsOf = (p) => (String(p).match(/\d{4}/g) || [])
  return [
    { field: 'Name', value: `${cv.fn} ${cv.ln}`, where: /name/i },
    { field: 'Email', value: cv.email, where: /mail/i },
    { field: 'Phone', value: cv.phone, where: /phone|mobile|tel/i, digits: true },
    ...cv.experiences.map(e => ({ field: 'Job title', value: e.title, where: /work|experience|position|job|employ/i })),
    ...cv.experiences.map(e => ({ field: 'Employer', value: e.company, where: /work|experience|employ|organi[sz]ation|company/i })),
    ...cv.experiences.flatMap(e => yearsOf(e.period).map(y => ({ field: 'Job dates', value: y, where: /work|experience|employ|date|start|end|period/i }))),
    ...cv.education.map(e => ({ field: 'School', value: e.school, where: /educat|qualif|institut|school|universit/i })),
    ...cv.skills.map(s => ({ field: 'Skill', value: s, where: /skill/i })),
  ]
}
// Every string in the parser's answer, with where it was found (so "Senior Product Manager" counts as a job title
// only when it is under work experience, not just somewhere in the raw text)
function flatten(x, p = '', out = []) {
  if (x == null) return out
  if (typeof x === 'string' || typeof x === 'number') { out.push({ path: p, value: String(x) }); return out }
  if (Array.isArray(x)) { x.forEach((v, i) => flatten(v, `${p}[${i}]`, out)); return out }
  if (typeof x === 'object') for (const [k, v] of Object.entries(x)) if (!/^(rawText|redactedText|sections|ResumeFileName|DetailResume|HtmlResume|TextResume|PlainText|DocumentText|ConversionMetadata|ParsingMetadata|pages|meta|_meta)$/i.test(k)) flatten(v, p ? `${p}.${k}` : k, out)
  return out
}
function grade(cv, found) {
  return expected(cv).map(e => {
    const want = e.digits ? digits(e.value).slice(-9) : norm(e.value)
    const near = (v) => e.field === 'Skill' && norm(e.value).split(' ').filter(w => w.length > 3).some(w => norm(v).split(' ').includes(w))
    const ok = found.some(f => e.where.test(f.path) && (e.digits ? digits(f.value).includes(want) : norm(f.value).includes(want) || near(f.value)))
    return { ...e, ok }
  })
}

// Affinda keeps each account in one region; find it once from the key
let _affBase = null
async function affindaBase(key) {
  if (_affBase) return _affBase
  for (const base of ['https://api.eu1.affinda.com', 'https://api.affinda.com', 'https://api.us1.affinda.com']) {
    try { const r = await fetch(base + '/v3/organizations', { headers: { Authorization: 'Bearer ' + key }, signal: AbortSignal.timeout(15000) }); if (r.ok) return (_affBase = base) } catch {}
  }
  throw new Error('Affinda did not accept this API key in any region')
}
async function eden(provider, pdf, name) {
  const key = process.env.EDEN_AI_LIVE_API_KEY || process.env.EDEN_AI_API_KEY
  if (!key) throw new Error('EDEN_AI_LIVE_API_KEY is missing in .env')
  const form = new FormData()
  form.append('file', new Blob([pdf], { type: 'application/pdf' }), name); form.append('expires_in_days', '1')
  const up = await fetch('https://api.edenai.run/v3/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: form, signal: AbortSignal.timeout(60000) })
  const u = await up.json().catch(() => ({}))
  if (!up.ok || !u.file_id) throw new Error(`Eden AI upload ${up.status}: ${JSON.stringify(u).slice(0, 200)}`)
  const r = await fetch('https://api.edenai.run/v3/universal-ai', {
    method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'ocr/resume_parser/' + provider, input: { file: u.file_id } }), signal: AbortSignal.timeout(180000),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`Eden AI ${provider} ${r.status}: ${JSON.stringify(j).slice(0, 300)}`)
  const data = j.output?.extracted_data || j.extracted_data || j.output || j
  return { found: flatten(data), raw: j }
}
// ── The engines ──
const ENGINE = {
  // What any system that reads PDF text gets (no structure): every expected value in the text, in reading order
  async local(pdf, cv) {
    const { getDocumentProxy, extractText } = await import('unpdf')
    const doc = await getDocumentProxy(new Uint8Array(pdf), { isEvalSupported: false })
    const { text } = await extractText(doc, { mergePages: true }); await doc.destroy?.()
    const t = norm(text)
    // Reading order: the name, then the employers from newest to oldest (unique words, unlike job titles)
    let at = -1
    const inOrder = [cv.fn, ...cv.experiences.map(e => e.company)].every(v => (at = t.indexOf(norm(v), at + 1)) >= 0)
    const found = expected(cv).map(e => ({ path: e.where.source.split('|')[0], value: (e.digits ? digits(text) : t).includes(e.digits ? digits(e.value).slice(-9) : norm(e.value)) ? e.value : '' }))
    return { found, extra: { readingOrder: inOrder, characters: text.length } }
  },
  async affinda(pdf, cv, name) {
    const { AFFINDA_API_KEY: key, AFFINDA_WORKSPACE: ws, AFFINDA_DOCUMENT_TYPE: dt } = process.env
    if (!key) throw new Error('AFFINDA_API_KEY is missing in .env')
    const base = await affindaBase(key)
    const form = new FormData()
    form.append('file', new Blob([pdf], { type: 'application/pdf' }), name)
    form.append('wait', 'true')
    // With a workspace: the current API. Without one (a new account): the resume endpoint, which needs only the key
    let url = base + '/v2/resumes'
    if (ws) { url = base + '/v3/documents'; form.append('workspace', ws); if (dt) form.append('documentType', dt) }
    const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: form, signal: AbortSignal.timeout(120000) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`Affinda ${r.status}: ${JSON.stringify(j).slice(0, 300)}`)
    return { found: flatten(j.data || j), raw: j }
  },
  // Textkernel (formerly Sovren), the Tx Platform v10: account id + service key, EU data centre unless TEXTKERNEL_REGION=us
  async textkernel(pdf, cv, name) {
    const { TEXTKERNEL_ACCOUNT_ID: acc, TEXTKERNEL_EU_SERVICE_KEY: euKey, TEXTKERNEL_SERVICE_KEY: anyKey, TEXTKERNEL_REGION: region } = process.env
    const key = anyKey || euKey
    if (!acc || !key) throw new Error('TEXTKERNEL_ACCOUNT_ID and TEXTKERNEL_EU_SERVICE_KEY are missing in .env')
    const host = region === 'us' ? 'https://api.us.textkernel.com' : 'https://api.eu.textkernel.com'
    const r = await fetch(host + '/tx/v10/parser/resume', {
      method: 'POST', headers: { 'Tx-AccountId': acc, 'Tx-ServiceKey': key, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ DocumentAsBase64String: Buffer.from(pdf).toString('base64'), DocumentLastModified: new Date().toISOString().slice(0, 10) }),
      signal: AbortSignal.timeout(120000),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`Textkernel ${r.status}: ${JSON.stringify(j.Info || j).slice(0, 300)}`)
    return { found: flatten(j.Value || j), raw: j }
  },
  // Through Eden AI (one key, several parsers): Klippa and Senseloaf. The PDF is uploaded, then parsed.
  klippa: (pdf, cv, name) => eden('klippa', pdf, name),
  senseloaf: (pdf, cv, name) => eden('senseloaf', pdf, name),
  async rchilli(pdf, cv, name) {
    const { RCHILLI_USER_KEY: userkey, RCHILLI_SUB_USER_ID: subuserid } = process.env
    if (!userkey) throw new Error('RCHILLI_USER_KEY is missing in .env')
    const r = await fetch('https://rest.rchilli.com/RChilliParser/Rchilli/parseResumeBinary', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filedata: Buffer.from(pdf).toString('base64'), filename: name, userkey, version: '8.0.0', subuserid: subuserid || '' }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok || j.error) throw new Error(`RChilli ${r.status}: ${JSON.stringify(j.error || j).slice(0, 300)}`)
    return { found: flatten(j.ResumeParserData || j), raw: j }
  },
}

// ── Run ──
const NAMES = { local: 'Plain text read (pdf.js)', affinda: 'Affinda', rchilli: 'RChilli', textkernel: 'Textkernel', klippa: 'Klippa (via Eden AI)', senseloaf: 'Senseloaf (via Eden AI)' }
const rows = []
for (const engine of ENGINES) {
  if (!ENGINE[engine]) { console.log('Unknown engine:', engine); continue }
  let sent = 0
  for (const lang of LANGS) for (const l of (lang === 'en' ? layouts : layouts.slice(0, 5))) {
    if (sent >= LIMIT) break
    const cv = CVS[lang], tpl = `${l.id}:${l.theme}`, name = `CVMaster-${l.id}-${lang}.pdf`
    const pdf = Buffer.from(await cvPdfForChecks(tpl, cv, {}))
    const hash = crypto.createHash('sha256').update(engine).update(pdf).digest('hex').slice(0, 20)
    const cacheFile = path.join(CACHE, `${engine}-${l.id}-${lang}-${hash}.json`)
    let res
    try {
      if (engine !== 'local' && fs.existsSync(cacheFile)) res = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
      else { res = await ENGINE[engine](pdf, cv, name); if (engine !== 'local') { fs.writeFileSync(cacheFile, JSON.stringify(res)); sent++ } }
    } catch (e) { console.log(`${NAMES[engine]} · ${l.name} (${lang}): ${e.message}`); if (/missing in \.env/.test(e.message)) break; continue }
    const g = grade(cv, res.found)
    const core = g.filter(x => x.field !== 'Skill'), sk = g.filter(x => x.field === 'Skill')
    const score = Math.round(100 * core.filter(x => x.ok).length / core.length)
    const skills = `${sk.filter(x => x.ok).length}/${sk.length}`
    const missed = core.filter(x => !x.ok).map(x => `${x.field}: ${x.value}`)
    rows.push({ engine, layout: l.name, id: l.id, kind: l.kind, lang, score, skills, missed, extra: res.extra || null })
    console.log(`${NAMES[engine].padEnd(26)} ${l.name.padEnd(14)} ${lang}  ${String(score).padStart(3)}%  skills ${skills}${missed.length ? '  missed: ' + missed.slice(0, 4).join('; ') : ''}${res.extra && !res.extra.readingOrder ? '  (reading order off)' : ''}`)
  }
}

// ── Report ──
const date = new Date().toISOString().slice(0, 10)
const byEngine = ENGINES.map(e => ({ e, r: rows.filter(x => x.engine === e) })).filter(x => x.r.length)
const avg = (r) => Math.round(r.reduce((t, x) => t + x.score, 0) / r.length)
let md = `# CVMaster CVs read by CV parsers, ${date}\n\nThe exact PDFs CVMaster users download (example CV, ${layouts.length} ${pick === 'all' ? '' : pick === 'ats' ? 'ATS-friendly ' : ''}layouts, ${LANGS.join(' and ')}), read by each engine. Fields read: name, email, phone, each job title, employer and date, each school; a field counts only when the engine put it in the right place (a job title under work experience, a school under education). Skills are shown apart: parsers map them to their own skill lists.\n\n`
md += `| Engine | Documents | Fields read (average) | 100% read | Lowest |\n|---|---|---|---|---|\n`
for (const { e, r } of byEngine) { const low = r.reduce((m, x) => x.score < m.score ? x : m, r[0]); md += `| ${NAMES[e]} | ${r.length} | ${avg(r)}% | ${r.filter(x => x.score === 100).length} | ${low.layout} ${low.lang} (${low.score}%) |\n` }
for (const { e, r } of byEngine) {
  md += `\n## ${NAMES[e]}\n\n| Layout | Language | Fields read | Skills recognised | Missed |\n|---|---|---|---|---|\n`
  for (const x of r) md += `| ${x.layout} | ${x.lang} | ${x.score}% | ${x.skills} | ${x.missed.join('; ') || 'none'} |\n`
}
fs.writeFileSync(path.join(OUT, `report-${date}.md`), md)
fs.writeFileSync(path.join(OUT, `report-${date}.json`), JSON.stringify({ date, rows }, null, 1))
console.log('\n' + md.split('\n## ')[0])
console.log('Report:', path.join(OUT, `report-${date}.md`))
process.exit(0)
