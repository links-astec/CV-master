<template>
  <!-- CVM AI Interviewer: a mock interview for the job on this CV. The intro with an embedded card to choose
       how to talk (text, audio or video), the difficulty and the language; then the interview, one question at
       a time; then a report. Speech uses the browser's own recognition and voice; the camera is only shown
       to the person (nothing is recorded or sent). -->
  <div class="view-page iv-page">
    <div class="iv">

      <!-- ── Intro ─────────────────────────────────────────────── -->
      <section v-if="stage === 'intro'" class="iv-intro">
        <div class="iv-hero">
          <span class="iv-kicker"><span class="iv-live"></span>{{ $t('CVM AI Interviewer') }}</span>
          <h1>{{ $t('Practise the interview before the real one.') }}</h1>
          <p class="iv-lead">{{ $t('CVM asks the questions this employer is likely to ask, from your CV and the job, listens to your answers and follows up like a real interviewer. At the end you get a score for every answer and a stronger way to say it.') }}</p>
          <ul class="iv-points">
            <li><b>{{ $t('Questions about you') }}</b><span>{{ $t('From your CV and the job, never generic.') }}</span></li>
            <li><b>{{ $t('A real conversation') }}</b><span>{{ $t('Type, talk, or go face to face.') }}</span></li>
            <li><b>{{ $t('An honest report') }}</b><span>{{ $t('What worked, what to change, and a better answer.') }}</span></li>
          </ul>
        </div>

        <!-- The card: the interviewer, already in the page -->
        <div class="iv-card">
          <header class="iv-card-hd">
            <span class="iv-ava"><BrandLogo mark-only /></span>
            <span class="iv-who"><b>CVM</b><small><span class="iv-dot"></span>{{ $t('AI Interviewer · ready') }}</small></span>
          </header>
          <div class="iv-card-body">
            <p class="iv-say">{{ firstName ? $t('Hi {name}, I’m CVM. How would you like to do this interview?', { name: firstName }) : $t('Hi, I’m CVM. How would you like to do this interview?') }}</p>
            <div class="iv-modes" role="radiogroup" :aria-label="$t('How to talk')">
              <button v-for="m in MODES" :key="m.id" type="button" role="radio" class="iv-mode" :class="{ on: mode === m.id }" :aria-checked="mode === m.id" @click="mode = m.id">
                <span class="iv-mode-ic"><svg viewBox="0 0 24 24" aria-hidden="true" v-html="m.icon"></svg></span>
                <b>{{ $t(m.name) }}</b><small>{{ $t(m.sub) }}</small>
              </button>
            </div>
            <p v-if="mode !== 'text' && !canListen" class="iv-warn">{{ $t('This browser can’t listen to speech, so you’ll type your answers. CVM still speaks. Chrome, Edge or Safari can listen.') }}</p>

            <div class="iv-opts">
              <label class="iv-opt"><span>{{ $t('The job') }}</span>
                <input v-model="role" class="iv-in" maxlength="100" :placeholder="$t('e.g. {role}', { role: store.data.title || $t('Data analyst') })" /></label>
              <p v-if="offerTitle" class="iv-opt-note">{{ $t('Questions follow the job offer on this CV.') }}</p>
              <div class="iv-opt"><span>{{ $t('Difficulty') }}</span>
                <div class="seg iv-seg"><button v-for="d in LEVELS" :key="d.id" type="button" :class="{ active: level === d.id }" @click="level = d.id">{{ $t(d.name) }}</button></div></div>
              <label class="iv-opt"><span>{{ $t('Language') }}</span>
                <select v-model="ivLang" class="iv-in iv-select"><option v-for="l in LANGS" :key="l.code" :value="l.code">{{ l.label }}</option></select></label>
            </div>

            <div v-if="gate" class="iv-gate">
              <b>{{ $t(gate === 'confirm' ? 'Confirm your student email first' : 'Interview practice comes with the Job Hunt Pass') }}</b>
              <span>{{ $t(gate === 'confirm' ? 'We sent you a link. Once it’s confirmed, CVM is ready for you.' : 'Unlimited mock interviews with a report after each one, plus every CV unlocked.') }}</span>
              <button v-if="gate === 'confirm'" type="button" class="iv-btn" @click="resendVerification?.()">{{ $t('Resend the link') }}</button>
              <button v-else type="button" class="iv-btn" @click="$router.push({ path: '/settings', hash: '#pass' })">{{ $t('See the pass') }}</button>
            </div>
            <button v-else type="button" class="iv-start" :disabled="busy" @click="start">
              <span v-if="busy" class="iv-spin"></span>{{ $t(busy ? 'Getting ready…' : 'Start the interview') }}
            </button>
            <p class="iv-fine">{{ $t('About 10 minutes · 6 questions') }}<template v-if="mode === 'video'"> · {{ $t('Your camera stays on your device. Nothing is recorded.') }}</template></p>
            <p v-if="error" class="iv-err">{{ $t(error) }}</p>
          </div>
        </div>
      </section>

      <!-- ── The interview ─────────────────────────────────────── -->
      <section v-else-if="stage === 'session'" class="iv-session" :class="'is-' + mode">
        <header class="iv-top">
          <span class="iv-ava sm"><BrandLogo mark-only /></span>
          <span class="iv-who"><b>CVM</b><small>{{ shownRole || $t('Mock interview') }} · {{ $t(levelName) }}</small></span>
          <span class="iv-prog"><span>{{ $t('Question {n} of {total}', { n: Math.max(1, qn), total }) }}</span><i><b :style="{ width: (Math.min(qn, total) / total * 100) + '%' }"></b></i></span>
          <button type="button" class="iv-end" @click="endEarly">{{ $t('End') }}</button>
        </header>

        <!-- Text: a conversation -->
        <div v-if="mode === 'text'" class="iv-chat" ref="chatEl">
          <div v-for="(m, i) in messages" :key="i" class="iv-msg" :class="m.from">
            <span v-if="m.from === 'cvm'" class="iv-ava xs"><BrandLogo mark-only /></span>
            <p>{{ m.text }}</p>
          </div>
          <div v-if="thinking" class="iv-msg cvm"><span class="iv-ava xs"><BrandLogo mark-only /></span><p class="iv-typing"><i></i><i></i><i></i></p></div>
        </div>

        <!-- Audio and video: the interviewer speaks, listens, and shows captions -->
        <div v-else class="iv-stage">
          <div class="iv-tiles" :class="{ two: mode === 'video' }">
            <div class="iv-tile cvm" :class="{ speaking, listening }">
              <span class="iv-orb"><span class="iv-ring"></span><span class="iv-ring r2"></span><BrandLogo mark-only /></span>
              <span class="iv-tile-name">CVM</span>
              <span class="iv-state">{{ $t(thinking ? 'Thinking…' : speaking ? 'Speaking' : listening ? 'Listening' : 'Your turn') }}</span>
            </div>
            <div v-if="mode === 'video'" class="iv-tile me">
              <video ref="camEl" autoplay playsinline muted></video>
              <span v-if="!camOn" class="iv-cam-off">{{ $t(camError ? 'Camera not available' : 'Camera off') }}</span>
              <span class="iv-tile-name">{{ firstName || $t('You') }}</span>
            </div>
          </div>
          <p class="iv-caption">{{ lastSay }}</p>
          <p class="iv-heard" :class="{ empty: !draft }">{{ draft || $t(!canListen ? 'Type your answer below' : listening ? 'Listening… answer out loud' : 'Press the microphone to answer') }}</p>
        </div>

        <!-- Answering -->
        <footer class="iv-compose">
          <template v-if="mode === 'text' || !voice">
            <textarea v-model="draft" class="iv-ta" rows="2" :placeholder="$t('Type your answer…')" :disabled="thinking || done" @keydown.enter.exact.prevent="send"></textarea>
            <button type="button" class="iv-send" :disabled="thinking || done || !draft.trim()" :aria-label="$t('Send')" @click="send"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
          </template>
          <template v-else>
            <button type="button" class="iv-ctl" :class="{ on: listening }" :disabled="thinking || speaking || done" :aria-label="$t(listening ? 'Stop listening' : 'Answer out loud')" @click="listening ? stopListening() : listen()">
              <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg></button>
            <button v-if="mode === 'video'" type="button" class="iv-ctl" :class="{ off: !camOn }" :aria-label="$t(camOn ? 'Turn camera off' : 'Turn camera on')" @click="toggleCam">
              <svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg></button>
            <button type="button" class="iv-ctl" :disabled="thinking || speaking" :aria-label="$t('Repeat the question')" @click="speak(lastSay)">
              <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
            <button type="button" class="iv-answer" :disabled="thinking || done || !draft.trim()" @click="send">{{ $t('Send my answer') }}</button>
          </template>
        </footer>
        <p v-if="error" class="iv-err">{{ $t(error) }}</p>
      </section>

      <!-- ── The report ────────────────────────────────────────── -->
      <section v-else class="iv-report">
        <div v-if="!report" class="iv-loading"><span class="iv-ava lg"><BrandLogo mark-only animate /></span><b>{{ $t('CVM is writing your report…') }}</b><span>{{ $t('Every answer, scored and explained.') }}</span>
          <p v-if="error" class="iv-err">{{ $t(error) }} <button type="button" class="iv-link" @click="makeReport">{{ $t('Try again') }}</button></p></div>
        <template v-else>
          <header class="iv-rep-hd">
            <div class="iv-score" :style="{ '--p': report.overall }"><b>{{ report.overall }}</b><small>/100</small></div>
            <div><span class="iv-kicker">{{ $t('Your interview report') }}</span><h1>{{ shownRole || $t('Mock interview') }}</h1><p>{{ report.summary }}</p></div>
          </header>
          <div class="iv-two">
            <div class="iv-box"><h3>{{ $t('What worked') }}</h3><ul><li v-for="x in report.strengths" :key="x">{{ x }}</li></ul></div>
            <div class="iv-box"><h3>{{ $t('What to work on') }}</h3><ul><li v-for="x in report.improve" :key="x">{{ x }}</li></ul></div>
          </div>
          <h2 class="iv-h2">{{ $t('Answer by answer') }}</h2>
          <details v-for="(q, i) in report.questions" :key="i" class="iv-q" :open="i === 0">
            <summary><span class="iv-q-n">{{ i + 1 }}</span><span class="iv-q-t">{{ q.q }}</span><span class="iv-dots" :aria-label="$t('{n} out of 5', { n: q.score })"><i v-for="n in 5" :key="n" :class="{ on: n <= q.score }"></i></span></summary>
            <div class="iv-q-body">
              <p class="iv-q-lbl">{{ $t('You said') }}</p><p class="iv-q-a">{{ q.a || $t('(no answer)') }}</p>
              <p class="iv-q-lbl">{{ $t('Feedback') }}</p><p>{{ q.feedback }}</p>
              <p class="iv-q-lbl">{{ $t('A stronger answer') }}</p><p class="iv-better">{{ q.better }}</p>
            </div>
          </details>
          <div class="iv-acts">
            <button type="button" class="iv-start" @click="reset">{{ $t('Practise again') }}</button>
            <button type="button" class="iv-link" @click="$router.push('/editor')">{{ $t('Back to my CV') }}</button>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount, inject } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'
import { lang as uiLang, LANGS } from '../i18n/index.js'
import BrandLogo from '../components/BrandLogo.vue'

const store = useCvStore()
const auth = useAuthStore()
const requireAccount = inject('requireAccount', null)
const resendVerification = inject('resendVerification', null)
const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p

const MODES = [
  { id: 'text', name: 'Text', sub: 'Type your answers', icon: '<path d="M4 5h16v11H8l-4 4z"/><line x1="8" y1="9.5" x2="16" y2="9.5"/><line x1="8" y1="12.5" x2="13" y2="12.5"/>' },
  { id: 'audio', name: 'Audio', sub: 'Talk, CVM listens and speaks', icon: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>' },
  { id: 'video', name: 'Video', sub: 'Face to face, with your camera', icon: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>' },
]
const LEVELS = [{ id: 'friendly', name: 'Friendly' }, { id: 'standard', name: 'Realistic' }, { id: 'tough', name: 'Tough' }]
const SPEECH = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', it: 'it-IT', pt: 'pt-PT', zh: 'zh-CN' }

const stage = ref('intro'), mode = ref('text'), level = ref('standard')
const ivLang = ref(LANGS.some(l => l.code === store.data.lang) ? store.data.lang : uiLang.value)
const role = ref('')
const offerTitle = computed(() => (store.data.jobOffer || '').trim().length >= 80)
const firstName = computed(() => (store.data.fn || auth.user?.name || '').trim().split(/\s+/)[0] || '')
const levelName = computed(() => LEVELS.find(l => l.id === level.value)?.name || '')
const busy = ref(false), thinking = ref(false), error = ref(''), gate = ref('')
const messages = ref([]), turns = ref([]), current = ref(''), lastSay = ref(''), draft = ref('')
const qn = ref(0), total = ref(6), done = ref(false), shownRole = ref(''), report = ref(null)
const chatEl = ref(null)

// The browser's speech: recognition (to listen) and synthesis (to speak)
const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null
const canListen = !!SR
const voice = computed(() => mode.value !== 'text' && canListen)
const speaking = ref(false), listening = ref(false)
let rec = null, finalText = '', wantListening = false

function pickVoice(code) {
  const vs = window.speechSynthesis?.getVoices?.() || []
  const tag = SPEECH[code] || 'en-GB'
  return vs.find(v => v.lang === tag) || vs.find(v => v.lang?.toLowerCase().startsWith(code)) || null
}
function speak(text) {
  return new Promise((resolve) => {
    if (mode.value === 'text' || !text || !window.speechSynthesis) return resolve()
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = SPEECH[ivLang.value] || 'en-GB'
    const v = pickVoice(ivLang.value); if (v) u.voice = v
    u.rate = 1; u.pitch = 1
    speaking.value = true
    u.onend = u.onerror = () => { speaking.value = false; resolve() }
    window.speechSynthesis.speak(u)
  })
}
function listen() {
  if (!SR || done.value) return
  stopListening(true)
  finalText = draft.value ? draft.value.trim() + ' ' : ''
  rec = new SR()
  rec.lang = SPEECH[ivLang.value] || 'en-GB'
  rec.continuous = true; rec.interimResults = true
  rec.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript
      if (e.results[i].isFinal) finalText += t + ' '; else interim += t
    }
    draft.value = (finalText + interim).trim()
  }
  // browsers stop after a silence: keep listening until they press "Send my answer"
  rec.onend = () => { if (wantListening) { try { rec.start() } catch { listening.value = false } } else listening.value = false }
  rec.onerror = (e) => { if (e.error === 'not-allowed') { error.value = 'Allow the microphone to answer out loud, or switch to Text.'; wantListening = false; listening.value = false } }
  wantListening = true; listening.value = true
  try { rec.start() } catch { listening.value = false }
}
function stopListening(silent) {
  wantListening = false
  try { rec?.stop() } catch {}
  rec = null
  if (!silent) listening.value = false
}

// The camera (video mode): shown to the person only
const camEl = ref(null), camOn = ref(false), camError = ref(false)
let stream = null
async function startCam() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    camOn.value = true; camError.value = false
    await nextTick(); if (camEl.value) camEl.value.srcObject = stream
  } catch { camOn.value = false; camError.value = true }
}
function stopCam() { stream?.getTracks().forEach(t => t.stop()); stream = null; camOn.value = false }
function toggleCam() { camOn.value ? stopCam() : startCam() }

function body() {
  const { photo, coverLetter, interviewPrep, ...cv } = JSON.parse(JSON.stringify(store.data))
  return { cv, jobOffer: store.data.jobOffer || '', role: role.value.trim(), difficulty: level.value, lang: ivLang.value, uiLang: uiLang.value, turns: turns.value }
}
async function post(path) {
  const r = await fetch(apiUrl(path), { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body()) })
  const j = await r.json().catch(() => ({}))
  if (r.status === 402) { gate.value = 'pass'; stage.value = 'intro'; throw Object.assign(new Error(''), { quiet: true }) }
  if (!r.ok) throw Object.assign(new Error(j.error || 'AI is unavailable right now. Please try again in a moment.'), { quiet: r.status === 429 })
  return j
}
const scrollChat = () => nextTick(() => { if (chatEl.value) chatEl.value.scrollTop = chatEl.value.scrollHeight })

async function ask() {
  thinking.value = true; error.value = ''
  try {
    const j = await post('/api/ai/interview/next')
    shownRole.value = j.role || shownRole.value
    qn.value = j.n; total.value = j.total; done.value = !!j.done
    current.value = j.question; lastSay.value = j.say
    messages.value.push({ from: 'cvm', text: j.say }); scrollChat()
    thinking.value = false
    await speak(j.say)
    if (done.value) { await new Promise(r => setTimeout(r, 600)); return makeReport() }
    if (voice.value) listen()
  } catch (e) { thinking.value = false; if (!e.quiet) error.value = e.message }
}
async function start() {
  error.value = ''; gate.value = ''
  if (!auth.isLoggedIn && !(await requireAccount?.('interview'))) return
  if (auth.user?.campus && !auth.user?.campusActive && !auth.user?.pass) { gate.value = 'confirm'; return }
  if (!auth.user?.pass && !auth.user?.campusActive) { gate.value = 'pass'; return }
  busy.value = true
  messages.value = []; turns.value = []; draft.value = ''; done.value = false; report.value = null; qn.value = 0
  shownRole.value = role.value.trim()
  window.speechSynthesis?.getVoices?.()   // starts loading the voices
  stage.value = 'session'; busy.value = false
  // the camera joins when it's allowed; the interview doesn't wait for the permission prompt
  if (mode.value === 'video') startCam()
  await ask()
}
async function send() {
  const a = draft.value.trim()
  if (!a || thinking.value || done.value) return
  stopListening()
  messages.value.push({ from: 'me', text: a }); scrollChat()
  turns.value.push({ q: current.value, a })
  draft.value = ''
  await ask()
}
async function makeReport() {
  stopListening(); window.speechSynthesis?.cancel(); stopCam()
  stage.value = 'report'; report.value = null; error.value = ''
  try { report.value = await post('/api/ai/interview/report') } catch (e) { if (!e.quiet) error.value = e.message }
}
function endEarly() {
  if (turns.value.some(t => t.a)) return makeReport()
  reset()
}
function reset() {
  stopListening(); window.speechSynthesis?.cancel(); stopCam()
  stage.value = 'intro'; messages.value = []; turns.value = []; report.value = null; error.value = ''; draft.value = ''
}
onBeforeUnmount(() => { stopListening(); window.speechSynthesis?.cancel(); stopCam() })
</script>

<style scoped>
.iv-page{background:var(--c-surface)}
.iv{max-width:1120px;margin:0 auto;padding:8px 0 64px}

/* Intro */
.iv-intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,480px);gap:56px;align-items:center;min-height:calc(100dvh - 140px)}
.iv-kicker{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--c-accent)}
.iv-live{width:8px;height:8px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 4px rgba(22,163,74,.15)}
.iv-hero h1{font-size:clamp(34px,4.4vw,54px);font-weight:700;letter-spacing:-.035em;line-height:1.05;margin:14px 0 0;color:var(--c-text)}
.iv-lead{font-size:18px;line-height:1.55;color:var(--c-text2);margin:18px 0 0;max-width:560px}
.iv-points{list-style:none;padding:0;margin:28px 0 0;display:flex;flex-direction:column;gap:14px}
.iv-points li{display:flex;flex-direction:column;gap:2px;padding-left:18px;position:relative}
.iv-points li::before{content:'';position:absolute;left:0;top:8px;width:7px;height:7px;border-radius:50%;background:var(--c-accent)}
.iv-points b{font-size:16px;color:var(--c-text);font-weight:650}
.iv-points span{font-size:14.5px;color:var(--c-text3)}

/* The embedded card */
.iv-card{background:var(--c-surface);border-radius:28px;box-shadow:inset 0 0 0 1px var(--c-border),0 30px 80px -30px rgba(20,20,43,.25);overflow:hidden}
.iv-card-hd{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--c-border)}
.iv-ava{width:40px;height:40px;border-radius:50%;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.iv-ava{overflow:hidden}
.iv-ava :deep(svg){height:18px!important;width:auto!important}
.iv-ava.sm{width:34px;height:34px}.iv-ava.sm :deep(svg){height:15px!important}
.iv-ava.xs{width:28px;height:28px}.iv-ava.xs :deep(svg){height:12px!important}
.iv-ava.lg{width:72px;height:72px}.iv-ava.lg :deep(svg){height:30px!important}
.iv-who{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.iv-who b{font-size:15px;color:var(--c-text)}
.iv-who small{font-size:12.5px;color:var(--c-text3);display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.iv-dot{width:7px;height:7px;border-radius:50%;background:#16a34a;flex-shrink:0}
.iv-card-body{padding:20px}
.iv-say{margin:0;padding:12px 15px;border-radius:18px 18px 18px 6px;background:var(--c-accent-lt);color:var(--c-text);font-size:15px;line-height:1.5;max-width:92%}
.iv-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}
.iv-mode{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:14px 12px;border:none;border-radius:18px;background:var(--c-surface);box-shadow:inset 0 0 0 1px var(--c-border);font:inherit;text-align:left;cursor:pointer;transition:box-shadow .15s}
.iv-mode:hover{box-shadow:inset 0 0 0 1px var(--c-accent)}
.iv-mode.on{box-shadow:inset 0 0 0 2px var(--c-accent)}
.iv-mode-ic{width:34px;height:34px;border-radius:50%;background:var(--c-accent-lt);color:var(--c-accent);display:flex;align-items:center;justify-content:center;margin-bottom:6px}
.iv-mode-ic svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.iv-mode b{font-size:15px;color:var(--c-text)}
.iv-mode small{font-size:12px;color:var(--c-text3);line-height:1.35}
.iv-warn{font-size:13px;color:var(--c-amber,#b45309);margin:10px 2px 0;line-height:1.45}
.iv-opts{margin-top:16px;border-radius:18px;box-shadow:inset 0 0 0 1px var(--c-border);overflow:hidden}
.iv-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;min-height:52px;font-size:14.5px;color:var(--c-text)}
.iv-opt + .iv-opt,.iv-opt-note + .iv-opt{border-top:1px solid var(--c-border)}
.iv-opt > span{font-weight:600;flex-shrink:0}
.iv-opt-note{margin:-6px 14px 8px;font-size:12.5px;color:var(--c-text3)}
.iv-in{flex:1;min-width:0;border:none;background:none;font:inherit;font-size:14.5px;color:var(--c-text);text-align:right;outline:none}
.iv-select{flex:0 1 auto;cursor:pointer}
.iv-seg button{height:30px;padding:0 12px;font-size:13px}
.iv-start{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;margin-top:18px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:16px;font-weight:600;cursor:pointer}
.iv-start:disabled{opacity:.6;cursor:default}
.iv-spin{width:15px;height:15px;border:2px solid #fff;border-right-color:transparent;border-radius:50%;animation:ivSpin .8s linear infinite}
@keyframes ivSpin{to{transform:rotate(360deg)}}
.iv-fine{text-align:center;font-size:12.5px;color:var(--c-text3);margin:10px 0 0}
.iv-err{color:var(--c-rose);font-size:13.5px;margin:10px 2px 0}
.iv-gate{display:flex;flex-direction:column;gap:6px;margin-top:18px;padding:16px;border-radius:18px;box-shadow:inset 0 0 0 1px var(--c-accent);background:var(--c-accent-lt)}
.iv-gate b{font-size:15px;color:var(--c-text)}.iv-gate span{font-size:13.5px;color:var(--c-text2);line-height:1.45}
.iv-btn{align-self:flex-start;margin-top:6px;height:38px;padding:0 18px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:14px;font-weight:600;cursor:pointer}
.iv-link{border:none;background:none;font:inherit;font-size:15px;font-weight:600;color:var(--c-accent);cursor:pointer}

/* The interview */
.iv-session{display:flex;flex-direction:column;height:calc(100dvh - 120px);max-width:860px;margin:0 auto;border-radius:28px;box-shadow:inset 0 0 0 1px var(--c-border);overflow:hidden;background:var(--c-surface)}
.iv-top{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--c-border)}
.iv-prog{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:5px;font-size:12.5px;color:var(--c-text3);white-space:nowrap}
.iv-prog i{display:block;width:120px;height:4px;border-radius:99px;background:var(--c-border);overflow:hidden}
.iv-prog i b{display:block;height:100%;background:var(--c-accent);border-radius:99px;transition:width .4s var(--ease)}
.iv-end{height:34px;padding:0 16px;border:none;border-radius:99px;background:var(--c-surface);box-shadow:inset 0 0 0 1px var(--c-border);font:inherit;font-size:13.5px;font-weight:600;color:var(--c-rose);cursor:pointer}
.iv-chat{flex:1;overflow-y:auto;padding:22px 20px;display:flex;flex-direction:column;gap:14px}
.iv-msg{display:flex;gap:10px;align-items:flex-end;max-width:84%}
.iv-msg p{margin:0;padding:12px 15px;font-size:15px;line-height:1.55;white-space:pre-line}
.iv-msg.cvm p{background:var(--c-accent-lt);color:var(--c-text);border-radius:18px 18px 18px 6px}
.iv-msg.me{align-self:flex-end}
.iv-msg.me p{background:var(--c-accent);color:#fff;border-radius:18px 18px 6px 18px}
.iv-typing{display:flex;gap:5px;padding:16px 18px!important}
.iv-typing i{width:7px;height:7px;border-radius:50%;background:var(--c-accent);opacity:.4;animation:ivDot 1.2s infinite}
.iv-typing i:nth-child(2){animation-delay:.15s}.iv-typing i:nth-child(3){animation-delay:.3s}
@keyframes ivDot{40%{opacity:1;transform:translateY(-3px)}}
.iv-stage{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px 20px;overflow-y:auto}
.iv-tiles{display:grid;grid-template-columns:minmax(0,420px);gap:14px;width:100%;justify-content:center}
.iv-tiles.two{grid-template-columns:repeat(2,minmax(0,1fr))}
.iv-tile{position:relative;aspect-ratio:4/3;border-radius:22px;background:var(--c-surface);box-shadow:inset 0 0 0 1px var(--c-border);overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.iv-tile.me{background:#111}
.iv-tile video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.iv-cam-off{color:#d4d4dc;font-size:14px}
.iv-tile-name{position:absolute;left:12px;bottom:10px;padding:4px 10px;border-radius:99px;background:rgba(0,0,0,.45);color:#fff;font-size:12.5px;font-weight:600}
.iv-tile.cvm .iv-tile-name{background:var(--c-accent)}
.iv-state{font-size:13px;color:var(--c-text3);font-weight:500}
.iv-orb{position:relative;width:104px;height:104px;border-radius:50%;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center}
.iv-orb :deep(svg){height:40px!important;width:auto!important;position:relative;z-index:1}
.iv-ring{position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 2px var(--c-accent);opacity:0}
.iv-tile.speaking .iv-ring{animation:ivRing 1.6s ease-out infinite}
.iv-tile.speaking .iv-ring.r2{animation-delay:.8s}
.iv-tile.listening .iv-orb{box-shadow:0 0 0 6px color-mix(in srgb,#16a34a 25%,transparent)}
@keyframes ivRing{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.55);opacity:0}}
.iv-caption{margin:0;max-width:640px;text-align:center;font-size:18px;line-height:1.5;color:var(--c-text);font-weight:500}
.iv-heard{margin:0;max-width:640px;text-align:center;font-size:15px;line-height:1.5;color:var(--c-text2);min-height:24px}
.iv-heard.empty{color:var(--c-text3)}
.iv-compose{display:flex;align-items:flex-end;justify-content:center;gap:10px;padding:14px 16px calc(14px + env(safe-area-inset-bottom));border-top:1px solid var(--c-border)}
.iv-ta{flex:1;min-width:0;resize:none;max-height:160px;border:1px solid var(--c-border);border-radius:20px;padding:11px 16px;font:inherit;font-size:15px;line-height:1.45;color:var(--c-text);background:var(--c-surface);outline:none}
.iv-ta:focus{border-color:var(--c-accent);box-shadow:0 0 0 4px var(--c-accent-ring)}
.iv-send{width:44px;height:44px;flex-shrink:0;border:none;border-radius:50%;background:var(--c-accent);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
.iv-send:disabled{opacity:.4;cursor:default}
.iv-send svg,.iv-ctl svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.iv-ctl{width:50px;height:50px;border:none;border-radius:50%;background:var(--c-surface);box-shadow:inset 0 0 0 1px var(--c-border);color:var(--c-text);display:flex;align-items:center;justify-content:center;cursor:pointer}
.iv-ctl.on{background:#16a34a;color:#fff;box-shadow:none}
.iv-ctl.off{background:var(--c-rose);color:#fff;box-shadow:none}
.iv-ctl:disabled{opacity:.45;cursor:default}
.iv-answer{height:50px;padding:0 22px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:15px;font-weight:600;cursor:pointer}
.iv-answer:disabled{opacity:.45;cursor:default}

/* The report */
.iv-report{max-width:860px;margin:0 auto}
.iv-loading{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:120px 0}
.iv-loading b{font-size:20px;color:var(--c-text);margin-top:10px}.iv-loading span{color:var(--c-text3)}
.iv-rep-hd{display:flex;gap:28px;align-items:center;padding:8px 0 24px}
.iv-rep-hd h1{font-size:clamp(28px,3.4vw,40px);font-weight:700;letter-spacing:-.03em;margin:6px 0 0;color:var(--c-text)}
.iv-rep-hd p{font-size:16px;line-height:1.55;color:var(--c-text2);margin:10px 0 0}
.iv-score{--p:0;width:120px;height:120px;flex-shrink:0;border-radius:50%;display:flex;align-items:baseline;justify-content:center;padding-top:40px;background:radial-gradient(closest-side,var(--c-surface) 79%,transparent 80% 100%),conic-gradient(var(--c-accent) calc(var(--p)*1%),var(--c-border) 0)}
.iv-score b{font-size:36px;font-weight:700;letter-spacing:-.03em;color:var(--c-text)}.iv-score small{font-size:13px;color:var(--c-text3)}
.iv-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.iv-box{padding:18px 20px;border-radius:22px;box-shadow:inset 0 0 0 1px var(--c-border)}
.iv-box h3{font-size:15px;margin:0 0 8px;color:var(--c-text)}
.iv-box ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:14.5px;line-height:1.45;color:var(--c-text2)}
.iv-h2{font-size:20px;font-weight:700;letter-spacing:-.02em;margin:32px 0 12px;color:var(--c-text)}
.iv-q{border-radius:20px;box-shadow:inset 0 0 0 1px var(--c-border);margin-bottom:10px;overflow:hidden}
.iv-q summary{display:flex;align-items:center;gap:12px;padding:16px 18px;cursor:pointer;list-style:none}
.iv-q summary::-webkit-details-marker{display:none}
.iv-q-n{width:26px;height:26px;border-radius:50%;background:var(--c-accent-lt);color:var(--c-accent);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.iv-q-t{flex:1;font-size:15px;font-weight:600;color:var(--c-text);line-height:1.4}
.iv-dots{display:flex;gap:4px;flex-shrink:0}
.iv-dots i{width:9px;height:9px;border-radius:50%;background:var(--c-border)}
.iv-dots i.on{background:var(--c-accent)}
.iv-q-body{padding:0 18px 18px 56px}
.iv-q-body p{margin:0 0 4px;font-size:14.5px;line-height:1.55;color:var(--c-text2)}
.iv-q-lbl{font-size:12.5px!important;font-weight:650;color:var(--c-text3)!important;margin-top:12px!important}
.iv-q-a{font-style:italic}
.iv-better{color:var(--c-text)!important;padding:12px 14px;border-radius:14px;background:var(--c-accent-lt)}
.iv-acts{display:flex;align-items:center;gap:20px;margin-top:24px}
.iv-acts .iv-start{width:auto;padding:0 28px;margin:0}

@media (max-width:900px){
  .iv-intro{grid-template-columns:1fr;gap:28px;min-height:0}
  .iv-card{max-width:560px}
}
@media (max-width:600px){
  .iv-hero h1{font-size:32px}
  .iv-lead{font-size:16px}
  .iv-modes{grid-template-columns:1fr}
  .iv-mode{flex-direction:row;align-items:center;gap:12px}
  .iv-mode-ic{margin:0}
  .iv-mode small{margin-left:auto;text-align:right}
  .iv-session{height:calc(100dvh - 150px);border-radius:22px}
  .iv-prog i{width:80px}
  .iv-tiles.two{grid-template-columns:1fr 1fr}
  .iv-tiles.two .iv-orb{width:64px;height:64px}
  .iv-tiles.two .iv-orb :deep(svg){height:26px!important}
  .iv-tiles.two .iv-state{display:none}
  .iv-answer{padding:0 16px;white-space:nowrap;font-size:14px}
  .iv-ctl{width:46px;height:46px}
  .iv-caption{font-size:16px}
  .iv-rep-hd{flex-direction:column;align-items:flex-start;gap:16px}
  .iv-two{grid-template-columns:1fr}
  .iv-q-body{padding-left:18px}
}
@media (prefers-reduced-motion:reduce){ .iv-ring,.iv-typing i{animation:none} }
</style>
