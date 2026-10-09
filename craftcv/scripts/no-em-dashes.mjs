// Replaces em dashes (—) in the site's copy with ordinary punctuation, the same way everywhere,
// so translation keys in the code and in the dictionaries keep matching.
//   node scripts/no-em-dashes.mjs           → rewrite the files
//   node scripts/no-em-dashes.mjs --check   → only report what's left
// Rules, in order: a few hand-written phrasings; "Page — CVMaster" titles → "Page | CVMaster";
// "Label — {value}" → "Label: {value}"; then "A — b c d e…" (a full clause after the dash)
// → "A. B c d e…", and a short tail "A — b" → "A, b". En dashes (2021 – 2023) are untouched.
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..')
const FILES = []
;(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (/\.(vue|js|mjs)$/.test(f)) FILES.push(p)
  }
})(path.join(ROOT, 'src'))
FILES.push(path.join(ROOT, 'index.html'), path.join(ROOT, 'admin.html'), path.join(ROOT, 'server', 'index.js'))

const PHRASES = [
  ['Build my CV — free', 'Build my CV for free'], ['Créer mon CV — gratuit', 'Créer mon CV gratuitement'],
  ['Get 100 more — €0.50', 'Get 100 more for €0.50'], ['100 de plus — 0,50 €', '100 de plus pour 0,50 €'],
  ['Get them — €0.50', 'Get them for €0.50'], ['Les obtenir — 0,50 €', 'Les obtenir pour 0,50 €'],
  ['Pay €0.99 — get my CV', 'Pay €0.99 and get my CV'], ['Payer 0,99 € — obtenir mon CV', 'Payer 0,99 € et obtenir mon CV'],
  ['No job offer — skip', 'Skip, no job offer'], ['Pas d’offre — passer', 'Passer, pas d’offre'],
  ['Skip — keep my wording', 'Skip and keep my wording'], ['Passer — garder ma formulation', 'Passer et garder ma formulation'],
  ['Skip — I’ll fill it in myself', 'Skip, I’ll fill it in myself'], ['Skip — fill it in myself instead', 'Skip and fill it in myself'],
  ['CVMaster — ', 'CVMaster | '],
]
const L = '\\p{L}\\p{N}\\)\\]’”»%}!?…'         // characters that can end the text before a dash
const R = '\\p{L}\\p{N}\\(“‘{€$£*«'           // characters that can start the text after it

export function fix(s) {
  for (const [a, b] of PHRASES) s = s.split(a).join(b)
  // "**Label** — text" / "<strong>Label</strong> — text" → "Label: text"
  s = s.replace(/(<\/strong>|<\/b>|\*\*) — /g, '$1: ')
  // Signatures and placeholders that start with a dash lose it
  s = s.replace(/— (The CVMaster team|CVMaster Support|Author name)/g, '$1')
  // Separators built in code ("English — Native") become a colon
  s = s.replace(/join\(' — '\)/g, "join(': ')")
  s = s.replace(new RegExp(`([${L}]) — CVMaster\\b`, 'gu'), '$1 | CVMaster')
  s = s.replace(/\b(Experience|Education|Project|Expérience|Formation|Projet) — \{/g, '$1: {')
  return s.replace(new RegExp(`([${L}]) ?— ?([${R}])`, 'gu'), (m, a, b, off, str) => {
    // How long is the part after the dash (up to the end of its sentence or string)?
    const rest = str.slice(off + m.length - 1).split(/[.!?;:'"`<\n]/)[0]
    const words = rest.trim().split(/\s+/).filter(Boolean).length
    if (words >= 4 && !/[,(]$/.test(a)) return `${a}. ${b.toLocaleUpperCase()}`
    return `${a}, ${b}`
  })
}

const check = process.argv.includes('--check')
let total = 0
for (const f of FILES) {
  const src = fs.readFileSync(f, 'utf8')
  const out = check ? src : fix(src)
  const left = (out.match(/ ?— ?/g) || []).length
  if (!check && out !== src) fs.writeFileSync(f, out)
  if (left) { total += left; console.log(`${path.relative(ROOT, f)}: ${left} left`) }
}
console.log(check ? `${total} em dashes in the copy` : `done — ${total} left (standalone “—” placeholders and code separators are kept)`)
