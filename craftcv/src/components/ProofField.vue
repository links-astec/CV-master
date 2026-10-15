<template>
  <!-- A text field that checks the writing as you type, like a spell checker: problems get a wavy
       underline (red for spelling and grammar, blue for clearer wording), and the suggestions show
       under the field with Apply and Ignore. Only the form is checked; the CV itself never shows marks. -->
  <div class="pf" :class="{ open: shown.length && (focused || hover) }" @mouseenter="hover = true" @mouseleave="hover = false">
    <div class="pf-box">
      <textarea v-if="multiline" ref="field" v-bind="$attrs" :value="modelValue" :rows="rows" spellcheck="false"
        @input="onInput" @scroll="syncScroll" @focus="focused = true" @blur="onBlur" @click="onCaret" @keyup="onCaret"></textarea>
      <input v-else ref="field" v-bind="$attrs" :value="modelValue" spellcheck="false"
        @input="onInput" @scroll="syncScroll" @focus="focused = true" @blur="onBlur" @click="onCaret" @keyup="onCaret" />
      <!-- The same text, invisible, carrying only the underlines; sits exactly over the field -->
      <div ref="mirror" class="pf-mirror" :class="{ single: !multiline }" aria-hidden="true"><template v-for="(p, i) in parts" :key="i"><mark v-if="p.issue" class="pf-sq" :class="[p.issue.type, { on: p.issue === active }]">{{ p.text }}</mark><template v-else>{{ p.text }}</template></template>{{ multiline ? '\n' : '' }}</div>
    </div>
    <div v-if="shown.length" class="pf-tips" role="list" :aria-label="$t('Writing suggestions')">
      <div v-for="it in shown" :key="it.start + it.text" class="pf-tip" :class="[it.type, { on: it === active }]" role="listitem">
        <span class="pf-dot" aria-hidden="true"></span>
        <span class="pf-tip-txt">
          <span class="pf-kind">{{ $t(KIND[it.type]) }}</span>
          <s>{{ it.text }}</s> <span aria-hidden="true">→</span> <b>{{ it.fix }}</b>
          <span v-if="it.why" class="pf-why">{{ it.why }}</span>
        </span>
        <button type="button" class="pf-apply" @mousedown.prevent @click="apply(it)">{{ $t('Apply') }}</button>
        <button type="button" class="pf-ignore" @mousedown.prevent @click="ignore(it)" :aria-label="$t('Ignore')" :title="$t('Ignore')">×</button>
      </div>
      <button v-if="shown.length > 1" type="button" class="pf-all" @mousedown.prevent @click="applyAll">{{ $t('Apply all') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { lang as uiLang } from '../i18n/index.js'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  modelValue: { type: String, default: '' },
  multiline: Boolean,
  rows: { type: [Number, String], default: 3 },
  // what the text is, so the check knows what good looks like: summary · seeking · title · bullets · degree · story
  kind: { type: String, default: 'text' },
})
const emit = defineEmits(['update:modelValue'])
const store = useCvStore()
const KIND = { spelling: 'Spelling', grammar: 'Grammar', style: 'Clearer wording', consistency: 'Consistency' }

const field = ref(null), mirror = ref(null)
const focused = ref(false), hover = ref(false)
const issues = ref([])            // { start, end, text, fix, why, type } on the current text
const ignored = new Set()         // "text→fix" the person chose to keep
const caret = ref(-1)

// Issues still on the text after edits: each is found again by its words, near where it was
function relocate(text, list) {
  const out = []
  for (const it of list) {
    if (text.slice(it.start, it.end) === it.text) { out.push(it); continue }
    let best = -1, d = Infinity, i = text.indexOf(it.text)
    while (i >= 0) { const dd = Math.abs(i - it.start); if (dd < d) { d = dd; best = i } i = text.indexOf(it.text, i + 1) }
    if (best >= 0 && !out.some(x => best < x.end && best + it.text.length > x.start)) out.push({ ...it, start: best, end: best + it.text.length })
  }
  return out.sort((a, b) => a.start - b.start)
}
const shown = computed(() => issues.value.filter(it => !ignored.has(it.text + '→' + it.fix)))
const active = computed(() => shown.value.find(it => caret.value >= it.start && caret.value <= it.end) || null)
const parts = computed(() => {
  const t = props.modelValue || '', out = []
  let at = 0
  for (const it of shown.value) {
    if (it.start < at) continue
    if (it.start > at) out.push({ text: t.slice(at, it.start) })
    out.push({ text: t.slice(it.start, it.end), issue: it })
    at = it.end
  }
  if (at < t.length) out.push({ text: t.slice(at) })
  return out
})

// ── Checking: after a pause in typing, and when leaving the field ──
const cache = ProofCache()
let timer = null, ctl = null, lastChecked = ''
function schedule(ms) { clearTimeout(timer); timer = setTimeout(check, ms) }
async function check() {
  const text = props.modelValue || ''
  if (text.trim().length < 8) { issues.value = []; lastChecked = text; return }
  if (text === lastChecked) return
  lastChecked = text
  const key = `${props.kind}|${store.data.lang}|${uiLang.value}|${text}`
  if (cache.has(key)) { issues.value = cache.get(key); return }
  ctl?.abort(); ctl = new AbortController()
  try {
    const r = await fetch((import.meta.env.VITE_API_URL || '') + '/api/ai/proofread', {
      method: 'POST', credentials: 'include', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, kind: props.kind, field: props.kind, lang: store.data.lang, uiLang: uiLang.value }),
    })
    const j = r.ok ? await r.json() : { issues: [] }
    const list = Array.isArray(j.issues) ? j.issues : []
    if (!j.error) cache.set(key, list)
    // The text may have changed while checking: keep what still fits
    issues.value = relocate(props.modelValue || '', list)
  } catch {}
}

function onInput(e) {
  emit('update:modelValue', e.target.value)
  issues.value = relocate(e.target.value, issues.value)
  onCaret(e)
  schedule(1400)
}
function onBlur() { focused.value = false; schedule(150) }
function onCaret(e) { caret.value = e?.target?.selectionStart ?? -1; nextTick(syncScroll) }
function syncScroll() { if (mirror.value && field.value) { mirror.value.scrollTop = field.value.scrollTop; mirror.value.scrollLeft = field.value.scrollLeft } }

function replaceRange(text, it) { return text.slice(0, it.start) + it.fix + text.slice(it.end) }
function apply(it) {
  const t = props.modelValue || ''
  if (t.slice(it.start, it.end) !== it.text) return
  const next = replaceRange(t, it), shift = it.fix.length - it.text.length
  issues.value = issues.value.filter(x => x !== it).map(x => x.start > it.start ? { ...x, start: x.start + shift, end: x.end + shift } : x)
  lastChecked = next   // what was applied is trusted; it's checked again after the next edit
  emit('update:modelValue', next)
}
function applyAll() {
  let t = props.modelValue || ''
  for (const it of [...shown.value].sort((a, b) => b.start - a.start)) if (t.slice(it.start, it.end) === it.text) t = replaceRange(t, it)
  issues.value = issues.value.filter(x => ignored.has(x.text + '→' + x.fix))
  lastChecked = t
  emit('update:modelValue', t)
}
function ignore(it) { ignored.add(it.text + '→' + it.fix); issues.value = [...issues.value] }

// The mirror copies the field's box and text metrics, so the underlines sit under the right letters
const COPY = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'textTransform', 'wordSpacing', 'textIndent',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'boxSizing', 'textAlign', 'tabSize']
function copyStyle() {
  if (!field.value || !mirror.value) return
  const cs = getComputedStyle(field.value)
  for (const k of COPY) mirror.value.style[k] = cs[k]
  mirror.value.style.borderStyle = 'solid'; mirror.value.style.borderColor = 'transparent'
  // exactly over the field, whatever margins it has
  const m = mirror.value.style, el = field.value
  m.inset = 'auto'; m.top = el.offsetTop + 'px'; m.left = el.offsetLeft + 'px'; m.width = el.offsetWidth + 'px'; m.height = el.offsetHeight + 'px'
  // a visible scrollbar narrows the field's text: narrow the copy the same way
  const bar = field.value.offsetWidth - field.value.clientWidth - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth)
  if (bar > 0) mirror.value.style.paddingRight = `${parseFloat(cs.paddingRight) + bar}px`
  syncScroll()
}
let ro
onMounted(() => {
  copyStyle()
  ro = new ResizeObserver(copyStyle); if (field.value) ro.observe(field.value)
  if ((props.modelValue || '').trim().length >= 8) schedule(600)   // text already there (an existing CV)
})
onUnmounted(() => { clearTimeout(timer); ctl?.abort(); ro?.disconnect() })
// Changed from elsewhere (AI suggestion used, CV switched): place the marks again, check later
watch(() => props.modelValue, (v) => { if (document.activeElement !== field.value) { issues.value = relocate(v || '', issues.value); schedule(1200) } })
// A different CV language or app language: check again
watch(() => [store.data.lang, uiLang.value], () => { lastChecked = ''; schedule(400) })
</script>

<script>
// Results shared by every field on the page, so the same text is never sent twice
const shared = new Map()
function ProofCache() { return { has: (k) => shared.has(k), get: (k) => shared.get(k), set: (k, v) => { if (shared.size > 300) shared.delete(shared.keys().next().value); shared.set(k, v) } } }
</script>

<style scoped>
.pf{position:relative}
.pf-box{position:relative}
.pf-box > textarea,.pf-box > input{position:relative;z-index:0;width:100%}
.pf-mirror{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;color:transparent;white-space:pre-wrap;overflow-wrap:break-word;word-break:normal;background:transparent}
.pf-mirror.single{white-space:pre;overflow-x:hidden}
.pf-sq{background:transparent;color:transparent;text-decoration:underline wavy;text-decoration-skip-ink:none;text-underline-offset:3px;text-decoration-thickness:1.5px;text-decoration-color:#E11D48}
.pf-sq.style,.pf-sq.consistency{text-decoration-color:#4F46E5}
.pf-sq.on{background:rgba(225,29,72,.10);border-radius:3px}
.pf-sq.style.on,.pf-sq.consistency.on{background:rgba(79,70,229,.10)}

.pf-tips{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.pf-tip{display:flex;align-items:flex-start;gap:9px;padding:9px 10px 9px 12px;border-radius:12px;background:var(--c-surface);box-shadow:inset 0 0 0 1px var(--hair);font-size:13px;line-height:1.45;animation:pfIn .18s ease}
.pf-tip.on{box-shadow:inset 0 0 0 1.5px var(--c-accent)}
.pf-dot{width:8px;height:8px;border-radius:50%;background:#E11D48;margin-top:6px;flex-shrink:0}
.pf-tip.style .pf-dot,.pf-tip.consistency .pf-dot{background:#4F46E5}
.pf-tip-txt{flex:1;min-width:0;color:var(--c-text);overflow-wrap:anywhere}
.pf-kind{display:block;font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--c-text3);margin-bottom:1px}
.pf-tip-txt s{color:var(--c-text3);text-decoration-color:var(--c-text3)}
.pf-tip-txt b{font-weight:650;color:var(--c-text)}
.pf-why{display:block;font-size:12px;color:var(--c-text3);margin-top:1px}
.pf-apply{flex-shrink:0;height:28px;padding:0 12px;border-radius:99px;border:none;background:var(--c-accent);color:#fff;font:inherit;font-size:12.5px;font-weight:650;cursor:pointer}
.pf-ignore{flex-shrink:0;width:28px;height:28px;border-radius:50%;border:none;background:transparent;color:var(--c-text3);font-size:18px;line-height:1;cursor:pointer}
.pf-ignore:hover{background:var(--fill)}
.pf-apply:focus-visible,.pf-ignore:focus-visible,.pf-all:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px}
.pf-all{align-self:flex-start;border:none;background:none;color:var(--c-accent);font:inherit;font-size:12.5px;font-weight:650;padding:2px 2px;cursor:pointer}
@keyframes pfIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.pf-tip{animation:none}}
</style>
