// CV dates ("period" on a job, "year" on a qualification): read whatever people type and write them
// one way, in the CV's language. "01/2021 - 2023-03", "jan 2021 to march 2023" and "Janvier 2021 – présent"
// all become "Jan 2021 – Mar 2023" / "janv. 2021 – Aujourd’hui". Text that can't be read is left as typed.

const PRESENT = { en: 'Present', fr: 'Aujourd’hui' }
const ONGOING = /^(present|current|currently|now|today|ongoing|to date|aujourd['’]hui|actuel(le)?|en cours|pr[ée]sent|presente|actualidad|actual|heute|oggi|atual|hoje|至今|现在)$/i

// Month names people type, in the languages the site speaks (full and short, any case, accents optional)
const MONTHS = (() => {
  const map = new Map()
  const add = (name, m) => {
    const k = name.toLowerCase().replace(/\.$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    if (k && !map.has(k)) map.set(k, m)
  }
  for (const loc of ['en', 'fr', 'es', 'de', 'it', 'pt']) {
    for (let m = 0; m < 12; m++) {
      const d = new Date(Date.UTC(2020, m, 15))
      for (const style of ['long', 'short']) {
        try { add(new Intl.DateTimeFormat(loc, { month: style, timeZone: 'UTC' }).format(d), m + 1) } catch {}
      }
    }
  }
  for (const [k, m] of [['sept', 9], ['juil', 7], ['fevr', 2], ['avr', 4], ['aout', 8], ['dec', 12], ['janv', 1]]) add(k, m)
  return map
})()
const monthOf = (word) => MONTHS.get(String(word).toLowerCase().replace(/\.$/, '').normalize('NFD').replace(/[̀-ͯ]/g, ''))

// One side of a period: { y, m } (m may be null), 'present', or null when it can't be read
function readPoint(s) {
  const t = String(s || '').trim().replace(/[.,]$/, '')
  if (!t) return null
  if (ONGOING.test(t)) return 'present'
  let x
  if ((x = t.match(/^(\d{4})$/))) return { y: +x[1], m: null }
  if ((x = t.match(/^(\d{1,2})[/.](\d{4})$/)) && +x[1] >= 1 && +x[1] <= 12) return { y: +x[2], m: +x[1] }
  if ((x = t.match(/^(\d{4})[/.-](\d{1,2})$/)) && +x[2] >= 1 && +x[2] <= 12) return { y: +x[1], m: +x[2] }
  if ((x = t.match(/^([^\d\s]+\.?)\s+(\d{4})$/)) && monthOf(x[1])) return { y: +x[2], m: monthOf(x[1]) }
  if ((x = t.match(/^(\d{4})\s+([^\d\s]+\.?)$/)) && monthOf(x[2])) return { y: +x[1], m: monthOf(x[2]) }
  return null
}

// "Jan 2021 – Present" → { start: { y: 2021, m: 1 }, end: 'present' }; single dates have end null
export function parsePeriod(text) {
  let t = String(text || '').trim()
  if (!t) return null
  // ISO months use a hyphen, which would read as a separator: turn 2021-03 into 03/2021 first
  t = t.replace(/\b(\d{4})-(\d{2})\b/g, '$2/$1')
  const parts = t.split(/\s*[–—-]\s*|\s+(?:to|until|through|à|au|jusqu['’]à|a|bis|al)\s+/i).filter(p => p !== '')
  if (parts.length === 1) { const p = readPoint(parts[0]); return p && p !== 'present' ? { start: p, end: null } : null }
  if (parts.length !== 2) return null
  let start = readPoint(parts[0]), end = readPoint(parts[1])
  // "May – Aug 2026": the year on the right belongs to both
  if (!start && end && end !== 'present' && monthOf(parts[0])) start = { y: end.y, m: monthOf(parts[0]) }
  if (!start || start === 'present' || !end) return null
  return { start, end }
}

const monthName = (m, lang) => {
  const s = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, m - 1, 15)))
  return lang === 'fr' ? s : s.replace(/\.$/, '').slice(0, 3).replace('Sep', 'Sep')
}
const pointText = (p, lang) => (p === 'present' ? PRESENT[lang] || PRESENT.en : p.m ? `${monthName(p.m, lang)} ${p.y}` : String(p.y))

export function formatPeriod(p, lang = 'en') {
  if (!p?.start) return ''
  return p.end ? `${pointText(p.start, lang)} – ${pointText(p.end, lang)}` : pointText(p.start, lang)
}

// What a field should hold after it's typed in: the tidy version when the text can be read
export function normalizePeriod(text, lang = 'en') {
  const p = parsePeriod(text)
  return p ? formatPeriod(p, lang) : String(text || '')
}

// For the month pickers: { y, m } ⇄ "2021-03"
export const toMonthInput = (p) => (p && p !== 'present' ? `${p.y}-${String(p.m || 1).padStart(2, '0')}` : '')
export const fromMonthInput = (v) => { const x = String(v || '').match(/^(\d{4})-(\d{2})$/); return x ? { y: +x[1], m: +x[2] } : null }
