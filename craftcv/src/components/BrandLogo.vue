<template>
  <span class="brand" :class="[size, { 'on-dark': dark, 'on-blue': onBlue, animate, 'mark-only': markOnly }]" role="img" aria-label="CVMaster">
    <svg :viewBox="markOnly ? MARK_BOX : LOCKUP_BOX" aria-hidden="true">
      <defs>
        <linearGradient :id="gid" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0">
          <stop offset=".3" class="b-from" /><stop offset="1" class="b-to" />
        </linearGradient>
      </defs>
      <g :transform="markOnly ? null : 'translate(0 3)'">
        <path class="b-stroke" :d="MARK_PATH" pathLength="1" fill="none" :stroke="`url(#${gid})`" :stroke-width="MARK_STROKE" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <template v-if="!markOnly">
        <path v-for="(d, i) in WORD_LETTERS" :key="i" class="b-word" :d="d" :style="animate ? { animationDelay: (0.9 + i * 0.055).toFixed(3) + 's', '--dx': (i - 3.5) * 5 + 'px' } : null" />
      </template>
    </svg>
  </span>
</template>

<script setup>
// The CVMaster logo (mark + "CVMaster"), drawn from brand/brand.mjs. Follows light / dark mode.
// `animate` draws the stroke and brings the name in, for welcome moments.
import { computed } from 'vue'
import { MARK_PATH, MARK_STROKE, WORD_LETTERS, MARK_BOX, LOCKUP_BOX } from '../../brand/brand.mjs'
const props = defineProps({ small: Boolean, large: Boolean, markOnly: Boolean, dark: Boolean, onBlue: Boolean, animate: Boolean })
const size = computed(() => (props.small ? 'sm' : props.large ? 'lg' : 'md'))
// Each logo on the page needs its own gradient id
const gid = 'bl' + Math.random().toString(36).slice(2, 9)
</script>

<style scoped>
.brand{display:inline-flex;align-items:center;line-height:0}
.brand svg{display:block;height:28px;width:auto;overflow:visible}
.brand.sm svg{height:24px}
.brand.lg svg{height:40px}
.brand.mark-only svg{height:30px}
.brand.mark-only.sm svg{height:24px}
.brand.mark-only.lg svg{height:44px}
.b-from{stop-color:var(--b-from,#14142B)}
.b-to{stop-color:var(--b-to,#4338CA)}
.b-word{fill:var(--b-text,#14142B)}
:global([data-theme="dark"]){--b-from:#F3F4F6;--b-to:#8B85FF;--b-text:#F3F4F6}
.brand.on-dark{--b-from:#F3F4F6;--b-to:#8B85FF;--b-text:#F3F4F6}
.brand.on-blue{--b-from:#FFFFFF;--b-to:#A5B4FC;--b-text:#FFFFFF}

/* Entrance: the stroke draws itself, then the letters settle in one by one (as in the brand reveal) */
.animate .b-stroke{stroke-dasharray:1 2;stroke-dashoffset:1;animation:b-draw 1.15s cubic-bezier(.6,0,.25,1) .15s forwards}
.animate .b-word{opacity:0;animation:b-in .8s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes b-draw{to{stroke-dashoffset:0}}
@keyframes b-in{from{opacity:0;transform:translateX(var(--dx,-8px));filter:blur(5px)}to{opacity:1;transform:none;filter:none}}
@media (prefers-reduced-motion:reduce){
  .animate .b-stroke{stroke-dasharray:none;animation:none}
  .animate .b-word{opacity:1;animation:none}
}
</style>
