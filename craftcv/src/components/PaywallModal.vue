<template>
  <Teleport to="body">
    <Transition name="paywall-fade">
      <div v-if="show" class="paywall-backdrop" @click.self="$emit('close')">
        <div class="paywall-modal">
          <button class="paywall-close" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Sending -->
          <div v-if="sending" class="paywall-sending">
            <div class="send-spinner"></div>
            <div class="send-title">{{ sendStatus }}</div>
            <div class="send-sub">{{ sendSub }}</div>
          </div>

          <!-- Success — stays until user clicks Done -->
          <div v-else-if="sent" class="paywall-success">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="success-title">CV sent!</div>
            <div class="success-sub">Your CV has been emailed to <strong>{{ sentTo }}</strong>. Check your inbox (and spam folder).</div>
            <button class="btn-primary accent" style="width:100%;justify-content:center;margin-top:20px;" @click="showPreview=true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview My CV
            </button>
            <button class="btn-secondary" style="width:100%;justify-content:center;margin-top:8px;" @click="$emit('close')">Done</button>
          </div>

          <!-- Normal / demo -->
          <template v-else>
            <div class="paywall-head">
              <div class="paywall-cv-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
              </div>
              <h2 class="paywall-title">{{ demoMode ? 'Demo Export' : 'Export Your CV' }}</h2>
              <p class="paywall-sub">{{ demoMode ? "Enter your email — we'll send your CV as a PDF." : 'Your CV will be emailed as a PDF.' }}</p>
            </div>

            <!-- Demo mode -->
            <div v-if="demoMode" class="demo-email-section">
              <label class="f-lbl">Your email address</label>
              <input class="f-inp" v-model="demoEmail" type="email" placeholder="your@email.com" @keydown.enter="sendDemo" autofocus />
              <button class="btn-pay" @click="sendDemo" :disabled="sending || !isValidEmail(demoEmail)">
                <svg v-if="sending" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
                Send My CV — Free Demo
              </button>
              <p class="paywall-secure">Demo mode — Stripe not configured</p>
            </div>

            <!-- Paid mode -->
            <template v-else>
              <div class="paywall-price-wrap">
                <div class="paywall-price">£4.99</div>
                <div class="paywall-price-sub">one-time · no subscription</div>
              </div>
              <div class="paywall-features">
                <div class="paywall-feature" v-for="f in features" :key="f">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" stroke-width="2.5" style="width:14px;height:14px;flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ f }}
                </div>
              </div>

              <div class="delivery-email-wrap">
                <label class="f-lbl">Send PDF to (optional)</label>
                <input class="f-inp" v-model="deliveryEmail" type="email" :placeholder="userEmail" />
                <p class="f-hint">Leave blank to use your account email</p>
              </div>

              <button class="btn-pay" @click="pay" :disabled="loading">
                <svg v-if="loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
                {{ loading ? 'Processing...' : 'Pay £4.99 — Email My CV' }}
              </button>
              <p class="paywall-secure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:13px;height:13px;"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Secured by Stripe · PDF sent to {{ deliveryEmail.trim() || userEmail }}
              </p>
            </template>
          </template>
        </div>
      </div>
    </Transition>

    <!-- CV Preview Modal -->
    <Transition name="cv-preview-fade">
      <div v-if="showPreview" class="cv-preview-backdrop">
        <div class="cv-preview-modal">
          <div class="cv-preview-topbar">
            <div class="cv-preview-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:16px;height:16px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              CV Preview
            </div>
            <button class="cv-preview-close" @click="showPreview=false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="cv-preview-canvas" ref="previewCanvasRef">
            <div :style="previewOuterStyle">
              <div :style="previewScalerStyle" v-html="cvHtmlContent"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, inject, watch, nextTick, onUnmounted } from 'vue'
import { useCvStore }    from '../stores/cv.js'
import { useAuthStore }  from '../stores/auth.js'
import { useNotifStore } from '../stores/notifications.js'
import { useCvRenderer } from '../composables/cvRenderer.js'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'paid'])

const store      = useCvStore()
const auth       = useAuthStore()
const notifStore = useNotifStore()
const { render } = useCvRenderer()
const showToast  = inject('showToast')

const loading       = ref(false)
const sending       = ref(false)
const sent          = ref(false)
const demoMode      = ref(false)
const demoEmail     = ref('')
const deliveryEmail = ref('')
const sentTo        = ref('')
const sendStatus    = ref('Generating your PDF...')
const sendSub       = ref('')
const showPreview      = ref(false)
const cvHtmlContent    = ref('')
const previewCanvasRef = ref(null)
const previewCanvasW   = ref(0)

const userEmail = computed(() => auth.user?.email || 'your email')
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '') }

const previewScale = computed(() => {
  const w = previewCanvasW.value
  return w ? Math.min(0.9, (w - 48) / 700) : 0.8
})
const previewOuterStyle  = computed(() => ({ width: '100%', display: 'flex', justifyContent: 'center' }))
const previewScalerStyle = computed(() => ({ width: '700px', zoom: String(previewScale.value), flexShrink: '0' }))

let _ro
watch(showPreview, async (v) => {
  if (v) {
    cvHtmlContent.value = render(store.template, store.data)
    await nextTick()
    if (previewCanvasRef.value) {
      previewCanvasW.value = previewCanvasRef.value.clientWidth
      _ro = new ResizeObserver(() => { previewCanvasW.value = previewCanvasRef.value?.clientWidth || 0 })
      _ro.observe(previewCanvasRef.value)
    }
  } else { _ro?.disconnect() }
})
onUnmounted(() => _ro?.disconnect())

const features = [
  'CV emailed directly as a PDF',
  'ATS-optimised formatting',
  'Professional quality output',
  'Keep forever — yours to use',
]

function buildCvHtml() {
  const cvHtml = render(store.template, store.data)
  const name   = `${store.data.fn || 'My'} ${store.data.ln || 'CV'}`.trim()
  const html   = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${name}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
html,body{background:#fff;width:700px;margin:0;padding:0;overflow:hidden;}
@page{size:700px auto;margin:0;}</style>
</head><body>${cvHtml}</body></html>`
  return { html, name }
}

async function sendCvEmail(overrideEmail, sessionId, draftId) {
  sending.value    = true
  sendStatus.value = 'Generating your PDF...'
  sendSub.value    = `Sending to ${overrideEmail || userEmail.value}`
  try {
    const { html, name } = buildCvHtml()
    const r = await fetch('/api/cv/email', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        htmlContent:   html,
        fileName:      `${name.replace(/\s+/g, '-')}-CV.pdf`,
        overrideEmail: overrideEmail || null,
        demoMode:      demoMode.value,
        sessionId:     sessionId || null,
        draftId:       draftId   || 'current',
      }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Failed to send email')
    sentTo.value  = overrideEmail || userEmail.value
    await notifStore.fetch()
    sending.value = false
    sent.value    = true
  } catch (e) {
    console.error('sendCvEmail error:', e)
    sending.value = false
    showToast?.('Email failed: ' + e.message)
  }
}

async function sendDemo() {
  const email = demoEmail.value.trim()
  if (!isValidEmail(email)) return
  await sendCvEmail(email)
}

async function pay() {
  loading.value = true
  try {
    const r = await fetch('/api/payment/create-session', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId: store.currentDraftId || 'current', templateId: store.template }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Payment failed')

    if (data.demo) {
      demoMode.value = true
      loading.value  = false
    } else if (data.url) {
      sessionStorage.setItem('pcv_pending_download', '1')
      if (deliveryEmail.value.trim()) sessionStorage.setItem('pcv_delivery_email', deliveryEmail.value.trim())
      window.location.href = data.url
    }
  } catch (e) {
    showToast?.('Error: ' + e.message)
    loading.value = false
  }
}

async function handleStripeReturn(sessionId, draftId) {
  const saved = sessionStorage.getItem('pcv_delivery_email')
  if (saved) { deliveryEmail.value = saved; sessionStorage.removeItem('pcv_delivery_email') }

  console.log('[paywall] handleStripeReturn sessionId:', sessionId, 'draftId:', draftId)
  await sendCvEmail(deliveryEmail.value.trim() || null, sessionId, draftId)
}

defineExpose({ handleStripeReturn })
</script>

<style scoped>
.paywall-fade-enter-active,.paywall-fade-leave-active{transition:opacity .25s,transform .25s;}
.paywall-fade-enter-from,.paywall-fade-leave-to{opacity:0;transform:scale(.97);}

.paywall-backdrop{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.paywall-modal{background:var(--c-surface);border-radius:20px;padding:28px 26px;width:100%;max-width:380px;box-shadow:0 24px 64px rgba(0,0,0,.2);position:relative;overflow-y:auto;max-height:90dvh;}
.paywall-close{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:50%;background:var(--c-bg);border:1px solid var(--c-border);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--c-text2);}
.paywall-close svg{width:13px;height:13px;}

.paywall-sending{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;text-align:center;min-height:180px;}
.send-spinner{width:44px;height:44px;border:3px solid var(--c-border);border-top-color:var(--c-accent);border-radius:50%;animation:spin .8s linear infinite;margin-bottom:16px;}
@keyframes spin{to{transform:rotate(360deg);}}
.send-title{font-size:16px;font-weight:700;color:var(--c-text);margin-bottom:6px;}
.send-sub{font-size:13px;color:var(--c-text3);}

.paywall-success{text-align:center;padding:12px 4px;}
.success-icon{width:64px;height:64px;border-radius:50%;background:var(--c-green-lt);border:2px solid var(--c-green);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--c-green);}
.success-title{font-size:22px;font-weight:700;color:var(--c-text);margin-bottom:8px;}
.success-sub{font-size:13px;color:var(--c-text2);line-height:1.6;}

.paywall-head{text-align:center;margin-bottom:18px;}
.paywall-cv-icon{width:56px;height:56px;background:var(--c-accent-lt);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;}
.paywall-cv-icon svg{width:28px;height:28px;color:var(--c-accent);}
.paywall-title{font-family:'DM Serif Display',serif;font-size:22px;color:var(--c-text);margin-bottom:6px;}
.paywall-sub{font-size:13px;color:var(--c-text2);line-height:1.5;}

.demo-email-section{display:flex;flex-direction:column;gap:10px;margin-bottom:4px;}

.paywall-price-wrap{text-align:center;margin-bottom:16px;}
.paywall-price{font-size:46px;font-weight:800;color:var(--c-accent);line-height:1;margin-bottom:4px;}
.paywall-price-sub{font-size:12px;color:var(--c-text3);}

.paywall-features{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;}
.paywall-feature{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--c-text2);}

.delivery-email-wrap{display:flex;flex-direction:column;gap:4px;margin-bottom:14px;}

.btn-pay{width:100%;background:var(--c-accent);color:#fff;border:none;padding:14px 20px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;font-family:'DM Sans',sans-serif;transition:opacity .15s;margin-bottom:10px;}
.btn-pay:hover:not(:disabled){opacity:.88;}
.btn-pay:disabled{opacity:.45;cursor:not-allowed;}

.paywall-secure{display:flex;align-items:center;justify-content:center;gap:6px;font-size:11.5px;color:var(--c-text3);margin:0;}

.spin{animation:spin .7s linear infinite;}

.cv-preview-fade-enter-active,.cv-preview-fade-leave-active{transition:opacity .25s;}
.cv-preview-fade-enter-from,.cv-preview-fade-leave-to{opacity:0;}
.cv-preview-backdrop{position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;}
.cv-preview-modal{width:100%;max-width:780px;height:92dvh;max-height:920px;background:var(--c-bg);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 32px 80px rgba(0,0,0,.4);}
.cv-preview-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--c-surface);border-bottom:1px solid var(--c-border);flex-shrink:0;}
.cv-preview-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--c-text);}
.cv-preview-close{width:30px;height:30px;border-radius:50%;background:var(--c-bg);border:1px solid var(--c-border);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--c-text2);}
.cv-preview-canvas{flex:1;overflow-y:auto;overflow-x:hidden;padding:24px;display:flex;justify-content:center;align-items:flex-start;}

@media (max-width:768px){
  .paywall-backdrop{padding:0;align-items:flex-end;}
  .paywall-modal{border-radius:20px 20px 0 0;max-width:100%;padding-bottom:calc(28px + env(safe-area-inset-bottom));}
  .cv-preview-backdrop{padding:0;align-items:flex-end;}
  .cv-preview-modal{border-radius:20px 20px 0 0;height:95dvh;max-height:95dvh;max-width:100%;}
}
</style>