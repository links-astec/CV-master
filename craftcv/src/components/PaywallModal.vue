<template>
  <Teleport to="body">
    <Transition name="paywall-fade">
      <div v-if="show" class="paywall-backdrop" @click.self="$emit('close')">
        <div class="paywall-modal">
          <button class="paywall-close" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div class="paywall-head">
            <div class="paywall-cv-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
            </div>
            <h2 class="paywall-title">Export your CV</h2>
            <p class="paywall-sub">Download a pixel-perfect PDF ready to send to employers</p>
          </div>

          <div class="paywall-price-wrap">
            <div class="paywall-price">£4.99</div>
            <div class="paywall-price-sub">one-time · no subscription</div>
          </div>

          <div class="paywall-features">
            <div class="paywall-feature" v-for="f in features" :key="f">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" stroke-width="2.5" style="width:14px;height:14px;flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
              {{ f }}
            </div>
          </div>

          <button class="btn-pay" @click="pay" :disabled="loading">
            <svg v-if="loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;animation:spin .7s linear infinite;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            {{ loading ? 'Processing...' : 'Pay £4.99 — Download PDF' }}
          </button>

          <div class="paywall-secure">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:13px;height:13px;"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Secured by Stripe · Cancel anytime
          </div>

          <div v-if="demoMode" class="demo-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span><strong>Demo mode</strong> — Stripe not configured. Click to simulate payment.</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useNotifStore } from '../stores/notifications.js'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'paid'])
const store = useCvStore()
const notifStore = useNotifStore()
const showToast = inject('showToast')
const loading = ref(false)
const demoMode = ref(false)

const features = [
  'High-resolution PDF export',
  'ATS-optimised formatting',
  'Unlimited re-downloads',
  'All future updates included',
]

async function pay() {
  loading.value = true
  try {
    const r = await fetch('/api/payment/create-session', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId: store.currentDraftId || 'current', templateId: store.template }),
    })
    const data = await r.json()
    if (data.demo) {
      demoMode.value = true
      await notifStore.fetch()
      emit('paid')
    } else if (data.url) {
      window.location.href = data.url
    }
  } catch (e) {
    demoMode.value = true
    showToast?.('Payment: ' + e.message)
  }
  loading.value = false
}
</script>

<style scoped>
.paywall-fade-enter-active,.paywall-fade-leave-active{transition:opacity .25s,transform .25s;}
.paywall-fade-enter-from,.paywall-fade-leave-to{opacity:0;transform:scale(.97);}
.demo-note{display:flex;align-items:center;gap:8px;margin-top:12px;background:var(--c-amber-lt);border:1px solid #f0c080;border-radius:8px;padding:10px 12px;font-size:12px;color:var(--c-amber);}
@keyframes spin{to{transform:rotate(360deg);}}
.paywall-head { text-align: center; margin-bottom: 20px; }
.paywall-cv-icon { width: 56px; height: 56px; background: var(--c-accent-lt); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.paywall-cv-icon svg { width: 28px; height: 28px; color: var(--c-accent); }
.paywall-price-wrap { text-align: center; margin-bottom: 20px; }
.paywall-price { font-size: 46px; font-weight: 800; color: var(--c-accent); line-height: 1; margin-bottom: 4px; }
.paywall-price-sub { font-size: 12px; color: var(--c-text3); }
</style>