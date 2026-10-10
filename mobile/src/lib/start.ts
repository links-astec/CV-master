// Starting a CV: empty, imported from a PDF/Word/text file, or built from the user's story.
// The server does the reading (same endpoints as the website); the result becomes a new draft.
import { BRAND } from '@/brand'
import { api, ApiError, type Draft } from '@/lib/api'
import { defaultFmt, draftTitle, emptyData, type CvData } from '@/lib/cv'
import { lang, t } from '@/i18n'
import { DEFAULT_TEMPLATE } from '@web/composables/cvRenderer.js'

type Ext = Record<string, any>
const s = (v: unknown) => (typeof v === 'string' ? v : '')

// What the server read from a CV or a story → complete CV data.
// Same rules and limits as the website (applyExtracted in craftcv/src/stores/cv.js).
export function fromExtracted(ext: Ext): CvData {
  const d = emptyData()
  for (const k of ['fn', 'ln', 'title', 'email', 'phone', 'loc', 'li', 'website', 'sum'] as const) {
    if (typeof ext[k] === 'string' && ext[k]) d[k] = ext[k]
  }
  if (Array.isArray(ext.skills)) d.skills = ext.skills.filter((x: unknown) => typeof x === 'string' && x.trim()).map((x: string) => x.trim()).slice(0, 30)
  if (Array.isArray(ext.experiences) && ext.experiences.length) {
    d.experiences = ext.experiences.filter((e: unknown) => e && typeof e === 'object').slice(0, 10)
      .map((e: Ext, i: number) => ({ id: i + 1, title: s(e.title), company: s(e.company), period: s(e.period), desc: s(e.desc) }))
  }
  const edu = Array.isArray(ext.education) ? ext.education : ext.education && typeof ext.education === 'object' ? [ext.education] : []
  const eduList = edu.filter((e: unknown) => e && typeof e === 'object').slice(0, 5).map((e: Ext) => ({ degree: s(e.degree), school: s(e.school), year: s(e.year) }))
  if (eduList.length) d.education = eduList
  if (Array.isArray(ext.projects)) {
    d.projects = ext.projects.filter((p: unknown) => p && typeof p === 'object').slice(0, 8)
      .map((p: Ext) => ({ name: s(p.name), desc: s(p.desc), url: s(p.url), tech: s(p.tech) }))
  }
  if (Array.isArray(ext.certifications)) d.certifications = ext.certifications.filter((x: unknown) => typeof x === 'string').slice(0, 10)
  if (Array.isArray(ext.languages)) {
    d.languages = ext.languages.filter((l: unknown) => l && typeof l === 'object').slice(0, 6).map((l: Ext) => ({ name: String(l.name || ''), level: String(l.level || '') }))
  }
  return d
}

export async function createDraft(data: CvData = emptyData()): Promise<Draft> {
  return api<Draft>('/api/drafts', { body: { title: draftTitle(data), data: { ...data, fmt: defaultFmt() }, template: DEFAULT_TEMPLATE } })
}

// Upload a PDF, Word or text CV; the server extracts it with AI (counts as one AI request)
export async function importCv(file: { uri: string; name: string; mimeType?: string | null }): Promise<CvData> {
  const form = new FormData()
  // React Native's FormData sends a local file from { uri, name, type }
  form.append('cv', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' } as unknown as Blob)
  let res: Response
  try {
    res = await fetch(BRAND.api + '/api/cv/upload', { method: 'POST', credentials: 'include', body: form })
  } catch {
    throw new ApiError(t('Connection error. Please try again.'), 0)
  }
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(t(j?.error || 'Failed to extract CV. Try a different file or fill in manually.'), res.status, j?.code)
  return fromExtracted(j.extracted || {})
}

export type StoryAnswer = { q: string; a: string }
export type StoryReply =
  | { verdict: 'unusable'; reason: string }
  | { verdict: 'needs_more'; questions: { q: string; hint: string }[]; round: number; maxRounds: number }
  | { verdict: 'ready'; cv: Ext }

export const tellStory = (story: string, answers: StoryAnswer[], round: number, force = false) =>
  api<StoryReply>('/api/ai/story', { body: { story, answers, round, force, uiLang: lang.value } })
