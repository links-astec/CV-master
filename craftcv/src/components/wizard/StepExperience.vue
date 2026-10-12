<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">💼</div>
      <h3>{{ $t('Work Experience') }}</h3>
      <p>{{ $t('Add your roles. AI can quantify your achievements with real metrics.') }}</p>
    </div>

    <div v-if="outOfOrder" class="order-note">
      <span>{{ $t('These roles aren’t in date order. Recruiters expect the most recent first.') }}</span>
      <button class="btn-secondary btn-sm" @click="sortByDate(store.data.experiences, 'period')">{{ $t('Sort by date') }}</button>
    </div>

    <TransitionGroup name="exp-list">
      <div v-for="(exp, idx) in store.data.experiences" :key="exp.id" class="exp-card" v-bind="ro.card(idx)">
        <div class="exp-card-hd">
          <ReorderControls v-if="store.data.experiences.length > 1" :index="idx" :total="store.data.experiences.length"
            @move="d => ro.move(idx, idx + d)" @arm="ro.arm(idx)" @disarm="ro.disarm()" />
          <span class="exp-num">{{ $t('Role {n}', { n: idx + 1 }) }}</span>
          <button v-if="store.data.experiences.length > 1" class="exp-rm" @click="store.removeExperience(exp.id)">{{ $t('Remove') }}</button>
        </div>
        <div class="f-grp">
          <div class="f-lbl">{{ $t('Job Title') }}</div>
          <input class="f-inp" v-model="exp.title" :placeholder="$t('Senior Product Manager')" />
        </div>
        <div class="f-row">
          <div class="f-grp">
            <div class="f-lbl">{{ $t('Company') }}</div>
            <input class="f-inp" v-model="exp.company" placeholder="Acme Corp" />
          </div>
          <div class="f-grp">
            <div class="f-lbl">{{ $t('Period') }}</div>
            <input class="f-inp" v-model="exp.period" :placeholder="$t('2021 – Present')" />
          </div>
        </div>
        <div class="f-grp">
          <div class="f-lbl">{{ $t('Description / Achievements') }}</div>
          <textarea class="f-ta" v-model="exp.desc" rows="4"
            :placeholder="$t('• Led product strategy…\n• Grew revenue by 30%…\n• Managed a team of 8…')"></textarea>
          <div class="f-hint">{{ $t('Tip: start each line with • for bullet points on your CV') }}</div>
        </div>
        <button class="btn-ai-sm" @click="quantifyExp(exp, idx)" :disabled="quantifyIdx === idx">
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          {{ $t(quantifyIdx === idx ? 'Enhancing…' : 'Quantify with AI') }}
        </button>
        <div v-if="quantifyIdx === idx" class="thinking" style="margin-top:8px;">
          <div class="thinking-dots"><span></span><span></span><span></span></div>
          <div class="thinking-txt">{{ $t('Adding metrics & bullet points…') }}</div>
        </div>
        <div v-if="suggestions[idx]" class="ai-suggestion">
          <div class="ai-sug-lbl">✨ {{ $t('Enhanced version. With bullet points & metrics') }}</div>
          <div class="ai-sug-txt" style="white-space:pre-line;">{{ suggestions[idx] }}</div>
          <div class="ai-sug-actions">
            <button class="btn-sug-use" @click="applySuggestion(exp, idx)">{{ $t('Apply') }}</button>
            <button class="btn-sug-dismiss" @click="delete suggestions[idx]">{{ $t('Dismiss') }}</button>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <button class="add-exp-btn" @click="store.addExperience">
      <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {{ $t('Add Another Role') }}
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
    // Placeholders like [X%] are added instead of invented numbers; the job offer guides the wording
    const { result } = await store.aiWrite('bullets', { index: idx })
    suggestions[idx] = (result || '').trim()
  } catch (e) {
    showToast?.(e?.message || 'AI is unavailable right now. Please try again in a moment.')
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
.exp-card{background:var(--c-surface2);border:1px solid var(--hair);border-radius:var(--radius);padding:16px;margin-bottom:12px;}
.exp-card-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
.exp-card-hd .exp-rm{margin-left:auto;}
.exp-card.ro-dragging{opacity:.45;}
.exp-card.ro-over{border-color:var(--c-accent);box-shadow:0 -3px 0 var(--c-accent);}
.order-note{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:var(--c-amber-lt);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12.5px;color:var(--c-text);line-height:1.45;}
.exp-num{font-size:13px;font-weight:650;color:var(--c-accent);letter-spacing:-.005em;}
.exp-rm{background:none;border:none;font-size:11.5px;color:var(--c-rose);cursor:pointer;font-weight:600;font-family:inherit;}
.exp-rm:hover{text-decoration:underline;}
.btn-ai-sm{display:flex;align-items:center;gap:5px;background:var(--c-accent-lt);border:1px solid #c5d6f8;color:var(--c-accent);padding:6px 12px;border-radius:var(--radius-sm);font-size:11.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .14s;margin-top:4px;}
.btn-ai-sm:hover{background:#dae5fc;}
.btn-ai-sm:disabled{opacity:.5;cursor:not-allowed;}
.add-exp-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;border:2px dashed var(--c-border);border-radius:var(--radius);font-size:12.5px;font-weight:600;color:var(--c-text2);cursor:pointer;background:none;font-family:inherit;transition:all .14s;}
.add-exp-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;}
.add-exp-btn:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-lt);}
.ai-suggestion{background:linear-gradient(135deg,#f0f8e8,#e8f4f0);border:1px solid #b8ddc8;border-radius:var(--radius-sm);padding:12px;margin-top:8px;}
.ai-sug-lbl{font-size:13px;font-weight:650;color:var(--c-green);letter-spacing:-.005em;margin-bottom:5px;}
.ai-sug-txt{font-size:12px;color:var(--c-text);line-height:1.7;margin-bottom:8px;}
.ai-sug-actions{display:flex;gap:6px;}
.btn-sug-use{background:var(--c-green);color:#fff;border:none;padding:4px 12px;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;}
.btn-sug-dismiss{background:none;border:1px solid var(--hair);padding:4px 10px;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;color:var(--c-text2);font-family:inherit;}
.exp-list-enter-active,.exp-list-leave-active{transition:all .25s ease;}
.exp-list-enter-from,.exp-list-leave-to{opacity:0;transform:translateY(-10px);}
</style>