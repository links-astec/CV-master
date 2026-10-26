<template>
  <!-- "Upload the offer": a job offer from a PDF, Word file, text file or photo. The server reads it and
       leaves out lines written to an AI; the text lands in the box so the person sees it before using it. -->
  <span class="ofb">
    <button type="button" class="ofb-btn" :disabled="busy" @click="input?.click()">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      {{ $t(busy ? 'Reading the file…' : 'Upload the offer') }}
    </button>
    <input ref="input" type="file" hidden accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,application/pdf,image/*" @change="pick" />
    <span v-if="note" class="ofb-note" :class="{ err: isErr }">{{ note }}</span>
  </span>
</template>

<script setup>
import { ref } from 'vue'
import { t } from '../i18n/index.js'

const emit = defineEmits(['text'])
const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p
const input = ref(null), busy = ref(false), note = ref(''), isErr = ref(false)

async function pick(e) {
  const file = e.target.files?.[0]; e.target.value = ''
  if (!file) return
  note.value = ''; isErr.value = false
  if (file.size > 5 * 1024 * 1024) { note.value = t('This file is over 5 MB.'); isErr.value = true; return }
  busy.value = true
  try {
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch(apiUrl('/api/job/offer-file'), { method: 'POST', credentials: 'include', body: fd })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || 'We couldn’t read this file. Copy and paste the offer instead.')
    emit('text', j.text)
    note.value = j.removed ? t(j.removed === 1 ? 'Added. We left out 1 line written to an AI, not to you.' : 'Added. We left out {n} lines written to an AI, not to you.', { n: j.removed }) : t('Added. Check it below.')
  } catch (err) { note.value = t(err.message); isErr.value = true }
  finally { busy.value = false }
}
</script>

<style scoped>
.ofb{display:inline-flex;align-items:center;flex-wrap:wrap;gap:6px 12px}
.ofb-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 13px;border:none;border-radius:99px;background:var(--fill);font:inherit;font-size:13.5px;font-weight:600;color:var(--c-accent);cursor:pointer}
.ofb-btn:disabled{opacity:.6;cursor:default}
.ofb-btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.ofb-note{font-size:12.5px;color:var(--c-text3)}
.ofb-note.err{color:var(--c-rose)}
</style>
