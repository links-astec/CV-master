<template>
  <div class="view-page">
    <div class="view-inner">
      <div class="page-intro">
        <div>
          <h1>Choose a layout</h1>
          <p>{{ LAYOUTS.length }} layouts in 12 colours. Switch any time — your content moves with you.</p>
        </div>
        <div class="tp-colors">
          <span class="tp-colors-lbl">Colour</span>
          <button class="tp-auto" :class="{ active: theme === 'auto' }" @click="theme = 'auto'" title="Each layout in its own suggested colour">Suggested</button>
          <button v-for="t in THEMES" :key="t.id" class="tp-sw" :class="{ active: theme === t.id }"
                  :style="{ '--sw': t.accent }" :title="t.name" :aria-label="t.name" @click="theme = t.id"></button>
        </div>
      </div>

      <div class="tp-filter">
        <div class="seg">
          <button v-for="f in FILTERS" :key="f.id" :class="{ active: filter === f.id }" @click="filter = f.id">
            {{ f.label }} <span class="tp-count">{{ f.id === 'all' ? LAYOUTS.length : LAYOUTS.filter(l => l.kind === f.id).length }}</span>
          </button>
        </div>
        <p class="tp-filter-note">{{ filterNote }}</p>
      </div>

      <div class="tp-grid">
        <button v-for="l in shown" :key="l.id" class="tp-card" :class="{ current: isCurrent(l) }" @click="pick(l)">
          <div class="tp-thumb">
            <CvThumb :template="tplFor(l)" :data="previewData" :fmt="store.fmt" />
            <span v-if="isCurrent(l)" class="badge accent tp-cur">Current</span>
            <span class="tp-hover"><span class="btn-primary accent">Use this layout</span></span>
          </div>
          <div class="tp-info">
            <div class="tp-name">{{ l.name }} <span class="badge" :class="l.kind === 'ats' ? 'green' : 'accent'">{{ LAYOUT_KINDS[l.kind].name }}</span><span v-if="l.photo" class="badge">Photo</span></div>
            <div class="tp-desc">{{ l.desc }}</div>
          </div>
        </button>
      </div>

      <p class="tp-foot">Previews show {{ store.hasContent ? 'your CV' : 'an example CV' }}. Your photo appears in layouts tagged “Photo”; the others show your initials or no picture.</p>
    </div>
    <JobOfferModal ref="jobOfferRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCvStore } from '../stores/cv.js'
import { LAYOUTS, LAYOUT_KINDS, THEMES, parseTemplate, templateId } from '../composables/cvRenderer.js'
import { SAMPLE_CV } from '../composables/sampleCv.js'
import CvThumb from '../components/CvThumb.vue'
import JobOfferModal from '../components/JobOfferModal.vue'

const store  = useCvStore()
const router = useRouter()
// 'auto' = show each layout in its own suggested colour
const theme  = ref('auto')
const previewData = computed(() => store.hasContent ? store.data : SAMPLE_CV)
const FILTERS = [{ id: 'all', label: 'All' }, { id: 'ats', label: 'ATS-friendly' }, { id: 'creative', label: 'Creative' }]
const filter = ref('all')
const shown = computed(() => filter.value === 'all' ? LAYOUTS : LAYOUTS.filter(l => l.kind === filter.value))
const filterNote = computed(() => filter.value === 'all'
  ? 'ATS-friendly layouts are for online applications. Creative ones are for print, in person, or sending straight to a person.'
  : LAYOUT_KINDS[filter.value].desc + '.')
const tplFor    = (l) => templateId(l.id, theme.value === 'auto' ? l.theme : theme.value)
const isCurrent = (l) => store.hasContent && parseTemplate(store.template).layout === l.id

// Picking a layout asks for the job offer first, so the CV can be tailored to it.
const jobOfferRef = ref(null)
async function pick(l) {
  const offer = await jobOfferRef.value?.ask(store.data.jobOffer)
  if (offer === null || offer === undefined) return   // dismissed — nothing changes
  store.template = tplFor(l)
  if (offer !== store.data.jobOffer) store.data.jobTailored = ''
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
.tp-auto{height:26px;padding:0 10px;border-radius:99px;border:1px solid var(--c-border);background:var(--c-surface);font-size:12.5px;font-weight:600;color:var(--c-text2)}
.tp-auto.active{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-lt)}
.tp-count{font-size:11.5px;opacity:.6;font-weight:500;margin-left:2px}

.tp-filter{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:22px}
.tp-filter-note{font-size:13.5px;color:var(--c-text2)}
.tp-name .badge{margin-left:6px;vertical-align:1px}
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
