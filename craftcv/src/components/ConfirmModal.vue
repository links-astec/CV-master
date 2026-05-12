<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="visible" class="confirm-backdrop" @click.self="resolve(false)">
        <div class="confirm-box">
          <div class="confirm-icon" :class="type === 'danger' ? 'danger' : 'warning'">
            <svg v-if="type === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="confirm-body">
            <div class="confirm-title">{{ title }}</div>
            <div class="confirm-msg">{{ message }}</div>
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="resolve(false)">{{ cancelLabel }}</button>
            <button class="confirm-ok" :class="type === 'danger' ? 'ok-danger' : 'ok-warning'" @click="resolve(true)">{{ okLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'

const visible     = ref(false)
const title       = ref('Are you sure?')
const message     = ref('')
const okLabel     = ref('Confirm')
const cancelLabel = ref('Cancel')
const type        = ref('danger')

let _resolve = null

function resolve(val) {
  visible.value = false
  if (_resolve) { _resolve(val); _resolve = null }
}

function ask({ title: t = 'Are you sure?', message: m = '', ok = 'Confirm', cancel = 'Cancel', mode = 'danger' } = {}) {
  title.value       = t
  message.value     = m
  okLabel.value     = ok
  cancelLabel.value = cancel
  type.value        = mode
  visible.value     = true
  return new Promise(r => { _resolve = r })
}

function onKeydown(e) { if (e.key === 'Escape') resolve(false) }
onMounted(()   => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

defineExpose({ ask })
</script>

<style scoped>
.confirm-fade-enter-active, .confirm-fade-leave-active { transition: opacity .2s, transform .2s; }
.confirm-fade-enter-from, .confirm-fade-leave-to { opacity: 0; transform: scale(.95); }

.confirm-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.confirm-box {
  background: var(--c-surface); border-radius: 16px;
  padding: 24px; width: 100%; max-width: 360px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  display: flex; flex-direction: column; gap: 16px;
}
.confirm-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.confirm-icon.danger  { background: #fef2f2; color: #dc2626; }
.confirm-icon.warning { background: #fef9c3; color: #ca8a04; }
.confirm-icon svg { width: 22px; height: 22px; }
.confirm-body { display: flex; flex-direction: column; gap: 4px; }
.confirm-title { font-size: 15px; font-weight: 700; color: var(--c-text); }
.confirm-msg   { font-size: 13px; color: var(--c-text2); line-height: 1.6; }
.confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }
.confirm-cancel {
  padding: 9px 18px; border-radius: 9px; border: 1px solid var(--c-border);
  background: var(--c-bg); color: var(--c-text2); font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .15s;
}
.confirm-cancel:hover { border-color: var(--c-text3); color: var(--c-text); }
.confirm-ok {
  padding: 9px 18px; border-radius: 9px; border: none;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: opacity .15s; color: #fff;
}
.ok-danger  { background: #dc2626; }
.ok-warning { background: #ca8a04; }
.ok-danger:hover, .ok-warning:hover { opacity: .88; }

@media (max-width: 480px) {
  .confirm-backdrop { align-items: flex-end; padding: 0; }
  .confirm-box { border-radius: 20px 20px 0 0; max-width: 100%; padding-bottom: calc(24px + env(safe-area-inset-bottom)); }
  .confirm-actions { justify-content: stretch; }
  .confirm-cancel, .confirm-ok { flex: 1; text-align: center; }
}
</style>