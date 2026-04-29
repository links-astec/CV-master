import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCvStore = defineStore('cv', () => {
  const data = ref({
    fn: 'Alexandra', ln: 'Morrison',
    title: 'Senior Product Manager',
    email: 'a.morrison@email.com',
    phone: '+44 7712 345 678',
    loc: 'London, UK',
    li: 'linkedin.com/in/amorrison',
    website: '',
    photo: null,
    sum: 'Results-driven Product Manager with 8+ years delivering SaaS products used by 2M+ users. Expert in 0→1 product development, cross-functional leadership and data-driven roadmapping.',
    experiences: [
      { id: 1, title: 'Head of Product', company: 'TechFlow Ltd', period: '2021 – Present', desc: 'Led product strategy for flagship B2B analytics suite, growing ARR by £2.4M and reducing churn by 18% through data-driven feature prioritisation.' },
      { id: 2, title: 'Senior Product Manager', company: 'Nexus Digital', period: '2018 – 2021', desc: 'Launched 3 product lines generating £1.1M new revenue. Managed backlog of 200+ stories across 4 squads, shipping quarterly with 97% uptime.' },
    ],
    skills: ['Product Strategy', 'SQL & Analytics', 'Figma', 'Agile / Scrum', 'OKRs & KPIs', 'Stakeholder Mgmt'],
    education: { degree: 'MSc Product Management', school: 'UCL', year: '2016' },
    certifications: ['PSPO II — Scrum Alliance'],
    languages: [{ name: 'English', level: 'Native' }, { name: 'French', level: 'B2' }],
    lang: 'en',
  })

  const template = ref('executive')
  const darkMode = ref(false)
  const wizardOpen = ref(false)
  const wizardMode = ref(null)
  const wizardStep = ref(0)
  const wizardDraftId = ref(null)
  const currentDraftId = ref(null)

  // Persist dark mode
  watch(darkMode, (v) => {
    document.documentElement.setAttribute('data-theme', v ? 'dark' : 'light')
    localStorage.setItem('pcv-dark', v ? '1' : '0')
  })

  function initDarkMode() {
    const saved = localStorage.getItem('pcv-dark')
    darkMode.value = saved === '1'
    document.documentElement.setAttribute('data-theme', darkMode.value ? 'dark' : 'light')
  }

  const fullName = computed(() => `${data.value.fn} ${data.value.ln}`.trim())
  const initials = computed(() => (data.value.fn?.[0] || 'A') + (data.value.ln?.[0] || 'M'))

  function openWizard() { wizardOpen.value = true; wizardMode.value = null; wizardStep.value = 0 }
  function closeWizard() { wizardOpen.value = false }
  function setMode(mode) { wizardMode.value = mode; wizardStep.value = 0 }
  function nextStep() { wizardStep.value++ }
  function prevStep() { if (wizardStep.value > 0) wizardStep.value-- }

  function addExperience() { data.value.experiences.push({ id: Date.now(), title:'', company:'', period:'', desc:'' }) }
  function removeExperience(id) { data.value.experiences = data.value.experiences.filter(e => e.id !== id) }
  function addSkill(s) { if (s && !data.value.skills.includes(s)) data.value.skills.push(s) }
  function removeSkill(s) { data.value.skills = data.value.skills.filter(x => x !== s) }

  async function saveDraft() {
    try {
      const payload = { title: `${fullName.value} — ${data.value.title}`, data: data.value, template: template.value }
      const opts = { method: wizardDraftId.value ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) }
      const url = wizardDraftId.value ? `/api/drafts/${wizardDraftId.value}` : '/api/drafts'
      const r = await fetch(url, opts)
      const draft = await r.json()
      wizardDraftId.value = draft.id
      currentDraftId.value = draft.id
    } catch(e) { console.warn('Draft save failed:', e.message) }
  }

  async function callAi(prompt, model) {
    const r = await fetch('/api/ai/complete', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: model || 'llama-3.3-70b-versatile' }),
    })
    const json = await r.json()
    if (json.error) throw new Error(json.error)
    return json.result
  }

  return {
    data, template, darkMode, wizardOpen, wizardMode, wizardStep, wizardDraftId, currentDraftId,
    fullName, initials,
    initDarkMode, openWizard, closeWizard, setMode, nextStep, prevStep,
    addExperience, removeExperience, addSkill, removeSkill, saveDraft, callAi,
  }
})