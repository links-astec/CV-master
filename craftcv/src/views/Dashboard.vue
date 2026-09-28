<template>
  <div class="view-page">
    <div class="filter-row">
      <button
        v-for="t in tabs" :key="t.id"
        class="filter-tab" :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id"
      >
        {{ t.label }}
        <span class="f-count">{{ t.count }}</span>
      </button>
    </div>

    <div v-if="loading" class="dash-empty">
      <div class="dash-spinner"></div>
      <p>Loading your CVs...</p>
    </div>

    <div v-else-if="filteredDrafts.length === 0" class="dash-empty">
      <div class="dash-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
      </div>
      <div class="dash-empty-title">{{ activeTab === 'all' ? 'No CVs yet' : `No ${activeTab} CVs` }}</div>
      <p class="dash-empty-sub">{{ activeTab === 'all' ? 'Create your first CV to get started.' : `You have no ${activeTab} CVs right now.` }}</p>
      <button class="btn-primary accent" @click="newCV()" style="margin-top:16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:13px;height:13px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create your first CV
      </button>
    </div>

    <div v-else class="cards-grid">
      <div
        v-for="(draft, i) in filteredDrafts" :key="draft.id"
        class="proj-card anim-up"
        :style="{ animationDelay: `${i * 0.06}s` }"
        @click="openDraft(draft)"
      >
        <div class="card-icon" :style="{ background: cardColor(i) }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
        </div>
        <div class="card-ttl">{{ draft.title || 'Untitled CV' }}</div>
        <div class="card-meta">{{ draft.template || 'executive' }} template · {{ timeAgo(draft.updatedAt) }}</div>

        <div v-if="paidDraftIds.has(draft.id)" class="paid-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:10px;height:10px;"><polyline points="20 6 9 17 4 12"/></svg>
          Paid
        </div>

        <div class="card-sep"></div>
        <div class="card-foot">
          <span class="draft-status" :class="statusClass(draft)">{{ statusLabel(draft) }}</span>
          <div class="card-actions">

            <!-- Re-send email (paid CVs) -->
            <button
              v-if="paidDraftIds.has(draft.id)"
              class="card-action-btn paid-action"
              :class="{ 'is-loading': resendingId === draft.id }"
              title="Re-send PDF to your email (already paid)"
              @click.stop="resendCv(draft)"
            >
              <svg v-if="resendingId !== draft.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;" class="spin-icon"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            </button>

            <!-- Download button — opens choice modal -->
            <button
              class="card-action-btn"
              :class="{ 'is-loading': preparingId === draft.id }"
              title="Download CV"
              @click.stop="openDownloadChoice(draft)"
            >
              <svg v-if="preparingId !== draft.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;" class="spin-icon"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            </button>

            <!-- Edit -->
            <button class="card-action-btn" @click.stop="openDraft(draft)" title="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>

            <!-- Delete -->
            <button class="card-action-btn danger" @click.stop="deleteDraft(draft.id)" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
        <div class="prog-track">
          <div class="prog-fill" :style="{ width: progress(draft) + '%', background: accentColor(i) }"></div>
        </div>
      </div>

      <!-- New CV card -->
      <div class="proj-card new-card anim-up" :style="{ animationDelay: `${filteredDrafts.length * 0.06}s` }" @click="newCV()">
        <div class="new-card-inner">
          <div class="new-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div class="new-card-label">Create new CV</div>
        </div>
      </div>
    </div>

    <!-- Download choice modal — shown when user clicks download -->
    <WatermarkUnlock
      :visible="showUnlock"
      :clean-token="cleanToken"
      :cv-name="cleanFileName"
      :html-content="pendingHtml"
      @close="showUnlock = false"
      @free-download-done="showUnlock = false"
      @show-toast="toast"
    />

    <!-- Toast -->
    <Transition name="toast-fade">
      <div v-if="toastMsg" class="dash-toast">{{ toastMsg }}</div>
    </Transition>
  </div>
</template>

<script setup>
const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path
import { ref, computed, onMounted, onActivated, watch, inject } from 'vue'
import { useCvStore }    from '../stores/cv.js'
import { useAuthStore }  from '../stores/auth.js'
import { useCvRenderer } from '../composables/cvRenderer.js'
import WatermarkUnlock   from '../components/WatermarkUnlock.vue'

const store      = useCvStore()
const auth       = useAuthStore()
const confirm    = inject('confirm')
const { render } = useCvRenderer()

const drafts        = ref([])
const loading       = ref(true)
const activeTab     = ref('all')
const showUnlock    = ref(false)
const cleanToken    = ref('')
const cleanFileName = ref('cv.pdf')
const pendingHtml   = ref('')      // rendered HTML passed to the modal
const preparingId   = ref(null)    // which card is rendering (spinner)
const resendingId   = ref(null)
const paidDraftIds  = ref(new Set())
const toastMsg      = ref('')
let toastTimer      = null

const COLORS  = ['#e8eefb','#f0ebfa','#fce9eb','#e6f5f4','#fdf0dc','#e6f5ed']
const ACCENTS = ['#2a5bd7','#6236b0','#c52b3d','#0d7a72','#b56a0e','#1a7a4a']
const cardColor   = (i) => COLORS[i % COLORS.length]
const accentColor = (i) => ACCENTS[i % ACCENTS.length]

function newCV() { store.resetData(); store.openWizard() }

function toast(msg) {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 3500)
}

const tabs = computed(() => [
  { id: 'all',    label: 'All',       count: drafts.value.length },
  { id: 'active', label: 'Active',    count: drafts.value.filter(d => progress(d) > 0 && progress(d) < 100).length },
  { id: 'drafts', label: 'Drafts',    count: drafts.value.filter(d => progress(d) === 0).length },
  { id: 'done',   label: 'Completed', count: drafts.value.filter(d => progress(d) === 100).length },
])

const filteredDrafts = computed(() => {
  if (activeTab.value === 'active') return drafts.value.filter(d => progress(d) > 0 && progress(d) < 100)
  if (activeTab.value === 'drafts') return drafts.value.filter(d => progress(d) === 0)
  if (activeTab.value === 'done')   return drafts.value.filter(d => progress(d) === 100)
  return drafts.value
})

function progress(draft) {
  const d = draft.data || {}
  const education = Array.isArray(d.education) ? d.education : (d.education ? [d.education] : [])
  let s = 0
  if (d.fn || d.ln) s += 20
  if (d.sum && d.sum.length > 20) s += 20
  if (d.experiences?.some(e => e.title || e.company || e.desc)) s += 20
  if (d.skills?.length >= 3) s += 20
  if (education.some(e => e.degree || e.school)) s += 20
  return s
}

function statusLabel(draft) {
  const p = progress(draft)
  if (p === 100) return 'Complete'
  if (p === 0)   return 'Draft'
  return 'In progress'
}

function statusClass(draft) {
  const p = progress(draft)
  if (p === 100) return 'status-done'
  if (p === 0)   return 'status-draft'
  return 'status-active'
}

function timeAgo(ts) {
  if (!ts) return 'just now'
  const d = Date.now() - new Date(ts).getTime()
  if (d < 60000)    return 'just now'
  if (d < 3600000)  return `${Math.floor(d/60000)}m ago`
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`
  return `${Math.floor(d/86400000)}d ago`
}

// Normalise older drafts where education was a plain object not an array
function normaliseDraftData(data) {
  if (!data) return data
  const d = { ...data }
  if (d.education && !Array.isArray(d.education)) d.education = [d.education]
  if (!d.education || d.education.length === 0)   d.education = [{ degree: '', school: '', year: '' }]
  if (!Array.isArray(d.experiences) || d.experiences.length === 0)
    d.experiences = [{ id: Date.now(), title: '', company: '', period: '', desc: '' }]
  return d
}

async function loadDrafts() {
  loading.value = true
  try {
    const r = await fetch(apiUrl('/api/drafts'),  { credentials: 'include' })
    if (r.ok) {
      const list = await r.json()
      drafts.value = list
      checkPaidStatus(list)
    } else if (r.status === 401) {
      setTimeout(async () => {
        try {
          const r2 = await fetch(apiUrl('/api/drafts'),  { credentials: 'include' })
          if (r2.ok) { const list = await r2.json(); drafts.value = list; checkPaidStatus(list) }
        } catch {}
        loading.value = false
      }, 1000)
      return
    }
  } catch {}
  loading.value = false
}

// £1.99 unlocks one draft; only those drafts get the free "Re-send" button
async function checkPaidStatus(draftList) {
  try {
    const r = await fetch(apiUrl('/api/payment/paid-drafts'),  { credentials: 'include' })
    if (r.ok) {
      const { draftIds, legacyAll } = await r.json()
      // legacyAll: paid before per-draft tracking existed — that payment covered every CV
      paidDraftIds.value = new Set(legacyAll ? draftList.map(d => d.id) : draftIds)
    }
  } catch {}
}

watch(() => auth.user, (user) => {
  if (user && drafts.value.length === 0 && !loading.value) loadDrafts()
})

function openDraft(draft) {
  store.currentDraftId = draft.id
  store.wizardDraftId  = draft.id
  const normData = normaliseDraftData(draft.data)
  if (normData) {
    // Assign scalar fields directly
    const scalars = ['fn','ln','title','email','phone','loc','li','website','photo','sum','lang']
    scalars.forEach(k => { if (normData[k] !== undefined) store.data[k] = normData[k] })
    // Per-CV fields — reset rather than inherit them from whichever CV was open before
    store.data.jobOffer    = normData.jobOffer    || ''
    store.data.skillLevels = normData.skillLevels || {}
    // Replace arrays entirely — never use Object.assign for arrays (corrupts multi-entry)
    if (Array.isArray(normData.education))      store.data.education      = normData.education
    if (Array.isArray(normData.experiences))    store.data.experiences    = normData.experiences
    if (Array.isArray(normData.skills))         store.data.skills         = normData.skills
    if (Array.isArray(normData.projects))       store.data.projects       = normData.projects
    if (Array.isArray(normData.certifications)) store.data.certifications = normData.certifications
    if (Array.isArray(normData.languages))      store.data.languages      = normData.languages
  }
  if (draft.template) store.template = draft.template
  store.openWizard()
}

async function deleteDraft(id) {
  const ok = confirm
    ? await confirm({ title:'Delete CV?', message:'This draft will be permanently deleted.', ok:'Delete', cancel:'Keep it', mode:'danger' })
    : window.confirm('Delete this CV?')
  if (!ok) return
  const r = await fetch(apiUrl(`/api/drafts/${id}`),  { method: 'DELETE', credentials: 'include' })
  if (!r.ok) return
  drafts.value = drafts.value.filter(d => d.id !== id)
  if (store.currentDraftId === id) store.resetData()
}

// ── Open download choice modal ────────────────────────────────────────────────
// Renders the CV HTML locally (fast, no network), then opens the modal
// which lets the user choose: free watermarked download OR pay €0.50 for clean.
// Renders a saved draft to a full HTML document without touching the editor's state
function draftHtml(draft) {
  const data   = normaliseDraftData(draft.data) || {}
  const cvHtml = render(draft.template || 'executive', data, store.fmt)
  const name   = `${data.fn || 'My'} ${data.ln || 'CV'}`.trim()
  const fileName = name.replace(/[^a-zA-Z0-9\s-]/g,'').trim().replace(/\s+/g,'-') + '-CV.pdf'
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>CV</title>
<style>*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
html,body{background:#fff;width:700px;margin:0;padding:0;}
@page{margin:0;}</style>
</head><body>${cvHtml}</body></html>`
  return { html, cvHtml, fileName }
}

// ── Open download choice modal ────────────────────────────────────────────────
// Renders the CV HTML locally, stores it server-side (which starts rendering both
// PDFs), then lets the user choose: free watermarked download OR €0.50 clean copy.
async function openDownloadChoice(draft) {
  preparingId.value = draft.id
  const { html, cvHtml, fileName } = draftHtml(draft)
  if (!cvHtml || cvHtml.length < 100) {
    toast('Failed to render CV. Please open the CV in the builder first.')
    preparingId.value = null
    return
  }

  try {
    const res = await fetch(apiUrl('/api/cv/store-for-unlock'),  {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ htmlContent: html, fileName }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Server error ${res.status}`)
    }
    const { token, fileName: respName } = await res.json()
    cleanToken.value    = token
    cleanFileName.value = respName || fileName
  } catch (e) {
    toast('Download failed: ' + e.message)
    preparingId.value = null
    return
  }

  preparingId.value = null
  pendingHtml.value = html
  showUnlock.value  = true
}

// ── Re-send a paid CV (free for drafts already paid for) ─────────────────────
async function resendCv(draft) {
  resendingId.value = draft.id
  const { html, fileName } = draftHtml(draft)
  try {
    const res = await fetch(apiUrl('/api/cv/redownload'),  {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ draftId: draft.id, htmlContent: html, fileName }),
    })
    if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Re-send failed')
    const data = await res.json()
    toast(`✓ CV re-sent to ${data.sentTo}`)
  } catch (e) {
    toast('Re-send failed: ' + e.message)
  } finally {
    resendingId.value = null
  }
}

onMounted(loadDrafts)
onActivated(loadDrafts)
</script>

<style scoped>
.dash-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;text-align:center;color:var(--c-text2);}
.dash-spinner{width:32px;height:32px;border:3px solid var(--c-border);border-top-color:var(--c-accent);border-radius:50%;animation:spin .8s linear infinite;margin-bottom:16px;}
@keyframes spin   {to{transform:rotate(360deg)}}
@keyframes spinbtn{to{transform:rotate(360deg)}}
.dash-empty-icon{width:56px;height:56px;background:var(--c-bg);border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.dash-empty-icon svg{width:28px;height:28px;color:var(--c-text3);}
.dash-empty-title{font-size:16px;font-weight:700;color:var(--c-text);margin-bottom:6px;}
.dash-empty-sub{font-size:13px;color:var(--c-text3);max-width:260px;}
.paid-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:var(--c-green);background:var(--c-green-lt);padding:2px 7px;border-radius:20px;margin-top:4px;margin-bottom:-2px;}
.card-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;color:var(--c-text2);}
.draft-status{font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:.03em;}
.status-draft {background:var(--c-bg);      color:var(--c-text3);}
.status-active{background:var(--c-amber-lt); color:var(--c-amber);}
.status-done  {background:var(--c-green-lt); color:var(--c-green);}
.card-actions{display:flex;gap:4px;}
.card-action-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--c-border);background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--c-text3);transition:all .14s;}
.card-action-btn:hover        {background:var(--c-bg);color:var(--c-text);}
.card-action-btn.danger:hover {background:var(--c-rose-lt);color:var(--c-rose);border-color:var(--c-rose-lt);}
.card-action-btn.paid-action  {border-color:var(--c-green);color:var(--c-green);}
.card-action-btn.paid-action:hover{background:var(--c-green-lt);}
.card-action-btn.is-loading   {opacity:.5;cursor:not-allowed;}
.spin-icon{animation:spinbtn .7s linear infinite;}
.new-card{border:2px dashed var(--c-border)!important;cursor:pointer;}
.new-card:hover{border-color:var(--c-accent)!important;}
.new-card-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;min-height:140px;}
.new-card-icon{width:40px;height:40px;border-radius:50%;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
.new-card-icon svg{width:18px;height:18px;color:var(--c-accent);}
.new-card-label{font-size:13px;font-weight:600;color:var(--c-text2);}
.dash-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--c-text);color:var(--c-bg);padding:10px 20px;border-radius:24px;font-size:13px;font-weight:600;z-index:9999;white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,.2);}
.toast-fade-enter-active,.toast-fade-leave-active{transition:opacity .25s,transform .25s;}
.toast-fade-enter-from,.toast-fade-leave-to{opacity:0;transform:translateX(-50%) translateY(8px);}
</style>