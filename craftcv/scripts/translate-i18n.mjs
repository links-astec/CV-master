// Fills the interface dictionaries for every language from the English keys.
//   node scripts/translate-i18n.mjs            → all languages, only missing keys
//   node scripts/translate-i18n.mjs es de      → just those languages
//   node scripts/translate-i18n.mjs --redo es  → re-translate everything for es
//   node scripts/translate-i18n.mjs zh --import zh.json → merge translations made elsewhere
//     ({ "English key": "translation" }, same checks; nothing is sent to an AI)
// The English text is the key (see src/i18n/index.js); French is hand-written in src/i18n/fr/*.js
// and is used here as a second reference. Uses ANTHROPIC_API_KEY if set, otherwise GROQ_API_KEY.
// Every translation is checked: placeholders ({n}), **bold** markers and line breaks must match,
// otherwise that key is left out (the app then shows English for it).
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..')
const I18N = path.join(ROOT, 'src', 'i18n')
const { PARTS, PATTERNS: FR_PATTERNS } = await import(pathToFileURL(path.join(I18N, 'fr.js')).href)
const FR = Object.assign({}, ...Object.values(PARTS))

const TARGETS = {
  es: { name: 'Spanish (Spain)', style: 'Use “tú”. A CV is “CV” or “currículum”. Prices: 0,99 €.' },
  de: { name: 'German', style: 'Use “Sie”. A CV is “Lebenslauf” (keep “CV” only in the brand name). Prices: 0,99 €.' },
  it: { name: 'Italian', style: 'Use “tu”. A CV is “CV” or “curriculum”. Prices: 0,99 €.' },
  pt: { name: 'Portuguese', style: 'Use “você” (neutral, understood in Portugal and Brazil). A CV is “CV” or “currículo”. Prices: 0,99 €.' },
  zh: { name: 'Simplified Chinese', style: 'Use 您. A CV is 简历. Use full-width punctuation. Prices: €0.99.' },
}

const args = process.argv.slice(2)
const redo = args.includes('--redo')
const importFile = args.includes('--import') ? args[args.indexOf('--import') + 1] : null
const langs = args.filter(a => !a.startsWith('--') && a !== importFile).filter(a => TARGETS[a])
const todo = langs.length ? langs : Object.keys(TARGETS)

async function ai(system, user) {
  if (process.env.ANTHROPIC_API_KEY) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5', max_tokens: 16000, system, messages: [{ role: 'user', content: user }] }),
    })
    const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || r.status)
    return j.content.map(b => b.text || '').join('')
  }
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', temperature: 0.2, reasoning_effort: 'low', max_tokens: MAX_TOKENS,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || r.status)
  return j.choices[0].message.content
}
// Smaller batches and replies for models with a low per-minute token limit, e.g.
//   I18N_BATCH=20 I18N_MAX_TOKENS=4000 GROQ_MODEL=qwen/qwen3.8-27b node scripts/translate-i18n.mjs zh
const BATCH = Number(process.env.I18N_BATCH) || 40
const MAX_TOKENS = Number(process.env.I18N_MAX_TOKENS) || 16000
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
// Free API tiers have per-minute limits: wait as long as the API asks, then try again
async function aiPatient(system, user) {
  for (let i = 0; i < 15; i++) {
    try { return await ai(system, user) }
    catch (e) {
      const m = /try again in (?:(\d+)m)?([\d.]+)s/i.exec(e.message)
      // Rate limits say how long to wait; a dropped connection gets a short pause and another try
      const wait = m ? (Number(m[1] || 0) * 60 + Number(m[2])) : (/rate limit|overloaded|429|529/i.test(e.message) ? 20 : /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket/i.test(e.message) ? 15 : 0)
      if (!wait) throw e
      await sleep((wait + 1.5) * 1000)
    }
  }
  throw new Error('rate limited for too long')
}
const parseJson = (raw) => { const s = raw.replace(/```json|```/g, ''); return JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1)) }
const sig = (s) => [...String(s).matchAll(/\{(\w+)\}|\*\*|\$\d/g)].map(m => m[0]).sort().join(' ') + '|' + (String(s).match(/\n/g) || []).length
const visible = (k) => k.replace(/^[a-z]+\|/, '')   // 'industry|Education' → 'Education'

function system(lang) {
  const t = TARGETS[lang]
  return `You translate the interface of CVMaster, a CV (résumé) builder web app, from English into ${t.name}.
Write natural, professional, concise UI text as a native ${t.name} product team would, not word-for-word. ${t.style}
Rules:
- Keep placeholders like {n}, {email}, {list} exactly as they are. Keep **bold** markers, emoji, line breaks (\\n) and the brand name “CVMaster” unchanged. Keep “ATS”, “PDF”, “AI”/“IA” conventions natural for the language (e.g. German “KI”, Spanish “IA”, Chinese “AI”).
- Buttons and labels stay short. Match the tone: friendly, clear and professional.
- Never use the em dash (—). Use commas, colons or full stops instead.
- Each item has the English text, and a French version for context; translate the meaning of the English.
- Some keys start with a context like “industry|”: that tells you the meaning (an industry/sector name); translate only the text.
Reply with ONLY a JSON object mapping each given id to its translation.`
}

function serialize(dict, patterns) {
  const lines = Object.entries(dict).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  const pats = patterns.map(([re, out]) => `  [${re.toString()}, ${JSON.stringify(out)}],`)
  return `// Generated by scripts/translate-i18n.mjs from the English keys. Edit freely: the script only adds missing keys.\nexport default {\n${lines.join('\n')}\n}\n\n// Server messages that contain a value (same regexes as fr/server.js)\nexport const PATTERNS = [\n${pats.join('\n')}\n]\n`
}

const keys = Object.keys(FR)
if (importFile) {
  if (todo.length !== 1) throw new Error('Name one language with --import, e.g. zh --import zh.json')
  const lang = todo[0], file = path.join(I18N, `${lang}.js`)
  const m = fs.existsSync(file) ? await import(pathToFileURL(file).href) : {}
  const have = { ...(m.default || {}) }
  const incoming = JSON.parse(fs.readFileSync(importFile, 'utf8'))
  let added = 0, replaced = 0, unknown = 0
  const bad = []
  for (const [k, raw] of Object.entries(incoming)) {
    const v = typeof raw === 'string' ? raw.trim() : ''
    if (!keys.includes(k)) { unknown++; continue }
    if (!v || sig(v) !== sig(visible(k)) || /—/.test(v)) { bad.push(k); continue }
    if (have[k]) replaced++; else added++
    have[k] = v
  }
  fs.writeFileSync(file, serialize(have, m.PATTERNS || []))
  console.log(`${lang}: ${added} added, ${replaced} replaced, ${bad.length} rejected (placeholders, **, line breaks or an em dash didn't match), ${unknown} not used by the app`)
  bad.forEach(k => console.log('  rejected:', JSON.stringify(k), '→', JSON.stringify(incoming[k])))
  console.log(`  → ${path.relative(ROOT, file)}: ${Object.keys(have).filter(k => keys.includes(k)).length}/${keys.length} keys`)
  process.exit(0)
}
for (const lang of todo) {
  const file = path.join(I18N, `${lang}.js`)
  let have = {}, havePatterns = []
  if (fs.existsSync(file) && !redo) {
    const m = await import(pathToFileURL(file).href + '?t=' + Date.now())
    have = { ...m.default }; havePatterns = m.PATTERNS || []
  }
  const missing = keys.filter(k => !have[k])
  console.log(`\n${lang}: ${Object.keys(have).length} done, ${missing.length} to translate`)
  const B = BATCH
  for (let i = 0; i < missing.length; i += B) {
    const chunk = missing.slice(i, i + B)
    // French as context only for short strings, where a word alone can be ambiguous
    const items = Object.fromEntries(chunk.map((k, j) => [`k${j}`, visible(k).length < 40 ? { en: visible(k), fr: FR[k] } : { en: visible(k) }]))
    let out
    for (let attempt = 1; attempt <= 3 && !out; attempt++) {
      try { out = parseJson(await aiPatient(system(lang), JSON.stringify(items))) }
      catch (e) { console.log(`  batch ${i / B + 1}: attempt ${attempt} failed (${String(e.message).slice(0, 80)})`) }
    }
    let ok = 0, bad = 0
    chunk.forEach((k, j) => {
      const v = typeof out?.[`k${j}`] === 'string' ? out[`k${j}`].trim() : ''
      if (v && sig(v) === sig(visible(k))) { have[k] = v; ok++ } else bad++
    })
    console.log(`  batch ${i / B + 1}/${Math.ceil(missing.length / B)}: ${ok} ok${bad ? `, ${bad} skipped (format mismatch)` : ''}`)
    fs.writeFileSync(file, serialize(have, havePatterns.length ? havePatterns : []))
  }
  // Patterns: translate the French replacements, keeping $1/$2
  if (!havePatterns.length && FR_PATTERNS?.length) {
    const items = Object.fromEntries(FR_PATTERNS.map(([, out], j) => [`p${j}`, { fr: out }]))
    try {
      const out = parseJson(await aiPatient(system(lang) + '\nThese items are French message templates; translate them from French. Keep $1, $2 exactly.', JSON.stringify(items)))
      havePatterns = FR_PATTERNS.map(([re, frOut], j) => [re, typeof out[`p${j}`] === 'string' && sig(out[`p${j}`]) === sig(frOut) ? out[`p${j}`] : null]).filter(p => p[1])
    } catch (e) { console.log('  patterns failed:', e.message) }
  }
  fs.writeFileSync(file, serialize(have, havePatterns))
  console.log(`  → ${path.relative(ROOT, file)}: ${Object.keys(have).length}/${keys.length} keys, ${havePatterns.length} patterns`)
}
