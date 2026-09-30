import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './auth.js'
import { DEFAULT_TEMPLATE, normalizeTemplate, FONTS } from '../composables/cvRenderer.js'

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path

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
  jobOffer: '',        // job description the CV is being tailored to (optional)
  jobTailored: '',     // Job match step 2 for this offer: '' | 'applied' | 'skipped'
  checkIgnored: [],    // checklist warnings the user chose to ignore for this CV
  shrinkToFit: false,  // user accepted shrinking an over-long CV onto one page
})

const defaultFmt = () => ({
  fontFamily:     'DM Sans',
  fontSize:       'normal',
  lineSpacing:    'normal',
  sectionSpacing: 'normal',
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

export function hasDraftableContent(d) {
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

// Saved data (localStorage or a server draft) → a complete, well-formed CV object
function normaliseData(saved) {
  const merged = { ...emptyData(), ...(saved && typeof saved === 'object' ? saved : {}) }
  delete merged.fmt
  for (const k of ['skills', 'certifications', 'languages', 'projects']) {
    if (!Array.isArray(merged[k])) merged[k] = []
  }
  if (!Array.isArray(merged.experiences) || !merged.experiences.length) merged.experiences = emptyData().experiences
  // Legacy single-object education → array
  if (!Array.isArray(merged.education)) {
    merged.education = merged.education && typeof merged.education === 'object' ? [merged.education] : []
  }
  if (!merged.education.length) merged.education = emptyData().education
  merged.jobOffer    = typeof merged.jobOffer === 'string' ? merged.jobOffer : ''
  merged.shrinkToFit = !!merged.shrinkToFit
  merged.jobTailored = ['applied', 'skipped'].includes(merged.jobTailored) ? merged.jobTailored : ''
  merged.checkIgnored = Array.isArray(merged.checkIgnored) ? merged.checkIgnored.filter(x => typeof x === 'string') : []
  return merged
}

function normaliseFmt(f) {
  const out = { ...defaultFmt(), ...(f && typeof f === 'object' ? f : {}) }
  if (!FONTS.some(x => x.id === out.fontFamily)) out.fontFamily = 'DM Sans'
  delete out.skillStyle; delete out.showSkillPct
  return out
}

export const useCvStore = defineStore('cv', () => {
  const auth = useAuthStore()

  const data           = ref(normaliseData(safeParse(lsGet('pcv-draft'))))
  const template       = ref(normalizeTemplate(lsGet('pcv-template') || DEFAULT_TEMPLATE))
  const fmt            = ref(normaliseFmt(safeParse(lsGet('pcv-fmt'))))
  const darkMode       = ref(false)
  const wizardOpen     = ref(false)
  const wizardMode     = ref(null)
  const wizardStep     = ref(0)
  const wizardDraftId  = ref(null)
  const currentDraftId = ref(null)
  const lastSavedAt    = ref(null)

  // ── Persist on change — localStorage immediately, account debounced ─────────
  let saveTimer = null
  let savePromise = null
  function scheduleSave(delay = 1500) {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (currentDraftId.value || hasDraftableContent(data.value)) saveDraft().catch(() => {})
    }, delay)
  }
  watch(data, (v) => {
    const clone = plainClone(v)
    if (clone) lsSet('pcv-draft', JSON.stringify(clone))
    scheduleSave()
  }, { deep: true, flush: 'post' })
  watch(template, (v) => { lsSet('pcv-template', v); scheduleSave(800) }, { flush: 'post' })
  watch(fmt, (v) => { lsSet('pcv-fmt', JSON.stringify(v)); scheduleSave(800) }, { deep: true, flush: 'post' })

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
  const initials = computed(() => ((data.value.fn?.[0] || '') + (data.value.ln?.[0] || '')).toUpperCase())
  const hasContent = computed(() => hasDraftableContent(data.value))

  function openWizard(preserveStep = false) {
    wizardOpen.value = true
    if (!preserveStep) { wizardMode.value = null; wizardStep.value = 0 }
  }
  // step is an index into the manual steps; narrate/upload have one extra step in front
  function openWizardAtStep(step) {
    wizardOpen.value = true
    if (!wizardMode.value) wizardMode.value = 'manual'
    wizardStep.value = step + (wizardMode.value === 'manual' ? 0 : 1)
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
    const v = String(s || '').trim()
    if (v && !data.value.skills.some(x => x.toLowerCase() === v.toLowerCase())) data.value.skills.push(v)
  }
  function removeSkill(s) {
    data.value.skills = data.value.skills.filter(x => x !== s)
  }

  // New, empty CV. Keeps the chosen template and formatting.
  function resetData() {
    data.value = emptyData()
    wizardDraftId.value  = null
    currentDraftId.value = null
    lsSet('pcv-draft', '')
  }

  // Open a saved draft (from the account) in the editor
  function loadDraft(draft) {
    if (!draft) return
    currentDraftId.value = draft.id || null
    wizardDraftId.value  = draft.id || null
    data.value     = normaliseData(draft.data)
    template.value = normalizeTemplate(draft.template)
    if (draft.data?.fmt) fmt.value = normaliseFmt(draft.data.fmt)
  }

  // Safe way to apply extracted data from upload/narrate without crashing reactivity
  function applyExtracted(ext) {
    if (!ext || typeof ext !== 'object') return
    const d = data.value
    for (const k of ['fn', 'ln', 'title', 'email', 'phone', 'loc', 'li', 'website', 'sum']) {
      if (ext[k] && typeof ext[k] === 'string') d[k] = ext[k]
    }
    if (Array.isArray(ext.skills) && ext.skills.length) {
      d.skills = ext.skills.filter(s => typeof s === 'string' && s.trim()).map(s => s.trim()).slice(0, 30)
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
      const list = Array.isArray(ext.education) ? ext.education : (typeof ext.education === 'object' ? [ext.education] : [])
      d.education = list
        .filter(e => e && typeof e === 'object')
        .map(e => ({
          degree: typeof e.degree === 'string' ? e.degree : '',
          school: typeof e.school === 'string' ? e.school : '',
          year:   typeof e.year   === 'string' ? e.year   : '',
        }))
        .slice(0, 5)
      if (!d.education.length) d.education = [{ degree: '', school: '', year: '' }]
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

  // Saves to the account. Guests have no account yet — their CV lives in this
  // browser until they sign up (App.vue then saves it as their first draft).
  async function saveDraft() {
    if (!auth.isLoggedIn) return false
    if (savePromise) return savePromise
    savePromise = (async () => {
      if (!currentDraftId.value && !hasDraftableContent(data.value)) return false
      const name = fullName.value
      const payload = {
        title: `${name}${data.value.title ? ' — ' + data.value.title : ''}`,
        data: plainClone({ ...data.value, fmt: fmt.value }),
        template: template.value,
      }
      const draftId = currentDraftId.value || wizardDraftId.value
      const method  = draftId ? 'PUT' : 'POST'
      const url     = apiUrl(draftId ? `/api/drafts/${draftId}` : '/api/drafts')
      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (r.status === 404 && draftId) {
        // Draft was deleted elsewhere — save this CV as a new one
        currentDraftId.value = null; wizardDraftId.value = null
        savePromise = null
        return saveDraft()
      }
      if (!r.ok) return false
      const draft = await r.json()
      // Outside any render cycle here (after an await), so set ids directly —
      // callers such as checkout need the id as soon as this resolves.
      if (!wizardDraftId.value)  wizardDraftId.value  = draft.id
      if (!currentDraftId.value) currentDraftId.value = draft.id
      lastSavedAt.value = Date.now()
      return draft.id
    })().catch((e) => {
      console.warn('Draft save failed:', e.message)
      return false
    }).finally(() => {
      savePromise = null
    })
    return savePromise
  }

  // Saves now (if there is anything to save) and returns the draft id, or null.
  async function ensureSavedDraftId() {
    await saveDraft()
    return currentDraftId.value || wizardDraftId.value || null
  }

  async function callAi(prompt) {
    const r = await fetch(apiUrl('/api/ai/complete'),  {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }), // model is chosen server-side
    })
    const json = await r.json().catch(() => ({}))
    if (!r.ok || json.error) throw new Error(json.error || 'AI request failed.')
    return json.result
  }

  return {
    data, template, fmt, darkMode, wizardOpen, wizardMode, wizardStep,
    wizardDraftId, currentDraftId, lastSavedAt,
    fullName, initials, hasContent,
    initDarkMode, openWizard, openWizardAtStep, closeWizard,
    setMode, nextStep, prevStep,
    addExperience, removeExperience, addSkill, removeSkill,
    resetData, loadDraft, applyExtracted, saveDraft, ensureSavedDraftId, callAi,
  }
})
