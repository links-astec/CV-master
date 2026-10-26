<template>
  <!-- A date or period on the CV: type it any way (tidied into one format when you leave the field), or
       pick months from a calendar. "single" is for one date, such as a qualification's year. -->
  <div class="pf" ref="root">
    <input class="f-inp pf-in" :value="modelValue" :placeholder="placeholder" @input="$emit('update:modelValue', $event.target.value)" @blur="tidy" />
    <button type="button" class="pf-cal" :class="{ on: open }" :aria-label="$t('Pick dates')" :aria-expanded="open" @click="toggle">
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>
    </button>
    <div v-if="open" class="pf-pop" role="dialog" :aria-label="$t('Pick dates')">
      <label class="pf-row"><span>{{ $t(single ? 'Date' : 'Start') }}</span><input type="month" class="pf-month" v-model="start" @change="write" /></label>
      <template v-if="!single">
        <label class="pf-row"><span>{{ $t('End') }}</span><input type="month" class="pf-month" v-model="end" :disabled="ongoing" @change="write" /></label>
        <label class="pf-check"><input type="checkbox" v-model="ongoing" @change="write" /><span>{{ $t(ongoing ? 'Still going' : 'Still going (no end date)') }}</span></label>
      </template>
      <div class="pf-ft">
        <button type="button" class="pf-yearonly" @click="yearsOnly">{{ $t('Years only') }}</button>
        <button type="button" class="pf-done" @click="open = false">{{ $t('Done') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { parsePeriod, formatPeriod, normalizePeriod, toMonthInput, fromMonthInput } from '../composables/period.js'

const props = defineProps({ modelValue: { type: String, default: '' }, placeholder: String, single: Boolean })
const emit = defineEmits(['update:modelValue'])
const store = useCvStore()
const lang = () => (store.data.lang === 'fr' ? 'fr' : 'en')
const root = ref(null), open = ref(false), start = ref(''), end = ref(''), ongoing = ref(false)

// Typed by hand: tidied into the CV's format once the person leaves the field
function tidy() {
  const v = normalizePeriod(props.modelValue, lang())
  if (v !== props.modelValue) emit('update:modelValue', v)
}
// Opening the calendar starts from whatever is in the field
function toggle() {
  if (!open.value) {
    const p = parsePeriod(props.modelValue)
    start.value = toMonthInput(p?.start)
    ongoing.value = p?.end === 'present'
    end.value = toMonthInput(p?.end)
  }
  open.value = !open.value
}
function write() {
  const s = fromMonthInput(start.value)
  if (!s) return
  const e = props.single ? null : ongoing.value ? 'present' : fromMonthInput(end.value)
  emit('update:modelValue', formatPeriod({ start: s, end: e }, lang()))
}
// The same dates, without months (some people prefer "2021 – 2023")
function yearsOnly() {
  const p = parsePeriod(props.modelValue)
  if (!p) return
  const y = (x) => (x && x !== 'present' ? { y: x.y, m: null } : x)
  emit('update:modelValue', formatPeriod({ start: y(p.start), end: y(p.end) }, lang()))
  open.value = false
}
const away = (e) => { if (open.value && root.value && !root.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('pointerdown', away))
onBeforeUnmount(() => document.removeEventListener('pointerdown', away))
</script>

<style scoped>
.pf{position:relative}
.pf-in{padding-right:40px!important}
.pf-cal{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:32px;height:32px;border:none;border-radius:8px;background:none;color:var(--c-text3);display:flex;align-items:center;justify-content:center;cursor:pointer}
.pf-cal:hover,.pf-cal.on{color:var(--c-accent);background:color-mix(in srgb,var(--c-accent) 9%,transparent)}
.pf-cal svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.pf-pop{position:absolute;z-index:30;top:calc(100% + 6px);right:0;width:min(290px,calc(100vw - 48px));background:var(--c-surface);border-radius:16px;box-shadow:var(--shadow-xl);padding:12px;display:flex;flex-direction:column;gap:8px}
.pf-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13.5px;color:var(--c-text2)}
.pf-month{flex:1;min-width:0;max-width:170px;height:36px;border:none;border-radius:10px;background:var(--fill);padding:0 10px;font:inherit;font-size:14px;color:var(--c-text)}
.pf-month:disabled{opacity:.45}
.pf-check{display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--c-text2);cursor:pointer}
.pf-check input{accent-color:var(--c-accent);width:16px;height:16px}
.pf-ft{display:flex;justify-content:space-between;align-items:center;margin-top:2px}
.pf-yearonly{border:none;background:none;padding:6px 2px;font:inherit;font-size:13px;color:var(--c-text3);cursor:pointer}
.pf-done{height:32px;padding:0 16px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}
</style>
