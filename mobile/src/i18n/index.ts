// The app's interface language. Same exports as the website's src/i18n/index.js, which the
// website's own code (CV renderer, example CVs) is given instead of the Vue version (see
// metro.config.js). It uses the website's dictionaries, so both apps say the same thing in
// every language. The English text is the key: t('Sign in') → the translation, or the
// English when there is none yet.
import { useSyncExternalStore } from 'react'
import { getLocales } from 'expo-localization'
import * as SecureStore from 'expo-secure-store'

const KEY = 'cvmaster-lang'
export const LANGS = [
  { code: 'en', label: 'English',   short: 'EN', locale: 'en-GB', google: 'en' },
  { code: 'fr', label: 'Français',  short: 'FR', locale: 'fr-FR', google: 'fr' },
  { code: 'es', label: 'Español',   short: 'ES', locale: 'es-ES', google: 'es' },
  { code: 'de', label: 'Deutsch',   short: 'DE', locale: 'de-DE', google: 'de' },
  { code: 'it', label: 'Italiano',  short: 'IT', locale: 'it-IT', google: 'it' },
  { code: 'pt', label: 'Português', short: 'PT', locale: 'pt-PT', google: 'pt' },
  { code: 'zh', label: '中文',       short: '中文', locale: 'zh-CN', google: 'zh-CN' },
] as const
export type LangCode = (typeof LANGS)[number]['code']
const CODES: string[] = LANGS.map(l => l.code)

type Dict = Record<string, string>
type Pattern = [RegExp, string]
type DictModule = { default?: Dict; PATTERNS?: Pattern[] }
// The website's files are plain JavaScript; their shape is { default: Dict, PATTERNS: [RegExp, string][] }
const as = (p: Promise<unknown>) => p as Promise<DictModule>
const LOADERS: Record<string, () => Promise<DictModule>> = {
  fr: () => as(import('../../../craftcv/src/i18n/fr.js')),
  es: () => as(import('../../../craftcv/src/i18n/es.js')),
  de: () => as(import('../../../craftcv/src/i18n/de.js')),
  it: () => as(import('../../../craftcv/src/i18n/it.js')),
  pt: () => as(import('../../../craftcv/src/i18n/pt.js')),
  zh: () => as(import('../../../craftcv/src/i18n/zh.js')),
}

let current: LangCode = 'en'
let dict: Dict = {}
let patterns: Pattern[] = []
let version = 0
const listeners = new Set<() => void>()
const emit = () => { version++; listeners.forEach(l => l()) }

// The website's code reads `lang.value`
export const lang = { get value(): LangCode { return current } }

function fromPattern(s: string) {
  for (const [re, out] of patterns) if (re.test(s)) return s.replace(re, out)
  return ''
}

export function t(s: string | null | undefined, params?: Record<string, unknown>): string {
  if (s == null) return ''
  const ctx = /^[a-z]+\|/.exec(s)
  let out = ctx ? s.slice(ctx[0].length) : s
  if (current !== 'en') out = dict[s] || fromPattern(s) || out
  if (params) {
    out = out.replace(/\{(\w+)\}/g, (m, k) => {
      const v = params[k]
      return v == null ? m : Array.isArray(v) ? v.map(x => t(String(x))).join(', ') : String(v)
    })
  }
  return out
}

// Switch language (loads its dictionary first). `explicit`: the user chose it, so it's remembered.
export async function setLang(code: string, { explicit = true } = {}) {
  if (!CODES.includes(code)) return
  if (code === 'en') { dict = {}; patterns = [] }
  else {
    try {
      const m = await LOADERS[code]()
      dict = m.default || {}
      patterns = m.PATTERNS || []
    } catch { return }
  }
  current = code as LangCode
  if (explicit) { try { await SecureStore.setItemAsync(KEY, code) } catch {} }
  emit()
}

let explicitChoice = false
export const hasExplicitChoice = () => explicitChoice

// First launch: the phone's language if we have it; afterwards the user's own choice
async function initialLang(): Promise<string> {
  try {
    const saved = await SecureStore.getItemAsync(KEY)
    if (saved && CODES.includes(saved)) { explicitChoice = true; return saved }
  } catch {}
  for (const l of getLocales()) {
    const c = (l.languageCode || '').toLowerCase()
    if (CODES.includes(c)) return c
  }
  return 'en'
}

export const i18nReady: Promise<void> = initialLang().then(code => setLang(code, { explicit: false }))

export const locale = () => (LANGS.find(l => l.code === current) || LANGS[0]).locale
export const googleLocale = () => (LANGS.find(l => l.code === current) || LANGS[0]).google

// React: components that call useLang() re-render when the language changes
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }
export function useLang() {
  useSyncExternalStore(subscribe, () => version)
  return { lang: current, t, setLang, locale: locale() }
}

// The website's module also has a Vue plugin as its default export; the app never uses it
export default {}
