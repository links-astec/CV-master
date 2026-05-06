<template>
  <div class="step-wrap">
    <h3 class="step-title">Tell your story</h3>
    <p class="step-sub">Speak or type your career story freely — AI will build your entire CV from it.</p>

    <div v-if="!started">
      <!-- Input mode toggle -->
      <div class="input-mode-toggle">
        <button :class="['mode-btn', inputMode==='type' && 'active']" @click="switchMode('type')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Type
        </button>
        <button :class="['mode-btn', inputMode==='speak' && 'active']" @click="switchMode('speak')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          Speak
        </button>
      </div>

      <!-- TYPE mode -->
      <div v-if="inputMode === 'type'" class="f-grp">
        <textarea class="f-ta" v-model="story" rows="8"
          placeholder="e.g. I've been in product management for 8 years. I started at a startup in London where I built their first mobile app from scratch. Then I moved to a fintech where I led a team of 12 and grew our user base from 50K to 2M..."
          style="line-height:1.65;"></textarea>
        <div class="f-hint">The more detail you give, the better your CV will be.</div>
      </div>

      <!-- SPEAK mode -->
      <div v-if="inputMode === 'speak'" class="speak-panel">
        <div class="mic-area" :class="{ recording: isRecording, 'has-transcript': !!story }">
          <button class="mic-btn" @click="toggleRecording" :class="{ active: isRecording }">
            <svg v-if="!isRecording" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          </button>
          <div class="mic-status">
            <span v-if="!isRecording && !story">Tap the mic and start talking</span>
            <span v-else-if="isRecording" class="recording-label">Listening... tap to stop</span>
            <span v-else class="done-label">Recording complete</span>
          </div>
          <div v-if="isRecording" class="mic-waves">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>

        <div v-if="!micSupported" class="mic-unsupported">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Microphone not supported in this browser. Use Chrome or Safari, or switch to Type mode.
        </div>

        <div v-if="story" class="transcript-box">
          <div class="transcript-lbl">
            Transcript
            <button class="transcript-clear" @click="story = ''">Clear</button>
          </div>
          <textarea class="f-ta" v-model="story" rows="5" style="line-height:1.65;margin-top:6px;"></textarea>
          <div class="f-hint">You can edit the transcript above before continuing.</div>
        </div>
      </div>

      <div v-if="aiLoading" class="thinking" style="margin-top:12px;">
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        <div class="thinking-txt">Groq is reading your story and building your CV...</div>
      </div>

      <div class="start-controls" style="margin-top:14px;">
        <button class="btn-primary accent" @click="startNarrate"
          :disabled="!story.trim() || aiLoading"
          style="width:100%;justify-content:center;">
          <svg v-if="aiLoading" class="spin-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
          {{ aiLoading ? 'Building your CV...' : 'Build My CV from Story' }}
        </button>
        <button class="skip-btn" @click="$emit('next')">Skip — fill in manually</button>
      </div>
    </div>

    <!-- Processed state -->
    <div v-else>
      <div class="success-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div style="font-weight:700;margin-bottom:3px;">CV built from your story</div>
          <div style="font-size:12px;">All sections have been pre-filled. Review and edit each one in the following steps.</div>
        </div>
      </div>
      <div class="story-preview">
        <div class="sp-lbl">Your story</div>
        <div class="sp-txt">{{ story.slice(0, 180) }}{{ story.length > 180 ? '...' : '' }}</div>
        <button class="sp-edit" @click="started = false">Edit story</button>
      </div>
      <button class="btn-primary accent" @click="$emit('next')" style="width:100%;justify-content:center;margin-top:10px;">
        Review Each Section →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store = useCvStore()
const emit  = defineEmits(['next', 'ai-thinking'])

const story       = ref('')
const inputMode   = ref('type')
const isRecording = ref(false)
const aiLoading   = ref(false)
const started     = ref(false)
const micSupported = ref(true)

let recognition = null

function switchMode(mode) {
  if (isRecording.value) stopRecording()
  inputMode.value = mode
  if (mode === 'speak') checkMicSupport()
}

function checkMicSupport() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) { micSupported.value = false }
}

function toggleRecording() {
  if (isRecording.value) stopRecording()
  else startRecording()
}

function startRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) { micSupported.value = false; return }

  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'

  let finalTranscript = story.value ? story.value + ' ' : ''

  recognition.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' '
      else interim += e.results[i][0].transcript
    }
    story.value = finalTranscript + interim
  }

  recognition.onerror = (e) => {
    if (e.error === 'not-allowed') micSupported.value = false
    stopRecording()
  }

  recognition.onend = () => { if (isRecording.value) stopRecording() }

  recognition.start()
  isRecording.value = true
}

function stopRecording() {
  recognition?.stop()
  isRecording.value = false
}

async function startNarrate() {
  if (!story.value.trim()) return
  aiLoading.value = true
  emit('ai-thinking', true)
  try {
    const prompt = `Extract structured CV information from this career story and return ONLY valid JSON with no markdown fences:
"${story.value}"

Return exactly:
{"fn":"first name if found","ln":"last name if found","title":"job title","sum":"2-3 sentence professional summary","skills":["skill1","skill2","skill3","skill4","skill5","skill6"],"experiences":[{"title":"role","company":"company","period":"dates","desc":"key achievement with metric"}],"education":{"degree":"","school":"","year":""},"loc":"city country if mentioned","email":"if mentioned","phone":"if mentioned"}`

    const result = await store.callAi(prompt)
    const clean  = result.replace(/```json\s*/gi,'').replace(/```/g,'').trim()
    const parsed = JSON.parse(clean)
    if (parsed.fn)    store.data.fn    = parsed.fn
    if (parsed.ln)    store.data.ln    = parsed.ln
    if (parsed.title) store.data.title = parsed.title
    if (parsed.sum)   store.data.sum   = parsed.sum
    if (parsed.loc)   store.data.loc   = parsed.loc
    if (parsed.email) store.data.email = parsed.email
    if (parsed.phone) store.data.phone = parsed.phone
    if (parsed.skills?.length) store.data.skills = parsed.skills
    if (parsed.experiences?.length) store.data.experiences = parsed.experiences.map((e,i) => ({...e, id: Date.now()+i}))
    if (parsed.education?.degree) store.data.education = parsed.education
  } catch {
    store.data.sum = 'Experienced professional with a proven track record. Known for delivering measurable results and building impactful solutions.'
  }
  aiLoading.value = false
  emit('ai-thinking', false)
  started.value = true
}

onUnmounted(() => { if (isRecording.value) stopRecording() })
</script>

<style scoped>
.step-title { font-family:'DM Serif Display',serif;font-size:20px;color:var(--c-text);margin-bottom:5px; }
.step-sub { font-size:13px;color:var(--c-text2);margin-bottom:18px;line-height:1.5; }

.input-mode-toggle { display:flex;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--radius);padding:3px;gap:3px;margin-bottom:16px; }
.mode-btn { flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:9px;border-radius:var(--radius-sm);border:none;background:none;font-size:13px;font-weight:600;color:var(--c-text2);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s; }
.mode-btn svg { width:15px;height:15px;stroke:currentColor; }
.mode-btn.active { background:var(--c-surface);color:var(--c-accent);box-shadow:var(--shadow-xs); }
.mode-btn:hover:not(.active) { color:var(--c-text); }

/* Speak panel */
.speak-panel { display:flex;flex-direction:column;gap:12px; }
.mic-area { display:flex;flex-direction:column;align-items:center;padding:28px 20px;background:var(--c-bg);border:2px dashed var(--c-border);border-radius:var(--radius-lg);transition:all .2s;text-align:center; }
.mic-area.recording { border-color:var(--c-rose);background:var(--c-rose-lt); }
.mic-area.has-transcript:not(.recording) { border-color:var(--c-green);border-style:solid; }
.mic-btn { width:68px;height:68px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;background:var(--c-accent);color:#fff;margin-bottom:12px;box-shadow:0 4px 16px rgba(42,91,215,.3); }
.mic-btn.active { background:var(--c-rose);box-shadow:0 4px 16px rgba(197,43,61,.4);animation:pulse-ring 1.5s infinite; }
.mic-btn svg { width:28px;height:28px; }
.mic-status { font-size:13px;color:var(--c-text2); }
.recording-label { color:var(--c-rose);font-weight:600; }
.done-label { color:var(--c-green);font-weight:600; }
@keyframes pulse-ring { 0%,100%{box-shadow:0 4px 16px rgba(197,43,61,.4),0 0 0 0 rgba(197,43,61,.4)}50%{box-shadow:0 4px 16px rgba(197,43,61,.4),0 0 0 12px rgba(197,43,61,0)} }

.mic-waves { display:flex;align-items:flex-end;gap:3px;height:24px;margin-top:12px; }
.mic-waves span { width:4px;background:var(--c-rose);border-radius:2px;animation:wave 0.8s ease-in-out infinite; }
.mic-waves span:nth-child(1){height:8px;animation-delay:0s}
.mic-waves span:nth-child(2){height:16px;animation-delay:.1s}
.mic-waves span:nth-child(3){height:22px;animation-delay:.2s}
.mic-waves span:nth-child(4){height:16px;animation-delay:.3s}
.mic-waves span:nth-child(5){height:8px;animation-delay:.4s}
@keyframes wave { 0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.6)} }

.mic-unsupported { display:flex;align-items:flex-start;gap:8px;background:var(--c-amber-lt);border:1px solid #f0c080;border-radius:var(--radius-sm);padding:10px 12px;font-size:12px;color:var(--c-amber); }
.transcript-box { background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--radius);padding:12px; }
.transcript-lbl { font-size:10px;font-weight:800;color:var(--c-text3);letter-spacing:.08em;text-transform:uppercase;display:flex;align-items:center;justify-content:space-between; }
.transcript-clear { background:none;border:none;font-size:11px;color:var(--c-rose);font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif; }

.start-controls { display:flex;flex-direction:column;gap:8px; }
.skip-btn { background:none;border:none;font-size:12.5px;color:var(--c-text3);cursor:pointer;font-family:'DM Sans',sans-serif;text-align:center;text-decoration:underline; }
.story-preview { background:var(--c-surface2);border:1px solid var(--c-border);border-radius:var(--radius);padding:14px;margin-bottom:12px; }
.sp-lbl { font-size:9.5px;font-weight:800;color:var(--c-text3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px; }
.sp-txt { font-size:12.5px;color:var(--c-text2);line-height:1.6;margin-bottom:8px; }
.sp-edit { background:none;border:none;font-size:11.5px;color:var(--c-accent);font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline; }
.success-box { display:flex;align-items:flex-start;gap:12px;background:var(--c-green-lt);border:1px solid #a0e0b8;color:var(--c-green);font-size:13px;padding:14px;border-radius:var(--radius);line-height:1.5;margin-bottom:14px; }
.spin-i { animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
</style>