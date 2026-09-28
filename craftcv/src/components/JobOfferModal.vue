<template>
  <Teleport to="body">
    <Transition name="jo-fade">
      <div v-if="visible" class="jo-backdrop" @click.self="close">
        <div class="jo-box">
          <div class="jo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
          </div>
          <div class="jo-title">Applying for a specific job?</div>
          <div class="jo-sub">
            Paste the job offer and we'll tailor your CV to it, then check how well it passes
            applicant tracking systems (ATS) before you export. You can skip this and add it later.
          </div>

          <label class="f-lbl" for="jo-text">Job description</label>
          <textarea
            id="jo-text"
            ref="textRef"
            v-model="text"
            class="jo-textarea"
            rows="8"
            placeholder="Paste the full job advert here — title, responsibilities and requirements…"
          />
          <div class="jo-hint" :class="{ warn: tooShort }">
            {{ tooShort ? 'Paste the full description — a few sentences at least.' : `${text.trim().length} characters` }}
          </div>

          <div class="jo-actions">
            <button class="btn-secondary" @click="skip">{{ hadOffer ? 'Remove job offer' : 'No job offer — skip' }}</button>
            <button class="btn-primary accent" :disabled="!text.trim() || tooShort" @click="save">Use this job offer →</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const MIN_CHARS = 40 // same minimum the /api/ai/tailor endpoint enforces

const visible  = ref(false)
const text     = ref('')
const hadOffer = ref(false)
const textRef  = ref(null)

const tooShort = computed(() => {
  const n = text.value.trim().length
  return n > 0 && n < MIN_CHARS
})

let _resolve = null
function finish(val) {
  visible.value = false
  if (_resolve) { _resolve(val); _resolve = null }
}

// Resolves with the job offer text ('' = skipped/removed) or null if dismissed.
function ask(current = '') {
  text.value     = current || ''
  hadOffer.value = !!current?.trim()
  visible.value  = true
  nextTick(() => textRef.value?.focus())
  return new Promise(r => { _resolve = r })
}

function save()  { finish(text.value.trim()) }
function skip()  { finish('') }
function close() { finish(null) }

function onKeydown(e) { if (visible.value && e.key === 'Escape') close() }
onMounted(()   => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

defineExpose({ ask })
</script>

<style scoped>
.jo-fade-enter-active, .jo-fade-leave-active { transition: opacity .2s, transform .2s; }
.jo-fade-enter-from, .jo-fade-leave-to { opacity: 0; transform: scale(.97); }

.jo-backdrop {
  position: fixed; inset: 0; z-index: 9998;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.jo-box {
  background: var(--c-surface); border-radius: 16px;
  padding: 24px; width: 100%; max-width: 520px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  display: flex; flex-direction: column; gap: 8px;
}
.jo-icon {
  width: 44px; height: 44px; border-radius: 12px; margin-bottom: 4px;
  background: var(--c-accent-lt); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
}
.jo-icon svg { width: 22px; height: 22px; }
.jo-title { font-size: 17px; font-weight: 700; color: var(--c-text); }
.jo-sub   { font-size: 13px; color: var(--c-text2); line-height: 1.6; margin-bottom: 8px; }
.jo-textarea {
  width: 100%; box-sizing: border-box; resize: vertical; min-height: 140px;
  border: 1.5px solid var(--c-border); border-radius: 10px; padding: 10px 12px;
  background: var(--c-bg); color: var(--c-text);
  font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.55;
}
.jo-textarea:focus { outline: none; border-color: var(--c-accent); }
.jo-hint { font-size: 11.5px; color: var(--c-text3); }
.jo-hint.warn { color: var(--c-amber); }
.jo-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; flex-wrap: wrap; }

@media (max-width: 480px) {
  .jo-backdrop { align-items: flex-end; padding: 0; }
  .jo-box { border-radius: 20px 20px 0 0; max-width: 100%; padding-bottom: calc(24px + env(safe-area-inset-bottom)); }
  .jo-actions > * { flex: 1; justify-content: center; }
}
</style>
