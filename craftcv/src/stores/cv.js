import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// Empty starting state — users fill in their own info
const emptyData = () => ({
  fn: '', ln: '',
  title: '',
  email: '', phone: '', loc: '', li: '', website: '',
  photo: null,
  sum: '',
  experiences: [
    { id: 1, title: '', company: '', period: '', desc: '' },
  ],
  skills: [],
  education: { degree: '', school: '', year: '' },
  certifications: [],
  languages: [],
  lang: 'en',
})

export const useCvStore = defineStore('cv', () => {
  const data    = ref(emptyData())
  const template    = ref('executive')
  const darkMode    = ref(false)
  const wizardOpen  = ref(false)
  const wizardMode  = ref(null)
  const wizardStep  = ref(0)
  const wizardDraftId   = ref(null)
  const currentDraftId  = ref(null)

  watch(darkMode, (v) => {
    document.documentElement.setAttribute('data-theme', v ? 'dark' : 'light')
    localStorage.setItem('pcv-dark', v ? '1' : '0')
  })

  // Persist CV data & template so they survive page reloads (e.g. Stripe redirect)
  watch(data, (v) => {
    try { localStorage.setItem('pcv-draft', JSON.stringify(v)) } catch {}
  }, { deep: true })
  watch(template, (v) => {
    try { localStorage.setItem('pcv-template', v) } catch {}
  })

  // Restore on store creation
  try {
    const saved = localStorage.getItem('pcv-draft')
    if (saved) data.value = { ...emptyData(), ...JSON.parse(saved) }
    const savedTpl = localStorage.getItem('pcv-template')
    if (savedTpl) template.value = savedTpl
  } catch {}

  function initDarkMode() {
    const saved = localStorage.getItem('pcv-dark')
    darkMode.value = saved === '1'
    document.documentElement.setAttribute('data-theme', darkMode.value ? 'dark' : 'light')
  }

  const fullName = computed(() => `${data.value.fn} ${data.value.ln}`.trim() || 'Your Name')
  const initials = computed(() => {
    const f = data.value.fn?.[0] || 'Y'
    const l = data.value.ln?.[0] || 'N'
    return f + l
  })

  function openWizard(preserveStep = false) {
    wizardOpen.value = true
    if (!preserveStep) {
      wizardMode.value = null
      wizardStep.value = 0
    }
  }

  function openWizardAtStep(step) {
    wizardOpen.value = true
    if (!wizardMode.value) wizardMode.value = 'manual'
    wizardStep.value = step
  }

  function closeWizard() { wizardOpen.value = false }
  function setMode(mode) { wizardMode.value = mode; wizardStep.value = 0 }
  function nextStep() { wizardStep.value++ }
  function prevStep() { if (wizardStep.value > 0) wizardStep.value-- }

  function addExperience() {
    data.value.experiences.push({ id: Date.now(), title: '', company: '', period: '', desc: '' })
  }
  function removeExperience(id) {
    data.value.experiences = data.value.experiences.filter(e => e.id !== id)
  }
  function addSkill(s) {
    if (s && !data.value.skills.includes(s)) data.value.skills.push(s)
  }
  function removeSkill(s) {
    data.value.skills = data.value.skills.filter(x => x !== s)
  }

  function resetData() {
    data.value = emptyData()
    wizardDraftId.value = null
    currentDraftId.value = null
  }

  async function saveDraft() {
    try {
      const name = fullName.value
      const payload = {
        title: `${name}${data.value.title ? ' — ' + data.value.title : ''}`,
        data: data.value,
        template: template.value,
      }
      const method = wizardDraftId.value ? 'PUT' : 'POST'
      const url = wizardDraftId.value ? `/api/drafts/${wizardDraftId.value}` : '/api/drafts'
      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const draft = await r.json()
      wizardDraftId.value = draft.id
      currentDraftId.value = draft.id
    } catch (e) { console.warn('Draft save failed:', e.message) }
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
    data, template, darkMode, wizardOpen, wizardMode, wizardStep,
    wizardDraftId, currentDraftId,
    fullName, initials,
    initDarkMode, openWizard, openWizardAtStep, closeWizard,
    setMode, nextStep, prevStep,
    addExperience, removeExperience, addSkill, removeSkill,
    resetData, saveDraft, callAi,
  }
})