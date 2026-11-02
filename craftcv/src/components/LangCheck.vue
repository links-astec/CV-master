<template>
  <!-- One language from top to bottom: shown when part of the CV is in another language than the rest,
       or when the headings aren't in the content's language. Ignoring it is fine; the export then puts
       the CV in its main language anyway (see unifyCvLanguage). -->
  <div v-if="issue" class="lc" role="status">
    <svg class="lc-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 010 18a14 14 0 010-18z"/></svg>
    <div class="lc-body">
      <b>{{ issue.mixed ? $t('Your CV mixes {a} and {b}', names) : $t('Your content is in {a}, your headings in {b}', names) }}</b>
      <p>{{ issue.mixed
        ? $t('Most of it is in {a}. A CV reads best in one language. If you leave it, we put it all in {a} when you download it.', names)
        : $t('Section headings like Experience and Skills should be in the same language. If you leave it, they switch to {a} when you download it.', names) }}</p>
      <div class="lc-acts">
        <button type="button" class="lc-go" @click="fix">{{ issue.mixed ? $t('Put it all in {a}', names) : $t('Switch the headings to {a}', names) }}</button>
        <button type="button" class="lc-ign" @click="ignore">{{ $t('Ignore') }}</button>
      </div>
    </div>
    <TranslateModal :show="translating" :to="issue.dominant" @close="translating = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { cvLanguages } from '../composables/cvLanguage.js'
import { t } from '../i18n/index.js'
import TranslateModal from './TranslateModal.vue'

const store = useCvStore()
const translating = ref(false)
const NAME = { en: 'inline|English', fr: 'inline|French' }

const info = computed(() => cvLanguages(store.data))
// ignored per kind of problem and language, so a new one still shows
const key = computed(() => `lang-${info.value.mixed ? 'mixed' : 'headings'}-${info.value.dominant}`)
const issue = computed(() => {
  const i = info.value
  if (!i.dominant || (!i.mixed && !i.headings) || (store.data.checkIgnored || []).includes(key.value)) return null
  return i
})
const names = computed(() => {
  const a = issue.value?.dominant, b = issue.value?.mixed ? issue.value.other : (store.data.lang === 'fr' ? 'fr' : 'en')
  return { a: t(NAME[a] || ''), b: t(NAME[b] || '') }
})

function fix() {
  if (issue.value.mixed) translating.value = true
  else store.data.lang = issue.value.dominant
}
function ignore() { store.data.checkIgnored = [...new Set([...(store.data.checkIgnored || []), key.value])] }
</script>

<style scoped>
.lc{display:flex;gap:12px;padding:14px 16px;margin-bottom:14px;border-radius:16px;background:var(--c-surface);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c-amber) 55%,var(--c-border))}
.lc-ic{width:20px;height:20px;flex-shrink:0;margin-top:1px;fill:none;stroke:var(--c-amber);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.lc-body{flex:1;min-width:0}
.lc-body b{display:block;font-size:14px;font-weight:650;letter-spacing:-.01em;color:var(--c-text)}
.lc-body p{font-size:13px;line-height:1.5;color:var(--c-text2);margin:3px 0 0}
.lc-acts{display:flex;align-items:center;flex-wrap:wrap;gap:6px 16px;margin-top:10px}
.lc-go{height:32px;padding:0 14px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.lc-ign{border:none;background:none;padding:0;font:inherit;font-size:13px;font-weight:600;color:var(--c-text3);cursor:pointer}
</style>
