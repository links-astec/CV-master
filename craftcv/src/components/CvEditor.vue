<template>
  <div class="ced">
    <div class="ced-tabs">
      <div class="seg">
        <button v-for="t in TABS" :key="t.id" :class="{ active: tab === t.id }" @click="tab = t.id">{{ t.label }}</button>
      </div>
    </div>

    <div class="ced-body" ref="bodyRef">
      <!-- CONTENT: one collapsible section per part of the CV -->
      <div v-if="tab === 'content'" class="ced-acc">
        <div v-for="s in SECTIONS" :key="s.id" class="acc" :class="{ open: open === s.id }">
          <button class="acc-hd" @click="toggle(s.id)" :aria-expanded="open === s.id">
            <span class="acc-dot" :class="{ done: s.done() }">
              <svg v-if="s.done()" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            <span class="acc-title">{{ s.label }}</span>
            <span class="acc-meta">{{ s.meta() }}</span>
            <svg class="acc-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="open === s.id" class="acc-body">
            <component :is="s.comp" @ai-thinking="() => {}" @next="nextSection(s.id)" />
          </div>
        </div>
      </div>

      <div v-else-if="tab === 'design'"><DesignPanel /></div>

      <div v-else class="ced-job">
        <StepTailor />
        <div class="ced-divider"></div>
        <StepReview @pay="$emit('pay')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, provide } from 'vue'
import { useCvStore } from '../stores/cv.js'
import DesignPanel from './DesignPanel.vue'
import StepPersonal from './wizard/StepPersonal.vue'
import StepSummary from './wizard/StepSummary.vue'
import StepExperience from './wizard/StepExperience.vue'
import StepSkills from './wizard/StepSkills.vue'
import StepEducation from './wizard/StepEducation.vue'
import StepTailor from './wizard/StepTailor.vue'
import StepReview from './wizard/StepReview.vue'

defineEmits(['pay'])
const store = useCvStore()

const TABS = [
  { id: 'content', label: 'Content' },
  { id: 'design',  label: 'Design' },
  { id: 'job',     label: 'Job & ATS' },
]
const tab = ref('content')
const open = ref('personal')
const bodyRef = ref(null)

const d = () => store.data
const count = (n, one, many) => n ? `${n} ${n === 1 ? one : many}` : ''
const SECTIONS = [
  { id: 'personal',   label: 'Personal details', comp: StepPersonal,
    done: () => !!(d().fn && d().email), meta: () => [d().fn, d().ln].filter(Boolean).join(' ') },
  { id: 'summary',    label: 'Summary',          comp: StepSummary,
    done: () => (d().sum || '').length > 40, meta: () => d().sum ? `${d().sum.split(/\s+/).length} words` : '' },
  { id: 'experience', label: 'Experience',       comp: StepExperience,
    done: () => d().experiences.some(e => e.title && e.desc), meta: () => count(d().experiences.filter(e => e.title || e.company).length, 'role', 'roles') },
  { id: 'skills',     label: 'Skills',           comp: StepSkills,
    done: () => d().skills.length >= 5, meta: () => count(d().skills.length, 'skill', 'skills') },
  { id: 'education',  label: 'Education, projects & languages', comp: StepEducation,
    done: () => d().education.some(e => e.degree || e.school), meta: () => count(d().education.filter(e => e.degree || e.school).length, 'entry', 'entries') },
]

function toggle(id) { open.value = open.value === id ? null : id }
function nextSection(id) {
  const i = SECTIONS.findIndex(s => s.id === id)
  open.value = SECTIONS[i + 1]?.id || null
}

// Review's "Fix →" buttons open the matching content section (index = wizard step)
provide('fixSection', (stepIndex) => {
  tab.value = 'content'
  open.value = SECTIONS[Math.min(stepIndex, SECTIONS.length - 1)].id
  nextTick(() => bodyRef.value?.scrollTo({ top: 0, behavior: 'smooth' }))
})

// Let parents jump to a tab (e.g. "Change design" in the preview toolbar)
function show(t) { tab.value = t; nextTick(() => bodyRef.value?.scrollTo({ top: 0 })) }
defineExpose({ show })
</script>

<style scoped>
.ced{display:flex;flex-direction:column;height:100%;min-height:0}
.ced-tabs{padding:14px 18px;border-bottom:1px solid var(--c-border);flex-shrink:0}
.ced-tabs .seg{display:flex;width:100%}
.ced-tabs .seg button{flex:1}
.ced-body{flex:1;overflow-y:auto;padding:18px;min-height:0}

/* Step components are reused here — hide their wizard-style headings */
.ced-acc :deep(.step-intro),.ced-acc :deep(.step-title),.ced-acc :deep(.step-sub){display:none}

.acc{border:1px solid var(--c-border);border-radius:12px;background:var(--c-surface);margin-bottom:10px;overflow:hidden;transition:box-shadow .15s}
.acc.open{box-shadow:var(--shadow-sm)}
.acc-hd{width:100%;display:flex;align-items:center;gap:11px;padding:13px 14px;background:none;border:none;text-align:left}
.acc-hd:hover{background:var(--c-surface2)}
.acc-dot{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--c-border2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.acc-dot.done{background:var(--c-green);border-color:var(--c-green)}
.acc-dot svg{width:12px;height:12px;fill:none;stroke:#fff;stroke-width:3}
.acc-title{font-size:14px;font-weight:600;color:var(--c-text)}
.acc-meta{flex:1;text-align:right;font-size:12.5px;color:var(--c-text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.acc-chev{width:16px;height:16px;fill:none;stroke:var(--c-text3);stroke-width:2;flex-shrink:0;transition:transform .15s}
.acc.open .acc-chev{transform:rotate(180deg)}
.acc-body{padding:4px 16px 18px;border-top:1px solid var(--c-border);padding-top:16px}

.ced-divider{height:1px;background:var(--c-border);margin:26px 0}
</style>
