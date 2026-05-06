<template>
  <Teleport to="body">
    <div class="auth-root">
      <!-- LEFT PANEL -->
      <div class="auth-left">
        <div class="auth-left-inner">
          <div class="al-logo">
            <div class="al-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
            </div>
            <span>PerfectCV</span>
          </div>
          <div class="al-hero">
            <h1>Land your<br/><em>dream role</em></h1>
            <p>AI-powered CV builder used by thousands of professionals to get hired faster.</p>
          </div>
          <div class="al-features">
            <div class="al-feat" v-for="f in features" :key="f.label">
              <div class="al-feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="f.icon"></svg>
              </div>
              <span>{{ f.label }}</span>
            </div>
          </div>
          <div class="al-pills">
            <span v-for="t in tplPills" :key="t.label" class="al-pill" :style="`background:${t.bg};color:${t.fg}`">{{ t.label }}</span>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="auth-right">
        <div class="auth-form-wrap">
          <div class="auth-mobile-logo">
            <div class="al-logo-mark" style="width:34px;height:34px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
            </div>
            <span class="al-logo-text">PerfectCV</span>
          </div>

          <Transition name="auth-slide" mode="out-in">

            <!-- LOGIN -->
            <div v-if="view === 'login'" key="login">
              <h2 class="auth-title">Welcome back</h2>
              <p class="auth-sub">Sign in to continue building your CV.</p>
              <div class="auth-fields">
                <div class="auth-field">
                  <label>Email address</label>
                  <div class="auth-input-wrap">
                    <svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
                    <input v-model="form.email" type="email" placeholder="you@example.com" autocomplete="email" :class="{ err: errors.email }" @input="errors.email=''" @keydown.enter="submitLogin"/>
                  </div>
                  <div v-if="errors.email" class="field-err">{{ errors.email }}</div>
                </div>
                <div class="auth-field">
                  <div class="auth-field-hd">
                    <label>Password</label>
                    <button class="forgot-link" type="button" @click="view='forgot'">Forgot password?</button>
                  </div>
                  <div class="auth-input-wrap">
                    <svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    <input v-model="form.password" :type="showPw?'text':'password'" placeholder="Your password" autocomplete="current-password" :class="{ err: errors.password }" @input="errors.password=''" @keydown.enter="submitLogin"/>
                    <button type="button" class="pw-toggle" @click="showPw=!showPw">
                      <svg v-if="showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                  <div v-if="errors.password" class="field-err">{{ errors.password }}</div>
                </div>
              </div>
              <div v-if="serverError" class="server-err">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ serverError }}
              </div>
              <button class="auth-submit" @click="submitLogin" :disabled="loading">
                <svg v-if="loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                {{ loading ? 'Signing in...' : 'Sign in' }}
              </button>
              <div class="auth-sep"><div></div><span>or continue with</span><div></div></div>
              <!-- Google button rendered by GIS SDK -->
              <div id="google-signin-login" class="google-btn-wrap"></div>
              <div v-if="!googleConfigured" class="google-unavail">Google sign-in not configured</div>
              <button class="demo-btn" @click="demoLogin" :disabled="loading">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Try demo — no account needed
              </button>
              <p class="auth-switch">Don't have an account? <button @click="view='register'">Sign up free</button></p>
            </div>

            <!-- REGISTER -->
            <div v-else-if="view === 'register'" key="register">
              <h2 class="auth-title">Create account</h2>
              <p class="auth-sub">Free to start — no credit card needed.</p>
              <div class="auth-fields">
                <div class="auth-field">
                  <label>Full name</label>
                  <div class="auth-input-wrap">
                    <svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    <input v-model="form.name" type="text" placeholder="Alexandra Morrison" autocomplete="name" :class="{ err: errors.name }" @input="errors.name=''" @keydown.enter="submitRegister"/>
                  </div>
                  <div v-if="errors.name" class="field-err">{{ errors.name }}</div>
                </div>
                <div class="auth-field">
                  <label>Email address</label>
                  <div class="auth-input-wrap">
                    <svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
                    <input v-model="form.email" type="email" placeholder="you@example.com" autocomplete="email" :class="{ err: errors.email }" @input="errors.email=''" @keydown.enter="submitRegister"/>
                  </div>
                  <div v-if="errors.email" class="field-err">{{ errors.email }}</div>
                </div>
                <div class="auth-field">
                  <label>Password</label>
                  <div class="auth-input-wrap">
                    <svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    <input v-model="form.password" :type="showPw?'text':'password'" placeholder="Min. 8 characters" autocomplete="new-password" :class="{ err: errors.password }" @input="errors.password=''" @keydown.enter="submitRegister"/>
                    <button type="button" class="pw-toggle" @click="showPw=!showPw">
                      <svg v-if="showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                  <div v-if="errors.password" class="field-err">{{ errors.password }}</div>
                  <div class="pw-strength">
                    <div v-for="n in 4" :key="n" class="pw-bar" :class="{ [`s${pwStrength}`]: pwStrength >= n }"></div>
                    <span v-if="form.password">{{ ['','Weak','Fair','Good','Strong'][pwStrength] }}</span>
                  </div>
                </div>
              </div>
              <div v-if="serverError" class="server-err">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ serverError }}
              </div>
              <button class="auth-submit" @click="submitRegister" :disabled="loading">
                <svg v-if="loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                {{ loading ? 'Creating account...' : 'Create account' }}
              </button>
              <div class="auth-sep"><div></div><span>or continue with</span><div></div></div>
              <div id="google-signin-register" class="google-btn-wrap"></div>
              <div v-if="!googleConfigured" class="google-unavail">Google sign-in not configured</div>
              <p class="auth-switch">Already have an account? <button @click="view='login'">Sign in</button></p>
              <p class="auth-legal">By creating an account you agree to our <a href="/legal" target="_blank">Terms of Service</a> and <a href="/legal" target="_blank">Privacy Policy</a>.</p>
            </div>

            <!-- FORGOT PASSWORD -->
            <div v-else-if="view === 'forgot'" key="forgot">
              <button class="back-btn" @click="view='login'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to sign in
              </button>
              <h2 class="auth-title">Reset password</h2>
              <p class="auth-sub">Enter your email and we'll send a reset link. Check spam if you don't see it.</p>
              <div v-if="forgotSent" class="success-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
                <div><div style="font-weight:700;margin-bottom:3px;">Check your inbox</div><div>We sent a reset link to <strong>{{ form.email }}</strong>. It expires in 1 hour.</div></div>
              </div>
              <div v-else>
                <div class="auth-fields">
                  <div class="auth-field">
                    <label>Email address</label>
                    <div class="auth-input-wrap">
                      <svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
                      <input v-model="form.email" type="email" placeholder="you@example.com" autocomplete="email" :class="{ err: errors.email }" @input="errors.email=''" @keydown.enter="submitForgot"/>
                    </div>
                    <div v-if="errors.email" class="field-err">{{ errors.email }}</div>
                  </div>
                </div>
                <div v-if="serverError" class="server-err"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{{ serverError }}</div>
                <button class="auth-submit" @click="submitForgot" :disabled="loading">
                  <svg v-if="loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                  {{ loading ? 'Sending...' : 'Send reset link' }}
                </button>
              </div>
            </div>

            <!-- RESET PASSWORD -->
            <div v-else-if="view === 'reset'" key="reset">
              <h2 class="auth-title">Set new password</h2>
              <p class="auth-sub">Choose a strong password for your account.</p>
              <div v-if="resetTokenError" class="server-err" style="margin-bottom:16px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ resetTokenError }}
              </div>
              <div v-else>
                <div class="auth-fields">
                  <div class="auth-field">
                    <label>New password</label>
                    <div class="auth-input-wrap">
                      <svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      <input v-model="form.password" :type="showPw?'text':'password'" placeholder="Min. 8 characters" autocomplete="new-password" :class="{ err: errors.password }" @input="errors.password=''"/>
                      <button type="button" class="pw-toggle" @click="showPw=!showPw">
                        <svg v-if="showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                    <div v-if="errors.password" class="field-err">{{ errors.password }}</div>
                    <div class="pw-strength">
                      <div v-for="n in 4" :key="n" class="pw-bar" :class="{ [`s${pwStrength}`]: pwStrength >= n }"></div>
                      <span v-if="form.password">{{ ['','Weak','Fair','Good','Strong'][pwStrength] }}</span>
                    </div>
                  </div>
                  <div class="auth-field">
                    <label>Confirm password</label>
                    <div class="auth-input-wrap">
                      <svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      <input v-model="form.confirm" :type="showPw?'text':'password'" placeholder="Repeat password" autocomplete="new-password" :class="{ err: errors.confirm }" @input="errors.confirm=''"/>
                    </div>
                    <div v-if="errors.confirm" class="field-err">{{ errors.confirm }}</div>
                  </div>
                </div>
                <div v-if="serverError" class="server-err"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{{ serverError }}</div>
                <button class="auth-submit" @click="submitReset" :disabled="loading">
                  <svg v-if="loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                  {{ loading ? 'Saving...' : 'Set new password' }}
                </button>
              </div>
            </div>

          </Transition>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

const auth = useAuthStore()
const emit = defineEmits(['done'])

const view            = ref('login')
const loading         = ref(false)
const showPw          = ref(false)
const serverError     = ref('')
const forgotSent      = ref(false)
const resetToken      = ref('')
const resetTokenError = ref('')
const googleConfigured = ref(false)

const form   = ref({ name: '', email: '', password: '', confirm: '' })
const errors = ref({ name: '', email: '', password: '', confirm: '' })

const pwStrength = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8)           s++
  if (/[A-Z]/.test(p))         s++
  if (/[0-9]/.test(p))         s++
  if (/[^A-Za-z0-9]/.test(p))  s++
  return s
})

const features = [
  { label: '16 professionally designed templates', icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
  { label: 'AI writing assistance powered by Groq', icon: '<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2"/>' },
  { label: 'ATS-optimised formatting',              icon: '<polyline points="20 6 9 17 4 12"/>' },
  { label: 'PDF export with one click',             icon: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' },
]
const tplPills = [
  { label: 'Executive',   bg: '#1a1916', fg: '#c9a84c' },
  { label: 'Modern Azure',bg: '#2a5bd7', fg: '#fff'    },
  { label: 'Minimal',     bg: '#f5f4f0', fg: '#1a1916' },
  { label: 'Tech Dark',   bg: '#0c1018', fg: '#60a5fa' },
  { label: 'Creative',    bg: '#f0ebfa', fg: '#6236b0' },
  { label: 'Photo Pro',   bg: '#e8eefb', fg: '#2a5bd7' },
]

// ── Google Identity Services ──────────────────────────────────
function initGoogle() {
  // Get client ID from meta tag injected at build time, or from window
  const clientId = document.querySelector('meta[name="google-client-id"]')?.content
                || window.__GOOGLE_CLIENT_ID__

  if (!clientId || clientId === 'undefined' || !window.google?.accounts?.id) {
    googleConfigured.value = false
    return
  }

  googleConfigured.value = true

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
  })

  renderGoogleButtons()
}

function renderGoogleButtons() {
  nextTick(() => {
    const loginEl    = document.getElementById('google-signin-login')
    const registerEl = document.getElementById('google-signin-register')
    const opts = { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
    if (loginEl    && window.google?.accounts?.id) window.google.accounts.id.renderButton(loginEl,    opts)
    if (registerEl && window.google?.accounts?.id) window.google.accounts.id.renderButton(registerEl, opts)
  })
}

// Re-render Google button when switching views
watch(view, () => {
  if (googleConfigured.value) renderGoogleButtons()
})

async function handleGoogleCredential(response) {
  loading.value = true; serverError.value = ''
  try {
    await auth.loginWithGoogle(response.credential)
    emit('done')
  } catch (e) { serverError.value = e.message }
  loading.value = false
}

onMounted(() => {
  // Check for reset token in URL
  const params = new URLSearchParams(window.location.search)
  const token  = params.get('token')
  if (token) {
    resetToken.value = token
    view.value = 'reset'
    fetch(`/api/auth/reset-password/${token}`)
      .then(r => r.json())
      .then(d => { if (!d.valid) resetTokenError.value = d.error || 'This reset link is invalid or has expired.' })
      .catch(() => { resetTokenError.value = 'Could not validate reset link.' })
  }

  // Wait for Google script to load then init
  if (window.google?.accounts?.id) {
    initGoogle()
  } else {
    window.addEventListener('load', initGoogle, { once: true })
    // Fallback poll in case load already fired
    const poll = setInterval(() => {
      if (window.google?.accounts?.id) { clearInterval(poll); initGoogle() }
    }, 300)
    setTimeout(() => clearInterval(poll), 10000)
  }
})

// ── Validation ────────────────────────────────────────────────
function validateEmail() {
  if (!form.value.email) { errors.value.email = 'Email is required.'; return false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) { errors.value.email = 'Enter a valid email.'; return false }
  return true
}
function validatePassword(min = true) {
  if (min && form.value.password.length < 8) { errors.value.password = 'At least 8 characters required.'; return false }
  if (!form.value.password) { errors.value.password = 'Password is required.'; return false }
  return true
}
function clearErrors() { errors.value = { name:'', email:'', password:'', confirm:'' }; serverError.value = '' }

// ── Submit handlers ───────────────────────────────────────────
async function submitLogin() {
  clearErrors()
  if (!validateEmail()) return
  if (!form.value.password) { errors.value.password = 'Password is required.'; return }
  loading.value = true
  try { await auth.login(form.value.email, form.value.password); emit('done') }
  catch (e) { serverError.value = e.message }
  loading.value = false
}

async function submitRegister() {
  clearErrors()
  if (!form.value.name.trim()) { errors.value.name = 'Name is required.'; return }
  if (!validateEmail()) return
  if (!validatePassword()) return
  loading.value = true
  try { await auth.register(form.value.email, form.value.password, form.value.name); emit('done') }
  catch (e) { serverError.value = e.message }
  loading.value = false
}

async function submitForgot() {
  clearErrors()
  if (!validateEmail()) return
  loading.value = true
  try { await auth.forgotPassword(form.value.email); forgotSent.value = true }
  catch (e) { serverError.value = e.message }
  loading.value = false
}

async function submitReset() {
  clearErrors()
  if (!validatePassword()) return
  if (form.value.password !== form.value.confirm) { errors.value.confirm = 'Passwords do not match.'; return }
  loading.value = true
  try {
    await auth.resetPassword(resetToken.value, form.value.password)
    window.history.replaceState({}, '', window.location.pathname)
    emit('done')
  } catch (e) { serverError.value = e.message }
  loading.value = false
}

async function demoLogin() {
  loading.value = true; serverError.value = ''
  const demoEmail = `demo_${Date.now()}@perfectcv.app`
  try {
    await auth.register(demoEmail, 'Demo1234!', 'Demo User')
    emit('done')
  } catch (e) { serverError.value = 'Demo failed: ' + e.message }
  loading.value = false
}
</script>

<style scoped>
.auth-root { position:fixed;inset:0;z-index:2000;display:grid;grid-template-columns:1fr 1fr;background:#fff;overflow:hidden; }
.auth-left { background:#0f0e0c;display:flex;align-items:center;justify-content:center;padding:48px;position:relative;overflow:hidden; }
.auth-left::before { content:'';position:absolute;top:-100px;right:-80px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(42,91,215,.4) 0%,transparent 70%);pointer-events:none; }
.auth-left::after { content:'';position:absolute;bottom:-100px;left:-60px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(98,54,176,.3) 0%,transparent 70%);pointer-events:none; }
.auth-left-inner { max-width:360px;width:100%;position:relative;z-index:1; }
.al-logo { display:flex;align-items:center;gap:10px;margin-bottom:44px; }
.al-logo-mark { width:38px;height:38px;background:#2a5bd7;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.al-logo-mark svg { width:20px;height:20px; }
.al-logo span { font-family:'DM Serif Display',serif;font-size:20px;color:#fff;letter-spacing:-.01em; }
.al-hero { margin-bottom:32px; }
.al-hero h1 { font-family:'DM Serif Display',serif;font-size:44px;line-height:1.1;color:#fff;margin-bottom:12px;letter-spacing:-.02em; }
.al-hero h1 em { color:#4a7dff;font-style:normal; }
.al-hero p { font-size:14px;color:#6b6860;line-height:1.6; }
.al-features { display:flex;flex-direction:column;gap:10px;margin-bottom:28px; }
.al-feat { display:flex;align-items:center;gap:10px; }
.al-feat-icon { width:28px;height:28px;border-radius:7px;background:rgba(42,91,215,.18);border:1px solid rgba(42,91,215,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.al-feat-icon svg { width:13px;height:13px;color:#4a7dff; }
.al-feat span { font-size:13px;color:#6b6860; }
.al-pills { display:flex;flex-wrap:wrap;gap:7px; }
.al-pill { font-size:10.5px;font-weight:600;padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,.06); }
.auth-right { display:flex;align-items:flex-start;justify-content:center;padding:40px 36px;background:#fff;overflow-y:auto; }
.auth-form-wrap { width:100%;max-width:380px;padding-top:20px; }
.auth-mobile-logo { display:none;align-items:center;gap:10px;margin-bottom:28px;justify-content:center; }
.al-logo-text { font-family:'DM Serif Display',serif;font-size:18px;color:#1a1916; }
.auth-title { font-family:'DM Serif Display',serif;font-size:30px;color:#1a1916;margin-bottom:7px;letter-spacing:-.02em; }
.auth-sub { font-size:13.5px;color:#6b6860;margin-bottom:24px;line-height:1.5; }
.auth-fields { display:flex;flex-direction:column;gap:14px;margin-bottom:18px; }
.auth-field label { display:block;font-size:12px;font-weight:600;color:#1a1916;margin-bottom:6px; }
.auth-field-hd { display:flex;align-items:center;justify-content:space-between;margin-bottom:6px; }
.auth-field-hd label { margin-bottom:0; }
.forgot-link { font-size:12px;font-weight:600;color:#2a5bd7;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif; }
.forgot-link:hover { text-decoration:underline; }
.auth-input-wrap { position:relative; }
.fi-icon { position:absolute;left:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:#b0ada6;pointer-events:none; }
.auth-input-wrap input { width:100%;padding:11px 42px 11px 40px;border:1.5px solid #e8e6e0;border-radius:10px;font-size:13.5px;font-family:'DM Sans',sans-serif;color:#1a1916;background:#fafaf9;outline:none;transition:border-color .15s,background .15s,box-shadow .15s; }
.auth-input-wrap input:focus { border-color:#2a5bd7;background:#fff;box-shadow:0 0 0 3px rgba(42,91,215,.1); }
.auth-input-wrap input.err { border-color:#c52b3d; }
.auth-input-wrap input::placeholder { color:#c8c4be; }
.pw-toggle { position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:3px;color:#a09d96;display:flex;align-items:center;transition:color .14s; }
.pw-toggle:hover { color:#1a1916; }
.pw-toggle svg { width:15px;height:15px; }
.field-err { font-size:11.5px;color:#c52b3d;margin-top:5px;font-weight:500; }
.pw-strength { display:flex;align-items:center;gap:4px;margin-top:8px; }
.pw-bar { flex:1;height:3px;border-radius:2px;background:#e8e6e0;transition:background .2s; }
.pw-bar.s1 { background:#c52b3d; }
.pw-bar.s2 { background:#b56a0e; }
.pw-bar.s3,.pw-bar.s4 { background:#1a7a4a; }
.pw-strength span { font-size:11px;color:#a09d96;font-weight:600;min-width:38px; }
.server-err { display:flex;align-items:flex-start;gap:8px;background:#fce9eb;border:1px solid #f5c0c8;color:#c52b3d;font-size:12.5px;padding:10px 13px;border-radius:9px;margin-bottom:14px;line-height:1.5; }
.success-box { display:flex;align-items:flex-start;gap:12px;background:#e6f5ed;border:1px solid #a0e0b8;color:#1a7a4a;font-size:13px;padding:14px 16px;border-radius:10px;line-height:1.5; }
.auth-submit { width:100%;background:#1a1916;color:#fff;border:none;padding:13px 20px;border-radius:11px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;font-family:'DM Sans',sans-serif;transition:background .18s,transform .1s;margin-bottom:14px; }
.auth-submit:hover:not(:disabled) { background:#2a5bd7; }
.auth-submit:active:not(:disabled) { transform:scale(.98); }
.auth-submit:disabled { opacity:.6;cursor:not-allowed; }
.auth-sep { display:flex;align-items:center;gap:12px;margin-bottom:14px; }
.auth-sep div { flex:1;height:1px;background:#e8e6e0; }
.auth-sep span { font-size:12px;color:#a09d96;white-space:nowrap; }
/* Google rendered button container */
.google-btn-wrap { width:100%;margin-bottom:10px;min-height:44px; }
.google-btn-wrap :deep(div[role="button"]) { width:100% !important;border-radius:11px !important; }
.google-unavail { text-align:center;font-size:12px;color:#b0ada6;padding:10px;margin-bottom:10px;border:1px dashed #e8e6e0;border-radius:10px; }
.demo-btn { width:100%;background:none;border:1.5px solid #e8e6e0;color:#6b6860;padding:11px 20px;border-radius:11px;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;font-family:'DM Sans',sans-serif;transition:border-color .15s,color .15s;margin-bottom:18px; }
.demo-btn:hover:not(:disabled) { border-color:#2a5bd7;color:#2a5bd7; }
.demo-btn:disabled { opacity:.5;cursor:not-allowed; }
.back-btn { display:flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer;font-size:13px;font-weight:600;color:#6b6860;font-family:'DM Sans',sans-serif;margin-bottom:20px;padding:0;transition:color .14s; }
.back-btn:hover { color:#1a1916; }
.auth-switch { font-size:13px;color:#6b6860;text-align:center;margin-bottom:10px; }
.auth-switch button { background:none;border:none;color:#2a5bd7;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:4px; }
.auth-switch button:hover { text-decoration:underline; }
.auth-legal { font-size:11px;color:#b0ada6;text-align:center;line-height:1.5; }
.auth-legal a { color:#6b6860; }
.auth-slide-enter-active,.auth-slide-leave-active { transition:opacity .2s,transform .2s; }
.auth-slide-enter-from { opacity:0;transform:translateX(16px); }
.auth-slide-leave-to { opacity:0;transform:translateX(-16px); }
@keyframes spin-anim { to { transform:rotate(360deg); } }
.spin { animation:spin-anim .75s linear infinite; }
@media (max-width:768px) {
  .auth-root { grid-template-columns:1fr; }
  .auth-left { display:none; }
  .auth-right { padding:24px 20px;min-height:100dvh;align-items:flex-start;padding-top:32px; }
  .auth-form-wrap { padding-top:0; }
  .auth-mobile-logo { display:flex; }
  .auth-title { font-size:26px; }
}
</style>