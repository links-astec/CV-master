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
            <div class="gen-title">Generating your PDF...</div>
            <div class="gen-sub">This takes just a moment.</div>
          </div>

          <!-- Normal state -->
          <template v-else>
            <div class="paywall-head">
              <div class="paywall-cv-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
              </div>
              <h2 class="paywall-title">Export your CV</h2>
              <p class="paywall-sub">Download a pixel-perfect PDF ready to send to employers</p>
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
              {{ loading ? 'Processing...' : 'Pay £4.99 — Download PDF' }}
            </button>

            <div class="paywall-secure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:13px;height:13px;"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Secured by Stripe · Cancel anytime
            </div>

            <div v-if="demoMode" class="demo-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span><strong>Demo mode</strong> — Stripe not configured. Click to simulate payment and download.</span>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useNotifStore } from '../stores/notifications.js'
import { useCvRenderer } from '../composables/cvRenderer.js'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'paid'])

const store      = useCvStore()
const notifStore = useNotifStore()
const { render } = useCvRenderer()
const showToast  = inject('showToast')

const loading    = ref(false)
const demoMode   = ref(false)
const generating = ref(false)

const features = [
  'High-resolution PDF export',
  'ATS-optimised formatting',
  'Unlimited re-downloads',
  'All future updates included',
]

// Generate PDF by rendering CV HTML into a printable page
async function generateAndDownload() {
  generating.value = true
  try {
    const cvHtml = render(store.template, store.data)
    const fullName = `${store.data.fn || 'CV'} ${store.data.ln || ''}`.trim()

    // Open a hidden iframe, write the CV HTML, then print-to-PDF
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-10000px;left:-10000px;width:794px;height:1123px;border:none;'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
    iframeDoc.open()
    iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${fullName} — CV</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { background: #fff; font-family: 'DM Sans', sans-serif; }
  @page { size: A4; margin: 0; }
  @media print {
    html, body { width: 210mm; }
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
</style>
</head>
<body>${cvHtml}</body>
</html>`)
    iframeDoc.close()

    // Wait for fonts to load
    await new Promise(r => setTimeout(r, 1800))

    // Trigger browser print dialog (user saves as PDF)
    iframe.contentWindow.focus()
    iframe.contentWindow.print()

    // Clean up after a delay
    setTimeout(() => document.body.removeChild(iframe), 3000)

    showToast?.('CV ready — choose "Save as PDF" in the print dialog')
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
      // Demo mode — skip payment, go straight to PDF
      demoMode.value = true
      loading.value = false
      await notifStore.fetch()
      await generateAndDownload()
    } else if (data.url) {
      // Real Stripe — redirect to checkout
      // Store intent so we can download on return
      sessionStorage.setItem('pcv_pending_download', '1')
      window.location.href = data.url
    }
  } catch (e) {
    showToast?.('Error: ' + e.message)
    loading.value = false
  }
}

// Called externally when Stripe redirects back with ?session=...
async function handleStripeReturn() {
  loading.value = true
  generating.value = true
  await notifStore.fetch()
  await generateAndDownload()
  loading.value = false
}

defineExpose({ handleStripeReturn })
</script>

<style scoped>
.paywall-fade-enter-active,.paywall-fade-leave-active{transition:opacity .25s,transform .25s;}
.paywall-fade-enter-from,.paywall-fade-leave-to{opacity:0;transform:scale(.97);}
.paywall-generating{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;}
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