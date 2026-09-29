<template>
  <div class="view-page">
    <div class="view-inner">
      <div class="page-intro">
        <div>
          <h1>My CVs</h1>
          <p v-if="auth.isLoggedIn">{{ cards.length ? 'Open a CV to edit it, or download and send it.' : 'Your saved CVs will appear here.' }}</p>
          <p v-else>You're using CVMaster as a guest — your CV is saved in this browser.</p>
        </div>
        <button class="btn-primary accent" @click="newCV">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New CV
        </button>
      </div>

      <div v-if="!auth.isLoggedIn && store.hasContent" class="notice info db-guest">
        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span><strong>This CV only lives in this browser.</strong> Create a free account to keep it safe, edit it on any device and export it.</span>
        <button class="btn-primary accent btn-sm" @click="openAuth('register', 'save')">Create account</button>
      </div>

      <div v-if="loading" class="db-grid">
        <div v-for="n in 3" :key="n" class="db-card db-skel"></div>
      </div>

      <div v-else-if="cards.length" class="db-grid">
        <article v-for="c in cards" :key="c.key" class="db-card">
          <button class="db-thumb" @click="open(c)" :aria-label="`Open ${c.title}`">
            <CvThumb :template="c.template" :data="c.data" :fmt="c.data.fmt || {}" />
          </button>
          <div class="db-body">
            <div class="db-title-row">
              <h3 class="db-title" :title="c.title">{{ c.title }}</h3>
              <span v-if="c.paid" class="badge green">Paid</span>
            </div>
            <div class="db-meta">
              <span>{{ templateLabel(c.template) }}</span>
              <span v-if="c.updatedAt">· {{ timeAgo(c.updatedAt) }}</span>
            </div>
            <div class="db-progress" :title="`${progress(c.data)}% complete`">
              <div class="db-progress-bar" :style="{ width: progress(c.data) + '%' }"></div>
            </div>
            <div class="db-actions">
              <button class="btn-secondary btn-sm" @click="open(c)">Open</button>
              <button class="btn-secondary btn-sm" :disabled="busy === c.key" @click="download(c)">
                {{ busy === c.key ? 'Preparing…' : 'Download' }}
              </button>
              <button v-if="c.paid" class="btn-secondary btn-sm" :disabled="busy === c.key + 'send'" @click="resend(c)">
                {{ busy === c.key + 'send' ? 'Sending…' : 'Email again' }}
              </button>
              <button v-if="c.id" class="icon-btn db-del" title="Delete" @click="remove(c)">
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty state -->
      <div v-else class="db-empty card">
        <div class="db-empty-art"><CvThumb template="modern:indigo" :data="SAMPLE_CV" /></div>
        <div class="db-empty-copy">
          <h2>Let's build your CV</h2>
          <p>Pick a layout, tell us about your experience (or import an old CV), tailor it to a job offer, and export a one-page PDF.</p>
          <div class="db-empty-cta">
            <button class="btn-primary accent" @click="router.push('/templates')">Choose a layout</button>
            <button class="btn-secondary" @click="importCv">Import an existing CV</button>
          </div>
          <button class="link-btn db-tour" @click="startTutorial?.()">Take a 1-minute tour</button>
        </div>
      </div>
    </div>

    <WatermarkUnlock
      :visible="showUnlock"
      :clean-token="cleanToken"
      :cv-name="cleanFileName"
      @close="showUnlock = false"
      @unlock="unlockPending"
      @free-download-done="showUnlock = false"
      @show-toast="showToast"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCvStore, hasDraftableContent } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'
import { render, templateLabel, normalizeTemplate } from '../composables/cvRenderer.js'
import { exportDocument } from '../composables/pageFit.js'
import { SAMPLE_CV } from '../composables/sampleCv.js'
import CvThumb from '../components/CvThumb.vue'
import WatermarkUnlock from '../components/WatermarkUnlock.vue'

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path
const store  = useCvStore()
const auth   = useAuthStore()
const router = useRouter()
const confirm        = inject('confirm')
const showToast      = inject('showToast')
const openAuth       = inject('openAuth')
const requireAccount = inject('requireAccount')
const startTutorial  = inject('startTutorial', null)
const openPaywall    = inject('openPaywall')

const drafts   = ref([])
const paidIds  = ref(new Set())
const legacyPaidAll = ref(false)
const loading  = ref(false)
const busy     = ref(null)
const showUnlock    = ref(false)
const cleanToken    = ref('')
const cleanFileName = ref('cv.pdf')

// Cards: the account's drafts, or the guest's browser-saved CV
const cards = computed(() => {
  if (!auth.isLoggedIn) {
    return store.hasContent ? [{ key: 'local', id: null, data: { ...store.data, fmt: store.fmt }, template: store.template, title: titleOf(store.data), updatedAt: null, paid: false }] : []
  }
  return drafts.value.map(d => {
    // The open CV may have newer, not-yet-saved edits — show those
    const live = d.id === store.currentDraftId
    const data = live ? { ...store.data, fmt: store.fmt } : (d.data || {})
    return { key: d.id, id: d.id, data, template: normalizeTemplate(live ? store.template : d.template),
             title: titleOf(data) || d.title || 'Untitled CV', updatedAt: d.updatedAt, paid: legacyPaidAll.value || paidIds.value.has(d.id) }
  }).filter(c => hasDraftableContent(c.data))
})

function titleOf(d) {
  const name = [d?.fn, d?.ln].filter(Boolean).join(' ')
  return name ? (d.title ? `${name} — ${d.title}` : name) : (d?.title || 'Untitled CV')
}

function progress(d = {}) {
  const edu = Array.isArray(d.education) ? d.education : []
  const checks = [
    d.fn && d.ln, d.email, (d.sum || '').length > 40,
    (d.experiences || []).some(e => e.title && e.desc), (d.skills || []).length >= 5, edu.some(e => e.degree || e.school),
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}

function timeAgo(ts) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  const days = Math.floor(s / 86400)
  return days < 30 ? `${days} d ago` : new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

async function loadDrafts() {
  if (!auth.isLoggedIn) { drafts.value = []; return }
  loading.value = !drafts.value.length
  try {
    const [r, p] = await Promise.all([
      fetch(apiUrl('/api/drafts'), { credentials: 'include' }),
      fetch(apiUrl('/api/payment/paid-drafts'), { credentials: 'include' }),
    ])
    if (r.ok) drafts.value = await r.json()
    if (p.ok) { const j = await p.json(); paidIds.value = new Set(j.draftIds || []); legacyPaidAll.value = !!j.legacyAll }
  } catch {}
  loading.value = false
}
onMounted(loadDrafts)
// A payment finished while this page was open (e.g. straight after Stripe): mark it now, then refresh
function onPaid(e) {
  const id = e.detail?.draftId
  if (id) paidIds.value = new Set([...paidIds.value, id])
  loadDrafts()
}
onMounted(() => window.addEventListener('cv-paid', onPaid))
onUnmounted(() => window.removeEventListener('cv-paid', onPaid))
watch(() => auth.isLoggedIn, loadDrafts)
watch(() => store.currentDraftId, (id) => { if (id && !drafts.value.some(d => d.id === id)) loadDrafts() })

function open(c) {
  if (c.id && c.id !== store.currentDraftId) store.loadDraft(drafts.value.find(d => d.id === c.id))
  router.push('/editor')
}

async function newCV() {
  if (!auth.isLoggedIn && store.hasContent) {
    const ok = await confirm({ title: 'Start a new CV?', message: "Your current CV is only saved in this browser, so it will be replaced. Create a free account first if you want to keep both.", ok: 'Start new CV', cancel: 'Keep current', mode: 'warning' })
    if (!ok) return
  }
  store.resetData()
  store.openWizard()
}
function importCv() {
  store.resetData()
  store.openWizard()
  store.setMode('upload')
}

function exportHtml(c) {
  return exportDocument(render(c.template, c.data, c.data.fmt || {}))
}
function fileName(c) {
  const name = [c.data.fn, c.data.ln].filter(Boolean).join(' ') || 'My CV'
  return name.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-CV.pdf'
}

// Paid CVs download clean straight away. Otherwise: free watermarked copy, or unlock
// the clean PDF (£0.99 per CV) through the paywall.
let pendingCard = null
async function download(c) {
  if (!(await requireAccount('download'))) return
  busy.value = c.key
  try {
    const card = c.id ? c : { ...c, data: { ...store.data, fmt: store.fmt }, template: store.template }
    if (c.paid && c.id) {
      const r = await fetch(apiUrl('/api/cv/export-pdf'), {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: c.id, htmlContent: exportHtml(card), fileName: fileName(card) }),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Server error ${r.status}`)
      const url = URL.createObjectURL(await r.blob())
      const a = document.createElement('a')
      a.href = url; a.download = fileName(card)
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      return
    }
    pendingCard = c
    const res = await fetch(apiUrl('/api/cv/store-for-unlock'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ htmlContent: exportHtml(card), fileName: fileName(card) }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(j.error || `Server error ${res.status}`)
    cleanToken.value = j.token
    cleanFileName.value = j.fileName || fileName(card)
    showUnlock.value = true
  } catch (e) {
    showToast('Download failed: ' + e.message)
  } finally {
    busy.value = null
  }
}

// "Clean PDF" in the download pop-up: open that CV in the editor and show the paywall
function unlockPending() {
  showUnlock.value = false
  const c = pendingCard
  if (c?.id && c.id !== store.currentDraftId) store.loadDraft(drafts.value.find(d => d.id === c.id))
  openPaywall()
}

async function resend(c) {
  busy.value = c.key + 'send'
  try {
    const res = await fetch(apiUrl('/api/cv/redownload'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId: c.id, htmlContent: exportHtml(c), fileName: fileName(c) }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(j.error || 'Could not send the email.')
    showToast(`Sent to ${j.sentTo}`)
  } catch (e) {
    showToast(e.message)
  } finally {
    busy.value = null
  }
}

async function remove(c) {
  const ok = await confirm({ title: 'Delete this CV?', message: 'It will be permanently deleted from your account.', ok: 'Delete', cancel: 'Keep it', mode: 'danger' })
  if (!ok) return
  const r = await fetch(apiUrl(`/api/drafts/${c.id}`), { method: 'DELETE', credentials: 'include' })
  if (!r.ok) { showToast('Could not delete this CV.'); return }
  drafts.value = drafts.value.filter(d => d.id !== c.id)
  if (store.currentDraftId === c.id) store.resetData()
}
</script>

<style scoped>
.db-guest{margin-bottom:22px;align-items:center}
.db-guest span{flex:1}
.db-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px}
.db-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;transition:box-shadow .18s}
.db-card:hover{box-shadow:var(--shadow)}
.db-skel{height:380px;background:linear-gradient(90deg,var(--c-surface) 25%,var(--c-surface2) 50%,var(--c-surface) 75%);background-size:200% 100%;animation:skel 1.2s infinite}
@keyframes skel{to{background-position:-200% 0}}
.db-thumb{display:block;border:none;padding:16px 16px 0;background:var(--c-canvas);height:236px;overflow:hidden}
.db-thumb :deep(.cvt){border-radius:3px 3px 0 0;box-shadow:0 1px 3px rgba(17,24,39,.08),0 8px 24px rgba(17,24,39,.08);transition:transform .2s}
.db-thumb:hover :deep(.cvt){transform:translateY(-3px)}
.db-body{padding:14px 16px 16px;border-top:1px solid var(--c-border);display:flex;flex-direction:column;gap:8px}
.db-title-row{display:flex;align-items:center;gap:8px}
.db-title{flex:1;min-width:0;font-size:14.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.db-meta{font-size:12.5px;color:var(--c-text3);display:flex;gap:4px;flex-wrap:wrap}
.db-progress{height:4px;border-radius:4px;background:var(--c-surface2);overflow:hidden}
.db-progress-bar{height:100%;background:var(--c-accent);border-radius:4px}
.db-actions{display:flex;gap:6px;align-items:center;margin-top:4px;flex-wrap:wrap}
.db-del{margin-left:auto;width:30px;height:30px}
.db-del:hover{color:var(--c-rose);background:var(--c-rose-lt)}
.db-del svg{width:16px;height:16px}

.db-empty{display:grid;grid-template-columns:220px 1fr;gap:36px;align-items:center;padding:36px;max-width:820px}
.db-empty-art{transform:rotate(-3deg);border-radius:4px;overflow:hidden;box-shadow:var(--shadow-lg);border:1px solid var(--c-border)}
.db-empty-copy h2{font-size:22px;font-weight:650;letter-spacing:-.015em}
.db-empty-copy p{color:var(--c-text2);margin:8px 0 20px;line-height:1.6}
.db-empty-cta{display:flex;gap:8px;flex-wrap:wrap}
.db-tour{margin-top:16px;font-size:13px}
@media (max-width:640px){ .db-empty{grid-template-columns:1fr;padding:24px} .db-empty-art{width:160px;margin:0 auto} .db-guest{flex-wrap:wrap} }
</style>
