<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">⚡</div>
      <h3>Skills</h3>
      <p>Add your core skills. AI can suggest relevant ones based on your role.</p>
    </div>

    <div class="skill-input-row">
      <input
        class="f-inp" v-model="newSkill"
        placeholder="Type a skill and press Enter"
        @keydown.enter="addSkill"
        style="flex:1;"
      />
      <button class="btn-add-skill" @click="addSkill">Add</button>
    </div>

    <div class="skill-wrap" style="margin-top:12px;min-height:48px;">
      <TransitionGroup name="skill-tag">
        <span v-for="s in store.data.skills" :key="s" class="skill-tag">
          {{ s }}
          <button class="skill-rm" @click="store.removeSkill(s)">×</button>
        </span>
      </TransitionGroup>
      <div v-if="!store.data.skills.length" class="empty-skills">No skills added yet</div>
    </div>

    <div v-if="aiLoading" class="thinking" style="margin-top:14px;">
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <div class="thinking-txt">Finding relevant skills for your role...</div>
    </div>

    <div v-if="suggested.length" class="suggested-block">
      <div class="sug-label">💡 AI Suggestions — click to add</div>
      <div class="sug-chips">
        <button
          v-for="s in suggested" :key="s"
          class="sug-chip"
          :class="{ added: store.data.skills.includes(s) }"
          @click="addSuggested(s)"
        >{{ s }}</button>
      </div>
      <button class="btn-add-all" @click="addAll">Add all</button>
    </div>

    <button class="btn-ai" @click="suggestSkills" :disabled="aiLoading" style="margin-top:14px;">
      <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
      {{ aiLoading ? 'Suggesting...' : 'Suggest Skills with Groq AI' }}
    </button>

    <div class="skill-count">
      <span :class="{ warn: store.data.skills.length < 5, ok: store.data.skills.length >= 5 }">
        {{ store.data.skills.length }} skill{{ store.data.skills.length !== 1 ? 's' : '' }}
      </span>
      · 5–10 recommended
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store = useCvStore()
const emit = defineEmits(['next', 'ai-thinking'])
const newSkill = ref('')
const aiLoading = ref(false)
const suggested = ref([])

function addSkill() {
  const v = newSkill.value.trim()
  if (v) { store.addSkill(v); newSkill.value = '' }
}

function addSuggested(s) {
  if (!store.data.skills.includes(s)) store.addSkill(s)
}

function addAll() {
  suggested.value.forEach(s => addSuggested(s))
}

async function suggestSkills() {
  aiLoading.value = true
  emit('ai-thinking', true)
  try {
    const prompt = `List 10 highly relevant skills for a ${store.data.title || 'professional'} role at a modern company. Return ONLY a JSON array of strings, no markdown, no explanation.`
    const result = await store.callAi(prompt)
    const parsed = JSON.parse(result.replace(/```json|```/g, '').trim())
    suggested.value = Array.isArray(parsed) ? parsed : parsed.skills || []
  } catch {
    suggested.value = ['Strategic Planning','Data Analysis','Stakeholder Management','Project Management','Team Leadership','Problem Solving','Communication','Microsoft Office','Budget Management','Process Improvement']
  }
  aiLoading.value = false
  emit('ai-thinking', false)
}
</script>

<style scoped>
.step-intro{margin-bottom:20px;}
.step-icon{font-size:28px;margin-bottom:8px;}
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:'DM Serif Display',serif;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.skill-input-row{display:flex;gap:8px;}
.btn-add-skill{background:var(--c-accent);color:#fff;border:none;padding:9px 16px;border-radius:var(--radius-sm);font-size:12.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;}
.empty-skills{font-size:12.5px;color:var(--c-text3);padding:8px 0;}
.suggested-block{background:var(--c-surface2);border:1px solid var(--c-border);border-radius:var(--radius);padding:14px;margin-top:14px;}
.sug-label{font-size:10.5px;font-weight:700;color:var(--c-amber);margin-bottom:10px;}
.sug-chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;}
.sug-chip{background:var(--c-amber-lt);border:1px solid #f0c080;color:var(--c-amber);font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .14s;}
.sug-chip:hover{background:var(--c-amber);color:#fff;border-color:var(--c-amber);}
.sug-chip.added{background:var(--c-green-lt);border-color:var(--c-green);color:var(--c-green);}
.btn-add-all{background:none;border:none;font-size:11.5px;font-weight:700;color:var(--c-accent);cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;}
.skill-count{font-size:12px;color:var(--c-text3);margin-top:10px;}
.skill-count .warn{color:var(--c-amber);font-weight:700;}
.skill-count .ok{color:var(--c-green);font-weight:700;}
.skill-tag-enter-active,.skill-tag-leave-active{transition:all .2s ease;}
.skill-tag-enter-from,.skill-tag-leave-to{opacity:0;transform:scale(.8);}
</style>