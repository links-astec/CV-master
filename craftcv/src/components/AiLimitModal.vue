<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="al-backdrop" @click.self="open = false">
        <div class="al" role="dialog" aria-labelledby="al-title">
          <div class="al-bar">
            <h3 id="al-title">{{ $t(reason === 'limit' ? 'You’ve used today’s free AI' : 'AI requests') }}</h3>
            <button type="button" class="al-done" @click="open = false">{{ $t(reason === 'limit' ? 'Later' : 'Done') }}</button>
          </div>

          <!-- Guests and unconfirmed emails: one thing to do -->
          <template v-if="tier === 'guest' || tier === 'unverified'">
            <p class="al-text">{{ $t(tier === 'guest' ? 'Guests get 5 free AI requests a day. Create a free account to get 30 a day. Your CV comes with you.' : 'You get 5 a day until you confirm your email. Then it’s 30 a day. Check your inbox for our link.') }}</p>
            <button v-if="tier === 'guest'" class="al-cta" @click="signUp">{{ $t('Create free account') }}</button>
            <button v-else class="al-cta" @click="resend">{{ $t(resent ? 'Sent ✓' : 'Resend confirmation email') }}</button>
          </template>

          <template v-else>
            <div class="al-list">
              <div class="al-li"><span>{{ $t('Left today') }}</span><span class="al-v">{{ quota ? $t('{n} of {limit}', { n: quota.freeLeft, limit: quota.limit }) : '·' }}</span></div>
              <div class="al-li"><span>{{ $t('Extra requests') }}</span><span class="al-v">{{ quota ? quota.credits : '·' }}</span></div>
            </div>
            <p class="al-foot">{{ $t(tier === 'campus' ? '100 every day with your JUNIA student account, reset at midnight (UTC).' : tier === 'pass' ? '100 every day with your Job Hunt Pass, reset at midnight (UTC). Extra requests never expire.' : '30 free every day, reset at midnight (UTC). Extra requests never expire.') }}</p>

            <template v-if="tier !== 'campus'">
            <div class="al-list">
              <div class="al-li al-li-buy">
                <span><b>{{ $t('100 extra requests') }}</b><small>{{ $t('One-time payment. They never expire.') }}</small></span>
                <span class="al-price">€0.50<small v-if="approx(0.5)">{{ approx(0.5) }}</small></span>
              </div>
            </div>
            <label class="al-consent"><input type="checkbox" v-model="withdrawalOk" /><span>{{ $t('I want the requests straight away and agree that I lose my 14-day right of withdrawal once they’re added.') }}</span></label>
            <button class="al-cta" :disabled="buying || !withdrawalOk" @click="buy">{{ $t(buying ? 'Please wait…' : 'Buy for €0.50') }}</button>
            </template>
          </template>
          <div v-if="error" class="al-err">{{ $t(error) }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { approx } from '../composables/localPrice.js'

const auth = useAuthStore()
const requireAccount = inject('requireAccount', null)
const resendVerification = inject('resendVerification', null)
const tier   = computed(() => quota.value?.tier || (auth.isLoggedIn ? (auth.user?.emailVerified === false ? 'unverified' : 'verified') : 'guest'))
const resent = ref(false)
const withdrawalOk = ref(false)
async function signUp() { open.value = false; await requireAccount?.('ai') }
async function resend() { await resendVerification?.(); resent.value = true }
const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path

const open   = ref(false)
const reason = ref('limit')   // 'limit' = a request was refused; 'info' = opened from Settings
const quota  = ref(null)
const buying = ref(false)
const error  = ref('')

async function loadQuota() {
  try { const r = await fetch(apiUrl('/api/ai/quota'), { credentials: 'include' }); if (r.ok) quota.value = await r.json() } catch {}
}
function show(why = 'limit') {
  reason.value = why
  error.value = ''
  open.value = true
  loadQuota()
}

async function buy() {
  error.value = ''
  // Credits belong to an account, so guests sign up first
  if (!auth.isLoggedIn) {
    const ok = requireAccount ? await requireAccount('ai') : false
    if (!ok) return
  }
  buying.value = true
  try {
    const r = await fetch(apiUrl('/api/payment/ai-pack'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ withdrawalConsent: withdrawalOk.value }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || 'Could not start payment.')
    if (j.url) { window.location.href = j.url; return }
    await loadQuota()   // demo mode: credited straight away
  } catch (e) { error.value = e.message }
  buying.value = false
}

defineExpose({ show })
</script>

<style scoped>
.al-backdrop{position:fixed;inset:0;z-index:9600;background:rgba(0,0,0,.32);display:flex;align-items:center;justify-content:center;padding:20px}
.al{width:100%;max-width:420px;background:var(--c-bg);border-radius:24px;padding:18px 18px 20px;box-shadow:0 24px 70px rgba(0,0,0,.25)}
.al-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 4px 14px}
.al h3{font-size:20px;font-weight:700;letter-spacing:-.02em;color:var(--c-text);margin:0}
.al-done{border:none;background:none;padding:4px 2px;font:inherit;font-size:15.5px;font-weight:600;color:var(--c-accent);cursor:pointer;flex-shrink:0}
.al-text{font-size:14.5px;color:var(--c-text2);line-height:1.5;margin:0 4px 16px}
.al-list{background:var(--c-surface);border-radius:14px;overflow:hidden}
.al-li{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;padding:11px 16px;font-size:15px;color:var(--c-text);position:relative}
.al-li + .al-li::before{content:'';position:absolute;top:0;left:16px;right:0;height:1px;background:var(--hair)}
.al-v{color:var(--c-text3)}
.al-li-buy > span:first-child{display:flex;flex-direction:column;gap:2px}
.al-li-buy b{font-weight:600}
.al-li-buy small,.al-price small{font-size:12.5px;color:var(--c-text3);font-weight:400}
.al-price{display:flex;flex-direction:column;align-items:flex-end;font-weight:600}
.al-foot{font-size:12.5px;line-height:1.45;color:var(--c-text3);margin:7px 16px 18px}
.al-consent{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;color:var(--c-text3);line-height:1.45;margin:12px 6px 14px;cursor:pointer}
.al-consent input{margin-top:2px;accent-color:var(--c-accent);flex-shrink:0}
.al-cta{display:block;width:100%;height:50px;border:none;border-radius:14px;background:var(--c-accent);color:#fff;font:inherit;font-size:16px;font-weight:600;cursor:pointer;transition:opacity .2s}
.al-cta:disabled{opacity:.4;cursor:default}
.al-err{font-size:12.5px;color:var(--c-rose);margin:10px 6px 0}
</style>
