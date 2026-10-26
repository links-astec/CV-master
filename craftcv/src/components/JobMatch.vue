<template>
  <div class="jm">
    <div class="jm-intro">
      <h3>{{ $t('Match your CV to a job') }}</h3>
      <p>{{ $t('Paste the job advert. AI rewords your CV in the job’s language, then scores how well an applicant tracking system (ATS) would rank you. Nothing changes without your OK.') }}</p>
    </div>

    <!-- 1 · The job -->
    <section class="jm-step" :class="stateOf(1)">
      <div class="jm-step-hd">
        <span class="jm-num"><svg v-if="hasJob" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><template v-else>1</template></span>
        <div class="jm-step-ttl">{{ $t('The job you’re applying for') }}</div>
        <button v-if="hasJob && !editingJob" class="jm-link" @click="editJob">{{ $t('Change') }}</button>
      </div>

      <div v-if="hasJob && !editingJob" class="jm-job">
        <div v-if="store.data.jobTarget?.title" class="jm-target">
          {{ $t('Target role') }}: <strong>{{ store.data.jobTarget.title }}</strong><template v-if="store.data.jobTarget.company"> · {{ store.data.jobTarget.company }}</template>
        </div>
        <div class="jm-job-txt">{{ jobPreview }}</div>
        <div class="jm-job-note">{{ $t('Every AI suggestion in your CV uses this job offer.') }}</div>
      </div>

      <!-- Is this role a good fit for the person on the CV? -->
      <div v-if="hasJob && !editingJob && fitLoading" class="jm-fit loading">
        <div class="thinking-dots"><span></span><span></span><span></span></div>{{ $t('Checking whether this role is a good fit…') }}
      </div>
      <div v-else-if="hasJob && !editingJob && fit && !fit.dismissed" class="jm-fit" :class="fit.fit">
        <div class="jm-fit-hd">
          <span class="jm-fit-badge">{{ $t(FIT_LABEL[fit.fit]) }}</span>
          <span class="jm-fit-ttl">{{ fit.headline }}</span>
        </div>
        <!-- What already matches first, then what would strengthen the application -->
        <template v-if="fit.strengths?.length">
          <div class="jm-fit-sub">{{ $t('What already matches') }}</div>
          <ul class="jm-fit-list good"><li v-for="(r, i) in fit.strengths" :key="'s' + i">{{ r }}</li></ul>
        </template>
        <template v-if="fit.reasons?.length">
          <div class="jm-fit-sub">{{ $t('To strengthen your application') }}</div>
          <ul class="jm-fit-list"><li v-for="(r, i) in fit.reasons" :key="i">{{ r }}</li></ul>
        </template>
        <p v-if="fit.advice" class="jm-fit-advice">💡 {{ fit.advice }}</p>
        <p v-if="fit.fit !== 'good'" class="jm-fit-note">{{ $t('Most people apply to roles they don’t match 100%. Tailor your CV below to show your best fit.') }}</p>
        <div class="jm-fit-acts">
          <button class="btn-ghost btn-sm" :disabled="fitLoading" @click="checkFit(true)">{{ $t('Check again') }}</button>
          <button class="btn-ghost btn-sm" @click="fit.dismissed = true">{{ $t('Hide') }}</button>
        </div>
      </div>
      <div v-else-if="hasJob && !editingJob && fitError" class="jm-hint warn">{{ $t(fitError) }}</div>
      <!-- The job is saved, but there's nothing on the CV to compare it with yet -->
      <div v-else-if="hasJob && !editingJob && !cvReady" class="jm-empty">
        <b>{{ $t('Job saved. Your CV is still empty.') }}</b>
        <span>{{ $t('Add your experience, skills or education, or tell your story, and we’ll show how well you match this job and tailor your CV to it.') }}</span>
      </div>
      <!-- The job box: only while there's no job yet, or while changing it -->
      <template v-if="!hasJob || editingJob">
        <textarea ref="jobRef" v-model="draft" class="f-ta" rows="7"
          :placeholder="$t('Paste the full job description. Title, responsibilities and requirements…')"></textarea>
        <div class="jm-file"><OfferFileButton @text="v => { draft = v }" /></div>
        <div v-if="draftTooShort" class="jm-hint warn">{{ $t('Paste the full description. A few sentences at least.') }}</div>
        <div class="jm-row">
          <button class="btn-primary accent" :disabled="draft.trim().length < MIN_CHARS" @click="saveJob">{{ $t('Use this job') }}</button>
          <button v-if="hasJob" class="btn-ghost" @click="editingJob = false">{{ $t('Cancel') }}</button>
          <button v-if="hasJob" class="btn-ghost jm-remove" @click="removeJob">{{ $t('Remove job') }}</button>
        </div>
        <div v-if="!hasJob" class="jm-hint">{{ $t('No specific job yet? Skip this. The checklist below still works.') }}</div>
      </template>
    </section>

    <!-- 2 · Tailor -->
    <section class="jm-step" :class="stateOf(2)">
      <div class="jm-step-hd">
        <span class="jm-num"><svg v-if="tailorDone" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><template v-else>2</template></span>
        <div class="jm-step-ttl">{{ $t('Tailor your CV with AI') }}</div>
        <span v-if="store.data.jobTailored === 'skipped'" class="jm-tag">{{ $t('Skipped') }}</span>
      </div>
      <template v-if="hasJob && !editingJob">
        <p v-if="!tailorDone" class="jm-txt">{{ $t('AI rephrases your summary, experience and skills using the job’s keywords. It never invents experience. You tick the changes you want.') }}</p>
        <StepTailor embedded @applied="onApplied" />
        <button v-if="!tailorDone" class="btn-ghost jm-skip" @click="store.data.jobTailored = 'skipped'">{{ $t('Skip and keep my wording') }}</button>
      </template>
    </section>

    <!-- 3 · ATS score -->
    <section class="jm-step" :class="stateOf(3)">
      <div class="jm-step-hd">
        <span class="jm-num"><svg v-if="score != null" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><template v-else>3</template></span>
        <div class="jm-step-ttl">{{ $t('Your ATS score') }}</div>
        <span v-if="score != null" class="jm-tag" :class="score >= 70 ? 'good' : 'mid'">{{ $t('{n}% match', { n: score }) }}</span>
      </div>
      <template v-if="hasJob && !editingJob && tailorDone">
        <p v-if="score == null" class="jm-txt">{{ $t('See how well your CV matches the job’s keywords and requirements.') }}</p>
        <p v-if="prevScore != null && score != null && prevScore !== score" class="jm-delta">
          {{ prevScore }}% → <strong>{{ score }}%</strong> {{ $t('after your changes') }}
        </p>
        <!-- Low score: let the AI work the missing keywords in, without growing the CV -->
        <div v-if="score != null && score < LOW_SCORE && atsResult" class="jm-boost">
          <div class="jm-boost-t">{{ $t(score < 50 ? 'This score is unlikely to get past the screening' : 'This score may not get you shortlisted') }}</div>
          <p>{{ $t('AI can work the missing keywords into what you’ve already written. Without making your CV longer. You review every change, and anything you might not have is only suggested.') }}</p>
          <StepTailor embedded :ats="atsResult" @applied="onBoosted" />
        </div>
        <AtsScorer ref="atsRef" embedded @scored="onScored" />
      </template>
    </section>

    <!-- Job Hunt Pass perks: cover letter and interview prep for this job -->
    <ApplicationKit v-if="hasJob && !editingJob" />

    <!-- Checklist -->
    <section class="jm-check">
      <div class="jm-check-hd">{{ $t('Before you export') }}</div>
      <StepReview />
    </section>

    <div class="jm-cta">
      <div>
        <div class="jm-cta-ttl">{{ $t('Happy with it?') }}</div>
        <div class="jm-cta-sub">{{ $t('Get the clean PDF, emailed and downloadable.') }}</div>
      </div>
      <button class="btn-primary accent" @click="$emit('pay')">{{ $t('Export PDF') }}</button>
    </div>
  </div>
</template>

<script>
const fitInFlight = new Set()   // shared by every Job match panel
</script>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useCvStore, hasDraftableContent } from '../stores/cv.js'
import StepTailor from './wizard/StepTailor.vue'
import OfferFileButton from './OfferFileButton.vue'
import StepReview from './wizard/StepReview.vue'
import AtsScorer from './AtsScorer.vue'
import ApplicationKit from './ApplicationKit.vue'
import { lang } from '../i18n/index.js'

defineEmits(['pay', 'next'])
const store = useCvStore()
const MIN_CHARS = 40 // same minimum the /api/ai/tailor endpoint enforces

const hasJob     = computed(() => (store.data.jobOffer || '').trim().length >= MIN_CHARS)
const editingJob = ref(false)
const draft      = ref('')
const jobRef     = ref(null)
const draftTooShort = computed(() => { const n = draft.value.trim().length; return n > 0 && n < MIN_CHARS })

// Saved on the CV so the steps pick up where the user left off
const tailorDone = computed(() => !!store.data.jobTailored)
const score     = ref(null)
const prevScore = ref(null)
const atsRef    = ref(null)
// Below this the CV is unlikely to be shortlisted, so the AI offers to improve it
const LOW_SCORE = 70
const atsResult = ref(null)   // { score, missing, gaps } from the last check

const jobPreview = computed(() => {
  const t = (store.data.jobOffer || '').trim().replace(/\s+\n/g, '\n')
  return t.length > 220 ? t.slice(0, 220).trimEnd() + '…' : t
})

// Which step is waiting on the user: 1 job → 2 tailor → 3 score → done
const current = computed(() => !hasJob.value || editingJob.value ? 1 : !tailorDone.value ? 2 : score.value == null ? 3 : 4)
function stateOf(n) {
  return { active: current.value === n, done: current.value > n, locked: current.value < n }
}

function editJob() {
  draft.value = store.data.jobOffer || ''
  editingJob.value = true
  nextTick(() => jobRef.value?.focus())
}
function saveJob() {
  const changed = draft.value.trim() !== (store.data.jobOffer || '').trim()
  store.data.jobOffer = draft.value.trim()
  editingJob.value = false
  if (changed) resetProgress()
}
function removeJob() {
  store.data.jobOffer = ''
  draft.value = ''
  editingJob.value = false
  resetProgress()
}
function resetProgress() {
  store.data.jobTailored = ''
  store.data.jobTarget = null
  score.value = prevScore.value = null
  atsResult.value = null
}

// After tailoring, re-score straight away so the user sees the effect
function onApplied(n) {
  store.data.jobTailored = n ? 'applied' : ''
  if (n && score.value != null) {
    prevScore.value = score.value
    nextTick(() => atsRef.value?.runScore())
  }
}
function onScored(s, r) {
  score.value = s
  atsResult.value = r ? { score: s, missing: r.missing || [], gaps: r.gaps || [] } : null
}
// After the AI improvement is applied (or undone), check the score again
function onBoosted(n) {
  if (score.value == null) return
  prevScore.value = score.value
  nextTick(() => atsRef.value?.runScore())
}

// ── Fit check ─────────────────────────────────────────────────────────────────
// Runs once per job offer (and per person the CV is for) as soon as the CV has some content
// Encouraging labels: a weaker match is "a reach", never "not a good fit"
const FIT_LABEL = { good: 'Strong match', stretch: 'Worth a go', poor: 'A reach' }
const fit = computed(() => (store.data.jobFit && store.data.jobFit.key === fitKey()) ? store.data.jobFit : null)
const fitLoading = ref(false)
const fitError = ref('')
function fitKey() {
  // "v2": results from the older, harsher check are checked again
  const s = `v2|${store.data.jobOffer || ''}|${store.data.cvFor || ''}|${store.data.fn || ''} ${store.data.ln || ''}`
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return String(h)
}
const cvReady = computed(() => enoughCv())
const enoughCv = () => hasDraftableContent(store.data) &&
  ((store.data.experiences || []).some(e => e.title || e.desc) || (store.data.skills || []).length >= 3 || (store.data.education || []).some(e => e.degree))
async function checkFit(force = false) {
  if (!hasJob.value || fitLoading.value || !enoughCv() || (fit.value && !force)) return
  // The wizard and the editor can both show this panel. Only one check per job at a time
  const key = fitKey()
  if (fitInFlight.has(key)) return
  fitInFlight.add(key)
  fitLoading.value = true; fitError.value = ''
  try {
    const { photo, ...cv } = JSON.parse(JSON.stringify(store.data))
    const r = await fetch((import.meta.env.VITE_API_URL || '') + '/api/ai/fit', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv, jobOffer: store.data.jobOffer, uiLang: lang.value }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw Object.assign(new Error(j.error || 'AI is unavailable right now. Please try again in a moment.'), { status: r.status })
    store.data.jobFit = { key: fitKey(), fit: j.fit, headline: j.headline, strengths: j.strengths || [], reasons: j.reasons, advice: j.advice, dismissed: false }
    if (j.job?.title) store.data.jobTarget = { title: j.job.title, company: j.job.company || '' }
  } catch (e) {
    fitError.value = e.status === 429 ? '' : e.message   // the AI-limit pop-up explains a 429
  }
  fitInFlight.delete(key)
  fitLoading.value = false
}
watch(() => [store.data.jobOffer, editingJob.value], () => { if (!editingJob.value) checkFit() })
// The CV was empty when the job was added: check the match once it has some content
watch(cvReady, (ok) => { if (ok && !editingJob.value) checkFit() })

onMounted(() => { if (!hasJob.value) draft.value = store.data.jobOffer || ''; checkFit() })
</script>

<style scoped>
.jm{display:flex;flex-direction:column;gap:12px}
.jm-intro h3{font-size:17px;font-weight:700;color:var(--c-text);letter-spacing:-.01em;margin-bottom:4px}
.jm-intro p{font-size:13px;color:var(--c-text2);line-height:1.55;margin-bottom:4px}

.jm-step{border:1px solid var(--hair);border-radius:12px;background:var(--c-surface);padding:14px 16px;display:flex;flex-direction:column;gap:10px;transition:border-color .15s,box-shadow .15s}
.jm-step.active{border-color:var(--c-accent);box-shadow:0 0 0 3px var(--c-accent-lt)}
.jm-step.locked{background:transparent;border-style:dashed}
.jm-step.locked .jm-step-ttl{color:var(--c-text3)}
.jm-step-hd{display:flex;align-items:center;gap:10px}
.jm-num{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;background:var(--c-surface2);color:var(--c-text3);border:1px solid var(--hair)}
.jm-step.active .jm-num{background:var(--c-accent);color:#fff;border-color:var(--c-accent)}
.jm-step.done .jm-num{background:var(--c-green);border-color:var(--c-green)}
.jm-num svg{width:13px;height:13px;fill:none;stroke:#fff;stroke-width:3}
.jm-step-ttl{flex:1;font-size:14px;font-weight:600;color:var(--c-text)}
.jm-link{background:none;border:none;color:var(--c-accent);font-size:12.5px;font-weight:600;padding:0}
.jm-tag{font-size:11.5px;font-weight:600;padding:2px 9px;border-radius:99px;background:var(--c-surface2);color:var(--c-text3)}
.jm-tag.good{background:var(--c-green-lt);color:var(--c-green)}
.jm-tag.mid{background:var(--c-amber-lt);color:var(--c-amber)}

.jm-job{background:var(--c-bg);border-radius:8px;padding:10px 12px}
.jm-target{font-size:13px;color:var(--c-text);margin-bottom:6px}
.jm-fit{margin-top:12px;border:1px solid var(--hair);border-radius:10px;padding:12px 14px;background:var(--c-surface);font-size:13px;line-height:1.5}
.jm-fit.loading{display:flex;align-items:center;gap:10px;color:var(--c-text2)}
.jm-fit.good{border-color:color-mix(in srgb,var(--c-green) 40%,transparent);background:color-mix(in srgb,var(--c-green) 6%,var(--c-surface))}
.jm-fit.stretch{border-color:color-mix(in srgb,var(--c-amber) 45%,transparent);background:color-mix(in srgb,var(--c-amber) 7%,var(--c-surface))}
/* "A reach" is shown in the brand colour, not red: it is a nudge, not a warning */
.jm-fit.poor{border-color:color-mix(in srgb,var(--c-accent) 35%,transparent);background:color-mix(in srgb,var(--c-accent) 6%,var(--c-surface))}
.jm-fit-sub{margin-top:10px;font-size:12.5px;font-weight:650;color:var(--c-text)}
.jm-fit-list.good{list-style:none;margin-left:0}
.jm-fit-list.good li{position:relative;padding-left:20px}
.jm-fit-list.good li::before{content:'✓';position:absolute;left:2px;color:var(--c-green);font-weight:700}
.jm-fit-hd{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px}
.jm-fit-badge{font-size:13px;font-weight:650;letter-spacing:-.005em}
.jm-fit.good .jm-fit-badge{color:var(--c-green)}.jm-fit.stretch .jm-fit-badge{color:var(--c-amber)}.jm-fit.poor .jm-fit-badge{color:var(--c-accent)}
.jm-fit-ttl{font-weight:600;color:var(--c-text)}
.jm-fit-list{margin:8px 0 0 18px;color:var(--c-text2)}
.jm-fit-list li{margin-bottom:3px}
.jm-fit-advice{margin-top:8px;color:var(--c-text)}
.jm-fit-note{margin-top:6px;font-size:12px;color:var(--c-text3)}
.jm-fit-acts{display:flex;gap:6px;margin-top:6px;margin-left:-8px}
.jm-job-note{font-size:11.5px;color:var(--c-text3);margin-top:6px}
.jm-job-txt{font-size:12.5px;color:var(--c-text2);line-height:1.5;white-space:pre-line;overflow-wrap:anywhere;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.jm-txt{font-size:12.5px;color:var(--c-text2);line-height:1.55}
.jm-file{margin-top:8px}
.jm-hint{font-size:12px;color:var(--c-text3)}
.jm-empty{margin-top:12px;display:flex;flex-direction:column;gap:4px;padding:12px 14px;border-radius:14px;background:var(--c-accent-lt);font-size:13px;line-height:1.5;color:var(--c-text2)}
.jm-empty b{color:var(--c-text);font-weight:650}
.jm-hint.warn{color:var(--c-amber)}
.jm-row{display:flex;gap:8px;flex-wrap:wrap}
.jm-remove{margin-left:auto;color:var(--c-rose)}
.jm-skip{align-self:flex-start}
.jm-delta{font-size:13px;color:var(--c-text2)}
.jm-delta strong{color:var(--c-green)}
.jm-boost{border-radius:10px;background:var(--c-amber-lt);padding:12px 14px;display:flex;flex-direction:column;gap:8px}
.jm-boost-t{font-size:13.5px;font-weight:700;color:var(--c-text)}
.jm-boost p{font-size:12.5px;color:var(--c-text2);line-height:1.5}

/* The embedded Tailor/ATS blocks sit inside the step card */
.jm-step :deep(.step-wrap){margin:0}
.jm-step :deep(.btn-ai){margin:0}

.jm-check{margin-top:10px;display:flex;flex-direction:column;gap:10px}
.jm-check-hd{font-size:13px;font-weight:650;letter-spacing:-.005em;color:var(--c-text3)}

.jm-cta{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:8px;padding:14px 16px;border-radius:12px;background:var(--c-accent-lt)}
.jm-cta-ttl{font-size:14px;font-weight:700;color:var(--c-text)}
.jm-cta-sub{font-size:12.5px;color:var(--c-text2)}
</style>
