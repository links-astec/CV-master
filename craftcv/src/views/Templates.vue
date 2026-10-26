<template>
  <div class="view-page">
    <div class="view-inner">
      <div class="page-intro">
        <div>
          <h1>{{ $t('Choose a layout') }}</h1>
          <p>{{ $t('{n} layouts in 12 colours. Switch any time. Your content moves with you.', { n: LAYOUTS.length }) }}</p>
        </div>
        <div class="tp-colors">
          <span class="tp-colors-lbl">{{ $t('Colour') }}</span>
          <button class="tp-auto" :class="{ active: theme === 'auto' }" @click="theme = 'auto'" :title="$t('Each layout in its own suggested colour')">{{ $t('Suggested') }}</button>
          <button v-for="t in THEMES" :key="t.id" class="tp-sw" :class="{ active: theme === t.id }"
                  :style="{ '--sw': t.accent }" :title="$t(t.name)" :aria-label="$t(t.name)" @click="theme = t.id"></button>
        </div>
      </div>

      <div class="tp-filter">
        <div class="seg">
          <button v-for="f in FILTERS" :key="f.id" :class="{ active: filter === f.id }" @click="filter = f.id">
            {{ $t(f.label) }} <span class="tp-count">{{ f.id === 'all' ? LAYOUTS.length : LAYOUTS.filter(l => l.kind === f.id).length }}</span>
          </button>
        </div>
        <p class="tp-filter-note hide-mobile">{{ $t(filterNote) }}</p>
      </div>

      <div class="tp-grid">
        <button v-for="l in shown" :key="l.id" class="tp-card" :class="{ current: isCurrent(l) }" @click="pick(l)">
          <div class="tp-thumb">
            <CvThumb :template="tplFor(l)" :data="previewData" :fmt="store.fmt" />
            <span v-if="isCurrent(l)" class="badge accent tp-cur">{{ $t('Current') }}</span>
            <span class="tp-hover"><span class="btn-primary accent">{{ $t('Use this layout') }}</span></span>
          </div>
          <div class="tp-info">
            <div class="tp-name">{{ $t(l.name) }} <span class="badge" :class="l.kind === 'ats' ? 'green' : 'accent'">{{ $t(LAYOUT_KINDS[l.kind].name) }}</span><span v-if="l.photo" class="badge">{{ $t('Photo') }}</span></div>
            <div class="tp-desc">{{ $t(l.desc) }}</div>
          </div>
        </button>
      </div>

      <p class="tp-foot">{{ $t(store.hasContent ? 'Previews show your CV.' : 'Previews show an example CV.') }} {{ $t('Your photo appears in layouts tagged “Photo”; the others show your initials or no picture.') }}</p>
    </div>
    <JobOfferModal ref="jobOfferRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCvStore } from '../stores/cv.js'
import { LAYOUTS, LAYOUT_KINDS, THEMES, parseTemplate, templateId } from '../composables/cvRenderer.js'
import { sampleCv } from '../composables/sampleCv.js'
import CvThumb from '../components/CvThumb.vue'
import JobOfferModal from '../components/JobOfferModal.vue'
import { guestEvent } from '../composables/track.js'

const store  = useCvStore()
const router = useRouter()
// 'auto' = show each layout in its own suggested colour
const theme  = ref('auto')
const previewData = computed(() => store.hasContent ? store.data : sampleCv())
const FILTERS = [{ id: 'all', label: 'All' }, { id: 'ats', label: 'ATS-friendly' }, { id: 'creative', label: 'Standard' }]
const filter = ref('all')
const shown = computed(() => filter.value === 'all' ? LAYOUTS : LAYOUTS.filter(l => l.kind === filter.value))
const filterNote = computed(() => filter.value === 'all'
  ? 'ATS-friendly layouts are for online applications. Standard ones are for print, in person, or sending straight to a person.'
  : LAYOUT_KINDS[filter.value].desc)
const tplFor    = (l) => templateId(l.id, theme.value === 'auto' ? l.theme : theme.value)
const isCurrent = (l) => store.hasContent && parseTemplate(store.template).layout === l.id

// Picking a layout asks for the job offer first, so the CV can be tailored to it.
const jobOfferRef = ref(null)
async function pick(l) {
  const offer = await jobOfferRef.value?.ask(store.data.jobOffer)
  if (offer === null || offer === undefined) return   // dismissed, nothing changes
  store.template = tplFor(l)
  guestEvent('template'); if (offer) guestEvent('job_offer')
  if (offer !== store.data.jobOffer) store.data.jobTailored = ''
  store.data.jobOffer = offer
  if (store.hasContent) {
    // Existing CV: go to the editor; with a job offer, straight to tailoring
    router.push({ path: '/editor', query: offer ? { tab: 'job' } : {} })
  } else {
    store.openWizard(false, { askOffer: false })   // the job offer was just asked above
  }
}
</script>

<style scoped>
.tp-colors{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.tp-colors-lbl{font-size:13px;font-weight:500;color:var(--c-text2);margin-right:4px}
.tp-sw{width:22px;height:22px;border-radius:50%;border:none;background:var(--sw);box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);transition:transform .12s}
.tp-sw:hover{transform:scale(1.12)}
.tp-sw.active{box-shadow:0 0 0 2px var(--c-bg),0 0 0 4px var(--sw)}
.tp-auto{height:26px;padding:0 10px;border-radius:99px;border:1px solid var(--hair);background:var(--c-surface);font-size:12.5px;font-weight:600;color:var(--c-text2)}
.tp-auto.active{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-lt)}
.tp-count{font-size:11.5px;opacity:.6;font-weight:500;margin-left:2px}

.tp-filter{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:22px}
.tp-filter-note{font-size:13.5px;color:var(--c-text2)}
.tp-name .badge{margin-left:6px;vertical-align:1px}
.tp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:22px}
.tp-card{display:flex;flex-direction:column;padding:0;background:var(--c-surface);border:none;border-radius:24px;overflow:hidden;text-align:left;
  box-shadow:var(--shadow-sm);transition:box-shadow .45s var(--ease),transform .45s var(--ease)}
.tp-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-4px)}
.tp-card.current{box-shadow:0 0 0 2px var(--c-accent),var(--shadow-lg)}
.tp-thumb{position:relative;background:color-mix(in srgb,var(--c-text) 4%,var(--c-surface));padding:18px 18px 0}
.tp-thumb :deep(.cvt){border-radius:4px 4px 0 0;box-shadow:0 1px 2px rgba(20,20,43,.05),0 12px 28px rgba(20,20,43,.10);transition:transform .45s var(--ease)}
.tp-card:hover .tp-thumb :deep(.cvt){transform:translateY(-3px)}
.tp-cur{position:absolute;top:10px;right:10px}
.tp-hover{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(12,12,16,.14);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);opacity:0;transition:opacity .3s var(--ease)}
.tp-card:hover .tp-hover{opacity:1}
.tp-info{padding:16px 18px 18px}
.tp-name{font-size:15px;font-weight:600;color:var(--c-text)}
.tp-desc{font-size:13px;color:var(--c-text2);margin-top:3px;line-height:1.45}
.tp-foot{margin-top:24px;font-size:13px;color:var(--c-text3);text-align:center}
@media (max-width:768px){ .tp-hover{display:none} .tp-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px} .tp-thumb{padding:8px 8px 0} .tp-desc{display:none} }
</style>
