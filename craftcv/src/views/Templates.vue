<template>
  <div class="view-page">
    <div class="view-inner">
      <div class="page-intro">
        <div>
          <h1>Choose a layout</h1>
          <p>Every layout is ATS-friendly text. You can switch layout and colour at any time without losing anything.</p>
        </div>
        <div class="tp-colors">
          <span class="tp-colors-lbl">Colour</span>
          <button v-for="t in THEMES" :key="t.id" class="tp-sw" :class="{ active: theme === t.id }"
                  :style="{ '--sw': t.accent }" :title="t.name" :aria-label="t.name" @click="theme = t.id"></button>
        </div>
      </div>

      <div class="tp-grid">
        <button v-for="l in LAYOUTS" :key="l.id" class="tp-card" :class="{ current: isCurrent(l.id) }" @click="pick(l.id)">
          <div class="tp-thumb">
            <CvThumb :template="`${l.id}:${theme}`" :data="previewData" :fmt="store.fmt" />
            <span v-if="isCurrent(l.id)" class="badge accent tp-cur">Current</span>
            <span class="tp-hover"><span class="btn-primary accent">Use this layout</span></span>
          </div>
          <div class="tp-info">
            <div class="tp-name">{{ l.name }}</div>
            <div class="tp-desc">{{ l.desc }}</div>
          </div>
        </button>
      </div>

      <p class="tp-foot">Previews show {{ store.hasContent ? 'your CV' : 'an example CV' }}. Photos only appear in the Photo and Sidebar layouts.</p>
    </div>
    <JobOfferModal ref="jobOfferRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCvStore } from '../stores/cv.js'
import { LAYOUTS, THEMES, parseTemplate, templateId } from '../composables/cvRenderer.js'
import { SAMPLE_CV } from '../composables/sampleCv.js'
import CvThumb from '../components/CvThumb.vue'
import JobOfferModal from '../components/JobOfferModal.vue'

const store  = useCvStore()
const router = useRouter()
const theme  = ref(parseTemplate(store.template).theme)
const previewData = computed(() => store.hasContent ? store.data : SAMPLE_CV)
const isCurrent = (layout) => store.hasContent && store.template === templateId(layout, theme.value)

// Picking a layout asks for the job offer first, so the CV can be tailored to it.
const jobOfferRef = ref(null)
async function pick(layout) {
  const offer = await jobOfferRef.value?.ask(store.data.jobOffer)
  if (offer === null || offer === undefined) return   // dismissed — nothing changes
  store.template = templateId(layout, theme.value)
  store.data.jobOffer = offer
  if (store.hasContent) {
    // Existing CV: go to the editor; with a job offer, straight to tailoring
    router.push({ path: '/editor', query: offer ? { tab: 'job' } : {} })
  } else {
    store.openWizard()
  }
}
</script>

<style scoped>
.tp-colors{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.tp-colors-lbl{font-size:13px;font-weight:500;color:var(--c-text2);margin-right:4px}
.tp-sw{width:22px;height:22px;border-radius:50%;border:none;background:var(--sw);box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);transition:transform .12s}
.tp-sw:hover{transform:scale(1.12)}
.tp-sw.active{box-shadow:0 0 0 2px var(--c-bg),0 0 0 4px var(--sw)}

.tp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:22px}
.tp-card{display:flex;flex-direction:column;padding:0;background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;overflow:hidden;text-align:left;
  box-shadow:var(--shadow-xs);transition:box-shadow .18s,transform .18s,border-color .18s}
.tp-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-3px)}
.tp-card.current{border-color:var(--c-accent);box-shadow:0 0 0 2px var(--c-accent-ring)}
.tp-thumb{position:relative;background:var(--c-canvas);padding:14px 14px 0}
.tp-thumb :deep(.cvt){border-radius:4px 4px 0 0;box-shadow:0 1px 3px rgba(17,24,39,.08),0 6px 18px rgba(17,24,39,.08)}
.tp-cur{position:absolute;top:10px;right:10px}
.tp-hover{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,15,25,.18);opacity:0;transition:opacity .18s}
.tp-card:hover .tp-hover{opacity:1}
.tp-info{padding:14px 16px 16px;border-top:1px solid var(--c-border)}
.tp-name{font-size:15px;font-weight:600;color:var(--c-text)}
.tp-desc{font-size:13px;color:var(--c-text2);margin-top:3px;line-height:1.45}
.tp-foot{margin-top:24px;font-size:13px;color:var(--c-text3);text-align:center}
@media (max-width:768px){ .tp-hover{display:none} .tp-grid{grid-template-columns:repeat(2,1fr);gap:12px} .tp-thumb{padding:8px 8px 0} .tp-desc{display:none} }
</style>
