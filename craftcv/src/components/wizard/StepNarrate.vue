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
        <div v-if="!micSupported" class="mic-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Microphone not available. Use Chrome or Edge, ensure microphone access is allowed, then try again. Or switch to Type mode.
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

      <!-- AI loading -->
      <div v-if="aiLoading" class="thinking" style="margin-top:14px;">
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        <div class="thinking-txt">AI is reading your story and building your CV...</div>
      </div>

      <div class="narrate-actions">
        <button class="btn-primary accent" @click="startNarrate"
          :disabled="!story.trim() || aiLoading" style="width:100%;justify-content:center;">
          <svg v-if="aiLoading" class="spin-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
          {{ aiLoading ? 'Building your CV...' : 'Build My CV from Story' }}
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
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store = useCvStore()
const emit  = defineEmits(['next', 'ai-thinking'])

const story       = ref('')
const interim     = ref('')
const inputMode   = ref('type')
const isRecording = ref(false)
const aiLoading   = ref(false)
const started     = ref(false)
const micSupported = ref(true)

let recognition   = null
let finalBuffer   = ''
let restartTimer  = null

function switchMode(mode) {
  if (isRecording.value) stopMic()
  inputMode.value = mode
  if (mode === 'speak') checkMic()
}

function checkMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  micSupported.value = !!SR
}

function toggleMic() {
  if (isRecording.value) stopMic()
  else startMic()
}

function startMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) { micSupported.value = false; return }

  finalBuffer = story.value ? story.value.trimEnd() + ' ' : ''
  interim.value = ''

  recognition = new SR()
  recognition.continuous      = true
  recognition.interimResults  = true
  recognition.maxAlternatives = 1
  recognition.lang            = 'en-US'

  recognition.onstart = () => { isRecording.value = true }

  recognition.onresult = (e) => {
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
    // Always update story so the textarea shows something
    story.value = (finalBuffer + interimText).trimEnd()
    interim.value = interimText
  }

  recognition.onerror = (e) => {
    console.warn('Speech error:', e.error)
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      micSupported.value = false
      stopMic()
    } else if (e.error === 'no-speech' || e.error === 'network') {
      // Auto-restart on silence or network glitch
      if (isRecording.value) {
        clearTimeout(restartTimer)
        restartTimer = setTimeout(() => {
          if (isRecording.value) { stopMic(); startMic() }
        }, 300)
      }
    }
  }

  // Chrome stops after ~60s silence — auto restart
  recognition.onend = () => {
    interim.value = ''
    if (isRecording.value) {
      // Still supposed to be recording — restart
      clearTimeout(restartTimer)
      restartTimer = setTimeout(() => {
        if (isRecording.value && recognition) {
          try { recognition.start() } catch {}
        }
      }, 250)
    }
  }

  try {
    recognition.start()
  } catch (e) {
    console.warn('Could not start recognition:', e)
    micSupported.value = false
  }
}

function stopMic() {
  clearTimeout(restartTimer)
  isRecording.value = false
  // Commit any interim text that wasn't finalised
  if (interim.value.trim()) {
    finalBuffer += interim.value.trim() + ' '
    story.value = finalBuffer.trimEnd()
  }
  interim.value = ''
  try { recognition?.stop() } catch {}
  recognition = null
}

function clearTranscript() {
  story.value = ''
  interim.value = ''
  finalBuffer = ''
}

async function startNarrate() {
  if (!story.value.trim()) return
  aiLoading.value = true
  emit('ai-thinking', true)
  try {
    const prompt = `Extract structured CV info from this career story. Return ONLY valid JSON, no markdown:
"${story.value.slice(0, 3000)}"

JSON structure:
{"fn":"","ln":"","title":"","sum":"2-3 sentence professional summary","skills":["","","","","",""],"experiences":[{"title":"","company":"","period":"","desc":"achievement with metric"}],"education":{"degree":"","school":"","year":""},"loc":"","email":"","phone":""}`

    const result = await store.callAi(prompt)
    const clean  = result.replace(/```json\s*/gi,'').replace(/```/g,'').trim()
    const p = JSON.parse(clean)
    store.applyExtracted(p)
  } catch {
    store.data.sum = 'Experienced professional with a proven track record delivering measurable results across multiple organisations.'
  }
  aiLoading.value = false
  emit('ai-thinking', false)
  started.value = true
}

onUnmounted(() => stopMic())
</script>

<style scoped>
.step-title { font-family:'DM Serif Display',serif;font-size:20px;color:var(--c-text);margin-bottom:5px; }
.step-sub   { font-size:13px;color:var(--c-text2);margin-bottom:18px;line-height:1.5; }

.input-mode-toggle {
  display:flex;background:var(--c-bg);border:1px solid var(--c-border);
  border-radius:var(--radius);padding:3px;gap:3px;margin-bottom:16px;
}
.mode-btn {
  flex:1;display:flex;align-items:center;justify-content:center;gap:7px;
  padding:9px 12px;border-radius:var(--radius-sm);border:none;background:none;
  font-size:13px;font-weight:600;color:var(--c-text2);cursor:pointer;
  font-family:'DM Sans',sans-serif;transition:all .18s;
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
.transcript-clear { background:none;border:none;font-size:11.5px;color:var(--c-rose);font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif; }
.transcript-body { font-size:12.5px;color:var(--c-text2);line-height:1.7;max-height:100px;overflow-y:auto; }
.transcript-final { color:var(--c-text); }
.transcript-interim { color:var(--c-text3);font-style:italic; }

/* Actions */
.narrate-actions { display:flex;flex-direction:column;gap:8px;margin-top:16px; }
.skip-link { background:none;border:none;font-size:12.5px;color:var(--c-text3);cursor:pointer;font-family:'DM Sans',sans-serif;text-align:center;text-decoration:underline; }

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
.sp-edit { background:none;border:none;font-size:11.5px;color:var(--c-accent);font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline; }
.spin-i { animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
</style>