<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal wm" role="dialog" aria-modal="true">
          <button class="icon-btn modal-close" @click="$emit('close')" aria-label="Close">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div class="wm-hd">
            <h2>Download your CV</h2>
            <p>Take a free copy with a watermark, or unlock the clean PDF for this CV.</p>
          </div>

          <button class="wm-opt featured" :disabled="freeDownloading" @click="$emit('unlock')">
            <div class="wm-opt-txt">
              <div class="wm-opt-ttl">Clean PDF</div>
              <div class="wm-opt-sub">No watermark · emailed and downloadable · re-send free, even after edits</div>
            </div>
            <span class="wm-price">€0.99</span>
          </button>

          <button class="wm-opt" :disabled="freeDownloading" @click="downloadFree">
            <div class="wm-opt-txt">
              <div class="wm-opt-ttl">Free preview PDF</div>
              <div class="wm-opt-sub">{{ freeDownloading ? 'Preparing your PDF…' : 'Includes a “CVMaster” watermark across the page' }}</div>
            </div>
            <span class="wm-price">Free</span>
          </button>

          <p class="wm-foot">One-time payment per CV · No subscription · Referral credits accepted</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

// Free watermarked download of a stored CV (token from /api/cv/store-for-unlock).
// "Clean PDF" hands over to the paywall (emit 'unlock').
const props = defineProps({
  visible:    { type: Boolean, default: false },
  cleanToken: { type: String,  required: true },
  cvName:     { type: String,  default: 'cv.pdf' },
})
const emit = defineEmits(['close', 'unlock', 'free-download-done', 'show-toast'])

const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p
const freeDownloading = ref(false)

async function downloadFree() {
  freeDownloading.value = true
  try {
    const res = await fetch(apiUrl('/api/cv/download-watermarked'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: props.cleanToken }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error(res.status === 404 ? 'This download expired — click Download again.' : (d.error || 'Download failed. Please try again.'))
    }
    const url = URL.createObjectURL(await res.blob())
    const a = document.createElement('a')
    a.href = url; a.download = (props.cvName || 'cv').replace(/\.pdf$/i, '') + '-preview.pdf'
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    emit('free-download-done')
    emit('show-toast', 'Downloaded. Unlock the clean PDF any time for €0.99.')
  } catch (e) {
    emit('show-toast', e.message || 'Connection error. Please try again.')
  } finally {
    freeDownloading.value = false
  }
}
</script>

<style scoped>
.wm{max-width:460px;padding:30px 26px 24px}
.wm-hd{margin-bottom:18px;padding-right:24px}
.wm-hd h2{font-size:21px;font-weight:800;letter-spacing:-.025em}
.wm-hd p{color:var(--c-text2);margin-top:6px;line-height:1.55}
.wm-opt{width:100%;display:flex;align-items:center;gap:14px;padding:16px;margin-bottom:10px;border-radius:12px;border:1px solid var(--c-border);background:var(--c-surface);text-align:left;transition:border-color .15s,box-shadow .15s}
.wm-opt:hover:not(:disabled){border-color:var(--c-border2);box-shadow:var(--shadow-sm)}
.wm-opt.featured{border-color:var(--c-accent);box-shadow:0 0 0 1px var(--c-accent)}
.wm-opt:disabled{opacity:.6;cursor:wait}
.wm-opt-txt{flex:1;min-width:0}
.wm-opt-ttl{font-weight:700;font-size:15px}
.wm-opt-sub{font-size:13px;color:var(--c-text2);margin-top:3px;line-height:1.45}
.wm-price{font-weight:800;font-size:17px;white-space:nowrap}
.wm-opt.featured .wm-price{color:var(--c-accent)}
.wm-foot{text-align:center;font-size:12.5px;color:var(--c-text3);margin-top:14px}
</style>
