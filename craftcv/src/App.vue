<template>
  <!-- Maintenance -->
  <div v-if="maintenance" class="maint">
    <div class="maint-box">
      <BrandLogo />
      <h1>We'll be right back</h1>
      <p>CVMaster is being updated. Your CVs are safe — please check again in a few minutes.</p>
      <button class="btn-secondary" @click="checkMaintenance">Check again</button>
    </div>
  </div>

  <LandingPage v-else-if="showLanding" :signed-in="auth.isLoggedIn" @start="startBuilding" @sign-in="openAuth('signin')" />

  <div v-else-if="ready" class="shell">
    <!-- Sidebar -->
    <div class="sb-dim" :class="{ on: navOpen }" @click="navOpen = false"></div>
    <aside class="sb" :class="{ open: navOpen }">
      <button type="button" class="sb-brand" title="CVMaster home" @click="navOpen = false; showHome()"><BrandLogo /></button>

      <button class="btn-primary accent btn-block sb-new" data-tour="new-cv" @click="newCV">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New CV
      </button>

      <nav class="sb-nav">
        <RouterLink v-for="n in NAV" :key="n.to" :to="n.to" class="sb-link" :data-tour="`nav-${n.id}`"
                    :class="{ active: route.path === n.to }" @click="navOpen = false">
          <svg viewBox="0 0 24 24" v-html="n.icon"></svg>
          {{ n.label }}
        </RouterLink>
      </nav>

      <div class="sb-foot">
        <div v-if="!auth.isLoggedIn" class="sb-guest">
          <div class="sb-guest-ttl">You're using CVMaster as a guest</div>
          <p>Your CV is saved in this browser. Create a free account to keep it safe and export it.</p>
          <button class="btn-primary accent btn-block btn-sm" @click="openAuth('register')">Create free account</button>
          <button class="btn-ghost btn-block btn-sm" @click="openAuth('signin')">Sign in</button>
        </div>
        <RouterLink v-else to="/settings" class="sb-user" @click="navOpen = false">
          <span class="sb-ava">{{ auth.user?.avatar || auth.user?.name?.[0] || 'U' }}</span>
          <span class="sb-user-txt">
            <span class="sb-user-name">{{ auth.user?.name }}</span>
            <span class="sb-user-mail">{{ auth.user?.email }}</span>
          </span>
        </RouterLink>
        <div class="sb-legal">
          <button type="button" @click="navOpen = false; openFeedback()">Feedback</button>
          <span>·</span>
          <RouterLink to="/privacy" @click="navOpen = false">Privacy</RouterLink>
          <span>·</span>
          <RouterLink to="/terms" @click="navOpen = false">Terms</RouterLink>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main">
      <header class="top">
        <button class="icon-btn show-mobile" @click="navOpen = true" aria-label="Menu">
          <svg viewBox="0 0 24 24"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
        </button>
        <div class="top-title">{{ route.meta.title || 'CVMaster' }}</div>
        <div class="top-actions">
          <NotificationDropdown v-if="auth.isLoggedIn" />
          <button class="icon-btn" @click="store.darkMode = !store.darkMode" :title="store.darkMode ? 'Light mode' : 'Dark mode'">
            <svg v-if="store.darkMode" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg v-else viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>
          </button>
          <button v-if="!auth.isLoggedIn" class="btn-secondary btn-sm hide-mobile" @click="openAuth('signin')">Sign in</button>
        </div>
      </header>
      <!-- Email accounts that haven't confirmed yet -->
      <div v-if="auth.isLoggedIn && auth.user && auth.user.emailVerified === false && !verifyHidden" class="verify-bar">
        <span>Confirm your email to unlock <strong>30 AI requests a day</strong> — we sent a link to {{ auth.user.email }}.</span>
        <button class="btn-secondary btn-sm" :disabled="verifySending" @click="resendVerification">{{ verifySent ? 'Sent ✓' : verifySending ? 'Sending…' : 'Resend email' }}</button>
        <button class="verify-x" aria-label="Hide" @click="verifyHidden = true">×</button>
      </div>
      <main class="content" :class="{ full: route.meta.full }">
        <RouterView />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav class="bnav show-mobile">
      <RouterLink to="/" class="bnav-btn" :class="{ active: route.path === '/' }">
        <svg viewBox="0 0 24 24" v-html="NAV[0].icon"></svg>My CVs
      </RouterLink>
      <RouterLink to="/templates" class="bnav-btn" :class="{ active: route.path === '/templates' }">
        <svg viewBox="0 0 24 24" v-html="NAV[1].icon"></svg>Templates
      </RouterLink>
      <button class="bnav-fab" @click="newCV" aria-label="New CV">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <RouterLink to="/editor" class="bnav-btn" :class="{ active: route.path === '/editor' }">
        <svg viewBox="0 0 24 24" v-html="NAV[2].icon"></svg>Editor
      </RouterLink>
      <RouterLink to="/settings" class="bnav-btn" :class="{ active: route.path === '/settings' }">
        <svg viewBox="0 0 24 24" v-html="NAV[3].icon"></svg>Settings
      </RouterLink>
    </nav>
  </div>

  <div v-else class="boot"><span class="boot-spin"></span></div>

  <WizardModal @open-builder="router.push('/editor')" @pay="openPaywall" />
  <PaywallModal ref="paywallRef" :show="showPaywall" @close="showPaywall = false" />
  <AuthModal v-if="authState.open" :initial-view="authState.view" :reason="authState.reason" @done="onAuthDone" @close="onAuthClose" />
  <OnboardingModal v-if="showOnboarding" @done="onboardingDismissed = true" />
  <ConfirmModal ref="confirmRef" />
  <FeedbackModal ref="feedbackRef" />
  <AiLimitModal ref="aiLimitRef" />
  <TutorialOverlay :visible="showTutorial" @close="showTutorial = false" />

  <div class="toast-wrap">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast">{{ t.msg }}</div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, provide, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useCvStore } from './stores/cv.js'
import { useNotifStore } from './stores/notifications.js'
import LandingPage from './views/Landing.vue'
import AuthModal from './components/auth/AuthModal.vue'
import OnboardingModal from './components/auth/OnboardingModal.vue'
import WizardModal from './components/WizardModal.vue'
import PaywallModal from './components/PaywallModal.vue'
import NotificationDropdown from './components/NotificationDropdown.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import FeedbackModal from './components/FeedbackModal.vue'
import AiLimitModal from './components/AiLimitModal.vue'
import TutorialOverlay from './components/TutorialOverlay.vue'
import BrandLogo from './components/BrandLogo.vue'

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path
const lsGet = (k) => { try { return localStorage.getItem(k) } catch { return null } }
const lsSet = (k, v) => { try { localStorage.setItem(k, v) } catch {} }

const auth   = useAuthStore()
const store  = useCvStore()
const notif  = useNotifStore()
const router = useRouter()
const route  = useRoute()

const NAV = [
  { id: 'home',      to: '/',          label: 'My CVs',    icon: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>' },
  { id: 'templates', to: '/templates', label: 'Templates', icon: '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>' },
  { id: 'editor',    to: '/editor',    label: 'Editor',    icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>' },
  { id: 'settings',  to: '/settings',  label: 'Settings',  icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>' },
]

const ready        = ref(false)
const maintenance  = ref(false)
const showLanding  = ref(false)
const navOpen      = ref(false)
const showPaywall  = ref(false)
const showTutorial = ref(false)
const paywallRef   = ref(null)
const confirmRef   = ref(null)
const toasts       = ref([])

// ── Toasts & shared helpers ───────────────────────────────────────────────────
function showToast(msg, ms = 3800) {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, msg })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, ms)
}
function openPaywall() { showPaywall.value = true }
provide('showToast', showToast)
provide('openPaywall', openPaywall)
provide('confirm', (...args) => confirmRef.value?.ask(...args))
provide('startTutorial', () => { showTutorial.value = true })
// Feedback & complaints pop-up — openFeedback('complaint') opens on that type
const feedbackRef = ref(null)
function openFeedback(kind) { feedbackRef.value?.show(kind) }
provide('openFeedback', openFeedback)

// ── Email confirmation ────────────────────────────────────────────────────────
const verifyHidden  = ref(false)
const verifySending = ref(false)
const verifySent    = ref(false)
async function resendVerification() {
  verifySending.value = true
  try {
    const r = await fetch(apiUrl('/api/auth/resend-verification'), { method: 'POST', credentials: 'include' })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error)
    if (j.alreadyVerified) { await auth.fetchMe(); showToast('Your email is already confirmed.') }
    else { verifySent.value = true; showToast('Sent — check your inbox (and spam).') }
  } catch (e) { showToast(e.message || 'Could not send the email.') }
  verifySending.value = false
}
provide('resendVerification', resendVerification)
// The link in the email opens cvmaster.live/?verify=…
async function confirmEmail(token) {
  window.history.replaceState({}, '', '/')
  try {
    const r = await fetch(apiUrl('/api/auth/verify-email'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error)
    if (auth.user) auth.user.emailVerified = true
    showToast('Email confirmed — you now get 30 AI requests a day.')
  } catch (e) { showToast(e.message || 'Could not confirm your email.') }
}

// The homepage (Landing) — reachable from the sidebar logo and after signing out
function showHome() { showLanding.value = true }
provide('showHome', showHome)

// AI allowance: any AI call refused for the daily limit opens the "get more" pop-up.
// Watching fetch here means every AI feature gets this without its own handling.
const aiLimitRef = ref(null)
provide('openAiAllowance', () => aiLimitRef.value?.show('info'))
if (!window.__aiLimitWatch) {
  window.__aiLimitWatch = true
  const _fetch = window.fetch.bind(window)
  window.fetch = async (...args) => {
    const res = await _fetch(...args)
    if (res.status === 429) {
      const url = String(args[0]?.url || args[0] || '')
      if (url.includes('/api/ai/') || url.includes('/api/cv/upload')) {
        res.clone().json().then(j => { if (j?.code === 'AI_LIMIT') aiLimitRef.value?.show('limit') }).catch(() => {})
      }
    }
    return res
  }
}

// Back from buying an AI pack: confirm it and add the credits
async function handleAiPackReturn() {
  const sessionId = new URLSearchParams(window.location.search).get('ai_pack')
  if (!sessionId) return
  window.history.replaceState({}, '', '/')
  try {
    const r = await fetch(apiUrl('/api/payment/ai-pack/verify'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error)
    showToast(`100 AI requests added — you now have ${j.credits} extra.`)
  } catch (e) {
    showToast(e.message || 'We couldn’t confirm your payment — contact us if you were charged.')
  }
}
provide('fmt', computed(() => store.fmt))

// ── Auth modal (sign in / create account) ─────────────────────────────────────
// Guests can do everything except export; requireAccount() asks them to sign up
// at that moment and resolves true once they're signed in.
const authState = reactive({ open: false, view: 'register', reason: '' })
let authResolve = null
function openAuth(view = 'signin', reason = '') {
  authState.view = view; authState.reason = reason; authState.open = true
  return new Promise(r => { authResolve = r })
}
function onAuthClose() {
  authState.open = false
  authResolve?.(false); authResolve = null
}
async function onAuthDone() {
  const hadReason = !!authState.reason
  authState.open = false
  showLanding.value = false
  lsSet('pcv-started', '1')
  if (hadReason) onboardingDismissed.value = true // don't interrupt an export with onboarding
  await afterSignIn()
  authResolve?.(true); authResolve = null
}
provide('openAuth', openAuth)
provide('requireAccount', (reason) => auth.isLoggedIn ? Promise.resolve(true) : openAuth('register', reason))

// Onboarding (industry / goal / experience) is optional context for the AI
const onboardingDismissed = ref(false)
const showOnboarding = computed(() => ready.value && auth.isLoggedIn && !auth.isOnboarded && !onboardingDismissed.value && !authState.open)

// Guest → account: keep the CV they built as their first saved draft
async function afterSignIn() {
  notif.fetch()
  if (store.hasContent && !store.currentDraftId) {
    const id = await store.saveDraft()
    if (id) showToast('Your CV is now saved to your account.')
  } else if (!store.hasContent) {
    await restoreLatestDraft()
  }
}

async function restoreLatestDraft() {
  try {
    const r = await fetch(apiUrl('/api/drafts'), { credentials: 'include' })
    if (!r.ok) return
    const drafts = await r.json()
    if (!drafts.length) return
    const latest = [...drafts].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0]
    if (latest?.data) store.loadDraft(latest)
  } catch {}
}

// ── New CV ────────────────────────────────────────────────────────────────────
async function newCV() {
  navOpen.value = false
  if (!auth.isLoggedIn && store.hasContent) {
    const ok = await confirmRef.value?.ask({
      title: 'Start a new CV?',
      message: "Your current CV is only saved in this browser, so it will be replaced. Create a free account first if you want to keep both.",
      ok: 'Start new CV', cancel: 'Keep current', mode: 'warning',
    })
    if (!ok) return
  }
  store.resetData()
  store.openWizard()
}

// Landing → app
function startBuilding() {
  lsSet('pcv-started', '1')
  showLanding.value = false
  router.push(auth.isLoggedIn ? '/' : '/templates')   // signed in → My CVs
}

// ── Maintenance ───────────────────────────────────────────────────────────────
async function checkMaintenance() {
  try {
    const r = await fetch(apiUrl('/api/health'), { credentials: 'include' })
    const d = await r.json().catch(() => ({}))
    maintenance.value = r.status === 503 || !!d.maintenance
  } catch { maintenance.value = false }
}

// ── Returning from Stripe ─────────────────────────────────────────────────────
function handleStripeReturn() {
  const params    = new URLSearchParams(window.location.search)
  const sessionId = params.get('session') || params.get('session_id')
  if (!sessionId) return
  const draftId   = params.get('draft')

  // Clean (watermark-free) download: token saved in sessionStorage before the redirect
  const wmToken = sessionStorage.getItem('pcv_wm_token')
  if (wmToken) {
    const wmFilename = sessionStorage.getItem('pcv_wm_filename') || 'cv.pdf'
    sessionStorage.removeItem('pcv_wm_token')
    sessionStorage.removeItem('pcv_wm_filename')
    window.history.replaceState({}, '', '/')
    fetch(apiUrl(`/api/cv/clean/${wmToken}`), { credentials: 'include', headers: { 'x-payment-intent-id': sessionId } })
      .then(r => r.ok ? r.blob() : Promise.reject(r.status))
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = wmFilename.replace(/\.pdf$/i, '') + '-clean.pdf'
        document.body.appendChild(a); a.click(); a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        showToast('Your clean CV has downloaded.')
      })
      .catch(() => showToast("Payment received, but the download didn't start. Try Download again from My CVs."))
    return
  }

  // Clean PDF for a CV (€0.99)
  window.history.replaceState({}, '', '/')
  nextTick(() => nextTick(() => {
    paywallRef.value?.handleStripeReturn(sessionId, draftId)
    showPaywall.value = true
  }))
}

// ── Boot ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  store.initDarkMode()
  await checkMaintenance()
  if (maintenance.value) return
  await auth.fetchMe()

  const params = new URLSearchParams(window.location.search)
  if (auth.isLoggedIn) {
    notif.fetch()
    await restoreLatestDraft()
  } else {
    // First visit: show the landing page (returning guests go straight to the app)
    const deepLink = window.location.pathname !== '/'
    showLanding.value = !deepLink && !lsGet('pcv-started') && !store.hasContent && !params.get('session')
  }
  ready.value = true

  if (params.get('verify')) confirmEmail(params.get('verify'))
  if (params.get('token')) openAuth('reset')
  else if (!auth.isLoggedIn && (params.get('ref') || params.get('referral'))) openAuth('register')
  // Remember a friend's referral code even if they sign up later (AuthModal reads it back)
  const refParam = params.get('ref') || params.get('referral')
  if (refParam && !auth.isLoggedIn) { try { localStorage.setItem('cvmaster_ref', refParam) } catch {} }
  handleStripeReturn()
  handleAiPackReturn()
})

// Signing out elsewhere (Settings) returns to the guest experience
// …and back to the homepage, so there's a clear way to sign in again or look around
watch(() => auth.isLoggedIn, (v, was) => { if (was && !v) { store.resetData(); notif.items = []; showHome() } })
watch(() => route.path, () => { navOpen.value = false })
</script>

<style scoped>
.shell{display:flex;height:100vh;height:100dvh;overflow:hidden;background:var(--c-bg)}

/* Sidebar */
.sb{width:var(--sb);flex-shrink:0;display:flex;flex-direction:column;gap:18px;padding:18px 14px;background:var(--c-surface);border-right:1px solid var(--c-border);overflow-y:auto}
.verify-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:9px 20px;background:var(--c-accent-lt);border-bottom:1px solid var(--c-border);font-size:13px;color:var(--c-text)}
.verify-bar span{flex:1;min-width:200px}
.verify-x{background:none;border:none;font-size:18px;line-height:1;color:var(--c-text3);padding:0 4px}
.sb-brand{padding:2px 6px;text-decoration:none;background:none;border:none;text-align:left;cursor:pointer}
.sb-new svg{width:16px;height:16px}
.sb-nav{display:flex;flex-direction:column;gap:2px}
.sb-link{display:flex;align-items:center;gap:11px;height:38px;padding:0 10px;border-radius:9px;font-size:14px;font-weight:500;color:var(--c-text2);text-decoration:none;transition:background .15s,color .15s}
.sb-link svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.sb-link:hover{background:var(--c-surface2);color:var(--c-text)}
.sb-link.active{background:var(--c-accent-lt);color:var(--c-accent);font-weight:600}
.sb-foot{margin-top:auto;display:flex;flex-direction:column;gap:12px}
.sb-guest{border:1px solid var(--c-border);border-radius:12px;padding:14px;background:var(--c-surface2);display:flex;flex-direction:column;gap:8px}
.sb-guest-ttl{font-size:13px;font-weight:600}
.sb-guest p{font-size:12.5px;color:var(--c-text2);line-height:1.5;margin-bottom:4px}
.sb-user{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;text-decoration:none;color:inherit}
.sb-user:hover{background:var(--c-surface2)}
.sb-ava{width:34px;height:34px;border-radius:50%;background:var(--c-accent-lt);color:var(--c-accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
.sb-user-txt{display:flex;flex-direction:column;min-width:0}
.sb-user-name{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-user-mail{font-size:12px;color:var(--c-text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-legal{display:flex;gap:6px;justify-content:center;font-size:12px;color:var(--c-text3)}
.sb-legal a,.sb-legal button{color:var(--c-text3);text-decoration:none;background:none;border:none;padding:0;font:inherit;cursor:pointer}
.sb-legal a:hover,.sb-legal button:hover{color:var(--c-text)}
.sb-dim{display:none}

/* Main */
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.top{height:var(--topbar);flex-shrink:0;display:flex;align-items:center;gap:12px;padding:0 20px 0 28px;background:var(--c-surface);border-bottom:1px solid var(--c-border)}
.top-title{font-size:15px;font-weight:600;flex:1;min-width:0}
.top-actions{display:flex;align-items:center;gap:4px}
.content{flex:1;min-height:0;overflow:hidden}
.content > :deep(*){height:100%}

/* Mobile */
.bnav{position:fixed;left:0;right:0;bottom:0;z-index:300;background:var(--c-surface);border-top:1px solid var(--c-border);
  align-items:center;justify-content:space-around;padding:6px 6px calc(6px + env(safe-area-inset-bottom))}
.bnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;font-size:11px;font-weight:500;color:var(--c-text3);text-decoration:none}
.bnav-btn svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.bnav-btn.active{color:var(--c-accent)}
.bnav-fab{width:48px;height:48px;border-radius:14px;border:none;background:var(--c-accent);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(79,70,229,.35);flex-shrink:0}
.bnav-fab svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
@media (max-width:768px){
  .sb{position:fixed;left:0;top:0;bottom:0;z-index:600;transform:translateX(-100%);transition:transform .22s ease;box-shadow:var(--shadow-xl)}
  .sb.open{transform:none}
  .sb-dim{display:block;position:fixed;inset:0;z-index:550;background:rgba(15,15,25,.4);opacity:0;pointer-events:none;transition:opacity .2s}
  .sb-dim.on{opacity:1;pointer-events:auto}
  .top{padding:0 12px}
  .content{padding-bottom:calc(64px + env(safe-area-inset-bottom))}
}

/* Boot + maintenance */
.boot{height:100vh;display:flex;align-items:center;justify-content:center}
.boot-spin{width:26px;height:26px;border-radius:50%;border:3px solid var(--c-border);border-top-color:var(--c-accent);animation:spin .8s linear infinite}
.maint{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--c-bg)}
.maint-box{max-width:420px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px}
.maint-box h1{font-size:24px;font-weight:650;margin-top:12px}
.maint-box p{color:var(--c-text2)}
</style>
