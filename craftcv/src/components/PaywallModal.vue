<template>
  <Teleport to="body">
    <Transition name="paywall-fade">
      <div v-if="show" class="paywall-backdrop" @click.self="$emit('close')">
        <div class="paywall-modal">
          <button class="paywall-close" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Generating state -->
          <div v-if="generating" class="paywall-generating">
            <div class="gen-spinner"></div>
            <div class="gen-title">{{ genStatus }}</div>
            <div class="gen-sub">{{ genSub }}</div>
          </div>

          <!-- Normal state -->
          <template v-else>
            <div class="paywall-head">
              <div class="paywall-cv-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
              </div>
              <h2 class="paywall-title">Export your CV</h2>
              <p class="paywall-sub">Pay once — your CV downloads instantly and is also sent to your email</p>
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
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              {{ loading ? 'Processing...' : 'Pay £4.99 — Download & Email CV' }}
            </button>

            <div class="paywall-secure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:13px;height:13px;"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Secured by Stripe · CV also sent to {{ userEmail }}
            </div>

            <div v-if="demoMode" class="demo-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span><strong>Demo mode</strong> — Stripe not configured. Simulating payment.</span>
            </div>
          </template>
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

const loading    = ref(false)
const demoMode   = ref(false)
const generating = ref(false)
const genStatus  = ref('Generating your CV...')
const genSub     = ref('This takes just a moment.')

const userEmail = computed(() => auth.user?.email || 'your email')

const features = [
  'Instant PDF download in browser',
  'CV also sent to your email',
  'ATS-optimised formatting',
  'Unlimited re-downloads',
]

function buildCvHtml() {
  const cvHtml = render(store.template, store.data)
  const name = `${store.data.fn || 'My'} ${store.data.ln || 'CV'}`.trim()
  return {
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}body{background:#fff;}@page{size:A4;margin:0;}@media print{html,body{width:210mm;print-color-adjust:exact;-webkit-print-color-adjust:exact;}}</style>
</head><body>${cvHtml}</body></html>`,
    name,
  }
}

async function generateAndDownload() {
  generating.value = true
  genStatus.value = 'Generating your PDF...'
  genSub.value = 'Opening print dialog...'

  try {
    const { html, name } = buildCvHtml()

    // 1. Print to PDF via hidden iframe
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-10000px;left:-10000px;width:794px;height:1123px;border:none;'
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument || iframe.contentWindow.document
    doc.open(); doc.write(html); doc.close()
    await new Promise(r => setTimeout(r, 1800)) // wait for fonts
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => document.body.removeChild(iframe), 3000)

    // 2. Also email the CV automatically
    genStatus.value = 'Emailing your CV...'
    genSub.value = `Sending to ${userEmail.value}`
    try {
      await fetch('/api/cv/email', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent: html,
          fileName: `${name.replace(/\s+/g,'-')}-CV.html`,
        }),
      })
    } catch (e) {
      console.warn('Email send failed:', e.message)
    }

    await notifStore.fetch()
    showToast?.('CV ready — check print dialog. Also sent to your email.')
    emit('paid')
  } catch (e) {
    showToast?.('Export failed: ' + e.message)
  }
  generating.value = false
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
      loading.value = false
      await generateAndDownload()
    } else if (data.url) {
      sessionStorage.setItem('pcv_pending_download', '1')
      window.location.href = data.url
    }
  } catch (e) {
    showToast?.('Error: ' + e.message)
    loading.value = false
  }
}

async function handleStripeReturn() {
  loading.value = true
  await generateAndDownload()
  loading.value = false
}

defineExpose({ handleStripeReturn })
</script>

<style scoped>
.paywall-fade-enter-active,.paywall-fade-leave-active{transition:opacity .25s,transform .25s;}
.paywall-fade-enter-from,.paywall-fade-leave-to{opacity:0;transform:scale(.97);}
.paywall-generating{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;min-height:200px;}
.gen-spinner{width:40px;height:40px;border:3px solid var(--c-border);border-top-color:var(--c-accent);border-radius:50%;animation:spin .8s linear infinite;margin-bottom:16px;}
@keyframes spin{to{transform:rotate(360deg);}}
.gen-title{font-size:16px;font-weight:700;color:var(--c-text);margin-bottom:6px;}
.gen-sub{font-size:13px;color:var(--c-text3);}
.demo-note{display:flex;align-items:center;gap:8px;margin-top:12px;background:var(--c-amber-lt);border:1px solid #f0c080;border-radius:8px;padding:10px 12px;font-size:12px;color:var(--c-amber);}
.paywall-head{text-align:center;margin-bottom:20px;}
.paywall-cv-icon{width:56px;height:56px;background:var(--c-accent-lt);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
.paywall-cv-icon svg{width:28px;height:28px;color:var(--c-accent);}
.paywall-price-wrap{text-align:center;margin-bottom:20px;}
.paywall-price{font-size:46px;font-weight:800;color:var(--c-accent);line-height:1;margin-bottom:4px;}
.paywall-price-sub{font-size:12px;color:var(--c-text3);}
.spin{animation:spin .7s linear infinite;}
</style>