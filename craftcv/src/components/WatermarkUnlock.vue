<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal wm" role="dialog" aria-modal="true">
          <button class="icon-btn modal-close" @click="$emit('close')" aria-label="Close">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <template v-if="phase === 'teaser'">
            <div class="wm-hd">
              <h2>Download your CV</h2>
              <p>Get a free copy with a watermark, or a clean copy for €0.50.</p>
            </div>

            <button class="wm-opt" :disabled="freeDownloading || loading" @click="downloadFree">
              <div class="wm-opt-txt">
                <div class="wm-opt-ttl">Free preview PDF</div>
                <div class="wm-opt-sub">{{ freeDownloading ? 'Preparing…' : 'Includes a “CVMaster” watermark across the page' }}</div>
              </div>
              <span class="wm-price">Free</span>
            </button>

            <button class="wm-opt featured" :disabled="loading || freeDownloading" @click="initPayment">
              <div class="wm-opt-txt">
                <div class="wm-opt-ttl">Clean PDF</div>
                <div class="wm-opt-sub">{{ loading ? 'Opening secure checkout…' : 'No watermark · ready to send to employers' }}</div>
              </div>
              <span class="wm-price">€0.50</span>
            </button>

            <button v-if="credits > 0" class="btn-secondary btn-block wm-credit" :disabled="loading || freeDownloading" @click="useCredit">
              Use a referral credit for the clean PDF — free ({{ credits }} left)
            </button>

            <p class="wm-foot">One-time payment by Stripe · No subscription</p>
          </template>

          <div v-else class="wm-done">
            <span class="wm-ok"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>
            <h2>Your clean CV has downloaded</h2>
            <p>No watermark, one page, ready to send. Good luck!</p>
            <div class="wm-row">
              <button class="btn-secondary" :disabled="downloading" @click="redownload">{{ downloading ? 'Downloading…' : 'Download again' }}</button>
              <button class="btn-primary accent" @click="$emit('close')">Done</button>
            </div>
            <p class="wm-foot">The download link stays valid for 2 hours.</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
const credits         = ref(0)

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

async function loadCredits() {
  try {
    const r = await fetch(apiUrl('/api/referral/info'), { credentials: 'include' })
    if (r.ok) credits.value = Number((await r.json()).credits) || 0
  } catch {}
}

// Spend a referral credit on this clean download, then download it
async function useCredit() {
  loading.value = true
  try {
    const r = await fetch(apiUrl('/api/referral/redeem'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: 'clean_download', token: props.cleanToken }),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.error || 'Could not apply credit.')
    credits.value = d.credits ?? Math.max(0, credits.value - 1)
    await downloadClean(props.cleanToken, null)
  } catch (e) {
    emit('show-toast', e.message)
  } finally {
    loading.value = false
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
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Could not start the payment. Please try again.')

    if (data.demo) {
      // No Stripe configured on server — the unlock is recorded, so download it now
      loading.value = false
      await downloadClean(props.cleanToken, null)
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
      const fname = (sessionStorage.getItem('pcv_wm_filename') || props.cvName || 'cv')
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
  if (val) loadCredits()
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
.wm{max-width:440px;padding:30px 26px 24px}
.wm-hd{margin-bottom:18px;padding-right:24px}
.wm-hd h2,.wm-done h2{font-size:20px;font-weight:650;letter-spacing:-.015em}
.wm-hd p,.wm-done p{color:var(--c-text2);margin-top:6px;line-height:1.55}
.wm-opt{width:100%;display:flex;align-items:center;gap:14px;padding:16px;margin-bottom:10px;border-radius:12px;border:1px solid var(--c-border);background:var(--c-surface);text-align:left;transition:border-color .15s,box-shadow .15s}
.wm-opt:hover:not(:disabled){border-color:var(--c-border2);box-shadow:var(--shadow-sm)}
.wm-opt.featured{border-color:var(--c-accent);box-shadow:0 0 0 1px var(--c-accent)}
.wm-opt:disabled{opacity:.6;cursor:wait}
.wm-opt-txt{flex:1;min-width:0}
.wm-opt-ttl{font-weight:600;font-size:15px}
.wm-opt-sub{font-size:13px;color:var(--c-text2);margin-top:3px}
.wm-price{font-weight:700;font-size:16px;white-space:nowrap}
.wm-opt.featured .wm-price{color:var(--c-accent)}
.wm-credit{margin-top:2px}
.wm-foot{text-align:center;font-size:12.5px;color:var(--c-text3);margin-top:14px}
.wm-done{display:flex;flex-direction:column;align-items:center;text-align:center;padding:12px 4px 0}
.wm-done h2{margin-top:16px}
.wm-ok{width:52px;height:52px;border-radius:50%;background:var(--c-green-lt);display:flex;align-items:center;justify-content:center}
.wm-ok svg{width:26px;height:26px;fill:none;stroke:var(--c-green);stroke-width:2.6}
.wm-row{display:flex;gap:10px;margin-top:20px}
</style>
