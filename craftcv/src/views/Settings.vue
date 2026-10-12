<template>
  <div class="view-page">
    <div class="view-inner st">
      <h1 class="st-h1">{{ $t('Settings') }}</h1>

      <!-- Account -->
      <section v-if="auth.isLoggedIn" class="st-card">
        <div class="st-acct">
          <span class="st-ava">{{ (auth.user?.name || auth.user?.email || '?')[0].toUpperCase() }}</span>
          <div class="st-acct-txt">
            <div class="st-acct-name">{{ auth.user?.name }}</div>
            <div class="st-acct-mail">{{ auth.user?.email }}
              <span v-if="auth.user?.emailVerified === false" class="st-unv">· {{ $t('not confirmed') }}, <button class="st-link-btn" @click="resendVerification()">{{ $t('resend link') }}</button></span>
              <span v-else class="st-ver">· {{ $t('confirmed') }}</span></div>
          </div>
          <button class="btn-secondary btn-sm" @click="logout">{{ $t('Sign out') }}</button>
        </div>

        <div class="st-rows">
          <div class="st-row">
            <label class="st-lbl" for="st-name">{{ $t('Display name') }}</label>
            <input id="st-name" class="f-inp" v-model="name" :placeholder="auth.user?.name" />
          </div>
          <div class="st-row">
            <label class="st-lbl" for="st-pw">{{ $t('Password') }}</label>
            <div v-if="!changingPw"><button class="btn-secondary btn-sm st-inline" @click="changingPw = true">{{ $t('Change password') }}</button></div>
            <div v-else class="st-pw-col">
              <input v-if="auth.user?.hasPassword ?? auth.user?.provider !== 'google'" class="f-inp" v-model="currentPassword" type="password" :placeholder="$t('Current password')" autocomplete="current-password" />
              <div class="st-pw">
              <input id="st-pw" class="f-inp" v-model="newPassword" :type="showPw ? 'text' : 'password'" :placeholder="$t('New password (8+ characters)')" autocomplete="new-password" />
              <button type="button" class="st-eye" :aria-label="$t(showPw ? 'Hide password' : 'Show password')" @click="showPw = !showPw">{{ $t(showPw ? 'Hide' : 'Show') }}</button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="saveError" class="st-err">{{ $t(saveError) }}</div>
        <div class="st-actions">
          <button class="btn-primary accent" :disabled="saving || !dirty" @click="saveProfile">{{ $t(saving ? 'Saving…' : 'Save changes') }}</button>
        </div>
      </section>

      <!-- Guest -->
      <section v-else class="st-card st-guest">
        <div>
          <div class="st-card-t">{{ $t('You’re using CVMaster as a guest') }}</div>
          <p class="st-p">{{ $t('Your CV is saved in this browser only. Create a free account to keep it safe, use it on any device and export it.') }}</p>
        </div>
        <div class="st-btns">
          <button class="btn-primary accent" @click="openAuth('register', 'save')">{{ $t('Create free account') }}</button>
          <button class="btn-secondary" @click="openAuth('signin')">{{ $t('Sign in') }}</button>
        </div>
      </section>

      <!-- Invite friends -->
      <section v-if="auth.isLoggedIn" class="st-card">
        <div class="st-card-hd">
          <div>
            <div class="st-card-t">{{ $t('Invite friends') }}</div>
            <p class="st-p">{{ $t('They get {n} extra AI requests when they join. When a friend gets their first clean CV, you get a free CV.', { n: referralInfo?.welcomeAi || 25 }) }}</p>
          </div>
        </div>

        <div v-if="referralLoading" class="st-muted">{{ $t('Loading…') }}</div>
        <template v-else-if="referralInfo">
          <div class="st-stats">
            <div><span>{{ referralInfo.count }}</span>{{ $t('joined') }}</div>
            <div><span>{{ referralInfo.rewarded ?? 0 }}</span>{{ $t('got their CV') }}</div>
            <div class="hl"><span>{{ referralInfo.credits }}</span>{{ $t(referralInfo.credits === 1 ? 'free CV to use' : 'free CVs to use') }}</div>
          </div>
          <p v-if="referralInfo.credits > 0" class="st-note">{{ $t('Use a free CV at export. Choose “Use a referral credit”.') }}</p>

          <div class="st-link">
            <input class="f-inp" :value="referralInfo.link" readonly :aria-label="$t('Your invite link')" @focus="$event.target.select()" />
            <button class="btn-primary accent" @click="copyLink">{{ $t(copied ? 'Copied ✓' : 'Copy link') }}</button>
          </div>
          <div class="st-share">
            <span>{{ $t('Share on') }}</span>
            <button class="st-share-btn" @click="shareWhatsApp">WhatsApp</button>
            <button class="st-share-btn" @click="shareLinkedIn">LinkedIn</button>
            <button class="st-share-btn" @click="shareTwitter">X</button>
            <button class="st-share-btn" @click="shareEmail">{{ $t('Email') }}</button>
          </div>
        </template>
        <div v-else class="st-muted">{{ $t('Couldn’t load your invite link, try refreshing.') }}</div>
      </section>

      <!-- AI requests -->
      <section class="st-card">
        <div class="st-card-hd">
          <div>
            <div class="st-card-t">{{ $t('AI requests') }}</div>
            <p class="st-p">{{ $t(aiQuota?.tier === 'verified' ? '30 free every day, reset at midnight (UTC). Extra requests never expire.' : '5 free a day. 30 once your email is confirmed. Reset at midnight (UTC). Extra requests never expire.') }}</p>
          </div>
          <button class="btn-secondary btn-sm" @click="openAiAllowance()">{{ $t('Get 100 more for €0.50') }}</button>
        </div>
        <template v-if="aiQuota">
          <div class="st-meter"><div :style="{ width: (aiQuota.freeLeft / aiQuota.limit * 100) + '%' }"></div></div>
          <div class="st-meter-txt">{{ $t('{n} of {limit} free left today', { n: aiQuota.freeLeft, limit: aiQuota.limit }) }}<template v-if="aiQuota.credits"> · {{ $t('{n} extra', { n: aiQuota.credits }) }}</template></div>
        </template>
      </section>

      <!-- AI personalisation (own CVs only) -->
      <section v-if="auth.isLoggedIn" class="st-card">
        <div class="st-card-hd">
          <div>
            <div class="st-card-t">{{ $t('AI personalisation') }}</div>
            <p class="st-p">{{ $t('For CVs in your own name, the AI uses these answers and your other CVs to tailor its suggestions. CVs you make for someone else never use them.') }}</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="auth.user?.aiPersonalize !== false" :disabled="profileSaving" @change="saveAiProfile({ aiPersonalize: $event.target.checked })" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div v-if="auth.user?.aiPersonalize !== false" class="st-rows">
          <div class="st-row">
            <label class="st-lbl" for="st-ind">{{ $t('Your field') }}</label>
            <select id="st-ind" class="f-inp" :value="auth.user?.industry || ''" @change="saveAiProfile({ industry: $event.target.value })">
              <option value="">—</option>
              <option v-for="o in INDUSTRIES" :key="o.id" :value="o.id">{{ $t(o.label) }}</option>
            </select>
          </div>
          <div class="st-row">
            <label class="st-lbl" for="st-goal">{{ $t('What are you aiming for?') }}</label>
            <select id="st-goal" class="f-inp" :value="auth.user?.goal || ''" @change="saveAiProfile({ goal: $event.target.value })">
              <option value="">—</option>
              <option v-for="o in GOALS" :key="o.id" :value="o.id">{{ $t(o.label) }}</option>
            </select>
          </div>
          <div class="st-row">
            <label class="st-lbl" for="st-lvl">{{ $t('Experience') }}</label>
            <select id="st-lvl" class="f-inp" :value="auth.user?.experience || ''" @change="saveAiProfile({ experience: $event.target.value })">
              <option value="">—</option>
              <option v-for="o in LEVELS" :key="o.id" :value="o.id">{{ $t(o.label) }} ({{ $t(o.years) }})</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Preferences -->
      <section class="st-card">
        <div class="st-card-t">{{ $t('Preferences') }}</div>
        <div class="st-pref">
          <div><div class="st-pref-t">{{ $t('Language') }}</div><div class="st-pref-s">{{ $t('The language of CVMaster itself. Your CV’s language is set in the editor.') }}</div></div>
          <LangSwitch />
        </div>
        <div class="st-pref">
          <div><div class="st-pref-t">{{ $t('Dark mode') }}</div><div class="st-pref-s">{{ $t('Easier on the eyes at night') }}</div></div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.darkMode" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div v-if="auth.isLoggedIn" class="st-pref">
          <div>
            <div class="st-pref-t">{{ $t('Personalise with my activity') }}</div>
            <div class="st-pref-s">{{ $t('Suggests your next step and reminds you where you left off, from what you do in CVMaster. Kept on our servers only, never shared. Turning it off deletes it.') }}</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="auth.user?.personalizeActivity !== false" :disabled="profileSaving" @change="setPersonalize($event.target.checked)" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div v-if="auth.isLoggedIn" class="st-pref">
          <div>
            <div class="st-pref-t">{{ $t('Email newsletter') }}</div>
            <div class="st-pref-s">{{ $t(nlStatus === 'pending' ? 'Starts once you confirm your email address' : 'CV tips and CVMaster news. A couple of emails a month at most') }}</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="nlStatus === 'subscribed' || nlStatus === 'pending'" :disabled="nlStatus === null || nlSaving" @change="setNewsletter($event.target.checked)" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div class="st-pref">
          <div><div class="st-pref-t">{{ $t('Quick tour') }}</div><div class="st-pref-s">{{ $t('A one-minute walkthrough of building, tailoring and exporting') }}</div></div>
          <button class="btn-secondary btn-sm" @click="restartTour">{{ $t('Start tour') }}</button>
        </div>
      </section>

      <!-- Review (only shows for people who have made a CV) -->
      <ReviewPrompt id="review" class="st-review" />

      <!-- Help -->
      <section class="st-card">
        <div class="st-card-t">{{ $t('Help & feedback') }}</div>
        <div class="st-help">
          <button @click="openFeedback('suggestion')"><strong>{{ $t('Send feedback') }}</strong><span>{{ $t('Ideas or something that isn’t working') }}</span></button>
          <button @click="openFeedback('complaint')"><strong>{{ $t('Make a complaint') }}</strong><span>{{ $t('We reply to every complaint') }}</span></button>
          <RouterLink to="/privacy"><strong>{{ $t('Privacy policy') }}</strong><span>{{ $t('What we collect and why') }}</span></RouterLink>
          <RouterLink to="/terms"><strong>{{ $t('Terms of service') }}</strong><span>{{ $t('Payments, refunds and complaints') }}</span></RouterLink>
        </div>
      </section>

      <!-- Delete account -->
      <section v-if="auth.isLoggedIn" class="st-card">
        <div class="st-card-hd st-del-hd">
          <div>
            <div class="st-card-t">{{ $t('Delete account') }}</div>
            <p class="st-p">{{ $t('Deletes your account and every CV in it, on the website and in the app. This cannot be undone.') }}</p>
          </div>
          <button v-if="!deleting" class="btn-secondary btn-sm st-danger-ghost" @click="deleting = true">{{ $t('Delete account') }}</button>
        </div>
        <div v-if="deleting" class="st-del">
          <input v-if="auth.user?.hasPassword ?? auth.user?.provider !== 'google'" class="f-inp" v-model="deleteConfirm" type="password"
                 :placeholder="$t('Current password')" autocomplete="current-password" @keydown.enter="deleteAccount" />
          <input v-else class="f-inp" v-model="deleteConfirm" type="email" :placeholder="$t('Type your email address to confirm.')" @keydown.enter="deleteAccount" />
          <div v-if="deleteError" class="st-err">{{ $t(deleteError) }}</div>
          <div class="st-btns">
            <button class="btn-primary st-danger" :disabled="deleteBusy || !deleteConfirm" @click="deleteAccount">{{ $t(deleteBusy ? 'Deleting…' : 'Delete my account') }}</button>
            <button class="btn-ghost" :disabled="deleteBusy" @click="deleting = false; deleteConfirm = ''; deleteError = ''">{{ $t('Cancel') }}</button>
          </div>
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
import ReviewPrompt from '../components/ReviewPrompt.vue'
import LangSwitch from '../components/LangSwitch.vue'
import { INDUSTRIES, GOALS, LEVELS } from '../composables/profileOptions.js'
import { t } from '../i18n/index.js'
import { track } from '../composables/track.js'

const apiUrl    = (p) => (import.meta.env.VITE_API_URL || '') + p
const auth      = useAuthStore()
const store     = useCvStore()
const router    = useRouter()
const showToast = inject('showToast')
const openAuth  = inject('openAuth')
const openFeedback    = inject('openFeedback')
const openAiAllowance = inject('openAiAllowance')
const resendVerification = inject('resendVerification')

// ── Newsletter ────────────────────────────────────────────────────────────────
const nlStatus = ref(null)     // null (loading) | none | pending | subscribed | unsubscribed
const nlSaving = ref(false)
async function loadNewsletter() {
  try { const r = await fetch(apiUrl('/api/newsletter/me'), { credentials: 'include' }); if (r.ok) nlStatus.value = (await r.json()).status } catch {}
}
async function setNewsletter(on) {
  nlSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/newsletter/me'), {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscribed: on }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error)
    nlStatus.value = d.status
    showToast(d.status === 'subscribed' ? 'Subscribed to the newsletter' : d.status === 'pending' ? 'Confirm your email to start the newsletter' : 'Unsubscribed')
  } catch (e) { showToast(e.message || 'Could not save, please try again.') }
  nlSaving.value = false
}

// ── AI allowance ──────────────────────────────────────────────────────────────
const aiQuota = ref(null)
async function loadAiQuota() {
  try { const r = await fetch(apiUrl('/api/ai/quota'), { credentials: 'include' }); if (r.ok) aiQuota.value = await r.json() } catch {}
}

// ── Profile ───────────────────────────────────────────────────────────────────
const name        = ref(auth.user?.name || '')
const newPassword = ref('')
const currentPassword = ref('')
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
    if (newPassword.value) { body.password = newPassword.value; body.currentPassword = currentPassword.value }
    const r = await fetch(apiUrl('/api/auth/settings'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    if (auth.user && name.value) auth.user.name = name.value
    newPassword.value = ''
    currentPassword.value = ''
    changingPw.value = false
    showToast('Saved')
  } catch (e) { saveError.value = e.message }
  saving.value = false
}

// Personalisation switch and onboarding answers. Saved as soon as they change
const profileSaving = ref(false)
async function saveAiProfile(change) {
  profileSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/auth/settings'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(change),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.error)
    if (auth.user && data.user) Object.assign(auth.user, { aiPersonalize: data.user.aiPersonalize, industry: data.user.industry, goal: data.user.goal, experience: data.user.experience })
    showToast('Saved')
  } catch (e) { showToast(e.message || 'Could not save, please try again.') }
  profileSaving.value = false
}

// Personalisation from activity (turning it off deletes what was kept)
async function setPersonalize(on) {
  profileSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/auth/settings'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalizeActivity: on }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.error)
    if (auth.user) auth.user.personalizeActivity = on
    showToast('Saved')
  } catch (e) { showToast(e.message || 'Could not save, please try again.') }
  profileSaving.value = false
}

// Signing out clears this browser's copy of the CV; App then shows the homepage
async function logout() {
  await auth.logout()
  store.resetData()
  router.push('/')
}

// Delete the account (confirmed with the password, or the email for Google accounts without one)
const deleting      = ref(false)
const deleteConfirm = ref('')
const deleteError   = ref('')
const deleteBusy    = ref(false)
async function deleteAccount() {
  if (!deleteConfirm.value || deleteBusy.value) return
  deleteError.value = ''
  deleteBusy.value = true
  try {
    const hasPw = auth.user?.hasPassword ?? auth.user?.provider !== 'google'
    const r = await fetch(apiUrl('/api/auth/delete-account'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hasPw ? { password: deleteConfirm.value } : { confirmEmail: deleteConfirm.value }),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.error || 'Something went wrong. Please try again.')
    auth.user = null
    store.resetData()
    router.push('/')
    showToast('Your account has been deleted.')
  } catch (e) { deleteError.value = e.message }
  deleteBusy.value = false
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
    track('invite_shared', { channel: 'copy' })
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {
    // Clipboard blocked: select the link so it can be copied by hand
    const el = document.querySelector('.st-link input'); el?.focus(); el?.select()
    showToast(t('Select and copy your invite link.'))
  }
}
const shareMsg = () => t('I’ve been using CVMaster to build my CV. It tailors it to the job and checks it against ATS. Sign up with my link and get {n} extra AI requests: {link}', { n: referralInfo.value?.welcomeAi || 25, link: referralInfo.value?.link || '' })
function shareWhatsApp() { track('invite_shared', { channel: 'whatsapp' }); window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg())}`, '_blank') }
function shareTwitter()  { track('invite_shared', { channel: 'x' }); window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg())}`, '_blank') }
function shareLinkedIn() { track('invite_shared', { channel: 'linkedin' }); window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralInfo.value?.link || '')}`, '_blank') }
function shareEmail()    { track('invite_shared', { channel: 'email' }); window.location.href = `mailto:?subject=${encodeURIComponent(t('Try CVMaster for your CV'))}&body=${encodeURIComponent(shareMsg())}` }

onMounted(() => {
  loadAiQuota(); if (auth.isLoggedIn) { loadReferral(); loadNewsletter() }
  // Arriving from a "leave a rating" link or notification
  if (location.hash === '#review') setTimeout(() => document.getElementById('review')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600)
})
watch(() => auth.isLoggedIn, (v) => { if (v) { loadReferral(); loadAiQuota() } })
</script>

<style scoped>
.st{max-width:720px;display:flex;flex-direction:column;gap:16px}
.st-h1{font-size:26px;font-weight:800;letter-spacing:-.025em;color:var(--c-text);margin-bottom:4px}
.st-card{background:var(--c-surface);border:1px solid var(--hair);border-radius:16px;padding:20px 22px;box-shadow:var(--shadow-xs)}
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
.st-review{border-radius:16px;padding:20px 22px;box-shadow:var(--shadow-xs)}
.st-rows{display:flex;flex-direction:column;gap:12px}
.st-row{display:grid;grid-template-columns:140px 1fr;align-items:center;gap:14px}
.st-lbl{font-size:13px;font-weight:600;color:var(--c-text2)}
.st-inline{padding-left:0}
.st-pw-col{display:flex;flex-direction:column;gap:8px}
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
.st-share-btn{height:32px;padding:0 14px;border-radius:999px;border:none;background:color-mix(in srgb,var(--c-text) 6%,var(--c-surface));font-size:12.5px;font-weight:600;color:var(--c-text);transition:background .2s var(--ease)}
.st-share-btn:hover{background:color-mix(in srgb,var(--c-text) 10%,var(--c-surface))}
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
.st-help > *{display:flex;flex-direction:column;gap:2px;text-align:left;padding:12px 14px;border-radius:12px;border:1px solid var(--hair);background:var(--c-surface);text-decoration:none;font:inherit;cursor:pointer}
.st-help > *:hover{border-color:var(--c-border2);background:var(--c-surface2)}
.st-help strong{font-size:13.5px;color:var(--c-text)}
.st-help span{font-size:12px;color:var(--c-text3)}

/* Delete account */
.st-del-hd{margin-bottom:0}
.st-del{display:flex;flex-direction:column;gap:10px;margin-top:14px;max-width:380px}
.st-danger-ghost{color:var(--c-rose)}
.st-danger{background:var(--c-rose);color:#fff}

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
