<template>
  <div class="step-wrap">
    <h3 class="step-title">CV Review</h3>
    <p class="step-sub">Your AI-powered score and improvement suggestions.</p>

    <div class="score-wrap">
      <div class="score-hero">
        <div class="score-ring">
          <svg width="76" height="76" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r="30" fill="none" stroke="var(--c-border2)" stroke-width="5.5"/>
            <circle cx="38" cy="38" r="30" fill="none" stroke="var(--c-accent)" stroke-width="5.5"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              stroke-linecap="round" transform="rotate(-90 38 38)"/>
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
        <div class="thinking-txt">AI is reviewing your CV...</div>
      </div>

      <div v-for="s in suggestions" :key="s.id" class="sug-card" :class="s.type">
        <div class="sug-ttl">{{ s.title }}</div>
        <div class="sug-txt">{{ s.text }}</div>
        <button v-if="s.stepIndex !== undefined" class="fix-btn" @click="fixStep(s.stepIndex)">Fix this →</button>
      </div>

      <button class="btn-ai" @click="runReview" :disabled="reviewing">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2"/></svg>
        {{ reviewing ? 'Reviewing...' : 'Run Full AI Review' }}
      </button>

      <div class="email-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;flex-shrink:0;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
        After export payment, your CV is automatically emailed to <strong>{{ userEmail }}</strong>
      </div>

      <div class="next-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" stroke-width="2" style="width:18px;height:18px;flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div class="next-hint-ttl">Ready to export?</div>
          <div class="next-hint-sub">Click "Open Builder" to fine-tune and export your CV as a PDF.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCvStore } from '../../stores/cv.js'
import { useAuthStore } from '../../stores/auth.js'

const store = useCvStore()
const auth  = useAuthStore()
defineEmits(['next'])

const reviewing = ref(false)
const score = ref(0)
const circumference = 2 * Math.PI * 30
const dashOffset = computed(() => circumference - (score.value / 100) * circumference)
const userEmail = computed(() => auth.user?.email || 'your email')

const scoreLabel = computed(() => {
  if (score.value >= 90) return 'Excellent CV'
  if (score.value >= 75) return 'Strong CV'
  if (score.value >= 60) return 'Good CV'
  return 'Needs Work'
})
const scoreDesc = computed(() => {
  if (score.value >= 90) return 'Interview-ready — top 10% of applicants'
  if (score.value >= 75) return 'A few tweaks could push to 95+'
  return 'Several improvements recommended'
})

const chips = computed(() => {
  const d = store.data
  return [
    { label: d.email ? 'Contact Info' : 'Add Contact', cls: d.email ? 'sc sc-g' : 'sc sc-r' },
    { label: d.sum?.length > 50 ? 'Good Summary' : 'Improve Summary', cls: d.sum?.length > 50 ? 'sc sc-g' : 'sc sc-a' },
    { label: d.skills?.length >= 5 ? 'Skills Listed' : 'Add Skills', cls: d.skills?.length >= 5 ? 'sc sc-g' : 'sc sc-a' },
    { label: d.experiences?.length >= 2 ? 'Experience Good' : 'Add Experience', cls: d.experiences?.length >= 2 ? 'sc sc-g' : 'sc sc-r' },
  ]
})

const suggestions = computed(() => {
  const d = store.data
  const s = []
  if (d.sum?.length > 50)
    s.push({ id:1, type:'good', title:'Strong opening summary', text:'Your summary is concise and role-specific.' })
  else
    s.push({ id:1, type:'bad', title:'Summary needs work', text:'Add a 2–3 sentence professional summary to grab attention.', stepIndex: 1 })
  if (!d.experiences?.length || d.experiences.some(e => !e.desc))
    s.push({ id:2, type:'warn', title:'Quantify your experience', text:'Numbers increase callback rate by 40%. Add metrics where possible.', stepIndex: 2 })
  if (d.skills?.length < 5)
    s.push({ id:3, type:'warn', title:'Add more skills', text:'List at least 6–8 relevant skills for ATS matching.', stepIndex: 3 })
  if (!d.education?.degree)
    s.push({ id:4, type:'bad', title:'Education section empty', text:'Add your highest qualification.', stepIndex: 4 })
  if (!d.li && !d.website)
    s.push({ id:5, type:'warn', title:'No LinkedIn or portfolio', text:'A LinkedIn URL significantly increases visibility.', stepIndex: 0 })
  if (d.experiences?.length >= 2 && d.sum?.length > 50 && d.skills?.length >= 5)
    s.push({ id:6, type:'good', title:'Well-rounded CV', text:'Your CV covers all key sections. ATS compatibility looks good.' })
  return s
})

onMounted(() => {
  const d = store.data
  let s = 0
  if (d.fn && d.ln) s += 10
  if (d.email) s += 10
  if (d.phone) s += 5
  if (d.sum?.length > 50) s += 20
  if (d.experiences?.length >= 1) s += 15
  if (d.experiences?.length >= 2) s += 10
  if (d.skills?.length >= 5) s += 15
  if (d.education?.degree) s += 10
  if (d.li || d.website) s += 5
  score.value = s
})

function fixStep(stepIndex) { store.openWizardAtStep(stepIndex) }

async function runReview() {
  reviewing.value = true
  try {
    const prompt = `Review this CV data and respond ONLY with JSON: {"score":0-100,"tip":"one specific tip"}
CV: Name: ${store.data.fn} ${store.data.ln}, Title: ${store.data.title}, Summary length: ${store.data.sum?.length||0}, Experience entries: ${store.data.experiences?.length||0}, Skills: ${store.data.skills?.length||0}, Has education: ${!!store.data.education?.degree}`
    const result = await store.callAi(prompt)
    const parsed = JSON.parse(result.replace(/```json\s*/gi,'').replace(/```/g,'').trim())
    if (parsed.score) score.value = Math.max(score.value, Math.min(100, parsed.score))
  } catch {}
  reviewing.value = false
}
</script>

<style scoped>
.step-title { font-family:'DM Serif Display',serif;font-size:20px;color:var(--c-text);margin-bottom:5px; }
.step-sub { font-size:13px;color:var(--c-text2);margin-bottom:20px; }
.next-hint { display:flex;align-items:flex-start;gap:12px;background:var(--c-green-lt);border:1px solid #a0d8b8;border-radius:var(--radius);padding:14px;margin-top:14px; }
.next-hint-ttl { font-size:13px;font-weight:700;color:var(--c-green);margin-bottom:2px; }
.next-hint-sub { font-size:11.5px;color:var(--c-text2); }
.email-note { display:flex;align-items:center;gap:8px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--radius);padding:10px 12px;margin-top:12px;font-size:12px;color:var(--c-text2); }
</style>