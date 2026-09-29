<template>
  <Teleport to="body">
    <Transition name="wiz-fade">
      <div v-if="store.wizardOpen" class="wiz-backdrop">
        <div class="wiz">

          <!-- ── MODE PICKER ── -->
          <div v-if="!store.wizardMode" class="wiz-pick">
            <button class="icon-btn wiz-x" @click="handleClose" aria-label="Close">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="wiz-pick-in">
              <h2>How would you like to start?</h2>
              <p>You can edit everything afterwards, and nothing is ever added without you seeing it.</p>
              <div class="wiz-modes">
                <button v-for="m in MODES" :key="m.id" class="wiz-mode" @click="store.setMode(m.id)">
                  <span class="wiz-mode-ic"><svg viewBox="0 0 24 24" v-html="m.icon"></svg></span>
                  <span class="wiz-mode-name">{{ m.name }}</span>
                  <span class="wiz-mode-desc">{{ m.desc }}</span>
                  <span class="wiz-mode-tag">{{ m.tag }}</span>
                </button>
              </div>
              <div v-if="store.data.jobOffer" class="notice info wiz-offer">
                <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                <span>Job offer saved — you'll tailor your CV to it near the end.</span>
              </div>
            </div>
          </div>

          <!-- ── STEPS ── -->
          <div v-else class="wiz-body">
            <section class="wiz-panel">
              <header class="wiz-hd">
                <button class="icon-btn" @click="handleClose" aria-label="Close">
                  <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div class="wiz-hd-mid">
                  <div class="wiz-hd-lbl">Step {{ store.wizardStep + 1 }} of {{ steps.length }} · <strong>{{ steps[store.wizardStep]?.label }}</strong></div>
                  <div class="wiz-progress"><div :style="{ width: ((store.wizardStep + 1) / steps.length * 100) + '%' }"></div></div>
                </div>
                <span class="badge">{{ modeLabel }}</span>
              </header>

              <div class="wiz-content" ref="panelBody">
                <Transition :name="stepDir > 0 ? 'slide-left' : 'slide-right'" mode="out-in">
                  <component :is="currentStepComp" :key="store.wizardStep" @next="handleNext" @ai-thinking="v => aiThinking = v" @pay="payFromWizard" />
                </Transition>
              </div>

              <footer class="wiz-ft">
                <button class="btn-secondary" @click="handleBack">Back</button>
                <button v-if="store.wizardStep < steps.length - 1" class="btn-primary accent" @click="handleNext" :disabled="aiThinking">
                  {{ nextLabel }}
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button v-else class="btn-primary accent" @click="finish">Open in editor</button>
              </footer>
            </section>

            <!-- Live preview (desktop) -->
            <section class="wiz-preview">
              <div class="wiz-pv-bar">
                <div class="wiz-pv-layout">
                  <button class="icon-btn" @click="shiftLayout(-1)" aria-label="Previous layout"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
                  <span>{{ layoutName }}</span>
                  <button class="icon-btn" @click="shiftLayout(1)" aria-label="Next layout"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>
                </div>
                <div class="wiz-pv-colors">
                  <button v-for="t in THEMES" :key="t.id" class="wiz-sw" :class="{ active: current.theme === t.id }"
                          :style="{ '--sw': t.accent }" :title="t.name" :aria-label="t.name" @click="setTheme(t.id)"></button>
                </div>
              </div>
              <div class="wiz-pv-canvas" @click="handlePreviewClick">
                <CvPreview :template="store.template" :data="store.data" :fmt="store.fmt" :padding="56"
                           v-model:fitAccepted="store.data.shrinkToFit" />
              </div>
              <Transition name="fade"><div v-if="editToast" class="wiz-edit-toast">{{ editToast }}</div></Transition>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, defineAsyncComponent } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { LAYOUTS, THEMES, parseTemplate, templateId, getLayout } from '../composables/cvRenderer.js'
import CvPreview from './CvPreview.vue'

const StepPersonal   = defineAsyncComponent(() => import('./wizard/StepPersonal.vue'))
const StepSummary    = defineAsyncComponent(() => import('./wizard/StepSummary.vue'))
const StepExperience = defineAsyncComponent(() => import('./wizard/StepExperience.vue'))
const StepSkills     = defineAsyncComponent(() => import('./wizard/StepSkills.vue'))
const StepEducation  = defineAsyncComponent(() => import('./wizard/StepEducation.vue'))
const JobMatch       = defineAsyncComponent(() => import('./JobMatch.vue'))
const StepNarrate    = defineAsyncComponent(() => import('./wizard/StepNarrate.vue'))
const StepUpload     = defineAsyncComponent(() => import('./wizard/StepUpload.vue'))

const store = useCvStore()
const emit = defineEmits(['open-builder', 'pay'])

const MODES = [
  { id: 'manual',  name: 'Step by step', tag: 'Guided',   desc: 'Fill in each section with AI help along the way.',
    icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>' },
  { id: 'narrate', name: 'Tell your story', tag: 'AI',    desc: 'Type or speak about your career — AI turns it into a CV.',
    icon: '<path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>' },
  { id: 'upload',  name: 'Import a CV', tag: 'PDF · Word', desc: 'Upload your current CV and we extract everything.',
    icon: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' },
]

const aiThinking = ref(false)
const stepDir    = ref(1)
const panelBody  = ref(null)
const editToast  = ref('')

const manualSteps  = [
  { label: 'Personal',   comp: StepPersonal },
  { label: 'Summary',    comp: StepSummary },
  { label: 'Experience', comp: StepExperience },
  { label: 'Skills',     comp: StepSkills },
  { label: 'Education',  comp: StepEducation },
  { label: 'Job match',  comp: JobMatch },
]
const narrateSteps = [{ label: 'Your story', comp: StepNarrate }, ...manualSteps]
const uploadSteps  = [{ label: 'Import',     comp: StepUpload },  ...manualSteps]

const steps = computed(() => store.wizardMode === 'narrate' ? narrateSteps : store.wizardMode === 'upload' ? uploadSteps : manualSteps)
const currentStepComp = computed(() => steps.value[store.wizardStep]?.comp || StepPersonal)
const modeLabel = computed(() => MODES.find(m => m.id === store.wizardMode)?.name || 'Wizard')
const nextLabel = computed(() => {
  const next = steps.value[store.wizardStep + 1]?.label
  return next ? `Next: ${next}` : 'Next'
})

// Layout / colour quick controls
const current    = computed(() => parseTemplate(store.template))
const layoutName = computed(() => getLayout(current.value.layout)?.name)
function shiftLayout(dir) {
  const i = LAYOUTS.findIndex(l => l.id === current.value.layout)
  store.template = templateId(LAYOUTS[(i + dir + LAYOUTS.length) % LAYOUTS.length].id, current.value.theme)
}
function setTheme(id) { store.template = templateId(current.value.layout, id) }

function scrollTop() { nextTick(() => panelBody.value?.scrollTo({ top: 0, behavior: 'smooth' })) }
function handleNext() {
  stepDir.value = 1
  if (store.wizardStep < steps.value.length - 1) store.nextStep()
  scrollTop()
}
function handleBack() {
  stepDir.value = -1
  if (store.wizardStep === 0) store.wizardMode = null
  else store.prevStep()
  scrollTop()
}
async function handleClose() {
  await store.saveDraft()
  store.closeWizard()
}
async function finish() {
  await store.saveDraft()
  store.closeWizard()
  emit('open-builder')
}
// Job match step's "Export PDF" button
async function payFromWizard() {
  await store.saveDraft()
  store.closeWizard()
  emit('pay')
}

// Click a section of the preview to jump to the step that edits it
const SECTION_STEP = { hd: 0, contact: 0, profile: 1, experience: 2, skills: 3, education: 4, projects: 4, languages: 4, certifications: 4 }
const STEP_NAME = ['Personal', 'Summary', 'Experience', 'Skills', 'Education']
let toastTimer
function handlePreviewClick(e) {
  const el = e.target.closest('.sec, .hd')
  if (!el) return
  const key = el.classList.contains('hd') ? 'hd' : ([...el.classList].find(c => c.startsWith('s-')) || '').slice(2)
  const step = SECTION_STEP[key]
  if (step === undefined) return
  const offset = store.wizardMode === 'manual' ? 0 : 1
  stepDir.value = 1
  store.wizardStep = Math.min(step + offset, steps.value.length - 1)
  scrollTop()
  clearTimeout(toastTimer)
  editToast.value = `Editing: ${STEP_NAME[step]}`
  toastTimer = setTimeout(() => { editToast.value = '' }, 1800)
}

watch(() => store.wizardOpen, v => { document.body.style.overflow = v ? 'hidden' : '' })
</script>

<style scoped>
.wiz-backdrop{position:fixed;inset:0;z-index:7000;background:rgba(15,15,25,.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px}
.wiz{width:100%;max-width:1240px;height:min(860px,calc(100vh - 40px));background:var(--c-surface);border-radius:20px;box-shadow:var(--shadow-xl);overflow:hidden;display:flex;border:1px solid var(--c-border)}
.wiz-fade-enter-active,.wiz-fade-leave-active{transition:opacity .2s}
.wiz-fade-enter-from,.wiz-fade-leave-to{opacity:0}

/* Mode picker */
.wiz-pick{flex:1;position:relative;display:flex;align-items:center;justify-content:center;padding:40px;overflow:auto;background:radial-gradient(900px 400px at 50% -10%,var(--c-accent-lt),transparent 70%)}
.wiz-x{position:absolute;top:16px;right:16px}
.wiz-pick-in{max-width:820px;width:100%;text-align:center}
.wiz-pick-in h2{font-size:28px;font-weight:700;letter-spacing:-.025em}
.wiz-pick-in > p{color:var(--c-text2);margin-top:8px;font-size:15px}
.wiz-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px}
.wiz-mode{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:22px;border-radius:16px;border:1px solid var(--c-border);background:var(--c-surface);text-align:left;box-shadow:var(--shadow-xs);transition:border-color .15s,box-shadow .15s,transform .15s}
.wiz-mode:hover{border-color:var(--c-accent);box-shadow:0 0 0 3px var(--c-accent-ring);transform:translateY(-2px)}
.wiz-mode-ic{width:42px;height:42px;border-radius:12px;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center;margin-bottom:6px}
.wiz-mode-ic svg{width:21px;height:21px;fill:none;stroke:var(--c-accent);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.wiz-mode-name{font-size:16px;font-weight:600;color:var(--c-text)}
.wiz-mode-desc{font-size:13.5px;color:var(--c-text2);line-height:1.5;flex:1}
.wiz-mode-tag{font-size:12px;font-weight:600;color:var(--c-accent);margin-top:6px}
.wiz-offer{margin:22px auto 0;max-width:520px;text-align:left}

/* Steps */
.wiz-body{flex:1;display:flex;min-width:0}
.wiz-panel{width:470px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid var(--c-border);min-height:0}
.wiz-hd{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--c-border)}
.wiz-hd-mid{flex:1;min-width:0}
.wiz-hd-lbl{font-size:13px;color:var(--c-text2);margin-bottom:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wiz-hd-lbl strong{color:var(--c-text);font-weight:600}
.wiz-progress{height:4px;border-radius:4px;background:var(--c-surface2);overflow:hidden}
.wiz-progress div{height:100%;background:var(--c-accent);border-radius:4px;transition:width .3s}
.wiz-content{flex:1;overflow-y:auto;padding:26px 26px 30px;min-height:0}
.wiz-ft{display:flex;justify-content:space-between;gap:10px;padding:14px 18px;border-top:1px solid var(--c-border);background:var(--c-surface)}
.wiz-ft svg{width:15px;height:15px}

.wiz-preview{flex:1;min-width:0;display:flex;flex-direction:column;background:var(--c-canvas);position:relative}
.wiz-pv-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-bottom:1px solid var(--c-border);background:var(--c-surface)}
.wiz-pv-layout{display:flex;align-items:center;gap:4px;font-size:13.5px;font-weight:600}
.wiz-pv-layout span{min-width:74px;text-align:center}
.wiz-pv-colors{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.wiz-sw{width:18px;height:18px;border-radius:50%;border:none;background:var(--sw);box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.wiz-sw.active{box-shadow:0 0 0 2px var(--c-surface),0 0 0 3.5px var(--sw)}
.wiz-pv-canvas{flex:1;overflow:auto;padding:24px 20px 40px;cursor:pointer}
.wiz-edit-toast{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);background:#111827;color:#fff;padding:8px 14px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:var(--shadow-lg);pointer-events:none}

.slide-left-enter-active,.slide-left-leave-active,.slide-right-enter-active,.slide-right-leave-active{transition:opacity .16s,transform .16s}
.slide-left-enter-from{opacity:0;transform:translateX(14px)}
.slide-left-leave-to{opacity:0;transform:translateX(-14px)}
.slide-right-enter-from{opacity:0;transform:translateX(-14px)}
.slide-right-leave-to{opacity:0;transform:translateX(14px)}
.fade-enter-active,.fade-leave-active{transition:opacity .2s}
.fade-enter-from,.fade-leave-to{opacity:0}

@media (max-width:980px){
  .wiz-preview{display:none}
  .wiz-panel{width:100%;border-right:none}
}
@media (max-width:768px){
  .wiz-backdrop{padding:0}
  .wiz{height:100%;max-height:none;border-radius:0}
  .wiz-modes{grid-template-columns:1fr}
  .wiz-pick{padding:56px 18px 24px;align-items:flex-start}
  .wiz-pick-in h2{font-size:23px}
  .wiz-content{padding:20px 18px 24px}
}
</style>
