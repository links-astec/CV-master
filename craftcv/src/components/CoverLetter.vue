<template>
  <!-- The cover letter for this CV's job offer: written by the AI from the CV's real experience, edited here,
       shown on the right in the CV's design. Copying is free; the PDF comes with the CV's PDF (paid or pass). -->
  <section class="cl">
    <div class="cl-hd">
      <h3>{{ $t('Cover letter') }}</h3>
      <p>{{ $t('Written from your CV for this job. You see it on the right in your CV’s design.') }}</p>
    </div>

    <!-- The job offer -->
    <p class="cl-sec">{{ $t('The job') }}</p>
    <div v-if="!hasOffer || editingOffer" class="cl-group">
      <textarea v-model="offerDraft" class="cl-offer" rows="7" :placeholder="$t('Paste the job offer here. Title, responsibilities and requirements…')"></textarea>
      <div class="cl-group-ft">
        <button v-if="hasOffer" type="button" class="cl-link" @click="editingOffer = false">{{ $t('Cancel') }}</button>
        <button type="button" class="cl-btn" :disabled="offerDraft.trim().length < 80" @click="useOffer">{{ $t('Use this offer') }}</button>
      </div>
    </div>
    <div v-else class="cl-group">
      <div class="cl-row"><span class="cl-row-k"><b>{{ jobLine }}</b><small>{{ offerPreview }}</small></span>
        <button type="button" class="cl-link" @click="editOffer">{{ $t('Change') }}</button></div>
    </div>

    <!-- How it should sound -->
    <p class="cl-sec">{{ $t('Style') }}</p>
    <div class="cl-group">
      <div class="cl-row"><span class="cl-row-k"><b>{{ $t('Tone') }}</b></span>
        <div class="seg cl-seg"><button v-for="o in TONES" :key="o.id" type="button" :class="{ active: opts.tone === o.id }" @click="opts.tone = o.id">{{ $t(o.label) }}</button></div></div>
      <div class="cl-row"><span class="cl-row-k"><b>{{ $t('Length') }}</b></span>
        <div class="seg cl-seg"><button v-for="o in LENGTHS" :key="o.id" type="button" :class="{ active: opts.length === o.id }" @click="opts.length = o.id">{{ $t(o.label) }}</button></div></div>
      <label class="cl-row"><span class="cl-row-k"><b>{{ $t('Addressed to') }}</b></span>
        <input v-model="opts.to" class="cl-in" maxlength="80" :placeholder="$t('Name, if the offer gives one')" /></label>
    </div>

    <button type="button" class="cl-cta" :disabled="busy || !hasOffer" @click="write">
      <span v-if="busy" class="cl-spin"></span>{{ $t(busy ? 'Writing your letter…' : letter ? 'Write it again' : 'Write my letter') }}
    </button>
    <p v-if="!hasOffer" class="cl-foot">{{ $t('Add the job offer first: a letter for a specific job works far better.') }}</p>
    <p v-else-if="!letter" class="cl-foot">{{ $t('Uses one AI request. Only facts from your CV, nothing invented.') }}</p>
    <p v-if="error" class="cl-err">{{ $t(error) }}</p>

    <!-- The letter -->
    <template v-if="letter">
      <p class="cl-sec">{{ $t('Your letter') }}<span v-if="stale" class="cl-stale"> · {{ $t('written for another job offer') }}</span></p>
      <div class="cl-group">
        <textarea v-model="letterText" class="cl-text" rows="16" :aria-label="$t('Cover letter')"></textarea>
        <div class="cl-group-ft">
          <span class="cl-count">{{ $t('{n} words', { n: words }) }}</span>
          <button type="button" class="cl-link" @click="copy">{{ $t(copied ? 'Copied' : 'Copy') }}</button>
          <button type="button" class="cl-btn" :disabled="pdfBusy" @click="downloadPdf">{{ $t(pdfBusy ? 'Preparing…' : 'Download PDF') }}</button>
        </div>
      </div>
      <p class="cl-foot">{{ $t(unlocked ? 'The PDF uses your CV’s design, colours and fonts.' : 'The PDF comes with this CV’s PDF (€0.99), or with every CV on the Job Hunt Pass.') }}</p>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'
import { lang, t } from '../i18n/index.js'

const emit = defineEmits(['pay'])
const store = useCvStore()
const auth = useAuthStore()
const requireAccount = inject('requireAccount', null)
const showToast = inject('showToast', () => {})
const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p

const TONES = [{ id: 'professional', label: 'Professional' }, { id: 'warm', label: 'Warm' }, { id: 'confident', label: 'Confident' }]
const LENGTHS = [{ id: 'short', label: 'Short' }, { id: 'standard', label: 'Standard' }]
const saved = store.data.coverLetter || {}
const opts = ref({ tone: saved.tone || 'professional', length: saved.length || 'standard', to: saved.to || '' })
const busy = ref(false), pdfBusy = ref(false), error = ref(''), copied = ref(false)

// The job offer (shared with Job match)
const hasOffer = computed(() => (store.data.jobOffer || '').trim().length >= 80)
const editingOffer = ref(false)
const offerDraft = ref(store.data.jobOffer || '')
function editOffer() { offerDraft.value = store.data.jobOffer || ''; editingOffer.value = true }
function useOffer() { store.data.jobOffer = offerDraft.value.trim(); editingOffer.value = false }
const offerPreview = computed(() => (store.data.jobOffer || '').replace(/\s+/g, ' ').trim().slice(0, 90) + '…')
const jobLine = computed(() => {
  const j = store.data.coverLetter?.job
  return j?.title ? [j.title, j.company].filter(Boolean).join(t(' at ')) : t('Job offer added')
})

// The letter lives on the CV, with the offer it was written for
const jobKey = computed(() => { const s = (store.data.jobOffer || '').trim(); return s.length + ':' + s.slice(0, 60) })
const letter = computed(() => store.data.coverLetter?.text ? store.data.coverLetter : null)
const stale = computed(() => letter.value && letter.value.key && letter.value.key !== jobKey.value)
const letterText = computed({
  get: () => letter.value?.text || '',
  set: (v) => { store.data.coverLetter = { ...store.data.coverLetter, text: v } },
})
const words = computed(() => (letterText.value.match(/\S+/g) || []).length)
watch(opts, (o) => { if (store.data.coverLetter) store.data.coverLetter = { ...store.data.coverLetter, ...o } }, { deep: true })

const unlocked = computed(() => !!auth.user?.pass)

async function write() {
  error.value = ''
  busy.value = true
  try {
    const { photo, coverLetter, interviewPrep, ...cv } = JSON.parse(JSON.stringify(store.data))
    const r = await fetch(apiUrl('/api/ai/cover-letter'), {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv, jobOffer: store.data.jobOffer, uiLang: lang.value, ...opts.value }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) { if (r.status !== 429) error.value = j.error || 'AI is unavailable right now. Please try again in a moment.'; return }
    store.data.coverLetter = { key: jobKey.value, text: j.letter, job: j.job || null, date: new Date().toISOString(), ...opts.value }
  } catch { error.value = 'AI is unavailable right now. Please try again in a moment.' }
  finally { busy.value = false }
}
async function copy() {
  try { await navigator.clipboard.writeText(letterText.value); copied.value = true; setTimeout(() => { copied.value = false }, 1600) } catch {}
}
async function downloadPdf() {
  if (!auth.isLoggedIn && !(await requireAccount?.('download'))) return
  pdfBusy.value = true
  try {
    const id = await store.saveDraft()
    const r = await fetch(apiUrl('/api/cv/letter-pdf'), {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftId: id || store.currentDraftId }),
    })
    if (r.status === 402) { showToast(t('The letter comes with this CV’s PDF.')); emit('pay'); return }
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Download failed. Please try again.') }
    const blob = await r.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = ([store.data.fn, store.data.ln].filter(Boolean).join('-') || 'Cover') + '-Cover-letter.pdf'
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000)
  } catch (e) { error.value = e.message }
  finally { pdfBusy.value = false }
}
</script>

<style scoped>
.cl{padding:2px 0 24px}
.cl-hd h3{font-size:19px;font-weight:700;letter-spacing:-.02em;margin:0;color:var(--c-text)}
.cl-hd p{font-size:13.5px;color:var(--c-text3);margin:4px 0 0;line-height:1.45}
.cl-sec{font-size:13px;font-weight:600;color:var(--c-text3);margin:20px 4px 7px}
.cl-stale{color:var(--c-amber,#b45309);font-weight:500}
.cl-group{background:var(--fill);border-radius:16px;overflow:hidden}
.cl-row{display:flex;align-items:center;gap:12px;min-height:50px;padding:9px 14px;position:relative}
.cl-row + .cl-row::before{content:'';position:absolute;top:0;left:14px;right:0;height:1px;background:var(--hair)}
.cl-row-k{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.cl-row-k b{font-size:14.5px;font-weight:600;color:var(--c-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-row-k small{font-size:12.5px;color:var(--c-text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-seg{flex-shrink:0}
.cl-seg button{height:28px;padding:0 11px;font-size:12.5px}
.cl-in{flex:1.4;min-width:0;border:none;background:none;font:inherit;font-size:14px;color:var(--c-text);text-align:right;outline:none}
.cl-in::placeholder{color:var(--c-text3)}
.cl-offer,.cl-text{display:block;width:100%;border:none;background:none;padding:14px 16px;font:inherit;font-size:14px;line-height:1.6;color:var(--c-text);resize:vertical;outline:none}
.cl-offer::placeholder{color:var(--c-text3)}
.cl-group-ft{display:flex;align-items:center;justify-content:flex-end;gap:14px;padding:8px 12px 12px;border-top:1px solid var(--hair)}
.cl-count{margin-right:auto;font-size:12.5px;color:var(--c-text3)}
.cl-btn{height:34px;padding:0 16px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}
.cl-btn:disabled{opacity:.5;cursor:default}
.cl-link{border:none;background:none;padding:0;font:inherit;font-size:13.5px;font-weight:600;color:var(--c-accent);cursor:pointer}
.cl-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:48px;margin-top:18px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:15px;font-weight:600;cursor:pointer}
.cl-cta:disabled{opacity:.5;cursor:default}
.cl-spin{width:14px;height:14px;border:2px solid #fff;border-right-color:transparent;border-radius:50%;animation:clSpin .8s linear infinite}
@keyframes clSpin{to{transform:rotate(360deg)}}
.cl-foot{font-size:12.5px;color:var(--c-text3);margin:8px 4px 0;line-height:1.45}
.cl-err{font-size:13px;color:var(--c-rose);margin:10px 4px 0}
@media (max-width:420px){ .cl-row{flex-wrap:wrap} .cl-in{text-align:left;flex-basis:100%} }
</style>
