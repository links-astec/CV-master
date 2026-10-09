// Interface language (English / Français). The English text is the key: t('Sign in') gives
// the French from fr.js, or the English itself when there's no translation yet, so nothing
// ever shows blank. Placeholders: t('{n} reviews', { n: 3 }). When the same English word needs
// different French in different places, prefix a context: t('industry|Education') shows
// "Education" in English and looks up 'industry|Education' in French.
// This is the language of the app itself — a CV's own language is chosen separately.
import { ref, watch } from 'vue'
import FR, { PATTERNS } from './fr.js'

const KEY = 'cvmaster-lang'
export const LANGS = [{ code: 'en', label: 'English', short: 'EN' }, { code: 'fr', label: 'Français', short: 'FR' }]

function initialLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (q === 'en' || q === 'fr') return q
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'fr') return saved
  } catch {}
  return /^fr\b/i.test(navigator.language || '') ? 'fr' : 'en'
}

export const lang = ref(initialLang())

// Untranslated keys seen while in French (handy for checking coverage in the console)
const missing = (typeof window !== 'undefined' && (window.__i18nMissing = new Set())) || new Set()

// Messages with a value in them (mostly from the server), e.g. "“gmial.com” can’t receive email"
function fromPattern(s) {
  for (const [re, fr] of PATTERNS) if (re.test(s)) return s.replace(re, fr)
  return ''
}

export function t(s, params) {
  if (s == null) return ''
  const ctx = /^[a-z]+\|/.exec(s)
  let out = ctx ? s.slice(ctx[0].length) : s
  if (lang.value === 'fr') {
    const fr = FR[s] || fromPattern(s)
    if (fr) out = fr
    else if (/[a-z]{2}/i.test(out)) missing.add(s)
  }
  if (params) out = out.replace(/\{(\w+)\}/g, (m, k) => (params[k] ?? m))
  return out
}

export function setLang(code) {
  if (code !== 'en' && code !== 'fr') return
  lang.value = code
}

watch(lang, (code) => {
  try { localStorage.setItem(KEY, code) } catch {}
  document.documentElement.lang = code
}, { immediate: true })

// Dates and numbers in the interface language
export const locale = () => (lang.value === 'fr' ? 'fr-FR' : 'en-GB')

// For AI prompts: explanations shown to the user (gaps, tips, questions) follow the
// interface language. Text that goes onto the CV follows the CV's own language instead.
export const aiExplainIn = (fields) => (lang.value === 'fr'
  ? `\nWrite ${fields} in French (the user reads the app in French). Keep keywords and skill names exactly as they appear in the job description.`
  : '')

export default {
  install(app) {
    app.config.globalProperties.$t = t
    app.config.globalProperties.$lang = lang
  },
}
