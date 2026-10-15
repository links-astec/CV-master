<template>
  <div class="ed">
    <!-- Editing panel (desktop) -->
    <aside class="ed-panel hide-mobile" :class="{ collapsed: !panelOpen, wide: panelTab === 'design' }">
      <CvEditor ref="editorRef" @pay="openPaywall" @tab="t => panelTab = t" />
    </aside>

    <!-- Preview -->
    <section class="ed-preview">
      <div class="ed-bar">
        <div class="ed-bar-l">
          <button class="icon-btn hide-mobile" @click="panelOpen = !panelOpen" :title="$t(panelOpen ? 'Hide editor' : 'Show editor')">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="4" x2="9" y2="20"/></svg>
          </button>
          <button class="ed-design" @click="showDesign" :title="$t('Change layout and colour')">
            <span class="ed-swatch" :style="{ background: theme.accent }"></span>
            <span class="ed-design-l">{{ label }}</span>
            <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <span class="ed-saved hide-mobile">{{ savedText }}</span>
        </div>
        <div class="ed-bar-r">
          <button class="icon-btn show-mobile" @click="zoom = zoom === 'fit' ? PHONE_ZOOM : 'fit'"
                  :title="$t(zoom === 'fit' ? 'Zoom in' : 'Fit to screen')" :aria-label="$t(zoom === 'fit' ? 'Zoom in' : 'Fit to screen')">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line v-if="zoom === 'fit'" x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <div class="seg hide-mobile">
            <button v-for="z in ZOOMS" :key="z.l" :class="{ active: zoom === z.v }" @click="zoom = z.v">{{ $t(z.l) }}</button>
          </div>
          <button class="btn-primary accent" @click="openPaywall">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {{ $t('Export PDF') }}
          </button>
        </div>
      </div>

      <div class="ed-canvas" :class="{ zoomed: phone && zoom !== 'fit' }">
        <CvPreview :template="store.template" :data="store.data" :fmt="store.fmt"
                   :scale="zoom" :max-scale="1.05" :padding="phone ? 0 : 64"
                   v-model:fitAccepted="store.data.shrinkToFit" />
      </div>

      <button class="ed-edit-fab show-mobile" @click="drawer = true">
        <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>
        {{ $t('Edit CV') }}
      </button>
    </section>

    <!-- Mobile editing drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawer" class="drawer-backdrop" @click.self="drawer = false">
          <div class="drawer">
            <div class="drawer-hd">
              <span class="drawer-grab" aria-hidden="true"></span>
              <span class="drawer-t">{{ $t('Edit CV') }}</span>
              <button class="btn-primary btn-sm accent" @click="drawer = false">{{ $t('Done') }}</button>
            </div>
            <CvEditor ref="drawerRef" @pay="drawer = false; openPaywall()" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCvStore } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'
import { parseTemplate, templateLabel, getTheme } from '../composables/cvRenderer.js'
import CvEditor from '../components/CvEditor.vue'
import CvPreview from '../components/CvPreview.vue'
import { t } from '../i18n/index.js'

const store = useCvStore()
const auth  = useAuthStore()
const openPaywall = inject('openPaywall')

const ZOOMS = [{ l: 'Fit', v: 'fit' }, { l: '75%', v: 0.75 }, { l: '100%', v: 1 }]
const zoom = ref('fit')
// Phones: the page fills the width; the zoom button shows it near real size to read and pan
const PHONE_ZOOM = 0.9
const phoneQuery = typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)') : null
const phone = ref(!!phoneQuery?.matches)
const onPhoneChange = (e) => { phone.value = e.matches; if (!e.matches && zoom.value === PHONE_ZOOM) zoom.value = 'fit' }
phoneQuery?.addEventListener('change', onPhoneChange)
const panelOpen = ref(true)
const drawer = ref(false)
const editorRef = ref(null)
const drawerRef = ref(null)   // the editor inside the phone drawer
// Design: a wider panel with bigger layout previews, and the sidebar folds to icons meanwhile
const panelTab = ref('content')
const sidebarAuto = inject('sidebarAuto', null)
watch(panelTab, (t) => { if (sidebarAuto) sidebarAuto.value = t === 'design' }, { immediate: true })
onUnmounted(() => { if (sidebarAuto) sidebarAuto.value = false })

const label = computed(() => templateLabel(store.template))
const theme = computed(() => getTheme(parseTemplate(store.template).theme))

// "Saved" indicator: account saves for signed-in users, browser-only for guests
const now = ref(Date.now())
let tick
const route = useRoute()
onMounted(() => {
  tick = setInterval(() => { now.value = Date.now() }, 15000)
  openTab(route.query.tab)
})
// e.g. /editor?tab=job ("Check your ATS score", or a layout picked with a job offer). On a phone
// the editor lives in the drawer, so open it on that tab; on a computer, the side panel
function openTab(t) {
  if (!['content', 'design', 'job'].includes(t)) return
  if (window.innerWidth <= 768) { drawer.value = true; nextTick(() => drawerRef.value?.show(t)) }
  else { panelOpen.value = true; nextTick(() => editorRef.value?.show(t)) }
}
watch(() => route.query.tab, openTab)
onUnmounted(() => { clearInterval(tick); phoneQuery?.removeEventListener('change', onPhoneChange) })
const savedText = computed(() => {
  if (!auth.isLoggedIn) return t('Saved in this browser')
  if (!store.lastSavedAt) return store.currentDraftId ? t('Saved') : ''
  const s = Math.round((now.value - store.lastSavedAt) / 1000)
  return s < 30 ? t('Saved just now') : t('Saved {n} min ago', { n: Math.max(1, Math.round(s / 60)) })
})

function showDesign() {
  if (window.innerWidth <= 768) { drawer.value = true; return }
  panelOpen.value = true
  editorRef.value?.show('design')
}
</script>

<style scoped>
.ed{display:flex;height:100%;min-height:0}
.ed-panel{width:420px;flex-shrink:0;border-right:1px solid var(--c-border);background:var(--c-bg);transition:width .2s,opacity .2s;overflow:hidden}
.ed-panel.collapsed{width:0;opacity:0;border:none}
.ed-panel > :deep(.ced){width:420px}
.ed-panel.wide:not(.collapsed){width:clamp(560px,46vw,760px)}
.ed-panel.wide > :deep(.ced){width:clamp(560px,46vw,760px)}
.ed-preview{flex:1;min-width:0;display:flex;flex-direction:column;background:var(--c-canvas);position:relative}
.ed-bar{height:56px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 16px;background:var(--c-surface);border-bottom:1px solid var(--c-border);flex-shrink:0}
.ed-bar-l,.ed-bar-r{display:flex;align-items:center;gap:10px;min-width:0}
.ed-bar-l{flex:1}
.ed-bar-r{flex-shrink:0}
.ed-design{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 10px 0 8px;border-radius:9px;border:1px solid var(--hair);background:var(--c-surface);font-size:13px;font-weight:500;color:var(--c-text);white-space:nowrap}
.ed-design:hover{border-color:var(--c-border2)}
.ed-design svg{width:14px;height:14px;fill:none;stroke:var(--c-text3);stroke-width:2}
.ed-design-l{overflow:hidden;text-overflow:ellipsis;min-width:0}
.ed-design svg,.ed-swatch{flex-shrink:0}
.ed-swatch{width:14px;height:14px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.ed-saved{font-size:12.5px;color:var(--c-text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ed-canvas{flex:1;overflow:auto;padding:28px 24px 60px}

.ed-edit-fab{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:40;align-items:center;gap:8px;
  height:46px;padding:0 20px;border-radius:999px;border:none;background:var(--c-text);color:var(--c-surface);font-weight:600;font-size:14px;box-shadow:var(--shadow-lg)}
.ed-edit-fab svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2}

.drawer-backdrop{position:fixed;inset:0;z-index:8000;background:rgba(15,15,25,.4);display:flex;align-items:flex-end}
/* Sized to the visible screen (dvh, not vh: on phones vh includes the space behind the browser's
   bars, which pushed the top of the drawer against the top edge), always leaving a gap above it */
.drawer{width:100%;height:88vh;height:88dvh;max-height:calc(100dvh - 48px - env(safe-area-inset-top));background:var(--c-bg);border-radius:24px 24px 0 0;display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--shadow-xl);padding-bottom:env(safe-area-inset-bottom)}
.drawer-hd{position:relative;display:flex;align-items:center;justify-content:space-between;padding:22px 20px 14px;background:var(--c-surface);border-bottom:1px solid var(--c-border)}
.drawer-grab{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:40px;height:5px;border-radius:3px;background:var(--c-border)}
.drawer-t{font-size:18px;font-weight:700;letter-spacing:-.02em}
.drawer > :deep(.ced){flex:1;min-height:0}
.drawer-enter-active,.drawer-leave-active{transition:opacity .2s}
.drawer-enter-active .drawer,.drawer-leave-active .drawer{transition:transform .22s ease}
.drawer-enter-from,.drawer-leave-to{opacity:0}
.drawer-enter-from .drawer,.drawer-leave-to .drawer{transform:translateY(40px)}

@media (max-width:768px){
  .ed-bar{padding:0 12px}
  .ed-bar-l,.ed-bar-r{gap:8px}
  .ed-canvas{padding:12px 10px 150px}
  .ed-canvas.zoomed{padding-left:12px;padding-right:12px}
  .ed-design{max-width:46vw;min-width:0}
}
</style>
