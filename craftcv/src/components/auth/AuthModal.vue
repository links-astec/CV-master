<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="close">
      <div class="modal auth" role="dialog" aria-modal="true">
        <button class="icon-btn modal-close" @click="close" aria-label="Close">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <!-- Brand panel (hidden on small screens) -->
        <aside class="auth-side" aria-hidden="true">
          <BrandLogo dark />
          <div class="auth-side-copy">
            <h3>Your CV, tailored to every job.</h3>
            <ul>
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Keep every CV safe in one place</li>
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Tailor to job offers and check your ATS match</li>
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Export clean one-page PDFs</li>
            </ul>
          </div>
          <div class="auth-side-cv"><CvThumb template="modern:indigo" :data="SAMPLE_CV" /></div>
        </aside>

        <div class="auth-main">
        <div class="auth-hd">
          <BrandLogo mark-only class="auth-mobile-mark" />
          <h2>{{ TITLES[view] }}</h2>
          <p>{{ subtitle }}</p>
        </div>

        <!-- Sign in / Create account -->
        <template v-if="view === 'signin' || view === 'register'">
          <div class="seg auth-seg">
            <button :class="{ active: view === 'register' }" @click="switchView('register')">Create account</button>
            <button :class="{ active: view === 'signin' }" @click="switchView('signin')">Sign in</button>
          </div>

          <div v-if="view === 'register' && refCode" class="notice success auth-ref">
            <svg viewBox="0 0 24 24"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/></svg>
            <span><strong>{{ refName ? `${refName} invited you.` : 'You were invited.' }}</strong> They earn a free export credit when you join.</span>
          </div>

          <div ref="googleEl" class="google-btn" :class="{ hidden: !googleReady }"></div>
          <div v-if="googleReady" class="auth-or"><span>or with email</span></div>

          <form @submit.prevent="view === 'signin' ? submitLogin() : submitRegister()" novalidate>
            <div v-if="view === 'register'" class="f-grp">
              <label class="f-lbl" for="au-name">Full name</label>
              <input id="au-name" class="f-inp" v-model="form.name" autocomplete="name" :class="{ err: errors.name }" />
              <div v-if="errors.name" class="field-err">{{ errors.name }}</div>
            </div>
            <div class="f-grp">
              <label class="f-lbl" for="au-email">Email</label>
              <input id="au-email" class="f-inp" v-model="form.email" type="email" autocomplete="email" :class="{ err: errors.email }" />
              <div v-if="errors.email" class="field-err">{{ errors.email }}</div>
            </div>
            <div class="f-grp">
              <div class="auth-lbl-row">
                <label class="f-lbl" for="au-pw">Password</label>
                <button v-if="view === 'signin'" type="button" class="link-btn auth-small" @click="switchView('forgot')">Forgot password?</button>
              </div>
              <div class="pw-wrap">
                <input id="au-pw" class="f-inp" v-model="form.password" :type="showPw ? 'text' : 'password'"
                       :autocomplete="view === 'signin' ? 'current-password' : 'new-password'" :class="{ err: errors.password }"
                       :placeholder="view === 'register' ? 'At least 8 characters' : ''" />
                <button type="button" class="pw-toggle" @click="showPw = !showPw">{{ showPw ? 'Hide' : 'Show' }}</button>
              </div>
              <div v-if="errors.password" class="field-err">{{ errors.password }}</div>
            </div>

            <label v-if="view === 'register'" class="terms">
              <input type="checkbox" v-model="agreed" />
              <span>I agree to the <a href="/terms" target="_blank" rel="noopener">Terms</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</span>
            </label>
            <div v-if="errors.terms" class="field-err">{{ errors.terms }}</div>

            <div v-if="serverError" class="notice error auth-err">{{ serverError }}</div>

            <button type="submit" class="btn-primary accent btn-lg btn-block" :disabled="loading">
              {{ loading ? 'Please wait…' : view === 'signin' ? 'Sign in' : 'Create free account' }}
            </button>
          </form>
        </template>

        <!-- Forgot password -->
        <template v-else-if="view === 'forgot'">
          <div v-if="forgotSent" class="notice success">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span>If an account exists for <strong>{{ form.email }}</strong>, a reset link is on its way. It expires in 1 hour — check your spam folder too.</span>
          </div>
          <form v-else @submit.prevent="submitForgot" novalidate>
            <div class="f-grp">
              <label class="f-lbl" for="au-femail">Email</label>
              <input id="au-femail" class="f-inp" v-model="form.email" type="email" autocomplete="email" :class="{ err: errors.email }" />
              <div v-if="errors.email" class="field-err">{{ errors.email }}</div>
            </div>
            <div v-if="serverError" class="notice error auth-err">{{ serverError }}</div>
            <button type="submit" class="btn-primary accent btn-lg btn-block" :disabled="loading">{{ loading ? 'Sending…' : 'Send reset link' }}</button>
          </form>
          <button class="link-btn auth-back" @click="switchView('signin')">← Back to sign in</button>
        </template>

        <!-- Reset password (link from email) -->
        <template v-else>
          <div v-if="resetTokenError" class="notice error">{{ resetTokenError }}</div>
          <form v-else @submit.prevent="submitReset" novalidate>
            <div class="f-grp">
              <label class="f-lbl" for="au-npw">New password</label>
              <input id="au-npw" class="f-inp" v-model="form.password" type="password" autocomplete="new-password" placeholder="At least 8 characters" :class="{ err: errors.password }" />
              <div v-if="errors.password" class="field-err">{{ errors.password }}</div>
            </div>
            <div class="f-grp">
              <label class="f-lbl" for="au-cpw">Confirm password</label>
              <input id="au-cpw" class="f-inp" v-model="form.confirm" type="password" autocomplete="new-password" :class="{ err: errors.confirm }" />
              <div v-if="errors.confirm" class="field-err">{{ errors.confirm }}</div>
            </div>
            <div v-if="serverError" class="notice error auth-err">{{ serverError }}</div>
            <button type="submit" class="btn-primary accent btn-lg btn-block" :disabled="loading">{{ loading ? 'Saving…' : 'Set new password' }}</button>
          </form>
          <button class="link-btn auth-back" @click="switchView('forgot')">Request a new link</button>
        </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import BrandLogo from '../BrandLogo.vue'
import CvThumb from '../CvThumb.vue'
import { SAMPLE_CV } from '../../composables/sampleCv.js'

const props = defineProps({
  initialView: { type: String, default: 'register' },   // signin | register | forgot | reset
  reason:      { type: String, default: '' },           // why we're asking (export, download…)
})
const emit = defineEmits(['done', 'close'])

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path
const auth = useAuthStore()

const TITLES = { signin: 'Welcome back', register: 'Create your free account', forgot: 'Reset your password', reset: 'Choose a new password' }
const REASONS = {
  export:   'Create a free account to export — the CV you built comes with you.',
  download: 'Create a free account to download — the CV you built comes with you.',
  save:     'Create a free account to keep your CV safe and edit it anywhere.',
}

const view   = ref(props.initialView === 'signin' || props.initialView === 'forgot' || props.initialView === 'reset' ? props.initialView : 'register')
const loading = ref(false)
const showPw  = ref(false)
const agreed  = ref(false)
const serverError = ref('')
const forgotSent  = ref(false)
const resetToken  = ref('')
const resetTokenError = ref('')
const form   = ref({ name: '', email: '', password: '', confirm: '' })
const errors = ref({})

const subtitle = computed(() => {
  if (view.value === 'forgot') return "Enter your email and we'll send you a reset link."
  if (view.value === 'reset')  return 'Use at least 8 characters.'
  if (props.reason && REASONS[props.reason]) return REASONS[props.reason]
  return view.value === 'signin' ? 'Sign in to see your saved CVs.' : 'Free to build. Pay only when you export.'
})

function switchView(v) { view.value = v; errors.value = {}; serverError.value = ''; forgotSent.value = false }
function close() { if (!loading.value) emit('close') }

// ── Validation ────────────────────────────────────────────────────────────────
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim())
function check(fields) {
  const e = {}
  if (fields.includes('name') && !form.value.name.trim()) e.name = 'Please enter your name.'
  if (fields.includes('email') && !emailOk(form.value.email)) e.email = 'Please enter a valid email address.'
  if (fields.includes('password') && !form.value.password) e.password = 'Please enter your password.'
  if (fields.includes('newPassword') && form.value.password.length < 8) e.password = 'Use at least 8 characters.'
  if (fields.includes('confirm') && form.value.password !== form.value.confirm) e.confirm = "The passwords don't match."
  if (fields.includes('terms') && !agreed.value) e.terms = 'Please agree to the Terms and Privacy Policy.'
  errors.value = e
  serverError.value = ''
  return !Object.keys(e).length
}

async function run(fn) {
  loading.value = true
  try { await fn() } catch (e) { serverError.value = e.message || 'Something went wrong. Please try again.' }
  loading.value = false
}

const submitLogin = () => check(['email', 'password']) && run(async () => {
  await auth.login(form.value.email.trim(), form.value.password)
  emit('done')
})
const submitRegister = () => check(['name', 'email', 'newPassword', 'terms']) && run(async () => {
  await auth.register(form.value.email.trim(), form.value.password, form.value.name.trim(), refCode.value)
  try { localStorage.removeItem('cvmaster_ref') } catch {}
  emit('done')
})
const submitForgot = () => check(['email']) && run(async () => {
  await auth.forgotPassword(form.value.email.trim())
  forgotSent.value = true
})
const submitReset = () => check(['newPassword', 'confirm']) && run(async () => {
  await auth.resetPassword(resetToken.value, form.value.password)
  window.history.replaceState({}, '', '/')
  emit('done')
})

// ── Referral (?ref=CODE, remembered across visits) ────────────────────────────
const refCode = ref('')
const refName = ref('')

// ── Google Identity Services ──────────────────────────────────────────────────
const googleEl = ref(null)
const googleReady = ref(false)
function googleClientId() {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID || document.querySelector('meta[name="google-client-id"]')?.content
  return id && id !== 'undefined' && !id.startsWith('%') ? id : ''
}
function renderGoogle() {
  const clientId = googleClientId()
  if (!clientId || !window.google?.accounts?.id || !googleEl.value) return
  window.google.accounts.id.initialize({ client_id: clientId, callback: onGoogleCredential, cancel_on_tap_outside: true })
  googleEl.value.innerHTML = ''
  window.google.accounts.id.renderButton(googleEl.value, {
    theme: 'outline', size: 'large', shape: 'rectangular', text: 'continue_with',
    width: Math.min(googleEl.value.clientWidth || 360, 400),
  })
  googleReady.value = true
}
async function onGoogleCredential(response) {
  if (view.value === 'register' && !agreed.value) {
    errors.value = { terms: 'Please agree to the Terms and Privacy Policy first.' }
    return
  }
  await run(async () => {
    await auth.loginWithGoogle(response.credential, refCode.value)
    try { localStorage.removeItem('cvmaster_ref') } catch {}
    emit('done')
  })
}
function loadGoogle() {
  if (!googleClientId()) return
  if (window.google?.accounts?.id) return renderGoogle()
  let script = document.querySelector('script[src*="accounts.google.com/gsi"]')
  if (!script) {
    script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    document.head.appendChild(script)
  }
  script.addEventListener('load', renderGoogle)
  const poll = setInterval(() => { if (window.google?.accounts?.id) { clearInterval(poll); renderGoogle() } }, 250)
  setTimeout(() => clearInterval(poll), 10000)
}
watch(view, (v) => { if (v === 'signin' || v === 'register') nextTick(renderGoogle) })

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('ref') || params.get('referral') || (() => { try { return localStorage.getItem('cvmaster_ref') || '' } catch { return '' } })()
  if (code) {
    refCode.value = code
    try { localStorage.setItem('cvmaster_ref', code) } catch {}
    fetch(apiUrl(`/api/referral/lookup?code=${encodeURIComponent(code)}`))
      .then(r => r.ok ? r.json() : null).then(d => { if (d?.name) refName.value = d.name }).catch(() => {})
  }

  const token = params.get('token')
  if (view.value === 'reset') {
    resetToken.value = token || ''
    if (!token) resetTokenError.value = 'This reset link is incomplete. Request a new one.'
    else fetch(apiUrl(`/api/auth/reset-password/${encodeURIComponent(token)}`))
      .then(r => r.json())
      .then(d => { if (!d.valid) resetTokenError.value = d.error || 'This reset link is invalid or has expired.' })
      .catch(() => { resetTokenError.value = 'We could not check this reset link. Please try again.' })
  }

  nextTick(loadGoogle)
})
</script>

<style scoped>
.auth{max-width:880px;padding:0;display:grid;grid-template-columns:360px 1fr;overflow:hidden}
.auth-side{position:relative;background:#14142B;color:#fff;padding:32px 30px 0;display:flex;flex-direction:column;gap:26px;overflow:hidden}
.auth-side::before{content:'';position:absolute;inset:0;background:radial-gradient(420px 260px at 20% 0%,rgba(99,102,241,.45),transparent 70%);pointer-events:none}
.auth-side > *{position:relative}
.auth-side-copy h3{font-size:24px;font-weight:800;letter-spacing:-.03em;line-height:1.15;margin-bottom:16px}
.auth-side-copy ul{list-style:none;display:flex;flex-direction:column;gap:11px}
.auth-side-copy li{display:flex;gap:9px;font-size:14px;color:rgba(255,255,255,.82);line-height:1.45}
.auth-side-copy svg{width:17px;height:17px;flex-shrink:0;fill:none;stroke:#A5B4FC;stroke-width:2.6;margin-top:1px}
.auth-side-cv{margin-top:auto;margin-bottom:-60px;height:250px;transform:rotate(-4deg) translateX(18px);border-radius:6px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.45)}
.auth-main{padding:36px 36px 30px;min-width:0}
.auth-mobile-mark{display:none}
.auth-hd{display:flex;flex-direction:column;align-items:flex-start;text-align:left;margin-bottom:20px}
.auth-hd h2{font-size:24px;font-weight:800;letter-spacing:-.03em;margin-top:0}
.auth-hd p{font-size:14.5px;color:var(--c-text2);margin-top:6px;max-width:360px}
@media (max-width:760px){
  .auth{grid-template-columns:1fr;max-width:440px}
  .auth-side{display:none}
  .auth-main{padding:30px 24px 26px}
  .auth-mobile-mark{display:inline-flex;margin-bottom:14px}
}
.auth-seg{display:flex;width:100%;margin-bottom:18px}
.auth-seg button{flex:1}
.auth-ref{margin-bottom:14px}
.google-btn{display:flex;justify-content:center;min-height:44px;margin-bottom:4px}
.google-btn.hidden{display:none}
.auth-or{display:flex;align-items:center;gap:10px;margin:14px 0;color:var(--c-text3);font-size:12.5px}
.auth-or::before,.auth-or::after{content:'';flex:1;height:1px;background:var(--c-border)}
.auth-lbl-row{display:flex;align-items:baseline;justify-content:space-between}
.auth-small{font-size:12.5px}
.pw-wrap{position:relative}
.pw-wrap .f-inp{padding-right:60px}
.pw-toggle{position:absolute;right:6px;top:50%;transform:translateY(-50%);height:28px;padding:0 8px;border:none;background:none;color:var(--c-text2);font-size:12.5px;font-weight:500;border-radius:6px}
.pw-toggle:hover{background:var(--c-surface2)}
.f-inp.err{border-color:var(--c-rose)}
.field-err{font-size:12.5px;color:var(--c-rose);margin-top:5px}
.terms{display:flex;gap:9px;align-items:flex-start;font-size:13px;color:var(--c-text2);margin:4px 0 14px;line-height:1.5;cursor:pointer}
.terms input{margin-top:3px;accent-color:var(--c-accent);width:15px;height:15px;flex-shrink:0}
.auth-err{margin-bottom:14px}
.auth-back{display:block;margin:16px auto 0;font-size:13px}
</style>
