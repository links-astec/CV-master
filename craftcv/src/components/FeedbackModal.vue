<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fb-backdrop" @click.self="close">
        <div class="fb" role="dialog" aria-labelledby="fb-title">
          <button class="icon-btn fb-x" @click="close" aria-label="Close">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <template v-if="sentRef">
            <div class="fb-done">
              <div class="fb-done-ic"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
              <h3>Thanks — we’ve got it</h3>
              <p v-if="kind === 'complaint' || kind === 'payment'">
                We take this seriously and will look into it. {{ email ? `We’ll reply to ${email}.` : 'Add an email next time if you’d like a reply.' }}
              </p>
              <p v-else>{{ email ? `If we need more detail we’ll reply to ${email}.` : 'We read every message.' }}</p>
              <p class="fb-ref">Reference #{{ sentRef }}</p>
              <button class="btn-primary accent" @click="close">Done</button>
            </div>
          </template>

          <template v-else>
            <h3 id="fb-title">Feedback &amp; complaints</h3>
            <p class="fb-sub">Tell us what’s working, what isn’t, or anything that went wrong. Every message is read.</p>

            <div class="fb-lbl">What is it about?</div>
            <div class="fb-kinds">
              <button v-for="k in KINDS" :key="k.id" class="fb-kind" :class="{ on: kind === k.id }" :aria-pressed="kind === k.id" @click="kind = k.id">
                <span class="fb-kind-t">{{ k.label }}</span>
                <span class="fb-kind-d">{{ k.desc }}</span>
              </button>
            </div>

            <label class="fb-lbl" for="fb-msg">Your message</label>
            <textarea id="fb-msg" ref="msgRef" v-model="message" class="f-ta" rows="5" maxlength="4000" :placeholder="placeholder"></textarea>

            <label class="fb-lbl" for="fb-email">Email for our reply <span class="fb-opt">{{ auth.isLoggedIn ? '' : '(optional)' }}</span></label>
            <input id="fb-email" v-model="email" class="f-inp" type="email" placeholder="you@email.com" />

            <div v-if="error" class="fb-err">{{ error }}</div>
            <div class="fb-ft">
              <span class="fb-note">Urgent payment problem? Include the email you paid with.</span>
              <button class="btn-primary accent" :disabled="sending || message.trim().length < 10" @click="send">
                {{ sending ? 'Sending…' : 'Send' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth  = useAuthStore()
const route = useRoute()
const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path

const KINDS = [
  { id: 'suggestion', label: 'Suggestion', desc: 'An idea or improvement' },
  { id: 'problem',    label: 'Problem',    desc: 'Something isn’t working' },
  { id: 'payment',    label: 'Payment',    desc: 'Charged, refund, no PDF' },
  { id: 'complaint',  label: 'Complaint',  desc: 'You’re unhappy with us' },
]
const PLACEHOLDERS = {
  suggestion: 'What would make CVMaster better for you?',
  problem:    'What happened, and what did you expect? The page and the steps help us fix it fast.',
  payment:    'What happened with your payment? Include the date and roughly when you paid.',
  complaint:  'Tell us what went wrong and what you would like us to do about it.',
}

const open    = ref(false)
const kind    = ref('suggestion')
const message = ref('')
const email   = ref('')
const sending = ref(false)
const error   = ref('')
const sentRef = ref('')
const msgRef  = ref(null)
const placeholder = computed(() => PLACEHOLDERS[kind.value])

// show('complaint') opens straight on that type
function show(k = 'suggestion') {
  kind.value = KINDS.some(x => x.id === k) ? k : 'suggestion'
  email.value = email.value || auth.user?.email || ''
  error.value = ''
  sentRef.value = ''
  open.value = true
  nextTick(() => msgRef.value?.focus())
}
function close() { if (!sending.value) open.value = false }

async function send() {
  sending.value = true
  error.value = ''
  try {
    const r = await fetch(apiUrl('/api/feedback'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: kind.value, message: message.value, email: email.value.trim(), page: route.fullPath }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || 'We couldn’t send your message just now — please try again.')
    sentRef.value = j.ref
    message.value = ''
  } catch (e) {
    error.value = e.message
  }
  sending.value = false
}

defineExpose({ show })
</script>

<style scoped>
.fb-backdrop{position:fixed;inset:0;z-index:9500;background:rgba(20,20,43,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px}
.fb{position:relative;width:100%;max-width:520px;max-height:92dvh;overflow-y:auto;background:var(--c-surface);border-radius:18px;padding:26px 26px 20px;box-shadow:var(--shadow-xl);border:1px solid var(--c-border)}
.fb-x{position:absolute;top:14px;right:14px}
.fb h3{font-size:19px;font-weight:700;letter-spacing:-.01em;color:var(--c-text);margin:0 30px 6px 0}
.fb-sub{font-size:13.5px;color:var(--c-text2);line-height:1.55;margin-bottom:18px}
.fb-lbl{display:block;font-size:13px;font-weight:600;color:var(--c-text);margin:14px 0 7px}
.fb-opt{font-weight:400;color:var(--c-text3)}
.fb-kinds{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fb-kind{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:10px 12px;border-radius:10px;border:1px solid var(--c-border);background:var(--c-surface);text-align:left;transition:border-color .12s,background .12s}
.fb-kind:hover{border-color:var(--c-border2)}
.fb-kind.on{border-color:var(--c-accent);background:var(--c-accent-lt)}
.fb-kind-t{font-size:13.5px;font-weight:600;color:var(--c-text)}
.fb-kind.on .fb-kind-t{color:var(--c-accent)}
.fb-kind-d{font-size:12px;color:var(--c-text3)}
.fb-err{margin-top:12px;font-size:12.5px;color:var(--c-rose)}
.fb-ft{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;padding-top:14px;border-top:1px solid var(--c-border)}
.fb-note{font-size:12px;color:var(--c-text3);line-height:1.45}
.fb-done{text-align:center;padding:10px 6px 4px}
.fb-done-ic{width:52px;height:52px;border-radius:50%;background:var(--c-green-lt);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.fb-done-ic svg{width:24px;height:24px;fill:none;stroke:var(--c-green);stroke-width:3}
.fb-done h3{margin:0 0 8px}
.fb-done p{font-size:13.5px;color:var(--c-text2);line-height:1.55;margin-bottom:8px}
.fb-ref{font-size:12.5px;color:var(--c-text3);margin-bottom:16px!important}
@media (max-width:600px){
  .fb-backdrop{padding:0;align-items:flex-end}
  .fb{border-radius:18px 18px 0 0;max-width:100%;padding:22px 18px calc(18px + env(safe-area-inset-bottom))}
  .fb-ft{flex-direction:column;align-items:stretch}
}
</style>
