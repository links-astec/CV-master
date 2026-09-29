<template>
  <div class="ats-wrap">
    <div class="ats-header">
      <div class="ats-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:20px;height:20px"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
      </div>
      <div>
        <div class="ats-title">ATS Job Match</div>
        <div class="ats-sub">Paste a job description to see how well your CV matches</div>
      </div>
    </div>

    <!-- Job description input -->
    <textarea
      v-model="store.data.jobOffer"
      class="ats-textarea"
      placeholder="Paste the full job description here..."
      rows="6"
      :disabled="scoring"
    />

    <button class="btn-primary accent ats-btn" @click="runScore" :disabled="scoring || !jobDesc.trim()">
      <svg v-if="scoring" class="ats-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2"/></svg>
      {{ scoring ? 'Analysing...' : 'Check ATS match' }}
    </button>

    <!-- Results -->
    <div v-if="result" class="ats-results">

      <!-- Score ring -->
      <div class="ats-score-row">
        <div class="ats-ring-wrap">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--c-border2)" stroke-width="7"/>
            <circle cx="50" cy="50" r="42" fill="none"
              :stroke="ringColor" stroke-width="7"
              :stroke-dasharray="ringCirc"
              :stroke-dashoffset="ringDash"
              stroke-linecap="round"
              transform="rotate(-90 50 50)"
              style="transition:stroke-dashoffset .8s ease"/>
          </svg>
          <div class="ats-ring-inner">
            <div class="ats-ring-score" :style="{color:ringColor}">{{ result.score }}%</div>
            <div class="ats-ring-lbl">Match</div>
          </div>
        </div>
        <div class="ats-score-info">
          <div class="ats-verdict" :style="{color:ringColor}">{{ verdict }}</div>
          <div class="ats-verdict-sub">{{ verdictSub }}</div>
          <div class="ats-chips">
            <span class="ats-chip" :class="result.score >= 70 ? 'green' : 'red'">
              {{ result.score >= 70 ? 'Strong keyword match' : 'Keyword gaps to close' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Keyword breakdown -->
      <div class="ats-section">
        <div class="ats-section-title">Keyword matches</div>
        <div class="ats-keywords">
          <span v-for="kw in result.matched" :key="kw" class="ats-kw ats-kw-match">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="width:10px;height:10px"><polyline points="20 6 9 17 4 12"/></svg>
            {{ kw }}
          </span>
          <span v-for="kw in result.missing" :key="kw" class="ats-kw ats-kw-miss">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:10px;height:10px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            {{ kw }}
          </span>
        </div>
      </div>

      <!-- Gaps -->
      <div class="ats-section" v-if="result.gaps?.length">
        <div class="ats-section-title">Gaps to address</div>
        <div v-for="(g, i) in result.gaps" :key="i" class="ats-gap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px;flex-shrink:0;color:var(--c-amber)"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>{{ g }}</span>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="ats-section" v-if="result.suggestions?.length">
        <div class="ats-section-title">How to improve your match</div>
        <div v-for="(s, i) in result.suggestions" :key="i" class="ats-suggestion">
          <div class="ats-sug-num">{{ i + 1 }}</div>
          <span>{{ s }}</span>
        </div>
      </div>

    </div>

    <div v-if="error" class="ats-error">{{ error }}</div>
  </div>
</template>

<script>
// Module scope: shared by every AtsScorer instance. Key = job offer + CV text.
const atsCache = new Map()
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCvStore } from '../stores/cv.js'

const store   = useCvStore()
// The job offer lives on the CV itself, so the Tailor step, this check and the saved draft share it
const jobDesc = computed(() => store.data.jobOffer || '')
const scoring = ref(false)
const result  = ref(null)
const error   = ref('')

const ringCirc = 2 * Math.PI * 42
const ringDash = computed(() => ringCirc - (result.value?.score || 0) / 100 * ringCirc)
const ringColor = computed(() => {
  const s = result.value?.score || 0
  if (s >= 75) return 'var(--c-green)'
  if (s >= 55) return 'var(--c-accent)'
  if (s >= 35) return 'var(--c-amber)'
  return 'var(--c-rose)'
})
const verdict = computed(() => {
  const s = result.value?.score || 0
  if (s >= 75) return 'Strong match'
  if (s >= 55) return 'Moderate match'
  if (s >= 35) return 'Weak match'
  return 'Poor match'
})
const verdictSub = computed(() => {
  const s = result.value?.score || 0
  if (s >= 75) return 'Your CV is well-aligned with this role.'
  if (s >= 55) return 'A few targeted changes would significantly improve your chances.'
  if (s >= 35) return 'Several key requirements are missing from your CV.'
  return 'Your CV needs significant work to match this role.'
})

async function runScore() {
  if (!jobDesc.value.trim()) return
  scoring.value = true
  result.value  = null
  error.value   = ''

  const d = store.data
  const cvText = [
    d.fn, d.ln, d.title, d.sum,
    ...(d.experiences || []).map(e => `${e.title} ${e.company} ${e.desc}`),
    ...(d.projects || []).map(p => `${p.name} ${p.tech} ${p.desc}`),
    ...(d.languages || []).map(l => `${l.name} ${l.level}`),
    ...(d.skills || []),
    ...(Array.isArray(d.education) ? d.education : [d.education]).map(e => `${e?.degree} ${e?.school}`),
    ...(d.certifications || []),
  ].filter(Boolean).join(' ')

  // Same CV + same job → same analysis. Shared across instances (the builder keeps a
  // hidden Score tab mounted), so auto-runs don't fire duplicate AI calls.
  const key = jobDesc.value.trim() + '\n--\n' + cvText
  try {
    if (!atsCache.has(key)) {
      atsCache.set(key, analyse(cvText, jobDesc.value))
      atsCache.get(key).catch(() => atsCache.delete(key)) // don't cache failures
    }
    result.value = await atsCache.get(key)
  } catch (e) {
    error.value = 'Analysis failed. Please try again — make sure your CV has some content filled in.'
    console.error('ATS score error:', e)
  }
  scoring.value = false
}

async function analyse(cvText, job) {
    const prompt = `You are an expert ATS (Applicant Tracking System) analyser.

Compare this CV against the job description and return ONLY valid JSON with this exact structure:
{
  "score": 0-100,
  "matched": ["keyword1", "keyword2", "keyword3"],
  "missing": ["keyword1", "keyword2", "keyword3"],
  "gaps": ["gap description 1", "gap description 2"],
  "suggestions": ["specific action 1", "specific action 2", "specific action 3"]
}

Rules:
- score: percentage match (0-100) based on keyword overlap, experience relevance, skills match
- matched: keywords/skills from job description found in CV (max 12)
- missing: important keywords/skills in job description NOT in CV (max 8)
- gaps: specific experience or qualification gaps (max 4)
- suggestions: concrete actions to improve match — be specific, not generic (max 4)

CV:
${cvText.slice(0, 4000)}

JOB DESCRIPTION:
${job.slice(0, 4000)}

Return ONLY the JSON object, no markdown, no explanation.`

    const raw    = await store.callAi(prompt)
    const clean  = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1))
    const list   = v => Array.isArray(v) ? v.filter(x => typeof x === 'string') : []
    return {
      score:       Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
      matched:     list(parsed.matched),
      missing:     list(parsed.missing),
      gaps:        list(parsed.gaps),
      suggestions: list(parsed.suggestions),
    }
}

// Arriving from the Tailor step with a job offer: score straight away
onMounted(() => { if (jobDesc.value.trim().length >= 40) runScore() })
</script>

<style scoped>
.ats-wrap { display:flex; flex-direction:column; gap:14px; }
.ats-header { display:flex; align-items:center; gap:12px; }
.ats-icon { width:40px; height:40px; border-radius:10px; background:var(--c-accent-lt); color:var(--c-accent); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ats-title { font-size:15px; font-weight:700; color:var(--c-text); margin-bottom:2px; }
.ats-sub   { font-size:12px; color:var(--c-text3); }
.ats-textarea { width:100%; border:1.5px solid var(--c-border); border-radius:var(--radius); padding:10px 12px; font-size:13px; color:var(--c-text); background:var(--c-bg); font-family:inherit; resize:vertical; transition:border-color .15s; box-sizing:border-box; }
.ats-textarea:focus { outline:none; border-color:var(--c-accent); }
.ats-textarea:disabled { opacity:.6; }
.ats-btn { width:100%; justify-content:center; }
.ats-spin { animation:ats-spin .7s linear infinite; }
@keyframes ats-spin { to { transform:rotate(360deg); } }

/* Results */
.ats-results { display:flex; flex-direction:column; gap:16px; border-top:1px solid var(--c-border); padding-top:16px; }
.ats-score-row { display:flex; align-items:center; gap:18px; }
.ats-ring-wrap { position:relative; width:100px; height:100px; flex-shrink:0; }
.ats-ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.ats-ring-score { font-family:inherit;letter-spacing:-.01em; font-size:22px; font-weight:700; line-height:1; }
.ats-ring-lbl   { font-size:10px; color:var(--c-text3); margin-top:2px; }
.ats-score-info { flex:1; }
.ats-verdict    { font-size:18px; font-weight:700; margin-bottom:4px; }
.ats-verdict-sub { font-size:12.5px; color:var(--c-text2); line-height:1.5; margin-bottom:8px; }
.ats-chips { display:flex; gap:6px; }
.ats-chip { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }
.ats-chip.green { background:var(--c-green-lt); color:var(--c-green); }
.ats-chip.red   { background:var(--c-rose-lt);  color:var(--c-rose);  }

.ats-section { background:var(--c-bg); border:1px solid var(--c-border); border-radius:var(--radius); padding:14px; }
.ats-section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--c-text3); margin-bottom:10px; }
.ats-keywords { display:flex; flex-wrap:wrap; gap:6px; }
.ats-kw { display:inline-flex; align-items:center; gap:4px; font-size:11.5px; font-weight:600; padding:3px 10px; border-radius:20px; }
.ats-kw-match { background:var(--c-green-lt); color:var(--c-green); }
.ats-kw-miss  { background:var(--c-rose-lt);  color:var(--c-rose);  }
.ats-gap { display:flex; align-items:flex-start; gap:8px; font-size:12.5px; color:var(--c-text2); padding:6px 0; border-bottom:1px solid var(--c-border); line-height:1.5; }
.ats-gap:last-child { border-bottom:none; }
.ats-suggestion { display:flex; align-items:flex-start; gap:10px; font-size:12.5px; color:var(--c-text2); padding:6px 0; border-bottom:1px solid var(--c-border); line-height:1.5; }
.ats-suggestion:last-child { border-bottom:none; }
.ats-sug-num { width:20px; height:20px; border-radius:50%; background:var(--c-accent); color:#fff; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ats-error { background:var(--c-rose-lt); border:1px solid var(--c-rose); border-radius:var(--radius); padding:12px 14px; font-size:13px; color:var(--c-rose); }
</style>