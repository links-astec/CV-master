<template>
  <div class="jm">
    <div class="jm-intro">
      <h3>Match your CV to a job</h3>
      <p>Paste the job advert. AI rewords your CV in the job's language, then scores how well
        an applicant tracking system (ATS) would rank you. Nothing changes without your OK.</p>
    </div>

    <!-- 1 · The job -->
    <section class="jm-step" :class="stateOf(1)">
      <div class="jm-step-hd">
        <span class="jm-num"><svg v-if="hasJob" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><template v-else>1</template></span>
        <div class="jm-step-ttl">The job you're applying for</div>
        <button v-if="hasJob && !editingJob" class="jm-link" @click="editJob">Change</button>
      </div>

      <div v-if="hasJob && !editingJob" class="jm-job">
        <div class="jm-job-txt">{{ jobPreview }}</div>
      </div>
      <template v-else>
        <textarea ref="jobRef" v-model="draft" class="f-ta" rows="7"
          placeholder="Paste the full job description — title, responsibilities and requirements…"></textarea>
        <div v-if="draftTooShort" class="jm-hint warn">Paste the full description — a few sentences at least.</div>
        <div class="jm-row">
          <button class="btn-primary accent" :disabled="draft.trim().length < MIN_CHARS" @click="saveJob">Use this job</button>
          <button v-if="hasJob" class="btn-ghost" @click="editingJob = false">Cancel</button>
          <button v-if="hasJob" class="btn-ghost jm-remove" @click="removeJob">Remove job</button>
        </div>
        <div v-if="!hasJob" class="jm-hint">No specific job yet? Skip this — the checklist below still works.</div>
      </template>
    </section>

    <!-- 2 · Tailor -->
    <section class="jm-step" :class="stateOf(2)">
      <div class="jm-step-hd">
        <span class="jm-num"><svg v-if="tailorDone" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><template v-else>2</template></span>
        <div class="jm-step-ttl">Tailor your CV with AI</div>
        <span v-if="store.data.jobTailored === 'skipped'" class="jm-tag">Skipped</span>
      </div>
      <template v-if="hasJob && !editingJob">
        <p v-if="!tailorDone" class="jm-txt">AI rephrases your summary, experience and skills using the job's keywords.
          It never invents experience — you tick the changes you want.</p>
        <StepTailor embedded @applied="onApplied" />
        <button v-if="!tailorDone" class="btn-ghost jm-skip" @click="store.data.jobTailored = 'skipped'">Skip — keep my wording</button>
      </template>
    </section>

    <!-- 3 · ATS score -->
    <section class="jm-step" :class="stateOf(3)">
      <div class="jm-step-hd">
        <span class="jm-num"><svg v-if="score != null" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><template v-else>3</template></span>
        <div class="jm-step-ttl">Your ATS score</div>
        <span v-if="score != null" class="jm-tag" :class="score >= 70 ? 'good' : 'mid'">{{ score }}% match</span>
      </div>
      <template v-if="hasJob && !editingJob && tailorDone">
        <p v-if="score == null" class="jm-txt">See how well your CV matches the job's keywords and requirements.</p>
        <p v-if="prevScore != null && score != null && prevScore !== score" class="jm-delta">
          {{ prevScore }}% → <strong>{{ score }}%</strong> after your changes
        </p>
        <!-- Low score: let the AI work the missing keywords in, without growing the CV -->
        <div v-if="score != null && score < LOW_SCORE && atsResult" class="jm-boost">
          <div class="jm-boost-t">{{ score < 50 ? 'This score is unlikely to get past the screening' : 'This score may not get you shortlisted' }}</div>
          <p>AI can work the missing keywords into what you’ve already written — without making your CV longer. You review every change, and anything you might not have is only suggested.</p>
          <StepTailor embedded :ats="atsResult" @applied="onBoosted" />
        </div>
        <AtsScorer ref="atsRef" embedded @scored="onScored" />
      </template>
    </section>

    <!-- Checklist -->
    <section class="jm-check">
      <div class="jm-check-hd">Before you export</div>
      <StepReview />
    </section>

    <div class="jm-cta">
      <div>
        <div class="jm-cta-ttl">Happy with it?</div>
        <div class="jm-cta-sub">Get the clean PDF — emailed and downloadable.</div>
      </div>
      <button class="btn-primary accent" @click="$emit('pay')">Export PDF</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useCvStore } from '../stores/cv.js'
import StepTailor from './wizard/StepTailor.vue'
import StepReview from './wizard/StepReview.vue'
import AtsScorer from './AtsScorer.vue'

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

onMounted(() => { if (!hasJob.value) draft.value = store.data.jobOffer || '' })
</script>

<style scoped>
.jm{display:flex;flex-direction:column;gap:12px}
.jm-intro h3{font-size:17px;font-weight:700;color:var(--c-text);letter-spacing:-.01em;margin-bottom:4px}
.jm-intro p{font-size:13px;color:var(--c-text2);line-height:1.55;margin-bottom:4px}

.jm-step{border:1px solid var(--c-border);border-radius:12px;background:var(--c-surface);padding:14px 16px;display:flex;flex-direction:column;gap:10px;transition:border-color .15s,box-shadow .15s}
.jm-step.active{border-color:var(--c-accent);box-shadow:0 0 0 3px var(--c-accent-lt)}
.jm-step.locked{background:transparent;border-style:dashed}
.jm-step.locked .jm-step-ttl{color:var(--c-text3)}
.jm-step-hd{display:flex;align-items:center;gap:10px}
.jm-num{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;background:var(--c-surface2);color:var(--c-text3);border:1px solid var(--c-border)}
.jm-step.active .jm-num{background:var(--c-accent);color:#fff;border-color:var(--c-accent)}
.jm-step.done .jm-num{background:var(--c-green);border-color:var(--c-green)}
.jm-num svg{width:13px;height:13px;fill:none;stroke:#fff;stroke-width:3}
.jm-step-ttl{flex:1;font-size:14px;font-weight:600;color:var(--c-text)}
.jm-link{background:none;border:none;color:var(--c-accent);font-size:12.5px;font-weight:600;padding:0}
.jm-tag{font-size:11.5px;font-weight:600;padding:2px 9px;border-radius:99px;background:var(--c-surface2);color:var(--c-text3)}
.jm-tag.good{background:var(--c-green-lt);color:var(--c-green)}
.jm-tag.mid{background:var(--c-amber-lt);color:var(--c-amber)}

.jm-job{background:var(--c-bg);border-radius:8px;padding:10px 12px}
.jm-job-txt{font-size:12.5px;color:var(--c-text2);line-height:1.5;white-space:pre-line;overflow-wrap:anywhere;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.jm-txt{font-size:12.5px;color:var(--c-text2);line-height:1.55}
.jm-hint{font-size:12px;color:var(--c-text3)}
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
.jm-check-hd{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-text3)}

.jm-cta{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:8px;padding:14px 16px;border-radius:12px;background:var(--c-accent-lt)}
.jm-cta-ttl{font-size:14px;font-weight:700;color:var(--c-text)}
.jm-cta-sub{font-size:12.5px;color:var(--c-text2)}
</style>
