<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">⭐</div>
      <h3>CV Review</h3>
      <p>Here's your AI-powered score and improvement tips.</p>
    </div>

    <div class="score-wrap">
      <div class="score-hero">
        <div class="score-ring">
          <svg width="76" height="76" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r="30" fill="none" stroke="#e8e6e0" stroke-width="5.5"/>
            <circle cx="38" cy="38" r="30" fill="none" stroke="#2a5bd7" stroke-width="5.5"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              stroke-linecap="round"/>
          </svg>
          <div class="score-mid">
            <div class="score-n">{{ score }}</div>
            <div class="score-m">/100</div>
          </div>
        </div>
        <div class="score-info">
          <div class="score-ttl">{{ scoreLabel }}</div>
          <div class="score-desc">{{ scoreDesc }}</div>
          <div class="score-chips">
            <span v-for="c in chips" :key="c.label" class="sc" :class="c.cls">{{ c.label }}</span>
          </div>
        </div>
      </div>

      <div v-if="reviewing" class="thinking">
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        <div class="thinking-txt">Groq is reviewing your CV...</div>
      </div>

      <div v-for="s in suggestions" :key="s.id" class="sug-card" :class="s.type">
        <div class="sug-ttl">{{ s.title }}</div>
        <div class="sug-txt">{{ s.text }}</div>
        <button v-if="s.fix" class="fix-btn" @click="s.fix()">{{ s.fixLabel || 'Fix with AI' }}</button>
      </div>

      <button class="btn-ai" @click="runReview" :disabled="reviewing" style="margin-top:4px;">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        {{ reviewing ? 'Reviewing...' : 'Run Full AI Review' }}
      </button>
    </div>

    <div class="next-hint">
      <div class="next-hint-icon">✅</div>
      <div>
        <div class="next-hint-ttl">Ready to export?</div>
        <div class="next-hint-sub">Click "Done — Open Builder" to fine-tune and export your CV as PDF.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store = useCvStore()
defineEmits(['next'])

const reviewing = ref(false)
const score = ref(81)
const circumference = 2 * Math.PI * 30
const dashOffset = computed(() => circumference - (score.value / 100) * circumference)

const scoreLabel = computed(() => score.value >= 90 ? 'Excellent CV' : score.value >= 75 ? 'Strong CV' : score.value >= 60 ? 'Good CV' : 'Needs Work')
const scoreDesc = computed(() => score.value >= 90 ? 'Interview-ready — top 10% of applicants' : score.value >= 75 ? 'A few tweaks could push to 95+' : 'Several improvements recommended')

const chips = computed(() => {
  const d = store.data
  return [
    { label: 'ATS Ready', cls: 'sc sc-g' },
    { label: d.sum?.length > 50 ? 'Good Summary' : 'Add Summary', cls: d.sum?.length > 50 ? 'sc sc-g' : 'sc sc-r' },
    { label: d.skills?.length >= 5 ? 'Skills Listed' : 'Add Skills', cls: d.skills?.length >= 5 ? 'sc sc-g' : 'sc sc-a' },
    { label: d.experiences?.length >= 2 ? 'Experience ✓' : 'Add Experience', cls: d.experiences?.length >= 2 ? 'sc sc-g' : 'sc sc-a' },
  ]
})

const suggestions = ref([
  { id: 1, type: 'good', title: '✓ Strong opening summary', text: 'Your summary is concise, role-specific, and highlights measurable impact.' },
  { id: 2, type: 'warn', title: '⚠ Add metrics to experience bullets', text: 'Numbers increase callback rate by 40%. Quantify achievements where possible.', fix: null, fixLabel: 'Auto-quantify' },
  { id: 3, type: 'bad',  title: '✗ Portfolio / GitHub link missing', text: 'A portfolio link significantly increases visibility with hiring managers.' },
  { id: 4, type: 'warn', title: '⚠ Consider adding certifications', text: 'Relevant certs (PSPO II, Google PM, AWS) boost credibility for your target roles.' },
])

async function runReview() {
  reviewing.value = true
  await new Promise(r => setTimeout(r, 1800))
  // Simulate updated score
  score.value = Math.min(100, score.value + Math.floor(Math.random() * 8))
  reviewing.value = false
}
</script>

<style scoped>
.step-intro{margin-bottom:20px;}
.step-icon{font-size:28px;margin-bottom:8px;}
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:'DM Serif Display',serif;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.next-hint{display:flex;align-items:center;gap:12px;background:var(--c-green-lt);border:1px solid #a0d8b8;border-radius:var(--radius);padding:14px;margin-top:14px;}
.next-hint-icon{font-size:22px;}
.next-hint-ttl{font-size:13px;font-weight:700;color:var(--c-green);margin-bottom:2px;}
.next-hint-sub{font-size:11.5px;color:var(--c-text2);}
</style>