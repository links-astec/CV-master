<template>
  <Teleport to="body">
    <Transition name="tut-fade">
      <div v-if="visible" class="tut-root">

        <!-- Dark overlay with spotlight cutout -->
        <svg class="tut-spotlight" v-if="spotlightRect">
          <defs>
            <mask id="tut-mask">
              <rect width="100%" height="100%" fill="white"/>
              <rect
                :x="spotlightRect.x - 8"
                :y="spotlightRect.y - 8"
                :width="spotlightRect.width + 16"
                :height="spotlightRect.height + 16"
                rx="18"
                fill="black"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(12,12,16,0.58)" mask="url(#tut-mask)"/>
        </svg>
        <!-- A soft glowing ring around what the step is about -->
        <div v-if="spotlightRect" class="tut-ring" :style="{ left: spotlightRect.x - 8 + 'px', top: spotlightRect.y - 8 + 'px', width: spotlightRect.width + 16 + 'px', height: spotlightRect.height + 16 + 'px' }"></div>
        <!-- Full overlay when no spotlight -->
        <div v-else class="tut-overlay"></div>

        <!-- Tooltip card -->
        <div
          class="tut-card"
          :style="cardStyle"
          :class="{ 'tut-card--center': !spotlightRect }"
        >
          <!-- Progress dots -->
          <div class="tut-dots">
            <span
              v-for="(_, i) in steps"
              :key="i"
              class="tut-dot"
              :class="{ active: i === currentStep, done: i < currentStep }"
            />
          </div>

          <!-- Step icon -->
          <div class="tut-icon" :style="{ background: currentStepData.iconBg }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px" v-html="currentStepData.icon"/>
          </div>

          <!-- Content -->
          <h3 class="tut-title">{{ $t(currentStepData.title) }}</h3>
          <p class="tut-desc">{{ $t(currentStepData.desc) }}</p>

          <!-- Tip badge -->
          <div v-if="currentStepData.tip" class="tut-tip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ $t(currentStepData.tip) }}
          </div>

          <!-- Actions -->
          <div class="tut-actions">
            <button class="tut-skip" @click="finish">{{ $t('Skip tour') }}</button>
            <div class="tut-nav">
              <button v-if="currentStep > 0" class="tut-back" @click="prev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <button class="tut-next" @click="next">
                {{ $t(isLast ? 'Done!' : 'Next') }}
                <svg v-if="!isLast" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <!-- Step counter -->
          <div class="tut-counter">{{ currentStep + 1 }} / {{ steps.length }}</div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { track } from '../composables/track.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const currentStep  = ref(0)
const spotlightRect = ref(null)
const cardPos       = ref({ top: 0, left: 0, placement: 'bottom' })

const steps = [
  {
    title: 'Welcome to CVMaster',
    desc:  'A one-minute tour of building, tailoring and exporting your CV. You can restart it any time from Settings.',
    icon:  '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    iconBg:'var(--c-accent-lt)',
    target: null,
  },
  {
    title: 'My CVs',
    desc:  'All your CVs live here. Open one to edit it, download it, or email it again once it is paid for.',
    icon:  '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    iconBg:'var(--c-accent-lt)',
    target: '[data-tour="nav-home"]',
  },
  {
    title: 'Start a new CV',
    desc:  'Fill it in step by step, tell your story and let AI structure it, or import an existing PDF or Word CV.',
    icon:  '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    iconBg:'var(--c-violet-lt)',
    target: '[data-tour="new-cv"]',
  },
  {
    title: 'Templates',
    desc:  '50 layouts in 12 colours: ATS-friendly ones for online applications, creative ones for print and in person. When you pick one you can paste the job offer you are applying for.',
    icon:  '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/>',
    iconBg:'var(--c-teal-lt)',
    target: '[data-tour="nav-templates"]',
    tip:   'Switch layout or colour at any time. Your content moves with you.',
  },
  {
    title: 'The editor',
    desc:  'Edit content on the left and watch the page update. The Job match tab tailors your CV to the job offer and gives you an ATS score.',
    icon:  '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
    iconBg:'var(--c-amber-lt)',
    target: '[data-tour="nav-editor"]',
    tip:   'A red line shows where page one ends. You can trim, or shrink the CV to fit.',
  },
  {
    title: 'Export',
    desc:  'Use “Export PDF” in the editor: €0.99 per CV gets you the clean PDF by email and as a download, re-sendable free after edits. From My CVs you can also download a free copy with a watermark.',
    icon:  '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    iconBg:'var(--c-green-lt)',
    target: null,
  },
  {
    title: 'Referral credits',
    desc:  'Share your link from Settings. When a friend you invite gets their first clean CV, you earn a credit that unlocks the clean PDF of one CV.',
    icon:  '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/>',
    iconBg:'var(--c-rose-lt)',
    target: '[data-tour="nav-settings"]',
  },
  {
    title: 'You’re ready',
    desc:  'Pick a layout to get started. Good luck with your applications!',
    icon:  '<polyline points="20 6 9 17 4 12"/>',
    iconBg:'var(--c-green-lt)',
    target: null,
  },
]

const currentStepData = computed(() => steps[currentStep.value])
const isLast = computed(() => currentStep.value === steps.length - 1)

const cardStyle = computed(() => {
  if (!spotlightRect.value) return {}
  return {
    position: 'fixed',
    top:  cardPos.value.top  + 'px',
    left: cardPos.value.left + 'px',
  }
})

function findTarget(selector) {
  if (!selector) return null
  return document.querySelector(selector)
}

async function positionCard() {
  const step = steps[currentStep.value]
  if (!step.target) {
    spotlightRect.value = null
    return
  }
  await nextTick()
  const el = findTarget(step.target)
  if (!el) { spotlightRect.value = null; return }

  const rect = el.getBoundingClientRect()
  spotlightRect.value = { x: rect.left, y: rect.top, width: rect.width, height: rect.height }

  // Position card below or above the spotlight
  const cardW = 340
  const cardH = 280
  const margin = 20
  const vw = window.innerWidth
  const vh = window.innerHeight

  let top  = rect.bottom + margin
  let left = rect.left + rect.width / 2 - cardW / 2

  // Flip above if not enough space below
  if (top + cardH > vh - 20) top = rect.top - cardH - margin

  // Clamp horizontally
  left = Math.max(16, Math.min(left, vw - cardW - 16))
  // Clamp vertically
  top  = Math.max(16, Math.min(top, vh - cardH - 16))

  cardPos.value = { top, left }
}

watch(currentStep, () => positionCard())
watch(() => props.visible, (v) => { if (v) { currentStep.value = 0; positionCard() } })

function next() {
  if (isLast.value) { track('tour_done'); finish(); return }
  currentStep.value++
}
function prev() {
  if (currentStep.value > 0) currentStep.value--
}
function finish() {
  try { localStorage.setItem('cvmaster-tour-done', '1') } catch {}
  emit('close')
}

function onResize() { positionCard() }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
.tut-fade-enter-active,.tut-fade-leave-active{transition:opacity .3s var(--ease)}
.tut-fade-enter-from,.tut-fade-leave-to{opacity:0}

.tut-root{position:fixed;inset:0;z-index:2000}
.tut-spotlight{position:fixed;inset:0;width:100%;height:100%;pointer-events:none}
.tut-overlay{position:fixed;inset:0;background:rgba(12,12,16,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);pointer-events:none}
.tut-ring{position:fixed;border-radius:18px;pointer-events:none;box-shadow:0 0 0 2px rgba(255,255,255,.9),0 0 0 7px rgba(139,133,255,.45),0 0 40px rgba(139,133,255,.55);
  transition:left .45s var(--ease),top .45s var(--ease),width .45s var(--ease),height .45s var(--ease);animation:tutPulse 2.2s ease-in-out infinite}
@keyframes tutPulse{50%{box-shadow:0 0 0 2px rgba(255,255,255,.9),0 0 0 11px rgba(139,133,255,.18),0 0 54px rgba(139,133,255,.45)}}

/* Card */
.tut-card{position:fixed;width:370px;background:var(--c-surface);border:none;border-radius:28px;padding:26px 26px 20px;box-shadow:0 2px 6px rgba(0,0,0,.06),0 30px 80px rgba(0,0,0,.32);
  z-index:2001;pointer-events:all;transition:top .45s var(--ease),left .45s var(--ease)}
.tut-card--center{top:50% !important;left:50% !important;transform:translate(-50%,-50%)}

/* Progress */
.tut-dots{display:flex;gap:5px;margin-bottom:20px}
.tut-dot{height:5px;border-radius:99px;background:var(--fill-hover);transition:all .35s var(--ease);width:20px}
.tut-dot.active{background:var(--c-accent);width:34px}
.tut-dot.done{background:color-mix(in srgb,var(--c-accent) 40%,var(--c-surface))}

/* Icon: the brand gradient, like the app icon */
.tut-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;color:#fff !important;
  background:radial-gradient(circle at 30% 25%,#8B85FF,#4338CA 60%,#2A2390) !important;box-shadow:0 10px 24px rgba(67,56,202,.3)}
.tut-icon :deep(svg),.tut-icon svg{color:#fff;stroke:#fff}

/* Text */
.tut-title{font-size:20px;font-weight:750;letter-spacing:-.025em;line-height:1.25;color:var(--c-text);margin-bottom:8px}
.tut-desc{font-size:14.5px;color:var(--c-text2);line-height:1.6;margin-bottom:16px}

/* Tip */
.tut-tip{display:flex;align-items:flex-start;gap:8px;background:var(--fill);border:none;color:var(--c-text2);border-radius:16px;padding:11px 14px;font-size:13px;line-height:1.5;margin-bottom:18px}

/* Actions */
.tut-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.tut-skip{background:none;border:none;color:var(--c-text3);font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit;padding:8px 4px;transition:color .2s}
.tut-skip:hover{color:var(--c-text)}
.tut-nav{display:flex;gap:8px}
.tut-back{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:999px;border:none;background:var(--fill);color:var(--c-text);cursor:pointer;transition:background .2s var(--ease)}
.tut-back:hover{background:var(--fill-hover)}
.tut-next{display:flex;align-items:center;gap:7px;background:var(--c-accent);color:#fff;border:none;height:42px;padding:0 20px;border-radius:999px;font-size:14.5px;font-weight:600;cursor:pointer;font-family:inherit;
  box-shadow:0 6px 16px rgba(67,56,202,.3);transition:background .2s var(--ease),transform .2s var(--ease)}
.tut-next:hover{background:var(--c-accent-dk)}
.tut-next:active,.tut-back:active{transform:scale(.97)}

.tut-counter{text-align:center;font-size:12px;font-weight:500;color:var(--c-text3)}

/* Phones: a sheet at the bottom */
@media (max-width:480px){
  .tut-card{width:auto;left:10px !important;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));top:auto !important;transform:none !important;border-radius:28px;padding:24px 22px 18px}
  .tut-card--center{top:auto !important;left:10px !important;transform:none !important}
}
@media (prefers-reduced-motion:reduce){ .tut-ring{animation:none} .tut-card,.tut-ring{transition:none} }
</style>
