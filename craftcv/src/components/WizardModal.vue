<template>
  <Teleport to="body">
    <Transition name="wiz-fade">
      <div v-if="store.wizardOpen" class="wiz-backdrop">
        <div class="wiz">

          <!-- ── 1 · JOB OFFER FIRST (paste it, or skip) ── -->
          <div v-if="!store.wizardMode && store.wizardAskOffer" class="wiz-pick">
            <button class="icon-btn wiz-x" @click="handleClose" :aria-label="$t('Close')">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="wiz-jo-wrap"><JobOfferForm :initial="store.data.jobOffer" @use="useOffer" @skip="skipOffer" /></div>
          </div>

          <!-- ── 2 · HOW TO START ── -->
          <div v-else-if="!store.wizardMode" class="wiz-pick">
            <button class="icon-btn wiz-x" @click="handleClose" :aria-label="$t('Close')">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="wiz-pick-in">
              <h2>{{ $t('How would you like to start?') }}</h2>
              <p>{{ $t('You can edit everything afterwards, and nothing is ever added without you seeing it.') }}</p>
              <div class="wiz-modes">
                <button v-for="m in MODES" :key="m.id" class="wiz-mode" :class="{ featured: m.featured }" @click="store.setMode(m.id)">
                  <span v-if="m.featured" class="wiz-mode-rec">{{ $t('Fastest') }}</span>
                  <span class="wiz-mode-ic"><svg viewBox="0 0 24 24" v-html="m.icon"></svg></span>
                  <span class="wiz-mode-name">{{ $t(m.name) }}</span>
                  <span class="wiz-mode-desc">{{ $t(m.desc) }}</span>
                  <span class="wiz-mode-tag">{{ $t(m.tag) }}</span>
                </button>
              </div>
              <div class="wiz-offer" :class="{ on: store.data.jobOffer }">
                <span class="wiz-offer-dot" aria-hidden="true"></span>
                <span>{{ $t(store.data.jobOffer ? 'Job offer added. The AI uses it as you go, and you check your ATS score at the end.' : 'No job offer yet. You can add one at the end, in Job match.') }}</span>
                <button class="link-btn" @click="store.wizardAskOffer = true">{{ $t(store.data.jobOffer ? 'Change' : 'Add one now') }}</button>
              </div>
            </div>
          </div>

          <!-- ── STEPS ── -->
          <div v-else class="wiz-body">
            <section class="wiz-panel">
              <header class="wiz-hd">
                <button class="icon-btn" @click="handleClose" :aria-label="$t('Close')">
                  <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div class="wiz-hd-mid">
                  <div class="wiz-hd-lbl">{{ $t('Step {n} of {total}', { n: store.wizardStep + 1, total: steps.length }) }} · <strong>{{ $t(steps[store.wizardStep]?.label) }}</strong></div>
                  <div class="wiz-progress"><div :style="{ width: ((store.wizardStep + 1) / steps.length * 100) + '%' }"></div></div>
                </div>
                <CvLangPicker />
                <span class="badge wiz-mode-badge">{{ $t(modeLabel) }}</span>
              </header>

              <div class="wiz-content" ref="panelBody">
                <Transition :name="stepDir > 0 ? 'slide-left' : 'slide-right'" mode="out-in">
                  <component :is="currentStepComp" :key="store.wizardStep" @next="handleNext" @ai-thinking="v => aiThinking = v" @pay="payFromWizard" />
                </Transition>
              </div>

              <footer class="wiz-ft">
                <button class="btn-secondary" @click="handleBack">{{ $t('Back') }}</button>
                <button v-if="store.wizardStep < steps.length - 1" class="btn-primary accent" @click="handleNext" :disabled="aiThinking">
                  {{ nextLabel }}
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button v-else class="btn-primary accent" @click="finish">{{ $t('Open in editor') }}</button>
              </footer>
            </section>

            <!-- Live preview (desktop) -->
            <section class="wiz-preview">
              <div class="wiz-pv-bar">
                <div class="wiz-pv-layout">
                  <button class="icon-btn" @click="shiftLayout(-1)" :aria-label="$t('Previous layout')"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
                  <span>{{ $t(layoutName) }}</span>
                  <button class="icon-btn" @click="shiftLayout(1)" :aria-label="$t('Next layout')"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>
                </div>
                <div class="wiz-pv-colors">
                  <button v-for="t in THEMES" :key="t.id" class="wiz-sw" :class="{ active: current.theme === t.id }"
                          :style="{ '--sw': t.accent }" :title="$t(t.name)" :aria-label="$t(t.name)" @click="setTheme(t.id)"></button>
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
import { ref, computed, watch, nextTick, defineAsyncComponent, inject } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { LAYOUTS, THEMES, parseTemplate, templateId, getLayout } from '../composables/cvRenderer.js'
import CvPreview from './CvPreview.vue'
import JobOfferForm from './JobOfferForm.vue'
import { t } from '../i18n/index.js'
import { guestEvent } from '../composables/track.js'
import CvLangPicker from './CvLangPicker.vue'

const StepPersonal   = defineAsyncComponent(() => import('./wizard/StepPersonal.vue'))
const StepSummary    = defineAsyncComponent(() => import('./wizard/StepSummary.vue'))
const StepExperience = defineAsyncComponent(() => import('./wizard/StepExperience.vue'))
const StepSkills     = defineAsyncComponent(() => import('./wizard/StepSkills.vue'))
const StepEducation  = defineAsyncComponent(() => import('./wizard/StepEducation.vue'))
const JobMatch       = defineAsyncComponent(() => import('./JobMatch.vue'))
const StepNarrate    = defineAsyncComponent(() => import('./wizard/StepNarrate.vue'))
const StepUpload     = defineAsyncComponent(() => import('./wizard/StepUpload.vue'))

const store = useCvStore()
const confirm = inject('confirm', null)
// A new CV with a few details but nothing substantial yet: keep it in My CVs, or discard it?
// (dismissing the question keeps it, so nothing is lost by accident)
async function keepOrDiscard() {
  if (!store.needsKeepDecision || !confirm) return 'none'
  const discard = await confirm({ title: t('Keep this CV?'), message: t('It only has a few details so far. Keep it in My CVs, or discard it?'), ok: t('Discard'), cancel: t('Keep it'), mode: 'danger' })
  if (!discard) await store.saveDraft({ force: true })
  return discard ? 'discard' : 'keep'
}
const emit = defineEmits(['open-builder', 'pay'])

// "Tell your story" first and highlighted: the quickest way to a full CV
const MODES = [
  { id: 'narrate', name: 'Tell your story', tag: 'AI', featured: true, desc: 'Type or speak about your career. AI turns it into a CV.',
    icon: '<path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>' },
  { id: 'manual',  name: 'Step by step', tag: 'Guided',   desc: 'Fill in each section with AI help along the way.',
    icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>' },
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
  return next ? t('Next: {step}', { step: t(next) }) : t('Next')
})

// Layout / colour quick controls
const current    = computed(() => parseTemplate(store.template))
const layoutName = computed(() => getLayout(current.value.layout)?.name)
function shiftLayout(dir) {
  const i = LAYOUTS.findIndex(l => l.id === current.value.layout)
  store.template = templateId(LAYOUTS[(i + dir + LAYOUTS.length) % LAYOUTS.length].id, current.value.theme)
}
function setTheme(id) { store.template = templateId(current.value.layout, id) }

// The job offer screen (first, before choosing how to start)
function afterOffer() {
  store.wizardAskOffer = false
  if (store.wizardStart) { store.setMode(store.wizardStart); store.wizardStart = null }
}
function useOffer(offer) {
  if (offer !== (store.data.jobOffer || '').trim()) store.data.jobTailored = ''
  store.data.jobOffer = offer
  if (offer) guestEvent('job_offer')
  afterOffer()
}
function skipOffer() {
  if (store.data.jobOffer) store.data.jobTailored = ''
  store.data.jobOffer = ''
  afterOffer()
}

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
  if (await keepOrDiscard() === 'discard') store.resetData()
  else await store.saveDraft()
  store.closeWizard()
}
async function finish() {
  await store.saveDraft()
  store.closeWizard()
  emit('open-builder')
}
// Job match step's "Export PDF" button
async function payFromWizard() {
  await store.saveDraft({ force: true })
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
  editToast.value = t('Editing: {step}', { step: t(STEP_NAME[step]) })
  toastTimer = setTimeout(() => { editToast.value = '' }, 1800)
}

watch(() => store.wizardOpen, v => { document.body.style.overflow = v ? 'hidden' : '' })
// Guest statistics: a CV started, and whether it was with Tell your story
watch(() => store.wizardMode, m => { if (!m) return; guestEvent('cv_started'); if (m === 'narrate') guestEvent('story') })
</script>

<style scoped>
.wiz-backdrop{position:fixed;inset:0;z-index:7000;background:rgba(15,15,25,.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px}
.wiz{width:100%;max-width:1240px;height:min(860px,calc(100vh - 40px));background:var(--c-surface);border-radius:28px;box-shadow:var(--shadow-xl);overflow:hidden;display:flex;border:1px solid var(--hair)}
.wiz-fade-enter-active,.wiz-fade-leave-active{transition:opacity .2s}
.wiz-fade-enter-from,.wiz-fade-leave-to{opacity:0}

/* Mode picker */
.wiz-pick{flex:1;position:relative;display:flex;align-items:center;justify-content:center;padding:40px;overflow:auto;background:var(--c-bg)}
.wiz-x{position:absolute;top:16px;right:16px}
.wiz-pick-in{max-width:820px;width:100%;text-align:center}
.wiz-pick-in h2{font-size:32px;font-weight:700;letter-spacing:-.035em;line-height:1.1}
.wiz-pick-in > p{color:var(--c-text2);margin-top:10px;font-size:16px}
.wiz-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px}
.wiz-mode{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:26px 24px;border-radius:22px;border:none;background:var(--c-surface);text-align:left;box-shadow:inset 0 0 0 2px transparent;transition:box-shadow .2s ease,transform .2s ease}
.wiz-mode:hover{box-shadow:inset 0 0 0 2px var(--c-text);transform:translateY(-2px)}
.wiz-mode-ic{width:44px;height:44px;border-radius:50%;background:var(--fill);display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.wiz-mode-ic svg{width:21px;height:21px;fill:none;stroke:var(--c-text);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.wiz-mode-name{font-size:18px;font-weight:650;letter-spacing:-.015em;color:var(--c-text)}
.wiz-mode-desc{font-size:14.5px;color:var(--c-text2);line-height:1.5;flex:1}
.wiz-mode-tag{font-size:13px;font-weight:500;color:var(--c-text3);margin-top:8px}
.wiz-offer{margin:22px auto 0;max-width:560px;text-align:left;display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:16px;background:var(--fill);font-size:14px;line-height:1.45;color:var(--c-text2)}
.wiz-offer-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:var(--c-text3)}
.wiz-offer.on .wiz-offer-dot{background:#16a34a}
.wiz-offer .link-btn{margin-left:auto;white-space:nowrap;font-weight:600}
.wiz-jo-wrap{max-width:600px;width:100%}
.wiz-mode{position:relative}
.wiz-mode.featured{box-shadow:inset 0 0 0 2px var(--c-accent)}
.wiz-mode.featured .wiz-mode-ic{background:var(--c-accent)}.wiz-mode.featured .wiz-mode-ic svg{stroke:#fff}
.wiz-mode-rec{position:absolute;top:24px;right:22px;font-size:13px;font-weight:600;color:var(--c-accent)}

/* Steps */
.wiz-body{flex:1;display:flex;min-width:0}
.wiz-panel{width:470px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid var(--c-border);min-height:0}
.wiz-hd{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--c-border)}
.wiz-hd-mid{flex:1;min-width:0}
.wiz-mode-badge{display:none}   /* the step name needs the room; the CV language sits here instead */
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
  .wiz-offer{flex-wrap:wrap}
  .wiz-content{padding:20px 18px 24px}
}
</style>
