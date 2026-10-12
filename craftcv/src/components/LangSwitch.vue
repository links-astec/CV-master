<template>
  <!-- Language menu: a globe and the current language; opens the list of all languages -->
  <div class="lm" ref="root">
    <button type="button" class="lm-btn" :class="{ big }" :aria-label="$t('Language') + ': ' + current.label" aria-haspopup="listbox" :aria-expanded="open" @click="open = !open">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.8 3.9 6 3.9 9.5S14.6 18.7 12 21.5M12 2.5C9.4 5.3 8.1 8.5 8.1 12s1.3 6.7 3.9 9.5"/></svg>
      <span class="lm-name">{{ current.label }}</span><span class="lm-short">{{ current.short }}</span>
      <svg class="lm-chev" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <ul v-if="open" class="lm-list" role="listbox" :class="{ up }">
      <li v-for="l in LANGS" :key="l.code">
        <button type="button" role="option" :aria-selected="l.code === lang" :lang="l.code" :class="{ on: l.code === lang }" @click="pick(l.code)">
          {{ l.label }}<svg v-if="l.code === lang" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { LANGS, lang, setLang } from '../i18n/index.js'
import { useAuthStore } from '../stores/auth.js'

// big: full-width button (Settings); up: open the list upwards
defineProps({ big: Boolean, up: Boolean })
const auth = useAuthStore()
const open = ref(false)
const root = ref(null)
const current = computed(() => LANGS.find(l => l.code === lang.value) || LANGS[0])

async function pick(code) {
  open.value = false
  await setLang(code)
  // Signed in: remember it on the account too, so it follows them to other devices
  if (auth.isLoggedIn) {
    fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/settings', {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uiLang: code }),
    }).then(() => { if (auth.user) auth.user.uiLang = code }).catch(() => {})
  }
}
function onDoc(e) { if (open.value && root.value && !root.value.contains(e.target)) open.value = false }
function onKey(e) { if (e.key === 'Escape') open.value = false }
onMounted(() => { document.addEventListener('click', onDoc); document.addEventListener('keydown', onKey) })
onUnmounted(() => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey) })
</script>

<style scoped>
.lm{position:relative;flex-shrink:0}
.lm-btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 10px;border:1px solid var(--hair);border-radius:10px;background:var(--c-surface);color:var(--c-text);font-size:13px;font-weight:600;cursor:pointer}
.lm-btn:hover{border-color:var(--c-border2)}
.lm-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.lm-btn .lm-chev{width:13px;height:13px;color:var(--c-text3)}
.lm-short{display:none}
.lm-btn.big{width:100%;justify-content:flex-start;height:40px}
.lm-btn.big .lm-chev{margin-left:auto}
.lm-list{position:absolute;right:0;top:calc(100% + 6px);z-index:900;min-width:170px;list-style:none;margin:0;padding:6px;background:var(--c-surface);border:1px solid var(--hair);border-radius:12px;box-shadow:var(--shadow-lg)}
.lm-list.up{top:auto;bottom:calc(100% + 6px)}
.lm-list button{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:8px 10px;border:none;border-radius:8px;background:none;color:var(--c-text);font-size:14px;text-align:left;cursor:pointer}
.lm-list button:hover{background:var(--c-surface2)}
.lm-list button.on{color:var(--c-accent);font-weight:600}
.lm-list svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.4}
@media (max-width:560px){ .lm-btn:not(.big) .lm-name{display:none} .lm-btn:not(.big) .lm-short{display:inline} }
</style>
