<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">🎓</div>
      <h3>{{ $t('Education, projects & languages') }}</h3>
      <p>{{ $t('Add your qualifications, personal projects, certifications, and languages.') }}</p>
    </div>

    <!-- EDUCATION -->
    <div class="f-sec-hd">
      {{ $t('Education') }}
    </div>
    <div v-if="eduOutOfOrder" class="order-note">
      <span>{{ $t('Your qualifications aren’t in date order. Put the most recent first.') }}</span>
      <button class="btn-secondary btn-sm" @click="sortByDate(store.data.education, 'year')">{{ $t('Sort by date') }}</button>
    </div>
    <div class="edu-list">
      <div v-for="(edu, i) in store.data.education" :key="i" class="edu-card" v-bind="roEdu.card(i)">
        <div class="edu-card-hd">
          <ReorderControls v-if="store.data.education.length > 1" :index="i" :total="store.data.education.length"
            @move="d => roEdu.move(i, i + d)" @arm="roEdu.arm(i)" @disarm="roEdu.disarm()" />
          <span class="edu-num">{{ $t('Qualification {n}', { n: i + 1 }) }}</span>
          <button v-if="store.data.education.length > 1" class="item-rm" @click="store.data.education.splice(i, 1)">{{ $t('Remove') }}</button>
        </div>
        <div class="f-grp">
          <div class="f-lbl">{{ $t('Degree / Qualification') }}</div>
          <ProofField kind="degree" class="f-inp" v-model="edu.degree" :placeholder="$t('MSc Product Management')" />
        </div>
        <div class="f-row edu-row">
          <div class="f-grp">
            <div class="f-lbl">{{ $t('School / University') }}</div>
            <input class="f-inp" v-model="edu.school" :placeholder="$t('UCL')" />
          </div>
          <div class="f-grp edu-when">
            <div class="f-lbl">{{ $t('Year') }}</div>
            <PeriodField v-model="edu.year" placeholder="2016" />
          </div>
        </div>
      </div>
    </div>
    <button class="add-btn add-exp-btn" @click="store.data.education.push({ degree: '', school: '', year: '' })">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {{ $t('Add Another Qualification') }}
    </button>

    <!-- PROJECTS -->
    <div class="f-sec-hd">
      {{ $t('Projects') }} <span class="opt-badge">{{ $t('optional') }}</span>
    </div>
    <p class="f-sec-sub">{{ $t('Great for developers, designers, or anyone with side projects worth showcasing.') }}</p>
    <div class="proj-list">
      <div v-for="(proj, i) in store.data.projects" :key="proj.id" class="proj-card" v-bind="roProj.card(i)">
        <div class="proj-card-hd">
          <ReorderControls v-if="store.data.projects.length > 1" :index="i" :total="store.data.projects.length"
            @move="d => roProj.move(i, i + d)" @arm="roProj.arm(i)" @disarm="roProj.disarm()" />
          <span class="proj-num">{{ $t('Project {n}', { n: i + 1 }) }}</span>
          <button class="item-rm" @click="store.data.projects.splice(i, 1)">{{ $t('Remove') }}</button>
        </div>
        <div class="f-grp">
          <div class="f-lbl">{{ $t('Project Name') }}</div>
          <input class="f-inp" v-model="proj.name" :placeholder="$t('e.g. Portfolio Website, Open Source Tool')" />
        </div>
        <div class="f-grp">
          <div class="f-lbl">{{ $t('Tech / Stack') }} <span class="opt-badge">{{ $t('optional') }}</span></div>
          <input class="f-inp" v-model="proj.tech" :placeholder="$t('e.g. Vue, Node.js, PostgreSQL')" />
        </div>
        <div class="f-grp">
          <div class="f-lbl">{{ $t('Description') }}</div>
          <ProofField multiline kind="bullets" class="f-inp f-area" v-model="proj.desc" :placeholder="$t('What did you build? What problem did it solve? Any key results?')" rows="2" />
          <div class="proj-ai">
            <button type="button" class="proj-ai-btn" :disabled="quantifyIdx === i || !(proj.name || proj.desc)" @click="quantifyProject(i)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              {{ $t(quantifyIdx === i ? 'Enhancing…' : 'Quantify with AI') }}
            </button>
            <button v-if="hasPlaceholders(proj.desc)" type="button" class="fill-nums" @click="openMetrics(i, proj.desc)">{{ $t(countPlaceholders(proj.desc) === 1 ? 'Fill in 1 number' : 'Fill in {n} numbers', { n: countPlaceholders(proj.desc) }) }}</button>
          </div>
        </div>
        <div class="f-grp">
          <div class="f-lbl">{{ $t('URL') }} <span class="opt-badge">{{ $t('optional') }}</span></div>
          <input class="f-inp" v-model="proj.url" placeholder="https://github.com/you/project" />
        </div>
      </div>
    </div>
    <button class="add-btn add-exp-btn" @click="addProject">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {{ $t('Add Project') }}
    </button>

    <!-- CERTIFICATIONS -->
    <div class="f-sec-hd">
      {{ $t('Certifications') }} <span class="opt-badge">{{ $t('optional') }}</span>
    </div>
    <div class="cert-list">
      <div v-for="(cert, i) in store.data.certifications" :key="i" class="cert-row">
        <input class="f-inp" v-model="store.data.certifications[i]" :placeholder="$t('e.g. AWS Certified, PMP, PSPO II')" />
        <button class="rm-btn" @click="store.data.certifications.splice(i, 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <button class="add-btn add-exp-btn" @click="store.data.certifications.push('')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {{ $t('Add Certification') }}
    </button>

    <!-- LANGUAGES -->
    <div class="f-sec-hd">
      {{ $t('Languages') }} <span class="opt-badge">{{ $t('optional') }}</span>
    </div>
    <div class="lang-list">
      <!-- One card per language: the name with its remove button, then the level as chips (tap again to clear) -->
      <div v-for="(lang, i) in store.data.languages" :key="i" class="lang-card">
        <div class="lang-top">
          <input class="f-inp lang-name" v-model="lang.name" :aria-label="$t('Language')"
            :placeholder="$t(store.data.lang === 'fr' ? 'e.g. English' : 'e.g. French')" />
          <button class="rm-btn lang-rm" :aria-label="$t('Remove')" @click="store.data.languages.splice(i, 1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <!-- Short chips (Native, C2 … A1) in one row; the full wording of the chosen level is shown
             beside the label. The level is printed on the CV, so its wording follows the CV's language -->
        <div class="f-lbl lang-lbl">{{ $t('Level') }}<span v-if="lang.level" class="lang-cur">{{ lang.level }}</span></div>
        <div class="lang-levels" role="radiogroup" :aria-label="$t('Level')">
          <button v-for="lv in levels" :key="lv" type="button" class="lang-lv" role="radio" :title="lv" :aria-label="lv"
            :class="{ on: lang.level === lv }" :aria-checked="lang.level === lv"
            @click="lang.level = lang.level === lv ? '' : lv">{{ shortLevel(lv) }}</button>
        </div>
      </div>
    </div>
    <button class="add-btn add-exp-btn" @click="store.data.languages.push({ name: '', level: '' })">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {{ $t('Add Language') }}
    </button>
    <MetricsModal :text="metrics.text" @apply="applyMetrics" @close="metrics.text = ''" />
</div>
</template>

<script setup>
import { computed, ref, reactive, inject } from 'vue'
import { useCvStore } from '../../stores/cv.js'
import ProofField from '../ProofField.vue'
import { useReorder, isOutOfOrder, sortByDate } from '../../composables/reorder.js'
import ReorderControls from '../ReorderControls.vue'
import PeriodField from '../PeriodField.vue'
import MetricsModal from '../MetricsModal.vue'
import { hasPlaceholders, countPlaceholders } from '../../composables/metrics.js'
const store = useCvStore()
const roEdu  = useReorder(() => store.data.education)
const roProj = useReorder(() => store.data.projects)
const showToast = inject('showToast', null)
// Projects: AI bullet points, and the real numbers where it marked [X%] / [N]
const quantifyIdx = ref(null)
const metrics = reactive({ idx: null, text: '' })
function openMetrics(i, text) { metrics.idx = i; metrics.text = text }
function applyMetrics(text) { const p = store.data.projects[metrics.idx]; if (p) p.desc = text; metrics.text = '' }
async function quantifyProject(i) {
  quantifyIdx.value = i
  try {
    const { result } = await store.aiWrite('bullets', { index: i, kind: 'project' })
    const text = (result || '').trim()
    if (hasPlaceholders(text)) openMetrics(i, text)
    else if (text) { store.data.projects[i].desc = text; showToast?.('Project rewritten as bullet points.') }
  } catch (e) { showToast?.(e?.message || 'AI is unavailable right now. Please try again in a moment.') }
  quantifyIdx.value = null
}
const eduOutOfOrder = computed(() => isOutOfOrder(store.data.education, 'year'))
const LEVELS = {
  en: ['Native', 'Fluent (C2)', 'Advanced (C1)', 'Upper-Intermediate (B2)', 'Intermediate (B1)', 'Basic (A2)', 'Beginner (A1)'],
  fr: ['Langue maternelle', 'Bilingue (C2)', 'Courant (C1)', 'Avancé (B2)', 'Intermédiaire (B1)', 'Notions (A2)', 'Débutant (A1)'],
}
const levels = computed(() => LEVELS[store.data.lang === 'fr' ? 'fr' : 'en'])
// "Upper-Intermediate (B2)" → "B2"; "Native" / "Langue maternelle" stay as they are
const shortLevel = (lv) => (lv.match(/\(([ABC][12])\)/) || [, lv])[1]
defineEmits(['next'])

// Ensure all arrays exist and education is array
if (!Array.isArray(store.data.education) || store.data.education.length === 0) {
  const old = store.data.education
  store.data.education = (old && !Array.isArray(old) && old.degree !== undefined)
    ? [old]
    : [{ degree: '', school: '', year: '' }]
}
if (!Array.isArray(store.data.projects))      store.data.projects = []
if (!Array.isArray(store.data.certifications)) store.data.certifications = []
if (!Array.isArray(store.data.languages))      store.data.languages = []

function addProject() {
  store.data.projects.push({ id: Date.now(), name: '', desc: '', url: '', tech: '' })
}
</script>

<style scoped>
.step-intro { margin-bottom: 20px; }
.step-icon  { font-size: 28px; margin-bottom: 8px; }
h3  { font-size: 18px; font-weight: 700; color: var(--c-text); margin-bottom: 5px; font-family:inherit;letter-spacing:-.01em; }
p   { font-size: 13px; color: var(--c-text2); line-height: 1.5; }

.f-sec-hd {
  font-size: 13px; font-weight: 700; color: var(--c-text);
  margin: 20px 0 6px; display: flex; align-items: center; gap: 8px;
}
.f-sec-sub { font-size: 12px; color: var(--c-text3); margin: -4px 0 10px; }

.opt-badge {
  font-size: 9.5px; font-weight: 600; color: var(--c-text3);
  background: var(--c-bg); padding: 1px 6px; border-radius: 20px;
}

/* Education cards */
.edu-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
.edu-card { background: var(--c-surface2); border: 1px solid var(--hair); border-radius: var(--radius); padding: 16px; }
.edu-card-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.edu-card-hd .item-rm, .proj-card-hd .item-rm { margin-left: auto; }
.edu-card.ro-dragging, .proj-card.ro-dragging { opacity: .45; }
.edu-card.ro-over, .proj-card.ro-over { border-color: var(--c-accent); box-shadow: 0 -3px 0 var(--c-accent); }
.order-note { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; background: var(--c-amber-lt); border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 12.5px; color: var(--c-text); line-height: 1.45; }
.edu-num, .proj-num { font-size: 13px; font-weight: 650; color: var(--c-accent); letter-spacing: -.005em; }

/* Project cards */
.proj-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
.proj-card { background: var(--c-surface2); border: 1px solid var(--hair); border-radius: var(--radius); padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.proj-card-hd {
  display: flex; align-items: center; gap: 8px;
}


/* Certifications */
.cert-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.cert-row  { display: flex; align-items: center; gap: 6px; }

/* Languages */
.lang-list   { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
.lang-card   { background: var(--c-surface2); border: 1px solid var(--hair); border-radius: var(--radius); padding: 16px; }
.lang-top    { display: flex; align-items: center; gap: 8px; }
.lang-name   { flex: 1; min-width: 0; }
.lang-rm     { flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; }
.lang-lbl    { margin: 12px 0 7px; display: flex; align-items: baseline; gap: 8px; }
.lang-cur    { font-weight: 500; color: var(--c-accent); }
.lang-levels { display: flex; flex-wrap: wrap; gap: 6px; }
.lang-lv {
  height: 32px; min-width: 42px; justify-content: center; padding: 0 11px; border-radius: 99px; border: none; cursor: pointer;
  background: var(--c-surface); box-shadow: inset 0 0 0 1px var(--hair);
  font: inherit; font-size: 12.5px; font-weight: 500; color: var(--c-text2);
  display: inline-flex; align-items: center; transition: background .15s, color .15s, box-shadow .15s;
}
.lang-lv:hover { color: var(--c-text); box-shadow: inset 0 0 0 1px var(--c-accent); }
.lang-lv:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }
.lang-lv.on { background: var(--c-accent); color: #fff; font-weight: 600; box-shadow: none; }

/* Remove button */
.item-rm { background: none; border: none; padding: 0; font: inherit; font-size: 11.5px; font-weight: 600; color: var(--c-rose); cursor: pointer; }
.item-rm:hover { text-decoration: underline; }
.rm-btn {
  flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px;
  background: none; border: none;
  color: var(--c-text3); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all .15s;
}
.rm-btn svg { width: 13px; height: 13px; }
.rm-btn:hover { background: var(--c-rose-lt); border-color: var(--c-rose); color: var(--c-rose); }

/* Add button */
.add-exp-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; border: 2px dashed var(--c-border); border-radius: var(--radius); font-size: 12.5px; font-weight: 600; color: var(--c-text2); cursor: pointer; background: none; font-family: inherit; transition: all .14s; margin-bottom: 4px; }
.add-exp-btn svg { width: 14px !important; height: 14px !important; stroke: currentColor; fill: none; stroke-width: 2; }
.add-exp-btn:hover { border-color: var(--c-accent); color: var(--c-accent); background: var(--c-accent-lt); }

.f-select { cursor: pointer; }
.f-area   { resize: vertical; min-height: 60px; }
.edu-when{flex:0 0 200px}
@media (max-width:560px){ .edu-when{flex:1 1 100%} }
.proj-ai{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:6px}
.proj-ai-btn{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 12px;border:none;border-radius:99px;background:color-mix(in srgb,var(--c-accent) 10%,transparent);color:var(--c-accent);font:inherit;font-size:12.5px;font-weight:600;cursor:pointer}
.proj-ai-btn:disabled{opacity:.5;cursor:default}
.proj-ai-btn svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2}
.fill-nums{border:none;background:none;padding:4px 0;font:inherit;font-size:12.5px;font-weight:600;color:var(--c-amber,#b45309);cursor:pointer}
.edu-row{grid-template-columns:minmax(0,1fr) 170px}
@media (max-width:560px){ .edu-row{grid-template-columns:1fr} }
/* the card decides: two columns when it is wide enough, one under the other when it is not (narrow editor panel) */
.edu-card{container-type:inline-size}
@container (max-width:460px){ .edu-row{grid-template-columns:1fr} }
</style>