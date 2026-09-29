<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="close">
        <div class="modal tr" role="dialog" aria-modal="true">
          <button class="icon-btn modal-close" @click="close" aria-label="Close">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div class="tr-hd">
            <h2>Switch your CV to {{ LANG_NAME[to] }}</h2>
            <p>Headings change automatically. We'll also translate your content — review it below and keep what you want. Names, companies, schools, technologies and numbers stay as they are.</p>
          </div>

          <div v-if="loading" class="tr-loading">
            <span class="tr-spin"></span>
            Translating your CV…
          </div>

          <div v-else-if="error" class="notice error">{{ error }}</div>

          <template v-else>
            <div v-if="!changes.length" class="notice success">Your content is already in {{ LANG_NAME[to] }} — only the headings will change.</div>
            <div v-else class="tr-list">
              <div class="tr-toolbar">
                <span>{{ selected }} of {{ changes.length }} selected</span>
                <button class="link-btn" @click="setAll(!allOn)">{{ allOn ? 'Untick all' : 'Tick all' }}</button>
              </div>
              <label v-for="c in changes" :key="c.key" class="tr-item" :class="{ off: !c.on }">
                <input type="checkbox" v-model="c.on" />
                <div class="tr-body">
                  <div class="tr-lbl">{{ c.label }}</div>
                  <div class="tr-before">{{ c.before }}</div>
                  <div class="tr-after">{{ c.after }}</div>
                </div>
              </label>
            </div>
          </template>

          <div class="tr-ft">
            <button class="btn-ghost" @click="close">Cancel</button>
            <button class="btn-secondary" :disabled="loading" @click="apply(false)">Headings only</button>
            <button class="btn-primary accent" :disabled="loading || !!error" @click="apply(true)">
              {{ changes.length && selected ? `Translate & switch` : 'Switch language' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCvStore } from '../stores/cv.js'

const props = defineProps({ show: Boolean, to: { type: String, default: 'fr' } })
const emit  = defineEmits(['close', 'applied'])

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path
const store = useCvStore()
const LANG_NAME = { en: 'English', fr: 'French' }

const loading = ref(false)
const error   = ref('')
const changes = ref([])   // [{ key, label, before, after, on, apply(d) }]
const selected = computed(() => changes.value.filter(c => c.on).length)
const allOn    = computed(() => changes.value.every(c => c.on))
function setAll(v) { changes.value.forEach(c => { c.on = v }) }
function close() { if (!loading.value) emit('close') }

watch(() => props.show, (v) => { if (v) load() })

async function load() {
  loading.value = true; error.value = ''; changes.value = []
  try {
    const { photo, ...cv } = JSON.parse(JSON.stringify(store.data))
    const r = await fetch(apiUrl('/api/ai/translate'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv, to: props.to }),
    })
    const t = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(t.error || 'Translation failed — please try again.')
    changes.value = buildChanges(t)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function buildChanges(t) {
  const d = store.data
  const out = []
  const same = (a, b) => String(a || '').trim() === String(b || '').trim()
  const add = (key, label, before, after, apply) => { if (!same(before, after)) out.push({ key, label, before, after, on: true, apply }) }

  add('title', 'Headline', d.title, t.title, (x) => { x.title = t.title })
  add('sum', 'Summary', d.sum, t.sum, (x) => { x.sum = t.sum })
  for (const e of t.experiences || []) {
    const cur = d.experiences[e.i]; if (!cur) continue
    const before = [cur.title, cur.period, cur.desc].filter(Boolean).join('\n')
    const after  = [e.title, e.period, e.desc].filter(Boolean).join('\n')
    add(`exp${e.i}`, `Experience — ${cur.company || cur.title || e.i + 1}`, before, after,
      (x) => { const y = x.experiences[e.i]; if (y) Object.assign(y, { title: e.title, period: e.period, desc: e.desc }) })
  }
  for (const e of t.education || []) {
    const cur = d.education[e.i]; if (!cur) continue
    add(`edu${e.i}`, `Education — ${cur.school || e.i + 1}`, [cur.degree, cur.year].filter(Boolean).join(' · '), [e.degree, e.year].filter(Boolean).join(' · '),
      (x) => { const y = x.education[e.i]; if (y) Object.assign(y, { degree: e.degree, year: e.year }) })
  }
  for (const p of t.projects || []) {
    const cur = d.projects[p.i]; if (!cur) continue
    add(`proj${p.i}`, `Project — ${cur.name || p.i + 1}`, cur.desc, p.desc, (x) => { if (x.projects[p.i]) x.projects[p.i].desc = p.desc })
  }
  if (Array.isArray(t.skills) && t.skills.length === d.skills.length) {
    add('skills', 'Skills', d.skills.join(' · '), t.skills.join(' · '), (x) => { x.skills = [...t.skills] })
  }
  const langText = (list) => list.map(l => [l.name, l.level].filter(Boolean).join(' — ')).join(' · ')
  if (t.languages?.length) {
    add('langs', 'Languages', langText(d.languages), langText(t.languages),
      (x) => t.languages.forEach(l => { if (x.languages[l.i]) Object.assign(x.languages[l.i], { name: l.name, level: l.level }) }))
  }
  if (Array.isArray(t.certifications) && t.certifications.length === d.certifications.length) {
    add('certs', 'Certifications', d.certifications.join(' · '), t.certifications.join(' · '), (x) => { x.certifications = [...t.certifications] })
  }
  return out
}

// translate=false: only the headings (CV language) change
function apply(translate) {
  const snapshot = JSON.parse(JSON.stringify(store.data))
  if (translate) changes.value.filter(c => c.on).forEach(c => c.apply(store.data))
  store.data.lang = props.to
  emit('applied', { snapshot, count: translate ? selected.value : 0 })
  emit('close')
}
</script>

<style scoped>
.tr{max-width:640px;padding:30px 28px 22px;display:flex;flex-direction:column;max-height:calc(100vh - 40px)}
.tr-hd{padding-right:26px;margin-bottom:18px}
.tr-hd h2{font-size:21px;font-weight:800;letter-spacing:-.025em}
.tr-hd p{color:var(--c-text2);margin-top:6px;line-height:1.55;font-size:14px}
.tr-loading{display:flex;align-items:center;gap:12px;padding:30px 4px;color:var(--c-text2);font-weight:500}
.tr-spin{width:22px;height:22px;border-radius:50%;border:3px solid var(--c-border);border-top-color:var(--c-accent);animation:spin .8s linear infinite}
.tr-list{overflow-y:auto;min-height:0;flex:1;margin:0 -4px;padding:0 4px}
.tr-toolbar{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--c-text3);margin-bottom:10px}
.tr-item{display:flex;gap:11px;padding:12px 14px;border:1px solid var(--c-border);border-radius:12px;margin-bottom:8px;cursor:pointer;background:var(--c-surface)}
.tr-item.off{opacity:.55}
.tr-item input{margin-top:3px;width:16px;height:16px;accent-color:var(--c-accent);flex-shrink:0}
.tr-body{flex:1;min-width:0}
.tr-lbl{font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--c-text3);margin-bottom:6px}
.tr-before,.tr-after{font-size:13px;line-height:1.55;white-space:pre-line;overflow-wrap:anywhere;padding:7px 9px;border-radius:8px}
.tr-before{background:var(--c-surface2);color:var(--c-text3);margin-bottom:5px}
.tr-after{background:var(--c-accent-lt);color:var(--c-text)}
.tr-ft{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid var(--c-border);flex-wrap:wrap}
</style>
