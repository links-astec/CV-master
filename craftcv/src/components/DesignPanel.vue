<template>
  <div class="dp">
    <!-- A layout with a photo, and no photo on this CV yet -->
    <div v-if="needsPhoto" class="dp-photo">
      <img v-if="profilePhoto" :src="profilePhoto" alt="" />
      <span v-else class="dp-photo-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
      <span class="dp-photo-t">{{ $t(profilePhoto ? 'This layout shows a photo. Use your profile picture?' : 'This layout shows a photo. Add one in Content, under Personal details.') }}</span>
      <button v-if="profilePhoto" type="button" class="btn-primary accent btn-sm" @click="store.data.photo = profilePhoto">{{ $t('Use my profile picture') }}</button>
    </div>
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
      <div class="dp-fonts" role="radiogroup" :aria-label="$t('Font')">
        <button v-for="f in ALL_FONTS" :key="f.id" type="button" role="radio" class="dp-font" :class="{ on: store.fmt.fontFamily === f.id }"
                :aria-checked="store.fmt.fontFamily === f.id" @click="store.fmt.fontFamily = f.id">
          <span class="dp-font-aa" :style="{ fontFamily: `'${f.id}'` }">Aa</span>
          <span class="dp-font-n">{{ f.name }}</span>
        </button>
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
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useCvStore, hasDraftableContent } from '../stores/cv.js'
import { LAYOUTS, LAYOUT_KINDS, THEMES, ALL_FONTS, parseTemplate, templateId, getLayout, getTheme } from '../composables/cvRenderer.js'
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
const auth = useAuthStore()
// The profile picture, offered when the layout shows a photo and this CV (their own) has none
const profilePhoto = computed(() => store.data.cvFor === 'other' ? null : (store.profile?.profile?.photo || auth.user?.photo || null))
onMounted(() => { if (!store.profile && auth.isLoggedIn) store.loadProfile() })
const needsPhoto = computed(() => !!getLayout(current.value.layout)?.photo && !store.data.photo)

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
.dp-photo{display:flex;align-items:center;gap:12px;padding:12px 14px;margin-bottom:18px;border-radius:16px;background:var(--c-accent-lt);font-size:13.5px;color:var(--c-text)}
.dp-photo img{width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0}
.dp-photo-ic{width:44px;height:44px;border-radius:50%;background:var(--c-surface);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dp-photo-ic svg{width:20px;height:20px;fill:none;stroke:var(--c-accent);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.dp-photo-t{flex:1;min-width:0;font-weight:500}
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
.dp-swatches{display:grid;grid-template-columns:repeat(12,minmax(0,28px));gap:8px}
.dp-swatch{width:100%;aspect-ratio:1;border-radius:50%;background:var(--sw);border:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1);transition:transform .12s}
.dp-swatch:hover{transform:scale(1.08)}
.dp-swatch.active{box-shadow:0 0 0 2px var(--c-surface),0 0 0 4px var(--sw)}
.dp-seg{display:flex;width:100%}
/* Fonts: a tile per font, written in that font */
.dp-fonts{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}
.dp-font{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 6px 10px;border:none;border-radius:14px;background:var(--fill);color:var(--c-text);font:inherit;cursor:pointer;transition:background .15s ease,box-shadow .15s ease}
.dp-font:hover{background:color-mix(in srgb,var(--c-text) 8%,var(--c-surface))}
.dp-font.on{background:var(--c-surface);box-shadow:inset 0 0 0 2px var(--c-accent)}
.dp-font-aa{font-size:24px;line-height:1.1;font-weight:500}
.dp-font-n{font-size:12px;color:var(--c-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.dp-font.on .dp-font-n{color:var(--c-accent);font-weight:600}
.dp-seg button{flex:1;padding:0 6px}
.dp-grid{display:grid;grid-template-columns:1fr;gap:18px}
@media (max-width:640px){ .dp-layouts{gap:12px} .dp-layout{padding:12px 12px 10px;border-radius:18px} }
@media (max-width:420px){ .dp-swatches{grid-template-columns:repeat(6,1fr);max-width:260px} }
</style>
