// Onboarding answers the AI uses to personalise (also editable in Settings). Labels are i18n keys.
export const INDUSTRIES = [
  { id: 'tech', label: 'Technology' }, { id: 'finance', label: 'Finance' }, { id: 'marketing', label: 'Marketing' },
  { id: 'design', label: 'Design' }, { id: 'healthcare', label: 'Healthcare' }, { id: 'education', label: 'industry|Education' },
  { id: 'legal', label: 'industry|Legal' }, { id: 'engineering', label: 'Engineering' }, { id: 'sales', label: 'Sales' },
  { id: 'hr', label: 'HR' }, { id: 'creative', label: 'Creative' }, { id: 'other', label: 'Other' },
]
export const GOALS = [
  { id: 'internship', label: 'An internship or work-study' }, { id: 'grad', label: 'My first job' }, { id: 'new-job', label: 'A new job' },
  { id: 'switch', label: 'A career change' }, { id: 'promotion', label: 'A promotion' }, { id: 'freelance', label: 'Freelance work' },
  { id: 'update', label: 'Just updating my CV' },
]
export const LEVELS = [
  { id: 'student', label: 'Student', years: '0–1 yr' }, { id: 'junior', label: 'Junior', years: '1–3 yrs' },
  { id: 'mid', label: 'Mid-level', years: '3–7 yrs' }, { id: 'senior', label: 'Senior', years: '7–12 yrs' },
  { id: 'exec', label: 'Executive', years: '12+ yrs' },
]

// How people found CVMaster (asked once, at sign-up)
export const HEARD_FROM = [
  { id: 'friend', label: 'A friend or classmate' }, { id: 'school', label: 'My school or career centre' }, { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' }, { id: 'linkedin', label: 'LinkedIn' }, { id: 'google', label: 'Google' }, { id: 'youtube', label: 'YouTube' },
  { id: 'ai', label: 'ChatGPT or another AI' }, { id: 'other', label: 'Somewhere else' },
]
// A few jobs to tap, by field (they can type their own)
export const ROLE_IDEAS = {
  tech: ['Software developer', 'Data analyst', 'IT support', 'Product manager'], finance: ['Financial analyst', 'Accountant', 'Audit assistant', 'Banking advisor'],
  marketing: ['Marketing assistant', 'Social media manager', 'Content creator', 'Communications officer'], design: ['Graphic designer', 'UX/UI designer', 'Product designer', 'Motion designer'],
  healthcare: ['Nurse', 'Medical assistant', 'Pharmacist', 'Care assistant'], education: ['Teacher', 'Teaching assistant', 'Tutor', 'Education coordinator'],
  legal: ['Legal assistant', 'Paralegal', 'Lawyer', 'Compliance officer'], engineering: ['Mechanical engineer', 'Civil engineer', 'Electrical engineer', 'Project engineer'],
  sales: ['Sales representative', 'Business developer', 'Account manager', 'Customer success'], hr: ['HR assistant', 'Recruiter', 'HR business partner', 'Talent acquisition'],
  creative: ['Video editor', 'Photographer', 'Copywriter', 'Art director'], other: ['Customer service', 'Administrative assistant', 'Project coordinator', 'Operations assistant'],
}
