<template>
  <!-- Job Hunt Pass perks for the job offer on this CV: a cover letter and interview prep.
       Without the pass they're shown, with what they are, and where to get them. -->
  <section class="ak">
    <div class="ak-hd">
      <div class="ak-t">{{ $t('Your application kit') }}</div>
      <span v-if="pass" class="ak-pass">{{ $t('Job Hunt Pass') }}</span>
    </div>
    <p class="ak-sub">{{ $t('For this job offer, written from your CV.') }}</p>

    <div class="ak-group">
      <!-- Cover letter: its own tab -->
      <div class="ak-row">
        <div class="ak-row-t"><b>{{ $t('Cover letter') }}</b><span>{{ $t('A letter for this job, from your real experience, in your CV’s design.') }}</span></div>
        <button class="ak-btn" @click="showTab?.('letter')">{{ $t(letter ? 'Open' : 'Write it') }}</button>
      </div>

      <!-- Interview prep -->
      <div class="ak-row">
        <div class="ak-row-t"><b>{{ $t('Interview prep') }}</b><span>{{ $t('The questions this employer is likely to ask you, and how to answer from your CV.') }}</span></div>
        <button v-if="pass" class="ak-btn" :disabled="busy === 'interview'" @click="prepInterview">{{ $t(busy === 'interview' ? 'Preparing…' : prep ? 'Prepare again' : 'Prepare me') }}</button>
        <button v-else class="ak-lock" @click="toPass"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>{{ $t('With the pass') }}</button>
      </div>
      <div v-if="pass && prep" class="ak-out">
        <details v-for="(x, i) in prep" :key="i" class="ak-q" :open="i === 0">
          <summary>{{ x.q }}</summary>
          <p v-if="x.why"><b>{{ $t('Why they ask') }}</b>{{ x.why }}</p>
          <p v-if="x.tip"><b>{{ $t('How to answer') }}</b>{{ x.tip }}</p>
        </details>
      </div>
    </div>
    <p v-if="error" class="ak-err">{{ $t(error) }}</p>
    <p v-if="!pass" class="ak-note">{{ $t('Interview prep comes with the Job Hunt Pass.') }} <button class="ak-link" @click="toPass">{{ $t('See the pass') }}</button></p>
  </section>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useCvStore } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'
import { lang } from '../i18n/index.js'

const store = useCvStore()
const auth = useAuthStore()
const router = useRouter()
const pass = computed(() => !!auth.user?.pass)
const showTab = inject('showEditorTab', null)
const busy = ref('')
const error = ref('')
const copied = ref(false)

// Kept on the CV, for the job offer it was made for
const jobKey = computed(() => { const t = (store.data.jobOffer || '').trim(); return t.length + ':' + t.slice(0, 60) })
const letter = computed(() => store.data.coverLetter?.key === jobKey.value ? store.data.coverLetter : null)
const letterText = computed({
  get: () => letter.value?.text || '',
  set: (v) => { if (letter.value) store.data.coverLetter = { ...letter.value, text: v } },
})
const prep = computed(() => store.data.interviewPrep?.key === jobKey.value ? store.data.interviewPrep.questions : null)

async function ask(path) {
  const { photo, coverLetter, interviewPrep, ...cv } = JSON.parse(JSON.stringify(store.data))
  const r = await fetch((import.meta.env.VITE_API_URL || '') + path, {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cv, jobOffer: store.data.jobOffer, uiLang: lang.value }),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error(j.error || 'AI is unavailable right now. Please try again in a moment.'), { status: r.status })
  return j
}
async function writeLetter() {
  busy.value = 'letter'; error.value = ''
  try { const j = await ask('/api/ai/cover-letter'); store.data.coverLetter = { key: jobKey.value, text: j.letter } }
  catch (e) { error.value = e.status === 429 ? '' : e.message }
  busy.value = ''
}
async function prepInterview() {
  busy.value = 'interview'; error.value = ''
  try { const j = await ask('/api/ai/interview'); store.data.interviewPrep = { key: jobKey.value, questions: j.questions } }
  catch (e) { error.value = e.status === 429 ? '' : e.message }
  busy.value = ''
}
async function copyLetter() {
  try { await navigator.clipboard.writeText(letterText.value); copied.value = true; setTimeout(() => { copied.value = false }, 1800) } catch {}
}
function downloadLetter() {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([letterText.value], { type: 'text/plain;charset=utf-8' }))
  const who = [store.data.fn, store.data.ln].filter(Boolean).join(' ') || 'CV'
  a.download = `Cover letter - ${who}.txt`
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
function toPass() { router.push(auth.isLoggedIn ? { path: '/settings', hash: '#pass' } : '/pricing') }
watch(jobKey, () => { error.value = '' })
</script>

<style scoped>
.ak{margin-top:18px}
.ak-hd{display:flex;align-items:center;gap:10px}
.ak-t{font-size:17px;font-weight:650;letter-spacing:-.015em;color:var(--c-text)}
.ak-pass{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:99px;background:var(--c-accent);color:#fff;font-size:11.5px;font-weight:700}
.ak-sub{font-size:13.5px;color:var(--c-text3);margin:4px 0 12px}
.ak-group{border-radius:16px;background:var(--fill);overflow:hidden}
.ak-row{display:flex;align-items:center;gap:14px;padding:14px 16px;position:relative}
.ak-row + .ak-row,.ak-out + .ak-row{border-top:1px solid var(--hair)}
.ak-row-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ak-row-t b{font-size:15px;font-weight:600;color:var(--c-text)}
.ak-row-t span{font-size:13px;color:var(--c-text2);line-height:1.45}
.ak-btn{flex-shrink:0;height:34px;padding:0 16px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;transition:opacity .2s}
.ak-btn:disabled{opacity:.6;cursor:default}
.ak-lock{flex-shrink:0;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border:none;border-radius:99px;background:var(--c-surface);color:var(--c-text2);font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.ak-lock svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ak-lock:hover{color:var(--c-accent)}
.ak-out{padding:0 16px 16px}
.ak-letter{width:100%;border:none;border-radius:12px;background:var(--c-surface);padding:14px 16px;font:inherit;font-size:14px;line-height:1.6;color:var(--c-text);resize:vertical}
.ak-acts{display:flex;align-items:center;gap:14px;margin-top:10px}
.ak-link{border:none;background:none;padding:0;font:inherit;font-size:13.5px;font-weight:600;color:var(--c-accent);cursor:pointer}
.ak-link:hover{text-decoration:underline}
.ak-q{background:var(--c-surface);border-radius:12px;margin-top:8px}
.ak-q summary{list-style:none;cursor:pointer;padding:12px 14px;font-size:14.5px;font-weight:600;color:var(--c-text);line-height:1.4}
.ak-q summary::-webkit-details-marker{display:none}
.ak-q p{margin:0;padding:0 14px 12px;font-size:13.5px;line-height:1.55;color:var(--c-text2)}
.ak-q p b{display:block;font-size:12.5px;color:var(--c-text3);font-weight:600;margin-bottom:2px}
.ak-err{font-size:13px;color:var(--c-red,#DC2626);margin:8px 0 0}
.ak-note{font-size:13px;color:var(--c-text3);margin:10px 0 0}
@media (max-width:520px){ .ak-row{flex-wrap:wrap} .ak-btn,.ak-lock{margin-left:auto} }
</style>
