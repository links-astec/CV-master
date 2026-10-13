<template>
  <div class="dp">
    <section class="dp-sec">
      <template v-for="k in ['ats', 'creative']" :key="k">
      <div class="dp-hd">{{ $t(LAYOUT_KINDS[k].name) }} <span class="dp-val">{{ $t(k === 'ats' ? 'online applications' : 'print & in person') }}</span></div>
      <div class="dp-layouts">
        <button v-for="l in LAYOUTS.filter(x => x.kind === k)" :key="l.id" class="dp-layout" :class="{ active: current.layout === l.id }"
                @click="setLayout(l.id)" :title="$t(l.desc)">
          <CvThumb :template="`${l.id}:${current.theme}`" :data="thumbData" :fmt="store.fmt" />
          <span class="dp-lname">{{ $t(l.name) }}</span>
          <span v-if="current.layout === l.id" class="dp-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg></span>
        </button>
      </div>
      </template>
      <p class="dp-note">{{ $t(layoutDesc) }}</p>
    </section>

    <section class="dp-sec">
      <div class="dp-hd">{{ $t('Colour') }} <span class="dp-val">{{ $t(themeName) }}</span></div>
      <div class="dp-swatches">
        <button v-for="t in THEMES" :key="t.id" class="dp-swatch" :class="{ active: current.theme === t.id }"
                :style="{ '--sw': t.accent }" :title="$t(t.name)" :aria-label="$t(t.name)" @click="setTheme(t.id)"></button>
      </div>
    </section>

    <section class="dp-sec">
      <div class="dp-hd">{{ $t('Font') }}</div>
      <div class="seg dp-seg">
        <button v-for="f in FONTS" :key="f.id" :class="{ active: store.fmt.fontFamily === f.id }"
                :style="{ fontFamily: `'${f.id}'` }" @click="store.fmt.fontFamily = f.id">{{ f.name }}</button>
      </div>
    </section>

    <section class="dp-sec dp-grid">
      <div>
        <div class="dp-hd">{{ $t('Text size') }}</div>
        <div class="seg dp-seg">
          <button v-for="o in SIZE" :key="o.v" :class="{ active: store.fmt.fontSize === o.v }" @click="store.fmt.fontSize = o.v">{{ $t(o.l) }}</button>
        </div>
      </div>
      <div>
        <div class="dp-hd">{{ $t('Line spacing') }}</div>
        <div class="seg dp-seg">
          <button v-for="o in SPACING" :key="o.v" :class="{ active: store.fmt.lineSpacing === o.v }" @click="store.fmt.lineSpacing = o.v">{{ $t(o.l) }}</button>
        </div>
      </div>
      <div>
        <div class="dp-hd">{{ $t('Section spacing') }}</div>
        <div class="seg dp-seg">
          <button v-for="o in SPACING" :key="o.v" :class="{ active: store.fmt.sectionSpacing === o.v }" @click="store.fmt.sectionSpacing = o.v">{{ $t(o.l) }}</button>
        </div>
      </div>
      <div>
        <div class="dp-hd">{{ $t('Links') }}</div>
        <div class="seg dp-seg">
          <button :class="{ active: store.fmt.linkStyle !== 'underline' }" @click="store.fmt.linkStyle = 'plain'">{{ $t('Plain text') }}</button>
          <button :class="{ active: store.fmt.linkStyle === 'underline' }" @click="store.fmt.linkStyle = 'underline'">{{ $t('Underlined') }}</button>
        </div>
        <div class="seg dp-seg" style="margin-top:8px">
          <button :class="{ active: store.fmt.linkText !== 'full' }" @click="store.fmt.linkText = 'short'">{{ $t('Short labels') }}</button>
          <button :class="{ active: store.fmt.linkText === 'full' }" @click="store.fmt.linkText = 'full'">{{ $t('Full addresses') }}</button>
        </div>
        <p class="dp-hint">{{ $t('Long links show as “LinkedIn” or “Website” with short labels. Tracking junk (like ?utm_source=…) is always removed, and every link stays clickable in your PDF.') }}</p>
      </div>
      <div>
        <div class="dp-hd">{{ $t('CV language') }}</div>
        <div class="seg dp-seg">
          <button :class="{ active: store.data.lang !== 'fr' }" @click="switchLang('en')">English</button>
          <button :class="{ active: store.data.lang === 'fr' }" @click="switchLang('fr')">Français</button>
        </div>
        <div v-if="undo" class="dp-undo">
          <span>{{ undo.count ? $t(undo.count === 1 ? 'Translated {n} section.' : 'Translated {n} sections.', { n: undo.count }) : $t('Headings switched.') }}</span>
          <button class="link-btn" @click="undoTranslate">{{ $t('Undo') }}</button>
        </div>
      </div>
    </section>
    <TranslateModal :show="!!translateTo" :to="translateTo || 'fr'" @close="translateTo = null" @applied="onTranslated" />
    <p class="dp-note">{{ $t('Tip: “Compact” spacing and a smaller text size help a long CV fit on one page without shrinking it.') }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCvStore, hasDraftableContent } from '../stores/cv.js'
import { LAYOUTS, LAYOUT_KINDS, THEMES, FONTS, parseTemplate, templateId, getLayout, getTheme } from '../composables/cvRenderer.js'
import { sampleCv } from '../composables/sampleCv.js'
import CvThumb from './CvThumb.vue'
import TranslateModal from './TranslateModal.vue'

const store = useCvStore()
const SIZE    = [{ v: 'small', l: 'Small' }, { v: 'normal', l: 'Normal' }, { v: 'large', l: 'Large' }]
const SPACING = [{ v: 'compact', l: 'Compact' }, { v: 'normal', l: 'Normal' }, { v: 'relaxed', l: 'Relaxed' }]

const current    = computed(() => parseTemplate(store.template))
const themeName  = computed(() => getTheme(current.value.theme)?.name)
const layoutDesc = computed(() => getLayout(current.value.layout)?.desc)
// Show the user's own CV in the thumbnails once there is something to show
const thumbData  = computed(() => hasDraftableContent(store.data) ? store.data : sampleCv())

function setLayout(id) { store.template = templateId(id, current.value.theme) }
function setTheme(id)  { store.template = templateId(current.value.layout, id) }

// Switching language translates the CV content too, reviewed in TranslateModal
const translateTo = ref(null)
const undo = ref(null)
function switchLang(lang) {
  const now = store.data.lang === 'fr' ? 'fr' : 'en'
  if (lang !== now) translateTo.value = lang
}
function onTranslated(info) { undo.value = info }
function undoTranslate() {
  if (undo.value) store.data = undo.value.snapshot
  undo.value = null
}
</script>

<style scoped>
.dp-sec{margin-bottom:24px}
.dp-hd{font-size:14px;font-weight:700;letter-spacing:-.01em;color:var(--c-text);margin-bottom:12px;display:flex;align-items:baseline;gap:8px}
.dp-val{font-size:13px;font-weight:500;color:var(--c-text3)}
/* Two big previews per row, each on its own soft tile, so people can really see each layout */
.dp-layouts{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:22px}
.dp-layout{position:relative;display:flex;flex-direction:column;gap:12px;padding:16px 16px 14px;background:var(--fill);border:none;border-radius:20px;text-align:left;
  transition:background .25s var(--ease),box-shadow .25s var(--ease),transform .25s var(--ease)}
.dp-layout:hover{background:var(--fill-hover);transform:translateY(-2px)}
.dp-layout :deep(.cvt){border-radius:4px;border:none;box-shadow:0 1px 2px rgba(20,20,43,.06),0 10px 24px rgba(20,20,43,.10);transition:transform .35s var(--ease)}
.dp-layout:hover :deep(.cvt){transform:translateY(-2px)}
.dp-lname{font-size:14px;font-weight:600;letter-spacing:-.01em;color:var(--c-text);padding:0 2px}
.dp-layout.active{background:var(--c-accent-lt);box-shadow:inset 0 0 0 2px var(--c-accent)}
.dp-layout.active .dp-lname{color:var(--c-accent)}
.dp-tick{position:absolute;top:10px;right:10px;width:26px;height:26px;border-radius:50%;background:var(--c-accent);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(67,56,202,.35)}
.dp-tick svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.dp-undo{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px;padding:8px 12px;border-radius:9px;background:var(--c-green-lt);color:var(--c-green);font-size:13px;font-weight:600}
.dp-note{font-size:12.5px;color:var(--c-text3);margin-top:10px;line-height:1.5}
.dp-hint{font-size:12px;color:var(--c-text3);margin-top:6px;line-height:1.45}
.dp-swatches{display:grid;grid-template-columns:repeat(12,1fr);gap:7px}
.dp-swatch{width:100%;aspect-ratio:1;border-radius:50%;background:var(--sw);border:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1);transition:transform .12s}
.dp-swatch:hover{transform:scale(1.08)}
.dp-swatch.active{box-shadow:0 0 0 2px var(--c-surface),0 0 0 4px var(--sw)}
.dp-seg{display:flex;width:100%}
.dp-seg button{flex:1;padding:0 6px}
.dp-grid{display:grid;grid-template-columns:1fr;gap:18px}
@media (max-width:640px){ .dp-layouts{gap:12px} .dp-layout{padding:12px 12px 10px;border-radius:18px} }
@media (max-width:420px){ .dp-swatches{grid-template-columns:repeat(6,1fr);max-width:260px} }
</style>
