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
            <div class="confirm-title">{{ $t(title) }}</div>
            <div class="confirm-msg">{{ $t(message) }}</div>
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="resolve(false)">{{ $t(cancelLabel) }}</button>
            <button class="confirm-ok" :class="type === 'danger' ? 'ok-danger' : 'ok-warning'" @click="resolve(true)">{{ $t(okLabel) }}</button>
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
/* A calm alert, centred like the iPhone's: icon, title, message, two equal buttons */
.confirm-fade-enter-active,.confirm-fade-leave-active{transition:opacity .25s var(--ease)}
.confirm-fade-enter-active .confirm-box,.confirm-fade-leave-active .confirm-box{transition:transform .3s var(--ease),opacity .25s var(--ease)}
.confirm-fade-enter-from,.confirm-fade-leave-to{opacity:0}
.confirm-fade-enter-from .confirm-box,.confirm-fade-leave-to .confirm-box{transform:scale(.94);opacity:0}

.confirm-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(12,12,16,.34);backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2);
  display:flex;align-items:center;justify-content:center;padding:20px}
.confirm-box{background:var(--c-surface);border-radius:28px;padding:30px 26px 22px;width:100%;max-width:380px;box-shadow:var(--shadow-xl);
  display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px}
.confirm-icon{width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-bottom:2px}
.confirm-icon.danger{background:var(--c-rose-lt);color:var(--c-rose)}
.confirm-icon.warning{background:var(--c-accent-lt);color:var(--c-accent)}
.confirm-icon svg{width:26px;height:26px}
.confirm-body{display:flex;flex-direction:column;gap:6px}
.confirm-title{font-size:20px;font-weight:750;letter-spacing:-.025em;color:var(--c-text);line-height:1.25;text-wrap:balance}
.confirm-msg{font-size:14.5px;color:var(--c-text2);line-height:1.55;text-wrap:pretty}
.confirm-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-top:10px}
.confirm-cancel,.confirm-ok{height:48px;padding:0 16px;border-radius:999px;border:none;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;
  transition:background .2s var(--ease),opacity .2s,transform .2s var(--ease)}
.confirm-cancel{background:var(--fill);color:var(--c-text)}
.confirm-cancel:hover{background:var(--fill-hover)}
.confirm-ok{color:#fff}
.confirm-cancel:active,.confirm-ok:active{transform:scale(.97)}
.ok-danger{background:#dc2626;box-shadow:0 6px 16px rgba(220,38,38,.25)}
.ok-warning{background:var(--c-accent);box-shadow:0 6px 16px rgba(67,56,202,.25)}
.ok-danger:hover,.ok-warning:hover{opacity:.9}

@media (max-width:480px){
  .confirm-backdrop{align-items:flex-end;padding:0}
  .confirm-box{border-radius:28px 28px 0 0;max-width:100%;padding:30px 22px calc(22px + env(safe-area-inset-bottom))}
  .confirm-fade-enter-from .confirm-box,.confirm-fade-leave-to .confirm-box{transform:translateY(40px);opacity:1}
}
</style>
