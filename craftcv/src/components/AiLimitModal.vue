<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="al-backdrop" @click.self="open = false">
        <div class="al" role="dialog" aria-labelledby="al-title">
          <div class="al-ic">
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
          </div>
          <h3 id="al-title">{{ reason === 'limit' ? 'You’ve used today’s free AI' : 'Your AI requests' }}</h3>
          <p v-if="tier === 'guest'">Guests get <strong>5 free AI requests a day</strong>. Create a free account to get <strong>30 a day</strong> — your CV comes with you.</p>
          <p v-else-if="tier === 'unverified'">You get <strong>5 a day</strong> until you confirm your email — then it’s <strong>30 a day</strong>. Check your inbox for our link.</p>
          <p v-else>You get <strong>30 free AI requests a day</strong> — writing help, tailoring, ATS checks and fixes. They reset every day at midnight (UTC).</p>
          <div v-if="tier === 'guest'" class="al-next"><button class="btn-primary accent" @click="signUp">Create free account</button></div>
          <div v-else-if="tier === 'unverified'" class="al-next"><button class="btn-primary accent" @click="resend">{{ resent ? 'Sent ✓' : 'Resend confirmation email' }}</button></div>
          <div v-if="quota" class="al-quota">
            <div><span>{{ quota.freeLeft }}</span> free left today</div>
            <div><span>{{ quota.credits }}</span> extra</div>
          </div>
          <div v-if="tier === 'verified'" class="al-offer">
            <div>
              <div class="al-offer-t">100 extra AI requests</div>
              <div class="al-offer-s">One-time €0.50 · they never expire</div>
            </div>
            <button class="btn-primary accent" :disabled="buying || !withdrawalOk" @click="buy">{{ buying ? 'Please wait…' : 'Get them — €0.50' }}</button>
          </div>
          <label v-if="tier === 'verified'" class="al-consent"><input type="checkbox" v-model="withdrawalOk" /><span>I want the requests straight away and agree that I lose my 14-day right of withdrawal once they’re added.</span></label>
          <div v-if="error" class="al-err">{{ error }}</div>
          <button class="btn-ghost al-later" @click="open = false">{{ reason === 'limit' ? 'Maybe tomorrow' : 'Close' }}</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useAuthStore } from '../stores/auth.js'

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
.al-backdrop{position:fixed;inset:0;z-index:9600;background:rgba(20,20,43,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px}
.al{width:100%;max-width:440px;background:var(--c-surface);border-radius:18px;padding:26px 24px 16px;box-shadow:var(--shadow-xl);border:1px solid var(--c-border);text-align:center}
.al-ic{width:48px;height:48px;border-radius:14px;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
.al-ic svg{width:22px;height:22px;fill:var(--c-accent)}
.al h3{font-size:19px;font-weight:700;letter-spacing:-.01em;color:var(--c-text);margin-bottom:8px}
.al p{font-size:13.5px;color:var(--c-text2);line-height:1.55;margin-bottom:14px}
.al p strong{color:var(--c-text)}
.al-quota{display:flex;justify-content:center;gap:22px;font-size:12.5px;color:var(--c-text3);margin-bottom:14px}
.al-quota span{font-size:18px;font-weight:700;color:var(--c-text);margin-right:3px}
.al-offer{display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;border:1.5px solid var(--c-accent);background:var(--c-accent-lt);border-radius:12px;padding:12px 14px}
.al-offer-t{font-size:14px;font-weight:700;color:var(--c-text)}
.al-offer-s{font-size:12px;color:var(--c-text2);margin-top:2px}
.al-consent{display:flex;gap:8px;align-items:flex-start;text-align:left;font-size:12px;color:var(--c-text2);line-height:1.45;margin-top:10px;cursor:pointer}
.al-consent input{margin-top:2px;accent-color:var(--c-accent);flex-shrink:0}
.al-next{margin:4px 0 6px}
.al-err{font-size:12.5px;color:var(--c-rose);margin-top:10px}
.al-later{margin-top:10px}
@media (max-width:480px){ .al-offer{flex-direction:column;align-items:stretch;text-align:center} }
</style>
