<template>
  <div v-if="state !== 'hidden'" class="rv" :class="{ compact }">
    <template v-if="state === 'done'">
      <div class="rv-done">
        <span class="rv-done-ic"><svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg></span>
        <span>{{ $t('Thank you. Your review helps other job seekers find CVMaster.') }}</span>
      </div>
    </template>
    <template v-else>
      <div class="rv-q">{{ $t(existing ? 'Your review' : 'How was CVMaster?') }}</div>
      <div class="rv-stars" role="radiogroup" :aria-label="$t('Rating')">
        <button v-for="n in 5" :key="n" type="button" role="radio" :aria-checked="rating === n" :aria-label="$t(n > 1 ? '{n} stars' : '{n} star', { n })"
                :class="{ on: n <= (hover || rating) }" @mouseenter="hover = n" @mouseleave="hover = 0" @click="rating = n">
          <svg viewBox="0 0 24 24"><path d="M12 2.8l2.75 5.75 6.3.8-4.62 4.37 1.17 6.24L12 16.9l-5.6 3.06 1.17-6.24L2.95 9.35l6.3-.8z"/></svg>
        </button>
        <span class="rv-word" aria-hidden="true">{{ (hover || rating) ? $t(WORDS[(hover || rating) - 1]) : '' }}</span>
      </div>
      <template v-if="rating">
        <textarea v-model="comment" class="f-ta rv-ta" rows="2" maxlength="600"
          :placeholder="$t(rating >= 4 ? 'What did you like? (optional, may appear on our homepage)' : 'What should we improve? (optional)')"></textarea>
        <div class="rv-row">
          <span class="rv-note">{{ $t('Shown as your first name and initial.') }}</span>
          <button class="btn-primary accent btn-sm" :disabled="sending" @click="send">{{ $t(sending ? 'Sending…' : existing ? 'Update review' : 'Send review') }}</button>
        </div>
        <div v-if="error" class="rv-err">{{ $t(error) }}</div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'

// compact: smaller version for the "CV sent" screen. Hidden for guests and people who
// haven't made a CV yet; in the export flow also hidden once they've already reviewed.
const props = defineProps({ compact: Boolean, onlyIfNew: Boolean })
const emit = defineEmits(['shown'])
const auth = useAuthStore()
const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p

const WORDS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent']
const state    = ref('hidden')
const existing = ref(false)
const rating   = ref(0)
const hover    = ref(0)
const comment  = ref('')
const sending  = ref(false)
const error    = ref('')

onMounted(async () => {
  if (!auth.isLoggedIn) return
  try {
    const r = await fetch(apiUrl('/api/reviews/mine'), { credentials: 'include' })
    const j = await r.json()
    if (!r.ok || !j.canReview) return
    if (j.review) {
      if (props.onlyIfNew) return
      existing.value = true; rating.value = j.review.rating; comment.value = j.review.comment || ''
    }
    state.value = 'ask'
    emit('shown')
  } catch {}
})

async function send() {
  sending.value = true; error.value = ''
  try {
    const r = await fetch(apiUrl('/api/reviews'), {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: rating.value, comment: comment.value }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || 'Could not send your review.')
    state.value = 'done'
  } catch (e) { error.value = e.message }
  sending.value = false
}
</script>

<style scoped>
.rv{border:none;border-radius:24px;padding:24px 26px;background:var(--c-surface);text-align:left}
.rv.compact{margin-top:18px}
.rv-q{font-size:20px;font-weight:750;letter-spacing:-.025em;color:var(--c-text)}
.rv-stars{display:flex;align-items:center;gap:6px;margin:14px 0 4px}
.rv-stars button{width:40px;height:40px;border-radius:10px;background:transparent;border:none;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:transform .25s var(--ease),background .25s var(--ease)}
.rv-stars svg{width:24px;height:24px;fill:color-mix(in srgb,var(--c-text) 18%,var(--c-surface));stroke:none;transition:fill .2s var(--ease)}
.rv-stars button.on{background:transparent}
.rv-stars button.on svg{fill:#F5A623}
[data-theme="dark"] .rv-stars button.on{background:#3a2e10}
.rv-stars button:hover{transform:translateY(-2px) scale(1.06)}
.rv-stars button:active{transform:scale(.94)}
.rv-word{margin-left:10px;font-size:14px;font-weight:600;color:var(--c-text2);min-width:80px}
.rv-ta{margin-top:14px;font-size:14px}
.rv-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;flex-wrap:wrap}
.rv-row .btn-primary{height:40px;padding:0 20px;font-size:14px}
.rv-note{font-size:12.5px;color:var(--c-text3)}
.rv-err{font-size:12.5px;color:var(--c-rose);margin-top:8px}
.rv-done{display:flex;align-items:center;gap:14px;font-size:15px;color:var(--c-text);font-weight:600;line-height:1.45}
.rv-done-ic{width:44px;height:44px;border-radius:50%;background:var(--c-green-lt);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rv-done-ic svg{width:22px;height:22px;fill:none;stroke:var(--c-green);stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round}
.rv.compact .rv-q{font-size:17px}
.rv.compact .rv-stars button{width:40px;height:40px;border-radius:12px}
@media (max-width:420px){ .rv-stars{gap:5px} .rv-stars button{width:40px;height:40px} .rv-word{flex-basis:100%;margin:6px 0 0} .rv-stars{flex-wrap:wrap} }
</style>
