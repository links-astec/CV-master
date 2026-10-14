<template>
  <!-- The job offer form, the same wherever it is asked: first screen of a new CV, and when a
       layout is picked on Templates. Emits use(offer) or skip(). -->
  <div class="jof">
    <div class="jof-ic"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg></div>
    <h2 :id="titleId">{{ $t('Applying for a specific job?') }}</h2>
    <p>{{ $t('Paste the job offer first. The AI writes every section with it in mind, and at the end you check your ATS score and tailor the wording.') }}</p>
    <ul class="jof-pts">
      <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ $t('Wording that uses the job’s own keywords') }}</li>
      <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ $t('Your ATS score before you apply') }}</li>
      <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ $t('Nothing changes without your OK') }}</li>
    </ul>
    <label class="f-lbl jof-lbl" :for="fieldId">{{ $t('Job description') }}</label>
    <textarea :id="fieldId" ref="field" v-model="draft" class="f-ta jof-ta" rows="7"
      :placeholder="$t('Paste the full job advert here. Title, responsibilities and requirements…')"></textarea>
    <div class="jof-hint" :class="{ warn: tooShort }">
      {{ tooShort ? $t('Paste the full description. A few sentences at least.') : (draft.trim() ? $t('{n} characters', { n: draft.trim().length }) : $t('Not applying to one job yet? Skip this. You can add an offer later in Job match.')) }}
    </div>
    <div class="jof-acts">
      <button class="btn-secondary" @click="$emit('skip')">{{ $t('Skip, no job offer') }}</button>
      <button class="btn-primary accent" :disabled="!draft.trim() || tooShort" @click="$emit('use', draft.trim())">{{ $t('Continue with this job') }} →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({ initial: { type: String, default: '' }, autofocus: Boolean })
defineEmits(['use', 'skip'])

const MIN_CHARS = 40   // what /api/ai/tailor needs
const uid = Math.random().toString(36).slice(2, 8)
const fieldId = 'jof-' + uid, titleId = 'jof-t-' + uid
const draft = ref(props.initial || '')
watch(() => props.initial, v => { draft.value = v || '' })
const tooShort = computed(() => { const n = draft.value.trim().length; return n > 0 && n < MIN_CHARS })
const field = ref(null)
onMounted(() => { if (props.autofocus) field.value?.focus() })
defineExpose({ titleId })
</script>

<style scoped>
.jof{max-width:600px;width:100%;text-align:left}
.jof h2{font-size:28px;font-weight:700;letter-spacing:-.025em;margin:0}
.jof > p{color:var(--c-text2);margin-top:8px;font-size:15px;line-height:1.55}
.jof-ic{width:48px;height:48px;border-radius:14px;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.jof-ic svg{width:24px;height:24px;fill:none;stroke:var(--c-accent);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.jof-pts{list-style:none;margin:16px 0 20px;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.jof-pts li{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--c-text);background:var(--c-surface);border:1px solid var(--hair);border-radius:99px;padding:6px 12px}
.jof-pts svg{width:14px;height:14px;fill:none;stroke:var(--c-green);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.jof-lbl{display:block}
.jof-ta{width:100%;min-height:150px;resize:vertical}
.jof-hint{font-size:12.5px;color:var(--c-text3);margin-top:6px}
.jof-hint.warn{color:var(--c-amber)}
.jof-acts{display:flex;justify-content:space-between;gap:10px;margin-top:20px}
@media (max-width:768px){
  .jof h2{font-size:23px}
  .jof-acts{flex-direction:column-reverse}
  .jof-acts button{width:100%;justify-content:center}
}
</style>
