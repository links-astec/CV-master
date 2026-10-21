<template>
  <div class="ced">
    <div class="ced-tabs">
      <div class="seg">
        <button v-for="t in TABS" :key="t.id" :class="{ active: tab === t.id }" @click="tab = t.id">{{ $t(t.label) }}</button>
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
            <span class="acc-title">{{ $t(s.label) }}</span>
            <span class="acc-meta">{{ s.meta() }}</span>
            <svg class="acc-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="open === s.id" class="acc-body">
            <component :is="s.comp" @ai-thinking="() => {}" @next="nextSection(s.id)" />
          </div>
        </div>
      </div>

      <div v-else-if="tab === 'design'"><DesignPanel /></div>

      <CoverLetter v-else-if="tab === 'letter'" @pay="$emit('pay')" />

      <JobMatch v-else @pay="$emit('pay')" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, provide, watch } from 'vue'
import { useCvStore } from '../stores/cv.js'
import DesignPanel from './DesignPanel.vue'
import StepPersonal from './wizard/StepPersonal.vue'
import StepSummary from './wizard/StepSummary.vue'
import StepExperience from './wizard/StepExperience.vue'
import StepSkills from './wizard/StepSkills.vue'
import StepEducation from './wizard/StepEducation.vue'
import JobMatch from './JobMatch.vue'
import CoverLetter from './CoverLetter.vue'
import { t } from '../i18n/index.js'

const emit = defineEmits(['pay', 'tab'])
const store = useCvStore()

const TABS = [
  { id: 'content', label: 'Content' },
  { id: 'design',  label: 'Design' },
  { id: 'job',     label: 'Job match' },
  { id: 'letter',  label: 'Letter' },
]
const tab = ref('content')
const open = ref('personal')
const bodyRef = ref(null)

const d = () => store.data
const count = (n, one, many) => n ? t(n === 1 ? one : many, { n }) : ''
const SECTIONS = [
  { id: 'personal',   label: 'Personal details', comp: StepPersonal,
    done: () => !!(d().fn && d().email), meta: () => [d().fn, d().ln].filter(Boolean).join(' ') },
  { id: 'summary',    label: 'Summary',          comp: StepSummary,
    done: () => (d().sum || '').length > 40, meta: () => d().sum ? t('{n} words', { n: d().sum.split(/\s+/).length }) : '' },
  { id: 'experience', label: 'Experience',       comp: StepExperience,
    done: () => d().experiences.some(e => e.title && e.desc), meta: () => count(d().experiences.filter(e => e.title || e.company).length, '{n} role', '{n} roles') },
  { id: 'skills',     label: 'Skills',           comp: StepSkills,
    done: () => d().skills.length >= 5, meta: () => count(d().skills.length, '{n} skill', '{n} skills') },
  { id: 'education',  label: 'Education, projects & languages', comp: StepEducation,
    done: () => d().education.some(e => e.degree || e.school), meta: () => count(d().education.filter(e => e.degree || e.school).length, '{n} entry', '{n} entries') },
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
provide('showEditorTab', show)
defineExpose({ show })
// The editor page widens for Design (bigger layout previews)
watch(tab, (t) => emit('tab', t), { immediate: true })
</script>

<style scoped>
.ced{display:flex;flex-direction:column;height:100%;min-height:0}
.ced-tabs{padding:14px 18px;border-bottom:1px solid var(--c-border);flex-shrink:0}
.ced-tabs .seg{display:flex;width:100%}
.ced-tabs .seg button{flex:1;white-space:nowrap;padding:0 6px;min-width:0}
@media (max-width:420px){ .ced-tabs{padding:12px 14px} .ced-tabs .seg button{font-size:12.5px} }
.ced-body{flex:1;overflow-y:auto;padding:18px;min-height:0}

/* Step components are reused here. Hide their wizard-style headings */
.ced-acc :deep(.step-intro),.ced-acc :deep(.step-title),.ced-acc :deep(.step-sub){display:none}

.acc{border:none;border-radius:20px;background:var(--c-surface);margin-bottom:12px;overflow:hidden;box-shadow:var(--shadow-xs);transition:box-shadow .3s var(--ease)}
.acc.open{box-shadow:var(--shadow)}
.acc-hd{width:100%;display:flex;align-items:center;gap:12px;padding:16px 18px;background:none;border:none;text-align:left;transition:background .2s var(--ease)}
.acc-hd:hover{background:color-mix(in srgb,var(--c-text) 2.5%,var(--c-surface))}
.acc-dot{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--c-border2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.acc-dot.done{background:var(--c-green);border-color:var(--c-green)}
.acc-dot svg{width:12px;height:12px;fill:none;stroke:#fff;stroke-width:3}
.acc-title{font-size:15px;font-weight:650;letter-spacing:-.015em;color:var(--c-text)}
.acc-meta{flex:1;text-align:right;font-size:12.5px;color:var(--c-text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.acc-chev{width:16px;height:16px;fill:none;stroke:var(--c-text3);stroke-width:2;flex-shrink:0;transition:transform .3s var(--ease)}
.acc.open .acc-chev{transform:rotate(180deg)}
.acc-body{padding:18px 18px 22px;border-top:1px solid var(--hair)}

</style>
