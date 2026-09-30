<template>
  <div class="ck">
    <div class="ck-hd">
      <div class="ck-ttl">{{ todo.length ? `${todo.length} thing${todo.length === 1 ? '' : 's'} to fix` : 'Your CV is complete' }}</div>
      <div class="ck-count">{{ passed.length }}/{{ rules.length }} checks passed</div>
    </div>
    <div class="ck-bar"><div :style="{ width: (passed.length / rules.length * 100) + '%' }"></div></div>

    <div v-if="lastFix" class="ck-fixed" :class="{ still: lastFix.still }">
      <span v-if="!lastFix.still">✓ Fixed: {{ lastFix.title }}</span>
      <span v-else>Changes applied, but this still needs you: {{ lastFix.still }}</span>
      <button class="btn-ghost btn-sm" @click="undoFix">Undo</button>
    </div>

    <div v-if="!todo.length" class="ck-good">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      Every check passed — contact details, summary, experience, skills and education are all in place.
    </div>

    <div v-for="r in todo" :key="r.id" class="ck-item" :class="r.severity">
      <span class="ck-dot"></span>
      <div class="ck-body">
        <div class="ck-item-ttl">{{ r.title }}</div>
        <div class="ck-item-txt">{{ r.text }}</div>
      </div>
      <div class="ck-acts">
        <button v-if="aiFix(r)" class="btn-secondary btn-sm ck-ai" @click="fixRef.start(aiFix(r), r.title, r.id)">
          <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
          Fix with AI
        </button>
        <button v-else-if="r.stepIndex !== undefined" class="btn-secondary btn-sm" @click="fixStep(r.stepIndex)">Add</button>
        <button v-if="r.severity === 'warn'" class="ck-ignore" title="Hide this suggestion for this CV" @click="ignore(r.id)">Ignore</button>
      </div>
    </div>

    <AiFixModal ref="fixRef" @applied="onFixed" />

    <button v-if="passed.length" class="ck-toggle" @click="showPassed = !showPassed">
      {{ showPassed ? 'Hide' : 'Show' }} the {{ passed.length }} passed check{{ passed.length === 1 ? '' : 's' }}
    </button>
    <ul v-if="showPassed" class="ck-passed">
      <li v-for="r in passed" :key="r.id">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ r.title }}
      </li>
    </ul>
    <div v-if="ignoredList.length" class="ck-ignored">
      Ignored: <span v-for="r in ignoredList" :key="r.id">{{ r.title }} <button @click="unignore(r.id)">Undo</button></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useCvStore } from '../../stores/cv.js'
import AiFixModal from '../AiFixModal.vue'

const store = useCvStore()
defineEmits(['next'])
const showPassed = ref(false)

// A real figure anywhere in the text (not a year, not an unfilled [X%] placeholder)
const PLACEHOLDER = /\[[^\]\n]{0,12}\b[XN]\b[^\]\n]{0,12}\]/g
const hasMetric = (t) => /\d/.test(String(t || '').replace(PLACEHOLDER, '').replace(/\b(19|20)\d{2}\b/g, ''))

// ── RULES ENGINE ─────────────────────────────────────────────────────────────
// Each rule: { id, category, severity('error'|'warn'|'pass'), title, text, tip?, points, stepIndex? }
const rules = computed(() => {
  const d = store.data
  const exp = d.experiences || []
  // Blank entries aren't printed on the CV, so they don't count against it
  const roles = exp.filter(e => e.title || e.company || e.desc)
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
      severity: roles.length === 0 ? 'error' : roles.every(e => e.desc && e.desc.length > 30) ? 'pass' : 'warn',
      title: roles.length === 0 ? 'No experience' : roles.every(e => e.desc?.length > 30) ? 'All roles have descriptions' : 'Some roles lack descriptions',
      text: roles.length === 0 ? 'Add experience entries.' : roles.every(e => e.desc?.length > 30) ? 'Good — descriptions help ATS and recruiters.' : 'Add bullet-point descriptions to every role. Describe responsibilities and achievements.',
      tip: 'Use the format: [Action verb] + [task] + [result/metric]',
      stepIndex: 2,
    },
    {
      id: 'exp-metrics', cat: 'Experience', points: 10,
      severity: roles.length === 0 ? 'error' : roles.some(e => hasMetric(e.desc)) ? 'pass' : 'warn',
      title: roles.some(e => hasMetric(e.desc)) ? 'Quantified achievements found' : 'No quantified achievements',
      text: roles.some(e => hasMetric(e.desc)) ? 'Numbers make your CV stand out to recruiters.' : 'Add metrics to your experience: "Grew revenue by 40%", "Managed a team of 8", "Reduced costs by £50K".',
      tip: 'CVs with numbers get 40% more callbacks according to recruiter surveys.',
      stepIndex: 2,
    },
    {
      id: 'exp-periods', cat: 'Experience', points: 5,
      severity: roles.length === 0 ? 'error' : roles.every(e => e.period) ? 'pass' : 'warn',
      title: roles.every(e => e.period) ? 'All roles have dates' : 'Some roles missing dates',
      text: roles.every(e => e.period) ? 'Date ranges show career progression clearly.' : 'Add start/end dates to every role. Gaps are noticed by ATS systems.',
      stepIndex: 2,
    },

    // AI "quantify" leaves [X%] / [N] placeholders instead of inventing numbers — they
    // must be filled in (or removed) before the CV is sent anywhere
    (() => {
      const texts = [d.sum, ...exp.map(e => e.desc)].filter(Boolean).join(' ')
      const found = [...new Set(texts.match(/\[[^\]\n]{0,12}\b[XN]\b[^\]\n]{0,12}\]/g) || [])]
      return {
        id: 'placeholders', cat: 'Experience', points: 10,
        severity: found.length ? 'error' : 'pass',
        title: found.length ? `Placeholders to fill in: ${found.slice(0, 4).join(' ')}` : 'No placeholders left',
        text: found.length ? 'Replace these with your real numbers, or delete them — they will print on your CV as they are.' : 'Every figure on your CV is filled in.',
        stepIndex: 2,
      }
    })(),

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


// Warnings the user chose to ignore for this CV (saved with it)
const ignored = computed(() => new Set(store.data.checkIgnored || []))
const isIgnored = (r) => r.severity === 'warn' && ignored.value.has(r.id)
function ignore(id)   { store.data.checkIgnored = [...new Set([...(store.data.checkIgnored || []), id])] }
function unignore(id) { store.data.checkIgnored = (store.data.checkIgnored || []).filter(x => x !== id) }
const ignoredList = computed(() => rules.value.filter(isIgnored))

const todo   = computed(() => rules.value.filter(r => r.severity !== 'pass' && !isIgnored(r))
  .sort((a, b) => (a.severity === 'error' ? 0 : 1) - (b.severity === 'error' ? 0 : 1)))
const passed = computed(() => rules.value.filter(r => r.severity === 'pass'))

// ── AI FIXES ────────────────────────────────────────────────────────────────
// Issues the AI can fix from what's already on the CV. Facts only the user knows
// (contact details, dates, employers, education) get "Add", which opens the section.
const fixRef  = ref(null)
const lastFix = ref(null)   // { title, snapshot } for Undo
const hasExp  = () => (store.data.experiences || []).some(e => e.title || e.company)
const hasText = () => hasExp() || (store.data.sum || '').length > 20
const AI_FIX = {
  'title':            () => hasText() && 'title',
  'summary-exists':   () => hasText() && 'summary',
  'summary-length':   () => hasText() && 'summary',
  'exp-descriptions': () => hasExp() && 'descriptions',
  'exp-metrics':      () => (store.data.experiences || []).some(e => (e.desc || '').length > 20) && 'metrics',
  'placeholders':     () => 'placeholders',
  'skills-count':     () => hasText() && 'skills',
}
const aiFix = (r) => AI_FIX[r.id]?.() || null
// After applying, re-check that exact item and say plainly if it still needs the user
function onFixed({ title, snapshot, ruleId }) {
  const r = rules.value.find(x => x.id === ruleId)
  lastFix.value = { title, snapshot, still: r && r.severity !== 'pass' ? r.text : '' }
}
function undoFix() {
  if (!lastFix.value) return
  Object.assign(store.data, lastFix.value.snapshot)
  lastFix.value = null
}

// In the editor, "Add" opens the matching section; in the wizard it jumps to that step
const fixSection = inject('fixSection', null)
function fixStep(stepIndex) {
  if (fixSection) fixSection(stepIndex)
  else store.openWizardAtStep(stepIndex)
}
</script>

<style scoped>
.ck{display:flex;flex-direction:column;gap:8px}
.ck-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.ck-ttl{font-size:14px;font-weight:700;color:var(--c-text)}
.ck-count{font-size:12px;color:var(--c-text3);white-space:nowrap}
.ck-bar{height:6px;border-radius:99px;background:var(--c-border);overflow:hidden;margin-bottom:6px}
.ck-bar div{height:100%;border-radius:99px;background:var(--c-green);transition:width .4s ease}
.ck-good{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;background:var(--c-green-lt);color:var(--c-text);font-size:13px;line-height:1.5}
.ck-good svg{width:16px;height:16px;flex-shrink:0;margin-top:2px;fill:none;stroke:var(--c-green);stroke-width:3}
.ck-item{display:flex;align-items:center;gap:12px;padding:11px 12px;border:1px solid var(--c-border);border-radius:10px;background:var(--c-surface)}
.ck-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:var(--c-amber)}
.ck-item.error .ck-dot{background:var(--c-rose)}
.ck-body{flex:1;min-width:0}
.ck-item-ttl{font-size:13px;font-weight:600;color:var(--c-text)}
.ck-item-txt{font-size:12px;color:var(--c-text2);line-height:1.5;margin-top:2px}
.ck-acts{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.ck-ignore{background:none;border:none;padding:0 2px;font-size:11.5px;color:var(--c-text3)}
.ck-ignore:hover{color:var(--c-text)}
.ck-fixed.still{background:var(--c-amber-lt);color:var(--c-amber)}
.ck-ignored{font-size:12px;color:var(--c-text3);line-height:1.7}
.ck-ignored span{margin-right:10px}
.ck-ignored button{background:none;border:none;padding:0;font-size:12px;color:var(--c-accent);font-weight:600}
.ck-ai svg{width:12px;height:12px;fill:var(--c-accent);stroke:none}
.ck-fixed{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 8px 8px 12px;border-radius:10px;background:var(--c-green-lt);color:var(--c-green);font-size:12.5px;font-weight:600}
.ck-toggle{align-self:flex-start;background:none;border:none;padding:4px 0;font-size:12.5px;font-weight:600;color:var(--c-accent)}
.ck-passed{list-style:none;display:flex;flex-direction:column;gap:6px;padding:2px 0 0}
.ck-passed li{display:flex;gap:8px;align-items:center;font-size:12.5px;color:var(--c-text2)}
.ck-passed svg{width:13px;height:13px;flex-shrink:0;fill:none;stroke:var(--c-green);stroke-width:3}
</style>
