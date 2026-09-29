<template>
  <div class="dp">
    <section class="dp-sec">
      <div class="dp-hd">Layout</div>
      <div class="dp-layouts">
        <button v-for="l in LAYOUTS" :key="l.id" class="dp-layout" :class="{ active: current.layout === l.id }"
                @click="setLayout(l.id)" :title="l.desc">
          <CvThumb :template="`${l.id}:${current.theme}`" :data="thumbData" :fmt="store.fmt" />
          <span>{{ l.name }}</span>
        </button>
      </div>
      <p class="dp-note">{{ layoutDesc }}</p>
    </section>

    <section class="dp-sec">
      <div class="dp-hd">Colour <span class="dp-val">{{ themeName }}</span></div>
      <div class="dp-swatches">
        <button v-for="t in THEMES" :key="t.id" class="dp-swatch" :class="{ active: current.theme === t.id }"
                :style="{ '--sw': t.accent }" :title="t.name" :aria-label="t.name" @click="setTheme(t.id)"></button>
      </div>
    </section>

    <section class="dp-sec">
      <div class="dp-hd">Font</div>
      <div class="seg dp-seg">
        <button v-for="f in FONTS" :key="f.id" :class="{ active: store.fmt.fontFamily === f.id }"
                :style="{ fontFamily: `'${f.id}'` }" @click="store.fmt.fontFamily = f.id">{{ f.name }}</button>
      </div>
    </section>

    <section class="dp-sec dp-grid">
      <div>
        <div class="dp-hd">Text size</div>
        <div class="seg dp-seg">
          <button v-for="o in SIZE" :key="o.v" :class="{ active: store.fmt.fontSize === o.v }" @click="store.fmt.fontSize = o.v">{{ o.l }}</button>
        </div>
      </div>
      <div>
        <div class="dp-hd">Line spacing</div>
        <div class="seg dp-seg">
          <button v-for="o in SPACING" :key="o.v" :class="{ active: store.fmt.lineSpacing === o.v }" @click="store.fmt.lineSpacing = o.v">{{ o.l }}</button>
        </div>
      </div>
      <div>
        <div class="dp-hd">Section spacing</div>
        <div class="seg dp-seg">
          <button v-for="o in SPACING" :key="o.v" :class="{ active: store.fmt.sectionSpacing === o.v }" @click="store.fmt.sectionSpacing = o.v">{{ o.l }}</button>
        </div>
      </div>
      <div>
        <div class="dp-hd">CV language</div>
        <div class="seg dp-seg">
          <button :class="{ active: store.data.lang !== 'fr' }" @click="store.data.lang = 'en'">English</button>
          <button :class="{ active: store.data.lang === 'fr' }" @click="store.data.lang = 'fr'">Français</button>
        </div>
      </div>
    </section>
    <p class="dp-note">Tip: “Compact” spacing and a smaller text size help a long CV fit on one page without shrinking it.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCvStore, hasDraftableContent } from '../stores/cv.js'
import { LAYOUTS, THEMES, FONTS, parseTemplate, templateId, getLayout, getTheme } from '../composables/cvRenderer.js'
import { SAMPLE_CV } from '../composables/sampleCv.js'
import CvThumb from './CvThumb.vue'

const store = useCvStore()
const SIZE    = [{ v: 'small', l: 'Small' }, { v: 'normal', l: 'Normal' }, { v: 'large', l: 'Large' }]
const SPACING = [{ v: 'compact', l: 'Compact' }, { v: 'normal', l: 'Normal' }, { v: 'relaxed', l: 'Relaxed' }]

const current    = computed(() => parseTemplate(store.template))
const themeName  = computed(() => getTheme(current.value.theme)?.name)
const layoutDesc = computed(() => getLayout(current.value.layout)?.desc)
// Show the user's own CV in the thumbnails once there is something to show
const thumbData  = computed(() => hasDraftableContent(store.data) ? store.data : SAMPLE_CV)

function setLayout(id) { store.template = templateId(id, current.value.theme) }
function setTheme(id)  { store.template = templateId(current.value.layout, id) }
</script>

<style scoped>
.dp-sec{margin-bottom:24px}
.dp-hd{font-size:12.5px;font-weight:600;color:var(--c-text);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.dp-val{font-weight:500;color:var(--c-text3)}
.dp-layouts{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.dp-layout{display:flex;flex-direction:column;gap:6px;padding:0;background:none;border:none;text-align:center;font-size:12px;font-weight:500;color:var(--c-text2)}
.dp-layout :deep(.cvt){border-radius:6px;border:1px solid var(--c-border);box-shadow:var(--shadow-xs);transition:box-shadow .15s,border-color .15s}
.dp-layout:hover :deep(.cvt){border-color:var(--c-border2);box-shadow:var(--shadow-sm)}
.dp-layout.active{color:var(--c-accent);font-weight:600}
.dp-layout.active :deep(.cvt){border-color:var(--c-accent);box-shadow:0 0 0 3px var(--c-accent-ring)}
.dp-note{font-size:12.5px;color:var(--c-text3);margin-top:10px;line-height:1.5}
.dp-swatches{display:grid;grid-template-columns:repeat(12,1fr);gap:7px}
.dp-swatch{width:100%;aspect-ratio:1;border-radius:50%;background:var(--sw);border:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1);transition:transform .12s}
.dp-swatch:hover{transform:scale(1.08)}
.dp-swatch.active{box-shadow:0 0 0 2px var(--c-surface),0 0 0 4px var(--sw)}
.dp-seg{display:flex;width:100%}
.dp-seg button{flex:1;padding:0 6px}
.dp-grid{display:grid;grid-template-columns:1fr;gap:18px}
@media (max-width:420px){ .dp-layouts{grid-template-columns:repeat(4,1fr);gap:8px} .dp-swatches{grid-template-columns:repeat(6,1fr);max-width:260px} }
</style>
