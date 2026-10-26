<template>
  <!-- The CV's language, always in view (editor bar, wizard header). Choosing the other language opens the
       translation review; the change can be undone for a while after. -->
  <div class="cl">
    <button type="button" class="cl-btn" :class="{ open: menu, compact }" aria-haspopup="listbox" :aria-expanded="menu"
            :title="$t('CV language')" @click="menu = !menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 010 18a14 14 0 010-18z"/></svg>
      <span class="cl-full">{{ $t('CV in {lang}', { lang: now.name }) }}</span><span class="cl-short">{{ now.code }}</span>
      <svg class="cl-chev" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <Transition name="cl-pop">
      <div v-if="menu" ref="pop" class="cl-pop" role="listbox" :aria-label="$t('CV language')">
        <div class="cl-pop-h">{{ $t('CV language') }}</div>
        <button v-for="l in LANGS" :key="l.id" type="button" role="option" class="cl-opt" :aria-selected="l.id === now.id" @click="pick(l.id)">
          <span>{{ l.name }}</span>
          <svg v-if="l.id === now.id" viewBox="0 0 24 24" aria-hidden="true"><polyline points="5 12.5 10 17.5 19 7"/></svg>
        </button>
        <p class="cl-pop-f">{{ $t('Headings change, and we translate your content. You review every change first.') }}</p>
      </div>
    </Transition>
    <TranslateModal :show="!!to" :to="to || 'fr'" @close="to = null" @applied="applied" />
    <Teleport to="body">
      <Transition name="cl-undo">
        <div v-if="undo" class="cl-undo" role="status">
          <span>{{ undo.count ? $t(undo.count === 1 ? 'Translated {n} section.' : 'Translated {n} sections.', { n: undo.count }) : $t('Headings switched.') }}</span>
          <button type="button" @click="undoIt">{{ $t('Undo') }}</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useCvStore } from '../stores/cv.js'
import TranslateModal from './TranslateModal.vue'

defineProps({ compact: Boolean })   // compact: just EN / FR (narrow places)
const store = useCvStore()
const LANGS = [{ id: 'en', name: 'English', code: 'EN' }, { id: 'fr', name: 'Français', code: 'FR' }]
const now = computed(() => LANGS.find(l => l.id === (store.data.lang === 'fr' ? 'fr' : 'en')))

const menu = ref(false)
const pop = ref(null)
const to = ref(null)
const undo = ref(null)
let undoTimer = null
function pick(id) { menu.value = false; if (id !== now.value.id) to.value = id }
function applied(info) {
  undo.value = info
  clearTimeout(undoTimer); undoTimer = setTimeout(() => { undo.value = null }, 12000)
}
function undoIt() { if (undo.value) store.data = undo.value.snapshot; undo.value = null }

function outside(e) { if (!e.target.closest?.('.cl')) menu.value = false }
watch(menu, (v) => v ? setTimeout(() => document.addEventListener('pointerdown', outside, true), 0) : document.removeEventListener('pointerdown', outside, true))
onBeforeUnmount(() => { document.removeEventListener('pointerdown', outside, true); clearTimeout(undoTimer) })
</script>

<style scoped>
.cl{position:relative;flex-shrink:0}
.cl-btn{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 10px 0 11px;border:none;border-radius:99px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--c-border);color:var(--c-text);font:inherit;font-size:13.5px;font-weight:500;cursor:pointer;white-space:nowrap;transition:background .15s ease}
.cl-btn:hover,.cl-btn.open{background:color-mix(in srgb,var(--c-text) 9%,var(--c-surface))}
.cl-btn svg{width:16px;height:16px;fill:none;stroke:var(--c-text2);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cl-btn .cl-chev{width:12px;height:12px;stroke:var(--c-text3);stroke-width:2.4}
.cl-short{display:none;font-weight:600}
.cl-btn.compact .cl-full{display:none}
.cl-btn.compact .cl-short{display:inline}
.cl-pop{position:absolute;top:calc(100% + 8px);left:0;z-index:500;width:250px;padding:6px;border-radius:16px;
  background:color-mix(in srgb,var(--c-surface) 94%,transparent);-webkit-backdrop-filter:saturate(1.8) blur(20px);backdrop-filter:saturate(1.8) blur(20px);
  box-shadow:0 0 0 .5px rgba(0,0,0,.08),0 12px 40px -8px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.06);transform-origin:top left}
.cl-pop-h{font-size:12.5px;font-weight:600;color:var(--c-text3);padding:8px 12px 4px}
.cl-opt{display:flex;align-items:center;justify-content:space-between;width:100%;padding:10px 12px;border:none;border-radius:10px;background:none;font:inherit;font-size:15px;color:var(--c-text);cursor:pointer;text-align:left}
.cl-opt:hover{background:color-mix(in srgb,var(--c-text) 6%,transparent)}
.cl-opt[aria-selected="true"]{color:var(--c-accent);font-weight:600}
.cl-opt svg{width:18px;height:18px;fill:none;stroke:var(--c-accent);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.cl-pop-f{font-size:12px;line-height:1.45;color:var(--c-text3);margin:4px 12px 8px}
.cl-pop-enter-active,.cl-pop-leave-active{transition:opacity .16s ease,transform .2s cubic-bezier(.2,.8,.2,1)}
.cl-pop-enter-from,.cl-pop-leave-to{opacity:0;transform:scale(.96) translateY(-4px)}
.cl-undo{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9500;display:flex;align-items:center;gap:16px;padding:10px 12px 10px 18px;border-radius:99px;background:#1c1c1e;color:#fff;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);white-space:nowrap}
.cl-undo button{border:none;background:none;padding:4px 6px;font:inherit;font-weight:600;color:#8b85ff;cursor:pointer}
.cl-undo-enter-active,.cl-undo-leave-active{transition:opacity .2s ease,transform .25s ease}
.cl-undo-enter-from,.cl-undo-leave-to{opacity:0;transform:translate(-50%,10px)}
@media (max-width:640px){ .cl-full{display:none} .cl-short{display:inline} .cl-pop{left:auto;right:0} }
</style>
