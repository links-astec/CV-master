<template>
  <Teleport to="body">
    <div class="modal-backdrop auth-backdrop" @click.self="close">
      <div class="modal auth" role="dialog" aria-modal="true" aria-labelledby="au-title">
        <button class="icon-btn modal-close" @click="close" :aria-label="$t('Close')">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="auth-main">
          <div class="auth-hd">
            <BrandLogo mark-only class="auth-mark" />
            <h2 id="au-title">{{ $t(TITLES[view]) }}</h2>
            <p>{{ $t(subtitle) }}</p>
          </div>

          <!-- Sign in / Create account -->
          <template v-if="view === 'signin' || view === 'register'">
            <p v-if="view === 'register' && refCode" class="auth-ref">
              <strong>{{ refName ? $t('{name} invited you.', { name: refName }) : $t('You were invited.') }}</strong> {{ $t('They earn a free export credit when you join.') }}
            </p>

            <div ref="googleEl" class="google-btn" :class="{ hidden: !googleReady }"></div>
            <div v-if="googleReady" class="auth-or"><span>{{ $t('or') }}</span></div>

            <form @submit.prevent="view === 'signin' ? submitLogin() : submitRegister()" novalidate>
              <div class="auth-group" :class="{ err: errors.name || errors.email || errors.password }">
                <input v-if="view === 'register'" id="au-name" class="auth-in" v-model="form.name" autocomplete="name"
                       :placeholder="$t('Full name')" :aria-label="$t('Full name')" :aria-invalid="!!errors.name" />
                <input id="au-email" class="auth-in" v-model="form.email" type="email" autocomplete="email" inputmode="email"
                       :placeholder="$t('Email')" :aria-label="$t('Email')" :aria-invalid="!!errors.email" @blur="onEmailBlur" />
                <div class="auth-pw">
                  <input id="au-pw" class="auth-in" v-model="form.password" :type="showPw ? 'text' : 'password'"
                         :autocomplete="view === 'signin' ? 'current-password' : 'new-password'" :aria-invalid="!!errors.password"
                         :placeholder="$t(view === 'register' ? 'Password (8 characters or more)' : 'Password')" :aria-label="$t('Password')" />
                  <button type="button" class="auth-show" @click="showPw = !showPw">{{ $t(showPw ? 'Hide' : 'Show') }}</button>
                </div>
              </div>
              <div v-for="k in ['name', 'email', 'password']" :key="k">
                <p v-if="errors[k]" class="auth-msg err">{{ $t(errors[k]) }}</p>
              </div>
              <p v-if="!errors.email && emailSuggestion" class="auth-msg">{{ $t('Did you mean') }} <button type="button" class="auth-link" @click="form.email = emailSuggestion; emailSuggestion = ''; onEmailBlur()">{{ emailSuggestion }}</button>?</p>
              <button v-if="view === 'signin'" type="button" class="auth-link auth-forgot" @click="switchView('forgot')">{{ $t('Forgot password?') }}</button>

              <label v-if="view === 'register'" class="auth-check">
                <input type="checkbox" v-model="newsletter" />
                <span>{{ $t('Email me CV tips and CVMaster news. At most a couple a month.') }}</span>
              </label>

              <p v-if="serverError" class="auth-msg err auth-server">{{ $t(serverError) }}</p>

              <button type="submit" class="auth-cta" :disabled="loading">
                {{ $t(loading ? 'Please wait…' : view === 'signin' ? 'Sign in' : 'Create account') }}
              </button>
              <p v-if="view === 'register'" class="auth-legal">
                {{ $t('By creating an account, you agree to the') }} <a href="/terms" target="_blank" rel="noopener">{{ $t('Terms') }}</a> {{ $t('and the') }} <a href="/privacy" target="_blank" rel="noopener">{{ $t('Privacy Policy') }}</a>.
              </p>
            </form>

            <p class="auth-switch">
              <template v-if="view === 'register'">{{ $t('Already have an account?') }} <button type="button" class="auth-link" @click="switchView('signin')">{{ $t('Sign in') }}</button></template>
              <template v-else>{{ $t('New to CVMaster?') }} <button type="button" class="auth-link" @click="switchView('register')">{{ $t('Create an account') }}</button></template>
            </p>
          </template>

          <!-- Forgot password -->
          <template v-else-if="view === 'forgot'">
            <p v-if="forgotSent" class="auth-done">{{ $t('If an account exists for {email}, a reset link is on its way. It expires in 1 hour. Check your spam folder too.', { email: form.email }) }}</p>
            <form v-else @submit.prevent="submitForgot" novalidate>
              <div class="auth-group" :class="{ err: errors.email }">
                <input id="au-femail" class="auth-in" v-model="form.email" type="email" autocomplete="email" :placeholder="$t('Email')" :aria-label="$t('Email')" />
              </div>
              <p v-if="errors.email" class="auth-msg err">{{ $t(errors.email) }}</p>
              <p v-if="serverError" class="auth-msg err auth-server">{{ $t(serverError) }}</p>
              <button type="submit" class="auth-cta" :disabled="loading">{{ $t(loading ? 'Sending…' : 'Send reset link') }}</button>
            </form>
            <p class="auth-switch"><button type="button" class="auth-link" @click="switchView('signin')">{{ $t('Back to sign in') }}</button></p>
          </template>

          <!-- Reset password (link from email) -->
          <template v-else>
            <p v-if="resetTokenError" class="auth-msg err">{{ $t(resetTokenError) }}</p>
            <form v-else @submit.prevent="submitReset" novalidate>
              <div class="auth-group" :class="{ err: errors.password || errors.confirm }">
                <input id="au-npw" class="auth-in" v-model="form.password" type="password" autocomplete="new-password" :placeholder="$t('New password (8 characters or more)')" :aria-label="$t('New password')" />
                <input id="au-cpw" class="auth-in" v-model="form.confirm" type="password" autocomplete="new-password" :placeholder="$t('Confirm password')" :aria-label="$t('Confirm password')" />
              </div>
              <p v-if="errors.password" class="auth-msg err">{{ $t(errors.password) }}</p>
              <p v-if="errors.confirm" class="auth-msg err">{{ $t(errors.confirm) }}</p>
              <p v-if="serverError" class="auth-msg err auth-server">{{ $t(serverError) }}</p>
              <button type="submit" class="auth-cta" :disabled="loading">{{ $t(loading ? 'Saving…' : 'Set new password') }}</button>
            </form>
            <p class="auth-switch"><button type="button" class="auth-link" @click="switchView('forgot')">{{ $t('Request a new link') }}</button></p>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { suggestEmail, checkEmail } from '../../composables/emailTypos.js'
import { useAuthStore } from '../../stores/auth.js'
import BrandLogo from '../BrandLogo.vue'
import { lang, googleLocale } from '../../i18n/index.js'

const props = defineProps({
  initialView: { type: String, default: 'register' },   // signin | register | forgot | reset
  reason:      { type: String, default: '' },           // why we're asking (export, download…)
})
const emit = defineEmits(['done', 'close'])

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path
const auth = useAuthStore()

const TITLES = { signin: 'Sign in', register: 'Create your account', forgot: 'Reset your password', reset: 'Choose a new password' }
const REASONS = {
  export:   'Create a free account to export. The CV you built comes with you.',
  download: 'Create a free account to download. The CV you built comes with you.',
  save:     'Create a free account to keep your CV safe and edit it anywhere.',
  ai:       'Create a free account to buy extra AI requests. They’re saved to your account.',
  invite:   'Create a free account to get your invite link. Every friend who gets their first clean CV earns you a free one.',
}

const view   = ref(props.initialView === 'signin' || props.initialView === 'forgot' || props.initialView === 'reset' ? props.initialView : 'register')
const loading = ref(false)
const showPw  = ref(false)
const newsletter = ref(false)   // optional, never pre-ticked (GDPR)
const serverError = ref('')
const forgotSent  = ref(false)
const resetToken  = ref('')
const resetTokenError = ref('')
const form   = ref({ name: '', email: '', password: '', confirm: '' })
const errors = ref({})

// Sign-up: suggest a fix for domain typos, then ask the server whether the domain can
// receive email and isn't a throwaway service
const emailSuggestion = ref('')
async function onEmailBlur() {
  if (view.value !== 'register' || !form.value.email.trim()) return
  emailSuggestion.value = suggestEmail(form.value.email)
  if (emailSuggestion.value) return
  const r = await checkEmail(form.value.email)
  if (!r.ok) errors.value = { ...errors.value, email: r.error }
  else if (errors.value.email) { const { email, ...rest } = errors.value; errors.value = rest }
}

const subtitle = computed(() => {
  if (view.value === 'forgot') return 'Enter your email and we’ll send you a reset link.'
  if (view.value === 'reset')  return 'Use at least 8 characters.'
  if (props.reason && REASONS[props.reason]) return REASONS[props.reason]
  return view.value === 'signin' ? 'Your CVs are waiting for you.' : 'Free to build. Pay only when you export.'
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
  if (fields.includes('confirm') && form.value.password !== form.value.confirm) e.confirm = 'The passwords don’t match.'
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
const submitRegister = () => check(['name', 'email', 'newPassword']) && run(async () => {
  await auth.register(form.value.email.trim(), form.value.password, form.value.name.trim(), refCode.value, newsletter.value)
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
    theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: googleLocale(),
    width: Math.min(googleEl.value.clientWidth || 360, 400),
  })
  googleReady.value = true
}
async function onGoogleCredential(response) {
  await run(async () => {
    await auth.loginWithGoogle(response.credential, refCode.value, view.value === 'register' && newsletter.value)
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
watch(lang, () => nextTick(renderGoogle))   // Google button in the interface language

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
.auth{max-width:420px;padding:0;background:var(--c-bg);border:none;border-radius:26px}
.auth-main{padding:40px 28px 28px}
.auth-hd{display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:24px}
.auth-mark{margin-bottom:16px}
.auth-mark :deep(svg){height:34px;width:auto}
.auth-hd h2{font-size:28px;font-weight:700;letter-spacing:-.03em;line-height:1.15;margin:0}
.auth-hd p{font-size:15px;color:var(--c-text2);margin:6px 0 0;line-height:1.45}
.auth-ref{font-size:13.5px;color:var(--c-text2);text-align:center;margin:-8px 0 18px;line-height:1.5}
.auth-ref strong{color:var(--c-text)}
.google-btn{display:flex;justify-content:center;min-height:44px}
.google-btn.hidden{display:none}
.auth-or{display:flex;align-items:center;gap:12px;margin:16px 0;color:var(--c-text3);font-size:13px}
.auth-or::before,.auth-or::after{content:'';flex:1;height:1px;background:var(--hair)}
/* Fields as one group, like iOS */
.auth-group{background:var(--c-surface);border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--hair)}
.auth-group.err{box-shadow:0 0 0 1.5px var(--c-rose)}
.auth-in{display:block;width:100%;height:52px;padding:0 16px;border:none;background:none;font:inherit;font-size:16px;color:var(--c-text);outline:none}
.auth-in::placeholder{color:var(--c-text3)}
.auth-group > * + *{border-top:1px solid var(--hair)}
.auth-pw{position:relative}
.auth-pw .auth-in{padding-right:70px}
.auth-show{position:absolute;right:8px;top:50%;transform:translateY(-50%);height:32px;padding:0 10px;border:none;background:none;font:inherit;font-size:14px;font-weight:500;color:var(--c-accent);cursor:pointer}
.auth-msg{font-size:13px;color:var(--c-text2);margin:8px 4px 0;line-height:1.45}
.auth-msg.err{color:var(--c-rose)}
.auth-server{margin-top:12px}
.auth-link{border:none;background:none;padding:0;font:inherit;font-weight:600;color:var(--c-accent);cursor:pointer}
.auth-link:hover{text-decoration:underline}
.auth-forgot{display:block;margin:10px 4px 0 auto;font-size:14px}
.auth-check{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:var(--c-text2);line-height:1.45;margin:14px 4px 0;cursor:pointer}
.auth-check input{margin-top:2px;width:17px;height:17px;flex-shrink:0;accent-color:var(--c-accent)}
.auth-cta{display:block;width:100%;height:52px;margin-top:20px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:16px;font-weight:600;cursor:pointer;transition:opacity .2s}
.auth-cta:disabled{opacity:.55;cursor:default}
.auth-legal{font-size:12.5px;color:var(--c-text3);text-align:center;line-height:1.5;margin:12px 8px 0}
.auth-legal a{color:var(--c-text2)}
.auth-switch{text-align:center;font-size:14.5px;color:var(--c-text2);margin:22px 0 0}
.auth-done{font-size:15px;line-height:1.5;color:var(--c-text);background:var(--c-surface);border-radius:14px;padding:16px}
/* Phones: a full page the height of what's really visible (dvh), never cut off */
@media (max-width:560px){
  .auth-backdrop{padding:0;align-items:stretch}
  .auth{max-width:100%;height:100vh;height:100dvh;max-height:100dvh;border-radius:0;overflow-y:auto;-webkit-overflow-scrolling:touch}
  .auth-main{padding:calc(56px + env(safe-area-inset-top)) 22px calc(28px + env(safe-area-inset-bottom))}
  .auth .modal-close{top:calc(12px + env(safe-area-inset-top))}
}
</style>
