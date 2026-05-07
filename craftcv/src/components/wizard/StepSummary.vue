<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">📝</div>
      <h3>Professional Summary</h3>
      <p>A compelling 2–3 sentence summary that grabs attention. AI can write or enhance this for you.</p>
    </div>

    <div class="f-grp">
      <div class="f-lbl">Summary</div>
      <textarea class="f-ta" v-model="store.data.sum" rows="5"
        placeholder="Results-driven professional with X years experience in..."></textarea>
      <div class="f-hint">Aim for 40–60 words. Focus on value, not just experience.</div>
    </div>

    <div v-if="aiLoading" class="thinking">
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <div class="thinking-txt">AI is writing your summary...</div>
    </div>

    <div v-if="aiResult" class="ai-suggestion">
      <div class="ai-sug-lbl">✨ AI Suggestion</div>
      <div class="ai-sug-txt">{{ aiResult }}</div>
      <div class="ai-sug-actions">
        <button class="btn-sug-use" @click="useSuggestion">Use this</button>
        <button class="btn-sug-dismiss" @click="aiResult = ''">Dismiss</button>
      </div>
    </div>

    <button class="btn-ai" @click="enhanceSummary" :disabled="aiLoading">
      <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
      {{ aiLoading ? 'Writing...' : 'Generate with AI' }}
    </button>

    <div class="tone-row">
      <div class="f-lbl" style="margin-bottom:8px;">Tone</div>
      <div class="tone-pills">
        <button v-for="t in tones" :key="t.id" class="tone-pill"
          :class="{ active: selectedTone === t.id }"
          @click="selectedTone = t.id">{{ t.label }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store = useCvStore()
const emit = defineEmits(['next', 'ai-thinking'])

const aiLoading = ref(false)
const aiResult = ref('')
const selectedTone = ref('professional')

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
    const prompt = `Write a compelling ${selectedTone.value} professional summary (2-3 sentences, ATS-optimized, under 60 words) for:
Name: ${store.data.fn} ${store.data.ln}
Title: ${store.data.title}
Current summary: ${store.data.sum || 'none'}
Focus on measurable impact and value. Return only the summary text, no quotes.`
    const text = await store.callAi(prompt)
    aiResult.value = text || ''
  } catch {
    // Fallback demo
    aiResult.value = `Accomplished ${store.data.title || 'professional'} with a proven track record of delivering measurable business impact. Expert in translating complex challenges into strategic solutions, driving growth, and leading high-performance teams. Passionate about creating value through data-driven decisions and cross-functional collaboration.`
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
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:'DM Serif Display',serif;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.ai-suggestion{background:linear-gradient(135deg,#f0f8e8,#e8f4f0);border:1px solid #b8ddc8;border-radius:var(--radius);padding:14px;margin-bottom:10px;animation:fup .2s ease;}
.ai-sug-lbl{font-size:10px;font-weight:800;color:var(--c-green);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;}
.ai-sug-txt{font-size:12.5px;color:var(--c-text);line-height:1.65;margin-bottom:10px;}
.ai-sug-actions{display:flex;gap:8px;}
.btn-sug-use{background:var(--c-green);color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;}
.btn-sug-dismiss{background:none;border:1px solid var(--c-border);padding:6px 12px;border-radius:6px;font-size:11.5px;font-weight:600;cursor:pointer;color:var(--c-text2);font-family:'DM Sans',sans-serif;}
.tone-row{margin-top:4px;}
.tone-pills{display:flex;flex-wrap:wrap;gap:6px;}
.tone-pill{background:var(--c-bg);border:1px solid var(--c-border);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;color:var(--c-text2);transition:all .14s;font-family:'DM Sans',sans-serif;}
.tone-pill:hover,.tone-pill.active{background:var(--c-accent-lt);border-color:var(--c-accent);color:var(--c-accent);font-weight:600;}
</style>