<template>
  <Teleport to="body">
    <Transition name="wizard-fade">
      <div v-if="store.wizardOpen" class="wizard-backdrop">
        <div class="wizard-modal">

          <!-- MODE PICKER -->
          <Transition name="step-fade" mode="out-in">
            <div v-if="!store.wizardMode" class="mode-picker" key="picker">
              <button class="wizard-close" @click="handleClose">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div class="picker-inner">
                <div class="picker-badge">✦ AI-Powered Builder</div>
                <h2 class="picker-title">Build your perfect CV</h2>
                <p class="picker-sub">Choose how you'd like to create your resume</p>
                <div class="mode-cards">
                  <div class="mode-card" @click="store.setMode('manual')">
                    <div class="mode-card-icon" style="background:#e8eefb;">✏️</div>
                    <div class="mode-card-name">Manual</div>
                    <div class="mode-card-desc">Fill sections step-by-step with AI assistance at every stage</div>
                    <div class="mode-card-tag">Guided wizard</div>
                  </div>
                  <div class="mode-card" @click="store.setMode('narrate')">
                    <div class="mode-card-icon" style="background:#f0ebfa;">🎙️</div>
                    <div class="mode-card-name">Narrate</div>
                    <div class="mode-card-desc">Tell your career story and AI builds your entire CV automatically</div>
                    <div class="mode-card-tag ai-tag">✨ AI-powered</div>
                  </div>
                  <div class="mode-card" @click="store.setMode('upload')">
                    <div class="mode-card-icon" style="background:#e6f5ed;">📎</div>
                    <div class="mode-card-name">Upload</div>
                    <div class="mode-card-desc">Import an existing CV — AI extracts and improves everything</div>
                    <div class="mode-card-tag">Instant import</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- WIZARD BODY -->
            <div v-else class="wizard-body" key="wizard">
              <!-- LEFT PANEL -->
              <div class="wizard-panel">
                <div class="wizard-panel-hd">
                  <button class="wizard-close-sm" @click="handleClose" title="Save & close">
                    <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  <div class="wizard-mode-badge">{{ modeMeta.icon }} {{ modeMeta.label }}</div>
                  <div class="step-track">
                    <div v-for="(s,i) in steps" :key="i" class="step-pip"
                      :class="{ done: i < store.wizardStep, active: i === store.wizardStep }"
                      :title="s.label"></div>
                  </div>
                  <div class="wizard-step-label">{{ store.wizardStep+1 }}/{{ steps.length }} · <b>{{ steps[store.wizardStep]?.label }}</b></div>
                </div>

                <div class="wizard-panel-body" ref="panelBody">
                  <Transition :name="stepDir > 0 ? 'slide-left' : 'slide-right'" mode="out-in">
                    <component :is="currentStepComp" :key="store.wizardStep" @next="handleNext" @ai-thinking="v => aiThinking=v" />
                  </Transition>
                </div>

                <div class="wizard-panel-ft">
                  <button class="btn-secondary" @click="handleBack" :disabled="store.wizardStep===0">← Back</button>
                  <div class="wizard-step-count">{{ store.wizardStep+1 }} / {{ steps.length }}</div>
                  <button v-if="store.wizardStep < steps.length-1" class="btn-primary accent" @click="handleNext" :disabled="aiThinking">
                    {{ store.wizardStep === steps.length-2 ? 'Review →' : 'Continue →' }}
                  </button>
                  <button v-else class="btn-primary" style="background:var(--c-green);" @click="finish">✓ Open Builder</button>
                </div>
              </div>

              <!-- RIGHT: BIG PREVIEW -->
              <div class="wizard-preview" ref="previewWrap">
                <div class="wizard-preview-hd">
                  <div class="live-pill"><div class="live-dot"></div> Live Preview</div>
                  <div class="preview-ctrls">
                    <button class="ctrl-pill" @click="prevTpl">◀</button>
                    <span class="ctrl-tpl-name">{{ currentTplName }}</span>
                    <button class="ctrl-pill" @click="nextTpl">▶</button>
                    <button class="ctrl-pill" @click="previewZoom=Math.max(40,previewZoom-5)">−</button>
                    <span style="font-size:11px;font-weight:700;color:var(--c-text3);min-width:32px;text-align:center;">{{ previewZoom }}%</span>
                    <button class="ctrl-pill" @click="previewZoom=Math.min(100,previewZoom+5)">+</button>
                  </div>
                </div>
                <div class="wizard-preview-canvas">
                  <div class="cv-preview-scaler" :style="{ transform: `scale(${previewZoom/100})` }">
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

const aiThinking = ref(false)
const stepDir = ref(1)
const panelBody = ref(null)
const previewWrap = ref(null)
const previewZoom = ref(72)

const TPLS = ['executive','modern','minimal','bold','creative','academic','elegant','tech','pastel','teal','newspaper','swiss','gradient','compact','photo','infographic']
const TPL_NAMES = { executive:'Executive Slate', modern:'Modern Azure', minimal:'Minimal Editorial', bold:'Bold Noir', creative:'Creative Violet', academic:'Academic', elegant:'Elegant Gold', tech:'Tech Dark', pastel:'Pastel Rose', teal:'Teal Sidebar', newspaper:'Newspaper', swiss:'Swiss Design', gradient:'Gradient Flow', compact:'Compact Grid', photo:'Photo Professional', infographic:'Infographic' }
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
  manual:  {icon:'✏️', label:'Manual Wizard'},
  narrate: {icon:'🎙️', label:'AI Narrate'},
  upload:  {icon:'📎', label:'CV Import'},
}[store.wizardMode] || {icon:'✏️', label:'Wizard'}))

function handleNext() { stepDir.value=1; if(store.wizardStep<steps.value.length-1) store.nextStep(); nextTick(()=>panelBody.value?.scrollTo({top:0,behavior:'smooth'})) }
function handleBack() { stepDir.value=-1; store.prevStep(); nextTick(()=>panelBody.value?.scrollTo({top:0,behavior:'smooth'})) }

async function handleClose() { await store.saveDraft(); store.closeWizard() }
async function finish() { await store.saveDraft(); store.closeWizard(); emit('open-builder') }

// Auto-scale preview to fit the panel height
function calcPreviewZoom() {
  if (!previewWrap.value) return
  const h = previewWrap.value.clientHeight - 52 // minus header
  const cvH = 960
  previewZoom.value = Math.min(Math.round((h / cvH) * 100), 85)
}

let ro
onMounted(() => { ro = new ResizeObserver(calcPreviewZoom); if(previewWrap.value) ro.observe(previewWrap.value); calcPreviewZoom() })
onUnmounted(() => ro?.disconnect())
watch(() => store.wizardOpen, v => { document.body.style.overflow = v ? 'hidden' : ''; if(v) nextTick(calcPreviewZoom) })
</script>

<style scoped>
.wizard-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(10,9,8,.78);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;}

.wizard-modal{width:97vw;max-width:1500px;height:94vh;max-height:920px;background:var(--c-surface);border-radius:20px;box-shadow:0 32px 80px rgba(0,0,0,.22);overflow:hidden;display:flex;flex-direction:column;position:relative;}

/* MODE PICKER */
.mode-picker{flex:1;display:flex;align-items:center;justify-content:center;padding:40px;background:radial-gradient(ellipse at 60% 30%,var(--c-accent-lt) 0%,transparent 60%),radial-gradient(ellipse at 20% 80%,var(--c-violet-lt) 0%,transparent 55%),var(--c-surface);position:relative;}
.picker-inner{text-align:center;max-width:680px;width:100%;}
.picker-badge{display:inline-block;background:var(--c-accent-lt);color:var(--c-accent);font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 14px;border-radius:20px;margin-bottom:18px;}
.picker-title{font-family:'DM Serif Display',serif;font-size:40px;color:var(--c-text);margin-bottom:8px;}
.picker-sub{font-size:14px;color:var(--c-text2);margin-bottom:36px;}
.mode-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.mode-card{background:var(--c-surface);border:2px solid var(--c-border);border-radius:var(--radius-lg);padding:28px 22px;cursor:pointer;transition:all .2s;text-align:left;}
.mode-card:hover{border-color:var(--c-accent);box-shadow:var(--shadow-lg);transform:translateY(-4px);}
.mode-card-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px;}
.mode-card-name{font-size:17px;font-weight:700;color:var(--c-text);margin-bottom:6px;}
.mode-card-desc{font-size:12.5px;color:var(--c-text2);line-height:1.55;margin-bottom:14px;}
.mode-card-tag{display:inline-block;background:var(--c-bg);color:var(--c-text3);font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:20px;}
.ai-tag{background:var(--c-accent-lt);color:var(--c-accent);}

/* CLOSE BUTTONS */
.wizard-close{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;background:var(--c-bg);border:1px solid var(--c-border);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--c-text2);transition:all .14s;z-index:10;}
.wizard-close:hover{background:var(--c-rose-lt);border-color:var(--c-rose);color:var(--c-rose);}
.wizard-close svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;}
.wizard-close-sm{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:50%;background:var(--c-bg);border:1px solid var(--c-border);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--c-text2);transition:all .14s;z-index:10;}
.wizard-close-sm:hover{background:var(--c-rose-lt);border-color:var(--c-rose);color:var(--c-rose);}
.wizard-close-sm svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;}

/* WIZARD BODY */
.wizard-body{flex:1;display:flex;overflow:hidden;}

/* LEFT PANEL — narrower so preview gets more space */
.wizard-panel{width:360px;min-width:320px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid var(--c-border);background:var(--c-surface);}
.wizard-panel-hd{padding:16px 18px 12px;border-bottom:1px solid var(--c-border);flex-shrink:0;position:relative;padding-right:52px;}
.wizard-mode-badge{font-size:11px;font-weight:700;color:var(--c-accent);margin-bottom:10px;}
.step-track{display:flex;gap:4px;margin-bottom:7px;}
.step-pip{height:5px;flex:1;border-radius:3px;background:var(--c-border);cursor:pointer;transition:all .2s;}
.step-pip.done{background:var(--c-green);}
.step-pip.active{background:var(--c-accent);}
.wizard-step-label{font-size:11.5px;color:var(--c-text3);}
.wizard-panel-body{flex:1;overflow-y:auto;padding:18px;}
.wizard-panel-body::-webkit-scrollbar{width:4px;}
.wizard-panel-body::-webkit-scrollbar-thumb{background:var(--c-border2);border-radius:2px;}
.wizard-panel-ft{padding:12px 18px;border-top:1px solid var(--c-border);flex-shrink:0;display:flex;align-items:center;justify-content:space-between;background:var(--c-surface);}
.wizard-step-count{font-size:11.5px;color:var(--c-text3);font-weight:600;}

/* RIGHT: BIG PREVIEW */
.wizard-preview{flex:1;display:flex;flex-direction:column;background:var(--c-bg);min-width:0;overflow:hidden;}
.wizard-preview-hd{padding:10px 18px;background:var(--c-surface);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.preview-ctrls{display:flex;align-items:center;gap:6px;}
.ctrl-pill{background:none;border:1px solid var(--c-border);border-radius:6px;padding:4px 9px;font-size:11px;font-weight:600;cursor:pointer;color:var(--c-text2);transition:all .14s;font-family:'DM Sans',sans-serif;}
.ctrl-pill:hover{border-color:var(--c-accent);color:var(--c-accent);}
.ctrl-tpl-name{font-size:11.5px;font-weight:600;color:var(--c-text2);min-width:130px;text-align:center;}
.wizard-preview-canvas{flex:1;overflow:auto;padding:20px 24px;display:flex;align-items:flex-start;justify-content:center;}
.cv-preview-scaler{transform-origin:top center;transition:transform .2s;}

/* TRANSITIONS */
.wizard-fade-enter-active,.wizard-fade-leave-active{transition:opacity .3s,transform .3s;}
.wizard-fade-enter-from,.wizard-fade-leave-to{opacity:0;transform:scale(.97);}
.step-fade-enter-active,.step-fade-leave-active{transition:opacity .2s,transform .2s;}
.step-fade-enter-from,.step-fade-leave-to{opacity:0;transform:translateY(8px);}
.slide-left-enter-active,.slide-left-leave-active,.slide-right-enter-active,.slide-right-leave-active{transition:opacity .2s,transform .2s;}
.slide-left-enter-from{opacity:0;transform:translateX(24px);}
.slide-left-leave-to{opacity:0;transform:translateX(-24px);}
.slide-right-enter-from{opacity:0;transform:translateX(-24px);}
.slide-right-leave-to{opacity:0;transform:translateX(24px);}
</style>