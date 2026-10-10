// The CV data the app reads and writes. Same shape as the website (craftcv/src/stores/cv.js),
// so a CV edited on the phone opens unchanged on the website and the other way round.
import { lang } from '@/i18n'

export type Experience = { id: number; title: string; company: string; period: string; desc: string }
export type Education = { degree: string; school: string; year: string }
export type Project = { name: string; tech: string; url: string; desc: string }
export type LanguageItem = { name: string; level: string }

export type CvData = {
  fn: string; ln: string; title: string
  email: string; phone: string; loc: string; li: string; website: string
  photo: string | null
  sum: string
  experiences: Experience[]
  skills: string[]
  education: Education[]
  projects: Project[]
  certifications: string[]
  languages: LanguageItem[]
  lang: string
  jobOffer: string
  jobTailored: string
  jobTarget: { title: string; company: string } | null
  jobFit: unknown
  cvFor: string
  checkIgnored: string[]
  shrinkToFit: boolean
  [key: string]: unknown
}

export type CvFmt = {
  fontFamily: string; fontSize: string; lineSpacing: string; sectionSpacing: string
  linkStyle: string; linkText: string
}

// CV languages the renderer has headings for (cvRenderer.js LABELS)
const CV_LANGS = ['en', 'fr', 'es', 'de', 'it', 'pt', 'zh']

export const emptyData = (): CvData => ({
  fn: '', ln: '', title: '',
  email: '', phone: '', loc: '', li: '', website: '',
  photo: null,
  sum: '',
  experiences: [{ id: 1, title: '', company: '', period: '', desc: '' }],
  skills: [],
  education: [{ degree: '', school: '', year: '' }],
  projects: [],
  certifications: [],
  languages: [],
  lang: CV_LANGS.includes(lang.value) ? lang.value : 'en',
  jobOffer: '', jobTailored: '', jobTarget: null, jobFit: null, cvFor: '',
  checkIgnored: [], shrinkToFit: false,
})

export const defaultFmt = (): CvFmt => ({
  fontFamily: 'DM Sans', fontSize: 'normal', lineSpacing: 'normal', sectionSpacing: 'normal',
  linkStyle: 'plain', linkText: 'short',
})

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

// A saved draft's `data` (which also holds `fmt`) → complete CV data + format, like the website
export function normalise(saved: Record<string, any> | null | undefined): { data: CvData; fmt: CvFmt } {
  const s = saved && typeof saved === 'object' ? saved : {}
  const { fmt, ...rest } = s
  const data: CvData = { ...emptyData(), lang: 'en', ...rest } as CvData
  if (!saved) data.lang = emptyData().lang
  data.skills = arr<string>(data.skills).filter(x => typeof x === 'string')
  data.certifications = arr<string>(data.certifications).filter(x => typeof x === 'string')
  data.languages = arr<LanguageItem>(data.languages).map(l => ({ name: str(l?.name), level: str(l?.level) }))
  data.projects = arr<Project>(data.projects).map(p => ({ name: str(p?.name), tech: str(p?.tech), url: str(p?.url), desc: str(p?.desc) }))
  data.experiences = arr<Experience>(data.experiences).map((e, i) => ({ id: Number(e?.id) || i + 1, title: str(e?.title), company: str(e?.company), period: str(e?.period), desc: str(e?.desc) }))
  if (!data.experiences.length) data.experiences = emptyData().experiences
  const edu = Array.isArray(data.education) ? data.education : data.education && typeof data.education === 'object' ? [data.education] : []
  data.education = (edu as Education[]).map(e => ({ degree: str(e?.degree), school: str(e?.school), year: str(e?.year) }))
  if (!data.education.length) data.education = emptyData().education
  data.jobOffer = str(data.jobOffer)
  data.shrinkToFit = !!data.shrinkToFit
  data.checkIgnored = arr<string>(data.checkIgnored).filter(x => typeof x === 'string')
  return { data, fmt: { ...defaultFmt(), ...(fmt && typeof fmt === 'object' ? fmt : {}) } }
}

// The draft's title, built like the website's: "Name · Job title"
export function draftTitle(d: CvData) {
  const name = [d.fn, d.ln].map(s => s.trim()).filter(Boolean).join(' ')
  return `${name}${d.title ? ' · ' + d.title : ''}`
}
