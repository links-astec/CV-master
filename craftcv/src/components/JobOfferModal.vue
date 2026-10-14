<template>
  <!-- Templates page: picking a layout asks for the job offer with the same form as a new CV -->
  <Teleport to="body">
    <Transition name="jo-fade">
      <div v-if="visible" class="jo-backdrop" @click.self="close">
        <div class="jo-box" role="dialog" aria-modal="true">
          <button class="icon-btn jo-x" @click="close" :aria-label="$t('Close')">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <JobOfferForm :initial="current" autofocus @use="finish" @skip="finish('')" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import JobOfferForm from './JobOfferForm.vue'

const visible = ref(false)
const current = ref('')

let _resolve = null
function finish(val) {
  visible.value = false
  if (_resolve) { _resolve(val); _resolve = null }
}

// Resolves with the job offer text ('' = skipped) or null if dismissed.
function ask(offer = '') {
  current.value = offer || ''
  visible.value = true
  return new Promise(r => { _resolve = r })
}
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
  background: rgba(15,15,25,.45); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.jo-box {
  position: relative; background: var(--c-surface); border-radius: 28px;
  padding: 40px 44px 36px; width: 100%; max-width: 680px; max-height: calc(100dvh - 40px); overflow: auto;
  box-shadow: var(--shadow-xl); display: flex; justify-content: center;
  background-image: radial-gradient(700px 300px at 50% -20%, var(--c-accent-lt), transparent 70%);
}
.jo-x { position: absolute; top: 16px; right: 16px; }

@media (max-width: 768px) {
  .jo-backdrop { align-items: flex-end; padding: 0; }
  .jo-box { border-radius: 24px 24px 0 0; max-width: 100%; padding: 48px 18px calc(24px + env(safe-area-inset-bottom)); max-height: calc(100dvh - 24px - env(safe-area-inset-top)); }
}
</style>
