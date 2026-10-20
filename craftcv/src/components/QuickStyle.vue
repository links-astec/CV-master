<template>
  <!-- Always above the preview: the choices people change most (colour, layout, font, size, spacing).
       The Design tab keeps the rest (links, language, every layout with a preview). -->
  <div class="qs" role="toolbar" :aria-label="$t('Quick style')">
    <div class="qs-group qs-colours" role="radiogroup" :aria-label="$t('Colour')">
      <button v-for="t in THEMES" :key="t.id" type="button" role="radio" class="qs-sw" :class="{ on: current.theme === t.id }"
              :aria-checked="current.theme === t.id" :style="{ '--sw': t.accent }" :title="$t(t.name)" :aria-label="$t(t.name)" @click="setTheme(t.id)"></button>
    </div>
    <span class="qs-sep" aria-hidden="true"></span>

    <!-- Layout and font: a button with the current choice, a menu under it -->
    <button type="button" class="qs-pill" :class="{ open: menu === 'layout' }" aria-haspopup="listbox" :aria-expanded="menu === 'layout'" @click="toggle('layout', $event)">
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><line x1="3.5" y1="9" x2="20.5" y2="9"/><line x1="10" y1="9" x2="10" y2="20.5"/></svg>
      <span>{{ $t(layoutNow.name) }}</span><svg class="qs-chev" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <button type="button" class="qs-pill" :class="{ open: menu === 'font' }" aria-haspopup="listbox" :aria-expanded="menu === 'font'" @click="toggle('font', $event)">
      <span class="qs-aa" :style="{ fontFamily: fontStack(store.fmt.fontFamily) }">Aa</span>
      <span :style="{ fontFamily: fontStack(store.fmt.fontFamily) }">{{ fontNow.name }}</span><svg class="qs-chev" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
    </button>

    <!-- Text size: three A's, small to large -->
    <div class="qs-seg" role="radiogroup" :aria-label="$t('Text size')">
      <button v-for="(o, i) in SIZE" :key="o.v" type="button" role="radio" :class="{ on: store.fmt.fontSize === o.v }" :aria-checked="store.fmt.fontSize === o.v"
              :title="$t('Text size') + ': ' + $t(o.l)" :aria-label="$t(o.l)" @click="store.fmt.fontSize = o.v"><span class="qs-a" :style="{ fontSize: 11 + i * 3 + 'px' }">A</span></button>
    </div>

    <!-- Spacing: lines close together, normal, apart -->
    <div class="qs-seg" role="radiogroup" :aria-label="$t('Spacing')">
      <button v-for="(o, i) in SPACING" :key="o.v" type="button" role="radio" :class="{ on: store.fmt.sectionSpacing === o.v }" :aria-checked="store.fmt.sectionSpacing === o.v"
              :title="$t('Spacing') + ': ' + $t(o.l)" :aria-label="$t(o.l)" @click="setSpacing(o.v)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><line v-for="k in 3" :key="k" x1="5" x2="19" :y1="12 + (k - 2) * (3 + i * 2)" :y2="12 + (k - 2) * (3 + i * 2)"/></svg>
      </button>
    </div>

    <button type="button" class="qs-more" @click="$emit('more')">{{ $t('More design') }}</button>

    <Teleport to="body">
      <Transition name="qs-pop">
        <div v-if="menu" ref="pop" class="qs-pop" :class="{ sheet: asSheet }" :style="popStyle" role="listbox" :aria-label="$t(menu === 'font' ? 'Font' : 'Layout')" @keydown.esc="close">
          <template v-if="menu === 'font'">
            <button v-for="f in ALL_FONTS" :key="f.id" type="button" role="option" class="qs-opt" :class="{ on: store.fmt.fontFamily === f.id }" :aria-selected="store.fmt.fontFamily === f.id" @click="store.fmt.fontFamily = f.id; close()">
              <span class="qs-opt-t"><b :style="{ fontFamily: fontStack(f.id) }">{{ f.name }}</b><span>{{ $t(f.note) }}</span></span>
              <svg v-if="store.fmt.fontFamily === f.id" class="qs-tick" viewBox="0 0 24 24" aria-hidden="true"><polyline points="5 12.5 10 17.5 19 7"/></svg>
            </button>
          </template>
          <template v-else>
            <template v-for="k in ['ats', 'creative']" :key="k">
              <div class="qs-pop-h">{{ $t(LAYOUT_KINDS[k].name) }}</div>
              <button v-for="l in LAYOUTS.filter(x => x.kind === k)" :key="l.id" type="button" role="option" class="qs-opt" :class="{ on: current.layout === l.id }" :aria-selected="current.layout === l.id" @click="setLayout(l.id)">
                <span class="qs-opt-t"><b>{{ $t(l.name) }}</b><span>{{ $t(l.desc) }}</span></span>
                <svg v-if="current.layout === l.id" class="qs-tick" viewBox="0 0 24 24" aria-hidden="true"><polyline points="5 12.5 10 17.5 19 7"/></svg>
              </button>
            </template>
          </template>
        </div>
      </Transition>
      <div v-if="menu && asSheet" class="qs-scrim" @click="close"></div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onBeforeUnmount } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { THEMES, ALL_FONTS, fontStack, LAYOUTS, LAYOUT_KINDS, parseTemplate, templateId } from '../composables/cvRenderer.js'

defineEmits(['more'])
const store = useCvStore()
const current = computed(() => parseTemplate(store.template))
const layoutNow = computed(() => LAYOUTS.find(l => l.id === current.value.layout) || LAYOUTS[0])
const fontNow = computed(() => ALL_FONTS.find(f => f.id === store.fmt.fontFamily) || ALL_FONTS[0])
function setTheme(id) { store.template = templateId(current.value.layout, id) }
function setLayout(id) { store.template = templateId(id, current.value.theme); close() }
// The same values as the Design tab
const SIZE = [{ v: 'small', l: 'Small' }, { v: 'normal', l: 'Normal' }, { v: 'large', l: 'Large' }]
const SPACING = [{ v: 'compact', l: 'Compact' }, { v: 'normal', l: 'Normal' }, { v: 'relaxed', l: 'Relaxed' }]
// One spacing choice here sets both line and section spacing (the Design tab sets them apart)
function setSpacing(v) { store.fmt.sectionSpacing = v; store.fmt.lineSpacing = v }

// The menu: under its button on a computer, a sheet from the bottom on a phone
const menu = ref('')
const pop = ref(null)
const popStyle = ref({})
const asSheet = ref(false)
function toggle(which, e) {
  if (menu.value === which) return close()
  const r = e.currentTarget.getBoundingClientRect()
  asSheet.value = window.innerWidth < 640
  const w = which === 'layout' ? 320 : 260
  popStyle.value = asSheet.value ? {} : { top: r.bottom + 8 + 'px', left: Math.max(12, Math.min(r.left, window.innerWidth - w - 12)) + 'px', width: w + 'px' }
  menu.value = which
  nextTick(() => {
    pop.value?.querySelector('.qs-opt.on')?.scrollIntoView({ block: 'center' })
    pop.value?.querySelector('.qs-opt.on, .qs-opt')?.focus({ preventScroll: true })
    setTimeout(() => document.addEventListener('pointerdown', outside, true), 0)
  })
}
function close() { menu.value = ''; document.removeEventListener('pointerdown', outside, true) }
function outside(e) { if (!pop.value?.contains(e.target) && !e.target.closest?.('.qs-pill')) close() }
onBeforeUnmount(close)
</script>

<style scoped>
.qs{display:flex;flex-wrap:wrap;row-gap:8px;align-items:center;gap:10px;padding:10px 16px;background:var(--c-surface);border-bottom:1px solid var(--hair);overflow-x:auto;scrollbar-width:none;flex-shrink:0}
.qs::-webkit-scrollbar{display:none}
.qs-group{display:flex;align-items:center;gap:6px;flex-shrink:0}
.qs-sw{width:22px;height:22px;border-radius:50%;border:none;padding:0;background:var(--sw);cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);transition:transform .15s ease,box-shadow .15s ease;flex-shrink:0}
.qs-sw:hover{transform:scale(1.12)}
.qs-sw.on{box-shadow:0 0 0 2px var(--c-surface),0 0 0 4px var(--sw)}
.qs-sep{width:1px;height:22px;background:var(--hair);flex-shrink:0;margin:0 2px}

/* Layout and font buttons */
.qs-pill{flex-shrink:0;display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 10px 0 12px;border:none;border-radius:99px;background:var(--fill);color:var(--c-text);font:inherit;font-size:13.5px;font-weight:500;cursor:pointer;white-space:nowrap;transition:background .15s ease}
.qs-pill:hover,.qs-pill.open{background:color-mix(in srgb,var(--c-text) 9%,var(--c-surface))}
.qs-pill svg{width:16px;height:16px;fill:none;stroke:var(--c-text2);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.qs-pill .qs-chev{width:12px;height:12px;stroke:var(--c-text3);stroke-width:2.4;transition:transform .2s ease}
.qs-pill.open .qs-chev{transform:rotate(180deg)}
.qs-aa{font-size:15px;font-weight:600;color:var(--c-text2);line-height:1}

/* Size and spacing: segmented, like iOS */
.qs-seg{flex-shrink:0;display:inline-flex;padding:3px;gap:2px;border-radius:99px;background:var(--fill)}
.qs-seg button{width:34px;height:28px;display:flex;align-items:center;justify-content:center;border:none;border-radius:99px;background:none;color:var(--c-text2);cursor:pointer;transition:background .18s ease,color .18s ease,box-shadow .18s ease}
.qs-seg button:hover{color:var(--c-text)}
.qs-seg button.on{background:var(--c-surface);color:var(--c-text);box-shadow:0 1px 3px rgba(0,0,0,.1),0 1px 1px rgba(0,0,0,.04)}
.qs-a{font-weight:600;line-height:1}
.qs-seg svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}

.qs-more{margin-left:auto;flex-shrink:0;border:none;background:none;font:inherit;font-size:13.5px;font-weight:600;color:var(--c-accent);cursor:pointer;padding:6px 4px;white-space:nowrap}
.qs-more:hover{text-decoration:underline}

/* The menu */
.qs-pop{position:fixed;z-index:400;max-height:min(420px,calc(100vh - 140px));overflow-y:auto;padding:6px;border-radius:16px;
  background:color-mix(in srgb,var(--c-surface) 94%,transparent);-webkit-backdrop-filter:saturate(1.8) blur(20px);backdrop-filter:saturate(1.8) blur(20px);
  box-shadow:0 0 0 .5px rgba(0,0,0,.08),0 12px 40px -8px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.06);transform-origin:top left}
.qs-pop-h{font-size:12.5px;font-weight:600;color:var(--c-text3);padding:10px 12px 4px}
.qs-opt{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;border-radius:10px;background:none;font:inherit;text-align:left;color:var(--c-text);cursor:pointer}
.qs-opt:hover,.qs-opt:focus-visible{background:color-mix(in srgb,var(--c-text) 6%,transparent);outline:none}
.qs-opt-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.qs-opt-t b{font-size:15px;font-weight:600}
.qs-opt-t span{font-size:12.5px;color:var(--c-text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qs-opt.on .qs-opt-t b{color:var(--c-accent)}
.qs-tick{width:18px;height:18px;flex-shrink:0;fill:none;stroke:var(--c-accent);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.qs-pop-enter-active,.qs-pop-leave-active{transition:opacity .16s ease,transform .2s cubic-bezier(.2,.8,.2,1)}
.qs-pop-enter-from,.qs-pop-leave-to{opacity:0;transform:scale(.96) translateY(-4px)}

/* On a phone: a sheet from the bottom */
.qs-pop.sheet{left:8px;right:8px;bottom:8px;top:auto;width:auto;max-height:70vh;border-radius:22px;padding:8px 8px calc(8px + env(safe-area-inset-bottom));background:var(--c-surface);transform-origin:bottom center}
.qs-pop.sheet.qs-pop-enter-from,.qs-pop.sheet.qs-pop-leave-to{transform:translateY(24px)}
.qs-scrim{position:fixed;inset:0;z-index:399;background:rgba(0,0,0,.28)}
.qs-pop.sheet .qs-opt{padding:12px 14px}

@media (max-width:768px){ .qs{flex-wrap:nowrap;padding:10px 12px;gap:8px} }
</style>
