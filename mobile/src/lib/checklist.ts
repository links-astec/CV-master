// The CV checklist, ported from the website (craftcv/src/components/wizard/StepReview.vue):
// same checks, same wording (so every message is already translated) and the same "Fix with AI"
// issues the server knows (FIX_TASKS in server/index.js). Keep the two in step.
import type { CvData } from '@/lib/cv'
import type { Section } from '@/lib/sections'

export type Severity = 'error' | 'warn' | 'pass'
export type Text = { key: string; params?: Record<string, unknown> }
export type Rule = { id: string; points: number; severity: Severity; title: Text; text: Text; section?: Section }

// ── date order (from craftcv/src/composables/reorder.js, which also imports Vue) ──
const ONGOING = /present|current|now|today|ongoing|aujourd|actuel|en cours|présent/i
function periodKey(text: string): [number, number] | null {
  const years = (String(text || '').match(/\b(19|20)\d{2}\b/g) || []).map(Number)
  if (!years.length && !ONGOING.test(text)) return null
  const end = ONGOING.test(text) ? Infinity : Math.max(...years)
  return [end, years.length ? Math.min(...years) : end]
}
const later = (a: [number, number], b: [number, number]) => (a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1])
export function isOutOfOrder<X>(list: X[], field: keyof X): boolean {
  const keys = list.map(x => periodKey(String(x?.[field] ?? ''))).filter(Boolean) as [number, number][]
  return keys.some((k, i) => i > 0 && later(k, keys[i - 1]))
}
export function sortByDate<X>(list: X[], field: keyof X): X[] {
  const withKey = list.map((x, i) => ({ x, i, k: periodKey(String(x?.[field] ?? '')) }))
  withKey.sort((a, b) => {
    if (!a.k || !b.k) return a.k ? -1 : b.k ? 1 : a.i - b.i
    return later(a.k, b.k) ? -1 : later(b.k, a.k) ? 1 : a.i - b.i
  })
  return withKey.map(w => w.x)
}

// A real figure (not a year, not an unfilled [X%] placeholder)
export const PLACEHOLDER = /\[[^\]\n]{0,12}\b[XN]\b[^\]\n]{0,12}\]/g
const hasMetric = (s: string) => /\d/.test(String(s || '').replace(PLACEHOLDER, '').replace(/\b(19|20)\d{2}\b/g, ''))
const T = (key: string, params?: Record<string, unknown>): Text => ({ key, params })

export function rules(d: CvData): Rule[] {
  const exp = d.experiences
  const roles = exp.filter(e => e.title || e.company || e.desc)
  const named = exp.filter(e => e.title || e.company)
  const edu = d.education
  const skills = d.skills
  const sum = d.sum || ''
  const words = [sum, ...exp.map(e => e.desc)].filter(Boolean).join(' ').split(/\s+/).length
  const badOrder = [isOutOfOrder(roles, 'period') && 'experience', isOutOfOrder(edu, 'year') && 'education'].filter(Boolean)
  const found = [...new Set(([sum, ...exp.map(e => e.desc)].filter(Boolean).join(' ').match(PLACEHOLDER) || []))]

  return [
    { id: 'name', points: 10, section: 'personal', severity: d.fn && d.ln ? 'pass' : 'error',
      title: T(d.fn && d.ln ? 'Full name present' : 'Full name missing'),
      text: T(d.fn && d.ln ? 'Your name is the first thing a recruiter sees.' : 'Add your first and last name.') },
    { id: 'email', points: 10, section: 'personal', severity: d.email ? 'pass' : 'error',
      title: T(d.email ? 'Email address present' : 'Email address missing'),
      text: T(d.email ? 'Recruiters can contact you directly.' : 'Every CV must have an email address.') },
    { id: 'phone', points: 5, section: 'personal', severity: d.phone ? 'pass' : 'warn',
      title: T(d.phone ? 'Phone number present' : 'Phone number missing'),
      text: T(d.phone ? 'Good. Some recruiters prefer calling.' : 'Adding a phone number increases response rate.') },
    { id: 'title', points: 5, section: 'personal', severity: d.title ? 'pass' : 'warn',
      title: T(d.title ? 'Job title present' : 'Job title missing'),
      text: T(d.title ? 'Clear professional positioning.' : 'Add a job title so recruiters instantly know your level.') },
    { id: 'location', points: 5, section: 'personal', severity: d.loc ? 'pass' : 'warn',
      title: T(d.loc ? 'Location present' : 'Location missing'),
      text: T(d.loc ? 'Recruiters can assess commute or relocation.' : 'Add your city/country. Recruiters filter by location.') },
    { id: 'summary-exists', points: 10, section: 'summary', severity: sum.length > 20 ? 'pass' : 'error',
      title: T(sum.length > 20 ? 'Summary present' : 'Summary missing'),
      text: T(sum.length > 20 ? 'Good opening. Recruiters read this first.' : 'Add a 2–3 sentence professional summary. It’s the first thing read.') },
    { id: 'summary-length', points: 5, section: 'summary',
      severity: !sum.length ? 'error' : sum.length >= 100 && sum.length <= 600 ? 'pass' : 'warn',
      title: T(!sum.length ? 'No summary' : sum.length < 100 ? 'Summary too short' : sum.length > 600 ? 'Summary too long' : 'Summary length is ideal'),
      text: T(!sum.length ? 'Write a summary to improve your score.' : sum.length < 100 ? 'Aim for 2–3 sentences (100–400 characters).' : sum.length > 600 ? 'Keep your summary concise, under 4 sentences. Recruiters skim.' : 'Your summary is the right length.') },
    { id: 'exp-count', points: 15, section: 'experience', severity: named.length ? 'pass' : 'error',
      title: T(named.length ? 'Experience entries present' : 'No experience added'),
      text: named.length ? T(named.length === 1 ? '{n} experience entry found.' : '{n} experience entries found.', { n: named.length }) : T('Add at least one work experience entry.') },
    { id: 'exp-descriptions', points: 10, section: 'experience',
      severity: !roles.length ? 'error' : roles.every(e => e.desc.length > 30) ? 'pass' : 'warn',
      title: T(!roles.length ? 'No experience' : roles.every(e => e.desc.length > 30) ? 'All roles have descriptions' : 'Some roles lack descriptions'),
      text: T(!roles.length ? 'Add experience entries.' : roles.every(e => e.desc.length > 30) ? 'Good. Descriptions help ATS and recruiters.' : 'Add bullet-point descriptions to every role. Describe responsibilities and achievements.') },
    { id: 'exp-metrics', points: 10, section: 'experience',
      severity: !roles.length ? 'error' : roles.some(e => hasMetric(e.desc)) ? 'pass' : 'warn',
      title: T(roles.some(e => hasMetric(e.desc)) ? 'Quantified achievements found' : 'No quantified achievements'),
      text: T(roles.some(e => hasMetric(e.desc)) ? 'Numbers make your CV stand out to recruiters.' : 'Add metrics to your experience: "Grew revenue by 40%", "Managed a team of 8", "Reduced costs by £50K".') },
    { id: 'exp-periods', points: 5, section: 'experience',
      severity: !roles.length ? 'error' : roles.every(e => e.period) ? 'pass' : 'warn',
      title: T(roles.every(e => e.period) ? 'All roles have dates' : 'Some roles missing dates'),
      text: T(roles.every(e => e.period) ? 'Date ranges show career progression clearly.' : 'Add start/end dates to every role. Gaps are noticed by ATS systems.') },
    { id: 'date-order', points: 5, section: badOrder[0] === 'education' ? 'education' : 'experience', severity: badOrder.length ? 'warn' : 'pass',
      title: T(badOrder.length ? (badOrder.length === 2 ? 'Experience and education aren’t in date order' : badOrder[0] === 'experience' ? 'Experience isn’t in date order' : 'Education isn’t in date order') : 'Entries are in date order'),
      text: T(badOrder.length ? 'Put the most recent first. Recruiters and ATS expect reverse-chronological order. Sort it here, or drag entries in the editor.' : 'Most recent first, as recruiters expect.') },
    { id: 'placeholders', points: 10, section: 'experience', severity: found.length ? 'error' : 'pass',
      title: found.length ? T('Placeholders to fill in: {list}', { list: found.slice(0, 4).join(' ') }) : T('No placeholders left'),
      text: T(found.length ? 'Replace these with your real numbers, or delete them. They will print on your CV as they are.' : 'Every figure on your CV is filled in.') },
    { id: 'skills-count', points: 10, section: 'skills', severity: skills.length >= 6 ? 'pass' : skills.length >= 3 ? 'warn' : 'error',
      title: skills.length >= 6 ? T('{n} skills listed', { n: skills.length }) : T(skills.length >= 3 ? 'Too few skills' : 'Skills section empty'),
      text: T(skills.length >= 6 ? 'Good skills coverage for ATS matching.' : skills.length >= 3 ? 'Add at least 6 skills. ATS systems match job keywords against your skills.' : 'Add 6–12 relevant skills. This is critical for ATS filtering.') },
    { id: 'education', points: 10, section: 'education', severity: edu.some(e => e.degree || e.school) ? 'pass' : 'warn',
      title: T(edu.some(e => e.degree || e.school) ? 'Education present' : 'Education section empty'),
      text: T(edu.some(e => e.degree || e.school) ? 'Education history included.' : 'Add your highest qualification. Even if not required, it adds credibility.') },
    { id: 'linkedin', points: 5, section: 'personal', severity: d.li ? 'pass' : 'warn',
      title: T(d.li ? 'LinkedIn URL present' : 'No LinkedIn URL'),
      text: T(d.li ? 'Great. Recruiters will check your profile.' : 'Adding a LinkedIn URL increases recruiter confidence significantly.') },
    { id: 'ats-length', points: 5, severity: words > 50 && words < 1000 ? 'pass' : 'warn',
      title: T(words < 50 ? 'CV content too sparse' : words > 900 ? 'CV may be too long' : 'CV length is good'),
      text: T(words < 50 ? 'Add more detail to your experience and summary. Recruiters want substance.' : words > 900 ? 'Consider trimming. Recruiters spend 6–8 seconds on a first scan. Keep it focused.' : 'Your CV has the right amount of content for a 1–2 page PDF.') },
  ]
}

// Checks the AI can fix from what's already on the CV → the server's FIX_TASKS issue name
export function aiFixFor(id: string, d: CvData): string | null {
  const hasExp = d.experiences.some(e => e.title || e.company)
  const hasText = hasExp || d.sum.length > 20
  switch (id) {
    case 'title': return hasText ? 'title' : null
    case 'summary-exists': case 'summary-length': return hasText ? 'summary' : null
    case 'exp-descriptions': return hasExp ? 'descriptions' : null
    case 'exp-metrics': return d.experiences.some(e => e.desc.length > 20) ? 'metrics' : null
    case 'placeholders': return 'placeholders'
    case 'skills-count': return hasText ? 'skills' : null
    default: return null
  }
}
