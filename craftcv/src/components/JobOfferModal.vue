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
/* The same size and look as the new-CV wizard */
.jo-box {
  position: relative; background: var(--c-bg); border-radius: 28px; border: 1px solid var(--hair);
  padding: 40px; width: 100%; max-width: 1240px; height: min(860px, calc(100vh - 40px)); overflow: auto;
  box-shadow: var(--shadow-xl); display: flex; align-items: center; justify-content: center;
}
.jo-box > :deep(.jof) { max-width: 600px; width: 100%; }
.jo-x { position: absolute; top: 16px; right: 16px; }

@media (max-width: 768px) {
  .jo-backdrop { padding: 0; }
  .jo-box { height: 100%; border-radius: 0; border: none; padding: 56px 18px calc(24px + env(safe-area-inset-bottom)); align-items: flex-start; }
}
</style>
