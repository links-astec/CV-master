<template>
  <!-- After sign-up: one question per screen (tap to answer), like setting up a new phone. What they want
       helps the AI, the job matches and the tips; how they heard about us is for the marketing numbers.
       It ends with the tour. -->
  <Teleport to="body">
    <div class="ob-root">
      <div class="ob-card" role="dialog" aria-modal="true" :aria-labelledby="'ob-t-' + step">
        <div class="ob-top">
          <button v-if="step > 0 && step < LAST" type="button" class="ob-back" :aria-label="$t('Back')" @click="go(step - 1)">
            <svg viewBox="0 0 24 24"><polyline points="15 6 9 12 15 18"/></svg>
          </button>
          <div class="ob-dots" aria-hidden="true"><i v-for="n in LAST - 1" :key="n" :class="{ on: n <= step }"></i></div>
          <button v-if="step < LAST" type="button" class="ob-skip" :disabled="saving" @click="finish(true)">{{ $t('Skip') }}</button>
        </div>

        <div class="ob-body">
          <Transition :name="dir > 0 ? 'ob-next' : 'ob-prev'" mode="out-in">
            <!-- 0 Welcome -->
            <section v-if="step === 0" key="0" class="ob-step ob-hello">
              <BrandLogo mark-only large animate />
              <h2 id="ob-t-0">{{ firstName ? $t('Welcome, {name}', { name: firstName }) : $t('Welcome to CVMaster') }}</h2>
              <p>{{ $t('A few taps so CVMaster fits you: the AI writes for your level and your field, and tailors your CV to the job you want.') }}</p>
              <button type="button" class="ob-cta" @click="go(1)">{{ $t('Get started') }}</button>
              <p class="ob-small">{{ $t('About 30 seconds. You can change everything later in Settings.') }}</p>
            </section>

            <!-- 1 Goal -->
            <section v-else-if="step === 1" key="1" class="ob-step">
              <h2 id="ob-t-1">{{ $t('What brings you to CVMaster?') }}</h2>
              <div class="ob-list" role="radiogroup">
                <button v-for="o in GOALS" :key="o.id" type="button" role="radio" class="ob-row" :aria-checked="form.goal === o.id" @click="pick('goal', o.id)">
                  <span>{{ $t(o.label) }}</span><svg v-if="form.goal === o.id" class="ob-tick" viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg>
                </button>
              </div>
            </section>

            <!-- 2 Career stage -->
            <section v-else-if="step === 2" key="2" class="ob-step">
              <h2 id="ob-t-2">{{ $t('Where are you in your career?') }}</h2>
              <div class="ob-list" role="radiogroup">
                <button v-for="o in LEVELS" :key="o.id" type="button" role="radio" class="ob-row" :aria-checked="form.experience === o.id" @click="pick('experience', o.id)">
                  <span>{{ $t(o.label) }}</span><small>{{ $t(o.years) }}</small>
                  <svg v-if="form.experience === o.id" class="ob-tick" viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg>
                </button>
              </div>
            </section>

            <!-- 3 Field -->
            <section v-else-if="step === 3" key="3" class="ob-step">
              <h2 id="ob-t-3">{{ $t('Which field are you in?') }}</h2>
              <div class="ob-grid" role="radiogroup">
                <button v-for="o in INDUSTRIES" :key="o.id" type="button" role="radio" class="ob-tile" :aria-checked="form.industry === o.id" @click="pick('industry', o.id)">{{ $t(o.label) }}</button>
              </div>
            </section>

            <!-- 4 The job they want -->
            <section v-else-if="step === 4" key="4" class="ob-step">
              <h2 id="ob-t-4">{{ $t('What job are you looking for?') }}</h2>
              <p>{{ $t('We use it to tailor your CV, and to suggest jobs that fit.') }}</p>
              <div class="ob-group">
                <input ref="roleIn" v-model="form.targetRole" class="ob-in" maxlength="80" :placeholder="$t('Job title, e.g. {role}', { role: $t(ideas[0]) })" :aria-label="$t('The job you want')" @keydown.enter="go(5)" />
                <input v-model="form.targetLocation" class="ob-in" maxlength="80" :placeholder="$t('Where, e.g. {place}', { place: city || 'Paris' })" :aria-label="$t('Where')" @keydown.enter="go(5)" />
              </div>
              <div class="ob-ideas">
                <button v-for="r in ideas" :key="r" type="button" class="ob-idea" :class="{ on: form.targetRole === $t(r) }" @click="form.targetRole = $t(r)">{{ $t(r) }}</button>
              </div>
              <button type="button" class="ob-cta" @click="go(5)">{{ $t(form.targetRole.trim() ? 'Continue' : 'Not sure yet') }}</button>
            </section>

            <!-- 5 How they heard about us -->
            <section v-else-if="step === 5" key="5" class="ob-step">
              <h2 id="ob-t-5">{{ $t('How did you hear about us?') }}</h2>
              <p>{{ $t('It helps us reach more people like you.') }}</p>
              <div class="ob-list" role="radiogroup">
                <button v-for="o in HEARD_FROM" :key="o.id" type="button" role="radio" class="ob-row" :aria-checked="form.heardFrom === o.id" @click="pick('heardFrom', o.id)">
                  <span>{{ $t(o.label) }}</span><svg v-if="form.heardFrom === o.id" class="ob-tick" viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg>
                </button>
              </div>
            </section>

            <!-- 6 All set -->
            <section v-else key="6" class="ob-step ob-hello">
              <div class="ob-done" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg></div>
              <h2 id="ob-t-6">{{ $t('You’re all set') }}</h2>
              <div class="ob-list ob-sum">
                <button v-for="r in summary" :key="r.step" type="button" class="ob-row" @click="go(r.step)">
                  <span>{{ $t(r.label) }}</span><small>{{ r.value }}</small>
                  <svg class="ob-chev" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
                </button>
              </div>
              <button type="button" class="ob-cta" :disabled="saving" @click="finish(true)">{{ $t(saving ? 'Saving…' : 'Show me around') }}</button>
              <button type="button" class="ob-link" :disabled="saving" @click="finish(false)">{{ $t('Start without the tour') }}</button>
            </section>
          </Transition>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { t } from '../../i18n/index.js'
import BrandLogo from '../BrandLogo.vue'
import { INDUSTRIES, GOALS, LEVELS, HEARD_FROM, ROLE_IDEAS } from '../../composables/profileOptions.js'

const auth = useAuthStore()
const emit = defineEmits(['done'])
const LAST = 6

const step = ref(0)
const dir = ref(1)
const saving = ref(false)
const roleIn = ref(null)
const u = auth.user || {}
const form = ref({ goal: u.goal || '', experience: u.experience || '', industry: u.industry || '', targetRole: u.targetRole || '', targetLocation: u.targetLocation || '', heardFrom: '' })
const firstName = computed(() => (auth.user?.name || '').trim().split(/\s+/)[0] || '')
const ideas = computed(() => ROLE_IDEAS[form.value.industry] || ROLE_IDEAS.other)
// The city from the device's time zone, only as an example in the "Where" field
const city = (() => { try { const z = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; return z.includes('/') ? z.split('/').pop().replace(/_/g, ' ') : '' } catch { return '' } })()

function go(n) {
  dir.value = n > step.value ? 1 : -1
  step.value = Math.max(0, Math.min(LAST, n))
  if (step.value === 4) nextTick(() => setTimeout(() => roleIn.value?.focus(), 350))
}
// Tap an answer: it's ticked, and the next question follows
function pick(key, id) {
  form.value[key] = id
  setTimeout(() => go(step.value + 1), 260)
}

const label = (list, id) => t(list.find(o => o.id === id)?.label || '')
const summary = computed(() => [
  { step: 1, label: 'Aiming for', value: label(GOALS, form.value.goal) || t('Not set') },
  { step: 2, label: 'Career stage', value: label(LEVELS, form.value.experience) || t('Not set') },
  { step: 3, label: 'Field', value: label(INDUSTRIES, form.value.industry) || t('Not set') },
  { step: 4, label: 'The job you want', value: [form.value.targetRole, form.value.targetLocation].filter(Boolean).join(' · ') || t('Not set') },
])

// Saves what they answered (nothing is made up when they skip) and closes; the tour follows unless they said no
async function finish(tour) {
  saving.value = true
  await auth.completeOnboarding({ ...form.value }).catch(() => {})
  saving.value = false
  emit('done', { tour })
}
</script>

<style scoped>
.ob-root{position:fixed;inset:0;z-index:1500;background:rgba(12,12,16,.34);backdrop-filter:blur(16px) saturate(1.2);-webkit-backdrop-filter:blur(16px) saturate(1.2);display:flex;align-items:center;justify-content:center;padding:20px;animation:obFade .35s var(--ease) both}
.ob-card{position:relative;background:var(--c-bg);border-radius:28px;width:100%;max-width:500px;height:min(680px,calc(100dvh - 40px));display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--shadow-xl);animation:obIn .45s var(--ease) both}
@keyframes obFade{from{opacity:0}}
@keyframes obIn{from{opacity:0;transform:translateY(16px) scale(.98)}}

.ob-top{display:flex;align-items:center;gap:12px;padding:16px 18px 0;min-height:52px}
.ob-back{width:36px;height:36px;border:none;border-radius:50%;background:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--c-accent)}
.ob-back svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.ob-dots{flex:1;display:flex;justify-content:center;gap:6px}
.ob-dots i{width:22px;height:4px;border-radius:99px;background:color-mix(in srgb,var(--c-text) 12%,transparent);transition:background .3s ease}
.ob-dots i.on{background:var(--c-accent)}
.ob-skip{border:none;background:none;font:inherit;font-size:15px;font-weight:500;color:var(--c-text3);cursor:pointer;padding:6px 4px;min-width:36px}
.ob-skip:hover{color:var(--c-text)}

.ob-body{flex:1;overflow-y:auto;padding:10px 28px 28px;position:relative}
.ob-step{display:flex;flex-direction:column}
.ob-step h2{font-size:28px;font-weight:700;letter-spacing:-.03em;line-height:1.15;margin:14px 0 0;color:var(--c-text)}
.ob-step > p{font-size:15.5px;color:var(--c-text2);line-height:1.5;margin:8px 0 0}
.ob-hello{align-items:center;text-align:center;padding-top:28px}
.ob-hello :deep(.brand){margin-bottom:8px}
.ob-small{font-size:13px!important;color:var(--c-text3)!important;margin-top:14px!important}

/* Answers as one group of rows */
.ob-list{background:var(--c-surface);border-radius:16px;overflow:hidden;margin-top:22px;width:100%}
.ob-row{display:flex;align-items:center;gap:10px;width:100%;min-height:52px;padding:12px 16px;border:none;background:none;font:inherit;font-size:16px;color:var(--c-text);text-align:left;cursor:pointer;position:relative;transition:background .15s ease}
.ob-row + .ob-row::before{content:'';position:absolute;top:0;left:16px;right:0;height:1px;background:var(--hair)}
.ob-row:hover{background:color-mix(in srgb,var(--c-text) 4%,transparent)}
.ob-row > span{flex:1}
.ob-row small{font-size:14px;color:var(--c-text3)}
.ob-row[aria-checked="true"]{color:var(--c-accent);font-weight:600}
.ob-tick{width:20px;height:20px;fill:none;stroke:var(--c-accent);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.ob-chev{width:15px;height:15px;fill:none;stroke:var(--c-text3);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.ob-sum .ob-row small{max-width:55%;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.ob-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:22px}
.ob-tile{min-height:52px;padding:10px 14px;border:none;border-radius:14px;background:var(--c-surface);font:inherit;font-size:15.5px;font-weight:500;color:var(--c-text);text-align:left;cursor:pointer;transition:box-shadow .15s ease,color .15s ease}
.ob-tile:hover{box-shadow:inset 0 0 0 1px var(--hair)}
.ob-tile[aria-checked="true"]{box-shadow:inset 0 0 0 2px var(--c-accent);color:var(--c-accent);font-weight:600}

.ob-group{background:var(--c-surface);border-radius:16px;overflow:hidden;margin-top:20px}
.ob-in{display:block;width:100%;height:54px;padding:0 16px;border:none;background:none;font:inherit;font-size:16px;color:var(--c-text);outline:none}
.ob-in + .ob-in{border-top:1px solid var(--hair)}
.ob-in::placeholder{color:var(--c-text3)}
.ob-ideas{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.ob-idea{height:34px;padding:0 14px;border:none;border-radius:99px;background:var(--c-surface);font:inherit;font-size:14px;color:var(--c-text2);cursor:pointer}
.ob-idea.on{background:var(--c-accent);color:#fff}

.ob-cta{display:block;width:100%;height:52px;margin-top:26px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:16px;font-weight:600;cursor:pointer;transition:opacity .2s}
.ob-cta:disabled{opacity:.55;cursor:default}
.ob-link{margin-top:14px;border:none;background:none;font:inherit;font-size:15px;font-weight:600;color:var(--c-accent);cursor:pointer}
.ob-done{width:64px;height:64px;border-radius:50%;background:var(--c-accent);display:flex;align-items:center;justify-content:center;margin-bottom:6px;animation:obPop .5s var(--ease) both}
.ob-done svg{width:32px;height:32px;fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
@keyframes obPop{from{transform:scale(.6);opacity:0}}

.ob-next-enter-active,.ob-next-leave-active,.ob-prev-enter-active,.ob-prev-leave-active{transition:opacity .22s ease,transform .28s cubic-bezier(.2,.8,.2,1)}
.ob-next-enter-from,.ob-prev-leave-to{opacity:0;transform:translateX(28px)}
.ob-next-leave-to,.ob-prev-enter-from{opacity:0;transform:translateX(-28px)}

@media (max-width:560px){
  .ob-root{padding:0;align-items:stretch}
  .ob-card{max-width:100%;height:100vh;height:100dvh;border-radius:0}
  .ob-top{padding-top:calc(12px + env(safe-area-inset-top))}
  .ob-body{padding:6px 22px calc(28px + env(safe-area-inset-bottom))}
}
@media (prefers-reduced-motion:reduce){ .ob-next-enter-active,.ob-next-leave-active,.ob-prev-enter-active,.ob-prev-leave-active{transition:opacity .15s} }
</style>
