<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="close">
        <div class="modal pw" role="dialog" aria-modal="true">
          <button class="icon-btn modal-close" @click="close" aria-label="Close">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Working -->
          <div v-if="state === 'checking' || state === 'sending'" class="pw-center">
            <span class="pw-spin"></span>
            <h2>{{ state === 'sending' ? 'Creating your PDF…' : 'Getting your CV ready…' }}</h2>
            <p v-if="state === 'sending'">Sending to {{ deliveryEmail.trim() || userEmail }}. This takes a few seconds.</p>
          </div>

          <!-- Sent -->
          <div v-else-if="state === 'sent'" class="pw-center">
            <span class="pw-ok"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>
            <h2>Your CV is on its way</h2>
            <p>We emailed the PDF to <strong>{{ sentTo }}</strong>. Check your spam folder if it isn't there in a minute.</p>
            <div class="pw-row">
              <button class="btn-secondary" :disabled="downloading" @click="downloadPdf">{{ downloading ? 'Preparing…' : 'Download PDF' }}</button>
              <button class="btn-primary accent" @click="close">Done</button>
            </div>
            <ReviewPrompt compact only-if-new />
          </div>

          <!-- Paid, but the email failed -->
          <div v-else-if="state === 'emailFailed'" class="pw-center">
            <span class="pw-warn"><svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg></span>
            <h2>We couldn't email your CV</h2>
            <p>Your payment is safe and this CV is unlocked. Download the PDF now, or try the email again.</p>
            <div class="pw-row">
              <button class="btn-primary accent" :disabled="downloading" @click="downloadPdf">{{ downloading ? 'Preparing…' : 'Download PDF' }}</button>
              <button class="btn-secondary" @click="sendEmail()">Try email again</button>
            </div>
          </div>

          <!-- Longer than one page -->
          <div v-else-if="state === 'tooLong'" class="pw-body">
            <div class="pw-hd">
              <h2>Your CV is longer than one page</h2>
              <p>It's about {{ overPct }}% over. We'll shrink it to fit one A4 page — text will be at {{ zoomPct }}% of its normal size{{ page.zoom < 0.82 ? ', which is quite small' : '' }}.</p>
            </div>
            <div class="pw-row">
              <button class="btn-secondary" @click="close">Edit it first</button>
              <button class="btn-primary accent" @click="acceptShrink">Continue &amp; shrink to fit</button>
            </div>
          </div>

          <!-- Choose how to pay / send -->
          <div v-else-if="state === 'ready'" class="pw-body">
            <div class="pw-hd">
              <h2>{{ paidForDraft ? 'Send your CV' : 'Get your CV as a PDF' }}</h2>
              <p v-if="paidForDraft">This CV is already paid for — send it as often as you like, even after edits.</p>
              <p v-else-if="demoMode">Payments aren't switched on yet, so this is free for now.</p>
              <p v-else>A clean, one-page PDF, emailed to you.</p>
            </div>

            <div v-if="!paidForDraft && !demoMode" class="pw-price">
              <div class="pw-amt">€0.99 <span>one-time, for this CV</span></div>
              <ul>
                <li v-for="f in FEATURES" :key="f"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ f }}</li>
              </ul>
            </div>

            <div class="f-grp">
              <label class="f-lbl" for="pw-email">Send to</label>
              <input id="pw-email" class="f-inp" v-model="deliveryEmail" type="email" :placeholder="userEmail" @keydown.enter="primary" />
              <p v-if="deliverySuggestion && deliveryOk" class="f-hint">Did you mean <button type="button" class="pw-fix" @click="deliveryEmail = deliverySuggestion">{{ deliverySuggestion }}</button>?</p>
              <p v-else class="f-hint" :class="{ err: !deliveryOk }">{{ deliveryOk ? 'Leave blank to use your account email.' : 'Please enter a valid email address.' }}</p>
            </div>

            <!-- EU/French law: buyers of instant digital content must agree before paying
                 that delivery starts now and ends the 14-day right of withdrawal -->
            <label v-if="!paidForDraft && !demoMode" class="pw-consent">
              <input type="checkbox" v-model="withdrawalOk" />
              <span>I want my PDF straight away and agree that I lose my 14-day right of withdrawal once it’s delivered.</span>
            </label>

            <div v-if="error" class="notice error pw-err">{{ error }}</div>

            <button class="btn-primary accent btn-lg btn-block" :disabled="loading || !deliveryOk || (!paidForDraft && !demoMode && !withdrawalOk)" @click="primary">
              {{ loading ? 'Please wait…' : paidForDraft || demoMode ? 'Email my CV' : 'Pay €0.99 — get my CV' }}
            </button>
            <button v-if="!paidForDraft && !demoMode && credits > 0" class="btn-secondary btn-block pw-credit" :disabled="loading || !deliveryOk" @click="useCredit">
              Use a referral credit instead — free ({{ credits }} left)
            </button>
            <p v-if="!paidForDraft && !demoMode" class="pw-secure">
              <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Secure payment by Stripe · No subscription
            </p>
          </div>

          <!-- Couldn't prepare -->
          <div v-else-if="state === 'error'" class="pw-center">
            <h2>Something went wrong</h2>
            <p>{{ error }}</p>
            <div class="pw-row"><button class="btn-secondary" @click="close">Close</button><button class="btn-primary accent" @click="prepare">Try again</button></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'
import { useCvStore }    from '../stores/cv.js'
import { useAuthStore }  from '../stores/auth.js'
import { useNotifStore } from '../stores/notifications.js'
import ReviewPrompt from './ReviewPrompt.vue'
import { suggestEmail } from '../composables/emailTypos.js'
import { render } from '../composables/cvRenderer.js'
import { analysePage, exportDocument } from '../composables/pageFit.js'

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path

const props = defineProps({ show: Boolean })
const emit  = defineEmits(['close'])

const store      = useCvStore()
const auth       = useAuthStore()
const notifStore = useNotifStore()
const showToast      = inject('showToast', null)
const requireAccount = inject('requireAccount')

const FEATURES = ['Clean, watermark-free PDF — emailed to you', 'Download it straight away too', 'Re-send or download again free, even after edits']

// checking | tooLong | ready | sending | sent | emailFailed | error
const state         = ref('checking')
const loading       = ref(false)
const downloading   = ref(false)
const error         = ref('')
const demoMode      = ref(false)
const paidForDraft  = ref(false)
const credits       = ref(0)
const deliveryEmail = ref('')
const sentTo        = ref('')
const draftId       = ref(null)
const page          = ref({ overflow: false, overBy: 0, zoom: 1 })

const userEmail  = computed(() => auth.user?.email || 'your email')
const withdrawalOk = ref(false)
// "Did you mean …@gmail.com?" so a PDF never goes to a typo
const deliverySuggestion = computed(() => suggestEmail(deliveryEmail.value))
const deliveryOk = computed(() => !deliveryEmail.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail.value.trim()))
const overPct    = computed(() => Math.max(1, Math.round(page.value.overBy * 100)))
const zoomPct    = computed(() => Math.round(page.value.zoom * 100))

const cvHtml = () => render(store.template, store.data, store.fmt)
const fileName = () => {
  const name = [store.data.fn, store.data.ln].filter(Boolean).join(' ') || 'My CV'
  return name.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-CV.pdf'
}

async function api(path, body) {
  const r = await fetch(apiUrl(path), {
    method: body ? 'POST' : 'GET', credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) { const e = new Error(data.error || `Request failed (${r.status})`); e.status = r.status; throw e }
  return data
}

function close() { if (state.value !== 'sending' && !loading.value) emit('close') }

// Stripe returns are handled by handleStripeReturn — don't run prepare over the top of them
let handlingReturn = false
watch(() => props.show, async (v) => {
  if (!v || handlingReturn) return
  error.value = ''
  // Guests create an account here; the CV they built is saved into it automatically
  if (!auth.isLoggedIn) {
    const ok = await requireAccount('export')
    if (!ok) { emit('close'); return }
  }
  prepare()
})

async function prepare() {
  state.value = 'checking'
  error.value = ''
  demoMode.value = false
  try {
    const [id, info] = await Promise.all([store.ensureSavedDraftId(), analysePage(cvHtml())])
    page.value = info
    if (!id) throw new Error("We couldn't save your CV to your account. Check your connection and try again.")
    draftId.value = id
    const [status, refInfo] = await Promise.all([
      api(`/api/payment/status/${id}`).catch(() => ({ paid: false })),
      api('/api/referral/info').catch(() => ({ credits: 0 })),
    ])
    paidForDraft.value = !!status.paid
    credits.value = Number(refInfo.credits) || 0
    state.value = info.overflow && !store.data.shrinkToFit ? 'tooLong' : 'ready'
  } catch (e) {
    error.value = e.message
    state.value = 'error'
  }
}

function acceptShrink() {
  store.data.shrinkToFit = true
  state.value = 'ready'
}

// Main button: send if already paid (or demo), otherwise go to Stripe
function primary() {
  if (!deliveryOk.value || loading.value) return
  if (paidForDraft.value || demoMode.value) sendEmail()
  else pay()
}

async function pay() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/api/payment/create-session', { draftId: draftId.value, withdrawalConsent: withdrawalOk.value })
    if (data.alreadyPaid) { paidForDraft.value = true; loading.value = false; return sendEmail() }
    if (data.demo)        { demoMode.value = true;     loading.value = false; return sendEmail() }
    if (!data.url) throw new Error('Payment could not be started.')
    if (deliveryEmail.value.trim()) sessionStorage.setItem('pcv_delivery_email', deliveryEmail.value.trim())
    window.location.href = data.url
  } catch (e) {
    error.value = e.message
    loading.value = false
  }
}

async function useCredit() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/api/referral/redeem', { product: 'email_export', draftId: draftId.value })
    if (typeof data.credits === 'number') credits.value = data.credits
    paidForDraft.value = true
    loading.value = false
    await sendEmail()
  } catch (e) {
    error.value = e.message
    loading.value = false
  }
}

async function sendEmail(sessionId = null) {
  state.value = 'sending'
  try {
    const data = await api('/api/cv/email', {
      htmlContent:   exportDocument(cvHtml()),
      fileName:      fileName(),
      overrideEmail: deliveryEmail.value.trim() || null,
      sessionId,
      draftId:       draftId.value || store.currentDraftId,
    })
    sentTo.value = data.sentTo
    paidForDraft.value = true
    // My CVs may already be on screen (Stripe returns to it) — tell it this CV is paid
    window.dispatchEvent(new CustomEvent('cv-paid', { detail: { draftId: draftId.value || store.currentDraftId } }))
    state.value = 'sent'
    notifStore.fetch()
  } catch (e) {
    if (e.status === 403 || e.status === 401) { error.value = e.message; state.value = 'ready' }
    else {
      state.value = 'emailFailed'
      // The payment may still have gone through — let My CVs re-check with the server
      if (sessionId) window.dispatchEvent(new CustomEvent('cv-paid', { detail: {} }))
    }
  }
}

// Paid CVs can always be downloaded directly too
async function downloadPdf() {
  downloading.value = true
  try {
    const r = await fetch(apiUrl('/api/cv/export-pdf'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId: draftId.value || store.currentDraftId, htmlContent: exportDocument(cvHtml()), fileName: fileName() }),
    })
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Download failed.')
    const url = URL.createObjectURL(await r.blob())
    const a = document.createElement('a')
    a.href = url; a.download = fileName()
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) {
    showToast?.(e.message)
  } finally {
    downloading.value = false
  }
}

// After Stripe redirects back, make sure the paid draft is the one in the editor, then send it
async function handleStripeReturn(sessionId, paidDraftId) {
  handlingReturn = true
  state.value = 'sending'
  try {
    const saved = sessionStorage.getItem('pcv_delivery_email')
    if (saved) { deliveryEmail.value = saved; sessionStorage.removeItem('pcv_delivery_email') }
    if (paidDraftId && store.currentDraftId !== paidDraftId && auth.isLoggedIn) {
      try {
        const drafts = await api('/api/drafts')
        const d = drafts.find(x => x.id === paidDraftId)
        if (d) store.loadDraft(d)
      } catch {}
    }
    draftId.value = paidDraftId || store.currentDraftId
    await sendEmail(sessionId)
  } finally {
    handlingReturn = false
  }
}

defineExpose({ handleStripeReturn })
</script>

<style scoped>
.pw{max-width:460px;padding:30px 28px 26px}
.pw-hd h2,.pw-center h2{font-size:20px;font-weight:650;letter-spacing:-.015em}
.pw-hd p,.pw-center p{color:var(--c-text2);margin-top:6px;line-height:1.55}
.pw-hd{margin-bottom:20px;padding-right:24px}
.pw-center{display:flex;flex-direction:column;align-items:center;text-align:center;padding:18px 6px 4px}
.pw-center h2{margin-top:16px}
.pw-row{display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap}
.pw-body .pw-row{justify-content:flex-end}
.pw-spin{width:34px;height:34px;border-radius:50%;border:3px solid var(--c-border);border-top-color:var(--c-accent);animation:spin .8s linear infinite}
.pw-ok,.pw-warn{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.pw-ok{background:var(--c-green-lt)}
.pw-ok svg{width:26px;height:26px;fill:none;stroke:var(--c-green);stroke-width:2.6}
.pw-warn{background:var(--c-amber-lt)}
.pw-warn svg{width:26px;height:26px;fill:none;stroke:var(--c-amber);stroke-width:2}
.pw-price{border:1px solid var(--c-border);border-radius:12px;padding:16px 18px;margin-bottom:18px;background:var(--c-surface2)}
.pw-amt{font-size:28px;font-weight:700;letter-spacing:-.02em}
.pw-amt span{font-size:13px;font-weight:500;color:var(--c-text3);letter-spacing:0}
.pw-price ul{list-style:none;margin-top:10px;display:flex;flex-direction:column;gap:7px}
.pw-price li{display:flex;gap:8px;font-size:13.5px;color:var(--c-text2)}
.pw-price li svg{width:16px;height:16px;flex-shrink:0;fill:none;stroke:var(--c-green);stroke-width:2.6;margin-top:1px}
.f-hint.err{color:var(--c-rose)}
.pw-err{margin-bottom:14px}
.pw-credit{margin-top:8px}
.pw-fix{background:none;border:none;padding:0;font:inherit;font-weight:700;color:var(--c-accent);text-decoration:underline;cursor:pointer}
.pw-consent{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;color:var(--c-text2);line-height:1.45;margin:4px 0 12px;cursor:pointer}
.pw-consent input{margin-top:2px;accent-color:var(--c-accent);flex-shrink:0;width:15px;height:15px}
.pw-secure{display:flex;align-items:center;justify-content:center;gap:6px;font-size:12.5px;color:var(--c-text3);margin-top:12px}
.pw-secure svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2}
</style>
