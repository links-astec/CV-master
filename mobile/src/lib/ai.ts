// The AI features, through the same server endpoints as the website (so the prompts, the
// allowance and the "never for an empty CV" rule live in one place). The photo is never sent.
import { api, ApiError } from '@/lib/api'
import { hasCvContent, type CvData } from '@/lib/cv'
import { lang, t } from '@/i18n'

export const CV_EMPTY_MSG = 'Your CV is empty. Add a few details first (a job title, some experience or skills), then the AI can help.'

function cvBody(d: CvData) {
  const { photo, ...cv } = d
  return cv
}

async function ai<T>(path: string, d: CvData, extra: Record<string, unknown> = {}): Promise<T> {
  if (!hasCvContent(d)) throw new ApiError(t(CV_EMPTY_MSG), 400, 'CV_EMPTY')
  return api<T>(path, { body: { cv: cvBody(d), uiLang: lang.value, ...extra } })
}

// Writing help (summary, skills, bullets), aimed at the job offer when there is one
export const writeSummary = (d: CvData, tone = 'professional') =>
  ai<{ result: string }>('/api/ai/write', d, { task: 'summary', tone, jobOffer: d.jobOffer })
export const suggestSkills = (d: CvData) =>
  ai<{ skills: string[] }>('/api/ai/write', d, { task: 'skills', jobOffer: d.jobOffer })
export const improveBullets = (d: CvData, index: number) =>
  ai<{ result: string }>('/api/ai/write', d, { task: 'bullets', index, jobOffer: d.jobOffer })

export type Msg = { key: string; params?: Record<string, unknown> }
export type AtsResult = {
  score: number; matched: string[]; missing: string[]; gaps: Msg[]; suggestions: Msg[]
  job?: { title?: string; company?: string; keywords?: number }
  breakdown?: Record<string, number>
}
export const atsCheck = (d: CvData) => ai<AtsResult>('/api/ai/ats', d, { jobOffer: d.jobOffer })

export type FitResult = { fit: 'good' | 'stretch' | 'poor'; headline: string; reasons: string[]; advice: string; job?: { title?: string; company?: string } }
export const fitCheck = (d: CvData) => ai<FitResult>('/api/ai/fit', d, { jobOffer: d.jobOffer })

export type TailorResult = {
  jobTitle: string; title: string; sum: string
  experiences: { index: number; id: number | null; desc: string }[]
  skillsOrder: string[]; suggestedSkills: string[]; notes: string[]
}
export const tailor = (d: CvData, ats?: AtsResult | null) =>
  ai<TailorResult>('/api/ai/tailor', d, { jobOffer: d.jobOffer, ats: ats ? { score: ats.score, missing: ats.missing, gaps: ats.gaps.map(g => t(g.key, g.params)) } : null })

// "Fix with AI" for one checklist issue: proposed changes the user reviews before applying
export type FixResult = { changes: { key: string; label: string; before: string; after: string }[]; skills: string[]; note: string }
export const aiFix = (d: CvData, issue: string) => ai<FixResult>('/api/ai/fix', d, { issue, jobOffer: d.jobOffer })

// Translating a CV's content (the server supports English ↔ French). Proposals only.
export type TranslateResult = {
  title: string; sum: string
  experiences: { i: number; title: string; period: string; desc: string }[]
  education: { i: number; degree: string; year: string }[]
  projects: { i: number; desc: string }[]
  skills: string[]
  languages: { i: number; name: string; level: string }[]
  certifications: string[]
}
export const TRANSLATABLE = ['en', 'fr']
export const translateCv = (d: CvData, to: 'en' | 'fr') => ai<TranslateResult>('/api/ai/translate', d, { to })

// Same key as the website's Job match (JobMatch.vue fitKey), so a fit check done on either
// side is reused by the other for the same job and person
export function fitKey(d: CvData) {
  const s = `${d.jobOffer || ''}|${d.cvFor || ''}|${d.fn || ''} ${d.ln || ''}`
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return String(h)
}

export const errorText = (e: unknown) => (e instanceof Error ? e.message : t('AI request failed.'))
