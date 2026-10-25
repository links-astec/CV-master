<template>
  <!-- After sign-up: one question per screen (tap to answer), like setting up a new phone. What they want
       helps the AI, the job matches and the tips; how they heard about us is for the marketing numbers.
       It ends with the tour. JUNIA students get their own welcome (everything is free for them) and are
       asked for their school and year instead of their career stage and how they heard about us. -->
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
            <!-- Welcome, JUNIA students: what's free for them -->
            <section v-if="kind === 'hello' && campus" key="hello-campus" class="ob-step ob-hello ob-campus">
              <BrandLogo mark-only large animate />
              <span class="ob-badge">{{ $t('JUNIA student access') }}</span>
              <h2 :id="'ob-t-' + step">{{ firstName ? $t('Welcome, {name}', { name: firstName }) : $t('Welcome to CVMaster') }}</h2>
              <p>{{ $t('Thanks to JUNIA, CVMaster is free for you while you study.') }}</p>
              <div class="ob-list ob-perks">
                <div v-for="f in CAMPUS_PERKS" :key="f" class="ob-row"><svg class="ob-tick" viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg><span>{{ $t(f) }}</span></div>
              </div>
              <p v-if="!auth.user?.campusActive" class="ob-confirm">{{ $t('One thing first: confirm your student email. We sent a link to {email}.', { email: auth.user?.email }) }}
                <button type="button" class="ob-link ob-inline" :disabled="resent" @click="resend">{{ $t(resent ? 'Sent' : 'Resend it') }}</button></p>
              <button type="button" class="ob-cta" @click="go(1)">{{ $t('Get started') }}</button>
              <p class="ob-small">{{ $t('A few taps so CVMaster fits your studies. You can change everything later in Settings.') }}</p>
            </section>

            <!-- Welcome -->
            <section v-else-if="kind === 'hello'" key="hello" class="ob-step ob-hello">
              <BrandLogo mark-only large animate />
              <h2 :id="'ob-t-' + step">{{ firstName ? $t('Welcome, {name}', { name: firstName }) : $t('Welcome to CVMaster') }}</h2>
              <p>{{ $t('A few taps so CVMaster fits you: the AI writes for your level and your field, and tailors your CV to the job you want.') }}</p>
              <button type="button" class="ob-cta" @click="go(1)">{{ $t('Get started') }}</button>
              <p class="ob-small">{{ $t('About 30 seconds. You can change everything later in Settings.') }}</p>
            </section>

            <!-- JUNIA: which school -->
            <section v-else-if="kind === 'school'" key="school" class="ob-step">
              <h2 :id="'ob-t-' + step">{{ $t('Which school are you at?') }}</h2>
              <div class="ob-list" role="radiogroup">
                <button v-for="o in SCHOOLS" :key="o.id" type="button" role="radio" class="ob-row" :aria-checked="form.school === o.id" @click="pick('school', o.id)">
                  <span>{{ $t(o.label) }}</span><small v-if="o.sub">{{ $t(o.sub) }}</small><svg v-if="form.school === o.id" class="ob-tick" viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg>
                </button>
              </div>
            </section>

            <!-- JUNIA: which year -->
            <section v-else-if="kind === 'year'" key="year" class="ob-step">
              <h2 :id="'ob-t-' + step">{{ $t('Which year are you in?') }}</h2>
              <div class="ob-grid" role="radiogroup">
                <button v-for="o in YEARS" :key="o.id" type="button" role="radio" class="ob-tile" :aria-checked="form.studyYear === o.id" @click="pick('studyYear', o.id)">{{ $t(o.label) }}</button>
              </div>
            </section>

            <!-- Goal -->
            <section v-else-if="kind === 'goal'" key="goal" class="ob-step">
              <h2 :id="'ob-t-' + step">{{ $t(campus ? 'What are you looking for?' : 'What brings you to CVMaster?') }}</h2>
              <div class="ob-list" role="radiogroup">
                <button v-for="o in goals" :key="o.id" type="button" role="radio" class="ob-row" :aria-checked="form.goal === o.id" @click="pick('goal', o.id)">
                  <span>{{ $t(o.label) }}</span><svg v-if="form.goal === o.id" class="ob-tick" viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg>
                </button>
              </div>
            </section>

            <!-- Career stage -->
            <section v-else-if="kind === 'stage'" key="stage" class="ob-step">
              <h2 :id="'ob-t-' + step">{{ $t('Where are you in your career?') }}</h2>
              <div class="ob-list" role="radiogroup">
                <button v-for="o in LEVELS" :key="o.id" type="button" role="radio" class="ob-row" :aria-checked="form.experience === o.id" @click="pick('experience', o.id)">
                  <span>{{ $t(o.label) }}</span><small>{{ $t(o.years) }}</small>
                  <svg v-if="form.experience === o.id" class="ob-tick" viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg>
                </button>
              </div>
            </section>

            <!-- Field -->
            <section v-else-if="kind === 'field'" key="field" class="ob-step">
              <h2 :id="'ob-t-' + step">{{ $t('Which field are you in?') }}</h2>
              <div class="ob-grid" role="radiogroup">
                <button v-for="o in INDUSTRIES" :key="o.id" type="button" role="radio" class="ob-tile" :aria-checked="form.industry === o.id" @click="pick('industry', o.id)">{{ $t(o.label) }}</button>
              </div>
            </section>

            <!-- The job they want -->
            <section v-else-if="kind === 'job'" key="job" class="ob-step">
              <h2 :id="'ob-t-' + step">{{ $t(campus ? 'What job or internship are you after?' : 'What job are you looking for?') }}</h2>
              <p>{{ $t('We use it to tailor your CV, and to suggest jobs that fit.') }}</p>
              <div class="ob-group">
                <input ref="roleIn" v-model="form.targetRole" class="ob-in" maxlength="80" :placeholder="$t('Job title, e.g. {role}', { role: $t(ideas[0]) })" :aria-label="$t('The job you want')" @keydown.enter="go(step + 1)" />
                <input v-model="form.targetLocation" class="ob-in" maxlength="80" :placeholder="$t('Where, e.g. {place}', { place: city || 'Paris' })" :aria-label="$t('Where')" @keydown.enter="go(step + 1)" />
              </div>
              <div class="ob-ideas">
                <button v-for="r in ideas" :key="r" type="button" class="ob-idea" :class="{ on: form.targetRole === $t(r) }" @click="form.targetRole = $t(r)">{{ $t(r) }}</button>
              </div>
              <button type="button" class="ob-cta" @click="go(step + 1)">{{ $t(form.targetRole.trim() ? 'Continue' : 'Not sure yet') }}</button>
            </section>

            <!-- How they heard about us -->
            <section v-else-if="kind === 'heard'" key="heard" class="ob-step">
              <h2 :id="'ob-t-' + step">{{ $t('How did you hear about us?') }}</h2>
              <p>{{ $t('It helps us reach more people like you.') }}</p>
              <div class="ob-list" role="radiogroup">
                <button v-for="o in HEARD_FROM" :key="o.id" type="button" role="radio" class="ob-row" :aria-checked="form.heardFrom === o.id" @click="pick('heardFrom', o.id)">
                  <span>{{ $t(o.label) }}</span><svg v-if="form.heardFrom === o.id" class="ob-tick" viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg>
                </button>
              </div>
            </section>

            <!-- All set -->
            <section v-else key="done" class="ob-step ob-hello">
              <div class="ob-done" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7"/></svg></div>
              <h2 :id="'ob-t-' + step">{{ $t('You’re all set') }}</h2>
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
import { ref, computed, nextTick, inject } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { t } from '../../i18n/index.js'
import BrandLogo from '../BrandLogo.vue'
import { INDUSTRIES, GOALS, LEVELS, HEARD_FROM, ROLE_IDEAS } from '../../composables/profileOptions.js'

const auth = useAuthStore()
const emit = defineEmits(['done'])
// The screens, in order (both ways have the same number)
const campus = !!auth.user?.campus
const FLOW = campus ? ['hello', 'school', 'year', 'goal', 'field', 'job', 'done'] : ['hello', 'goal', 'stage', 'field', 'job', 'heard', 'done']
const LAST = FLOW.length - 1
const kind = computed(() => FLOW[step.value])
const at = (k) => FLOW.indexOf(k)
const SCHOOLS = [{ id: 'hei', label: 'JUNIA HEI', sub: 'Engineering' }, { id: 'isen', label: 'JUNIA ISEN', sub: 'Digital and electronics' },
  { id: 'isa', label: 'JUNIA ISA', sub: 'Agriculture, food and environment' }, { id: 'other', label: 'Another programme' }]
const YEARS = [{ id: 'y1', label: '1st year' }, { id: 'y2', label: '2nd year' }, { id: 'y3', label: '3rd year' }, { id: 'y4', label: '4th year' },
  { id: 'y5', label: '5th year' }, { id: 'phd', label: 'PhD' }, { id: 'other', label: 'Other' }]
const CAMPUS_PERKS = ['Every CV as a clean PDF, emailed and downloadable', 'A cover letter and interview prep for each job', '100 AI requests a day']
const goals = campus ? GOALS.filter(g => ['internship', 'grad', 'update'].includes(g.id)) : GOALS
const resendVerification = inject('resendVerification', null)
const resent = ref(false)
async function resend() { await resendVerification?.(); resent.value = true }

const step = ref(0)
const dir = ref(1)
const saving = ref(false)
const roleIn = ref(null)
const u = auth.user || {}
const form = ref({ goal: u.goal || '', experience: u.experience || '', industry: u.industry || '', targetRole: u.targetRole || '', targetLocation: u.targetLocation || '', heardFrom: '', school: u.school || '', studyYear: u.studyYear || '' })
const firstName = computed(() => (auth.user?.name || '').trim().split(/\s+/)[0] || '')
const ideas = computed(() => ROLE_IDEAS[form.value.industry] || ROLE_IDEAS.other)
// The city from the device's time zone, only as an example in the "Where" field
const city = (() => { try { const z = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; return z.includes('/') ? z.split('/').pop().replace(/_/g, ' ') : '' } catch { return '' } })()

function go(n) {
  dir.value = n > step.value ? 1 : -1
  step.value = Math.max(0, Math.min(LAST, n))
  if (kind.value === 'job') nextTick(() => setTimeout(() => roleIn.value?.focus(), 350))
}
// Tap an answer: it's ticked, and the next question follows
function pick(key, id) {
  form.value[key] = id
  setTimeout(() => go(step.value + 1), 260)
}

const label = (list, id) => t(list.find(o => o.id === id)?.label || '')
const summary = computed(() => [
  ...(campus ? [{ step: at('school'), label: 'School', value: label(SCHOOLS, form.value.school) || t('Not set') },
    { step: at('year'), label: 'Year', value: label(YEARS, form.value.studyYear) || t('Not set') }] : []),
  { step: at('goal'), label: 'Aiming for', value: label(GOALS, form.value.goal) || t('Not set') },
  ...(campus ? [] : [{ step: at('stage'), label: 'Career stage', value: label(LEVELS, form.value.experience) || t('Not set') }]),
  { step: at('field'), label: 'Field', value: label(INDUSTRIES, form.value.industry) || t('Not set') },
  { step: at('job'), label: 'The job you want', value: [form.value.targetRole, form.value.targetLocation].filter(Boolean).join(' · ') || t('Not set') },
])

// Saves what they answered (nothing is made up when they skip) and closes; the tour follows unless they said no
// (it tells the app first: saving marks the account onboarded, which closes this window, and a closed window can't tell anyone)
async function finish(tour) {
  saving.value = true
  emit('done', { tour })
  // JUNIA students are students, and we know where they heard of us
  const answers = campus ? { ...form.value, experience: form.value.experience || 'student', heardFrom: 'school' } : { ...form.value }
  await auth.completeOnboarding(answers).catch(() => {})
  saving.value = false
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
/* JUNIA students' welcome */
.ob-badge{display:inline-flex;align-items:center;height:28px;padding:0 12px;border-radius:99px;background:color-mix(in srgb,var(--c-accent) 12%,transparent);color:var(--c-accent);font-size:13px;font-weight:600;margin-top:4px}
.ob-campus h2{margin-top:10px}
.ob-perks{text-align:left;margin-top:20px}
.ob-perks .ob-row{cursor:default;font-size:15px;gap:12px}
.ob-perks .ob-row:hover{background:none}
.ob-confirm{font-size:14px!important;color:var(--c-text2)!important;margin-top:16px!important}
.ob-inline{margin:0 0 0 4px;padding:0;font-size:14px;line-height:inherit;vertical-align:baseline}

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
