<template>
  <div class="cvp" ref="wrapRef">
    <!-- One-page notice -->
    <div v-if="notices && page.overflow" class="cvp-notice" :class="fitAccepted && page.zoom >= SMALL_TEXT_ZOOM ? 'calm' : 'warn'">
      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
      <div class="cvp-notice-txt">
        <template v-if="!fitAccepted">
          <strong>{{ $t('Your CV is {n}% longer than one A4 page.', { n: overPct }) }}</strong>
          <span class="cvp-notice-more">{{ $t('Remove something (such as what you just added), or shrink it to fit.') }}</span>
        </template>
        <template v-else-if="page.zoom < SMALL_TEXT_ZOOM">
          <strong>{{ $t('Shrunk to fit one page. Text is at {n}%, which is getting small.', { n: zoomPct }) }}</strong>
          <span class="cvp-notice-more">{{ $t('Trimming a few lines will make it easier to read.') }}</span>
        </template>
        <template v-else>
          {{ $t('Shrunk to fit one page, text at {n}%.', { n: zoomPct }) }}
        </template>
      </div>
      <button v-if="!fitAccepted" class="btn-primary btn-sm" @click="$emit('update:fitAccepted', true)">{{ $t('Shrink to fit') }}</button>
      <button v-else class="btn-ghost btn-sm" @click="$emit('update:fitAccepted', false)">{{ $t('Undo') }}</button>
    </div>

    <div class="cvp-stage" :style="{ width: 700 * scale + 'px', height: stageHeight * scale + 'px' }">
      <div class="cvp-page" :style="{ zoom: scale, '--cvp-z': scale }" :class="{ 'is-long': showBreak }">
        <div v-html="shownHtml"></div>
        <template v-if="showBreak">
          <div class="cvp-over" :style="{ top: PAGE_H + 'px', height: (page.height - PAGE_H) + 'px' }"></div>
          <div class="cvp-break" :style="{ top: PAGE_H + 'px' }"><span>{{ $t('End of page 1') }}</span></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue'
import { render } from '../composables/cvRenderer.js'
import { analysePage, withFitZoom, PAGE_H, SMALL_TEXT_ZOOM } from '../composables/pageFit.js'

const props = defineProps({
  template:    { type: String, required: true },
  data:        { type: Object, required: true },
  fmt:         { type: Object, default: () => ({}) },
  scale:       { type: [Number, String], default: 'fit' },  // number, or 'fit' to the container width
  maxScale:    { type: Number, default: 1 },
  padding:     { type: Number, default: 48 },
  preview:     { type: Boolean, default: true },   // placeholders for empty fields
  notices:     { type: Boolean, default: true },   // one-page warning bar
  fitAccepted: { type: Boolean, default: false },  // show the shrunk-to-fit version
})
const emit = defineEmits(['update:fitAccepted', 'page'])
const showToast = inject('showToast', null)

const wrapRef = ref(null)
const wrapW   = ref(0)

// Deep-track the CV so any nested edit re-renders
const html = computed(() => {
  JSON.stringify(props.data); JSON.stringify(props.fmt)
  return render(props.template, props.data, props.fmt, { preview: props.preview })
})

const page = ref({ height: 990, overflow: false, overBy: 0, zoom: 1 })
const overPct = computed(() => Math.max(1, Math.round(page.value.overBy * 100)))
const zoomPct = computed(() => Math.round(page.value.zoom * 100))
const fitted  = computed(() => page.value.overflow && props.fitAccepted)
const showBreak = computed(() => page.value.overflow && !props.fitAccepted)
const shownHtml = computed(() => fitted.value ? withFitZoom(html.value, page.value.zoom) : html.value)
const stageHeight = computed(() => showBreak.value ? Math.max(PAGE_H, page.value.height) : PAGE_H)

const scale = computed(() => {
  if (typeof props.scale === 'number') return props.scale
  const w = wrapW.value
  return w ? Math.max(0.2, Math.min(props.maxScale, (w - props.padding) / 700)) : 0.6
})

// Measure after edits settle; tell the user when an edit pushes the CV past one page
let timer = null
let measured = false
let seq = 0
watch(html, (h) => {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    const mine = ++seq
    const info = await analysePage(h)
    if (mine !== seq) return
    const wasOver = page.value.overflow
    page.value = info
    emit('page', info)
    if (measured && !wasOver && info.overflow && props.notices) {
      showToast?.('That change made your CV longer than one A4 page.')
    }
    measured = true
  }, measured ? 350 : 0)
}, { immediate: true })

let ro
onMounted(() => {
  ro = new ResizeObserver(() => { wrapW.value = wrapRef.value?.clientWidth || 0 })
  if (wrapRef.value) { ro.observe(wrapRef.value); wrapW.value = wrapRef.value.clientWidth }
})
onUnmounted(() => { ro?.disconnect(); clearTimeout(timer) })

defineExpose({ page })
</script>

<style scoped>
/* Auto margins centre the page but keep its left edge reachable when zoomed wider than the screen */
.cvp{display:flex;flex-direction:column;align-items:flex-start;width:100%}
.cvp-stage{position:relative;flex-shrink:0;margin:0 auto}
.cvp-page{position:relative;width:700px;background:#fff;border-radius:3px;
  box-shadow:0 1px 2px rgba(17,24,39,.06),0 8px 28px rgba(17,24,39,.10);overflow:hidden}
.cvp-over{position:absolute;left:0;right:0;pointer-events:none;
  background:repeating-linear-gradient(-45deg,rgba(220,38,38,.05) 0 10px,rgba(220,38,38,.09) 10px 20px)}
/* The page is zoomed to fit the screen, so the marker is divided by that zoom to stay readable on a phone */
.cvp-break{position:absolute;left:0;right:0;height:0;border-top:calc(2px / var(--cvp-z,1)) dashed #dc2626;pointer-events:none}
.cvp-break span{position:absolute;right:calc(10px / var(--cvp-z,1));top:calc(-11px / var(--cvp-z,1));background:#dc2626;color:#fff;white-space:nowrap;
  font:600 calc(11px / var(--cvp-z,1))/calc(22px / var(--cvp-z,1)) Inter,sans-serif;padding:0 calc(8px / var(--cvp-z,1));border-radius:calc(6px / var(--cvp-z,1))}

.cvp-notice{width:100%;max-width:700px;margin-left:auto;margin-right:auto;display:flex;align-items:center;gap:10px;padding:10px 12px 10px 14px;margin-bottom:14px;
  border-radius:12px;font-size:13px;line-height:1.45;border:1px solid transparent}
.cvp-notice svg{width:18px;height:18px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:2}
.cvp-notice-txt{flex:1;min-width:0}
.cvp-notice strong{font-weight:600}
.cvp-notice.warn{background:var(--c-amber-lt);color:var(--c-amber);border-color:color-mix(in srgb,var(--c-amber) 20%,transparent)}
.cvp-notice.calm{background:var(--c-surface);color:var(--c-text2);border-color:var(--c-border)}
.cvp-notice .btn-primary{background:var(--c-amber);color:#fff}
@media (max-width:560px){
  .cvp-notice{gap:8px;padding:8px 8px 8px 10px;margin-bottom:10px;font-size:12px;line-height:1.35;border-radius:10px}
  .cvp-notice svg{width:16px;height:16px}
  .cvp-notice-more{display:none}
  .cvp-notice .btn-sm{white-space:nowrap}
}
</style>
