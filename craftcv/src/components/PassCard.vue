<template>
  <div class="pc-wrap" :class="[size, { live: tilt }]" @pointermove="move" @pointerleave="leave">
    <div class="pc" :style="style" role="img" :aria-label="$t('Job Hunt Pass for {name}', { name: name || '' })">
      <!-- the CVMaster mark, large and faint, like a watermark in the card -->
      <svg class="pc-mark" viewBox="8 6 102 66" aria-hidden="true"><path :d="MARK_PATH" /></svg>
      <div class="pc-sheen" aria-hidden="true"></div>
      <div class="pc-top">
        <BrandLogo small on-blue />
        <span class="pc-plan">{{ $t(plan === 'quarter' ? 'Every 3 months' : 'Monthly') }}</span>
      </div>
      <div class="pc-title">{{ $t('Job Hunt Pass') }}</div>
      <div class="pc-foot">
        <div class="pc-name">{{ name }}</div>
        <div v-if="since" class="pc-since">{{ $t('Member since {date}', { date: sinceText }) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// The Job Hunt Pass as a card that belongs to its holder (name, member since, plan). On a computer it
// tilts toward the pointer and catches the light, like a card held in the hand.
import { computed, ref } from 'vue'
import BrandLogo from './BrandLogo.vue'
import { MARK_PATH } from '../../brand/brand.mjs'
import { locale } from '../i18n/index.js'

const props = defineProps({
  name: { type: String, default: '' },
  since: { type: String, default: '' },
  plan: { type: String, default: 'month' },
  size: { type: String, default: 'lg' },   // lg (Settings, welcome) · sm (My CVs)
  tilt: { type: Boolean, default: true },
})
const sinceText = computed(() => { try { return new Date(props.since).toLocaleDateString(locale(), { month: 'long', year: 'numeric' }) } catch { return '' } })

const rx = ref(0), ry = ref(0), mx = ref(30), my = ref(20)
const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
function move(e) {
  if (!props.tilt || reduce || e.pointerType === 'touch') return
  const r = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
  ry.value = (x - .5) * 14; rx.value = (.5 - y) * 10
  mx.value = x * 100; my.value = y * 100
}
function leave() { rx.value = 0; ry.value = 0; mx.value = 30; my.value = 20 }
const style = computed(() => ({ transform: `rotateX(${rx.value}deg) rotateY(${ry.value}deg)`, '--mx': mx.value + '%', '--my': my.value + '%' }))
</script>

<style scoped>
.pc-wrap{perspective:900px;width:100%;max-width:380px}
.pc-wrap.sm{max-width:150px}
.pc{position:relative;aspect-ratio:1.586;border-radius:20px;overflow:hidden;color:#fff;
  background:var(--c-accent);
  box-shadow:0 1px 1px rgba(0,0,0,.08),0 18px 40px -12px color-mix(in srgb,var(--c-accent) 70%,transparent),inset 0 0 0 1px rgba(255,255,255,.14);
  transform-style:preserve-3d;transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s ease;
  display:flex;flex-direction:column;padding:22px 24px;text-align:left}
.live .pc{will-change:transform}
.pc-mark{position:absolute;right:-14%;bottom:-30%;width:78%;fill:none;stroke:rgba(255,255,255,.1);stroke-width:10;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
.pc-sheen{position:absolute;inset:0;pointer-events:none;background:radial-gradient(60% 70% at var(--mx) var(--my),rgba(255,255,255,.22),transparent 60%);transition:background .2s ease}
.pc-top{position:relative;display:flex;align-items:center;justify-content:space-between}
.pc-plan{font-size:12px;font-weight:600;color:rgba(255,255,255,.8)}
.pc-title{position:relative;margin-top:auto;font-size:24px;font-weight:700;letter-spacing:-.03em}
.pc-foot{position:relative;display:flex;flex-direction:column;gap:2px;margin-top:8px;min-width:0}
.pc-name{font-size:15.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.pc-since{font-size:11.5px;color:rgba(255,255,255,.75);white-space:nowrap}
:global([data-theme="dark"]) .pc{background:#5b54e8}
/* Small: on My CVs */
.sm .pc{border-radius:11px;padding:9px 10px;box-shadow:0 8px 18px -8px color-mix(in srgb,var(--c-accent) 70%,transparent),inset 0 0 0 1px rgba(255,255,255,.14)}
.sm .pc-top :deep(.brand svg){height:13px}
.sm .pc-plan,.sm .pc-foot{display:none}
.sm .pc-title{font-size:12px;letter-spacing:-.01em;white-space:nowrap}
@media (prefers-reduced-motion:reduce){ .pc{transition:none} }
</style>
