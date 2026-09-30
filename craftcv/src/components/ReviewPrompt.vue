<template>
  <div v-if="state !== 'hidden'" class="rv" :class="{ compact }">
    <template v-if="state === 'done'">
      <div class="rv-done">Thank you — your review helps other job seekers find CVMaster.</div>
    </template>
    <template v-else>
      <div class="rv-q">{{ existing ? 'Your review' : 'How was CVMaster?' }}</div>
      <div class="rv-stars" role="radiogroup" aria-label="Rating">
        <button v-for="n in 5" :key="n" type="button" role="radio" :aria-checked="rating === n" :aria-label="`${n} star${n > 1 ? 's' : ''}`"
                :class="{ on: n <= (hover || rating) }" @mouseenter="hover = n" @mouseleave="hover = 0" @click="rating = n">★</button>
      </div>
      <template v-if="rating">
        <textarea v-model="comment" class="f-ta rv-ta" rows="2" maxlength="600"
          :placeholder="rating >= 4 ? 'What did you like? (optional — may appear on our homepage)' : 'What should we improve? (optional)'"></textarea>
        <div class="rv-row">
          <span class="rv-note">Shown as your first name and initial.</span>
          <button class="btn-primary accent btn-sm" :disabled="sending" @click="send">{{ sending ? 'Sending…' : existing ? 'Update review' : 'Send review' }}</button>
        </div>
        <div v-if="error" class="rv-err">{{ error }}</div>
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
const auth = useAuthStore()
const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p

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
.rv{border:1px solid var(--c-border);border-radius:14px;padding:14px 16px;background:var(--c-surface);text-align:left}
.rv.compact{margin-top:18px}
.rv-q{font-size:14px;font-weight:700;color:var(--c-text)}
.rv-stars{display:flex;gap:2px;margin:6px 0 4px}
.rv-stars button{background:none;border:none;padding:0 2px;font-size:28px;line-height:1;color:var(--c-border2);cursor:pointer;transition:transform .1s,color .1s}
.rv-stars button.on{color:#F59E0B}
.rv-stars button:hover{transform:scale(1.12)}
.rv-ta{margin-top:8px;font-size:13px}
.rv-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px;flex-wrap:wrap}
.rv-note{font-size:12px;color:var(--c-text3)}
.rv-err{font-size:12.5px;color:var(--c-rose);margin-top:6px}
.rv-done{font-size:13.5px;color:var(--c-green);font-weight:600}
</style>
