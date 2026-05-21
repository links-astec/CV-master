<template>
  <div v-if="visible" class="wm-overlay" @click.self="$emit('close')">
    <div class="wm-modal">
      <button class="wm-close" @click="$emit('close')">×</button>

      <!-- TEASER: two clickable cards -->
      <div v-if="phase === 'teaser'">
        <div class="wm-hero">
          <div class="wm-icon">📄</div>
          <h2>Download your CV</h2>
          <p>Choose free with watermark, or pay €0.50 for a clean copy.</p>
        </div>

        <!-- FREE card: click to download watermarked PDF immediately -->
        <button class="wm-card wm-card-free" :disabled="freeDownloading || loading" @click="downloadFree">
          <div class="wm-card-inner">
            <div class="wm-card-body">
              <p class="wm-filename">{{ cvName }}</p>
              <p class="wm-sublabel">{{ freeDownloading ? 'Preparing…' : 'Free version · watermarked' }}</p>
              <p class="wm-stamp-text">CVMaster — upgrade at cvmaster.live</p>
            </div>
            <span class="wm-badge">Free</span>
          </div>
        </button>

        <!-- PAID card: click to pay via Stripe Checkout redirect -->
        <button class="wm-card wm-card-paid" :disabled="loading || freeDownloading" @click="initPayment">
          <div class="wm-card-inner">
            <span class="wm-check">✅</span>
            <div class="wm-card-body">
              <p class="wm-feature-title">Clean PDF + DOCX</p>
              <p class="wm-feature-sub">{{ loading ? 'Redirecting to payment…' : 'No watermark · ATS-ready · All 107 templates' }}</p>
            </div>
            <span class="wm-price">€0.50</span>
          </div>
        </button>

        <p class="wm-footer-note">One-time charge · No subscription · Powered by Stripe</p>
      </div>

      <!-- DONE -->
      <div v-else-if="phase === 'done'" class="wm-done">
        <div class="wm-icon">🎉</div>
        <h2>Clean CV downloaded!</h2>
        <p>No watermark, ATS-optimised, ready to send. Good luck!</p>
        <button class="wm-btn-outline" :disabled="downloading" @click="redownload">
          {{ downloading ? 'Downloading…' : 'Download again' }}
        </button>
        <p class="wm-footer-note">Link valid for 1 hour</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible:    { type: Boolean, default: false },
  cleanToken: { type: String,  required: true },
  cvName:     { type: String,  default: 'cv.pdf' },
})

const emit = defineEmits(['close', 'free-download-done', 'show-toast'])

const phase           = ref('teaser')
const loading         = ref(false)
const freeDownloading = ref(false)
const downloading     = ref(false)

const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// FREE: download watermarked PDF immediately using the stored token
async function downloadFree() {
  freeDownloading.value = true
  try {
    const res = await fetch(apiUrl('/api/cv/download-watermarked'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: props.cleanToken }),
    })
    if (res.ok) {
      triggerDownload(await res.blob(),
        (props.cvName || 'cv').replace(/\.pdf$/i, '') + '-preview.pdf')
      emit('free-download-done')
      emit('show-toast', 'Downloaded! Upgrade to remove the watermark.')
    } else {
      const d = await res.json().catch(() => ({}))
      emit('show-toast', res.status === 404
        ? 'Session expired. Click download again from the dashboard.'
        : (d.error || 'Download failed. Please try again.'))
    }
  } catch {
    emit('show-toast', 'Connection error. Please try again.')
  } finally {
    freeDownloading.value = false
  }
}

// PAID: redirect to Stripe Checkout — no window.Stripe or script tag needed
async function initPayment() {
  loading.value = true
  try {
    const res = await fetch(apiUrl('/api/cv/unlock'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: props.cleanToken }),
    })
    if (!res.ok) throw new Error('Could not create payment session')
    const data = await res.json()

    if (data.demo) {
      // No Stripe configured on server — skip to done
      phase.value = 'done'
      loading.value = false
      return
    }

    // Save filename so App.vue can name the downloaded file after redirect
    sessionStorage.setItem('pcv_wm_token',    props.cleanToken)
    sessionStorage.setItem('pcv_wm_filename',  props.cvName || 'cv.pdf')

    // Redirect to Stripe hosted payment page
    window.location.href = data.url
  } catch (err) {
    emit('show-toast', err.message || 'Something went wrong. Please try again.')
    loading.value = false
  }
}

// Called by App.vue after Stripe redirects back to /download-clean?token=...&session=...
async function downloadClean(token, sessionId) {
  downloading.value = true
  try {
    const res = await fetch(apiUrl(`/api/cv/clean/${token}`), {
      credentials: 'include',
      headers: sessionId ? { 'x-payment-intent-id': sessionId } : {},
    })
    if (res.ok) {
      const fname = (sessionStorage.getItem('pcv_wm_filename') || 'cv')
        .replace(/\.pdf$/i, '') + '-clean.pdf'
      triggerDownload(await res.blob(), fname)
      sessionStorage.removeItem('pcv_wm_token')
      sessionStorage.removeItem('pcv_wm_filename')
      phase.value = 'done'
    } else if (res.status === 410) {
      emit('show-toast', 'Download link expired. Click download again — your payment is saved.')
    } else if (res.status === 402) {
      emit('show-toast', 'Payment not confirmed yet. Please wait a moment and try again.')
    } else {
      const d = await res.json().catch(() => ({}))
      emit('show-toast', d.error || 'Download failed. Please try again.')
    }
  } catch {
    emit('show-toast', 'Connection error. Please try again.')
  } finally {
    downloading.value = false
  }
}

async function redownload() {
  await downloadClean(props.cleanToken, null)
}

defineExpose({ downloadClean })

watch(() => props.visible, (val) => {
  if (!val) {
    setTimeout(() => {
      phase.value           = 'teaser'
      loading.value         = false
      freeDownloading.value = false
      downloading.value     = false
    }, 300)
  }
})
</script>

<style scoped>
.wm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}
.wm-modal {
  background: #fff; border-radius: 16px; padding: 28px;
  max-width: 420px; width: 100%;
  box-shadow: 0 24px 80px rgba(0,0,0,.18); position: relative;
}
.wm-close {
  position: absolute; top: 14px; right: 14px;
  background: none; border: none; font-size: 22px;
  cursor: pointer; color: #aaa; line-height: 1; padding: 0;
}
.wm-close:hover { color: #555; }

.wm-hero { text-align: center; margin-bottom: 20px; }
.wm-icon { font-size: 42px; margin-bottom: 10px; }
.wm-hero h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #1a1a1a; }
.wm-hero p  { margin: 0; color: #555; font-size: 14px; line-height: 1.55; }

/* ── Two clickable option cards ── */
.wm-card {
  display: block; width: 100%; text-align: left; padding: 0;
  border-radius: 10px; cursor: pointer; margin-bottom: 10px;
  transition: transform .12s, box-shadow .12s; background: none;
}
.wm-card:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,.1); }
.wm-card:active:not(:disabled) { transform: translateY(0); }
.wm-card:disabled { opacity: .55; cursor: not-allowed; }

.wm-card-free { border: 1.5px dashed #ccc; background: #fafafa; }
.wm-card-free:hover:not(:disabled) { border-color: #888; }

.wm-card-paid { border: 1.5px solid #b8e8d0; background: #f0faf5; }
.wm-card-paid:hover:not(:disabled) { border-color: #4caf88; }

.wm-card-inner { display: flex; align-items: center; gap: 10px; padding: 12px 14px; }
.wm-card-body  { flex: 1; min-width: 0; }

.wm-filename      { margin: 0; font-size: 13px; font-weight: 600; color: #333; }
.wm-sublabel      { margin: 3px 0 0; font-size: 12px; color: #888; }
.wm-stamp-text    { margin: 3px 0 0; font-size: 10px; color: #bbb; font-weight: 600; }
.wm-feature-title { margin: 0; font-weight: 700; font-size: 13px; color: #1a1a1a; }
.wm-feature-sub   { margin: 3px 0 0; font-size: 11.5px; color: #555; }

.wm-badge { flex-shrink: 0; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: #eee; color: #666; }
.wm-check { font-size: 20px; flex-shrink: 0; }
.wm-price { flex-shrink: 0; font-weight: 800; font-size: 18px; color: #1a1a1a; white-space: nowrap; margin-left: auto; }

/* ── Done phase ── */
.wm-done { text-align: center; padding: 8px 0; }
.wm-done h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; }
.wm-done p  { color: #555; font-size: 14px; line-height: 1.5; margin: 0 0 20px; }
.wm-btn-outline {
  background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px;
  padding: 10px 24px; font-size: 13px; cursor: pointer; margin-bottom: 8px;
}
.wm-btn-outline:disabled { opacity: .5; cursor: not-allowed; }

.wm-footer-note { text-align: center; font-size: 12px; color: #aaa; margin: 10px 0 0; }
</style>