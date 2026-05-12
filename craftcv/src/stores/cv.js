import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

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
  education: [{ degree: '', school: '', year: '' }],
  projects: [],
  certifications: [],
  languages: [],
  lang: 'en',
})

// Safe localStorage helpers
function lsGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, val) } catch {}
}

// Safely parse JSON — return null on any error
function safeParse(str) {
  try { return str ? JSON.parse(str) : null } catch { return null }
}

// Deep clone via JSON to strip any non-plain objects
function plainClone(obj) {
  try { return JSON.parse(JSON.stringify(obj)) } catch { return null }
}

function hasDraftableContent(d) {
  if (!d || typeof d !== 'object') return false
  return Boolean(
    d.fn || d.ln || d.title || d.email || d.phone || d.loc || d.li || d.website || d.photo || d.sum ||
    d.skills?.length ||
    d.projects?.some(p => p?.name || p?.desc || p?.tech || p?.url) ||
    d.certifications?.length ||
    d.languages?.some(l => l?.name || l?.level) ||
    d.experiences?.some(e => e?.title || e?.company || e?.period || e?.desc) ||
    (Array.isArray(d.education)
      ? d.education.some(e => e?.degree || e?.school || e?.year)
      : (d.education?.degree || d.education?.school || d.education?.year))
  )
}

export const useCvStore = defineStore('cv', () => {
  const data           = ref(emptyData())
  const template       = ref('executive')
  const darkMode       = ref(false)
  const wizardOpen     = ref(false)
  const wizardMode     = ref(null)
  const wizardStep     = ref(0)
  const wizardDraftId  = ref(null)
  const currentDraftId = ref(null)

  // ── Restore persisted data on load ──────────────────────────────────────────
  const savedData = safeParse(lsGet('pcv-draft'))
  if (savedData && typeof savedData === 'object') {
    // Merge carefully — keep emptyData structure, overlay saved values
    const merged = { ...emptyData(), ...savedData }
    // Ensure arrays are plain arrays
    if (!Array.isArray(merged.experiences))    merged.experiences = emptyData().experiences
    if (!Array.isArray(merged.skills))          merged.skills = []
    if (!Array.isArray(merged.certifications))  merged.certifications = []
    if (!Array.isArray(merged.languages))       merged.languages = []
    if (!Array.isArray(merged.projects))        merged.projects = []
    // Migrate legacy single-object education to array
    if (!Array.isArray(merged.education)) {
      if (merged.education && typeof merged.education === 'object') {
        merged.education = [merged.education]
      } else {
        merged.education = emptyData().education
      }
    }
    data.value = merged
  }
  const savedTpl = lsGet('pcv-template')
  if (savedTpl) template.value = savedTpl

  // ── Persist on change — localStorage immediately, DB debounced ────────────
  let saveTimer = null
  let savePromise = null
  watch(data, (v) => {
    // Always save to localStorage immediately
    const clone = plainClone(v)
    if (clone) lsSet('pcv-draft', JSON.stringify(clone))
    // Debounce DB save — only if user is logged in and has a draft
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (hasDraftableContent(v)) saveDraft().catch(() => {})
    }, 1500)
  }, { deep: true })

  watch(template, (v) => {
    lsSet('pcv-template', v)
    // Save to DB when template changes
    if (currentDraftId.value || hasDraftableContent(data.value)) {
      setTimeout(() => saveDraft().catch(() => {}), 500)
    }
  })

  watch(darkMode, (v) => {
    document.documentElement.setAttribute('data-theme', v ? 'dark' : 'light')
    lsSet('pcv-dark', v ? '1' : '0')
  })

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function initDarkMode() {
    darkMode.value = lsGet('pcv-dark') === '1'
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
    if (!preserveStep) { wizardMode.value = null; wizardStep.value = 0 }
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
    wizardDraftId.value  = null
    currentDraftId.value = null
    lsSet('pcv-draft', '')
    lsSet('pcv-template', 'executive')
    template.value = 'executive'
  }

  // Safe way to apply extracted data from upload/narrate without crashing reactivity
  function applyExtracted(ext) {
    if (!ext || typeof ext !== 'object') return
    const d = data.value
    if (ext.fn    && typeof ext.fn    === 'string') d.fn    = ext.fn
    if (ext.ln    && typeof ext.ln    === 'string') d.ln    = ext.ln
    if (ext.title && typeof ext.title === 'string') d.title = ext.title
    if (ext.email && typeof ext.email === 'string') d.email = ext.email
    if (ext.phone && typeof ext.phone === 'string') d.phone = ext.phone
    if (ext.loc   && typeof ext.loc   === 'string') d.loc   = ext.loc
    if (ext.li    && typeof ext.li    === 'string') d.li    = ext.li
    if (ext.website && typeof ext.website === 'string') d.website = ext.website
    if (ext.sum   && typeof ext.sum   === 'string') d.sum   = ext.sum
    if (Array.isArray(ext.skills) && ext.skills.length) {
      d.skills = ext.skills.filter(s => typeof s === 'string').slice(0, 20)
    }
    if (Array.isArray(ext.experiences) && ext.experiences.length) {
      d.experiences = ext.experiences
        .filter(e => e && typeof e === 'object')
        .map((e, i) => ({
          id: Date.now() + i,
          title:   typeof e.title   === 'string' ? e.title   : '',
          company: typeof e.company === 'string' ? e.company : '',
          period:  typeof e.period  === 'string' ? e.period  : '',
          desc:    typeof e.desc    === 'string' ? e.desc    : '',
        }))
        .slice(0, 10)
    }
    if (ext.education) {
      if (Array.isArray(ext.education)) {
        d.education = ext.education
          .filter(e => e && typeof e === 'object')
          .map(e => ({
            degree: typeof e.degree === 'string' ? e.degree : '',
            school: typeof e.school === 'string' ? e.school : '',
            year:   typeof e.year   === 'string' ? e.year   : '',
          }))
          .slice(0, 5)
        if (d.education.length === 0) d.education = [{ degree: '', school: '', year: '' }]
      } else if (typeof ext.education === 'object') {
        d.education = [{
          degree: typeof ext.education.degree === 'string' ? ext.education.degree : '',
          school: typeof ext.education.school === 'string' ? ext.education.school : '',
          year:   typeof ext.education.year   === 'string' ? ext.education.year   : '',
        }]
      }
    }
    if (Array.isArray(ext.projects) && ext.projects.length) {
      d.projects = ext.projects
        .filter(p => p && typeof p === 'object')
        .map((p, i) => ({
          id:    Date.now() + i,
          name:  typeof p.name  === 'string' ? p.name  : '',
          desc:  typeof p.desc  === 'string' ? p.desc  : '',
          url:   typeof p.url   === 'string' ? p.url   : '',
          tech:  typeof p.tech  === 'string' ? p.tech  : '',
        }))
        .slice(0, 8)
    }
    if (Array.isArray(ext.certifications)) {
      d.certifications = ext.certifications.filter(c => typeof c === 'string').slice(0, 10)
    }
    if (Array.isArray(ext.languages)) {
      d.languages = ext.languages
        .filter(l => l && typeof l === 'object')
        .map(l => ({ name: String(l.name || ''), level: String(l.level || '') }))
        .slice(0, 6)
    }
  }

  async function saveDraft() {
    if (savePromise) return savePromise
    savePromise = (async () => {
      if (!hasDraftableContent(data.value)) return false
      const name = fullName.value
      const payload = {
        title: `${name}${data.value.title ? ' — ' + data.value.title : ''}`,
        data: plainClone(data.value),
        template: template.value,
      }
      const draftId = currentDraftId.value || wizardDraftId.value
      const method  = draftId ? 'PUT' : 'POST'
      const url     = draftId ? `/api/drafts/${draftId}` : '/api/drafts'
      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!r.ok) return false
      const draft = await r.json()
      if (!wizardDraftId.value)  wizardDraftId.value  = draft.id
      if (!currentDraftId.value) currentDraftId.value = draft.id
      return true
    })().catch((e) => {
      console.warn('Draft save failed:', e.message)
      return false
    }).finally(() => {
      savePromise = null
    })
    return savePromise
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
    resetData, applyExtracted, saveDraft, callAi,
  }
})
