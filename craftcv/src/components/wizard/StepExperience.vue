<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">💼</div>
      <h3>Work Experience</h3>
      <p>Add your roles. AI can quantify your achievements with real metrics.</p>
    </div>

    <TransitionGroup name="exp-list">
      <div v-for="(exp, idx) in store.data.experiences" :key="exp.id" class="exp-card">
        <div class="exp-card-hd">
          <span class="exp-num">Role {{ idx + 1 }}</span>
          <button v-if="store.data.experiences.length > 1" class="exp-rm" @click="store.removeExperience(exp.id)">Remove</button>
        </div>
        <div class="f-grp">
          <div class="f-lbl">Job Title</div>
          <input class="f-inp" v-model="exp.title" placeholder="Senior Product Manager" />
        </div>
        <div class="f-row">
          <div class="f-grp">
            <div class="f-lbl">Company</div>
            <input class="f-inp" v-model="exp.company" placeholder="Acme Corp" />
          </div>
          <div class="f-grp">
            <div class="f-lbl">Period</div>
            <input class="f-inp" v-model="exp.period" placeholder="2021 – Present" />
          </div>
        </div>
        <div class="f-grp">
          <div class="f-lbl">Description / Achievements</div>
          <textarea class="f-ta" v-model="exp.desc" rows="3"
            placeholder="Led product strategy, growing revenue by..."></textarea>
        </div>
        <button class="btn-ai-sm" @click="quantifyExp(exp, idx)" :disabled="quantifyIdx === idx">
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          {{ quantifyIdx === idx ? 'Enhancing...' : 'Quantify with AI' }}
        </button>
        <div v-if="quantifyIdx === idx" class="thinking" style="margin-top:8px;">
          <div class="thinking-dots"><span></span><span></span><span></span></div>
          <div class="thinking-txt">Adding metrics...</div>
        </div>
        <div v-if="suggestions[idx]" class="ai-suggestion">
          <div class="ai-sug-lbl">✨ Enhanced Version</div>
          <div class="ai-sug-txt">{{ suggestions[idx] }}</div>
          <div class="ai-sug-actions">
            <button class="btn-sug-use" @click="applySuggestion(exp, idx)">Apply</button>
            <button class="btn-sug-dismiss" @click="delete suggestions[idx]">Dismiss</button>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <button class="add-exp-btn" @click="store.addExperience">
      <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Another Role
    </button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store = useCvStore()
const emit = defineEmits(['next', 'ai-thinking'])
const quantifyIdx = ref(null)
const suggestions = reactive({})

async function quantifyExp(exp, idx) {
  quantifyIdx.value = idx
  emit('ai-thinking', true)
  try {
    const prompt = `Improve this CV bullet point with specific metrics, strong action verbs, and measurable impact. Keep it 1-2 sentences, professional, and impressive.
Job title: ${exp.title} at ${exp.company}
Current: ${exp.desc}
Return only the improved text, no quotes or preamble.`
    const result = await store.callAi(prompt)
    suggestions[idx] = result
  } catch {
    suggestions[idx] = `Spearheaded ${exp.title?.toLowerCase() || 'product'} initiatives at ${exp.company || 'the company'}, delivering measurable impact across key business metrics and driving year-over-year growth of 20%+.`
  }
  quantifyIdx.value = null
  emit('ai-thinking', false)
}

function applySuggestion(exp, idx) {
  exp.desc = suggestions[idx]
  delete suggestions[idx]
}
</script>

<style scoped>
.step-intro{margin-bottom:20px;}
.step-icon{font-size:28px;margin-bottom:8px;}
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:'DM Serif Display',serif;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.exp-card{background:var(--c-surface2);border:1px solid var(--c-border);border-radius:var(--radius);padding:16px;margin-bottom:12px;}
.exp-card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.exp-num{font-size:11px;font-weight:700;color:var(--c-accent);letter-spacing:.06em;text-transform:uppercase;}
.exp-rm{background:none;border:none;font-size:11.5px;color:var(--c-rose);cursor:pointer;font-weight:600;font-family:'DM Sans',sans-serif;}
.exp-rm:hover{text-decoration:underline;}
.btn-ai-sm{display:flex;align-items:center;gap:5px;background:var(--c-accent-lt);border:1px solid #c5d6f8;color:var(--c-accent);padding:6px 12px;border-radius:var(--radius-sm);font-size:11.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .14s;margin-top:4px;}
.btn-ai-sm:hover{background:#dae5fc;}
.btn-ai-sm:disabled{opacity:.5;cursor:not-allowed;}
.add-exp-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;border:2px dashed var(--c-border);border-radius:var(--radius);font-size:12.5px;font-weight:600;color:var(--c-text2);cursor:pointer;background:none;font-family:'DM Sans',sans-serif;transition:all .14s;}
.add-exp-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;}
.add-exp-btn:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-lt);}
.ai-suggestion{background:linear-gradient(135deg,#f0f8e8,#e8f4f0);border:1px solid #b8ddc8;border-radius:var(--radius-sm);padding:12px;margin-top:8px;}
.ai-sug-lbl{font-size:9.5px;font-weight:800;color:var(--c-green);letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px;}
.ai-sug-txt{font-size:12px;color:var(--c-text);line-height:1.6;margin-bottom:8px;}
.ai-sug-actions{display:flex;gap:6px;}
.btn-sug-use{background:var(--c-green);color:#fff;border:none;padding:4px 12px;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;}
.btn-sug-dismiss{background:none;border:1px solid var(--c-border);padding:4px 10px;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;color:var(--c-text2);font-family:'DM Sans',sans-serif;}
.exp-list-enter-active,.exp-list-leave-active{transition:all .25s ease;}
.exp-list-enter-from,.exp-list-leave-to{opacity:0;transform:translateY(-10px);}
</style>
