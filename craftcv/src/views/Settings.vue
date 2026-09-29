<template>
  <div class="view-page">
    <div class="view-inner settings-wrap">
      <div class="page-intro"><div><h1>Settings</h1><p>Your account, appearance and referrals.</p></div></div>

      <!-- Guest -->
      <div v-if="!auth.isLoggedIn" class="settings-card">
        <div class="settings-ttl">You're using CVMaster as a guest</div>
        <p class="muted" style="margin-bottom:16px;line-height:1.6">Your CV is saved in this browser only. Create a free account to keep it safe, edit it on any device, export it and earn referral credits.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-primary accent" @click="openAuth('register', 'save')">Create free account</button>
          <button class="btn-secondary" @click="openAuth('signin')">Sign in</button>
        </div>
      </div>

      <!-- Profile -->
      <div v-if="auth.isLoggedIn" class="settings-card">
        <div class="settings-ttl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          Profile
        </div>
        <div class="f-row">
          <div class="f-grp">
            <div class="f-lbl">Display Name</div>
            <input class="f-inp" v-model="name" :placeholder="auth.user?.name" />
          </div>
          <div class="f-grp">
            <div class="f-lbl">Email</div>
            <input class="f-inp" :value="auth.user?.email" disabled style="opacity:.5;cursor:not-allowed;" />
          </div>
        </div>
        <div class="f-grp">
          <div class="f-lbl">New Password <span style="font-size:10px;color:var(--c-text3);margin-left:4px;">optional</span></div>
          <div style="position:relative;">
            <input class="f-inp" v-model="newPassword" :type="showPw ? 'text' : 'password'" placeholder="Leave blank to keep current" style="padding-right:42px;" />
            <button type="button" @click="showPw=!showPw" style="position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--c-text3);">
              <svg v-if="showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div v-if="saveError" style="font-size:12px;color:var(--c-rose);margin-bottom:10px;">{{ saveError }}</div>
        <button class="btn-primary accent" @click="saveProfile" :disabled="saving">
          <svg v-if="saving" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Appearance -->
      <div class="settings-card">
        <div class="settings-ttl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20z"/></svg>
          Appearance
        </div>
        <div class="toggle-row">
          <div>
            <div class="toggle-label">Dark Mode</div>
            <div class="toggle-sub">Switch to a dark interface</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.darkMode" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
      </div>

      <!-- Referral -->
      <div v-if="auth.isLoggedIn" class="settings-card">
        <div class="settings-ttl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          Referral Programme
        </div>

        <div v-if="referralLoading" class="ref-loading">
          <div class="ref-loading-spin"></div> Loading...
        </div>

        <template v-else-if="referralInfo">

          <!-- Stats -->
          <div class="ref-stats">
            <div class="ref-stat">
              <div class="ref-stat-val">{{ referralInfo.count }}</div>
              <div class="ref-stat-lbl">Total referred</div>
            </div>
            <div class="ref-stat">
              <div class="ref-stat-val" style="color:var(--c-green)">{{ referralInfo.recentCount }}</div>
              <div class="ref-stat-lbl">This month</div>
            </div>
            <div class="ref-stat">
              <div class="ref-stat-val" style="color:var(--c-accent)">{{ referralInfo.credits }}</div>
              <div class="ref-stat-lbl">Credits left</div>
            </div>
          </div>

          <!-- Credit use banner -->
          <div v-if="referralInfo.credits > 0" class="ref-credit-banner">
            <div>
              <div style="font-size:13.5px;font-weight:700;color:var(--c-text);margin-bottom:3px;">
                🎉 You have {{ referralInfo.credits }} free export{{ referralInfo.credits > 1 ? 's' : '' }}!
              </div>
              <div style="font-size:12.5px;color:var(--c-text2);">Each credit unlocks the clean PDF of one CV. Choose "Use a referral credit" when you export or download.</div>
            </div>
          </div>

          <!-- How it works -->
          <div class="ref-how">
            <div class="ref-how-step" v-for="(s,i) in refSteps" :key="i">
              <div class="ref-how-ic" :style="{background:s.bg,color:s.color}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:16px;height:16px" v-html="s.icon"/>
              </div>
              <div>
                <div class="ref-how-title">{{ s.title }}</div>
                <div class="ref-how-sub">{{ s.sub }}</div>
              </div>
            </div>
          </div>

          <!-- Referral link -->
          <div class="ref-link-section">
            <div class="f-lbl" style="margin-bottom:8px;">Your referral link</div>
            <div class="ref-link-row">
              <div class="ref-link-box">{{ referralInfo.link }}</div>
              <button class="btn-secondary ref-copy-btn" @click="copyLink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                {{ copied ? '✓ Copied!' : 'Copy' }}
              </button>
            </div>
            <!-- Share buttons -->
            <div class="ref-share-row">
              <button class="ref-share-btn" @click="shareWhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width:15px;height:15px;color:#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
              <button class="ref-share-btn" @click="shareTwitter">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width:15px;height:15px;color:#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X / Twitter
              </button>
              <button class="ref-share-btn" @click="shareLinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width:15px;height:15px;color:#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </button>
            </div>
          </div>

          <!-- Code badge -->
          <div class="ref-code-row">
            <div>
              <div class="f-lbl" style="margin-bottom:4px;">Your code</div>
              <div class="ref-code">{{ referralInfo.code }}</div>
            </div>
            <div style="font-size:12px;color:var(--c-text3);line-height:1.5;max-width:220px;">
              Friends can also enter this code manually at sign-up to credit you.
            </div>
          </div>

        </template>

        <div v-else style="font-size:13px;color:var(--c-text3);">Could not load referral info. Try refreshing.</div>
      </div>

      <!-- Tutorial -->
      <div class="settings-card">
        <div class="settings-ttl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Quick tour
        </div>
        <p style="font-size:13.5px;color:var(--c-text2);line-height:1.6;margin-bottom:14px;">A one-minute walkthrough of creating, tailoring and exporting your CV.</p>
        <button class="btn-secondary" @click="restartTour" style="display:flex;align-items:center;gap:7px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Start the tour
        </button>
      </div>

      <!-- Account -->
      <div v-if="auth.isLoggedIn" class="settings-card">
        <div class="settings-ttl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </div>
        <p class="muted" style="margin-bottom:14px;line-height:1.6">Your CVs stay saved in your account. Signing out also clears them from this browser.</p>
        <button class="btn-secondary" @click="logout">Sign out</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useCvStore } from '../stores/cv.js'

const apiUrl    = (p) => (import.meta.env.VITE_API_URL || '') + p
const auth      = useAuthStore()
const store     = useCvStore()
const showToast = inject('showToast')
const openAuth  = inject('openAuth')

const name        = ref(auth.user?.name || '')
const newPassword = ref('')
const showPw      = ref(false)
const saving      = ref(false)
const saveError   = ref('')

async function saveProfile() {
  saveError.value = ''
  if (newPassword.value && newPassword.value.length < 8) {
    saveError.value = 'Password must be at least 8 characters.'
    return
  }
  saving.value = true
  try {
    const body = {}
    if (name.value && name.value !== auth.user?.name) body.name = name.value
    if (newPassword.value) body.password = newPassword.value
    if (!Object.keys(body).length) { showToast('Nothing to update'); saving.value = false; return }
    const r = await fetch(apiUrl('/api/auth/settings'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    if (auth.user && name.value) auth.user.name = name.value
    newPassword.value = ''
    showToast('Profile saved')
  } catch (e) { saveError.value = e.message }
  saving.value = false
}

// Clear the CV from this browser too, so the next person on a shared computer can't see it
async function logout() {
  await auth.logout()
  store.resetData()
  window.location.href = '/'
}

const startTutorial = inject('startTutorial', null)
function restartTour() {
  try { localStorage.removeItem('cvmaster-tour-done') } catch {}
  startTutorial?.()
}

// ── Referral ──────────────────────────────────────────────────────────────────
const referralInfo    = ref(null)
const referralLoading = ref(true)
const copied          = ref(false)

const refSteps = [
  { title:'Share your link', sub:'Send it to friends looking for a job', bg:'var(--c-accent-lt)', color:'var(--c-accent)', icon:'<path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>' },
  { title:'Friend signs up', sub:'They create their free CVMaster account', bg:'var(--c-teal-lt)', color:'var(--c-teal)', icon:'<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>' },
  { title:'You earn a credit', sub:'1 free clean PDF for you', bg:'var(--c-green-lt)', color:'var(--c-green)', icon:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>' },
]

async function loadReferral() {
  try {
    const r = await fetch(apiUrl('/api/referral/info'), { credentials: 'include' })
    if (r.ok) referralInfo.value = await r.json()
  } catch {}
  referralLoading.value = false
}

async function copyLink() {
  const link = referralInfo.value?.link || ''
  try {
    await navigator.clipboard.writeText(link)
    copied.value = true
    setTimeout(() => copied.value = false, 2500)
  } catch { prompt('Copy your referral link:', link) }
}

function shareWhatsApp() {
  const link = referralInfo.value?.link || ''
  const msg  = encodeURIComponent(`Hey! I've been using CVMaster to build my professional CV — it's amazing and uses AI. Sign up free here: ${link}`)
  window.open(`https://wa.me/?text=${msg}`, '_blank')
}
function shareTwitter() {
  const link = referralInfo.value?.link || ''
  const msg  = encodeURIComponent(`Just built my CV in minutes with CVMaster 🚀 AI-powered and ATS-ready. Try it free: ${link}`)
  window.open(`https://twitter.com/intent/tweet?text=${msg}`, '_blank')
}
function shareLinkedIn() {
  const link = encodeURIComponent(referralInfo.value?.link || '')
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${link}`, '_blank')
}

onMounted(() => { if (auth.isLoggedIn) loadReferral() })
watch(() => auth.isLoggedIn, (v) => { if (v) loadReferral() })

</script>

<style scoped>
.settings-wrap{max-width:720px}
.ai-status-row { display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;padding:8px 12px;border-radius:var(--radius-sm); }
.ai-ok   { background:var(--c-green-lt);color:var(--c-green); }
.ai-warn { background:var(--c-amber-lt);color:var(--c-amber); }
.ai-checking { background:var(--c-bg);color:var(--c-text3); }
.ai-status-dot { width:7px;height:7px;border-radius:50%;background:currentColor;flex-shrink:0; }
.spin { animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

.ref-loading { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--c-text3); padding:12px 0; }
.ref-loading-spin { width:16px; height:16px; border:2px solid var(--c-border); border-top-color:var(--c-accent); border-radius:50%; animation:ref-spin .7s linear infinite; flex-shrink:0; }
@keyframes ref-spin { to { transform:rotate(360deg); } }
.ref-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
.ref-stat { background:var(--c-bg); border:1px solid var(--c-border); border-radius:var(--radius); padding:13px; text-align:center; }
.ref-stat-val { font-size:26px; font-weight:700; color:var(--c-text); font-family:inherit;letter-spacing:-.01em; }
.ref-stat-lbl { font-size:11px; color:var(--c-text3); margin-top:3px; }
.ref-credit-banner { display:flex; align-items:center; justify-content:space-between; gap:12px; background:linear-gradient(135deg,#f0faf5,#e8f5fe); border:1.5px solid var(--c-green); border-radius:var(--radius); padding:14px; margin-bottom:16px; flex-wrap:wrap; }
.ref-how { display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:18px; padding:14px; background:var(--c-bg); border-radius:var(--radius); border:1px solid var(--c-border); }
.ref-how-step { display:flex; align-items:flex-start; gap:12px; }
.ref-how-ic { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ref-how-title { font-size:13.5px; font-weight:700; color:var(--c-text); margin-bottom:2px; }
.ref-how-sub { font-size:12px; color:var(--c-text3); }
.ref-link-section { margin-bottom:14px; }
.ref-link-row { display:flex; gap:8px; align-items:center; margin-bottom:10px; }
.ref-link-box { flex:1; background:var(--c-bg); border:1px solid var(--c-border); border-radius:var(--radius-sm); padding:9px 12px; font-size:12.5px; color:var(--c-text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
.ref-copy-btn { white-space:nowrap; flex-shrink:0; }
.ref-share-row { display:flex; gap:8px; flex-wrap:wrap; }
.ref-share-btn { display:flex; align-items:center; gap:6px; background:var(--c-bg); border:1px solid var(--c-border); border-radius:var(--radius-sm); padding:7px 12px; font-size:12.5px; font-weight:600; color:var(--c-text2); cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }
.ref-share-btn:hover { border-color:var(--c-border2); color:var(--c-text); transform:translateY(-1px); }
.ref-code-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.ref-code { display:inline-block; background:var(--c-accent-lt); color:var(--c-accent); border:1px solid rgba(42,91,215,.2); border-radius:var(--radius-sm); padding:7px 16px; font-size:16px; font-weight:700; letter-spacing:.08em; }
@media(max-width:480px){
  .ref-stats { grid-template-columns:1fr 1fr; }
  .ref-credit-banner { flex-direction:column; }
  .ref-code-row { flex-direction:column; }
}
</style>