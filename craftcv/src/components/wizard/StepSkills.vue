<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">⚡</div>
      <h3>{{ $t('Skills') }}</h3>
      <p>{{ $t('Add your core skills. AI can suggest relevant ones based on your role.') }}</p>
    </div>

    <!-- Which group the box adds to -->
    <div class="seg sk-kind" role="radiogroup" :aria-label="$t('Kind of skill')">
      <button type="button" role="radio" :class="{ active: kind === 'tech' }" :aria-checked="kind === 'tech'" @click="kind = 'tech'">{{ $t('Technical') }}</button>
      <button type="button" role="radio" :class="{ active: kind === 'soft' }" :aria-checked="kind === 'soft'" @click="kind = 'soft'">{{ $t('Soft skills') }}</button>
    </div>

    <div class="skill-input-row">
      <input
        class="f-inp" v-model="newSkill"
        :placeholder="$t(kind === 'soft' ? 'A soft skill, such as Teamwork. Press Enter' : 'Type a skill and press Enter, or paste a list')"
        @keydown.enter="addSkill"
        @input="splitTyped"
        @paste="pasteList"
        style="flex:1;"
      />
      <button class="btn-add-skill" @click="addSkill">{{ $t('Add') }}</button>
    </div>
    <!-- A pasted list was sorted into technical and soft (and is being checked against the job offer) -->
    <p v-if="sortNote" class="sk-note" role="status">{{ sortNote }}</p>

    <!-- Both groups; ⇄ moves a skill to the other one -->
    <div v-for="g in GROUPS" :key="g.kind" class="sk-group">
      <div class="sk-group-h">{{ $t(g.label) }} <small>{{ (store.data[g.list] || []).length }}</small></div>
      <div class="skill-wrap">
        <TransitionGroup name="skill-tag">
          <span v-for="s in store.data[g.list] || []" :key="s" class="skill-tag">
            {{ s }}
            <button type="button" class="skill-mv" :title="$t(g.kind === 'soft' ? 'Move to technical' : 'Move to soft skills')" :aria-label="$t(g.kind === 'soft' ? 'Move to technical' : 'Move to soft skills')" @click="store.moveSkill(s, g.kind)">
              <svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>
            </button>
            <button class="skill-rm" @click="store.removeSkill(s, g.kind)" :aria-label="$t('Remove {name}', { name: s })">×</button>
          </span>
        </TransitionGroup>
        <div v-if="!(store.data[g.list] || []).length" class="empty-skills">{{ $t(g.kind === 'soft' ? 'None yet. Optional: shown as their own group on the CV' : 'No skills added yet') }}</div>
      </div>
    </div>

    <!-- Skills that don't help for this job: suggested for removal, the person decides -->
    <div v-if="unfitShown.length" class="sk-fit">
      <div class="sk-fit-h">
        <b>{{ $t('Not needed for this job?') }}</b>
        <button v-if="unfitShown.length > 1" type="button" class="sk-fit-all" @click="unfitShown.forEach(dropSkill)">{{ $t('Remove all') }}</button>
      </div>
      <p class="sk-fit-sub">{{ $t('These don’t seem to help for the job you’re applying for. Remove them to keep your skills focused, or keep the ones you want.') }}</p>
      <div v-for="u in unfitShown" :key="u.name" class="sk-fit-row">
        <span class="sk-fit-k"><b>{{ u.name }}</b><small v-if="u.why">{{ u.why }}</small></span>
        <button type="button" class="sk-fit-keep" @click="keepSkill(u)">{{ $t('Keep') }}</button>
        <button type="button" class="sk-fit-rm" @click="dropSkill(u)">{{ $t('Remove') }}</button>
      </div>
    </div>

    <div v-if="aiLoading" class="thinking" style="margin-top:14px;">
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <div class="thinking-txt">{{ $t('Finding relevant skills for your role…') }}</div>
    </div>

    <div v-if="suggested.length || suggestedSoft.length" class="suggested-block">
      <div class="sug-label">💡 {{ $t('AI Suggestions, click to add') }}</div>
      <template v-for="g in GROUPS" :key="g.kind">
        <template v-if="(g.kind === 'soft' ? suggestedSoft : suggested).length">
          <div class="sug-sub">{{ $t(g.label) }}</div>
          <div class="sug-chips">
            <button
              v-for="s in (g.kind === 'soft' ? suggestedSoft : suggested)" :key="s"
              class="sug-chip"
              :class="{ added: has(s) }"
              @click="addSuggested(s, g.kind)"
            >{{ s }}</button>
          </div>
        </template>
      </template>
      <button class="btn-add-all" @click="addAll">{{ $t('Add all') }}</button>
    </div>

    <button class="btn-ai" @click="suggestSkills" :disabled="aiLoading" style="margin-top:14px;">
      <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
      {{ $t(aiLoading ? 'Suggesting…' : 'Suggest Skills with AI') }}
    </button>

    <button v-if="hasOffer && allSkills.length" type="button" class="sk-fit-check" :disabled="fitBusy" @click="checkFit()">
      {{ $t(fitBusy ? 'Checking your skills…' : 'Check my skills against the job offer') }}
    </button>
    <p v-if="fitDone" class="sk-note sk-note-ok" role="status">{{ $t('All your skills fit this job.') }}</p>

    <div class="skill-count">
      <span :class="{ warn: store.data.skills.length < 5, ok: store.data.skills.length >= 5 }">
        {{ $t(store.data.skills.length === 1 ? '{n} skill' : '{n} skills', { n: store.data.skills.length }) }}
      </span>
      · {{ $t('6–12 recommended') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useCvStore, splitSkills } from '../../stores/cv.js'
import { isSoftSkill } from '../../composables/skillKinds.js'
import { lang, t } from '../../i18n/index.js'

const store = useCvStore()
const showToast = inject('showToast', null)
const emit = defineEmits(['next', 'ai-thinking'])

const GROUPS = [{ kind: 'tech', list: 'skills', label: 'Technical' }, { kind: 'soft', list: 'softSkills', label: 'Soft skills' }]
const kind      = ref('tech')   // the group the box adds to
const newSkill  = ref('')
const aiLoading = ref(false)
const suggested = ref([])
const suggestedSoft = ref([])

const allSkills = computed(() => [...(store.data.skills || []), ...(store.data.softSkills || [])])
const has = (s) => allSkills.value.some(x => x.toLowerCase() === s.toLowerCase())
const hasOffer = computed(() => (store.data.jobOffer || '').trim().length >= 80)

// Each skill goes to its group by itself: a soft skill (teamwork, leadership…) to Soft skills, anything else to
// the group chosen above, or to Technical for a pasted list. ⇄ moves one that landed in the wrong place.
const autoSorted = new Set()   // sorted here, not placed by the person: the job check may correct these
function addSorted(text, list = false) {
  const added = []
  for (const s of splitSkills(text)) {
    if (has(s)) continue
    const k = isSoftSkill(s) ? 'soft' : list ? 'tech' : kind.value
    store.addSkill(s, k)
    if (list) autoSorted.add(s.toLowerCase())
    added.push({ name: s, kind: k })
  }
  return added
}
const sortNote = ref('')
let noteTimer = null
function note(text) { sortNote.value = text; clearTimeout(noteTimer); noteTimer = setTimeout(() => { sortNote.value = '' }, 7000) }

function addSkill() {
  const v = newSkill.value.trim()
  if (v) { addSorted(v); newSkill.value = '' }
}
// A comma (or ; | •) typed after a skill adds it; what comes after stays in the box
function splitTyped() {
  const parts = newSkill.value.split(/[,;|\u2022]/)
  if (parts.length < 2) return
  newSkill.value = parts.pop().replace(/^\s+/, '')
  addSorted(parts.join(','))
}
// A pasted list goes in all at once ("Python, SQL, Figma" or one per line), sorted into technical and soft,
// then (with a job offer) checked against the job
function pasteList(e) {
  const text = e.clipboardData?.getData('text') || ''
  if (!/[,;|\n\t\u2022\u00b7]/.test(text.trim())) return
  e.preventDefault()
  const added = addSorted(newSkill.value + ',' + text, true)
  newSkill.value = ''
  if (added.length < 2) return
  const soft = added.filter(a => a.kind === 'soft').length
  note(t('Sorted {n} skills: {t} technical, {s} soft.', { n: added.length, t: added.length - soft, s: soft }) + (hasOffer.value ? ' ' + t('Checking them against the job offer…') : ''))
  if (hasOffer.value) checkFit(added.map(a => a.name))
}

// The job check: the AI says which skills are soft and which don't help for this job. Kinds are corrected only
// for skills sorted automatically; removal is only suggested. "Keep" is remembered on the CV.
const unfit = ref([])          // [{ name, why }]
const fitBusy = ref(false), fitDone = ref(false)
const keptKey = (name) => 'skill-keep:' + name.toLowerCase()
const unfitShown = computed(() => unfit.value.filter(u => has(u.name) && !(store.data.checkIgnored || []).includes(keptKey(u.name))))
async function checkFit(names = null) {
  fitBusy.value = true; fitDone.value = false
  try {
    const { skills = [] } = await store.aiWrite('skillsFit', { check: names || allSkills.value, uiLang: lang.value })
    for (const x of skills) {
      if (!autoSorted.has(x.name.toLowerCase())) continue
      const now = (store.data.softSkills || []).includes(x.name) ? 'soft' : 'tech'
      if (now !== (x.kind === 'soft' ? 'soft' : 'tech')) store.moveSkill(x.name, now)
    }
    const drop = skills.filter(x => !x.fit).map(x => ({ name: x.name, why: x.why }))
    unfit.value = [...unfit.value.filter(u => !skills.some(x => x.name === u.name)), ...drop]
    if (!names) fitDone.value = !unfitShown.value.length
    if (names && sortNote.value) {
      const kept = names.filter(has), soft = kept.filter(n => (store.data.softSkills || []).includes(n)).length
      note(t('Sorted {n} skills: {t} technical, {s} soft.', { n: kept.length, t: kept.length - soft, s: soft }))
    }
  } catch (e) {
    showToast?.(t(e?.message || 'AI is unavailable right now. Please try again in a moment.'))
  }
  fitBusy.value = false
}
function dropSkill(u) { store.removeSkill(u.name, (store.data.softSkills || []).includes(u.name) ? 'soft' : 'tech') }
function keepSkill(u) { store.data.checkIgnored = [...new Set([...(store.data.checkIgnored || []), keptKey(u.name)])] }
function addSuggested(s, k = 'tech') {
  if (!has(s)) store.addSkill(s, k)
}
function addAll() {
  suggested.value.forEach(s => addSuggested(s, 'tech'))
  suggestedSoft.value.forEach(s => addSuggested(s, 'soft'))
}

async function suggestSkills() {
  aiLoading.value = true
  emit('ai-thinking', true)
  try {
    // The server uses the job offer (if any) and what the CV already says, and skips skills already listed;
    // technical and soft skills come back apart
    const { skills, soft } = await store.aiWrite('skills')
    const fresh = (list) => (list || []).filter(s => typeof s === 'string' && !has(s))
    suggested.value = fresh(skills)
    suggestedSoft.value = fresh(soft)
  } catch (e) {
    showToast?.(e?.message || 'AI is unavailable right now. Please try again in a moment.')
  }
  aiLoading.value = false
  emit('ai-thinking', false)
}
</script>

<style scoped>
.step-intro { margin-bottom: 20px; }
.step-icon  { font-size: 28px; margin-bottom: 8px; }
h3 { font-size: 18px; font-weight: 700; color: var(--c-text); margin-bottom: 5px; font-family:inherit;letter-spacing:-.01em; }
p  { font-size: 13px; color: var(--c-text2); line-height: 1.5; }

.skill-input-row { display: flex; gap: 8px; }
.btn-add-skill {
  background: var(--c-accent); color: #fff; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 12.5px; font-weight: 600; cursor: pointer;
  font-family:inherit; white-space: nowrap;
}
.empty-skills { font-size: 12.5px; color: var(--c-text3); padding: 8px 0; }

/* Skill level sliders */
.skill-level-row   { display: flex; align-items: center; gap: 7px; margin-bottom: 9px; }
.skill-level-name  { font-size: 11px; color: var(--c-text2); min-width: 90px; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0; }
.skill-level-range { flex: 1; min-width: 0; accent-color: var(--c-accent); cursor: pointer; }
.skill-level-num   { width: 40px; border: 1px solid var(--c-border); border-radius: 4px; padding: 2px 4px; font-size: 11px; font-weight: 700; color: var(--c-accent); text-align: center; background: var(--c-bg); flex-shrink: 0; font-family:inherit; }
.skill-level-num:focus { outline: none; border-color: var(--c-accent); }

.suggested-block { background: var(--c-surface2); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 14px; margin-top: 14px; }
.sug-label  { font-size: 10.5px; font-weight: 700; color: var(--c-amber); margin-bottom: 10px; }
.sug-chips  { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.sug-chip {
  background: var(--c-amber-lt); border: 1px solid #f0c080; color: var(--c-amber);
  font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px;
  cursor: pointer; font-family:inherit; transition: all .14s;
}
.sug-chip:hover { background: var(--c-amber); color: #fff; border-color: var(--c-amber); }
.sug-chip.added { background: var(--c-green-lt); border-color: var(--c-green); color: var(--c-green); }
.btn-add-all { background: none; border: none; font-size: 11.5px; font-weight: 700; color: var(--c-accent); cursor: pointer; font-family:inherit; text-decoration: underline; }

.skill-count { font-size: 12px; color: var(--c-text3); margin-top: 10px; }
/* Technical / soft: which group the box adds to, then both groups */
.sk-kind { margin-bottom: 10px; }
.sk-note { font-size: 12.5px; color: var(--c-text2); margin-top: 8px; line-height: 1.45; }
.sk-note-ok { color: var(--c-green); font-weight: 600; }
/* skills that don't help for this job */
.sk-fit { margin-top: 16px; padding: 12px 14px; border-radius: 14px; background: var(--c-surface); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c-amber) 55%, var(--c-border)); }
.sk-fit-h { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.sk-fit-h b { font-size: 13.5px; font-weight: 650; color: var(--c-text); }
.sk-fit-all { border: none; background: none; padding: 0; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--c-rose); cursor: pointer; }
.sk-fit-sub { font-size: 12.5px; color: var(--c-text2); margin: 3px 0 6px; }
.sk-fit-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-top: 1px solid var(--hair); }
.sk-fit-k { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.sk-fit-k b { font-size: 13.5px; font-weight: 600; color: var(--c-text); }
.sk-fit-k small { font-size: 12px; color: var(--c-text3); line-height: 1.4; }
.sk-fit-keep, .sk-fit-rm { border: none; background: none; padding: 4px 0; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; flex-shrink: 0; }
.sk-fit-keep { color: var(--c-text3); }
.sk-fit-rm { color: var(--c-rose); }
.sk-fit-check { display: block; margin-top: 12px; border: none; background: none; padding: 0; font: inherit; font-size: 13px; font-weight: 600; color: var(--c-accent); cursor: pointer; }
.sk-fit-check:disabled { color: var(--c-text3); cursor: default; }
.sk-group { margin-top: 16px; }
.sk-group-h { display: flex; align-items: baseline; gap: 8px; font-size: 12.5px; font-weight: 700; color: var(--c-text); }
.sk-group-h small { font-size: 12px; font-weight: 500; color: var(--c-text3); }
.sk-group .skill-wrap { margin-top: 8px; }
.skill-mv { width: 22px; height: 22px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; border: none; background: none; padding: 0; color: var(--c-text3); cursor: pointer; }
.skill-mv svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.skill-mv:hover { background: var(--c-accent-lt); color: var(--c-accent); }
.sug-sub { font-size: 11.5px; font-weight: 600; color: var(--c-text2); margin: 2px 0 6px; }
.skill-count .warn { color: var(--c-amber); font-weight: 700; }
.skill-count .ok   { color: var(--c-green);  font-weight: 700; }
.skill-tag-enter-active, .skill-tag-leave-active { transition: all .2s ease; }
.skill-tag-enter-from, .skill-tag-leave-to { opacity: 0; transform: scale(.8); }
</style>