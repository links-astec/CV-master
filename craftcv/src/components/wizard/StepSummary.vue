<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">📝</div>
      <h3>{{ $t('Professional Summary') }}</h3>
      <p>{{ $t('A compelling 2–3 sentence summary that grabs attention. AI can write or enhance this for you.') }}</p>
    </div>

    <div class="f-grp">
      <div class="f-lbl">{{ $t('Summary') }}</div>
      <ProofField multiline kind="summary" class="f-ta" v-model="store.data.sum" rows="5"
        :placeholder="$t('Results-driven professional with X years experience in…')" />
      <div class="f-hint">{{ $t('Aim for 40–60 words. Focus on value, not just experience.') }}</div>
    </div>

    <!-- What they're looking for: shown on the CV right under the summary -->
    <div class="f-grp">
      <label class="f-lbl" for="seek-in">{{ $t('What are you looking for?') }}</label>
      <ProofField id="seek-in" kind="seeking" class="f-inp" v-model="store.data.seeking" maxlength="140"
        :placeholder="$t('e.g. A 3-month internship in marketing, from March 2027')" />
      <div class="seek-chips">
        <button v-for="c in SEEK_CHIPS" :key="c" type="button" class="tone-pill" :class="{ active: store.data.seeking === $t(c) }"
          @click="store.data.seeking = $t(c)">{{ $t(c) }}</button>
      </div>
      <div class="f-hint">{{ $t('Shown under your summary, so a recruiter sees straight away what you want. Add the length, field and start date.') }}</div>
    </div>

    <div v-if="aiLoading" class="thinking">
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <div class="thinking-txt">{{ $t('AI is writing your summary…') }}</div>
    </div>

    <div v-if="aiResult" class="ai-suggestion">
      <div class="ai-sug-lbl">✨ {{ $t('AI Suggestion') }}</div>
      <div class="ai-sug-txt">{{ aiResult }}</div>
      <div class="ai-sug-actions">
        <button class="btn-sug-use" @click="useSuggestion">{{ $t('Use this') }}</button>
        <button class="btn-sug-dismiss" @click="aiResult = ''">{{ $t('Dismiss') }}</button>
      </div>
    </div>

    <button class="btn-ai" @click="enhanceSummary" :disabled="aiLoading">
      <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
      {{ $t(aiLoading ? 'Writing…' : 'Generate with AI') }}
    </button>

    <div class="tone-row">
      <div class="f-lbl" style="margin-bottom:8px;">{{ $t('Tone') }}</div>
      <div class="tone-pills">
        <button v-for="t in tones" :key="t.id" class="tone-pill"
          :class="{ active: selectedTone === t.id }"
          @click="selectedTone = t.id">{{ $t(t.label) }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useCvStore } from '../../stores/cv.js'
import ProofField from '../ProofField.vue'

const store = useCvStore()
const showToast = inject('showToast', null)
const emit  = defineEmits(['next', 'ai-thinking'])

const aiLoading = ref(false)
const aiResult = ref('')
const selectedTone = ref('professional')

// Starting points for "What are you looking for?"; the person adds the field and dates
const SEEK_CHIPS = ['A 3-month internship', 'A 6-month internship', 'A work-study contract (alternance)', 'My first full-time job', 'A part-time job']

const tones = [
  { id: 'professional', label: '🎯 Professional' },
  { id: 'confident',    label: '💪 Confident' },
  { id: 'creative',     label: '✨ Creative' },
  { id: 'academic',     label: '📚 Academic' },
]

async function enhanceSummary() {
  aiLoading.value = true
  emit('ai-thinking', true)
  aiResult.value = ''
  try {
    const { result } = await store.aiWrite('summary', { tone: selectedTone.value })
    aiResult.value = result || ''
  } catch (e) {
    showToast?.(e?.message || 'AI is unavailable right now. Please try again in a moment.')
  }
  aiLoading.value = false
  emit('ai-thinking', false)
}

function useSuggestion() {
  store.data.sum = aiResult.value
  aiResult.value = ''
}
</script>

<style scoped>
.step-intro{margin-bottom:20px;}
.step-icon{font-size:28px;margin-bottom:8px;}
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:inherit;letter-spacing:-.01em;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.ai-suggestion{background:linear-gradient(135deg,#f0f8e8,#e8f4f0);border:1px solid #b8ddc8;border-radius:var(--radius);padding:14px;margin-bottom:10px;animation:fup .2s ease;}
.ai-sug-lbl{font-size:13px;font-weight:650;color:var(--c-green);letter-spacing:-.005em;margin-bottom:6px;}
.ai-sug-txt{font-size:12.5px;color:var(--c-text);line-height:1.65;margin-bottom:10px;}
.ai-sug-actions{display:flex;gap:8px;}
.btn-sug-use{background:var(--c-green);color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;}
.btn-sug-dismiss{background:none;border:1px solid var(--hair);padding:6px 12px;border-radius:6px;font-size:11.5px;font-weight:600;cursor:pointer;color:var(--c-text2);font-family:inherit;}
.tone-row{margin-top:4px;}
.seek-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
.tone-pills{display:flex;flex-wrap:wrap;gap:6px;}
.tone-pill{background:var(--c-bg);border:1px solid var(--hair);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;color:var(--c-text2);transition:all .14s;font-family:inherit;}
.tone-pill:hover,.tone-pill.active{background:var(--c-accent-lt);border-color:var(--c-accent);color:var(--c-accent);font-weight:600;}
</style>