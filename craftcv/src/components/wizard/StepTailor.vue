<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">🎯</div>
      <h3>Tailor to the job</h3>
      <p>AI rewrites your CV in the language of the job offer so it ranks well in applicant tracking systems. It only rephrases what you've written — it never invents experience. You approve every change.</p>
    </div>

    <!-- Job offer -->
    <div class="f-grp">
      <div class="f-lbl">Job offer</div>
      <textarea class="f-ta" v-model="store.data.jobOffer" rows="6" :disabled="loading"
        placeholder="Paste the full job description here…"></textarea>
      <div class="f-hint" :class="{ warn: tooShort }">
        {{ !hasOffer ? 'No job offer yet? You can skip this and come back any time.'
          : tooShort ? 'Paste the full description — a few sentences at least.'
          : 'Your job offer is saved with this CV.' }}
      </div>
    </div>

    <button v-if="!proposal" class="btn-ai" @click="tailor" :disabled="loading || !hasOffer || tooShort">
      <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
      {{ loading ? 'Tailoring your CV…' : applied ? 'Tailor again' : 'Tailor my CV to this job' }}
    </button>

    <div v-if="loading" class="thinking">
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <div class="thinking-txt">Matching your CV to the job offer…</div>
    </div>

    <div v-if="error" class="tl-error">{{ error }}</div>

    <!-- Applied confirmation -->
    <div v-if="applied && !proposal" class="tl-applied">
      <div>✓ Applied {{ applied }} change{{ applied === 1 ? '' : 's' }}{{ targetTitle ? ` for “${targetTitle}”` : '' }}. Next, the ATS check scores your CV against this job.</div>
      <button class="btn-sug-dismiss" @click="undo">Undo</button>
    </div>

    <!-- Proposed changes -->
    <template v-if="proposal">
      <div class="tl-head">
        <div class="tl-head-ttl">Suggested changes{{ targetTitle ? ` for “${targetTitle}”` : '' }}</div>
        <button class="tl-link" @click="setAll(!allChecked)">{{ allChecked ? 'Untick all' : 'Tick all' }}</button>
      </div>

      <div v-if="!changes.length && !suggested.length" class="tl-empty">
        Your CV already matches this job well — there's nothing worth changing.
      </div>

      <label v-for="c in changes" :key="c.key" class="tl-change" :class="{ off: !c.checked }">
        <input type="checkbox" v-model="c.checked" />
        <div class="tl-change-body">
          <div class="tl-change-lbl">{{ c.label }}</div>
          <div class="tl-before"><span>Before</span>{{ c.before || '—' }}</div>
          <div class="tl-after"><span>After</span>{{ c.after }}</div>
        </div>
      </label>

      <div v-if="suggested.length" class="tl-skills">
        <div class="tl-change-lbl">Keywords from the job you could add</div>
        <div class="tl-skills-note">Only tick the ones you genuinely have — recruiters will ask about them.</div>
        <div class="tl-chips">
          <label v-for="s in suggested" :key="s.name" class="tl-chip" :class="{ on: s.checked }">
            <input type="checkbox" v-model="s.checked" /> {{ s.name }}
          </label>
        </div>
      </div>

      <div v-if="notes.length" class="tl-notes">
        <div class="tl-change-lbl">Worth knowing</div>
        <div v-for="(n, i) in notes" :key="i" class="tl-note">💡 {{ n }}</div>
      </div>

      <div class="ai-sug-actions tl-actions">
        <button class="btn-sug-use" :disabled="!selectedCount" @click="apply">
          Apply {{ selectedCount }} change{{ selectedCount === 1 ? '' : 's' }}
        </button>
        <button class="btn-sug-dismiss" @click="proposal = null">Discard</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path
const MIN_CHARS = 40 // same minimum the /api/ai/tailor endpoint enforces

const store = useCvStore()
const emit  = defineEmits(['next', 'ai-thinking'])

const loading     = ref(false)
const error       = ref('')
const proposal    = ref(null)   // raw server response while the user is reviewing
const changes     = ref([])     // [{ key, label, before, after, checked, apply() }]
const suggested   = ref([])     // [{ name, checked }]
const notes       = ref([])
const targetTitle = ref('')
const applied     = ref(0)
let   snapshot    = null        // CV fields before the last apply, for Undo

const hasOffer = computed(() => !!store.data.jobOffer?.trim())
const tooShort = computed(() => hasOffer.value && store.data.jobOffer.trim().length < MIN_CHARS)
const selectedCount = computed(() =>
  changes.value.filter(c => c.checked).length + suggested.value.filter(s => s.checked).length)
const allChecked = computed(() =>
  [...changes.value, ...suggested.value].every(c => c.checked))

function setAll(v) {
  changes.value.forEach(c => { c.checked = v })
  suggested.value.forEach(s => { s.checked = v })
}

async function tailor() {
  loading.value = true
  error.value   = ''
  emit('ai-thinking', true)
  try {
    const { photo, ...cv } = JSON.parse(JSON.stringify(store.data))
    const r = await fetch(apiUrl('/api/ai/tailor'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv, jobOffer: store.data.jobOffer }),
    })
    const p = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(p.error || 'Tailoring failed — please try again.')
    buildChanges(p)
    proposal.value = p
  } catch (e) {
    error.value = e.message
  }
  loading.value = false
  emit('ai-thinking', false)
}

function buildChanges(p) {
  const d   = store.data
  const out = []
  const differs = (a, b) => b && (a || '').trim() !== b.trim()

  if (differs(d.title, p.title)) {
    out.push({ key: 'title', label: 'Headline', before: d.title, after: p.title, checked: true,
      apply: () => { store.data.title = p.title } })
  }
  if (differs(d.sum, p.sum)) {
    out.push({ key: 'sum', label: 'Summary', before: d.sum, after: p.sum, checked: true,
      apply: () => { store.data.sum = p.sum } })
  }
  for (const e of p.experiences || []) {
    // Server returns the id we sent; fall back to the index among non-empty entries
    const nonEmpty = d.experiences.filter(x => x.title || x.company || x.desc)
    const exp = d.experiences.find(x => e.id != null && x.id === e.id) || nonEmpty[e.index]
    if (!exp || !differs(exp.desc, e.desc)) continue
    const id = exp.id
    out.push({ key: `exp-${id}`, label: [exp.title, exp.company].filter(Boolean).join(' at ') || 'Experience',
      before: exp.desc, after: e.desc, checked: true,
      apply: () => { const x = store.data.experiences.find(y => y.id === id); if (x) x.desc = e.desc } })
  }
  const order = p.skillsOrder || []
  if (order.length && order.join('|') !== d.skills.slice(0, order.length).join('|')) {
    out.push({ key: 'skills', label: 'Skills order (most relevant first)',
      before: d.skills.join(', '), after: mergeOrder(d.skills, order).join(', '), checked: true,
      apply: () => reorderSkills(order) })
  }

  changes.value     = out
  suggested.value   = (p.suggestedSkills || []).map(name => ({ name, checked: false }))
  notes.value       = p.notes || []
  targetTitle.value = p.jobTitle || ''
}

// Put the relevant skills first, keep the rest in their original order
function mergeOrder(skills, order) {
  const byLower = new Map(skills.map(s => [s.toLowerCase(), s]))
  const first   = order.map(s => byLower.get(s.toLowerCase())).filter(Boolean)
  const seen    = new Set(first)
  return [...new Set(first), ...skills.filter(s => !seen.has(s))]
}

function reorderSkills(order) {
  store.data.skills = mergeOrder(store.data.skills, order)
}

function apply() {
  const d = store.data
  snapshot = JSON.parse(JSON.stringify({
    title: d.title, sum: d.sum, experiences: d.experiences, skills: d.skills,
  }))
  let n = 0
  changes.value.filter(c => c.checked).forEach(c => { c.apply(); n++ })
  suggested.value.filter(s => s.checked).forEach(s => { store.addSkill(s.name); n++ })
  applied.value  = n
  proposal.value = null
}

function undo() {
  if (!snapshot) return
  Object.assign(store.data, snapshot)
  snapshot      = null
  applied.value = 0
}
</script>

<style scoped>
.step-intro{margin-bottom:20px;}
.step-icon{font-size:28px;margin-bottom:8px;}
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:inherit;letter-spacing:-.01em;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.f-hint.warn{color:var(--c-amber);}
.tl-error{background:var(--c-rose-lt);color:var(--c-rose);border-radius:var(--radius-sm);padding:10px 12px;font-size:12.5px;margin-bottom:10px;}
.tl-applied{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--c-green-lt);color:var(--c-green);border-radius:var(--radius-sm);padding:10px 12px;font-size:12.5px;font-weight:600;line-height:1.5;}
.tl-head{display:flex;align-items:center;justify-content:space-between;margin:6px 0 10px;}
.tl-head-ttl{font-size:13px;font-weight:700;color:var(--c-text);}
.tl-link{background:none;border:none;color:var(--c-accent);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;}
.tl-empty{font-size:12.5px;color:var(--c-text2);padding:10px 0;}
.tl-change{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--c-border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:8px;cursor:pointer;background:var(--c-surface);transition:opacity .15s;}
.tl-change.off{opacity:.55;}
.tl-change input{margin-top:3px;accent-color:var(--c-accent);flex-shrink:0;}
.tl-change-body{min-width:0;flex:1;}
.tl-change-lbl{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--c-text2);margin-bottom:6px;}
.tl-before,.tl-after{font-size:12px;line-height:1.55;white-space:pre-line;overflow-wrap:anywhere;padding:6px 8px;border-radius:6px;}
.tl-before{background:var(--c-bg);color:var(--c-text3);margin-bottom:4px;text-decoration:line-through;text-decoration-color:rgba(0,0,0,.2);}
.tl-after{background:var(--c-green-lt);color:var(--c-text);}
.tl-before span,.tl-after span{display:block;font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin-bottom:2px;text-decoration:none;}
.tl-skills,.tl-notes{border:1px solid var(--c-border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:8px;}
.tl-skills-note{font-size:11.5px;color:var(--c-amber);margin-bottom:8px;}
.tl-chips{display:flex;flex-wrap:wrap;gap:6px;}
.tl-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--c-border);border-radius:20px;padding:4px 10px;font-size:12px;cursor:pointer;color:var(--c-text2);}
.tl-chip.on{background:var(--c-accent-lt);border-color:var(--c-accent);color:var(--c-accent);font-weight:600;}
.tl-chip input{accent-color:var(--c-accent);margin:0;}
.tl-note{font-size:12px;color:var(--c-text2);line-height:1.5;margin-top:4px;}
.tl-actions{margin-top:6px;}
.btn-sug-use{background:var(--c-green);color:#fff;border:none;padding:7px 14px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;}
.btn-sug-use:disabled{opacity:.5;cursor:not-allowed;}
.btn-sug-dismiss{background:none;border:1px solid var(--c-border);padding:7px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;color:var(--c-text2);font-family:inherit;flex-shrink:0;}
.ai-sug-actions{display:flex;gap:8px;}
</style>
