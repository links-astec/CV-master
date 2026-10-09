// Interface language. The English text is the key: t('Sign in') gives the translation from
// that language's dictionary, or the English itself when there's no translation yet, so
// nothing ever shows blank. Placeholders: t('{n} reviews', { n: 3 }); an array placeholder is
// translated item by item and joined. When the same English word needs different wording in
// different places, prefix a context: t('industry|Education') shows "Education" in English
// and looks up 'industry|Education' in the dictionary.
// Dictionaries load on demand (only the chosen language is downloaded). This is the language
// of the app itself, a CV's own language is chosen separately in the editor.
import { ref, shallowRef, watch } from 'vue'

const KEY = 'cvmaster-lang'
// native name, short code, BCP-47 locale for dates/numbers, Google sign-in button locale
const ALL_LANGS = [
  { code: 'en', label: 'English',   short: 'EN', locale: 'en-GB', google: 'en' },
  { code: 'fr', label: 'Français',  short: 'FR', locale: 'fr-FR', google: 'fr' },
  { code: 'es', label: 'Español',   short: 'ES', locale: 'es-ES', google: 'es' },
  { code: 'de', label: 'Deutsch',   short: 'DE', locale: 'de-DE', google: 'de' },
  { code: 'it', label: 'Italiano',  short: 'IT', locale: 'it-IT', google: 'it' },
  { code: 'pt', label: 'Português', short: 'PT', locale: 'pt-PT', google: 'pt' },
  { code: 'zh', label: '中文',       short: '中文', locale: 'zh-CN', google: 'zh-CN' },
]
// Languages whose dictionary is still being generated stay out of the menu (and of device
// detection) until it's complete. Add a code here while its file is being filled in.
const NOT_READY = []
export const LANGS = ALL_LANGS.filter(l => !NOT_READY.includes(l.code))
const CODES = LANGS.map(l => l.code)
const LOADERS = {
  fr: () => import('./fr.js'), es: () => import('./es.js'), de: () => import('./de.js'),
  it: () => import('./it.js'), pt: () => import('./pt.js'), zh: () => import('./zh.js'),
}

// First visit: the device's language if we have it; afterwards the user's own choice
function storedChoice() { try { const s = localStorage.getItem(KEY); return CODES.includes(s) ? s : '' } catch { return '' } }
function initialLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (CODES.includes(q)) return q
  } catch {}
  const saved = storedChoice()
  if (saved) return saved
  const prefs = typeof navigator !== 'undefined' ? [...(navigator.languages || []), navigator.language] : []
  for (const p of prefs) { const c = String(p || '').toLowerCase().split('-')[0]; if (CODES.includes(c)) return c }
  return 'en'
}

export const lang = ref('en')
const dict = shallowRef({})
let patterns = []

// Untranslated keys seen (handy for checking coverage in the console)
const missing = (typeof window !== 'undefined' && (window.__i18nMissing = new Set())) || new Set()

// Messages with a value in them (mostly from the server), e.g. "“gmial.com” can’t receive email"
function fromPattern(s) {
  for (const [re, out] of patterns) if (re.test(s)) return s.replace(re, out)
  return ''
}

export function t(s, params) {
  if (s == null) return ''
  const ctx = /^[a-z]+\|/.exec(s)
  let out = ctx ? s.slice(ctx[0].length) : s
  if (lang.value !== 'en') {
    const tr = dict.value[s] || fromPattern(s)
    if (tr) out = tr
    else if (/[a-z]{2}/i.test(out)) missing.add(s)
  }
  if (params) out = out.replace(/\{(\w+)\}/g, (m, k) => {
    const v = params[k]
    return v == null ? m : Array.isArray(v) ? v.map(x => t(String(x))).join(', ') : v
  })
  return out
}

// Switch language (downloads its dictionary first). `explicit`: the user picked it, so it's
// remembered. Otherwise (device language, account setting) nothing is stored.
export async function setLang(code, { explicit = true } = {}) {
  if (!CODES.includes(code)) return
  if (code === 'en') { dict.value = {}; patterns = [] }
  else {
    try {
      const m = await LOADERS[code]()
      dict.value = m.default || {}
      patterns = m.PATTERNS || []
    } catch { return }   // offline or a failed download: stay in the current language
  }
  lang.value = code
  if (explicit) { try { localStorage.setItem(KEY, code) } catch {} }
}
export const hasExplicitChoice = () => !!storedChoice()

// Loads the starting language before the app mounts (main.js awaits this)
export const i18nReady = typeof window !== 'undefined' ? setLang(initialLang(), { explicit: false }) : Promise.resolve()

// The server imports the CV renderer (and so this file) to build PDFs, no DOM there
if (typeof document !== 'undefined') {
  watch(lang, (code) => { document.documentElement.lang = code }, { immediate: true })
}

// Dates and numbers in the interface language
export const locale = () => (LANGS.find(l => l.code === lang.value) || LANGS[0]).locale
export const googleLocale = () => (LANGS.find(l => l.code === lang.value) || LANGS[0]).google

export default {
  install(app) {
    app.config.globalProperties.$t = t
    app.config.globalProperties.$lang = lang
  },
}
