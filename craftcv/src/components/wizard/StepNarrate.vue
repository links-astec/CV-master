<template>
  <div class="step-wrap">
    <h3 class="step-title">Tell your story</h3>
    <p class="step-sub">Speak or type your career story — AI builds your whole CV from it.</p>

    <div v-if="!started">
      <!-- Mode toggle -->
      <div class="input-mode-toggle">
        <button :class="['mode-btn', inputMode==='type' && 'active']" @click="switchMode('type')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Type
        </button>
        <button :class="['mode-btn', inputMode==='speak' && 'active']" @click="switchMode('speak')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px;"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          Microphone
        </button>
      </div>

      <!-- TYPE mode -->
      <div v-if="inputMode === 'type'" class="f-grp">
        <textarea class="f-ta" v-model="story" rows="9"
          placeholder="e.g. I've been in product management for 8 years. I started at a startup in London where I built their first mobile app from scratch. Then I moved to a fintech where I led a team of 12 and grew the user base from 50K to 2M. I'm passionate about data-driven decisions..."
          style="line-height:1.7;"></textarea>
        <div class="f-hint">Be as detailed as you like — more context gives a better CV.</div>
      </div>

      <!-- SPEAK mode -->
      <div v-if="inputMode === 'speak'" class="speak-section">
        <!-- Not supported warning -->
        <div v-if="!micSupported || micError" class="mic-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ micError || 'Microphone not available. Use Chrome or Edge, ensure microphone access is allowed, then try again.' }}
        </div>

        <!-- Mic UI -->
        <div v-else class="mic-card">
          <button class="mic-btn" :class="{ recording: isRecording }" @click="toggleMic">
            <div class="mic-btn-inner">
              <svg v-if="!isRecording" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:32px;height:32px;"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" style="width:28px;height:28px;"><rect x="6" y="6" width="12" height="12" rx="3"/></svg>
            </div>
            <div v-if="isRecording" class="mic-ring"></div>
          </button>

          <div class="mic-label">
            <span v-if="!isRecording && !story" class="mic-idle">Tap to start recording</span>
            <span v-else-if="isRecording" class="mic-live">
              <span class="rec-dot"></span> Recording... tap to stop
            </span>
            <span v-else class="mic-done">Recording stopped — review below</span>
          </div>

          <!-- Live waveform while recording -->
          <div v-if="isRecording" class="mic-waves">
            <span v-for="n in 7" :key="n" :style="`animation-delay:${n*0.1}s`"></span>
          </div>
        </div>

        <!-- Live transcript -->
        <div v-if="story || interim" class="transcript-wrap">
          <div class="transcript-hd">
            Transcript
            <button class="transcript-clear" @click="clearTranscript">Clear</button>
          </div>
          <!-- While recording: show live text + italic interim -->
          <div v-if="isRecording" class="transcript-body">
            <span class="transcript-final">{{ story }}</span>
            <span class="transcript-interim" v-if="interim"> {{ interim }}</span>
          </div>
          <!-- After stopping: editable textarea -->
          <div v-else>
            <textarea class="f-ta" v-model="story" rows="5" style="margin-top:6px;line-height:1.65;" placeholder="Your recorded text appears here — edit freely before continuing..."></textarea>
          </div>
          <div class="f-hint" style="margin-top:6px;">
            {{ isRecording ? 'Recording in progress...' : 'Edit your transcript above if needed, then click Build My CV.' }}
          </div>
        </div>
      </div>

      <!-- Story couldn't be used -->
      <div v-if="rejected" class="nr-reject">
        <div class="nr-reject-ttl">We can't build a CV from that yet</div>
        <p>{{ rejected }}</p>
        <div class="nr-reject-actions">
          <button class="btn-secondary btn-sm" @click="retry">Try again</button>
          <button class="btn-ghost btn-sm" @click="$emit('next')">Fill it in step by step</button>
          <button class="btn-ghost btn-sm" @click="store.setMode('upload')">Import my CV instead</button>
        </div>
      </div>

      <!-- AI loading -->
      <div v-if="aiLoading && !showQs" class="thinking" style="margin-top:14px;">
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        <div class="thinking-txt">AI is reading your story…</div>
      </div>

      <div class="narrate-actions">
        <button class="btn-primary accent" @click="startNarrate"
          :disabled="!story.trim() || aiLoading" style="width:100%;justify-content:center;">
          <svg v-if="aiLoading" class="spin-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
          {{ aiLoading ? 'Reading your story…' : 'Build my CV from my story' }}
        </button>
        <button class="skip-link" @click="$emit('next')">Skip — fill in manually instead</button>
      </div>
    </div>

    <!-- Done state -->
    <div v-else>
      <div class="done-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:20px;height:20px;flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div style="font-weight:700;margin-bottom:3px;">CV built from your story</div>
          <div style="font-size:12px;">All sections pre-filled. Review and edit each one below.</div>
        </div>
      </div>
      <div class="story-preview">
        <div class="sp-lbl">Your story</div>
        <div class="sp-txt">{{ story.slice(0, 200) }}{{ story.length > 200 ? '...' : '' }}</div>
        <button class="sp-edit" @click="started=false">Edit story</button>
      </div>
      <button class="btn-primary accent" @click="$emit('next')" style="width:100%;justify-content:center;margin-top:12px;">
        Review Each Section →
      </button>
    </div>

    <!-- Follow-up questions -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showQs" class="nq-backdrop" @click.self="closeQs">
          <div class="nq" role="dialog" aria-labelledby="nq-title">
            <button class="icon-btn nq-x" @click="closeQs" aria-label="Close" :disabled="aiLoading">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="nq-step">Round {{ round }} of up to {{ maxRounds }}</div>
            <h3 id="nq-title">A few details will make your CV much stronger</h3>
            <p class="nq-sub">Answer what you can and skip anything you'd rather not. We only use what you tell us.</p>

            <div class="nq-list">
              <div v-for="(q, i) in questions" :key="round + '-' + i" class="nq-item">
                <label class="nq-q" :for="'nq-' + i">{{ q.q }}</label>
                <textarea :id="'nq-' + i" v-model="q.a" class="f-ta" rows="2" :placeholder="q.hint || 'Your answer'" :disabled="aiLoading"></textarea>
              </div>
            </div>

            <div v-if="qError" class="nq-err">{{ qError }}</div>
            <div class="nq-ft">
              <button class="btn-ghost" :disabled="aiLoading" @click="submitAnswers(true)">Build my CV now</button>
              <button class="btn-primary accent" :disabled="aiLoading || !anyAnswer" @click="submitAnswers(false)">
                <svg v-if="aiLoading" class="spin-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                {{ aiLoading ? 'Reading your answers…' : 'Continue' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted, inject } from 'vue'
import { useCvStore } from '../../stores/cv.js'
import { useAuthStore } from '../../stores/auth.js'

const store = useCvStore()
const showToast = inject('showToast', null)
const auth  = useAuthStore()
const emit  = defineEmits(['next', 'ai-thinking'])

const story       = ref('')
const interim     = ref('')
const inputMode   = ref('type')
const isRecording = ref(false)
const aiLoading   = ref(false)
const started     = ref(false)
const micSupported = ref(true)
const micError     = ref('')

let recognition   = null
let finalBuffer   = ''
let restartTimer  = null
let _stopping     = false

function switchMode(mode) {
  if (isRecording.value) stopMic()
  inputMode.value = mode
  if (mode === 'speak') checkMic()
}

function checkMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  micSupported.value = !!SR
}

async function toggleMic() {
  console.log('[MIC] Button clicked, isRecording:', isRecording.value)
  if (isRecording.value) stopMic()
  else await startMic()
}

async function startMic() {
  console.log('[MIC] toggleMic called, isRecording:', isRecording.value)

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  console.log('[MIC] SpeechRecognition available:', !!SR)
  if (!SR) {
    micSupported.value = false
    console.warn('[MIC] SpeechRecognition not supported in this browser')
    return
  }

  // Check/request mic permission
  if (navigator.permissions) {
    try {
      const perm = await navigator.permissions.query({ name: 'microphone' })
      console.log('[MIC] Permission state:', perm.state)
      if (perm.state === 'denied') {
        micSupported.value = false
        micError.value = 'Microphone access denied. Please allow it in browser settings and refresh.'
        return
      }
    } catch (e) {
      console.log('[MIC] Permissions API not available:', e.message)
    }
  }

  finalBuffer   = story.value ? story.value.trimEnd() + ' ' : ''
  interim.value = ''

  recognition = new SR()
  recognition.continuous      = true
  recognition.interimResults  = true
  recognition.maxAlternatives = 1
  recognition.lang            = store.data.lang === 'fr' ? 'fr-FR' : 'en-GB'
  console.log('[MIC] SpeechRecognition created, lang:', recognition.lang)

  recognition.onstart = () => {
    console.log('[MIC] onstart fired — recording active')
    isRecording.value = true
  }

  recognition.onresult = (e) => {
    if (_stopping) return  // prevent duplicate commit when stop() triggers a final result
    let interimText = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript
      if (e.results[i].isFinal) {
        finalBuffer += t.trim() + ' '
        interimText = ''
      } else {
        interimText += t
      }
    }
    story.value   = (finalBuffer + interimText).trimEnd()
    interim.value = interimText
  }

  recognition.onerror = (e) => {
    console.error('[MIC] Error:', e.error, e.message)
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      micSupported.value = false
      micError.value = 'Microphone access denied. Please allow microphone access in your browser settings.'
      stopMic()
    } else if (e.error === 'no-speech') {
      console.log('[MIC] No speech detected — restarting')
      if (isRecording.value) {
        clearTimeout(restartTimer)
        restartTimer = setTimeout(() => {
          if (isRecording.value) { stopMic(); startMic() }
        }, 300)
      }
    } else if (e.error === 'network') {
      console.warn('[MIC] Network error — retrying')
      if (isRecording.value) {
        clearTimeout(restartTimer)
        restartTimer = setTimeout(() => {
          if (isRecording.value) { stopMic(); startMic() }
        }, 1000)
      }
    }
  }

  recognition.onend = () => {
    console.log('[MIC] onend fired, isRecording:', isRecording.value)
    interim.value = ''
    if (isRecording.value) {
      clearTimeout(restartTimer)
      restartTimer = setTimeout(() => {
        if (isRecording.value && recognition) {
          console.log('[MIC] Auto-restarting after onend')
          try { recognition.start() } catch (e) { console.warn('[MIC] Restart failed:', e) }
        }
      }, 250)
    }
  }

  try {
    console.log('[MIC] Calling recognition.start()')
    recognition.start()
  } catch (e) {
    console.error('[MIC] recognition.start() threw:', e)
    micSupported.value = false
  }
}

function stopMic() {
  clearTimeout(restartTimer)
  isRecording.value = false
  _stopping = true
  // Manually commit any interim text not yet finalised by the browser
  if (interim.value.trim()) {
    finalBuffer += interim.value.trim() + ' '
    story.value = finalBuffer.trimEnd()
  }
  interim.value = ''
  try { recognition?.stop() } catch {}
  recognition = null
  // Reset guard after browser finalization events have fired
  setTimeout(() => { _stopping = false }, 600)
}

function clearTranscript() {
  story.value = ''
  interim.value = ''
  finalBuffer = ''
}

// ── Story → CV ───────────────────────────────────────────────────────────────
// The server either turns the story down (too thin / not a career story), asks
// follow-up questions (shown in a pop-up, a few rounds at most) or builds the CV.
const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path
const TOO_SHORT = 'That is too short for us to build a CV from. Tell us about your jobs, studies and what you did in them — a few sentences is enough to start.'
const rejected  = ref('')
const showQs    = ref(false)
const questions = ref([])   // [{ q, hint, a }]
const answers   = ref([])   // answered so far: [{ q, a }]
const round     = ref(0)
const maxRounds = ref(3)
const qError    = ref('')
const anyAnswer = computed(() => questions.value.some(q => q.a?.trim()))
const wordCount = (t) => (t.match(/[\p{L}\p{N}]+/gu) || []).length

async function askServer(force) {
  const u = auth.user
  const r = await fetch(apiUrl('/api/ai/story'), {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      story: story.value, answers: answers.value, round: round.value, force,
      lang: store.data.lang,
      context: { industry: u?.industry || '', goal: u?.goal || '', experience: u?.experience || '' },
    }),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || "We couldn't read your story just now — please try again.")
  return j
}

function handle(res) {
  if (res.verdict === 'unusable') {
    showQs.value   = false
    rejected.value = res.reason || TOO_SHORT
  } else if (res.verdict === 'needs_more') {
    questions.value = res.questions.map(q => ({ ...q, a: '' }))
    round.value     = res.round
    maxRounds.value = res.maxRounds || 3
    showQs.value    = true
  } else {
    store.applyExtracted(res.cv)
    showQs.value  = false
    started.value = true
  }
}

async function startNarrate() {
  if (!story.value.trim() || aiLoading.value) return
  if (isRecording.value) stopMic()
  rejected.value = ''
  // Obviously too short: say so straight away, no AI call
  if (wordCount(story.value) < 12) { rejected.value = TOO_SHORT; return }
  answers.value = []
  round.value   = 0
  await run(false)
}

// "Continue" sends this round's answers; "Build my CV now" builds with what we have
async function submitAnswers(force) {
  qError.value = ''
  for (const q of questions.value) answers.value.push({ q: q.q, a: q.a?.trim() || '' }) // '' = skipped
  questions.value.forEach(q => { q.a = '' })
  await run(force)
}

async function run(force) {
  aiLoading.value = true
  emit('ai-thinking', true)
  try { handle(await askServer(force)) }
  catch (e) {
    if (showQs.value) qError.value = e.message
    else showToast?.(e.message)
  }
  aiLoading.value = false
  emit('ai-thinking', false)
}

function closeQs() { if (!aiLoading.value) showQs.value = false }
function retry() {
  rejected.value = ''
  inputMode.value = 'type'
  nextTick(() => document.querySelector('.step-wrap textarea.f-ta')?.focus())
}

onUnmounted(() => stopMic())
</script>

<style scoped>
.step-title { font-family:inherit;letter-spacing:-.01em;font-size:20px;color:var(--c-text);margin-bottom:5px; }
.step-sub   { font-size:13px;color:var(--c-text2);margin-bottom:18px;line-height:1.5; }

.input-mode-toggle {
  display:flex;background:var(--c-bg);border:1px solid var(--c-border);
  border-radius:var(--radius);padding:3px;gap:3px;margin-bottom:16px;
}
.mode-btn {
  flex:1;display:flex;align-items:center;justify-content:center;gap:7px;
  padding:9px 12px;border-radius:var(--radius-sm);border:none;background:none;
  font-size:13px;font-weight:600;color:var(--c-text2);cursor:pointer;
  font-family:inherit;transition:all .18s;
}
.mode-btn.active { background:var(--c-surface);color:var(--c-accent);box-shadow:var(--shadow-xs); }
.mode-btn:hover:not(.active) { color:var(--c-text); }

/* Speak section */
.speak-section { display:flex;flex-direction:column;gap:14px; }
.mic-error {
  display:flex;align-items:flex-start;gap:10px;
  background:var(--c-rose-lt);border:1px solid #f5c0c8;
  color:var(--c-rose);font-size:12.5px;padding:12px 14px;
  border-radius:var(--radius);line-height:1.5;
}
.mic-card {
  display:flex;flex-direction:column;align-items:center;gap:14px;
  padding:28px 20px;background:var(--c-bg);
  border:2px dashed var(--c-border);border-radius:var(--radius-lg);
  transition:border-color .2s;
}
.mic-card:has(.recording) { border-color:var(--c-rose); }

/* Mic button */
.mic-btn {
  position:relative;width:76px;height:76px;border-radius:50%;border:none;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  background:var(--c-accent);transition:all .2s;
  box-shadow:0 6px 20px rgba(42,91,215,.35);
}
.mic-btn.recording { background:var(--c-rose);box-shadow:0 6px 20px rgba(248,81,73,.35); }
.mic-btn-inner { color:#fff;display:flex;align-items:center;justify-content:center;position:relative;z-index:1; }
.mic-ring {
  position:absolute;inset:-6px;border-radius:50%;
  border:3px solid var(--c-rose);opacity:.5;
  animation:ring-pulse 1.4s ease-out infinite;
}
@keyframes ring-pulse {
  0%   { transform:scale(1);opacity:.5; }
  100% { transform:scale(1.35);opacity:0; }
}

.mic-label { font-size:13px;color:var(--c-text2);text-align:center; }
.mic-idle  { color:var(--c-text3); }
.mic-live  { display:flex;align-items:center;gap:6px;color:var(--c-rose);font-weight:600; }
.mic-done  { color:var(--c-green);font-weight:600; }
.rec-dot   { width:8px;height:8px;border-radius:50%;background:var(--c-rose);animation:blink 1s step-end infinite; }
@keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }

/* Waveform */
.mic-waves { display:flex;align-items:flex-end;gap:3px;height:28px; }
.mic-waves span {
  width:5px;background:var(--c-rose);border-radius:3px;
  animation:wave 0.9s ease-in-out infinite;
}
.mic-waves span:nth-child(1){height:8px}
.mic-waves span:nth-child(2){height:16px;animation-delay:.1s}
.mic-waves span:nth-child(3){height:24px;animation-delay:.2s}
.mic-waves span:nth-child(4){height:28px;animation-delay:.3s}
.mic-waves span:nth-child(5){height:20px;animation-delay:.4s}
.mic-waves span:nth-child(6){height:12px;animation-delay:.5s}
.mic-waves span:nth-child(7){height:6px;animation-delay:.6s}
@keyframes wave { 0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)} }

/* Transcript */
.transcript-wrap {
  background:var(--c-bg);border:1px solid var(--c-border);
  border-radius:var(--radius);padding:12px 14px;
}
.transcript-hd {
  display:flex;align-items:center;justify-content:space-between;
  font-size:10px;font-weight:800;color:var(--c-text3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;
}
.transcript-clear { background:none;border:none;font-size:11.5px;color:var(--c-rose);font-weight:700;cursor:pointer;font-family:inherit; }
.transcript-body { font-size:12.5px;color:var(--c-text2);line-height:1.7;max-height:100px;overflow-y:auto; }
.transcript-final { color:var(--c-text); }
.transcript-interim { color:var(--c-text3);font-style:italic; }

/* Actions */
.narrate-actions { display:flex;flex-direction:column;gap:8px;margin-top:16px; }
.skip-link { background:none;border:none;font-size:12.5px;color:var(--c-text3);cursor:pointer;font-family:inherit;text-align:center;text-decoration:underline; }

/* Done state */
.done-box {
  display:flex;align-items:flex-start;gap:12px;
  background:var(--c-green-lt);border:1px solid #a0e0b8;
  color:var(--c-green);font-size:13px;padding:14px;border-radius:var(--radius);
  line-height:1.5;margin-bottom:14px;
}
.story-preview { background:var(--c-surface2);border:1px solid var(--c-border);border-radius:var(--radius);padding:14px;margin-bottom:4px; }
.sp-lbl { font-size:9.5px;font-weight:800;color:var(--c-text3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px; }
.sp-txt { font-size:12.5px;color:var(--c-text2);line-height:1.6;margin-bottom:8px; }
.sp-edit { background:none;border:none;font-size:11.5px;color:var(--c-accent);font-weight:700;cursor:pointer;font-family:inherit;text-decoration:underline; }
.spin-i { animation:spin .7s linear infinite;width:14px;height:14px; }

/* Story turned down */
.nr-reject { margin-top:14px;padding:14px 16px;border-radius:12px;background:var(--c-amber-lt);border:1px solid var(--c-border); }
.nr-reject-ttl { font-size:14px;font-weight:700;color:var(--c-text);margin-bottom:4px; }
.nr-reject p { font-size:13px;color:var(--c-text2);line-height:1.55;margin-bottom:10px; }
.nr-reject-actions { display:flex;flex-wrap:wrap;gap:6px; }

/* Follow-up questions pop-up */
.nq-backdrop { position:fixed;inset:0;z-index:9000;background:rgba(20,20,43,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px; }
.nq { position:relative;width:100%;max-width:560px;max-height:92dvh;overflow-y:auto;background:var(--c-surface);border-radius:18px;padding:26px 26px 20px;box-shadow:var(--shadow-xl);border:1px solid var(--c-border); }
.nq-x { position:absolute;top:14px;right:14px; }
.nq-step { font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c-accent);margin-bottom:8px; }
.nq h3 { font-size:19px;font-weight:700;letter-spacing:-.01em;color:var(--c-text);margin:0 28px 6px 0; }
.nq-sub { font-size:13px;color:var(--c-text2);line-height:1.55;margin-bottom:18px; }
.nq-list { display:flex;flex-direction:column;gap:14px; }
.nq-q { display:block;font-size:13.5px;font-weight:600;color:var(--c-text);line-height:1.45;margin-bottom:6px; }
.nq-item .f-ta { min-height:58px;resize:vertical; }
.nq-err { margin-top:12px;font-size:12.5px;color:var(--c-rose); }
.nq-ft { display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:20px;padding-top:14px;border-top:1px solid var(--c-border); }
@media (max-width:600px) {
  .nq-backdrop { padding:0;align-items:flex-end; }
  .nq { border-radius:18px 18px 0 0;max-width:100%;padding:22px 18px calc(18px + env(safe-area-inset-bottom)); }
}
@keyframes spin { to { transform:rotate(360deg); } }
</style>