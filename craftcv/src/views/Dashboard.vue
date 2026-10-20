<template>
  <div class="view-page">
    <div class="view-inner">
      <div class="page-intro">
        <div>
          <h1>{{ $t('My CVs') }}</h1>
          <p v-if="auth.isLoggedIn">{{ $t(cards.length ? 'Open a CV to edit it, or download and send it.' : 'Your saved CVs will appear here.') }}</p>
          <p v-else>{{ $t('You’re using CVMaster as a guest. Your CV is saved in this browser.') }}</p>
        </div>
        <button class="btn-primary accent" @click="newCV()">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {{ $t('New CV') }}
        </button>
      </div>

      <!-- Job Hunt Pass holders: their pass, and the fastest next step -->
      <div v-if="auth.user?.pass" class="db-pass">
        <div class="db-pass-card"><PassCard size="sm" :tilt="false" :name="auth.user?.name || ''" :plan="auth.user.pass.plan" /></div>
        <div class="db-pass-txt"><b>{{ $t('Your Job Hunt Pass is on') }}</b><span>{{ $t('Every CV here is unlocked. Download or email any of them, as often as you like.') }}</span></div>
        <button class="btn-primary accent btn-sm db-pass-go" @click="checkAts">{{ $t('Tailor a CV to a new job') }}</button>
      </div>

      <!-- The two features people miss: telling their story, and checking against a job (ATS) -->
      <div class="db-feats">
        <button class="db-feat" @click="newCV('narrate')">
          <span class="db-feat-ic"><svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></span>
          <span class="db-feat-txt"><b>{{ $t('Tell your story') }}</b><span>{{ $t('Speak or type about your career. AI writes your CV from it.') }}</span></span>
          <svg class="db-feat-go" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="db-feat" @click="checkAts">
          <span class="db-feat-ic"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></span>
          <span class="db-feat-txt"><b>{{ $t('Check your ATS score') }}</b><span>{{ $t(cards.length ? 'Paste a job offer and see how well your CV matches it.' : 'Paste a job offer and build a CV that matches it.') }}</span></span>
          <svg class="db-feat-go" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div v-if="!auth.isLoggedIn && store.hasContent" class="notice info db-guest">
        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span><strong>{{ $t('This CV only lives in this browser.') }}</strong> {{ $t('Create a free account to keep it safe, edit it on any device and export it.') }}</span>
        <button class="btn-primary accent btn-sm" @click="openAuth('register', 'save')">{{ $t('Create account') }}</button>
      </div>

      <!-- The user's next step (from their CV and, if they allow it, what they've done so far) -->
      <div v-if="next" class="db-next card">
        <div class="db-next-txt">
          <div class="db-next-k">{{ $t('Your next step') }}</div>
          <div class="db-next-t">{{ $t(next.title) }}</div>
          <p>{{ $t(next.body) }}</p>
        </div>
        <button class="btn-primary accent btn-sm" @click="doNext">{{ $t(NEXT_LABEL[next.action] || 'Continue') }}</button>
      </div>

      <div v-if="loading" class="db-grid">
        <div v-for="n in 3" :key="n" class="db-card db-skel"></div>
      </div>

      <div v-else-if="cards.length" class="db-grid">
        <article v-for="(c, i) in cards" :key="c.key" class="db-card" :style="{ '--i': i }">
          <button class="db-thumb" @click="open(c)" :aria-label="$t('Open {title}', { title: c.title })">
            <CvThumb :template="c.template" :data="c.data" :fmt="c.data.fmt || {}" />
          </button>
          <div class="db-body">
            <div class="db-title-row">
              <h3 class="db-title" :title="c.title">{{ c.title }}</h3>
              <span v-if="c.paid" class="badge green">{{ $t('Paid') }}</span>
            </div>
            <div class="db-meta">
              <span>{{ templateLabel(c.template) }}</span>
              <span v-if="c.updatedAt">· {{ timeAgo(c.updatedAt) }}</span>
            </div>
            <div v-if="progress(c.data) < 100" class="db-prog">
              <div class="db-progress"><div class="db-progress-bar" :style="{ width: progress(c.data) + '%' }"></div></div>
              <span>{{ $t('{n}% complete', { n: progress(c.data) }) }}</span>
            </div>
            <div class="db-actions">
              <button class="btn-secondary btn-sm" @click="open(c)">{{ $t('Open') }}</button>
              <button class="btn-secondary btn-sm" :disabled="busy === c.key" @click="download(c)">
                {{ $t(busy === c.key ? 'Preparing…' : 'Download') }}
              </button>
              <button v-if="c.paid" class="btn-secondary btn-sm" :disabled="busy === c.key + 'send'" @click="resend(c)">
                {{ $t(busy === c.key + 'send' ? 'Sending…' : 'Email again') }}
              </button>
              <button v-if="c.id" class="icon-btn db-del" :title="$t('Delete')" @click="remove(c)">
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- Now and then: ask for a rating (only people with a CV a few days old who haven't reviewed) -->
      <div v-if="askReview" v-show="reviewShown" class="db-review card">
        <ReviewPrompt compact only-if-new @shown="reviewShown = true" />
        <button class="link-btn db-review-later" @click="laterReview">{{ $t('Not now') }}</button>
      </div>

      <!-- Empty state: only when there are no CVs -->
      <div v-if="!loading && !cards.length" class="db-empty card">
        <div class="db-empty-art"><CvThumb template="modern:indigo" :data="sampleCv()" /></div>
        <div class="db-empty-copy">
          <h2>{{ $t('Let’s build your CV') }}</h2>
          <p>{{ $t('Pick a layout, tell us about your experience (or import an old CV), tailor it to a job offer, and export a one-page PDF.') }}</p>
          <div class="db-empty-cta">
            <button class="btn-primary accent" @click="router.push('/templates')">{{ $t('Choose a layout') }}</button>
            <button class="btn-secondary" @click="importCv">{{ $t('Import an existing CV') }}</button>
          </div>
          <button class="link-btn db-tour" @click="startTutorial?.()">{{ $t('Take a 1-minute tour') }}</button>
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
import { templateLabel, normalizeTemplate } from '../composables/cvRenderer.js'
import { sampleCv } from '../composables/sampleCv.js'
import CvThumb from '../components/CvThumb.vue'
import WatermarkUnlock from '../components/WatermarkUnlock.vue'
import ReviewPrompt from '../components/ReviewPrompt.vue'
import PassCard from '../components/PassCard.vue'
import { t, locale } from '../i18n/index.js'

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
    // The open CV may have newer, not-yet-saved edits, show those
    const live = d.id === store.currentDraftId
    const data = live ? { ...store.data, fmt: store.fmt } : (d.data || {})
    return { key: d.id, id: d.id, data, template: normalizeTemplate(live ? store.template : d.template),
             title: titleOf(data) || d.title || t('Untitled CV'), updatedAt: d.updatedAt, paid: legacyPaidAll.value || paidIds.value.has(d.id) }
  }).filter(c => hasDraftableContent(c.data))
})

// Review card: CVs at least 3 days old, not dismissed in the last 30 days
const REVIEW_LATER = 'cvmaster-review-later'
const reviewShown = ref(false)
const reviewLaterAt = ref((() => { try { return Number(localStorage.getItem(REVIEW_LATER)) || 0 } catch { return 0 } })())
const askReview = computed(() => auth.isLoggedIn && Date.now() - reviewLaterAt.value > 30 * 864e5 &&
  drafts.value.some(d => d.createdAt && Date.now() - new Date(d.createdAt).getTime() > 3 * 864e5))
function laterReview() {
  reviewLaterAt.value = Date.now()
  try { localStorage.setItem(REVIEW_LATER, String(reviewLaterAt.value)) } catch {}
}

function titleOf(d) {
  const name = [d?.fn, d?.ln].filter(Boolean).join(' ')
  return name ? (d.title ? `${name} · ${d.title}` : name) : (d?.title || t('Untitled CV'))
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
  if (s < 60) return t('just now')
  if (s < 3600) return t('{n} min ago', { n: Math.floor(s / 60) })
  if (s < 86400) return t('{n} h ago', { n: Math.floor(s / 3600) })
  const days = Math.floor(s / 86400)
  return days < 30 ? t('{n} d ago', { n: days }) : new Date(ts).toLocaleDateString(locale(), { day: 'numeric', month: 'short' })
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

// ── Next step ────────────────────────────────────────────────────────────────
const next = ref(null)
const NEXT_LABEL = { new: 'Start', edit: 'Continue', job: 'Match to a job', export: 'Get my PDF' }
async function loadNext() {
  if (!auth.isLoggedIn) { next.value = null; return }
  try { const r = await fetch(apiUrl('/api/me/next'), { credentials: 'include' }); next.value = r.ok ? await r.json() : null } catch {}
}
function doNext() {
  const n = next.value
  if (!n) return
  if (n.action === 'new') return newCV()
  const d = drafts.value.find(x => x.id === n.draftId)
  if (d && d.id !== store.currentDraftId) store.loadDraft(d)
  router.push({ path: '/editor', query: n.action === 'job' ? { tab: 'job' } : {} })
  if (n.action === 'export') setTimeout(() => openPaywall(), 300)
}
onMounted(loadNext)
watch(() => auth.isLoggedIn, loadNext)

function open(c) {
  if (c.id && c.id !== store.currentDraftId) store.loadDraft(drafts.value.find(d => d.id === c.id))
  router.push('/editor')
}

// mode: 'narrate' opens "Tell your story" straight after the job offer screen
async function newCV(mode = null) {
  if (!auth.isLoggedIn && store.hasContent) {
    const ok = await confirm({ title: t('Start a new CV?'), message: t('Your current CV is only saved in this browser, so it will be replaced. Create a free account first if you want to keep both.'), ok: t('Start new CV'), cancel: t('Keep current'), mode: 'warning' })
    if (!ok) return
  }
  store.resetData()
  store.openWizard(false, { mode })
}
// The latest CV, straight to Job match (job offer and ATS score); without a CV, a new one built for a job
function checkAts() {
  const c = cards.value[0]
  if (!c) return newCV()
  if (c.id && c.id !== store.currentDraftId) store.loadDraft(drafts.value.find(d => d.id === c.id))
  router.push({ path: '/editor', query: { tab: 'job' } })
}
function importCv() {
  store.resetData()
  store.openWizard(false, { mode: 'upload' })
}

function fileName(c) {
  const name = [c.data.fn, c.data.ln].filter(Boolean).join(' ') || 'My CV'
  return name.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-CV.pdf'
}

// Paid CVs download clean straight away. Otherwise: free watermarked copy, or unlock
// the clean PDF (€0.99 per CV) through the paywall.
let pendingCard = null
async function download(c) {
  if (!(await requireAccount('download'))) return
  busy.value = c.key
  try {
    // PDFs are built on the server from the saved CV. Save the open one's latest edits first
    if (!c.id || c.id === store.currentDraftId) await store.saveDraft()
    const draftId = c.id || store.currentDraftId
    if (!draftId) throw new Error('Save your CV first.')
    const card = c.id ? c : { ...c, data: { ...store.data, fmt: store.fmt }, template: store.template }
    if (c.paid && c.id) {
      const r = await fetch(apiUrl('/api/cv/export-pdf'), {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId }),
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
      body: JSON.stringify({ draftId }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(j.error || `Server error ${res.status}`)
    cleanToken.value = j.token
    cleanFileName.value = j.fileName || fileName(card)
    showUnlock.value = true
  } catch (e) {
    showToast(t('Download failed: {e}', { e: t(e.message) }))
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
    if (c.id === store.currentDraftId) await store.saveDraft()
    const res = await fetch(apiUrl('/api/cv/redownload'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId: c.id }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(j.error || 'Could not send the email.')
    showToast(t('Sent to {email}', { email: j.sentTo }))
  } catch (e) {
    showToast(e.message)
  } finally {
    busy.value = null
  }
}

async function remove(c) {
  const ok = await confirm({ title: t('Delete this CV?'), message: t('It will be permanently deleted from your account.'), ok: t('Delete'), cancel: t('Keep it'), mode: 'danger' })
  if (!ok) return
  const r = await fetch(apiUrl(`/api/drafts/${c.id}`), { method: 'DELETE', credentials: 'include' })
  if (!r.ok) { showToast('Could not delete this CV.'); return }
  drafts.value = drafts.value.filter(d => d.id !== c.id)
  if (store.currentDraftId === c.id) store.resetData()
}
</script>

<style scoped>
.db-guest{margin-bottom:22px;align-items:center}
.db-next{display:flex;align-items:center;gap:20px;margin-bottom:28px;padding:22px 26px;border:none;border-radius:24px;box-shadow:none;background:var(--c-surface)}
.db-next-txt{flex:1;min-width:0}
.db-next-k{font-size:13px;font-weight:600;letter-spacing:-.005em;color:var(--c-text3)}
.db-next-t{font-size:18px;font-weight:700;letter-spacing:-.025em;color:var(--c-text);margin-top:3px}
.db-next p{font-size:14px;color:var(--c-text2);line-height:1.5;margin-top:3px}
@media (max-width:560px){ .db-next{flex-direction:column;align-items:stretch} }
.db-pass{display:flex;align-items:center;gap:20px;padding:16px 20px 16px 16px;border-radius:24px;background:var(--c-surface);box-shadow:var(--shadow-sm);margin-bottom:12px}
.db-pass-card{width:116px;flex-shrink:0}
.db-pass-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.db-pass-txt b{font-size:16px;font-weight:650;letter-spacing:-.015em;color:var(--c-text)}
.db-pass-txt span{font-size:14px;color:var(--c-text2);line-height:1.45}
@media (max-width:640px){ .db-pass{flex-wrap:wrap} .db-pass-card{width:96px} .db-pass-go{width:100%} }
.db-feats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px}
.db-feat{display:flex;align-items:center;gap:14px;padding:16px 18px;border:none;border-radius:20px;background:var(--c-surface);box-shadow:var(--shadow-xs);text-align:left;font:inherit;color:var(--c-text);cursor:pointer;transition:transform .15s,box-shadow .15s}
.db-feat:hover{transform:translateY(-1px);box-shadow:var(--shadow-sm,0 4px 14px rgba(20,20,43,.08))}
.db-feat:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px}
.db-feat-ic{width:42px;height:42px;flex-shrink:0;border-radius:13px;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center}
.db-feat-ic svg{width:21px;height:21px;fill:none;stroke:var(--c-accent);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.db-feat-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.db-feat-txt b{font-size:15px;font-weight:650}
.db-feat-txt span{font-size:13px;color:var(--c-text2);line-height:1.45}
.db-feat-go{width:16px;height:16px;flex-shrink:0;fill:none;stroke:var(--c-text3);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
@media (max-width:640px){ .db-feats{grid-template-columns:1fr} }
.db-review{position:relative;margin-top:28px;padding:22px 24px;border:none;border-radius:24px}
.db-review :deep(.rv){border:none;padding:0;background:none}
.db-review-later{position:absolute;top:14px;right:16px;font-size:12.5px}
.db-guest span{flex:1}
.db-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px}
.db-card{background:var(--c-surface);border:none;border-radius:24px;overflow:hidden;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;transition:transform .45s var(--ease),box-shadow .45s var(--ease)}
.db-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
/* the cards rise in one after another, like the homepage */
.db-card{animation:dbIn .7s var(--ease) backwards;animation-delay:calc(var(--i,0) * 70ms + 80ms)}
.db-next{animation:dbIn .7s var(--ease) backwards}
@keyframes dbIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){ .db-card,.db-next{animation:none} }
.db-skel{height:390px;border-radius:24px;background:linear-gradient(90deg,var(--c-surface) 25%,var(--c-surface2) 50%,var(--c-surface) 75%);background-size:200% 100%;animation:skel 1.2s infinite}
@keyframes skel{to{background-position:-200% 0}}
.db-thumb{display:block;border:none;padding:26px 28px 0;background:color-mix(in srgb,var(--c-text) 4%,var(--c-surface));height:250px;overflow:hidden;position:relative;-webkit-mask-image:linear-gradient(180deg,#000 78%,transparent);mask-image:linear-gradient(180deg,#000 78%,transparent)}
.db-thumb :deep(.cvt){border-radius:4px 4px 0 0;box-shadow:0 1px 2px rgba(20,20,43,.05),0 12px 30px rgba(20,20,43,.10);transition:transform .45s var(--ease)}
.db-card:hover .db-thumb :deep(.cvt){transform:translateY(-3px)}
.db-body{padding:16px 22px 20px;display:flex;flex-direction:column;gap:10px}
.db-title-row{display:flex;align-items:center;gap:8px}
.db-title{flex:1;min-width:0;font-size:16.5px;font-weight:700;letter-spacing:-.025em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.db-meta{font-size:13px;color:var(--c-text3);display:flex;gap:4px;flex-wrap:wrap;margin-top:-4px}
.db-prog{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--c-text3);font-weight:500}
.db-progress{flex:1;height:4px;border-radius:99px;background:color-mix(in srgb,var(--c-text) 7%,transparent);overflow:hidden}
.db-progress-bar{height:100%;background:linear-gradient(90deg,#4338CA,#8B85FF);border-radius:99px}
.db-actions{display:flex;gap:6px;align-items:center;margin-top:4px;flex-wrap:wrap}
.db-del{margin-left:auto;width:30px;height:30px}
.db-del:hover{color:var(--c-rose);background:var(--c-rose-lt)}
.db-del svg{width:16px;height:16px}

.db-empty{display:grid;grid-template-columns:220px 1fr;gap:44px;align-items:center;padding:44px;max-width:860px;border:none;border-radius:28px}
.db-empty-art{transform:rotate(-3deg);border-radius:4px;overflow:hidden;box-shadow:0 2px 6px rgba(20,20,43,.05),0 24px 60px rgba(20,20,43,.16)}
.db-empty-copy h2{font-size:30px;font-weight:800;letter-spacing:-.035em;line-height:1.1}
.db-empty-copy p{color:var(--c-text2);margin:8px 0 20px;line-height:1.6}
.db-empty-cta{display:flex;gap:8px;flex-wrap:wrap}
.db-tour{margin-top:16px;font-size:13px}
@media (max-width:640px){ .db-empty{grid-template-columns:1fr;padding:24px} .db-empty-art{width:160px;margin:0 auto} .db-guest{flex-wrap:wrap} }
</style>
