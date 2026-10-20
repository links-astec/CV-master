<template>
  <!-- Always above the preview: the choices people change most (colour, font, size, spacing).
       The Design tab keeps the rest (layouts, links, language). -->
  <div class="qs" role="toolbar" :aria-label="$t('Quick style')">
    <div class="qs-group qs-colours" role="radiogroup" :aria-label="$t('Colour')">
      <button v-for="t in THEMES" :key="t.id" type="button" role="radio" class="qs-sw" :class="{ on: current.theme === t.id }"
              :aria-checked="current.theme === t.id" :style="{ '--sw': t.accent }" :title="$t(t.name)" :aria-label="$t(t.name)" @click="setTheme(t.id)"></button>
    </div>
    <span class="qs-sep" aria-hidden="true"></span>
    <label class="qs-group qs-pick">
      <span class="qs-l">{{ $t('Font') }}</span>
      <select v-model="store.fmt.fontFamily" class="qs-sel" :aria-label="$t('Font')">
        <option v-for="f in FONTS" :key="f.id" :value="f.id">{{ f.name }}</option>
      </select>
    </label>
    <label class="qs-group qs-pick">
      <span class="qs-l">{{ $t('Text size') }}</span>
      <select v-model="store.fmt.fontSize" class="qs-sel" :aria-label="$t('Text size')">
        <option v-for="o in SIZE" :key="o.v" :value="o.v">{{ $t(o.l) }}</option>
      </select>
    </label>
    <label class="qs-group qs-pick">
      <span class="qs-l">{{ $t('Spacing') }}</span>
      <select :value="store.fmt.sectionSpacing" class="qs-sel" :aria-label="$t('Spacing')" @change="setSpacing($event.target.value)">
        <option v-for="o in SPACING" :key="o.v" :value="o.v">{{ $t(o.l) }}</option>
      </select>
    </label>
    <button type="button" class="qs-more" @click="$emit('more')">{{ $t('Layouts & more') }}</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { THEMES, FONTS, parseTemplate, templateId } from '../composables/cvRenderer.js'

defineEmits(['more'])
const store = useCvStore()
const current = computed(() => parseTemplate(store.template))
function setTheme(id) { store.template = templateId(current.value.layout, id) }
// The same values as the Design tab
const SIZE = [{ v: 'small', l: 'Small' }, { v: 'normal', l: 'Normal' }, { v: 'large', l: 'Large' }]
const SPACING = [{ v: 'compact', l: 'Compact' }, { v: 'normal', l: 'Normal' }, { v: 'relaxed', l: 'Relaxed' }]
// One spacing choice here sets both line and section spacing (the Design tab sets them apart)
function setSpacing(v) { store.fmt.sectionSpacing = v; store.fmt.lineSpacing = v }
</script>

<style scoped>
.qs{display:flex;flex-wrap:wrap;row-gap:8px;align-items:center;gap:14px;padding:10px 16px;background:var(--c-surface);border-bottom:1px solid var(--c-border);overflow-x:auto;scrollbar-width:none;flex-shrink:0}
.qs::-webkit-scrollbar{display:none}
.qs-group{display:flex;align-items:center;gap:6px;flex-shrink:0}
.qs-sw{width:22px;height:22px;border-radius:50%;border:none;padding:0;background:var(--sw);cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);transition:transform .15s ease,box-shadow .15s ease;flex-shrink:0}
.qs-sw:hover{transform:scale(1.12)}
.qs-sw.on{box-shadow:0 0 0 2px var(--c-surface),0 0 0 4px var(--sw)}
.qs-sep{width:1px;height:22px;background:var(--hair);flex-shrink:0}
.qs-l{font-size:12.5px;color:var(--c-text3);font-weight:500}
.qs-sel{height:32px;padding:0 28px 0 12px;border:none;border-radius:99px;background:var(--fill) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 10px center/12px;-webkit-appearance:none;appearance:none;font:inherit;font-size:13.5px;font-weight:500;color:var(--c-text);cursor:pointer}
.qs-more{margin-left:auto;flex-shrink:0;border:none;background:none;font:inherit;font-size:13.5px;font-weight:600;color:var(--c-accent);cursor:pointer;padding:6px 4px;white-space:nowrap}
.qs-more:hover{text-decoration:underline}
@media (max-width:768px){
  .qs{flex-wrap:nowrap;padding:10px 12px;gap:12px}
  .qs-l{display:none}
}
</style>
