<template>
  <Teleport to="body">
    <Transition name="paywall-fade">
      <div v-if="show" class="paywall-backdrop" @click.self="$emit('close')">
        <div class="paywall-modal">
          <button class="paywall-close" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Sending state -->
          <div v-if="sending" class="paywall-sending">
            <div class="send-spinner"></div>
            <div class="send-title">{{ sendStatus }}</div>
            <div class="send-sub">{{ sendSub }}</div>
          </div>

          <!-- Success state -->
          <div v-else-if="sent" class="paywall-success">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="success-title">CV sent!</div>
            <div class="success-sub">Your CV has been emailed to <strong>{{ userEmail }}</strong>. Check your inbox (and spam folder).</div>
            <button class="btn-primary accent" style="width:100%;justify-content:center;margin-top:20px;" @click="showPreview = true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview My CV
            </button>
            <button class="btn-secondary" style="width:100%;justify-content:center;margin-top:8px;" @click="$emit('close')">Done</button>
          </div>

          <!-- Normal state -->
          <template v-else>
            <div class="paywall-head">
              <div class="paywall-cv-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
              </div>
              <h2 class="paywall-title">Export your CV</h2>
              <p class="paywall-sub">Your CV will be emailed directly to <strong>{{ userEmail }}</strong></p>
            </div>

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

            <button class="btn-pay" @click="pay" :disabled="loading">
              <svg v-if="loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
              {{ loading ? 'Processing...' : 'Pay £4.99 — Email My CV' }}
            </button>

            <div class="paywall-secure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:13px;height:13px;"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Secured by Stripe · Sent instantly to {{ userEmail }}
            </div>

            <div v-if="demoMode" class="demo-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;flex-shrink:0;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span><strong>Demo mode</strong> — Stripe not configured. CV will be emailed for free.</span>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
    <!-- CV Preview Modal -->
    <Teleport to="body">
      <Transition name="cv-preview-fade">
        <div v-if="showPreview" class="cv-preview-backdrop">
          <div class="cv-preview-modal">
            <div class="cv-preview-topbar">
              <div class="cv-preview-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:16px;height:16px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                CV Preview
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:11px;color:var(--c-text3);">{{ currentTplName }}</span>
                <button class="cv-preview-close" @click="showPreview = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div class="cv-preview-canvas" ref="previewCanvasRef">
              <div class="cv-preview-scaler-wrap" :style="previewOuterStyle">
                <div :style="previewScalerStyle" v-html="cvHtmlContent"></div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'
import { useNotifStore } from '../stores/notifications.js'
import { useCvRenderer } from '../composables/cvRenderer.js'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'paid'])

const store      = useCvStore()
const auth       = useAuthStore()
const notifStore = useNotifStore()
const { render } = useCvRenderer()
const showToast  = inject('showToast')

const loading         = ref(false)
const sending         = ref(false)
const sent            = ref(false)
const demoMode        = ref(false)
const sendStatus      = ref('Sending your CV...')
const sendSub         = ref('')
const showPreview     = ref(false)
const cvHtmlContent   = ref('')
const previewCanvasRef = ref(null)
const previewCanvasW  = ref(0)

const userEmail = computed(() => auth.user?.email || 'your email')

const currentTplName = computed(() => {
  const names = { executive:'Executive Slate', modern:'Modern Azure', minimal:'Minimal', bold:'Bold Noir', creative:'Creative Violet', academic:'Academic', elegant:'Elegant Gold', tech:'Tech Dark', pastel:'Pastel Rose', teal:'Teal Sidebar', newspaper:'Newspaper', swiss:'Swiss', gradient:'Gradient Flow', compact:'Compact', photo:'Photo Pro', infographic:'Infographic', corporate:'Corporate Blue', magazine:'Magazine', midnight:'Midnight', clean:'Clean', slate:'Slate Impact', terra:'Terra', prism:'Prism', ivory:'Ivory', split:'Bold Split', forest:'Forest Green', ruby:'Ruby Red', ocean:'Ocean Blue', purple:'Purple Reign', charcoal:'Charcoal', sunrise:'Sunrise Orange', silver:'Silver', mint:'Mint Fresh', indigo:'Indigo Wave', amber:'Dark Amber', diamond:'Diamond', bloom:'Pink Bloom', nordic:'Nordic', sakura:'Sakura', emerald:'Emerald', cobalt:'Cobalt', lemon:'Lemon Fresh', graphite:'Graphite', vega:'Vega', rose:'Rose Gold', onyx:'Onyx', aurora:'Aurora', carbon:'Carbon', sky:'Sky Blue', obsidian:'Obsidian', slate2:'Slate Pro', crimson:'Crimson', sage:'Sage Green', dusk:'Dusk', slate3:'Slate III', copper2:'Copper II', neon:'Neon Green', blush:'Blush', sand:'Sand', phantom:'Phantom', electric:'Electric', luxe:'Luxe Gold', mono:'Monospace', wave:'Wave' }
  return names[store.template] || store.template
})

// Scale preview to fit canvas on all screen sizes
const previewScale = computed(() => {
  const w = previewCanvasW.value
  if (!w) return 0.8
  return Math.min(0.9, (w - 48) / 700)
})

// Use zoom (like desktop builder) — no clipping, layout-aware
const previewOuterStyle = computed(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
}))

const previewScalerStyle = computed(() => ({
  width: '700px',
  zoom: String(previewScale.value),
  flexShrink: '0',
}))

// Watch preview open to render CV content and measure canvas
import { watch as _watch, nextTick as _nextTick, onUnmounted as _onUnmounted } from 'vue'
let _ro2
_watch(showPreview, async (v) => {
  if (v) {
    cvHtmlContent.value = render(store.template, store.data)
    await _nextTick()
    if (previewCanvasRef.value) {
      previewCanvasW.value = previewCanvasRef.value.clientWidth
      _ro2 = new ResizeObserver(() => { previewCanvasW.value = previewCanvasRef.value?.clientWidth || 0 })
      _ro2.observe(previewCanvasRef.value)
    }
  } else {
    _ro2?.disconnect()
  }
})
_onUnmounted(() => _ro2?.disconnect())

const features = [
  'CV emailed directly to you as HTML',
  'Open in browser → Save as PDF in one click',
  'ATS-optimised formatting preserved',
  'Re-download any time from your email',
]

function buildCvHtml() {
  const cvHtml = render(store.template, store.data)
  const name   = `${store.data.fn || 'My'} ${store.data.ln || 'CV'}`.trim()
  const html   = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} — CV</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { background: #f0ede8; display: flex; justify-content: center; padding: 32px 16px; min-height: 100vh; }
  .cv-wrap { background: #fff; width: 700px; max-width: 100%; box-shadow: 0 8px 40px rgba(0,0,0,.15); }
  .save-bar { background: #2a5bd7; color: #fff; text-align: center; padding: 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; border-radius: 8px 8px 0 0; }
  .save-bar a { color: #fff; }
  @media print {
    body { background: #fff; padding: 0; }
    .save-bar { display: none; }
    .cv-wrap { box-shadow: none; width: 100%; max-width: 100%; }
    @page { size: A4; margin: 0; }
  }
</style>
</head>
<body>
<div class="cv-wrap">
  <div class="save-bar">
    To save as PDF: press <strong>Ctrl+P</strong> (Windows) or <strong>Cmd+P</strong> (Mac) → set destination to <strong>Save as PDF</strong>
  </div>
  ${cvHtml}
</div>
</body>
</html>`
  return { html, name }
}

async function sendCvEmail() {
  sending.value    = true
  sendStatus.value = 'Sending your CV...'
  sendSub.value    = `Emailing to ${userEmail.value}`

  try {
    // Build CV — store.data is now persisted to localStorage so survives Stripe redirect
    const { html, name } = buildCvHtml()

    // Safety check — if CV is basically empty, wait for store to hydrate
    const hasContent = store.data.fn || store.data.ln || store.data.sum
    if (!hasContent) {
      sendSub.value = 'Preparing your CV...'
      await new Promise(r => setTimeout(r, 800))
    }

    const { html: html2, name: name2 } = buildCvHtml()

    const r = await fetch('/api/cv/email', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        htmlContent: html2,
        fileName: `${name2.replace(/\s+/g, '-')}-CV.pdf`,
      }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Failed to send email')

    await notifStore.fetch()
    sending.value = false
    sent.value    = true
    emit('paid')
  } catch (e) {
    console.error('sendCvEmail error:', e)
    sending.value = false
    showToast?.('Email failed: ' + e.message)
  }
}

async function pay() {
  loading.value = true
  try {
    const r = await fetch('/api/payment/create-session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draftId: store.currentDraftId || 'current',
        templateId: store.template,
      }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Payment failed')

    if (data.demo) {
      // Demo mode — skip payment, email directly
      demoMode.value = true
      loading.value  = false
      await sendCvEmail()
    } else if (data.url) {
      // Real Stripe — redirect to checkout page
      sessionStorage.setItem('pcv_pending_download', '1')
      window.location.href = data.url
    }
  } catch (e) {
    showToast?.('Error: ' + e.message)
    loading.value = false
  }
}

// Called from App.vue when Stripe redirects back
async function handleStripeReturn() {
  await sendCvEmail()
}

defineExpose({ handleStripeReturn })
</script>

<style scoped>
.paywall-fade-enter-active, .paywall-fade-leave-active { transition: opacity .25s, transform .25s; }
.paywall-fade-enter-from, .paywall-fade-leave-to { opacity: 0; transform: scale(.97); }

.paywall-backdrop {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,.65); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.paywall-modal {
  background: var(--c-surface); border-radius: 20px;
  padding: 28px 26px; width: 100%; max-width: 380px;
  box-shadow: 0 24px 64px rgba(0,0,0,.2); position: relative;
}
.paywall-close {
  position: absolute; top: 14px; right: 14px;
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--c-bg); border: 1px solid var(--c-border);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--c-text2);
}
.paywall-close svg { width: 13px; height: 13px; }

/* Sending state */
.paywall-sending {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 32px 20px; text-align: center; min-height: 180px;
}
.send-spinner {
  width: 44px; height: 44px; border: 3px solid var(--c-border);
  border-top-color: var(--c-accent); border-radius: 50%;
  animation: spin .8s linear infinite; margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.send-title { font-size: 16px; font-weight: 700; color: var(--c-text); margin-bottom: 6px; }
.send-sub   { font-size: 13px; color: var(--c-text3); }

/* Success state */
.paywall-success { text-align: center; padding: 12px 4px; }
.success-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--c-green-lt); border: 2px solid var(--c-green);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: var(--c-green);
}
.success-title { font-size: 22px; font-weight: 700; color: var(--c-text); margin-bottom: 8px; }
.success-sub   { font-size: 13px; color: var(--c-text2); line-height: 1.6; }

/* Normal state */
.paywall-head { text-align: center; margin-bottom: 20px; }
.paywall-cv-icon {
  width: 56px; height: 56px; background: var(--c-accent-lt);
  border-radius: 16px; display: flex; align-items: center;
  justify-content: center; margin: 0 auto 14px;
}
.paywall-cv-icon svg { width: 28px; height: 28px; color: var(--c-accent); }
.paywall-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--c-text); margin-bottom: 6px; }
.paywall-sub   { font-size: 13px; color: var(--c-text2); line-height: 1.5; }

.paywall-price-wrap { text-align: center; margin-bottom: 18px; }
.paywall-price     { font-size: 46px; font-weight: 800; color: var(--c-accent); line-height: 1; margin-bottom: 4px; }
.paywall-price-sub { font-size: 12px; color: var(--c-text3); }

.paywall-features  { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.paywall-feature   { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--c-text2); }

.btn-pay {
  width: 100%; background: var(--c-accent); color: #fff; border: none;
  padding: 14px 20px; border-radius: 12px; font-size: 15px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 9px; font-family: 'DM Sans', sans-serif; transition: opacity .15s;
  margin-bottom: 12px;
}
.btn-pay:hover:not(:disabled) { opacity: .88; }
.btn-pay:disabled { opacity: .5; cursor: not-allowed; }

.paywall-secure {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11.5px; color: var(--c-text3); margin-bottom: 10px;
}

.demo-note {
  display: flex; align-items: flex-start; gap: 8px;
  background: var(--c-amber-lt); border: 1px solid #f0c080;
  border-radius: 8px; padding: 10px 12px; font-size: 12px; color: var(--c-amber);
}
.spin { animation: spin .7s linear infinite; }

@media (max-width: 768px) {
  .paywall-backdrop { padding: 0; align-items: flex-end; }
  .paywall-modal {
    border-radius: 20px 20px 0 0; max-width: 100%;
    padding-bottom: calc(28px + env(safe-area-inset-bottom));
  }
}

/* ── CV PREVIEW MODAL ─────────────────────────────────────── */
.cv-preview-fade-enter-active, .cv-preview-fade-leave-active { transition: opacity .25s, transform .25s; }
.cv-preview-fade-enter-from, .cv-preview-fade-leave-to { opacity: 0; transform: scale(.97); }

.cv-preview-backdrop {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,.85); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.cv-preview-modal {
  width: 100%; max-width: 780px;
  height: 92dvh; max-height: 920px;
  background: var(--c-bg);
  border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,.4);
}
.cv-preview-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}
.cv-preview-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 700; color: var(--c-text);
}
.cv-preview-close {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--c-bg); border: 1px solid var(--c-border);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--c-text2); transition: all .14s;
}
.cv-preview-close:hover { background: var(--c-rose-lt); color: var(--c-rose); }
.cv-preview-canvas {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 24px; display: flex;
  justify-content: center; align-items: flex-start;
  -webkit-overflow-scrolling: touch;
}
.cv-preview-scaler-wrap { position: relative; }

@media (max-width: 768px) {
  .cv-preview-backdrop { padding: 0; align-items: flex-end; }
  .cv-preview-modal {
    border-radius: 20px 20px 0 0;
    height: 95dvh; max-height: 95dvh; max-width: 100%;
  }
  .cv-preview-canvas { padding: 12px; }
}
</style>