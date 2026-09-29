<template>
  <div class="ed">
    <!-- Editing panel (desktop) -->
    <aside class="ed-panel hide-mobile" :class="{ collapsed: !panelOpen }">
      <CvEditor ref="editorRef" @pay="openPaywall" />
    </aside>

    <!-- Preview -->
    <section class="ed-preview">
      <div class="ed-bar">
        <div class="ed-bar-l">
          <button class="icon-btn hide-mobile" @click="panelOpen = !panelOpen" :title="panelOpen ? 'Hide editor' : 'Show editor'">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="4" x2="9" y2="20"/></svg>
          </button>
          <button class="ed-design" @click="showDesign" title="Change layout and colour">
            <span class="ed-swatch" :style="{ background: theme.accent }"></span>
            {{ label }}
            <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <span class="ed-saved hide-mobile">{{ savedText }}</span>
        </div>
        <div class="ed-bar-r">
          <div class="seg hide-mobile">
            <button v-for="z in ZOOMS" :key="z.l" :class="{ active: zoom === z.v }" @click="zoom = z.v">{{ z.l }}</button>
          </div>
          <button class="btn-primary accent" @click="openPaywall">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      <div class="ed-canvas">
        <CvPreview :template="store.template" :data="store.data" :fmt="store.fmt"
                   :scale="zoom" :max-scale="1.05" :padding="64"
                   v-model:fitAccepted="store.data.shrinkToFit" />
      </div>

      <button class="ed-edit-fab show-mobile" @click="drawer = true">
        <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>
        Edit CV
      </button>
    </section>

    <!-- Mobile editing drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawer" class="drawer-backdrop" @click.self="drawer = false">
          <div class="drawer">
            <div class="drawer-hd">
              <span>Edit CV</span>
              <button class="btn-primary btn-sm accent" @click="drawer = false">Done</button>
            </div>
            <CvEditor @pay="drawer = false; openPaywall()" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useCvStore } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'
import { parseTemplate, templateLabel, getTheme } from '../composables/cvRenderer.js'
import CvEditor from '../components/CvEditor.vue'
import CvPreview from '../components/CvPreview.vue'

const store = useCvStore()
const auth  = useAuthStore()
const openPaywall = inject('openPaywall')

const ZOOMS = [{ l: 'Fit', v: 'fit' }, { l: '75%', v: 0.75 }, { l: '100%', v: 1 }]
const zoom = ref('fit')
const panelOpen = ref(true)
const drawer = ref(false)
const editorRef = ref(null)

const label = computed(() => templateLabel(store.template))
const theme = computed(() => getTheme(parseTemplate(store.template).theme))

// "Saved" indicator: account saves for signed-in users, browser-only for guests
const now = ref(Date.now())
let tick
const route = useRoute()
onMounted(() => {
  tick = setInterval(() => { now.value = Date.now() }, 15000)
  // e.g. /editor?tab=job after choosing a layout with a job offer
  const t = route.query.tab
  if (['content', 'design', 'job'].includes(t)) nextTick(() => editorRef.value?.show(t))
})
onUnmounted(() => clearInterval(tick))
const savedText = computed(() => {
  if (!auth.isLoggedIn) return 'Saved in this browser'
  if (!store.lastSavedAt) return store.currentDraftId ? 'Saved' : ''
  const s = Math.round((now.value - store.lastSavedAt) / 1000)
  return s < 30 ? 'Saved just now' : `Saved ${Math.max(1, Math.round(s / 60))} min ago`
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
.ed-preview{flex:1;min-width:0;display:flex;flex-direction:column;background:var(--c-canvas);position:relative}
.ed-bar{height:56px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 16px;background:var(--c-surface);border-bottom:1px solid var(--c-border);flex-shrink:0}
.ed-bar-l,.ed-bar-r{display:flex;align-items:center;gap:10px;min-width:0}
.ed-design{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 10px 0 8px;border-radius:9px;border:1px solid var(--c-border);background:var(--c-surface);font-size:13px;font-weight:500;color:var(--c-text);white-space:nowrap}
.ed-design:hover{border-color:var(--c-border2)}
.ed-design svg{width:14px;height:14px;fill:none;stroke:var(--c-text3);stroke-width:2}
.ed-swatch{width:14px;height:14px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.ed-saved{font-size:12.5px;color:var(--c-text3);white-space:nowrap}
.ed-canvas{flex:1;overflow:auto;padding:28px 24px 60px}

.ed-edit-fab{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:40;align-items:center;gap:8px;
  height:46px;padding:0 20px;border-radius:999px;border:none;background:var(--c-text);color:var(--c-surface);font-weight:600;font-size:14px;box-shadow:var(--shadow-lg)}
.ed-edit-fab svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2}

.drawer-backdrop{position:fixed;inset:0;z-index:8000;background:rgba(15,15,25,.4);display:flex;align-items:flex-end}
.drawer{width:100%;height:88vh;background:var(--c-bg);border-radius:18px 18px 0 0;display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--shadow-xl)}
.drawer-hd{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--c-surface);border-bottom:1px solid var(--c-border);font-weight:600}
.drawer > :deep(.ced){flex:1;min-height:0}
.drawer-enter-active,.drawer-leave-active{transition:opacity .2s}
.drawer-enter-active .drawer,.drawer-leave-active .drawer{transition:transform .22s ease}
.drawer-enter-from,.drawer-leave-to{opacity:0}
.drawer-enter-from .drawer,.drawer-leave-to .drawer{transform:translateY(40px)}

@media (max-width:768px){
  .ed-bar{padding:0 12px}
  .ed-canvas{padding:16px 12px 140px}
}
</style>
