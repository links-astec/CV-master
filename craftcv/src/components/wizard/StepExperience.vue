<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">💼</div>
      <h3>Work Experience</h3>
      <p>Add your roles. AI can quantify your achievements with real metrics.</p>
    </div>

    <div v-if="outOfOrder" class="order-note">
      <span>These roles aren’t in date order — recruiters expect the most recent first.</span>
      <button class="btn-secondary btn-sm" @click="sortByDate(store.data.experiences, 'period')">Sort by date</button>
    </div>

    <TransitionGroup name="exp-list">
      <div v-for="(exp, idx) in store.data.experiences" :key="exp.id" class="exp-card" v-bind="ro.card(idx)">
        <div class="exp-card-hd">
          <ReorderControls v-if="store.data.experiences.length > 1" :index="idx" :total="store.data.experiences.length"
            @move="d => ro.move(idx, idx + d)" @arm="ro.arm(idx)" @disarm="ro.disarm()" />
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
          <textarea class="f-ta" v-model="exp.desc" rows="4"
            placeholder="• Led product strategy...&#10;• Grew revenue by 30%...&#10;• Managed a team of 8..."></textarea>
          <div class="f-hint">Tip: start each line with • for bullet points on your CV</div>
        </div>
        <button class="btn-ai-sm" @click="quantifyExp(exp, idx)" :disabled="quantifyIdx === idx">
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          {{ quantifyIdx === idx ? 'Enhancing...' : 'Quantify with AI' }}
        </button>
        <div v-if="quantifyIdx === idx" class="thinking" style="margin-top:8px;">
          <div class="thinking-dots"><span></span><span></span><span></span></div>
          <div class="thinking-txt">Adding metrics & bullet points...</div>
        </div>
        <div v-if="suggestions[idx]" class="ai-suggestion">
          <div class="ai-sug-lbl">✨ Enhanced Version — with bullet points & metrics</div>
          <div class="ai-sug-txt" style="white-space:pre-line;">{{ suggestions[idx] }}</div>
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
import { ref, reactive, inject, computed } from 'vue'
import { useCvStore } from '../../stores/cv.js'
import { useReorder, isOutOfOrder, sortByDate } from '../../composables/reorder.js'
import ReorderControls from '../ReorderControls.vue'

const store = useCvStore()
const ro = useReorder(() => store.data.experiences)
const outOfOrder = computed(() => isOutOfOrder(store.data.experiences, 'period'))
const showToast = inject('showToast', null)
const emit = defineEmits(['next', 'ai-thinking'])
const quantifyIdx = ref(null)
const suggestions = reactive({})

async function quantifyExp(exp, idx) {
  quantifyIdx.value = idx
  emit('ai-thinking', true)
  try {
    const prompt = `You are a professional CV writer. Rewrite the following work experience description as 3-4 concise bullet points using strong action verbs and metrics wherever the description supports them.

Job: ${exp.title} at ${exp.company}
Current description: ${exp.desc || 'No description yet'}

Rules:
- Return ONLY the bullet points, each starting with "• "
- Each bullet on its own line
- Keep every number that is in the description exactly as written
- NEVER invent numbers or achievements. Where a metric would strengthen a bullet but none is given, insert a placeholder in square brackets for the candidate to fill in, e.g. [X%], [N people], [£X]
- Strong action verbs: Led, Built, Grew, Reduced, Launched, Managed, Delivered, Increased, Streamlined
- No preamble, no explanation, just the bullet points
- Language: ${store.data.lang === 'fr' ? 'French' : 'English'}

Example output:
• Led a cross-functional team of [N] engineers to launch the company's first mobile app
• Grew quarterly revenue by [X%] through data-driven pricing changes
• Reduced customer churn by [X%] with a proactive onboarding programme`

    const result = await store.callAi(prompt)
    // Ensure it starts cleanly with bullets
    const cleaned = result.trim().replace(/^[^•\n].*\n/m, '').trim()
    suggestions[idx] = cleaned || result.trim()
  } catch {
    showToast?.('AI is unavailable right now — please try again in a moment.')
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
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:inherit;letter-spacing:-.01em;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.f-hint{font-size:11px;color:var(--c-text3);margin-top:4px;}
.exp-card{background:var(--c-surface2);border:1px solid var(--c-border);border-radius:var(--radius);padding:16px;margin-bottom:12px;}
.exp-card-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
.exp-card-hd .exp-rm{margin-left:auto;}
.exp-card.ro-dragging{opacity:.45;}
.exp-card.ro-over{border-color:var(--c-accent);box-shadow:0 -3px 0 var(--c-accent);}
.order-note{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:var(--c-amber-lt);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12.5px;color:var(--c-text);line-height:1.45;}
.exp-num{font-size:11px;font-weight:700;color:var(--c-accent);letter-spacing:.06em;text-transform:uppercase;}
.exp-rm{background:none;border:none;font-size:11.5px;color:var(--c-rose);cursor:pointer;font-weight:600;font-family:inherit;}
.exp-rm:hover{text-decoration:underline;}
.btn-ai-sm{display:flex;align-items:center;gap:5px;background:var(--c-accent-lt);border:1px solid #c5d6f8;color:var(--c-accent);padding:6px 12px;border-radius:var(--radius-sm);font-size:11.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .14s;margin-top:4px;}
.btn-ai-sm:hover{background:#dae5fc;}
.btn-ai-sm:disabled{opacity:.5;cursor:not-allowed;}
.add-exp-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;border:2px dashed var(--c-border);border-radius:var(--radius);font-size:12.5px;font-weight:600;color:var(--c-text2);cursor:pointer;background:none;font-family:inherit;transition:all .14s;}
.add-exp-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;}
.add-exp-btn:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-lt);}
.ai-suggestion{background:linear-gradient(135deg,#f0f8e8,#e8f4f0);border:1px solid #b8ddc8;border-radius:var(--radius-sm);padding:12px;margin-top:8px;}
.ai-sug-lbl{font-size:9.5px;font-weight:800;color:var(--c-green);letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px;}
.ai-sug-txt{font-size:12px;color:var(--c-text);line-height:1.7;margin-bottom:8px;}
.ai-sug-actions{display:flex;gap:6px;}
.btn-sug-use{background:var(--c-green);color:#fff;border:none;padding:4px 12px;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;}
.btn-sug-dismiss{background:none;border:1px solid var(--c-border);padding:4px 10px;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;color:var(--c-text2);font-family:inherit;}
.exp-list-enter-active,.exp-list-leave-active{transition:all .25s ease;}
.exp-list-enter-from,.exp-list-leave-to{opacity:0;transform:translateY(-10px);}
</style>