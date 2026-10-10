import type { CvData } from '@/lib/cv'

export const SECTIONS = ['personal', 'summary', 'experience', 'education', 'skills', 'languages', 'projects', 'certifications'] as const
export type Section = (typeof SECTIONS)[number]

// Titles are the website's own labels, so they're already translated in every language
export const SECTION_TITLE: Record<Section, string> = {
  personal: 'Personal Information', summary: 'Professional Summary', experience: 'Work Experience', education: 'Education',
  skills: 'Skills', languages: 'Languages', projects: 'Projects', certifications: 'Certifications',
}

// One line under each section on the CV overview
export function summaryOf(s: Section, d: CvData): string {
  switch (s) {
    case 'personal': return [[d.fn, d.ln].filter(Boolean).join(' '), d.title].filter(Boolean).join(' · ')
    case 'summary': return d.sum.trim().slice(0, 80)
    case 'experience': return d.experiences.filter(e => e.title || e.company).map(e => e.title || e.company).join(', ')
    case 'education': return d.education.filter(e => e.degree || e.school).map(e => e.degree || e.school).join(', ')
    case 'skills': return d.skills.join(', ')
    case 'languages': return d.languages.map(l => l.name).filter(Boolean).join(', ')
    case 'projects': return d.projects.map(p => p.name).filter(Boolean).join(', ')
    case 'certifications': return d.certifications.join(', ')
  }
}

export const isSection = (s: unknown): s is Section => SECTIONS.includes(s as Section)
