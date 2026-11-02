// Which language text is written in, from its everyday words (no AI): for the CV's own language
// (one language from top to bottom) and for the cover letter (the job offer's language).

// Short, common words that mostly belong to one language. Words shared by several (de, la, en, a…) are
// left out so they can't tip the balance.
const WORDS = {
  en: 'the and of to with for in on at is was were my from by this that have has an as our we i into using led managed developed built worked responsible',
  fr: 'le les des du et pour avec dans sur est une je mon mes nos notre vous au aux par cette qui chez lors été ainsi également équipe gestion développement réalisé mis',
  es: 'el los las del y con por para una mi mis como al lo su sus fue equipo gestión desarrollo realicé',
  de: 'der die das und den von zu mit für ist ich auf bei ein eine im dem des auch sowie habe wurde wir unser unsere unseren einen oder nicht werden kenntnisse erfahrung',
  it: 'il gli della delle dei degli per con una è sono che come nel nella ho di ed anche sviluppo gestione',
  pt: 'os dos das do da em uma para com por são que no na ao foi meu minha como também desenvolvimento gestão equipa equipe',
}
const SETS = Object.fromEntries(Object.entries(WORDS).map(([k, v]) => [k, new Set(v.split(' '))]))
// The CV itself is written in English or French (its headings exist in those two)
export const CV_LANGS = ['en', 'fr']

// 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'zh', or '' when the text is too short or unclear.
// `among` limits the answer to some languages (the CV checks only look for English and French).
export function detectLang(text, among = Object.keys(SETS).concat('zh')) {
  const s = String(text || '')
  if (among.includes('zh') && (s.match(/[一-鿿]/g) || []).length >= 8) return 'zh'
  const words = s.toLowerCase().normalize('NFC').match(/[a-zà-ÿœ']+/g) || []
  if (words.length < 5) return ''
  const hits = among.filter(l => SETS[l]).map(l => [l, words.reduce((n, w) => n + (SETS[l].has(w.replace(/^[ldjmnst]'/, '')) ? 1 : 0), 0)])
    .sort((a, b) => b[1] - a[1])
  const [best, second] = hits
  if (!best || best[1] < 2) return ''
  return !second || best[1] >= second[1] * 1.5 ? best[0] : ''
}

// The CV's written parts, each with its language: what the reader reads as sentences (not names,
// skills or tools, which stay in English in many French CVs)
function cvParts(d) {
  const list = (v) => (Array.isArray(v) ? v : [])
  const s = (v) => (typeof v === 'string' ? v.trim() : '')
  return [s(d.title), s(d.sum), s(d.seeking),
    ...list(d.experiences).flatMap(e => [s(e?.title), ...s(e?.desc).split('\n')]),
    ...list(d.projects).map(p => s(p?.desc)),
    ...list(d.education).map(e => s(e?.degree)),
  ].filter(x => x.split(/\s+/).length >= 3)
}

// { dominant, mixed, headings } for the CV:
//   dominant: the language most of the content is in ('' when there's too little to tell)
//   mixed:    another language makes up a real part of it (a whole summary, a role's bullets…)
//   headings: the CV's headings (data.lang) don't match the content
export function cvLanguages(d) {
  const words = { en: 0, fr: 0 }
  for (const part of cvParts(d || {})) {
    const l = detectLang(part, CV_LANGS)
    if (l) words[l] += part.split(/\s+/).length
  }
  const total = words.en + words.fr
  if (total < 12) return { dominant: '', other: '', mixed: false, headings: false }
  const dominant = words.fr > words.en ? 'fr' : 'en', other = dominant === 'fr' ? 'en' : 'fr'
  const mixed = words[other] >= 8 && words[other] / total >= 0.15
  return { dominant, other, mixed, headings: (d.lang === 'fr' ? 'fr' : 'en') !== dominant }
}

// Before a CV is made into a PDF: all of it in its main language. Content in the other language is translated
// (one AI request) and the headings follow. Quietly does nothing when it can't (no AI left, offline).
export async function unifyCvLanguage(store) {
  const { dominant, mixed, headings } = cvLanguages(store.data)
  if (!dominant || (!mixed && !headings)) return false
  if (mixed) {
    try {
      const { photo, ...cv } = JSON.parse(JSON.stringify(store.data))
      const r = await fetch((import.meta.env.VITE_API_URL || '') + '/api/ai/translate', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, to: dominant }),
      })
      if (!r.ok) return false
      applyTranslation(store.data, await r.json())
    } catch { return false }
  }
  store.data.lang = dominant
  return true
}

// The cover letter's language: the one they picked, else the job offer's (a letter answers the advert
// in its own language), else the language the CV is written in
export const LETTER_LANGS = ['en', 'fr', 'es', 'de', 'it', 'pt', 'zh']
export function autoLetterLang(d) {
  return detectLang(d?.jobOffer) || cvLanguages(d || {}).dominant || (d?.lang === 'fr' ? 'fr' : 'en')
}
export const letterLangOf = (d) => (LETTER_LANGS.includes(d?.letterLang) ? d.letterLang : autoLetterLang(d))

// The translate endpoint's answer, written into the CV (array positions match)
export function applyTranslation(d, tr) {
  if (!tr || typeof tr !== 'object') return
  if (typeof tr.title === 'string') d.title = tr.title
  if (typeof tr.sum === 'string') d.sum = tr.sum
  if (typeof tr.seeking === 'string') d.seeking = tr.seeking
  for (const e of tr.experiences || []) { const y = d.experiences?.[e.i]; if (y) Object.assign(y, { title: e.title, period: e.period, desc: e.desc }) }
  for (const e of tr.education || []) { const y = d.education?.[e.i]; if (y) Object.assign(y, { degree: e.degree, year: e.year }) }
  for (const p of tr.projects || []) { const y = d.projects?.[p.i]; if (y) y.desc = p.desc }
  for (const l of tr.languages || []) { const y = d.languages?.[l.i]; if (y) Object.assign(y, { name: l.name, level: l.level }) }
  if (Array.isArray(tr.skills) && tr.skills.length === (d.skills || []).length) d.skills = [...tr.skills]
  if (Array.isArray(tr.softSkills) && tr.softSkills.length === (d.softSkills || []).length) d.softSkills = [...tr.softSkills]
  if (Array.isArray(tr.certifications) && tr.certifications.length === (d.certifications || []).length) d.certifications = [...tr.certifications]
}
