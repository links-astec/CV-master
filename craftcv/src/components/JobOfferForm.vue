<template>
  <!-- The job offer form, the same wherever it is asked: first screen of a new CV, and when a
       layout is picked on Templates. Emits use(offer) or skip(). -->
  <div class="jof">
    <BrandLogo mark-only small class="jof-mark" />
    <h2 :id="titleId">{{ $t('Applying for a specific job?') }}</h2>
    <p>{{ $t('Paste the job offer first. The AI writes every section with it in mind, and at the end you check your ATS score and tailor the wording.') }}</p>
    <p class="jof-pts">{{ $t('Wording that uses the job’s own keywords') }} · {{ $t('Your ATS score before you apply') }} · {{ $t('Nothing changes without your OK') }}</p>
    <label class="f-lbl jof-lbl" :for="fieldId">{{ $t('Job description') }}</label>
    <textarea :id="fieldId" ref="field" v-model="draft" class="f-ta jof-ta" rows="7"
      :placeholder="$t('Paste the full job advert here. Title, responsibilities and requirements…')"></textarea>
    <div class="jof-hint" :class="{ warn: tooShort }">
      {{ tooShort ? $t('Paste the full description. A few sentences at least.') : (draft.trim() ? $t('{n} characters', { n: draft.trim().length }) : $t('Not applying to one job yet? Skip this. You can add an offer later in Job match.')) }}
    </div>
    <div class="jof-acts">
      <button class="jof-skip" @click="$emit('skip')">{{ $t('Skip, no job offer') }}</button>
      <button class="btn-primary accent" :disabled="!draft.trim() || tooShort" @click="$emit('use', draft.trim())">{{ $t('Continue with this job') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BrandLogo from './BrandLogo.vue'

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
.jof h2{font-size:32px;font-weight:700;letter-spacing:-.035em;line-height:1.1;margin:0}
.jof > p{color:var(--c-text2);margin-top:10px;font-size:16px;line-height:1.55}
.jof-mark{display:block;margin-bottom:22px}
.jof-mark :deep(svg){height:30px}
.jof > p.jof-pts{font-size:13.5px;color:var(--c-text3);margin:12px 0 26px;line-height:1.6}
.jof-lbl{display:block}
.jof-ta{width:100%;min-height:150px;resize:vertical}
.jof-hint{font-size:12.5px;color:var(--c-text3);margin-top:6px}
.jof-hint.warn{color:var(--c-amber)}
.jof-acts{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:22px}
.jof-skip{border:none;background:none;padding:10px 4px;font:inherit;font-size:15px;font-weight:500;color:var(--c-accent);cursor:pointer}
.jof-skip:hover{text-decoration:underline}
@media (max-width:768px){
  .jof h2{font-size:26px}
  .jof-acts{flex-direction:column-reverse}
  .jof-acts button{width:100%;justify-content:center}
}
</style>
