<template>
  <Teleport to="body">
    <Transition name="wizard-fade">
      <div v-if="store.wizardOpen" class="wiz-backdrop">
        <div class="wiz-modal">

          <!-- ── MODE PICKER ── -->
          <Transition name="step-fade" mode="out-in">
            <div v-if="!store.wizardMode" class="wiz-picker" key="picker">
              <button class="wiz-x" @click="handleClose">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div class="wiz-picker-inner">
                <div class="wiz-badge">AI-Powered CV Builder</div>
                <h2 class="wiz-picker-title">Build your perfect CV</h2>
                <p class="wiz-picker-sub">Choose how you'd like to get started</p>
                <div class="wiz-mode-cards">
                  <div class="wiz-mode-card" @click="store.setMode('manual')">
                    <div class="wiz-mode-icon" style="background:#e8eefb;">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#2a5bd7" stroke-width="1.8" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                    <div class="wiz-mode-name">Manual</div>
                    <div class="wiz-mode-desc">Fill sections step-by-step with AI help at every stage</div>
                    <div class="wiz-mode-tag">Guided wizard</div>
                  </div>
                  <div class="wiz-mode-card" @click="store.setMode('narrate')">
                    <div class="wiz-mode-icon" style="background:#f0ebfa;">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#6236b0" stroke-width="1.8" stroke-linecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
                    </div>
                    <div class="wiz-mode-name">Narrate</div>
                    <div class="wiz-mode-desc">Tell your story and AI builds your entire CV automatically</div>
                    <div class="wiz-mode-tag ai-tag">AI-powered</div>
                  </div>
                  <div class="wiz-mode-card" @click="store.setMode('upload')">
                    <div class="wiz-mode-icon" style="background:#e6f5ed;">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" stroke-width="1.8" stroke-linecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                    </div>
                    <div class="wiz-mode-name">Upload</div>
                    <div class="wiz-mode-desc">Import an existing CV — AI extracts and improves everything</div>
                    <div class="wiz-mode-tag">Instant import</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── WIZARD BODY ── -->
            <div v-else class="wiz-body" key="wizard">

              <!-- LEFT PANEL -->
              <div class="wiz-panel">
                <div class="wiz-panel-hd">
                  <button class="wiz-x-sm" @click="handleClose">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  <div class="wiz-mode-label">{{ modeMeta.label }}</div>
                  <div class="wiz-steps">
                    <div v-for="(s,i) in steps" :key="i" class="wiz-pip"
                      :class="{ done: i < store.wizardStep, active: i === store.wizardStep }"></div>
                  </div>
                  <div class="wiz-step-lbl">{{ store.wizardStep+1 }}/{{ steps.length }} · <b>{{ steps[store.wizardStep]?.label }}</b></div>
                </div>

                <div class="wiz-panel-body" ref="panelBody">
                  <Transition :name="stepDir > 0 ? 'slide-left' : 'slide-right'" mode="out-in">
                    <component :is="currentStepComp" :key="store.wizardStep" @next="handleNext" @ai-thinking="v => aiThinking=v" />
                  </Transition>
                </div>

                <div class="wiz-panel-ft">
                  <button class="btn-secondary" @click="handleBack" :disabled="store.wizardStep===0">← Back</button>
                  <span class="wiz-step-num">{{ store.wizardStep+1 }}/{{ steps.length }}</span>
                  <button v-if="store.wizardStep < steps.length-1" class="btn-primary accent" @click="handleNext" :disabled="aiThinking">
                    {{ store.wizardStep === steps.length-2 ? 'Review' : 'Continue' }} →
                  </button>
                  <button v-else class="btn-primary" style="background:var(--c-green);" @click="finish">Open Builder</button>
                </div>
              </div>

              <!-- RIGHT PREVIEW (hidden on mobile) -->
              <div class="wiz-preview" ref="previewWrap">
                <div class="wiz-preview-hd">
                  <div class="live-pill"><div class="live-dot"></div>Live Preview</div>
                  <div class="wiz-preview-ctrls">
                    <button class="ctrl-pill" @click="prevTpl">‹</button>
                    <span class="wiz-tpl-name">{{ currentTplName }}</span>
                    <button class="ctrl-pill" @click="nextTpl">›</button>
                    <button class="ctrl-pill" @click="previewZoom=Math.max(35,previewZoom-5)">−</button>
                    <span class="wiz-zoom-lbl">{{ previewZoom }}%</span>
                    <button class="ctrl-pill" @click="previewZoom=Math.min(100,previewZoom+5)">+</button>
                  </div>
                </div>
                <div class="wiz-preview-canvas">
                  <div class="wiz-cv-scaler" :style="{ transform: `scale(${previewZoom/100})` }">
                    <div v-html="renderedCV"></div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useCvRenderer } from '../composables/cvRenderer.js'

const StepPersonal   = defineAsyncComponent(() => import('./wizard/StepPersonal.vue'))
const StepSummary    = defineAsyncComponent(() => import('./wizard/StepSummary.vue'))
const StepExperience = defineAsyncComponent(() => import('./wizard/StepExperience.vue'))
const StepSkills     = defineAsyncComponent(() => import('./wizard/StepSkills.vue'))
const StepEducation  = defineAsyncComponent(() => import('./wizard/StepEducation.vue'))
const StepReview     = defineAsyncComponent(() => import('./wizard/StepReview.vue'))
const StepNarrate    = defineAsyncComponent(() => import('./wizard/StepNarrate.vue'))
const StepUpload     = defineAsyncComponent(() => import('./wizard/StepUpload.vue'))

const store = useCvStore()
const { render } = useCvRenderer()
const emit = defineEmits(['open-builder'])

const aiThinking  = ref(false)
const stepDir     = ref(1)
const panelBody   = ref(null)
const previewWrap = ref(null)
const previewZoom = ref(72)

const TPLS = ['executive','modern','minimal','bold','creative','academic','elegant','tech','pastel','teal','newspaper','swiss','gradient','compact','photo','infographic','corporate','magazine','midnight','clean','slate','terra','prism','ivory','split']
const TPL_NAMES = { executive:'Executive Slate', modern:'Modern Azure', minimal:'Minimal Editorial', bold:'Bold Noir', creative:'Creative Violet', academic:'Academic', elegant:'Elegant Gold', tech:'Tech Dark', pastel:'Pastel Rose', teal:'Teal Sidebar', newspaper:'Newspaper', swiss:'Swiss Design', gradient:'Gradient Flow', compact:'Compact Grid', photo:'Photo Professional', infographic:'Infographic', corporate:'Corporate Blue', magazine:'Magazine Editorial', midnight:'Midnight Executive', clean:'Clean Professional' }

const currentTplName = computed(() => TPL_NAMES[store.template] || store.template)
function prevTpl() { const i=TPLS.indexOf(store.template); store.template=TPLS[(i-1+TPLS.length)%TPLS.length] }
function nextTpl() { const i=TPLS.indexOf(store.template); store.template=TPLS[(i+1)%TPLS.length] }

const renderedCV = computed(() => render(store.template, store.data))

const manualSteps  = [{label:'Personal',comp:StepPersonal},{label:'Summary',comp:StepSummary},{label:'Experience',comp:StepExperience},{label:'Skills',comp:StepSkills},{label:'Education',comp:StepEducation},{label:'Review',comp:StepReview}]
const narrateSteps = [{label:'Your Story',comp:StepNarrate},...manualSteps]
const uploadSteps  = [{label:'Upload',comp:StepUpload},...manualSteps]

const steps = computed(() => store.wizardMode==='narrate' ? narrateSteps : store.wizardMode==='upload' ? uploadSteps : manualSteps)
const currentStepComp = computed(() => steps.value[store.wizardStep]?.comp || StepPersonal)
const modeMeta = computed(() => ({
  manual:  { label: 'Step-by-step' },
  narrate: { label: 'AI Narrate' },
  upload:  { label: 'CV Import' },
}[store.wizardMode] || { label: 'Wizard' }))

function handleNext() {
  stepDir.value = 1
  if (store.wizardStep < steps.value.length-1) store.nextStep()
  nextTick(() => panelBody.value?.scrollTo({ top: 0, behavior: 'smooth' }))
}
function handleBack() {
  stepDir.value = -1
  store.prevStep()
  nextTick(() => panelBody.value?.scrollTo({ top: 0, behavior: 'smooth' }))
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

function calcZoom() {
  if (!previewWrap.value) return
  const h = previewWrap.value.clientHeight - 52
  previewZoom.value = Math.min(Math.round((h / 990) * 100), 85)
}

let ro
onMounted(() => {
  ro = new ResizeObserver(calcZoom)
  if (previewWrap.value) ro.observe(previewWrap.value)
  calcZoom()
})
onUnmounted(() => ro?.disconnect())

watch(() => store.wizardOpen, v => {
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) nextTick(calcZoom)
})
</script>

<style scoped>
/* ── BACKDROP ──────────────────────────────────────────────── */
.wiz-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(10,9,8,.8); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}

/* ── MODAL ─────────────────────────────────────────────────── */
.wiz-modal {
  width: 97vw; max-width: 1400px;
  height: 94dvh; max-height: 920px;
  background: var(--c-surface); border-radius: 20px;
  box-shadow: 0 32px 80px rgba(0,0,0,.25);
  overflow: hidden; display: flex; flex-direction: column;
  position: relative;
}

/* ── MODE PICKER ───────────────────────────────────────────── */
.wiz-picker {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 32px 24px; position: relative;
  background: radial-gradient(ellipse at 65% 25%, var(--c-accent-lt) 0%, transparent 55%),
              radial-gradient(ellipse at 20% 80%, var(--c-violet-lt) 0%, transparent 50%),
              var(--c-surface);
  overflow-y: auto;
}
.wiz-picker-inner { text-align: center; max-width: 660px; width: 100%; }
.wiz-badge {
  display: inline-block; background: var(--c-accent-lt); color: var(--c-accent);
  font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  padding: 4px 14px; border-radius: 20px; margin-bottom: 16px;
}
.wiz-picker-title {
  font-family: 'DM Serif Display', serif;
  font-size: 38px; color: var(--c-text); margin-bottom: 8px; letter-spacing: -.02em;
}
.wiz-picker-sub { font-size: 14px; color: var(--c-text2); margin-bottom: 32px; }

.wiz-mode-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
.wiz-mode-card {
  background: var(--c-surface); border: 2px solid var(--c-border);
  border-radius: var(--radius-lg); padding: 24px 18px;
  cursor: pointer; transition: all .2s; text-align: left;
}
.wiz-mode-card:hover { border-color: var(--c-accent); box-shadow: var(--shadow-lg); transform: translateY(-3px); }
.wiz-mode-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
}
.wiz-mode-icon svg { width: 22px; height: 22px; }
.wiz-mode-name { font-size: 16px; font-weight: 700; color: var(--c-text); margin-bottom: 6px; }
.wiz-mode-desc { font-size: 12px; color: var(--c-text2); line-height: 1.55; margin-bottom: 12px; }
.wiz-mode-tag {
  display: inline-block; background: var(--c-bg); color: var(--c-text3);
  font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
}
.ai-tag { background: var(--c-accent-lt); color: var(--c-accent); }

/* ── CLOSE BUTTONS ─────────────────────────────────────────── */
.wiz-x {
  position: absolute; top: 14px; right: 14px;
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--c-bg); border: 1px solid var(--c-border);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--c-text2); transition: all .14s; z-index: 10;
}
.wiz-x:hover { background: var(--c-rose-lt); border-color: var(--c-rose); color: var(--c-rose); }
.wiz-x svg { width: 15px; height: 15px; }
.wiz-x-sm {
  position: absolute; top: 12px; right: 12px;
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--c-bg); border: 1px solid var(--c-border);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--c-text2); transition: all .14s; z-index: 10;
}
.wiz-x-sm:hover { background: var(--c-rose-lt); color: var(--c-rose); }
.wiz-x-sm svg { width: 13px; height: 13px; }

/* ── WIZARD BODY ───────────────────────────────────────────── */
.wiz-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

/* ── LEFT PANEL ────────────────────────────────────────────── */
.wiz-panel {
  width: 380px; min-width: 340px; flex-shrink: 0;
  display: flex; flex-direction: column;
  border-right: 1px solid var(--c-border);
  background: var(--c-surface); min-height: 0;
}
.wiz-panel-hd {
  padding: 14px 16px 12px; padding-right: 50px;
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0; position: relative;
}
.wiz-mode-label { font-size: 11px; font-weight: 700; color: var(--c-accent); margin-bottom: 9px; }
.wiz-steps { display: flex; gap: 4px; margin-bottom: 6px; }
.wiz-pip { height: 5px; flex: 1; border-radius: 3px; background: var(--c-border); transition: all .2s; }
.wiz-pip.done { background: var(--c-green); }
.wiz-pip.active { background: var(--c-accent); }
.wiz-step-lbl { font-size: 11.5px; color: var(--c-text3); }
.wiz-panel-body { flex: 1; overflow-y: auto; padding: 18px; min-height: 0; -webkit-overflow-scrolling: touch; }
.wiz-panel-body::-webkit-scrollbar { width: 3px; }
.wiz-panel-body::-webkit-scrollbar-thumb { background: var(--c-border2); border-radius: 2px; }
.wiz-panel-ft {
  padding: 12px 16px; border-top: 1px solid var(--c-border);
  flex-shrink: 0; display: flex; align-items: center;
  justify-content: space-between; gap: 8px; background: var(--c-surface);
}
.wiz-step-num { font-size: 11.5px; color: var(--c-text3); font-weight: 600; }

/* ── RIGHT PREVIEW ─────────────────────────────────────────── */
.wiz-preview {
  flex: 1; display: flex; flex-direction: column;
  background: var(--c-bg); min-width: 0; overflow: hidden;
}
.wiz-preview-hd {
  padding: 10px 16px; background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
}
.wiz-preview-ctrls { display: flex; align-items: center; gap: 5px; }
.wiz-tpl-name { font-size: 11px; font-weight: 600; color: var(--c-text2); min-width: 120px; text-align: center; }
.wiz-zoom-lbl { font-size: 11px; font-weight: 700; color: var(--c-text3); min-width: 30px; text-align: center; }
.wiz-preview-canvas { flex: 1; overflow: auto; padding: 20px; display: flex; align-items: flex-start; justify-content: center; }
.wiz-cv-scaler { transform-origin: top center; transition: transform .2s; }

/* ── TRANSITIONS ───────────────────────────────────────────── */
.wizard-fade-enter-active, .wizard-fade-leave-active { transition: opacity .3s, transform .3s; }
.wizard-fade-enter-from, .wizard-fade-leave-to { opacity: 0; transform: scale(.97); }
.step-fade-enter-active, .step-fade-leave-active { transition: opacity .2s, transform .2s; }
.step-fade-enter-from, .step-fade-leave-to { opacity: 0; transform: translateY(6px); }
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active { transition: opacity .18s, transform .18s; }
.slide-left-enter-from { opacity: 0; transform: translateX(20px); }
.slide-left-leave-to { opacity: 0; transform: translateX(-20px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-20px); }
.slide-right-leave-to { opacity: 0; transform: translateX(20px); }

/* ══════════════════════════════════════════════════════════════
   MOBILE — phones first
═══════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  /* Full-screen sheet from bottom */
  .wiz-backdrop { padding: 0; align-items: flex-end; }
  .wiz-modal {
    width: 100vw; max-width: 100vw;
    height: 95dvh; max-height: 95dvh;
    border-radius: 20px 20px 0 0;
  }

  /* Hide preview pane entirely on mobile */
  .wiz-preview { display: none; }

  /* Panel fills full width */
  .wiz-panel { width: 100% !important; min-width: unset !important; border-right: none; }

  /* Picker layout */
  .wiz-picker { padding: 20px 16px 24px; align-items: flex-start; }
  .wiz-picker-title { font-size: 26px; }
  .wiz-picker-sub { font-size: 13px; margin-bottom: 20px; }
  .wiz-mode-cards { grid-template-columns: 1fr; gap: 10px; }
  .wiz-mode-card { padding: 16px 14px; display: flex; align-items: flex-start; gap: 14px; }
  .wiz-mode-icon { width: 42px; height: 42px; flex-shrink: 0; margin-bottom: 0; }
  .wiz-mode-name { font-size: 15px; margin-bottom: 3px; }
  .wiz-mode-desc { font-size: 12px; margin-bottom: 8px; }

  /* Compact header */
  .wiz-panel-hd { padding: 12px 14px 10px; padding-right: 48px; }
  .wiz-mode-label { font-size: 10px; margin-bottom: 7px; }
  .wiz-step-lbl { font-size: 11px; }

  /* Body scrollable */
  .wiz-panel-body { padding: 14px; }

  /* Footer */
  .wiz-panel-ft { padding: 10px 14px; }
  .wiz-step-num { display: none; }
  .btn-secondary, .btn-primary { font-size: 13px; padding: 9px 14px; }
}

@media (max-width: 480px) {
  .wiz-modal { height: 100dvh; max-height: 100dvh; border-radius: 0; }
  .wiz-picker-title { font-size: 22px; }
  .wiz-badge { font-size: 9.5px; }
  .wiz-panel-body { padding: 12px; }
}

@media (max-width: 768px) and (orientation: landscape) {
  .wiz-modal { height: 100dvh; border-radius: 0; }
  .wiz-panel-body { padding: 10px 14px; }
}

@supports (padding: env(safe-area-inset-bottom)) {
  .wiz-panel-ft { padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
  .wiz-modal { padding-bottom: env(safe-area-inset-bottom); }
}
</style>