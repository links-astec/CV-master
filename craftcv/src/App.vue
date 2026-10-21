<template>
  <!-- Maintenance -->
  <div v-if="maintenance" class="maint">
    <div class="maint-box">
      <BrandLogo large animate />
      <h1>{{ $t('We’ll be right back') }}</h1>
      <p>{{ $t('CVMaster is being updated. Your CVs are safe. Please check again in a few minutes.') }}</p>
      <button class="btn-secondary" @click="checkMaintenance">{{ $t('Check again') }}</button>
    </div>
  </div>

  <LandingPage v-else-if="showLanding" :signed-in="auth.isLoggedIn" @start="startBuilding" @sign-in="openAuth('signin')" />

  <div v-else-if="ready" class="shell" :class="{ 'sb-mini': sbMini }">
    <!-- Sidebar -->
    <div class="sb-dim" :class="{ on: navOpen }" @click="navOpen = false"></div>
    <aside class="sb" :class="{ open: navOpen }">
      <div class="sb-top">
        <button type="button" class="sb-brand" :title="$t('CVMaster home')" @click="navOpen = false; showHome()"><BrandLogo /></button>
        <!-- Collapse to icons (computers only); remembered -->
        <button type="button" class="sb-toggle hide-mobile" :aria-label="$t(sbMini ? 'Expand sidebar' : 'Collapse sidebar')" :title="$t(sbMini ? 'Expand sidebar' : 'Collapse sidebar')" :aria-expanded="!sbMini" @click="toggleSidebar">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><line x1="9" y1="4" x2="9" y2="20"/><polyline v-if="sbMini" points="13 10 15 12 13 14"/><polyline v-else points="15 10 13 12 15 14"/></svg>
        </button>
      </div>

      <button class="btn-primary accent btn-block sb-new" data-tour="new-cv" @click="newCV" :title="sbMini ? $t('New CV') : null" :aria-label="$t('New CV')">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span class="sb-lbl">{{ $t('New CV') }}</span>
      </button>

      <nav class="sb-nav">
        <RouterLink v-for="n in NAV" :key="n.to" :to="n.to" class="sb-link" :data-tour="`nav-${n.id}`"
                    :class="{ active: route.path === n.to }" :title="sbMini ? $t(n.label) : null" @click="navOpen = false">
          <svg viewBox="0 0 24 24" v-html="n.icon"></svg>
          <span class="sb-lbl">{{ $t(n.label) }}</span>
        </RouterLink>
        <RouterLink to="/pricing" class="sb-link" :class="{ active: route.path === '/pricing' }" :title="sbMini ? $t('Pricing') : null" @click="navOpen = false">
          <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          <span class="sb-lbl">{{ $t('Pricing') }}</span>
        </RouterLink>
        <a :href="`/blog?lang=${lang}`" class="sb-link" :title="sbMini ? $t('Blog') : null" @click="navOpen = false">
          <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          <span class="sb-lbl">{{ $t('Blog') }}</span>
        </a>
      </nav>

      <div class="sb-foot">
        <Transition name="sb-swap" mode="out-in">
        <button v-if="!auth.isLoggedIn && sbMini" type="button" class="sb-mini-join" :title="$t('Create free account')" :aria-label="$t('Create free account')" @click="openAuth('register')">
          <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        </button>
        <div v-else-if="!auth.isLoggedIn" class="sb-guest">
          <div class="sb-guest-ttl">{{ $t('You’re using CVMaster as a guest') }}</div>
          <p>{{ $t('Your CV is saved in this browser. Create a free account to keep it safe and export it.') }}</p>
          <button class="btn-primary accent btn-block btn-sm" @click="openAuth('register')">{{ $t('Create free account') }}</button>
          <button class="btn-ghost btn-block btn-sm" @click="openAuth('signin')">{{ $t('Sign in') }}</button>
        </div>
        <RouterLink v-else to="/settings" class="sb-user" :class="{ 'has-pass': auth.user?.pass }" :title="sbMini ? auth.user?.email : null" @click="navOpen = false">
          <span class="sb-ava"><img v-if="auth.user?.photo" :src="auth.user.photo" alt="" /><template v-else>{{ auth.user?.avatar || auth.user?.name?.[0] || 'U' }}</template></span>
          <span class="sb-user-txt">
            <span class="sb-user-name"><span class="sb-user-n">{{ auth.user?.name }}</span></span>
            <span v-if="auth.user?.pass" class="sb-user-mail sb-user-pass">{{ $t('Job Hunt Pass') }}</span>
            <span v-else class="sb-user-mail">{{ auth.user?.email }}</span>
          </span>
          <svg v-if="auth.user?.pass" class="sb-user-mark" viewBox="8 6 102 66" aria-hidden="true"><path :d="MARK_PATH" /></svg>
        </RouterLink>
        </Transition>
        <Transition name="sb-swap">
        <div v-if="!sbMini" class="sb-legal">
          <button type="button" @click="navOpen = false; openFeedback()">{{ $t('Feedback') }}</button>
          <span>·</span>
          <RouterLink to="/privacy" @click="navOpen = false">{{ $t('Privacy') }}</RouterLink>
          <span>·</span>
          <RouterLink to="/terms" @click="navOpen = false">{{ $t('Terms') }}</RouterLink>
        </div>
        </Transition>
      </div>
    </aside>

    <!-- Main -->
    <div class="main">
      <header class="top" :class="{ 'top-quiet': bigTitle && !scrolledPast, 'top-lift': scrolledPast }">
        <button class="icon-btn show-mobile" @click="navOpen = true" :aria-label="$t('Menu')">
          <svg viewBox="0 0 24 24"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
        </button>
        <div class="top-title">{{ route.meta.title ? $t(route.meta.title) : 'CVMaster' }}</div>
        <div class="top-actions">
          <LangSwitch class="top-lang" :class="{ 'hide-mobile': auth.isLoggedIn }" />
          <NotificationDropdown v-if="auth.isLoggedIn" />
          <button class="icon-btn hide-mobile" @click="store.darkMode = !store.darkMode" :title="$t(store.darkMode ? 'Light mode' : 'Dark mode')">
            <svg v-if="store.darkMode" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg v-else viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>
          </button>
          <button v-if="!auth.isLoggedIn" class="btn-secondary btn-sm hide-mobile" @click="openAuth('signin')">{{ $t('Sign in') }}</button>
        </div>
      </header>
      <!-- Email accounts that haven't confirmed yet -->
      <div v-if="auth.isLoggedIn && auth.user && auth.user.emailVerified === false && !verifyHidden" class="verify-bar">
        <span>{{ $t('Confirm your email to unlock 30 AI requests a day. We sent a link to {email}.', { email: auth.user.email }) }}</span>
        <button class="btn-secondary btn-sm" :disabled="verifySending" @click="resendVerification">{{ $t(verifySent ? 'Sent ✓' : verifySending ? 'Sending…' : 'Resend email') }}</button>
        <button class="verify-x" :aria-label="$t('Hide')" @click="verifyHidden = true">×</button>
      </div>
      <main class="content" :class="{ full: route.meta.full }" @scroll.capture="onContentScroll">
        <RouterView v-slot="{ Component, route: r }"><Transition name="page" mode="out-in"><component :is="Component" :key="r.path" /></Transition></RouterView>
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav class="bnav show-mobile">
      <RouterLink to="/" class="bnav-btn" :class="{ active: route.path === '/' }">
        <svg viewBox="0 0 24 24" v-html="NAV[0].icon"></svg>{{ $t('My CVs') }}
      </RouterLink>
      <RouterLink to="/templates" class="bnav-btn" :class="{ active: route.path === '/templates' }">
        <svg viewBox="0 0 24 24" v-html="NAV[1].icon"></svg>{{ $t('Templates') }}
      </RouterLink>
      <button class="bnav-fab" @click="newCV" :aria-label="$t('New CV')">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <RouterLink to="/editor" class="bnav-btn" :class="{ active: route.path === '/editor' }">
        <svg viewBox="0 0 24 24" v-html="NAV[2].icon"></svg>{{ $t('Editor') }}
      </RouterLink>
      <RouterLink to="/settings" class="bnav-btn" :class="{ active: route.path === '/settings' }">
        <svg viewBox="0 0 24 24" v-html="NAV[3].icon"></svg>{{ $t('Settings') }}
      </RouterLink>
    </nav>
  </div>

  <div v-else class="boot"><BrandLoader :size="44" /></div>

  <WizardModal @open-builder="router.push('/editor')" @pay="openPaywall" />
  <PaywallModal ref="paywallRef" :show="showPaywall" @close="showPaywall = false" />
  <AuthModal v-if="authState.open" :initial-view="authState.view" :reason="authState.reason" @done="onAuthDone" @close="onAuthClose" />
  <OnboardingModal v-if="showOnboarding" @done="onOnboarded" />
  <ConfirmModal ref="confirmRef" />
  <FeedbackModal ref="feedbackRef" />
  <AiLimitModal ref="aiLimitRef" />
  <TutorialOverlay :visible="showTutorial" @close="showTutorial = false" />

  <div class="toast-wrap">
    <TransitionGroup name="toast">
      <div v-for="ts in toasts" :key="ts.id" class="toast">{{ $t(ts.msg) }}</div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, provide, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useCvStore, hasCvContent } from './stores/cv.js'
import { useNotifStore } from './stores/notifications.js'
import LandingPage from './views/Landing.vue'
import AuthModal from './components/auth/AuthModal.vue'
import OnboardingModal from './components/auth/OnboardingModal.vue'
import WizardModal from './components/WizardModal.vue'
import PaywallModal from './components/PaywallModal.vue'
import NotificationDropdown from './components/NotificationDropdown.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import FeedbackModal from './components/FeedbackModal.vue'
import { setSeo, seoForRoute, homeSeo } from './composables/seo.js'
import AiLimitModal from './components/AiLimitModal.vue'
import { guestEvent } from './composables/track.js'
import TutorialOverlay from './components/TutorialOverlay.vue'
import BrandLogo from './components/BrandLogo.vue'
import { MARK_PATH } from '../brand/brand.mjs'
import BrandLoader from './components/BrandLoader.vue'
import LangSwitch from './components/LangSwitch.vue'
import { t, lang, setLang, hasExplicitChoice } from './i18n/index.js'

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
// Feedback & complaints pop-up, openFeedback('complaint') opens on that type
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
    else { verifySent.value = true; showToast('Sent. Check your inbox (and spam).') }
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
    showToast('Email confirmed. You now get 30 AI requests a day.')
  } catch (e) { showToast(e.message || 'Could not confirm your email.') }
}

// The homepage (Landing). Reachable from the sidebar logo and after signing out
function showHome() { showLanding.value = true }
// The homepage keeps its own title/description while it's showing
watch([showLanding, lang], () => { setSeo(showLanding.value ? homeSeo() : seoForRoute(route)) })
provide('showHome', showHome)

// ── Sidebar: collapsed to icons on computers (remembered), and while the editor shows Design ──
const sbPinned = ref(lsGet('cvm-sb-mini') === '1')
const sbAuto = ref(false)
const sbMini = computed(() => (sbPinned.value || sbAuto.value) && !navOpen.value)
function toggleSidebar() {
  if (sbAuto.value && !sbPinned.value) { sbAuto.value = false; return }   // opened by hand while Design is on
  sbPinned.value = !sbPinned.value
  lsSet('cvm-sb-mini', sbPinned.value ? '1' : '0')
}
provide('sidebarAuto', sbAuto)

// AI allowance: any AI call refused for the daily limit opens the "get more" pop-up.
// Watching fetch here means every AI feature gets this without its own handling.
const aiLimitRef = ref(null)
const CV_EMPTY_MSG = 'Your CV is empty. Add a few details first (a job title, some experience or skills), then the AI can help.'
provide('openAiAllowance', () => aiLimitRef.value?.show('info'))
if (!window.__aiLimitWatch) {
  window.__aiLimitWatch = true
  const _fetch = window.fetch.bind(window)
  // AI features that work on the CV: never call them for an empty CV (nothing to work
  // with, and it would use up an AI request). Answered here, no request is sent.
  const CV_AI = /\/api\/ai\/(write|fit|fix|translate|tailor|ats)\b/
  window.fetch = async (...args) => {
    const url0 = String(args[0]?.url || args[0] || '')
    if (CV_AI.test(url0) && typeof args[1]?.body === 'string') {
      let cv = null
      try { cv = JSON.parse(args[1].body)?.cv } catch {}
      if (cv && !hasCvContent(cv)) {
        return new Response(JSON.stringify({ code: 'CV_EMPTY', error: CV_EMPTY_MSG }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }
    }
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
    showToast(t('100 AI requests added. You now have {n} extra.', { n: j.credits }))
  } catch (e) {
    showToast(e.message || 'We couldn’t confirm your payment. Contact us if you were charged.')
  }
}
provide('fmt', computed(() => store.fmt))

// ── Auth modal (sign in / create account) ─────────────────────────────────────
// Guests can do everything except export; requireAccount() asks them to sign up
// at that moment and resolves true once they're signed in.
const authState = reactive({ open: false, view: 'register', reason: '' })
let authResolve = null
function openAuth(view = 'signin', reason = '') {
  if (view === 'register') guestEvent('signup_open')
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
provide('startBuilding', (mode) => startBuilding(mode))
provide('requireAccount', (reason) => auth.isLoggedIn ? Promise.resolve(true) : openAuth('register', reason))

// Onboarding (industry / goal / experience) is optional context for the AI
const onboardingDismissed = ref(false)
const pendingTour = ref(false)
function onOnboarded({ tour = false } = {}) {
  onboardingDismissed.value = true
  // the tour shows the app, not the homepage (e.g. after a Google sign-up, which reloads the page)
  if (tour && showLanding.value) { lsSet('pcv-started', '1'); showLanding.value = false }
  pendingTour.value = tour
}
// Signing up is often for something (a new CV, a template, a payment) that carries on right after:
// the tour starts once nothing else is open, so it's never hidden behind it
let tourTimer = null
watch(pendingTour, (on) => {
  clearInterval(tourTimer)
  if (!on) return
  tourTimer = setInterval(() => {
    if (store.wizardOpen || authState.open || showPaywall.value || showLanding.value || document.querySelector('.jo-backdrop, .confirm-backdrop')) return
    clearInterval(tourTimer)
    pendingTour.value = false
    showTutorial.value = true
  }, 900)
})
const showOnboarding = computed(() => ready.value && auth.isLoggedIn && !auth.isOnboarded && !onboardingDismissed.value && !authState.open)

// The account's language follows the user to other devices. Unless they picked one here
function applyAccountLang() {
  const l = auth.user?.uiLang
  if (l && l !== lang.value && !hasExplicitChoice()) setLang(l, { explicit: false })
}

// Guest → account: keep the CV they built as their first saved draft
async function afterSignIn() {
  applyAccountLang()
  notif.fetch()
  if (store.hasContent && !store.currentDraftId) {
    const id = await store.saveDraft()
    if (id) showToast('Your CV is now saved to your account.')
  } else if (!store.hasContent) {
    await restoreLatestDraft()
  }
}

// Same CV? (name, headline, summary and jobs) so a guest CV already in the account isn't saved twice
const cvSig = (d) => JSON.stringify([d?.fn, d?.ln, d?.title, d?.sum, (d?.experiences || []).map(e => (e?.title || '') + '|' + (e?.company || ''))])
// A CV made in this browser before signing in (after a Google sign-in the page reloads) moves into
// the account and stays open; otherwise the latest saved CV opens
async function claimGuestCv(drafts) {
  if (!store.hasContent || store.currentDraftId || lsGet('pcv-draft-id')) return false
  const same = drafts.find(d => cvSig(d.data) === cvSig(store.data))
  if (same) { store.loadDraft(same); return true }
  const id = await store.saveDraft()
  if (id) showToast(t('Your CV is now saved to your account.'))
  return !!id
}
async function restoreLatestDraft() {
  try {
    const r = await fetch(apiUrl('/api/drafts'), { credentials: 'include' })
    if (!r.ok) return
    const drafts = await r.json()
    if (await claimGuestCv(drafts)) return
    if (!drafts.length) return
    const latest = [...drafts].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0]
    if (latest?.data) store.loadDraft(latest)
  } catch {}
}

// ── New CV ────────────────────────────────────────────────────────────────────
// mode: 'narrate' opens "Tell your story" straight after the job offer screen
async function newCV(mode = null) {
  if (typeof mode !== 'string') mode = null   // called from a click
  navOpen.value = false
  if (!auth.isLoggedIn && store.hasContent) {
    const ok = await confirmRef.value?.ask({
      title: t('Start a new CV?'),
      message: t('Your current CV is only saved in this browser, so it will be replaced. Create a free account first if you want to keep both.'),
      ok: t('Start new CV'), cancel: t('Keep current'), mode: 'warning',
    })
    if (!ok) return
  }
  store.resetData()
  store.openWizard(false, { mode })
}

// Landing → app
// Where each homepage button goes: 'new' → a new CV (job offer first); 'narrate' → Tell your story;
// 'ats' → check a CV against a job; 'templates' → Templates; 'mycvs' → My CVs; 'invite' → the invite link
function startBuilding(mode) {
  lsSet('pcv-started', '1')
  showLanding.value = false
  // The homepage's referral section: the invite link lives in Settings (an account is needed)
  if (mode === 'invite') {
    if (auth.isLoggedIn) router.push({ path: '/settings', hash: '#invite' })
    else { router.push('/templates'); openAuth('register', 'invite') }
    return
  }
  if (mode === 'mycvs') { router.push('/'); return }
  if (mode === 'templates') { router.push('/templates'); return }
  if (mode === 'pass') { router.push({ path: '/settings', hash: '#pass' }); return }
  if (mode === 'pricing') { router.push('/pricing'); return }
  if (mode === 'new') { router.push(auth.isLoggedIn ? '/' : '/templates'); newCV(); return }
  if (mode === 'ats' && store.hasContent) { router.push({ path: '/editor', query: { tab: 'job' } }); return }
  router.push(auth.isLoggedIn ? '/' : '/templates')   // signed in → My CVs
  // A new CV: the job offer first, then (for 'narrate') Tell your story. Always, even with CVs already
  // saved (a guest is asked before their browser CV is replaced)
  if (mode === 'narrate' || mode === 'ats') newCV(mode === 'narrate' ? 'narrate' : null)
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

  // Clean PDF for a CV (€0.99)
  window.history.replaceState({}, '', '/')
  nextTick(() => nextTick(() => {
    paywallRef.value?.handleStripeReturn(sessionId, draftId)
    showPaywall.value = true
  }))
}

// ── Boot ──────────────────────────────────────────────────────────────────────
// Coming back to this tab: pick up changes made elsewhere (the phone app, another tab)
function onTabVisible() { if (document.visibilityState === 'visible') store.refreshFromServer() }
onMounted(() => document.addEventListener('visibilitychange', onTabVisible))
onUnmounted(() => document.removeEventListener('visibilitychange', onTabVisible))

onMounted(async () => {
  store.initDarkMode()
  await checkMaintenance()
  if (maintenance.value) return
  await auth.fetchMe()
  guestEvent('visit')

  const params = new URLSearchParams(window.location.search)
  if (auth.isLoggedIn) {
    applyAccountLang()
    notif.fetch()
    await restoreLatestDraft()
  } else {
    // First visit: show the landing page (returning guests go straight to the app)
    const deepLink = window.location.pathname !== '/'
    showLanding.value = !deepLink && !lsGet('pcv-started') && !store.hasContent && !params.get('session')
  }
  ready.value = true

  if (params.get('verify')) confirmEmail(params.get('verify'))
  if (params.get('newsletter') === 'confirmed') {
    showToast('You’re subscribed to the CVMaster newsletter, thanks!')
    window.history.replaceState({}, '', window.location.pathname)
  }
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
watch(() => route.path, () => { navOpen.value = false; scrolledPast.value = false; setTimeout(checkBigTitle, 350) })

// Pages with a large title of their own (My CVs, Templates, Settings): the top bar stays quiet until it scrolls away
const bigTitle = ref(false)
const scrolledPast = ref(false)
function checkBigTitle() { bigTitle.value = !!document.querySelector('.content .page-intro h1, .content .st-h1') }
function onContentScroll(e) {
  const y = e.target?.scrollTop || 0
  scrolledPast.value = y > 64
  if (!bigTitle.value) checkBigTitle()
}
onMounted(() => setTimeout(checkBigTitle, 400))
</script>

<style scoped>
.shell{display:flex;height:100vh;height:100dvh;overflow:hidden;background:var(--c-bg)}

/* Sidebar */
.sb{width:var(--sb);flex-shrink:0;display:flex;flex-direction:column;gap:22px;padding:26px 16px 18px;background:var(--c-bg);overflow-y:auto}
.verify-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:12px 20px 0;padding:10px 12px 10px 18px;background:var(--c-accent-lt);border-radius:999px;font-size:13px;color:var(--c-text)}
.verify-bar span{flex:1;min-width:200px}
.verify-x{background:none;border:none;font-size:18px;line-height:1;color:var(--c-text3);padding:0 4px}
.sb-brand{padding:2px 10px 8px;text-decoration:none;background:none;border:none;text-align:left;cursor:pointer;align-self:flex-start}
.sb-new{height:46px;font-size:14.5px;background:linear-gradient(180deg,#5a52e6,#4338CA)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 8px 20px rgba(67,56,202,.28)!important}
.sb-new:hover{background:linear-gradient(180deg,#4f47dd,#3730a3)!important}
.sb-new svg{width:17px;height:17px}
.sb-nav{display:flex;flex-direction:column;gap:3px}
.sb-link{display:flex;align-items:center;gap:13px;height:44px;padding:0 14px;border-radius:14px;font-size:14.5px;font-weight:500;letter-spacing:-.01em;color:var(--c-text2);text-decoration:none;transition:background .2s var(--ease),color .2s var(--ease),box-shadow .2s var(--ease)}
.sb-link svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.sb-link:hover{background:color-mix(in srgb,var(--c-text) 5%,transparent);color:var(--c-text)}
.sb-link.active{background:var(--c-surface);color:var(--c-text);font-weight:600;box-shadow:0 1px 2px rgba(20,20,43,.04),0 4px 14px rgba(20,20,43,.06)}
.sb-link.active svg{color:var(--c-accent)}
.sb-foot{margin-top:auto;display:flex;flex-direction:column;gap:14px}
.sb-guest{border:none;border-radius:22px;padding:18px;background:var(--c-surface);box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:8px}
.sb-guest-ttl{font-size:14px;font-weight:700;letter-spacing:-.015em}
.sb-guest p{font-size:12.5px;color:var(--c-text2);line-height:1.5;margin-bottom:4px}
.sb-user{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:16px;text-decoration:none;color:inherit;background:transparent;box-shadow:none;transition:box-shadow .25s var(--ease),transform .25s var(--ease)}
.sb-user:hover{background:color-mix(in srgb,var(--c-text) 5%,transparent)}
/* Job Hunt Pass holders: their account is a small version of their pass card */
.sb-user.has-pass{position:relative;overflow:hidden;background:var(--c-accent);color:#fff;box-shadow:0 10px 24px -12px color-mix(in srgb,var(--c-accent) 80%,transparent),inset 0 0 0 1px rgba(255,255,255,.14)}
.sb-user.has-pass:hover{background:color-mix(in srgb,var(--c-accent) 90%,#000)}
.sb-user.has-pass .sb-ava{background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.55)}
.sb-user.has-pass .sb-user-txt{position:relative;z-index:1}
.sb-user-pass{color:rgba(255,255,255,.78)!important;font-weight:500}
.sb-user-mark{position:absolute;right:-18px;bottom:-22px;width:92px;fill:none;stroke:rgba(255,255,255,.13);stroke-width:10;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
:global([data-theme="dark"]) .sb-user.has-pass{background:#5b54e8}
.sb-ava img{width:100%;height:100%;border-radius:50%;object-fit:cover}
.sb-ava{overflow:hidden;width:36px;height:36px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#8B85FF,#4338CA 55%,#2A2390);color:#fff;box-shadow:0 4px 10px rgba(67,56,202,.25);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
.sb-user-txt{display:flex;flex-direction:column;min-width:0}
.sb-user-name{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Job Hunt Pass holders: a quiet mark on their account */
.sb-user-name{display:flex!important;align-items:center;min-width:0}
.sb-user-n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.sb-pass{flex-shrink:0;display:inline-flex;align-items:center;height:17px;padding:0 7px;margin-left:6px;border-radius:99px;background:var(--c-accent);color:#fff;font-size:10.5px;font-weight:700;vertical-align:1px}
.sb-user-mail{font-size:12px;color:var(--c-text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-legal{display:flex;gap:6px;justify-content:center;font-size:12px;color:var(--c-text3)}
.sb-legal a,.sb-legal button{color:var(--c-text3);text-decoration:none;background:none;border:none;padding:0;font:inherit;cursor:pointer}
.sb-legal a:hover,.sb-legal button:hover{color:var(--c-text)}
.sb-dim{display:none}
/* Collapsing to icons: everything keeps its place and animates with the width (no layout snaps),
   on an even curve (the site's usual ease-out made the width look like it jumped) */
.shell{--sb-ease:cubic-bezier(.4,0,.2,1)}
.sb{transition:width .3s var(--sb-ease),padding .3s var(--sb-ease);overflow-x:hidden}
.sb-brand{overflow:hidden;max-width:230px;transition:max-width .3s var(--sb-ease),padding .3s var(--sb-ease)}
.sb-lbl{white-space:nowrap;overflow:hidden;max-width:180px;opacity:1;transition:opacity .2s var(--sb-ease) .1s,max-width .3s var(--sb-ease)}
.sb-link{transition:background .2s var(--ease),color .2s var(--ease),box-shadow .2s var(--ease),gap .3s var(--sb-ease)}
.sb-new{transition:gap .3s var(--sb-ease),padding .3s var(--sb-ease)}
.sb-user{transition:box-shadow .25s var(--ease),transform .25s var(--ease),padding .3s var(--sb-ease),gap .3s var(--sb-ease),border-radius .3s var(--sb-ease)}
.sb-user-txt{max-width:200px;opacity:1;transition:opacity .2s var(--sb-ease) .1s,max-width .3s var(--sb-ease)}
.sb-top{position:relative}
.sb-swap-enter-active,.sb-swap-leave-active{transition:opacity .18s var(--ease)}
/* the guest box and the links under it keep their width while the panel narrows (no re-wrapping each frame) */
.sb-guest{min-width:208px}
.sb-legal{white-space:nowrap;min-width:208px}
.sb-swap-leave-active.sb-guest,.sb-swap-leave-active.sb-legal{transition-duration:.12s}
.sb-swap-enter-from,.sb-swap-leave-to{opacity:0}
.sb-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.sb-toggle{width:34px;height:34px;flex-shrink:0;border:none;border-radius:10px;background:transparent;color:var(--c-text3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,color .2s,opacity .2s}
.sb-toggle:hover{background:color-mix(in srgb,var(--c-text) 6%,transparent);color:var(--c-text)}
.sb-toggle:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px}
.sb-toggle svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.sb-mini-join{width:44px;height:44px;align-self:center;border:none;border-radius:50%;background:var(--c-surface);box-shadow:var(--shadow-sm);color:var(--c-accent);display:flex;align-items:center;justify-content:center;cursor:pointer}
.sb-mini-join svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
@media (min-width:769px){
  .shell.sb-mini .sb{width:76px;padding:26px 12px 18px}
  /* the logo is cropped to its mark; the collapse button sits over it and shows on hover */
  .shell.sb-mini .sb-brand{max-width:52px;padding:2px 11px 8px}
  .shell.sb-mini .sb-toggle{position:absolute;left:9px;top:-1px;opacity:0;background:var(--c-bg)}
  .shell.sb-mini .sb-top:hover .sb-toggle,.shell.sb-mini .sb-toggle:focus-visible{opacity:1}
  .shell.sb-mini .sb-lbl{opacity:0;max-width:0;transition:opacity .12s var(--sb-ease),max-width .3s var(--sb-ease)}
  .shell.sb-mini .sb-new{gap:0;padding:0}
  .shell.sb-mini .sb-link{gap:0}
  .shell.sb-mini .sb-user{padding:8px;gap:0;border-radius:26px}
  .shell.sb-mini .sb-user-txt{opacity:0;max-width:0;transition:opacity .12s var(--sb-ease),max-width .3s var(--sb-ease)}
}
@media (prefers-reduced-motion:reduce){
  .sb,.sb-brand,.sb-lbl,.sb-link,.sb-new,.sb-user,.sb-user-txt{transition:none!important}
}
.top-lang{margin-right:4px}

/* Main */
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.top{height:var(--topbar);flex-shrink:0;display:flex;align-items:center;gap:12px;padding:0 20px 0 32px;background:color-mix(in srgb,var(--c-bg) 82%,transparent);backdrop-filter:saturate(1.8) blur(20px);-webkit-backdrop-filter:saturate(1.8) blur(20px);border-bottom:1px solid var(--hair)}
.top-title{font-size:15px;font-weight:650;letter-spacing:-.015em;flex:1;min-width:0;transition:opacity .3s var(--ease),transform .3s var(--ease)}
.top{transition:background .3s var(--ease),border-color .3s var(--ease)}
/* The frosted top bar is its own layer; keep it (and the notifications panel inside it) above the page,
   whose cards animate on their own layers (below the phone menu, 550+, and dialogs) */
.top{position:relative;z-index:450}
.top.top-quiet{background:transparent;border-bottom-color:transparent;backdrop-filter:none;-webkit-backdrop-filter:none}
.top.top-quiet .top-title{opacity:0;transform:translateY(6px)}
.top-actions{display:flex;align-items:center;gap:4px}
.content{flex:1;min-height:0;overflow:hidden}
.content > :deep(*){height:100%}

/* Mobile */
.bnav{position:fixed;left:0;right:0;bottom:0;z-index:300;background:color-mix(in srgb,var(--c-surface) 82%,transparent);backdrop-filter:saturate(1.8) blur(20px);-webkit-backdrop-filter:saturate(1.8) blur(20px);border-top:1px solid var(--hair);
  align-items:center;justify-content:space-around;padding:6px 6px calc(6px + env(safe-area-inset-bottom))}
.bnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;font-size:11px;font-weight:500;color:var(--c-text3);text-decoration:none}
.bnav-btn svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.bnav-btn.active{color:var(--c-accent)}
.bnav-fab{width:50px;height:50px;border-radius:999px;border:none;background:var(--c-accent);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(67,56,202,.32);flex-shrink:0;transition:transform .2s var(--ease)}
.bnav-fab:active{transform:scale(.94)}
.bnav-fab svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
@media (max-width:768px){
  .sb{position:fixed;left:0;top:0;bottom:0;z-index:600;width:min(300px,84vw);transform:translateX(-104%);transition:transform .4s var(--ease);box-shadow:var(--shadow-xl);background:var(--c-bg);border-radius:0 30px 30px 0;padding:calc(22px + env(safe-area-inset-top)) 16px calc(18px + env(safe-area-inset-bottom))}
  .sb.open{transform:none}
  .sb-dim{display:block;position:fixed;inset:0;z-index:550;background:rgba(12,12,16,.3);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .3s var(--ease)}
  .sb-dim.on{opacity:1;pointer-events:auto}
  .top{padding:0 12px}
  .verify-bar{margin:10px 12px 0;border-radius:18px}
  .content{padding-bottom:calc(64px + env(safe-area-inset-bottom))}
}

/* Boot + maintenance */
.boot{height:100vh;height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--c-bg)}
.maint{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--c-bg)}
.maint-box{max-width:420px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px}
.maint-box h1{font-size:30px;font-weight:700;letter-spacing:-.03em;margin-top:18px}
.maint-box p{color:var(--c-text2)}
</style>
