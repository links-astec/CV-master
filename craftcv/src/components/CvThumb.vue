<template>
  <div class="cvt" :style="{ aspectRatio: '700 / 990' }" ref="el">
    <div class="cvt-inner" :style="{ transform: `scale(${scale})` }" v-html="html"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { render } from '../composables/cvRenderer.js'

// Static, scaled-down first page of a CV (no measuring, no placeholders)
const props = defineProps({
  template: { type: String, required: true },
  data:     { type: Object, required: true },
  fmt:      { type: Object, default: () => ({}) },
})

const el = ref(null)
const width = ref(180)
const scale = computed(() => width.value / 700)
const html  = computed(() => render(props.template, props.data, props.fmt))

let ro
onMounted(() => {
  ro = new ResizeObserver(() => { if (el.value) width.value = el.value.clientWidth || width.value })
  if (el.value) { ro.observe(el.value); width.value = el.value.clientWidth || width.value }
})
onUnmounted(() => ro?.disconnect())
</script>

<style scoped>
.cvt{position:relative;width:100%;overflow:hidden;background:#fff}
.cvt-inner{position:absolute;top:0;left:0;width:700px;transform-origin:top left;pointer-events:none}
</style>
