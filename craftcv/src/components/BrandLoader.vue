<template>
  <span class="bld" role="status" :aria-label="label || $t('Loading…')">
    <svg :viewBox="MARK_BOX" :style="{ height: size + 'px' }" aria-hidden="true">
      <defs>
        <linearGradient :id="gid" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0">
          <stop offset=".3" class="b-from" /><stop offset="1" class="b-to" />
        </linearGradient>
      </defs>
      <path :d="MARK_PATH" pathLength="1" fill="none" :stroke="`url(#${gid})`" :stroke-width="MARK_STROKE" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="1">
        <animate attributeName="stroke-dashoffset" values="1;0;0;-1" keyTimes="0;.45;.62;1" dur="1.9s" repeatCount="indefinite" calcMode="spline" keySplines=".65 0 .35 1;.65 0 .35 1;.65 0 .35 1" />
      </path>
    </svg>
    <span v-if="label" class="bld-txt">{{ label }}</span>
  </span>
</template>

<script setup>
// The brand loader: the mark draws itself, rests, then clears, on a loop (brand/animations/loader.html)
import { MARK_PATH, MARK_STROKE, MARK_BOX } from '../../brand/brand.mjs'
defineProps({ size: { type: Number, default: 40 }, label: { type: String, default: '' } })
const gid = 'ld' + Math.random().toString(36).slice(2, 9)
</script>

<style scoped>
.bld{display:inline-flex;flex-direction:column;align-items:center;gap:14px}
.bld svg{display:block;width:auto;overflow:visible}
.b-from{stop-color:var(--b-from,#14142B)}
.b-to{stop-color:var(--b-to,#4338CA)}
.bld-txt{font-size:13.5px;font-weight:500;color:var(--c-text2);letter-spacing:-.005em}
:global([data-theme="dark"]){--b-from:#F3F4F6;--b-to:#8B85FF}
</style>
