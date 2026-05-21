<template>
  <Teleport to="body">
    <div class="ob-root">
      <div class="ob-card">

        <!-- Progress bar -->
        <div class="ob-progress">
          <div class="ob-progress-fill" :style="{ width: ((step+1)/TOTAL_STEPS*100)+'%' }"></div>
        </div>

        <!-- Close / skip -->
        <button class="ob-skip" @click="skip">Skip setup</button>

        <Transition :name="slideDir" mode="out-in">

          <!-- STEP 0: Welcome -->
          <div v-if="step === 0" key="s0" class="ob-step">
            <div class="ob-hero ob-hero--welcome">
              <div class="ob-hero-rings">
                <div class="ob-ring r1"></div>
                <div class="ob-ring r2"></div>
                <div class="ob-ring r3"></div>
              </div>
              <div class="ob-hero-icon">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px"><rect x="5" y="2" width="16" height="22" rx="2" fill="white" opacity="0.95"/><path d="M21 2 L27 8 L21 8 Z" fill="#1d49b8"/><path d="M21 2 L21 8 L27 8" fill="none" stroke="white" stroke-width="1.2" opacity="0.4"/><line x1="8" y1="13" x2="18" y2="13" stroke="#2a5bd7" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="17" x2="19" y2="17" stroke="#c0cef8" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="21" x2="16" y2="21" stroke="#c0cef8" stroke-width="1.5" stroke-linecap="round"/><rect x="6" y="25" width="14" height="6" rx="2" fill="#1a1a2e"/><text x="13" y="30" font-family="system-ui,sans-serif" font-weight="800" font-size="4.5" fill="#7aa3f5" text-anchor="middle" letter-spacing="1">CV</text></svg>
              </div>
            </div>
            <div class="ob-text">
              <h2>Welcome to CVMaster! 🎉</h2>
              <p>Let's take 60 seconds to personalise your experience. We'll tailor AI suggestions and templates to your specific goals.</p>
              <div class="ob-welcome-feats">
                <div class="ob-wf" v-for="f in welcomeFeats" :key="f.label">
                  <div class="ob-wf-ic" :style="{background:f.bg,color:f.color}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px" v-html="f.icon"></svg>
                  </div>
                  <div>
                    <div class="ob-wf-label">{{ f.label }}</div>
                    <div class="ob-wf-sub">{{ f.sub }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 1: Industry -->
          <div v-else-if="step === 1" key="s1" class="ob-step">
            <div class="ob-step-head">
              <div class="ob-step-ic" style="background:var(--c-accent-lt)">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
              </div>
              <div>
                <h2>What's your industry?</h2>
                <p>We'll tune the AI writing style to match your field.</p>
              </div>
            </div>
            <div class="ob-grid ob-grid--ind">
              <button
                v-for="ind in industries" :key="ind.id"
                class="ob-tile"
                :class="{ sel: form.industry === ind.id }"
                :style="form.industry===ind.id ? { borderColor: ind.color, background: ind.bg+'33' } : {}"
                @click="form.industry = ind.id"
              >
                <div class="ob-tile-ic" :style="{ background: ind.bg, color: ind.color }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px" v-html="ind.icon"></svg>
                </div>
                <span>{{ ind.label }}</span>
                <div class="ob-tile-check" v-if="form.industry === ind.id">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </button>
            </div>
          </div>

          <!-- STEP 2: Goal -->
          <div v-else-if="step === 2" key="s2" class="ob-step">
            <div class="ob-step-head">
              <div class="ob-step-ic" style="background:var(--c-green-lt)">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <div>
                <h2>What's your goal?</h2>
                <p>We'll prioritise the suggestions that matter most to you.</p>
              </div>
            </div>
            <div class="ob-grid ob-grid--goal">
              <button
                v-for="g in goals" :key="g.id"
                class="ob-goal-card"
                :class="{ sel: form.goal === g.id }"
                @click="form.goal = g.id"
              >
                <div class="ob-goal-ic" :style="{ background: g.bg, color: g.color }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px" v-html="g.icon"></svg>
                </div>
                <div class="ob-goal-text">
                  <div class="ob-goal-label">{{ g.label }}</div>
                  <div class="ob-goal-sub">{{ g.sub }}</div>
                </div>
                <div class="ob-goal-check" v-if="form.goal === g.id">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </button>
            </div>
          </div>

          <!-- STEP 3: Experience -->
          <div v-else-if="step === 3" key="s3" class="ob-step">
            <div class="ob-step-head">
              <div class="ob-step-ic" style="background:var(--c-violet-lt)">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-violet)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <div>
                <h2>Your experience level?</h2>
                <p>We'll recommend templates and language that fit your career stage.</p>
              </div>
            </div>
            <div class="ob-exp-cards">
              <button
                v-for="e in expLevels" :key="e.id"
                class="ob-exp-card"
                :class="{ sel: form.experience === e.id }"
                @click="form.experience = e.id"
              >
                <div class="ob-exp-num" :style="{ color: e.color }">{{ e.years }}</div>
                <div class="ob-exp-label">{{ e.label }}</div>
                <div class="ob-exp-sub">{{ e.sub }}</div>
                <div class="ob-exp-bar"><div class="ob-exp-fill" :style="{ width: e.pct+'%', background: e.color }"></div></div>
              </button>
            </div>
          </div>

          <!-- STEP 4: All set -->
          <div v-else key="s4" class="ob-step ob-step--done">
            <div class="ob-done-anim">
              <div class="ob-done-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="ob-done-sparks">
                <div class="ob-spark" v-for="n in 8" :key="n" :style="`--n:${n}`"></div>
              </div>
            </div>
            <h2>You're all set!</h2>
            <p>CVMaster is configured for your goals. Here's what we've set up for you:</p>
            <div class="ob-summary">
              <div class="ob-sum-row">
                <div class="ob-sum-ic" style="background:var(--c-accent-lt);color:var(--c-accent)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </div>
                <span>AI writing tuned for <strong>{{ industries.find(i=>i.id===form.industry)?.label || 'your industry' }}</strong></span>
              </div>
              <div class="ob-sum-row">
                <div class="ob-sum-ic" style="background:var(--c-green-lt);color:var(--c-green)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <span>Goal: <strong>{{ goals.find(g=>g.id===form.goal)?.label || 'career growth' }}</strong></span>
              </div>
              <div class="ob-sum-row">
                <div class="ob-sum-ic" style="background:var(--c-violet-lt);color:var(--c-violet)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <span>Level: <strong>{{ expLevels.find(e=>e.id===form.experience)?.label || 'Professional' }}</strong></span>
              </div>
              <div class="ob-sum-row">
                <div class="ob-sum-ic" style="background:var(--c-amber-lt);color:var(--c-amber)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span><strong>107+ templates</strong> ready to use</span>
              </div>
            </div>
          </div>

        </Transition>

        <!-- Footer actions -->
        <div class="ob-footer">
          <div class="ob-dots">
            <div v-for="i in TOTAL_STEPS" :key="i" class="ob-dot" :class="{ active: step===i-1, done: step>i-1 }"></div>
          </div>
          <div class="ob-actions">
            <button v-if="step > 0" class="ob-btn-back" @click="prev">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <button class="ob-btn-next" @click="next" :disabled="loading">
              <svg v-if="loading" class="ob-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
              {{ step === TOTAL_STEPS-1 ? (loading ? 'Setting up…' : 'Start building') : 'Continue' }}
              <svg v-if="!loading && step < TOTAL_STEPS-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <svg v-else-if="!loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
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

const TOTAL_STEPS = 5
const step      = ref(0)
const slideDir  = ref('ob-fwd')
const loading   = ref(false)
const form      = ref({ industry: '', goal: '', experience: '' })

function next() {
  if (step.value < TOTAL_STEPS - 1) {
    slideDir.value = 'ob-fwd'
    step.value++
    return
  }
  finish()
}
function prev() {
  slideDir.value = 'ob-bwd'
  step.value--
}
async function skip() {
  loading.value = true
  await auth.completeOnboarding({ industry: 'other', goal: 'update', experience: 'mid' }).catch(() => {})
  loading.value = false
  emit('done')
}
async function finish() {
  loading.value = true
  await auth.completeOnboarding(form.value).catch(() => {})
  loading.value = false
  emit('done')
}

const welcomeFeats = [
  { label:'107 professional templates', sub:'For every industry and career stage', bg:'var(--c-accent-lt)', color:'var(--c-accent)', icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
  { label:'AI writing & narrate mode', sub:'Speak your story, AI builds your CV', bg:'var(--c-teal-lt)', color:'var(--c-teal)', icon:'<path d="M12 2a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/>' },
  { label:'ATS-optimised output', sub:'Pass every applicant tracking system', bg:'var(--c-green-lt)', color:'var(--c-green)', icon:'<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>' },
]

const industries = [
  { id:'tech',       label:'Technology',   bg:'var(--c-accent-lt)',  color:'var(--c-accent)',  icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
  { id:'finance',    label:'Finance',      bg:'var(--c-green-lt)',   color:'var(--c-green)',   icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
  { id:'marketing',  label:'Marketing',    bg:'var(--c-rose-lt)',    color:'var(--c-rose)',    icon:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
  { id:'design',     label:'Design',       bg:'var(--c-violet-lt)',  color:'var(--c-violet)',  icon:'<circle cx="13.5" cy="6.5" r="2.5"/><path d="M14.736 9.347a5 5 0 01-7.09 7.09l-.353-.354a5 5 0 017.09-7.09z"/>' },
  { id:'healthcare', label:'Healthcare',   bg:'var(--c-teal-lt)',    color:'var(--c-teal)',    icon:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
  { id:'education',  label:'Education',    bg:'var(--c-amber-lt)',   color:'var(--c-amber)',   icon:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>' },
  { id:'legal',      label:'Legal',        bg:'var(--c-accent-lt)',  color:'var(--c-accent)',  icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { id:'engineering',label:'Engineering',  bg:'var(--c-green-lt)',   color:'var(--c-green)',   icon:'<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M2 12h2M20 12h2"/>' },
  { id:'sales',      label:'Sales',        bg:'var(--c-amber-lt)',   color:'var(--c-amber)',   icon:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' },
  { id:'hr',         label:'HR',           bg:'var(--c-rose-lt)',    color:'var(--c-rose)',    icon:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>' },
  { id:'creative',   label:'Creative',     bg:'var(--c-violet-lt)',  color:'var(--c-violet)',  icon:'<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>' },
  { id:'other',      label:'Other',        bg:'var(--c-surface)',    color:'var(--c-text2)',   icon:'<circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 015.12 2.12c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
]

const goals = [
  { id:'new-job',   label:'Land a new job',      sub:'Find and secure a role at a new company', bg:'var(--c-accent-lt)',  color:'var(--c-accent)',  icon:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  { id:'promotion', label:'Get promoted',         sub:'Make the case for a step up internally',  bg:'var(--c-green-lt)',   color:'var(--c-green)',   icon:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' },
  { id:'switch',    label:'Career change',        sub:'Move into a new industry or function',    bg:'var(--c-violet-lt)',  color:'var(--c-violet)',  icon:'<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>' },
  { id:'freelance', label:'Freelance / contract', sub:'Win clients and project-based work',      bg:'var(--c-amber-lt)',   color:'var(--c-amber)',   icon:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>' },
  { id:'grad',      label:'Graduate role',        sub:'Enter the workforce for the first time',  bg:'var(--c-teal-lt)',    color:'var(--c-teal)',    icon:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>' },
  { id:'update',    label:'Update my CV',         sub:'Refresh and modernise an existing CV',    bg:'var(--c-rose-lt)',    color:'var(--c-rose)',    icon:'<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>' },
]

const expLevels = [
  { id:'student',  label:'Student / Graduate', sub:'0–1 years · entering the workforce',   years:'0–1y', pct:15, color:'var(--c-teal)' },
  { id:'junior',   label:'Junior',             sub:'1–3 years · building experience',       years:'1–3y', pct:35, color:'var(--c-accent)' },
  { id:'mid',      label:'Mid-level',          sub:'3–7 years · solid track record',        years:'3–7y', pct:60, color:'var(--c-violet)' },
  { id:'senior',   label:'Senior',             sub:'7–12 years · leading teams & projects', years:'7–12y',pct:80, color:'var(--c-amber)' },
  { id:'exec',     label:'Executive / Director',sub:'12+ years · C-suite, VP, Director',   years:'12+y', pct:100, color:'var(--c-rose)' },
]
</script>

<style scoped>
.ob-root {
  position: fixed; inset: 0; z-index: 1500;
  background: rgba(15,14,12,.8); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.ob-card {
  background: var(--c-surface); border-radius: 20px;
  width: 100%; max-width: 560px; max-height: 92dvh;
  box-shadow: 0 32px 80px rgba(0,0,0,.25);
  overflow: hidden; display: flex; flex-direction: column;
  position: relative;
}

/* Progress bar */
.ob-progress {
  height: 3px; background: var(--c-border); flex-shrink: 0;
  position: relative;
}
.ob-progress-fill {
  position: absolute; top: 0; left: 0; height: 100%;
  background: linear-gradient(90deg, var(--c-accent), var(--c-violet));
  border-radius: 0 2px 2px 0;
  transition: width .4s cubic-bezier(.4,0,.2,1);
}

/* Skip */
.ob-skip {
  position: absolute; top: 14px; right: 14px;
  background: none; border: none; font-size: 12px;
  color: var(--c-text3); cursor: pointer; font-family: 'DM Sans', sans-serif;
  padding: 4px 8px; border-radius: 6px; transition: all .15s;
}
.ob-skip:hover { background: var(--c-bg); color: var(--c-text2); }

/* Steps wrapper */
.ob-step {
  flex: 1; overflow-y: auto; padding: 32px 32px 0;
}

/* Welcome hero */
.ob-hero {
  position: relative; height: 140px; border-radius: 14px;
  margin-bottom: 24px; display: flex; align-items: center;
  justify-content: center; overflow: hidden;
  background: linear-gradient(135deg, var(--c-accent), var(--c-violet));
}
.ob-hero-rings { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.ob-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,.15); }
.r1 { width: 80px;  height: 80px;  animation: ob-pulse 3s ease-in-out infinite; }
.r2 { width: 130px; height: 130px; animation: ob-pulse 3s ease-in-out infinite .5s; }
.r3 { width: 180px; height: 180px; animation: ob-pulse 3s ease-in-out infinite 1s; }
@keyframes ob-pulse { 0%,100%{opacity:.4}50%{opacity:.8} }
.ob-hero-icon {
  position: relative; z-index: 1; width: 64px; height: 64px;
  background: rgba(255,255,255,.15); border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,.25);
}

.ob-text h2 { font-family: 'DM Serif Display', serif; font-size: 24px; color: var(--c-text); margin-bottom: 8px; }
.ob-text p  { font-size: 13.5px; color: var(--c-text2); line-height: 1.6; margin-bottom: 20px; }

.ob-welcome-feats { display: flex; flex-direction: column; gap: 10px; }
.ob-wf { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--c-bg); border-radius: 10px; border: 1px solid var(--c-border); }
.ob-wf-ic { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ob-wf-label { font-size: 13px; font-weight: 600; color: var(--c-text); margin-bottom: 2px; }
.ob-wf-sub { font-size: 11.5px; color: var(--c-text3); }

/* Step header */
.ob-step-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
.ob-step-ic { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ob-step-head h2 { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--c-text); margin-bottom: 4px; }
.ob-step-head p  { font-size: 13px; color: var(--c-text2); line-height: 1.5; }

/* Industry grid */
.ob-grid--ind { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.ob-tile {
  background: var(--c-bg); border: 1.5px solid var(--c-border);
  border-radius: 10px; padding: 12px 8px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  font-size: 11.5px; font-weight: 500; color: var(--c-text2);
  font-family: 'DM Sans', sans-serif; transition: all .15s;
  position: relative; text-align: center;
}
.ob-tile:hover { border-color: var(--c-border2); color: var(--c-text); transform: translateY(-1px); }
.ob-tile.sel { color: var(--c-text); font-weight: 700; }
.ob-tile-ic { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ob-tile-check { position: absolute; top: 5px; right: 5px; width: 16px; height: 16px; background: var(--c-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.ob-tile-check svg { width: 9px; height: 9px; color: #fff; }

/* Goal grid */
.ob-grid--goal { display: flex; flex-direction: column; gap: 8px; }
.ob-goal-card {
  display: flex; align-items: center; gap: 12px;
  background: var(--c-bg); border: 1.5px solid var(--c-border);
  border-radius: 11px; padding: 12px 14px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: all .15s;
  position: relative; text-align: left; width: 100%;
}
.ob-goal-card:hover { border-color: var(--c-border2); transform: translateX(2px); }
.ob-goal-card.sel { border-color: var(--c-accent); background: var(--c-accent-lt); }
.ob-goal-ic { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ob-goal-text { flex: 1; }
.ob-goal-label { font-size: 13.5px; font-weight: 600; color: var(--c-text); margin-bottom: 2px; }
.ob-goal-sub { font-size: 11.5px; color: var(--c-text3); }
.ob-goal-check { width: 20px; height: 20px; background: var(--c-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ob-goal-check svg { width: 11px; height: 11px; color: #fff; }

/* Experience */
.ob-exp-cards { display: flex; flex-direction: column; gap: 8px; }
.ob-exp-card {
  background: var(--c-bg); border: 1.5px solid var(--c-border);
  border-radius: 11px; padding: 14px 16px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: all .15s;
  text-align: left; width: 100%;
}
.ob-exp-card:hover { border-color: var(--c-border2); }
.ob-exp-card.sel { border-color: var(--c-accent); background: var(--c-accent-lt); }
.ob-exp-num { font-family: 'DM Serif Display', serif; font-size: 13px; font-weight: 700; margin-bottom: 2px; }
.ob-exp-label { font-size: 14px; font-weight: 600; color: var(--c-text); margin-bottom: 2px; }
.ob-exp-sub { font-size: 11.5px; color: var(--c-text3); margin-bottom: 8px; }
.ob-exp-bar { height: 3px; background: var(--c-border); border-radius: 2px; }
.ob-exp-fill { height: 100%; border-radius: 2px; transition: width .3s; }

/* Done step */
.ob-step--done { text-align: center; }
.ob-done-anim { position: relative; width: 80px; height: 80px; margin: 0 auto 20px; }
.ob-done-circle {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, var(--c-accent), var(--c-violet));
  display: flex; align-items: center; justify-content: center;
  animation: ob-pop .5s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes ob-pop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
.ob-done-sparks { position: absolute; inset: 0; }
.ob-spark {
  position: absolute; top: 50%; left: 50%;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--c-accent);
  animation: ob-spark calc(.6s + var(--n) * .05s) ease-out both;
  animation-delay: calc(var(--n) * .06s);
}
@keyframes ob-spark {
  from { transform: translate(-50%,-50%) scale(0); opacity: 1; }
  to   { transform: translate(calc(-50% + cos(calc(var(--n) * 45deg)) * 44px), calc(-50% + sin(calc(var(--n) * 45deg)) * 44px)) scale(1); opacity: 0; }
}
.ob-step--done h2 { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--c-text); margin-bottom: 8px; }
.ob-step--done p  { font-size: 13.5px; color: var(--c-text2); line-height: 1.6; margin-bottom: 20px; max-width: 360px; margin-left: auto; margin-right: auto; }
.ob-summary { background: var(--c-bg); border-radius: 12px; padding: 14px 16px; text-align: left; display: flex; flex-direction: column; gap: 10px; }
.ob-sum-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--c-text2); }
.ob-sum-ic { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ob-sum-row strong { color: var(--c-text); font-weight: 700; }

/* Footer */
.ob-footer {
  padding: 16px 24px 24px;
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
  border-top: 1px solid var(--c-border);
  flex-shrink: 0; background: var(--c-surface);
  margin-top: 20px;
}
.ob-dots { display: flex; gap: 6px; }
.ob-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c-border); transition: all .2s; }
.ob-dot.active { background: var(--c-accent); width: 18px; border-radius: 3px; }
.ob-dot.done { background: var(--c-green); }
.ob-actions { display: flex; align-items: center; gap: 8px; }
.ob-btn-back {
  display: flex; align-items: center; gap: 6px;
  background: none; border: 1px solid var(--c-border);
  color: var(--c-text2); padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: all .15s;
}
.ob-btn-back:hover { border-color: var(--c-border2); color: var(--c-text); }
.ob-btn-next {
  display: flex; align-items: center; gap: 7px;
  background: var(--c-text); color: var(--c-surface);
  border: none; padding: 10px 20px; border-radius: var(--radius-sm);
  font-size: 13.5px; font-weight: 600; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: all .18s;
}
.ob-btn-next:hover:not(:disabled) { background: var(--c-accent); }
.ob-btn-next:disabled { opacity: .6; cursor: not-allowed; }
.ob-spin { animation: ob-spin-anim .7s linear infinite; }
@keyframes ob-spin-anim { to { transform: rotate(360deg); } }

/* Transitions */
.ob-fwd-enter-active, .ob-fwd-leave-active,
.ob-bwd-enter-active, .ob-bwd-leave-active { transition: all .25s ease; }
.ob-fwd-enter-from { opacity: 0; transform: translateX(24px); }
.ob-fwd-leave-to  { opacity: 0; transform: translateX(-24px); }
.ob-bwd-enter-from { opacity: 0; transform: translateX(-24px); }
.ob-bwd-leave-to  { opacity: 0; transform: translateX(24px); }

/* Responsive */
@media (max-width: 600px) {
  .ob-root { padding: 0; align-items: flex-end; }
  .ob-card { border-radius: 20px 20px 0 0; max-width: 100%; max-height: 96dvh; }
  .ob-step { padding: 24px 20px 0; }
  .ob-footer { padding: 14px 20px 28px; }
  .ob-grid--ind { grid-template-columns: repeat(3,1fr); }
  .ob-hero { height: 110px; }
}
@media (max-width: 380px) {
  .ob-grid--ind { grid-template-columns: repeat(2,1fr); }
}
</style>