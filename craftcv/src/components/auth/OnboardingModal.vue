<template>
  <Teleport to="body">
    <div class="ob-backdrop">
      <div class="ob-modal">
        <!-- Progress track -->
        <div class="ob-step-track">
          <div v-for="i in 3" :key="i" class="ob-pip" :class="{ active: step === i-1, done: step > i-1 }"></div>
        </div>

        <Transition name="ob-slide" mode="out-in">
          <!-- Step 0: Industry -->
          <div v-if="step === 0" key="s0" class="ob-body">
            <div class="ob-icon-wrap" style="background:#e8eefb;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2a5bd7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
            </div>
            <h2>What's your industry?</h2>
            <p>We'll tailor the AI writing style to your field.</p>
            <div class="ob-grid">
              <button v-for="ind in industries" :key="ind.id" class="ob-opt" :class="{ sel: form.industry===ind.id }" @click="form.industry=ind.id">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="ind.icon"></svg>
                {{ ind.label }}
              </button>
            </div>
          </div>

          <!-- Step 1: Goal -->
          <div v-else-if="step === 1" key="s1" class="ob-body">
            <div class="ob-icon-wrap" style="background:#e6f5ed;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <h2>What's your goal?</h2>
            <p>We'll prioritise suggestions that matter most to you.</p>
            <div class="ob-grid">
              <button v-for="g in goals" :key="g.id" class="ob-opt" :class="{ sel: form.goal===g.id }" @click="form.goal=g.id">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="g.icon"></svg>
                {{ g.label }}
              </button>
            </div>
          </div>

          <!-- Step 2: Ready -->
          <div v-else key="s2" class="ob-body ob-ready">
            <div class="ob-icon-wrap" style="background:#f0ebfa;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6236b0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2>All set — let's build!</h2>
            <p>PerfectCV is configured for your goals. Ready to create your first CV?</p>
            <div class="ob-summary">
              <div class="ob-sum-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                AI writing tuned for <strong>{{ industries.find(i=>i.id===form.industry)?.label || 'your industry' }}</strong>
              </div>
              <div class="ob-sum-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                Goal set to <strong>{{ goals.find(g=>g.id===form.goal)?.label || 'career growth' }}</strong>
              </div>
              <div class="ob-sum-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                16 professional templates ready
              </div>
              <div class="ob-sum-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                Groq AI assistance enabled
              </div>
            </div>
          </div>
        </Transition>

        <div class="ob-actions">
          <button v-if="step > 0" class="btn-secondary" @click="step--">Back</button>
          <div style="flex:1"></div>
          <button class="btn-primary accent" @click="next" :disabled="loading">
            {{ step < 2 ? 'Continue' : (loading ? 'Setting up...' : 'Start building') }}
            <svg v-if="!loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <svg v-else class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
const auth = useAuthStore()
const emit = defineEmits(['done'])
const step = ref(0)
const loading = ref(false)
const form = ref({ industry: 'tech', goal: 'new-job' })

const industries = [
  { id:'tech',       label:'Technology',  icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
  { id:'finance',    label:'Finance',     icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
  { id:'marketing',  label:'Marketing',   icon:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
  { id:'design',     label:'Design',      icon:'<circle cx="13.5" cy="6.5" r="2.5"/><path d="M14.736 9.347a5 5 0 01-7.09 7.09l-.353-.354a5 5 0 017.09-7.09l.353.354z"/>' },
  { id:'healthcare', label:'Healthcare',  icon:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
  { id:'education',  label:'Education',   icon:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>' },
  { id:'legal',      label:'Legal',       icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { id:'other',      label:'Other',       icon:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' },
]

const goals = [
  { id:'new-job',    label:'Land a new job',   icon:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  { id:'promotion',  label:'Get promoted',     icon:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' },
  { id:'freelance',  label:'Freelance',        icon:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>' },
  { id:'grad',       label:'Graduate role',    icon:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>' },
  { id:'switch',     label:'Career switch',    icon:'<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>' },
  { id:'update',     label:'Update my CV',     icon:'<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>' },
]

async function next() {
  if (step.value < 2) { step.value++; return }
  loading.value = true
  await auth.completeOnboarding(form.value)
  loading.value = false
  emit('done')
}
</script>

<style scoped>
.ob-backdrop { position:fixed;inset:0;z-index:1500;background:rgba(15,14,12,.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px; }
.ob-modal { background:var(--c-surface);border-radius:20px;padding:36px;max-width:500px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,.2); }
.ob-step-track { display:flex;gap:6px;margin-bottom:32px; }
.ob-pip { flex:1;height:4px;border-radius:2px;background:var(--c-border);transition:background .2s; }
.ob-pip.active { background:var(--c-accent); }
.ob-pip.done { background:var(--c-green); }
.ob-body { text-align:center; }
.ob-icon-wrap { width:60px;height:60px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px; }
.ob-icon-wrap svg { width:26px;height:26px; }
h2 { font-family:'DM Serif Display',serif;font-size:26px;color:var(--c-text);margin-bottom:8px; }
p { font-size:13.5px;color:var(--c-text2);margin-bottom:22px;line-height:1.5; }
.ob-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:left; }
.ob-opt {
  background:var(--c-bg);border:2px solid transparent;border-radius:10px;
  padding:11px 8px;cursor:pointer;font-size:11.5px;font-weight:500;color:var(--c-text2);
  font-family:'DM Sans',sans-serif;transition:all .14s;
  text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;
}
.ob-opt svg { width:18px;height:18px;color:var(--c-text3); }
.ob-opt:hover { border-color:var(--c-accent);background:var(--c-accent-lt);color:var(--c-text); }
.ob-opt.sel { border-color:var(--c-accent);background:var(--c-accent-lt);color:var(--c-accent);font-weight:700; }
.ob-opt.sel svg { color:var(--c-accent); }
.ob-ready p { max-width: 340px; margin: 0 auto 22px; }
.ob-summary { background:var(--c-bg);border-radius:12px;padding:16px 18px;margin-top:20px;text-align:left;display:flex;flex-direction:column;gap:10px; }
.ob-sum-item { display:flex;align-items:center;gap:10px;font-size:13px;color:var(--c-text2); }
.ob-sum-item svg { width:14px;height:14px;flex-shrink:0; }
.ob-sum-item strong { color:var(--c-text);font-weight:700; }
.ob-actions { display:flex;align-items:center;gap:10px;margin-top:28px; }
.ob-slide-enter-active,.ob-slide-leave-active { transition:all .22s ease; }
.ob-slide-enter-from { opacity:0;transform:translateX(20px); }
.ob-slide-leave-to { opacity:0;transform:translateX(-20px); }
.spin { animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
@media (max-width:480px) { .ob-grid { grid-template-columns:repeat(2,1fr); } .ob-modal { padding:24px; } }
</style>