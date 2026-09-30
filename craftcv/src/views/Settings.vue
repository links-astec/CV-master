<template>
  <div class="view-page">
    <div class="view-inner st">
      <h1 class="st-h1">Settings</h1>

      <!-- Account -->
      <section v-if="auth.isLoggedIn" class="st-card">
        <div class="st-acct">
          <span class="st-ava">{{ (auth.user?.name || auth.user?.email || '?')[0].toUpperCase() }}</span>
          <div class="st-acct-txt">
            <div class="st-acct-name">{{ auth.user?.name }}</div>
            <div class="st-acct-mail">{{ auth.user?.email }}
              <span v-if="auth.user?.emailVerified === false" class="st-unv">· not confirmed — <button class="st-link-btn" @click="resendVerification()">resend link</button></span>
              <span v-else class="st-ver">· confirmed</span></div>
          </div>
          <button class="btn-secondary btn-sm" @click="logout">Sign out</button>
        </div>

        <div class="st-rows">
          <div class="st-row">
            <label class="st-lbl" for="st-name">Display name</label>
            <input id="st-name" class="f-inp" v-model="name" :placeholder="auth.user?.name" />
          </div>
          <div class="st-row">
            <label class="st-lbl" for="st-pw">Password</label>
            <div v-if="!changingPw"><button class="btn-ghost btn-sm st-inline" @click="changingPw = true">Change password</button></div>
            <div v-else class="st-pw">
              <input id="st-pw" class="f-inp" v-model="newPassword" :type="showPw ? 'text' : 'password'" placeholder="New password (8+ characters)" autocomplete="new-password" />
              <button type="button" class="st-eye" :aria-label="showPw ? 'Hide password' : 'Show password'" @click="showPw = !showPw">{{ showPw ? 'Hide' : 'Show' }}</button>
            </div>
          </div>
        </div>
        <div v-if="saveError" class="st-err">{{ saveError }}</div>
        <div class="st-actions">
          <button class="btn-primary accent" :disabled="saving || !dirty" @click="saveProfile">{{ saving ? 'Saving…' : 'Save changes' }}</button>
        </div>
      </section>

      <!-- Guest -->
      <section v-else class="st-card st-guest">
        <div>
          <div class="st-card-t">You’re using CVMaster as a guest</div>
          <p class="st-p">Your CV is saved in this browser only. Create a free account to keep it safe, use it on any device and export it.</p>
        </div>
        <div class="st-btns">
          <button class="btn-primary accent" @click="openAuth('register', 'save')">Create free account</button>
          <button class="btn-secondary" @click="openAuth('signin')">Sign in</button>
        </div>
      </section>

      <!-- Invite friends -->
      <section v-if="auth.isLoggedIn" class="st-card">
        <div class="st-card-hd">
          <div>
            <div class="st-card-t">Invite friends</div>
            <p class="st-p">They get <strong>{{ referralInfo?.welcomeAi || 25 }} extra AI requests</strong> when they join. When a friend gets their first clean CV, <strong>you get a free CV</strong>.</p>
          </div>
        </div>

        <div v-if="referralLoading" class="st-muted">Loading…</div>
        <template v-else-if="referralInfo">
          <div class="st-stats">
            <div><span>{{ referralInfo.count }}</span>joined</div>
            <div><span>{{ referralInfo.rewarded ?? 0 }}</span>got their CV</div>
            <div class="hl"><span>{{ referralInfo.credits }}</span>free CV{{ referralInfo.credits === 1 ? '' : 's' }} to use</div>
          </div>
          <p v-if="referralInfo.credits > 0" class="st-note">Use a free CV at export — choose “Use a referral credit”.</p>

          <div class="st-link">
            <input class="f-inp" :value="referralInfo.link" readonly aria-label="Your invite link" @focus="$event.target.select()" />
            <button class="btn-primary accent" @click="copyLink">{{ copied ? 'Copied ✓' : 'Copy link' }}</button>
          </div>
          <div class="st-share">
            <span>Share on</span>
            <button class="st-share-btn" @click="shareWhatsApp">WhatsApp</button>
            <button class="st-share-btn" @click="shareLinkedIn">LinkedIn</button>
            <button class="st-share-btn" @click="shareTwitter">X</button>
            <button class="st-share-btn" @click="shareEmail">Email</button>
          </div>
        </template>
        <div v-else class="st-muted">Couldn’t load your invite link — try refreshing.</div>
      </section>

      <!-- AI requests -->
      <section class="st-card">
        <div class="st-card-hd">
          <div>
            <div class="st-card-t">AI requests</div>
            <p class="st-p">{{ aiQuota?.tier === 'verified' ? '30 free every day' : '5 free a day — 30 once your email is confirmed' }}, reset at midnight (UTC). Extra requests never expire.</p>
          </div>
          <button class="btn-secondary btn-sm" @click="openAiAllowance()">Get 100 more — €0.50</button>
        </div>
        <template v-if="aiQuota">
          <div class="st-meter"><div :style="{ width: (aiQuota.freeLeft / aiQuota.limit * 100) + '%' }"></div></div>
          <div class="st-meter-txt"><strong>{{ aiQuota.freeLeft }}</strong> of {{ aiQuota.limit }} free left today<template v-if="aiQuota.credits"> · <strong>{{ aiQuota.credits }}</strong> extra</template></div>
        </template>
      </section>

      <!-- Preferences -->
      <section class="st-card">
        <div class="st-card-t">Preferences</div>
        <div class="st-pref">
          <div><div class="st-pref-t">Dark mode</div><div class="st-pref-s">Easier on the eyes at night</div></div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.darkMode" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div class="st-pref">
          <div><div class="st-pref-t">Quick tour</div><div class="st-pref-s">A one-minute walkthrough of building, tailoring and exporting</div></div>
          <button class="btn-secondary btn-sm" @click="restartTour">Start tour</button>
        </div>
      </section>

      <!-- Help -->
      <section class="st-card">
        <div class="st-card-t">Help &amp; feedback</div>
        <div class="st-help">
          <button @click="openFeedback('suggestion')"><strong>Send feedback</strong><span>Ideas or something that isn’t working</span></button>
          <button @click="openFeedback('complaint')"><strong>Make a complaint</strong><span>We reply to every complaint</span></button>
          <RouterLink to="/privacy"><strong>Privacy policy</strong><span>What we collect and why</span></RouterLink>
          <RouterLink to="/terms"><strong>Terms of service</strong><span>Payments, refunds and complaints</span></RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useCvStore } from '../stores/cv.js'

const apiUrl    = (p) => (import.meta.env.VITE_API_URL || '') + p
const auth      = useAuthStore()
const store     = useCvStore()
const router    = useRouter()
const showToast = inject('showToast')
const openAuth  = inject('openAuth')
const openFeedback    = inject('openFeedback')
const openAiAllowance = inject('openAiAllowance')
const resendVerification = inject('resendVerification')

// ── AI allowance ──────────────────────────────────────────────────────────────
const aiQuota = ref(null)
async function loadAiQuota() {
  try { const r = await fetch(apiUrl('/api/ai/quota'), { credentials: 'include' }); if (r.ok) aiQuota.value = await r.json() } catch {}
}

// ── Profile ───────────────────────────────────────────────────────────────────
const name        = ref(auth.user?.name || '')
const newPassword = ref('')
const changingPw  = ref(false)
const showPw      = ref(false)
const saving      = ref(false)
const saveError   = ref('')
const dirty = computed(() => (name.value && name.value !== auth.user?.name) || !!newPassword.value)

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
    const r = await fetch(apiUrl('/api/auth/settings'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    if (auth.user && name.value) auth.user.name = name.value
    newPassword.value = ''
    changingPw.value = false
    showToast('Saved')
  } catch (e) { saveError.value = e.message }
  saving.value = false
}

// Signing out clears this browser's copy of the CV; App then shows the homepage
async function logout() {
  await auth.logout()
  store.resetData()
  router.push('/')
}

const startTutorial = inject('startTutorial', null)
function restartTour() {
  try { localStorage.removeItem('cvmaster-tour-done') } catch {}
  startTutorial?.()
}

// ── Referrals ─────────────────────────────────────────────────────────────────
const referralInfo    = ref(null)
const referralLoading = ref(true)
const copied          = ref(false)

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
    setTimeout(() => { copied.value = false }, 2500)
  } catch { prompt('Copy your invite link:', link) }
}
const shareMsg = () => `I’ve been using CVMaster to build my CV — it tailors it to the job and checks it against ATS. Sign up with my link and get ${referralInfo.value?.welcomeAi || 25} extra AI requests: ${referralInfo.value?.link || ''}`
function shareWhatsApp() { window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg())}`, '_blank') }
function shareTwitter()  { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg())}`, '_blank') }
function shareLinkedIn() { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralInfo.value?.link || '')}`, '_blank') }
function shareEmail()    { window.location.href = `mailto:?subject=${encodeURIComponent('Try CVMaster for your CV')}&body=${encodeURIComponent(shareMsg())}` }

onMounted(() => { loadAiQuota(); if (auth.isLoggedIn) loadReferral() })
watch(() => auth.isLoggedIn, (v) => { if (v) { loadReferral(); loadAiQuota() } })
</script>

<style scoped>
.st{max-width:720px;display:flex;flex-direction:column;gap:16px}
.st-h1{font-size:26px;font-weight:800;letter-spacing:-.025em;color:var(--c-text);margin-bottom:4px}
.st-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:16px;padding:20px 22px;box-shadow:var(--shadow-xs)}
.st-card-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
.st-card-t{font-size:15.5px;font-weight:700;color:var(--c-text);margin-bottom:4px}
.st-p{font-size:13.5px;color:var(--c-text2);line-height:1.55}
.st-p strong{color:var(--c-text)}
.st-muted{font-size:13px;color:var(--c-text3)}
.st-err{font-size:12.5px;color:var(--c-rose);margin-top:8px}
.st-btns{display:flex;gap:8px;flex-wrap:wrap}

/* Account */
.st-acct{display:flex;align-items:center;gap:14px;padding-bottom:18px;margin-bottom:16px;border-bottom:1px solid var(--c-border)}
.st-ava{width:48px;height:48px;border-radius:50%;background:var(--c-accent);color:#fff;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.st-acct-txt{flex:1;min-width:0}
.st-acct-name{font-size:16px;font-weight:700;color:var(--c-text)}
.st-acct-mail{font-size:13px;color:var(--c-text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-unv{color:var(--c-amber)}
.st-ver{color:var(--c-green)}
.st-link-btn{background:none;border:none;padding:0;font:inherit;color:var(--c-accent);font-weight:600;text-decoration:underline}
.st-rows{display:flex;flex-direction:column;gap:12px}
.st-row{display:grid;grid-template-columns:140px 1fr;align-items:center;gap:14px}
.st-lbl{font-size:13px;font-weight:600;color:var(--c-text2)}
.st-inline{padding-left:0}
.st-pw{position:relative}
.st-pw .f-inp{padding-right:64px}
.st-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:12px;font-weight:600;color:var(--c-accent)}
.st-actions{display:flex;justify-content:flex-end;margin-top:16px}
.st-guest{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}

/* Invite */
.st-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}
.st-stats > div{background:var(--c-bg);border-radius:12px;padding:12px 14px;font-size:12.5px;color:var(--c-text3)}
.st-stats span{display:block;font-size:24px;font-weight:800;color:var(--c-text);letter-spacing:-.02em;line-height:1.15}
.st-stats .hl{background:var(--c-accent-lt)}
.st-stats .hl span{color:var(--c-accent)}
.st-note{font-size:12.5px;color:var(--c-green);margin-bottom:12px}
.st-link{display:flex;gap:8px}
.st-link .f-inp{flex:1;min-width:0;font-size:13px;color:var(--c-text2)}
.st-share{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;font-size:12.5px;color:var(--c-text3)}
.st-share span{margin-right:4px}
.st-share-btn{height:30px;padding:0 12px;border-radius:99px;border:1px solid var(--c-border);background:var(--c-surface);font-size:12.5px;font-weight:600;color:var(--c-text2)}
.st-share-btn:hover{border-color:var(--c-border2);color:var(--c-text)}

/* AI */
.st-meter{height:8px;border-radius:99px;background:var(--c-border);overflow:hidden}
.st-meter div{height:100%;border-radius:99px;background:var(--c-accent);transition:width .4s}
.st-meter-txt{font-size:13px;color:var(--c-text2);margin-top:8px}
.st-meter-txt strong{color:var(--c-text)}

/* Preferences */
.st-pref{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0;border-top:1px solid var(--c-border)}
.st-card-t + .st-pref{border-top:none;padding-top:6px}
.st-pref-t{font-size:14px;font-weight:600;color:var(--c-text)}
.st-pref-s{font-size:12.5px;color:var(--c-text3);margin-top:2px}

/* Help */
.st-help{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.st-help > *{display:flex;flex-direction:column;gap:2px;text-align:left;padding:12px 14px;border-radius:12px;border:1px solid var(--c-border);background:var(--c-surface);text-decoration:none;font:inherit;cursor:pointer}
.st-help > *:hover{border-color:var(--c-border2);background:var(--c-surface2)}
.st-help strong{font-size:13.5px;color:var(--c-text)}
.st-help span{font-size:12px;color:var(--c-text3)}

@media (max-width:600px){
  .st-card{padding:18px 16px}
  .st-card-hd{flex-direction:column}
  .st-row{grid-template-columns:1fr;gap:6px}
  .st-stats{grid-template-columns:1fr 1fr 1fr}
  .st-stats span{font-size:20px}
  .st-link{flex-direction:column}
  .st-help{grid-template-columns:1fr}
}
</style>
