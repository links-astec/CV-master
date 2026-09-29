<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fx-backdrop" @click.self="close">
        <div class="fx" role="dialog" aria-labelledby="fx-title">
          <button class="icon-btn fx-x" @click="close" aria-label="Close">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="fx-eyebrow">
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
            AI fix
          </div>
          <h3 id="fx-title">{{ issueTitle }}</h3>

          <div v-if="loading" class="fx-loading">
            <div class="thinking-dots"><span></span><span></span><span></span></div>
            <div>Working on it…</div>
          </div>

          <div v-else-if="error" class="fx-error">
            {{ error }}
            <button class="btn-secondary btn-sm" @click="run">Try again</button>
          </div>

          <template v-else>
            <p class="fx-sub">Check the suggestion, edit it if you like, then apply. Nothing changes until you do.</p>
            <div v-if="note" class="fx-note">{{ note }}</div>
            <div v-if="!changes.length && !skills.length" class="fx-empty">The AI didn't find anything worth changing here.</div>

            <div v-for="c in changes" :key="c.key" class="fx-change" :class="{ off: !c.checked }">
              <label class="fx-change-hd">
                <input type="checkbox" v-model="c.checked" />
                <span>{{ c.label }}</span>
              </label>
              <div v-if="c.before" class="fx-before"><span>Before</span>{{ c.before }}</div>
              <div class="fx-after-lbl">{{ c.before ? 'After — you can edit this' : 'New — you can edit this' }}</div>
              <textarea v-model="c.after" class="f-ta fx-after" :rows="rowsFor(c.after)" :disabled="!c.checked"></textarea>
              <div v-if="c.checked && hasPlaceholder(c.after)" class="fx-ph">
                Replace {{ placeholdersIn(c.after).join(' ') }} with your real figure, or delete it.
              </div>
            </div>

            <div v-if="skills.length" class="fx-skills">
              <div class="fx-skills-lbl">Tick the skills you really have</div>
              <div class="fx-chips">
                <label v-for="s in skills" :key="s.name" class="fx-chip" :class="{ on: s.checked }">
                  <input type="checkbox" v-model="s.checked" /> {{ s.name }}
                </label>
              </div>
            </div>

            <div class="fx-ft">
              <button class="btn-ghost" @click="close">Cancel</button>
              <button class="btn-primary accent" :disabled="!selected" @click="apply">
                Apply {{ selected || '' }} change{{ selected === 1 ? '' : 's' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCvStore } from '../stores/cv.js'

const emit  = defineEmits(['applied'])
const store = useCvStore()
const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path

const open    = ref(false)
const loading = ref(false)
const error   = ref('')
const issue   = ref('')
const issueTitle = ref('')
const changes = ref([])   // [{ key, label, before, after, checked }]
const skills  = ref([])   // [{ name, checked }]
const note    = ref('')

const PH = /\[[^\]\n]{0,12}\b[XN]\b[^\]\n]{0,12}\]/g
const placeholdersIn = (t) => [...new Set(String(t).match(PH) || [])]
const hasPlaceholder = (t) => placeholdersIn(t).length > 0
const rowsFor = (t) => Math.min(9, Math.max(2, Math.ceil(String(t).length / 60) + (String(t).match(/\n/g) || []).length))
const selected = computed(() => changes.value.filter(c => c.checked && c.after.trim()).length + skills.value.filter(s => s.checked).length)

// Opens the pop-up and asks the AI for a fix for one checklist issue
function start(issueId, title) {
  issue.value = issueId
  issueTitle.value = title
  open.value = true
  run()
}

async function run() {
  loading.value = true
  error.value = ''
  changes.value = []; skills.value = []; note.value = ''
  try {
    const { photo, ...cv } = JSON.parse(JSON.stringify(store.data))
    const r = await fetch(apiUrl('/api/ai/fix'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue: issue.value, cv }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || 'The AI couldn’t fix this just now — please try again.')
    changes.value = (j.changes || []).map(c => ({ ...c, checked: true }))
    skills.value  = (j.skills || []).map(name => ({ name, checked: false }))
    note.value    = j.note || ''
  } catch (e) {
    error.value = e.message
  }
  loading.value = false
}

function apply() {
  const d = store.data
  const snapshot = JSON.parse(JSON.stringify({ title: d.title, sum: d.sum, experiences: d.experiences, skills: d.skills }))
  for (const c of changes.value) {
    if (!c.checked || !c.after.trim()) continue
    const text = c.after.trim()
    if (c.key === 'title') d.title = text
    else if (c.key === 'sum') d.sum = text
    else {
      const e = d.experiences[Number(c.key.split(':')[1])]
      if (e) e.desc = text
    }
  }
  for (const s of skills.value) if (s.checked) store.addSkill(s.name)
  emit('applied', { title: issueTitle.value, count: selected.value, snapshot })
  open.value = false
}

function close() { open.value = false }

defineExpose({ start })
</script>

<style scoped>
.fx-backdrop{position:fixed;inset:0;z-index:9000;background:rgba(20,20,43,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px}
.fx{position:relative;width:100%;max-width:600px;max-height:92dvh;overflow-y:auto;background:var(--c-surface);border-radius:18px;padding:24px 26px 20px;box-shadow:var(--shadow-xl);border:1px solid var(--c-border)}
.fx-x{position:absolute;top:14px;right:14px}
.fx-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c-accent);margin-bottom:6px}
.fx-eyebrow svg{width:13px;height:13px;fill:currentColor}
.fx h3{font-size:18px;font-weight:700;letter-spacing:-.01em;color:var(--c-text);margin:0 30px 6px 0}
.fx-sub{font-size:13px;color:var(--c-text2);line-height:1.55;margin-bottom:14px}
.fx-note{font-size:12.5px;color:var(--c-text2);background:var(--c-surface2);border-radius:8px;padding:8px 10px;margin-bottom:12px;line-height:1.5}
.fx-loading{display:flex;align-items:center;gap:12px;padding:26px 0;font-size:13.5px;color:var(--c-text2)}
.fx-error{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--c-rose-lt);color:var(--c-rose);border-radius:10px;padding:12px 14px;font-size:13px;margin-top:10px}
.fx-empty{font-size:13px;color:var(--c-text2);padding:8px 0}

.fx-change{border:1px solid var(--c-border);border-radius:12px;padding:12px 14px;margin-bottom:10px;transition:opacity .15s}
.fx-change.off{opacity:.55}
.fx-change-hd{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--c-text2);margin-bottom:8px;cursor:pointer}
.fx-change-hd input{accent-color:var(--c-accent)}
.fx-before{font-size:12.5px;line-height:1.5;color:var(--c-text3);background:var(--c-bg);border-radius:8px;padding:7px 10px;margin-bottom:8px;white-space:pre-line;text-decoration:line-through;text-decoration-color:rgba(0,0,0,.2)}
.fx-before span,.fx-after-lbl{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-text3);margin-bottom:3px;text-decoration:none}
.fx-after{font-size:13px;line-height:1.55;background:var(--c-green-lt);border-color:transparent;resize:vertical}
.fx-ph{font-size:12px;color:var(--c-amber);margin-top:6px}

.fx-skills{border:1px solid var(--c-border);border-radius:12px;padding:12px 14px;margin-bottom:10px}
.fx-skills-lbl{font-size:13px;font-weight:600;color:var(--c-text);margin-bottom:8px}
.fx-chips{display:flex;flex-wrap:wrap;gap:6px}
.fx-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--c-border);border-radius:99px;padding:5px 11px;font-size:12.5px;cursor:pointer;color:var(--c-text2)}
.fx-chip.on{background:var(--c-accent-lt);border-color:var(--c-accent);color:var(--c-accent);font-weight:600}
.fx-chip input{accent-color:var(--c-accent);margin:0}

.fx-ft{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid var(--c-border)}
@media (max-width:600px){
  .fx-backdrop{padding:0;align-items:flex-end}
  .fx{border-radius:18px 18px 0 0;max-width:100%;padding:22px 18px calc(18px + env(safe-area-inset-bottom))}
}
</style>
