<template>
  <div class="step-wrap">
    <h3 class="step-title">CV Quality Check</h3>
    <p class="step-sub">ATS compliance, content standards and recruiter best practices.</p>

    <!-- With a job offer, the job-specific ATS match is the headline check -->
    <AtsScorer v-if="jobFirst" style="margin-bottom:20px" />

    <!-- Score ring -->
    <div class="score-hero">
      <div class="score-ring">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="36" fill="none" stroke="var(--c-border2)" stroke-width="6"/>
          <circle cx="44" cy="44" r="36" fill="none"
            :stroke="scoreColor" stroke-width="6"
            :stroke-dasharray="circ"
            :stroke-dashoffset="dashOff"
            stroke-linecap="round" transform="rotate(-90 44 44)"
            style="transition:stroke-dashoffset .6s ease"/>
        </svg>
        <div class="score-mid">
          <div class="score-n" :style="{color:scoreColor}">{{ score }}</div>
          <div class="score-m">/100</div>
        </div>
      </div>
      <div class="score-info">
        <div class="score-ttl">{{ scoreLabel }}</div>
        <div class="score-desc">{{ scoreDesc }}</div>
        <div class="score-chips">
          <span v-for="c in statusChips" :key="c.label" class="sc" :class="c.cls">{{ c.label }}</span>
        </div>
      </div>
    </div>

    <!-- Category bars -->
    <div class="cat-bars">
      <div class="cat-bar" v-for="c in categories" :key="c.label">
        <div class="cat-bar-hd">
          <span class="cat-label">{{ c.label }}</span>
          <span class="cat-score" :style="{color:catColor(c.score)}">{{ c.score }}/{{ c.max }}</span>
        </div>
        <div class="cat-track">
          <div class="cat-fill" :style="{width:(c.score/c.max*100)+'%', background:catColor(c.score/c.max*100)}"></div>
        </div>
      </div>
    </div>

    <!-- AI review button -->
    <button class="btn-ai" @click="runAiReview" :disabled="reviewing" style="margin-bottom:16px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2"/></svg>
      {{ reviewing ? 'AI reviewing...' : 'Run deep AI review' }}
    </button>

    <!-- Issues list -->
    <div class="issues-list">
      <div v-for="issue in allIssues" :key="issue.id"
        class="issue-card" :class="issue.severity">
        <div class="issue-hd">
          <div class="issue-icon">
            <svg v-if="issue.severity==='pass'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="issue.severity==='error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="issue-body">
            <div class="issue-title">{{ issue.title }}</div>
            <div class="issue-text">{{ issue.text }}</div>
            <div v-if="issue.tip" class="issue-tip">💡 {{ issue.tip }}</div>
          </div>
          <button v-if="issue.stepIndex !== undefined" class="fix-btn" @click="fixStep(issue.stepIndex)">Fix →</button>
        </div>
      </div>

      <!-- AI suggestions -->
      <div v-for="s in aiSuggestions" :key="s.id" class="issue-card warn">
        <div class="issue-hd">
          <div class="issue-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px;color:var(--c-accent)"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2"/></svg>
          </div>
          <div class="issue-body">
            <div class="issue-title">{{ s.title }}</div>
            <div class="issue-text">{{ s.text }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Email note -->
    <div class="email-note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;flex-shrink:0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
      After export, your CV is emailed to <strong>{{ userEmail }}</strong>
    </div>

    <template v-if="!jobFirst">
      <div class="ats-divider">
        <span>Job-specific ATS check</span>
      </div>
      <AtsScorer />
    </template>

    <div class="next-hint pay-cta">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" stroke-width="2" style="width:18px;height:18px;flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>
      <div style="flex:1;min-width:0">
        <div class="next-hint-ttl">Happy with your CV?</div>
        <div class="next-hint-sub">Get it as a polished PDF, emailed to you — or open the builder to fine-tune it first.</div>
      </div>
      <button class="btn-primary accent" @click="$emit('pay')">Get my CV →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AtsScorer from '../AtsScorer.vue'
import { useCvStore } from '../../stores/cv.js'
import { useAuthStore } from '../../stores/auth.js'

const store = useCvStore()
const auth  = useAuthStore()
defineEmits(['next', 'pay'])

const reviewing    = ref(false)
const aiSuggestions = ref([])
const circ = 2 * Math.PI * 36
// Decided once on mount so the ATS box doesn't jump position while the user types into it
const jobFirst = !!store.data.jobOffer?.trim()
const userEmail = computed(() => auth.user?.email || 'your email')

// ── RULES ENGINE ─────────────────────────────────────────────────────────────
// Each rule: { id, category, severity('error'|'warn'|'pass'), title, text, tip?, points, stepIndex? }
const rules = computed(() => {
  const d = store.data
  const exp = d.experiences || []
  const edu = Array.isArray(d.education) ? d.education : (d.education?.degree ? [d.education] : [])
  const skills = d.skills || []

  return [
    // ── CONTACT & BASICS ─────────────────────────────────────────────────────
    {
      id: 'name', cat: 'Basics', points: 10,
      severity: (d.fn && d.ln) ? 'pass' : 'error',
      title: (d.fn && d.ln) ? 'Full name present' : 'Full name missing',
      text: (d.fn && d.ln) ? 'Your name is the first thing a recruiter sees.' : 'Add your first and last name.',
      stepIndex: 0,
    },
    {
      id: 'email', cat: 'Basics', points: 10,
      severity: d.email ? 'pass' : 'error',
      title: d.email ? 'Email address present' : 'Email address missing',
      text: d.email ? 'Recruiters can contact you directly.' : 'Every CV must have an email address.',
      stepIndex: 0,
    },
    {
      id: 'phone', cat: 'Basics', points: 5,
      severity: d.phone ? 'pass' : 'warn',
      title: d.phone ? 'Phone number present' : 'Phone number missing',
      text: d.phone ? 'Good — some recruiters prefer calling.' : 'Adding a phone number increases response rate.',
      stepIndex: 0,
    },
    {
      id: 'title', cat: 'Basics', points: 5,
      severity: d.title ? 'pass' : 'warn',
      title: d.title ? 'Job title present' : 'Job title missing',
      text: d.title ? 'Clear professional positioning.' : 'Add a job title so recruiters instantly know your level.',
      tip: 'e.g. "Senior Product Manager" or "Full Stack Developer"',
      stepIndex: 0,
    },
    {
      id: 'location', cat: 'Basics', points: 5,
      severity: d.loc ? 'pass' : 'warn',
      title: d.loc ? 'Location present' : 'Location missing',
      text: d.loc ? 'Recruiters can assess commute or relocation.' : 'Add your city/country. Recruiters filter by location.',
      stepIndex: 0,
    },

    // ── SUMMARY ──────────────────────────────────────────────────────────────
    {
      id: 'summary-exists', cat: 'Summary', points: 10,
      severity: d.sum?.length > 20 ? 'pass' : 'error',
      title: d.sum?.length > 20 ? 'Summary present' : 'Summary missing',
      text: d.sum?.length > 20 ? 'Good opening — recruiters read this first.' : 'Add a 2–3 sentence professional summary. It\'s the first thing read.',
      stepIndex: 1,
    },
    {
      id: 'summary-length', cat: 'Summary', points: 5,
      severity: !d.sum?.length ? 'error' : d.sum.length >= 100 && d.sum.length <= 600 ? 'pass' : 'warn',
      title: !d.sum?.length ? 'No summary' : d.sum.length < 100 ? 'Summary too short' : d.sum.length > 600 ? 'Summary too long' : 'Summary length is ideal',
      text: !d.sum?.length ? 'Write a summary to improve your score.' : d.sum.length < 100 ? 'Aim for 2–3 sentences (100–400 characters).' : d.sum.length > 600 ? 'Keep your summary concise — under 4 sentences. Recruiters skim.' : 'Your summary is the right length.',
      stepIndex: 1,
    },

    // ── EXPERIENCE ───────────────────────────────────────────────────────────
    {
      id: 'exp-count', cat: 'Experience', points: 15,
      severity: exp.filter(e => e.title || e.company).length >= 1 ? 'pass' : 'error',
      title: exp.filter(e => e.title || e.company).length >= 1 ? 'Experience entries present' : 'No experience added',
      text: exp.filter(e => e.title || e.company).length >= 1 ? `${exp.filter(e => e.title||e.company).length} experience ${exp.filter(e=>e.title||e.company).length===1?'entry':'entries'} found.` : 'Add at least one work experience entry.',
      stepIndex: 2,
    },
    {
      id: 'exp-descriptions', cat: 'Experience', points: 10,
      severity: exp.length === 0 ? 'error' : exp.every(e => e.desc && e.desc.length > 30) ? 'pass' : 'warn',
      title: exp.length === 0 ? 'No experience' : exp.every(e => e.desc?.length > 30) ? 'All roles have descriptions' : 'Some roles lack descriptions',
      text: exp.length === 0 ? 'Add experience entries.' : exp.every(e => e.desc?.length > 30) ? 'Good — descriptions help ATS and recruiters.' : 'Add bullet-point descriptions to every role. Describe responsibilities and achievements.',
      tip: 'Use the format: [Action verb] + [task] + [result/metric]',
      stepIndex: 2,
    },
    {
      id: 'exp-metrics', cat: 'Experience', points: 10,
      severity: exp.length === 0 ? 'error' : exp.some(e => /\d+[%£$€kKmM]|\d+ (user|client|team|staff|project|million|thousand|percent)/i.test(e.desc||'')
        ) ? 'pass' : 'warn',
      title: exp.some(e => /\d+[%£$€kKmM]|\d+ (user|client|team|staff|project|million|thousand|percent)/i.test(e.desc||'')
        ) ? 'Quantified achievements found' : 'No quantified achievements',
      text: exp.some(e => /\d+[%£$€kKmM]|\d+ (user|client|team|staff|project|million|thousand|percent)/i.test(e.desc||'')
        ) ? 'Numbers make your CV stand out to recruiters.' : 'Add metrics to your experience: "Grew revenue by 40%", "Managed a team of 8", "Reduced costs by £50K".',
      tip: 'CVs with numbers get 40% more callbacks according to recruiter surveys.',
      stepIndex: 2,
    },
    {
      id: 'exp-periods', cat: 'Experience', points: 5,
      severity: exp.length === 0 ? 'error' : exp.every(e => e.period) ? 'pass' : 'warn',
      title: exp.every(e => e.period) ? 'All roles have dates' : 'Some roles missing dates',
      text: exp.every(e => e.period) ? 'Date ranges show career progression clearly.' : 'Add start/end dates to every role. Gaps are noticed by ATS systems.',
      stepIndex: 2,
    },

    // ── SKILLS ───────────────────────────────────────────────────────────────
    {
      id: 'skills-count', cat: 'Skills', points: 10,
      severity: skills.length >= 6 ? 'pass' : skills.length >= 3 ? 'warn' : 'error',
      title: skills.length >= 6 ? `${skills.length} skills listed` : skills.length >= 3 ? 'Too few skills' : 'Skills section empty',
      text: skills.length >= 6 ? 'Good skills coverage for ATS matching.' : skills.length >= 3 ? 'Add at least 6 skills. ATS systems match job keywords against your skills.' : 'Add 6–12 relevant skills. This is critical for ATS filtering.',
      tip: 'Mix technical and soft skills. Mirror keywords from job descriptions.',
      stepIndex: 3,
    },

    // ── EDUCATION ────────────────────────────────────────────────────────────
    {
      id: 'education', cat: 'Education', points: 10,
      severity: edu.some(e => e.degree || e.school) ? 'pass' : 'warn',
      title: edu.some(e => e.degree || e.school) ? 'Education present' : 'Education section empty',
      text: edu.some(e => e.degree || e.school) ? 'Education history included.' : 'Add your highest qualification. Even if not required, it adds credibility.',
      stepIndex: 4,
    },

    // ── ATS & STANDARDS ──────────────────────────────────────────────────────
    {
      id: 'linkedin', cat: 'ATS & Links', points: 5,
      severity: d.li ? 'pass' : 'warn',
      title: d.li ? 'LinkedIn URL present' : 'No LinkedIn URL',
      text: d.li ? 'Great — recruiters will check your profile.' : 'Adding a LinkedIn URL increases recruiter confidence significantly.',
      stepIndex: 0,
    },
    {
      id: 'ats-length', cat: 'ATS & Links', points: 5,
      severity: (() => {
        const totalWords = [d.sum, ...exp.map(e=>e.desc)].filter(Boolean).join(' ').split(/\s+/).length
        return totalWords > 50 && totalWords < 1000 ? 'pass' : totalWords <= 50 ? 'warn' : 'warn'
      })(),
      title: (() => {
        const w = [d.sum, ...exp.map(e=>e.desc)].filter(Boolean).join(' ').split(/\s+/).length
        return w < 50 ? 'CV content too sparse' : w > 900 ? 'CV may be too long' : 'CV length is good'
      })(),
      text: (() => {
        const w = [d.sum, ...exp.map(e=>e.desc)].filter(Boolean).join(' ').split(/\s+/).length
        return w < 50 ? 'Add more detail to your experience and summary. Recruiters want substance.' : w > 900 ? 'Consider trimming. Recruiters spend 6–8 seconds on a first scan. Keep it focused.' : 'Your CV has the right amount of content for a 1–2 page PDF.'
      })(),
    },
  ]
})

// ── SCORING ──────────────────────────────────────────────────────────────────
const score = computed(() => {
  const maxPoints = rules.value.reduce((s, r) => s + r.points, 0)
  const earned    = rules.value.filter(r => r.severity === 'pass').reduce((s, r) => s + r.points, 0)
  return Math.round((earned / maxPoints) * 100)
})

const scoreColor = computed(() => {
  if (score.value >= 85) return 'var(--c-green)'
  if (score.value >= 65) return 'var(--c-accent)'
  if (score.value >= 45) return 'var(--c-amber)'
  return 'var(--c-rose)'
})

const dashOff = computed(() => circ - (score.value / 100) * circ)

const scoreLabel = computed(() => {
  if (score.value >= 85) return 'Excellent CV'
  if (score.value >= 70) return 'Strong CV'
  if (score.value >= 50) return 'Good CV'
  if (score.value >= 30) return 'Needs Work'
  return 'Incomplete'
})

const scoreDesc = computed(() => {
  if (score.value >= 85) return 'Interview-ready — top 10% of applicants'
  if (score.value >= 70) return 'A few tweaks could push you to 90+'
  if (score.value >= 50) return 'Several improvements recommended'
  return 'Complete the sections below to improve your score'
})

const statusChips = computed(() => {
  const d = store.data
  return [
    { label: d.email ? 'ATS Ready' : 'Not ATS Ready', cls: d.email && d.fn ? 'sc sc-g' : 'sc sc-r' },
    { label: (d.skills||[]).length >= 6 ? 'Keywords OK' : 'Add Keywords', cls: (d.skills||[]).length >= 6 ? 'sc sc-g' : 'sc sc-a' },
    { label: (d.experiences||[]).some(e => /\d/.test(e.desc||'')) ? 'Metrics Present' : 'Add Metrics', cls: (d.experiences||[]).some(e => /\d/.test(e.desc||'')) ? 'sc sc-g' : 'sc sc-a' },
  ]
})

// ── CATEGORY BREAKDOWN ───────────────────────────────────────────────────────
const categories = computed(() => {
  const cats = {}
  rules.value.forEach(r => {
    if (!cats[r.cat]) cats[r.cat] = { label: r.cat, score: 0, max: 0 }
    cats[r.cat].max   += r.points
    if (r.severity === 'pass') cats[r.cat].score += r.points
  })
  return Object.values(cats)
})

function catColor(pct) {
  const v = typeof pct === 'number' ? (pct <= 1 ? pct * 100 : pct) : 0
  if (v >= 80) return 'var(--c-green)'
  if (v >= 50) return 'var(--c-accent)'
  if (v >= 25) return 'var(--c-amber)'
  return 'var(--c-rose)'
}

// ── ISSUES (sorted: errors first, then warnings, then passes) ────────────────
const allIssues = computed(() => {
  return [...rules.value].sort((a,b) => {
    const order = { error: 0, warn: 1, pass: 2 }
    return order[a.severity] - order[b.severity]
  })
})

function fixStep(stepIndex) { store.openWizardAtStep(stepIndex) }

// ── AI DEEP REVIEW ───────────────────────────────────────────────────────────
async function runAiReview() {
  reviewing.value = true
  aiSuggestions.value = []
  try {
    const d = store.data
    const prompt = `You are a professional CV reviewer. Analyse this CV and return ONLY a JSON array of 3-5 specific improvement suggestions.
Each suggestion: {"id":"s1","title":"Short title","text":"Specific actionable advice"}
Focus on: content quality, word choice, industry standards, ATS optimisation, missing sections.
Be specific and actionable, not generic.

CV DATA:
Name: ${d.fn} ${d.ln}
Title: ${d.title}
Summary: ${d.sum?.slice(0,300)}
Experience: ${(d.experiences||[]).map(e => e.title+' at '+e.company+': '+e.desc?.slice(0,100)).join(' | ')}
Skills: ${(d.skills||[]).join(', ')}
Education: ${Array.isArray(d.education) ? d.education[0]?.degree+' - '+d.education[0]?.school : d.education?.degree}

Return ONLY the JSON array, no markdown.`

    const result  = await store.callAi(prompt)
    const clean   = result.replace(/\`\`\`json\s*/gi,'').replace(/\`\`\`/g,'').trim()
    const parsed  = JSON.parse(clean)
    if (Array.isArray(parsed)) aiSuggestions.value = parsed
  } catch (e) {
    console.warn('AI review failed:', e)
  }
  reviewing.value = false
}

onMounted(runAiReview)
</script>

<style scoped>
.step-title { font-family:'DM Serif Display',serif; font-size:20px; color:var(--c-text); margin-bottom:5px; }
.step-sub   { font-size:13px; color:var(--c-text2); margin-bottom:20px; line-height:1.5; }

/* Score hero */
.score-hero { display:flex; align-items:center; gap:18px; margin-bottom:20px; padding:16px; background:var(--c-bg); border:1px solid var(--c-border); border-radius:var(--radius-lg); }
.score-ring { position:relative; width:88px; height:88px; flex-shrink:0; }
.score-mid  { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.score-n    { font-family:'DM Serif Display',serif; font-size:26px; font-weight:700; line-height:1; }
.score-m    { font-size:11px; color:var(--c-text3); }
.score-ttl  { font-size:16px; font-weight:700; color:var(--c-text); margin-bottom:3px; }
.score-desc { font-size:12px; color:var(--c-text2); margin-bottom:8px; line-height:1.4; }
.score-chips { display:flex; gap:5px; flex-wrap:wrap; }
.sc  { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; }
.sc-g { background:var(--c-green-lt); color:var(--c-green); }
.sc-a { background:var(--c-amber-lt); color:var(--c-amber); }
.sc-r { background:var(--c-rose-lt);  color:var(--c-rose);  }

/* Category bars */
.cat-bars { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
.cat-bar  { background:var(--c-bg); border:1px solid var(--c-border); border-radius:var(--radius); padding:10px 12px; }
.cat-bar-hd { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.cat-label  { font-size:12px; font-weight:600; color:var(--c-text2); }
.cat-score  { font-size:11px; font-weight:700; }
.cat-track  { height:5px; background:var(--c-border); border-radius:3px; overflow:hidden; }
.cat-fill   { height:100%; border-radius:3px; transition:width .5s ease; }

/* Issues */
.issues-list { display:flex; flex-direction:column; gap:8px; margin-bottom:14px; }
.issue-card  { border-radius:var(--radius); padding:12px 14px; border:1px solid; }
.issue-card.pass  { background:var(--c-green-lt); border-color:#a0d8b8; }
.issue-card.warn  { background:var(--c-amber-lt); border-color:#e8c87a; }
.issue-card.error { background:var(--c-rose-lt);  border-color:#f0a8b0; }
.issue-hd    { display:flex; align-items:flex-start; gap:10px; }
.issue-icon  { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
.issue-card.pass  .issue-icon { background:var(--c-green);  color:#fff; }
.issue-card.warn  .issue-icon { background:var(--c-amber);  color:#fff; }
.issue-card.error .issue-icon { background:var(--c-rose);   color:#fff; }
.issue-body  { flex:1; min-width:0; }
.issue-title { font-size:13px; font-weight:700; color:var(--c-text); margin-bottom:3px; }
.issue-text  { font-size:12px; color:var(--c-text2); line-height:1.55; }
.issue-tip   { font-size:11.5px; color:var(--c-text3); margin-top:5px; font-style:italic; }
.fix-btn { background:var(--c-text); color:var(--c-surface); border:none; padding:5px 11px; border-radius:var(--radius-sm); font-size:11.5px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; flex-shrink:0; white-space:nowrap; transition:opacity .15s; }
.fix-btn:hover { opacity:.8; }

.email-note { display:flex; align-items:center; gap:8px; background:var(--c-bg); border:1px solid var(--c-border); border-radius:var(--radius); padding:10px 12px; font-size:12px; color:var(--c-text2); margin-bottom:12px; }
.next-hint { display:flex; align-items:flex-start; gap:12px; background:var(--c-green-lt); border:1px solid #a0d8b8; border-radius:var(--radius); padding:14px; }
.next-hint-ttl { font-size:13px; font-weight:700; color:var(--c-green); margin-bottom:2px; }
.next-hint-sub { font-size:11.5px; color:var(--c-text2); }
.pay-cta { align-items:center; margin-top:20px; flex-wrap:wrap; }
.ats-divider { display:flex; align-items:center; gap:12px; margin:20px 0 4px; }
.ats-divider span { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--c-text3); white-space:nowrap; }
.ats-divider::before,.ats-divider::after { content:''; flex:1; height:1px; background:var(--c-border); }
</style>