<template>
  <!-- CVM AI Interviewer. The intro (a glass card on a soft glow), then the interview full screen (an orb that
       moves with CVM's voice, captions, a floating dock), then the report. Voice: natural speech from the server
       for English, the browser's voice otherwise; listening: the browser's speech recognition. Video: the camera
       stays on the device; a face check (MediaPipe, in the browser) keeps the person in the frame. -->
  <div class="view-page iv-page">
    <div class="iv-aura" aria-hidden="true"><i class="a1"></i><i class="a2"></i><i class="a3"></i><span class="iv-lines"></span></div>

    <!-- The page has no sidebar: its own small header -->
    <header class="iv-head">
      <RouterLink to="/" class="iv-brand" :aria-label="$t('CVMaster home')"><BrandLogo /></RouterLink>
      <button type="button" class="iv-x iv-close" :aria-label="$t('Close')" @click="leave">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </header>

    <!-- ── Intro ───────────────────────────────────────────────── -->
    <section v-if="stage === 'intro'" class="iv-intro">
      <div class="iv-hero">
        <span class="iv-tag"><span class="iv-live"></span>CVM · {{ $t('AI Interviewer') }}</span>
        <h1 class="iv-h1">{{ $t('Ready when you are.') }}</h1>
        <p class="iv-sub">{{ $t('Rehearse your interview with CVM.') }}</p>
        <ul class="iv-facts">
          <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>{{ $t('Questions from your CV and the job') }}</li>
          <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/></svg>{{ $t('Follow-ups, like a real recruiter') }}</li>
          <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>{{ $t('A score and a stronger answer for each one') }}</li>
        </ul>
      </div>

      <div class="iv-glass">
        <div class="iv-dock" role="radiogroup" :aria-label="$t('How to talk')">
          <button v-for="m in MODES" :key="m.id" type="button" role="radio" class="iv-dock-btn" :class="{ on: mode === m.id }" :aria-checked="mode === m.id" @click="mode = m.id">
            <svg viewBox="0 0 24 24" aria-hidden="true" v-html="m.icon"></svg><span>{{ $t(m.name) }}</span>
          </button>
        </div>

        <div class="iv-chips">
          <label class="iv-chip iv-chip-job"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            <input v-model="role" maxlength="100" :placeholder="offerTitle ? $t('From your job offer') : (store.data.title || $t('The job'))" :aria-label="$t('The job')" /></label>
          <div class="iv-chip iv-levels" role="radiogroup" :aria-label="$t('Difficulty')">
            <button v-for="d in LEVELS" :key="d.id" type="button" role="radio" :class="{ on: level === d.id }" :aria-checked="level === d.id" @click="level = d.id">{{ $t(d.name) }}</button>
          </div>
          <label class="iv-chip"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>
            <select v-model="ivLang" :aria-label="$t('Language')"><option v-for="l in LANGS" :key="l.code" :value="l.code">{{ l.label }}</option></select></label>
        </div>

        <div v-if="gate" class="iv-gate">
          <b>{{ $t(gate === 'confirm' ? 'Confirm your student email first' : 'Included with the Job Hunt Pass') }}</b>
          <button v-if="gate === 'confirm'" type="button" class="iv-go sm" @click="resendVerification?.()">{{ $t('Resend the link') }}</button>
          <button v-else type="button" class="iv-go sm" @click="$router.push({ path: '/settings', hash: '#pass' })">{{ $t('See the pass') }}</button>
        </div>
        <button v-else type="button" class="iv-go" :disabled="busy" @click="start">
          <span v-if="busy" class="iv-spin"></span>{{ $t(busy ? 'Getting ready…' : 'Start') }}
          <svg v-if="!busy" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
        <p class="iv-fine">{{ $t('6 questions · about 10 minutes') }}<template v-if="mode === 'video'"> · {{ $t('Camera stays on your device') }}</template></p>
        <p v-if="error" class="iv-err">{{ $t(error) }}</p>
      </div>
    </section>

    <!-- ── The report ──────────────────────────────────────────── -->
    <section v-else-if="stage === 'report'" class="iv-report">
      <div v-if="!report" class="iv-loading">
        <span class="iv-orb sm thinking"><i></i></span>
        <b>{{ $t('Scoring your answers…') }}</b>
        <p v-if="error" class="iv-err">{{ $t(error) }} <button type="button" class="iv-link" @click="makeReport">{{ $t('Try again') }}</button></p>
      </div>
      <template v-else>
        <div class="iv-rep-top">
          <div class="iv-ring" :style="{ '--p': report.overall }"><b>{{ report.overall }}</b></div>
          <div>
            <span class="iv-tag">{{ shownRole || $t('Mock interview') }}</span>
            <p class="iv-rep-sum">{{ report.summary }}</p>
          </div>
        </div>
        <div class="iv-pills">
          <span v-for="x in report.strengths" :key="'s' + x" class="iv-pill good">{{ x }}</span>
          <span v-for="x in report.improve" :key="'i' + x" class="iv-pill work">{{ x }}</span>
        </div>
        <details v-for="(q, i) in report.questions" :key="i" class="iv-q" :open="i === 0">
          <summary><span class="iv-q-t">{{ q.q }}</span><span class="iv-bars" :aria-label="$t('{n} out of 5', { n: q.score })"><i v-for="n in 5" :key="n" :class="{ on: n <= q.score }"></i></span></summary>
          <div class="iv-q-body">
            <p class="iv-q-you">“{{ q.a || $t('(no answer)') }}”</p>
            <p>{{ q.feedback }}</p>
            <p class="iv-better"><b>{{ $t('Try') }}</b> {{ q.better }}</p>
          </div>
        </details>
        <div class="iv-acts">
          <button type="button" class="iv-go" @click="reset">{{ $t('Again') }}</button>
          <button type="button" class="iv-link" @click="$router.push('/editor')">{{ $t('Back to my CV') }}</button>
        </div>
      </template>
    </section>

    <!-- ── The interview: full screen ──────────────────────────── -->
    <Teleport to="body">
      <div v-if="stage === 'session'" class="iv-full" :class="'is-' + mode" role="dialog" aria-modal="true" :aria-label="$t('Interview with CVM')">
        <div class="iv-aura" aria-hidden="true"><i class="a1"></i><i class="a2"></i><i class="a3"></i><span class="iv-lines"></span></div>
        <header class="iv-bar">
          <span class="iv-tag"><span class="iv-live"></span>CVM</span>
          <span class="iv-steps" :aria-label="$t('Question {n} of {total}', { n: Math.max(1, qn), total })"><i v-for="n in total" :key="n" :class="{ on: n <= qn, now: n === qn }"></i></span>
          <button type="button" class="iv-x" :aria-label="$t('End the interview')" @click="askEnd"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        </header>

        <main class="iv-center">
          <span class="iv-orb" :class="{ speaking, listening, thinking }" :style="{ '--lv': vol.toFixed(3) }"><i></i></span>
          <Transition name="iv-cap" mode="out-in"><p :key="lastSay" class="iv-cap">{{ lastSay }}</p></Transition>
          <p v-if="mode !== 'text'" class="iv-heard" :class="{ dim: !draft }">{{ draft || $t(!canListen ? 'Type below' : listening ? 'Listening…' : thinking ? '' : 'Tap the mic') }}</p>
        </main>

        <!-- The person, in a circle: red when they're out of the frame -->
        <div v-if="mode === 'video'" class="iv-me" :class="face">
          <video ref="camEl" autoplay playsinline muted></video>
          <span v-if="!camOn" class="iv-me-off">{{ $t(camError ? 'No camera' : '…') }}</span>
          <span v-if="face === 'out'" class="iv-me-tip">{{ $t('Step into the frame') }}</span>
        </div>

        <footer class="iv-float">
          <template v-if="mode === 'text' || !canListen">
            <div class="iv-type">
              <textarea ref="taEl" v-model="draft" rows="1" :placeholder="$t('Your answer…')" :disabled="thinking || done" @keydown.enter.exact.prevent="send" @input="grow"></textarea>
              <button type="button" class="iv-send" :disabled="thinking || done || !draft.trim()" :aria-label="$t('Send')" @click="send"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
            </div>
          </template>
          <div v-else class="iv-dock iv-dock-live">
            <button type="button" class="iv-dock-btn round" :class="{ on: listening }" :disabled="thinking || speaking || done" :aria-label="$t(listening ? 'Stop listening' : 'Answer out loud')" @click="listening ? stopListening() : listen()">
              <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg></button>
            <button v-if="mode === 'video'" type="button" class="iv-dock-btn round" :class="{ off: !camOn }" :aria-label="$t(camOn ? 'Camera off' : 'Camera on')" @click="toggleCam">
              <svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg></button>
            <button type="button" class="iv-dock-btn round" :disabled="thinking || speaking" :aria-label="$t('Repeat')" @click="speak(lastSay)">
              <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
            <button type="button" class="iv-done" :disabled="thinking || done || !draft.trim()" @click="send">{{ $t('Done') }}</button>
          </div>
        </footer>
        <p v-if="error" class="iv-err iv-err-float">{{ $t(error) }}</p>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount, inject } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'
import { lang as uiLang, LANGS, t } from '../i18n/index.js'
import { useRouter } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'

const store = useCvStore()
const auth = useAuthStore()
const requireAccount = inject('requireAccount', null)
const resendVerification = inject('resendVerification', null)
const confirmBox = inject('confirm', null)
const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p

const MODES = [
  { id: 'text', name: 'Text', icon: '<path d="M4 5h16v11H8l-4 4z"/><line x1="8" y1="9.5" x2="16" y2="9.5"/><line x1="8" y1="12.5" x2="13" y2="12.5"/>' },
  { id: 'audio', name: 'Voice', icon: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>' },
  { id: 'video', name: 'Video', icon: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>' },
]
const LEVELS = [{ id: 'friendly', name: 'Easy' }, { id: 'standard', name: 'Real' }, { id: 'tough', name: 'Tough' }]
const SPEECH = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', it: 'it-IT', pt: 'pt-PT', zh: 'zh-CN' }

const stage = ref('intro'), mode = ref('audio'), level = ref('standard')
const ivLang = ref(LANGS.some(l => l.code === store.data.lang) ? store.data.lang : uiLang.value)
const role = ref('')
const offerTitle = computed(() => (store.data.jobOffer || '').trim().length >= 80)
const busy = ref(false), thinking = ref(false), error = ref(''), gate = ref('')
const turns = ref([]), current = ref(''), lastSay = ref(''), draft = ref('')
const qn = ref(0), total = ref(6), done = ref(false), shownRole = ref(''), report = ref(null)
const taEl = ref(null)
function grow() { const el = taEl.value; if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px' } }

// ── Sound: a level from 0 to 1 that drives the orb (CVM's voice, or the person's while they talk) ──
const vol = ref(0)
let actx = null, voiceAnalyser = null, micAnalyser = null, raf = 0
function audioCtx() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx }
function meter() {
  const read = (an) => { if (!an) return 0; const d = new Uint8Array(an.fftSize); an.getByteTimeDomainData(d); let s = 0; for (const v of d) { const x = (v - 128) / 128; s += x * x } return Math.min(1, Math.sqrt(s / d.length) * 4) }
  const v = speaking.value ? (voiceAnalyser ? read(voiceAnalyser) : 0.35 + 0.25 * Math.sin(performance.now() / 120)) : listening.value ? read(micAnalyser) : 0
  vol.value += (v - vol.value) * 0.35
  raf = requestAnimationFrame(meter)
}

// ── CVM speaks: natural voice from the server (English), the browser's voice otherwise ──
const speaking = ref(false)
let serverVoice = true, player = null
const sentences = (text) => (String(text).match(/[^.!?]+[.!?]*\s*/g) || [text]).reduce((acc, s) => {
  const last = acc[acc.length - 1]
  if (last && (last + s).length < 220) acc[acc.length - 1] = last + s; else acc.push(s)
  return acc
}, []).map(s => s.trim()).filter(Boolean)
async function fetchVoice(text) {
  const r = await fetch(apiUrl('/api/ai/speak'), { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, lang: ivLang.value }) })
  if (r.status !== 200) return null
  return URL.createObjectURL(await r.blob())
}
function playUrl(url) {
  return new Promise((resolve) => {
    player = new Audio(url)
    try { const ctx = audioCtx(); const src = ctx.createMediaElementSource(player); voiceAnalyser = ctx.createAnalyser(); voiceAnalyser.fftSize = 512; src.connect(voiceAnalyser); voiceAnalyser.connect(ctx.destination) } catch { voiceAnalyser = null }
    player.onended = player.onerror = () => { URL.revokeObjectURL(url); resolve() }
    player.play().catch(() => resolve())
  })
}
function browserSay(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = SPEECH[ivLang.value] || 'en-GB'
    const vs = window.speechSynthesis.getVoices()
    const v = vs.find(x => x.lang === u.lang && /natural|neural|premium|enhanced|google/i.test(x.name)) || vs.find(x => x.lang === u.lang) || vs.find(x => x.lang?.startsWith(ivLang.value))
    if (v) u.voice = v
    voiceAnalyser = null
    u.onend = u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}
let speakToken = 0
async function speak(text) {
  if (mode.value === 'text' || !text) return
  const my = ++speakToken
  stopVoice(); speaking.value = true
  const parts = sentences(text)
  let next = serverVoice ? fetchVoice(parts[0]).catch(() => null) : null
  for (let i = 0; i < parts.length && my === speakToken; i++) {
    const url = next ? await next : null
    next = serverVoice && parts[i + 1] ? fetchVoice(parts[i + 1]).catch(() => null) : null
    if (url) await playUrl(url)
    else { if (i === 0) serverVoice = false; await browserSay(parts[i]) }
  }
  if (my === speakToken) speaking.value = false
}
function stopVoice() { try { player?.pause() } catch {} ; window.speechSynthesis?.cancel(); speaking.value = false }

// ── Listening: the browser's speech recognition ──
const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null
const canListen = !!SR
const listening = ref(false)
let rec = null, finalText = '', wantListening = false
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
      const tx = e.results[i][0].transcript
      if (e.results[i].isFinal) finalText += tx + ' '; else interim += tx
    }
    draft.value = (finalText + interim).trim()
  }
  rec.onend = () => { if (wantListening) { try { rec.start() } catch { listening.value = false } } else listening.value = false }
  rec.onerror = (e) => { if (e.error === 'not-allowed') { error.value = 'Allow the microphone, or switch to Text.'; wantListening = false; listening.value = false } }
  wantListening = true; listening.value = true
  try { rec.start() } catch { listening.value = false }
}
function stopListening(silent) { wantListening = false; try { rec?.stop() } catch {} ; rec = null; if (!silent) listening.value = false }

// ── Camera and the face check (video) ──
const camEl = ref(null), camOn = ref(false), camError = ref(false), face = ref('')   // '' unknown · 'in' · 'out'
let stream = null, detector = null, faceTimer = 0, misses = 0
async function startMedia() {
  if (mode.value === 'text') return
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode.value === 'video' ? { facingMode: 'user', width: 640, height: 480 } : false })
    try { const ctx = audioCtx(); micAnalyser = ctx.createAnalyser(); micAnalyser.fftSize = 512; ctx.createMediaStreamSource(new MediaStream(stream.getAudioTracks())).connect(micAnalyser) } catch {}
    if (mode.value === 'video') {
      camOn.value = true; camError.value = false
      await nextTick(); if (camEl.value) camEl.value.srcObject = new MediaStream(stream.getVideoTracks())
      startFaceCheck()
    }
  } catch { camError.value = mode.value === 'video'; camOn.value = false }
}
async function startFaceCheck() {
  try {
    const { FilesetResolver, FaceDetector } = await import('@mediapipe/tasks-vision')
    const files = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
    detector = await FaceDetector.createFromOptions(files, { baseOptions: { modelAssetPath: '/mediapipe/blaze_face_short_range.tflite' }, runningMode: 'VIDEO', minDetectionConfidence: 0.5 })
  } catch (e) { console.warn('[interview] face check unavailable:', e?.message); return }
  const tick = () => {
    const v = camEl.value
    if (!detector || !v || !camOn.value || v.readyState < 2) { faceTimer = setTimeout(tick, 400); return }
    let ok = false
    try {
      const r = detector.detectForVideo(v, performance.now())
      const b = r.detections?.[0]?.boundingBox
      if (b) {
        const W = v.videoWidth || 640, H = v.videoHeight || 480
        const cx = (b.originX + b.width / 2) / W, cy = (b.originY + b.height / 2) / H
        ok = r.detections.length >= 1 && cx > 0.18 && cx < 0.82 && cy > 0.15 && cy < 0.85 && b.width / W > 0.12
      }
    } catch {}
    misses = ok ? 0 : misses + 1
    face.value = ok ? 'in' : misses >= 3 ? 'out' : face.value
    faceTimer = setTimeout(tick, 250)
  }
  tick()
}
function stopMedia() {
  clearTimeout(faceTimer); try { detector?.close() } catch {} ; detector = null; face.value = ''
  stream?.getTracks().forEach(tr => tr.stop()); stream = null; camOn.value = false; micAnalyser = null
}
function toggleCam() {
  const tr = stream?.getVideoTracks()[0]
  if (tr) { tr.enabled = !tr.enabled; camOn.value = tr.enabled; if (!tr.enabled) face.value = '' }
}

// ── Full screen ──
function enterFull() { try { document.documentElement.requestFullscreen?.() } catch {} }
function leaveFull() { try { if (document.fullscreenElement) document.exitFullscreen?.() } catch {} }

// ── The interview ──
function body() {
  const { photo, coverLetter, interviewPrep, ...cv } = JSON.parse(JSON.stringify(store.data))
  return { cv, jobOffer: store.data.jobOffer || '', role: role.value.trim(), difficulty: level.value, lang: ivLang.value, uiLang: uiLang.value, turns: turns.value }
}
async function post(path) {
  const r = await fetch(apiUrl(path), { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body()) })
  const j = await r.json().catch(() => ({}))
  if (r.status === 402) { close(); gate.value = 'pass'; throw Object.assign(new Error(''), { quiet: true }) }
  if (!r.ok) throw Object.assign(new Error(j.error || 'AI is unavailable right now. Please try again in a moment.'), { quiet: r.status === 429 })
  return j
}
async function ask() {
  thinking.value = true; error.value = ''
  try {
    const j = await post('/api/ai/interview/next')
    shownRole.value = j.role || shownRole.value
    qn.value = j.n; total.value = j.total; done.value = !!j.done
    current.value = j.question; lastSay.value = j.say
    thinking.value = false
    await speak(j.say)
    if (done.value) { await new Promise(r => setTimeout(r, 500)); return makeReport() }
    if (mode.value !== 'text' && canListen && stage.value === 'session') listen()
    else nextTick(() => taEl.value?.focus())
  } catch (e) { thinking.value = false; if (!e.quiet) error.value = e.message }
}
async function start() {
  error.value = ''; gate.value = ''
  if (!auth.isLoggedIn && !(await requireAccount?.('interview'))) return
  if (auth.user?.campus && !auth.user?.campusActive && !auth.user?.pass) { gate.value = 'confirm'; return }
  if (!auth.user?.pass && !auth.user?.campusActive) { gate.value = 'pass'; return }
  enterFull()
  turns.value = []; draft.value = ''; done.value = false; report.value = null; qn.value = 0; lastSay.value = ''
  shownRole.value = role.value.trim(); serverVoice = ivLang.value === 'en'
  window.speechSynthesis?.getVoices?.()
  try { audioCtx().resume() } catch {}
  stage.value = 'session'
  cancelAnimationFrame(raf); meter()
  startMedia()          // the camera and mic join when allowed; the interview doesn't wait
  await ask()
}
async function send() {
  const a = draft.value.trim()
  if (!a || thinking.value || done.value) return
  stopListening()
  turns.value.push({ q: current.value, a })
  draft.value = ''; nextTick(grow)
  await ask()
}
async function askEnd() {
  const answered = turns.value.some(x => x.a)
  const sure = confirmBox ? await confirmBox({ title: t('End the interview?'), message: t(answered ? 'You’ll get a report on what you answered.' : 'Nothing has been answered yet.'), ok: t('End'), cancel: t('Keep going'), mode: 'danger' }) : true
  if (!sure) return
  if (answered) makeReport(); else { close(); stage.value = 'intro' }
}
function close() { speakToken++; stopListening(); stopVoice(); stopMedia(); cancelAnimationFrame(raf); vol.value = 0; leaveFull() }
async function makeReport() {
  close()
  stage.value = 'report'; report.value = null; error.value = ''
  try { report.value = await post('/api/ai/interview/report') } catch (e) { if (!e.quiet) error.value = e.message }
}
// The header's ×: back where they came from in the app, or My CVs
const router = useRouter()
function leave() { if (window.history.state?.back) router.back(); else router.push('/') }
function reset() { close(); stage.value = 'intro'; turns.value = []; report.value = null; error.value = ''; draft.value = '' }
onBeforeUnmount(() => { close(); try { actx?.close() } catch {} })
</script>

<style scoped>
/* ── The glow behind everything (soft, slow, a little alive) ── */
.iv-page{position:relative;background:#fff;overflow:hidden;min-height:100%}
.iv-aura{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0}
.iv-aura i{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55}
.iv-aura .a1{width:46vw;height:46vw;max-width:620px;max-height:620px;left:12%;top:18%;background:#a78bfa;animation:ivDrift1 18s ease-in-out infinite alternate}
.iv-aura .a2{width:40vw;height:40vw;max-width:560px;max-height:560px;right:10%;top:26%;background:#f472b6;animation:ivDrift2 22s ease-in-out infinite alternate}
.iv-aura .a3{width:30vw;height:30vw;max-width:420px;max-height:420px;left:42%;bottom:-6%;background:#fdba74;opacity:.35;animation:ivDrift1 26s ease-in-out infinite alternate-reverse}
.iv-lines{position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 63px,rgba(255,255,255,.55) 63px 64px);-webkit-mask:radial-gradient(70% 60% at 50% 55%,#000 30%,transparent 75%);mask:radial-gradient(70% 60% at 50% 55%,#000 30%,transparent 75%)}
@keyframes ivDrift1{to{transform:translate(8%,6%) scale(1.08)}}
@keyframes ivDrift2{to{transform:translate(-9%,-5%) scale(.94)}}

.iv-tag{display:inline-flex;align-items:center;gap:8px;height:30px;padding:0 13px;border-radius:99px;background:rgba(255,255,255,.75);box-shadow:inset 0 0 0 1px rgba(20,20,43,.08);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font-size:13px;font-weight:600;color:#3b3b55}
.iv-live{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18);animation:ivBlink 2.4s ease-in-out infinite}
@keyframes ivBlink{50%{opacity:.45}}
.iv-grad,.iv-h1{background:linear-gradient(92deg,#7c3aed 0%,#c026d3 45%,#ec4899 100%);-webkit-background-clip:text;background-clip:text;color:transparent}

/* ── Intro ── */
.iv-head{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:calc(18px + env(safe-area-inset-top)) clamp(16px,3vw,32px) 0}
.iv-brand{display:inline-flex;text-decoration:none}
.iv-intro{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:7vh 0 64px}
.iv-hero{display:flex;flex-direction:column;align-items:center}
.iv-h1{font-size:clamp(40px,6vw,72px);font-weight:700;letter-spacing:-.045em;line-height:1.02;margin:22px 0 0}
.iv-sub{font-size:18px;color:#4a4a63;margin:14px 0 0}
.iv-facts{display:none}
/* the card sits on the page (an outline, no shadow) */
.iv-glass{width:min(640px,100%);margin-top:44px;padding:20px;border-radius:28px;background:#fff;box-shadow:inset 0 0 0 1px #e8e8ee}
/* computers: the words on the left, the card on the right */
@media (min-width:1024px){
  .iv-intro{flex-direction:row;justify-content:center;gap:clamp(48px,7vw,112px);text-align:left;min-height:calc(100vh - 140px);padding:24px clamp(32px,5vw,80px) 72px}
  .iv-hero{flex:1;max-width:580px;align-items:flex-start}
  .iv-h1{font-size:clamp(56px,5.6vw,84px)}
  .iv-sub{font-size:19px}
  .iv-facts{display:flex;flex-direction:column;gap:14px;margin:36px 0 0;padding:0;list-style:none}
  .iv-facts li{display:flex;align-items:center;gap:14px;font-size:15.5px;font-weight:500;color:#3b3b55}
  .iv-facts svg{width:19px;height:19px;padding:10px;box-sizing:content-box;flex-shrink:0;border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1px #e8e8ee;fill:none;stroke:var(--c-accent);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .iv-glass{width:480px;flex-shrink:0;margin-top:0;padding:22px}
  .iv-glass .iv-chips{justify-content:stretch}
  .iv-glass .iv-chip-job{flex:1 1 100%}
  .iv-glass .iv-levels{flex:1}.iv-glass .iv-levels button{flex:1}
}
.iv-dock{display:flex;gap:4px;padding:5px;border-radius:99px;background:#fff;box-shadow:inset 0 0 0 1px #e8e8ee}
.iv-dock-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:9px;height:52px;border:none;border-radius:99px;background:none;font:inherit;font-size:15.5px;font-weight:600;color:#55556f;cursor:pointer;transition:background .25s,color .25s,box-shadow .25s}
.iv-dock-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.iv-dock-btn:hover{color:#14142b}
.iv-dock-btn.on{background:var(--c-accent-lt);color:var(--c-accent)}
.iv-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;justify-content:center}
.iv-chip{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 14px;border-radius:99px;background:#fff;box-shadow:inset 0 0 0 1px #e8e8ee;font-size:14px;color:#14142b}
.iv-chip svg{width:16px;height:16px;fill:none;stroke:#8b8ba3;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.iv-chip input,.iv-chip select{border:none;background:none;font:inherit;font-size:14px;color:#14142b;outline:none;min-width:0}
.iv-chip-job{flex:1 1 220px}.iv-chip-job input{flex:1}
.iv-chip select{cursor:pointer}
.iv-levels{padding:4px;gap:2px}
.iv-levels button{height:34px;padding:0 13px;border:none;border-radius:99px;background:none;font:inherit;font-size:13.5px;font-weight:600;color:#6b6b84;cursor:pointer}
.iv-levels button.on{background:var(--c-accent-lt);color:var(--c-accent)}
.iv-go{display:inline-flex;align-items:center;justify-content:center;gap:10px;width:100%;height:54px;margin-top:16px;border:none;border-radius:99px;background:#14142b;color:#fff;font:inherit;font-size:16.5px;font-weight:600;cursor:pointer;transition:transform .2s,background .2s}
.iv-go:hover{background:#000}
.iv-go:disabled{opacity:.7;cursor:default;transform:none}
.iv-go svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.iv-go.sm{width:auto;height:40px;padding:0 18px;margin:0;font-size:14px}
.iv-spin{width:16px;height:16px;border:2px solid #fff;border-right-color:transparent;border-radius:50%;animation:ivSpin .8s linear infinite}
@keyframes ivSpin{to{transform:rotate(360deg)}}
.iv-fine{margin:12px 0 0;font-size:12.5px;color:#8b8ba3}
.iv-err{color:#e11d48;font-size:13.5px;margin:10px 0 0}
.iv-gate{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;padding:14px 16px;border-radius:22px;background:rgba(255,255,255,.85);box-shadow:inset 0 0 0 1px #e9d5ff;text-align:left}
.iv-gate b{font-size:15px;color:#14142b}
.iv-link{border:none;background:none;font:inherit;font-size:15px;font-weight:600;color:#7c3aed;cursor:pointer}

/* ── The orb: CVM ── */
.iv-orb{--lv:0;position:relative;display:block;width:clamp(150px,22vw,220px);aspect-ratio:1;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,#fff 0%,#f5d0fe 18%,#c084fc 45%,#ec4899 78%,#fb923c 100%);
  box-shadow:0 0 calc(40px + var(--lv) * 90px) calc(var(--lv) * 30px) rgba(192,38,211,.45),inset -18px -22px 50px rgba(124,58,237,.35);
  transform:scale(calc(1 + var(--lv) * .12));transition:transform .08s linear;animation:ivBreathe 5s ease-in-out infinite}
.iv-orb i{position:absolute;inset:-14px;border-radius:50%;box-shadow:0 0 0 1px rgba(192,38,211,.25);opacity:0}
.iv-orb.speaking i{animation:ivRipple 1.8s ease-out infinite}
.iv-orb.listening{background:radial-gradient(circle at 35% 30%,#fff 0%,#e0e7ff 18%,#a5b4fc 45%,#8b5cf6 80%,#c084fc 100%)}
.iv-orb.thinking{animation:ivBreathe 1.6s ease-in-out infinite,ivSpinHue 3s linear infinite}
.iv-orb.sm{width:96px}
@keyframes ivBreathe{50%{filter:saturate(1.15) brightness(1.04)}}
@keyframes ivRipple{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.5);opacity:0}}
@keyframes ivSpinHue{to{filter:hue-rotate(40deg)}}

/* ── Full screen interview ── */
.iv-full{position:fixed;inset:0;z-index:3000;background:#fff;display:flex;flex-direction:column;overflow:hidden;animation:ivIn .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes ivIn{from{opacity:0;transform:scale(1.02)}}
.iv-bar{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:calc(16px + env(safe-area-inset-top)) 22px 0}
.iv-steps{display:flex;gap:6px}
.iv-steps i{width:22px;height:5px;border-radius:99px;background:rgba(20,20,43,.1);transition:background .4s,width .4s}
.iv-steps i.on{background:linear-gradient(90deg,#7c3aed,#ec4899)}
.iv-steps i.now{width:36px}
.iv-x{width:42px;height:42px;border:none;border-radius:50%;background:rgba(255,255,255,.8);box-shadow:inset 0 0 0 1px rgba(20,20,43,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#3b3b55}
.iv-x svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
.iv-center{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;padding:0 24px 120px;text-align:center}
.iv-cap{margin:0;max-width:760px;font-size:clamp(20px,2.4vw,28px);line-height:1.4;font-weight:550;letter-spacing:-.015em;color:#14142b}
.iv-heard{margin:-14px 0 0;max-width:640px;font-size:16px;line-height:1.5;color:#55556f;min-height:24px}
.iv-heard.dim{color:#a3a3b8}
.iv-cap-enter-active,.iv-cap-leave-active{transition:opacity .35s,transform .35s}
.iv-cap-enter-from{opacity:0;transform:translateY(10px)}.iv-cap-leave-to{opacity:0;transform:translateY(-6px)}

/* the person, in a circle */
.iv-me{position:absolute;z-index:2;right:28px;bottom:120px;width:clamp(130px,16vw,190px);aspect-ratio:1;border-radius:50%;overflow:hidden;background:#0f0f14;box-shadow:0 0 0 4px #fff,0 0 0 7px #22c55e,0 20px 50px -20px rgba(20,20,43,.45);transition:box-shadow .3s}
.iv-me.out{box-shadow:0 0 0 4px #fff,0 0 0 7px #ef4444,0 0 40px 6px rgba(239,68,68,.45)}
.iv-me:not(.in):not(.out){box-shadow:0 0 0 4px #fff,0 0 0 7px rgba(20,20,43,.12),0 20px 50px -20px rgba(20,20,43,.45)}
.iv-me video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.iv-me-off{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#d4d4dc;font-size:13px}
.iv-me-tip{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);white-space:nowrap;padding:4px 10px;border-radius:99px;background:#ef4444;color:#fff;font-size:11.5px;font-weight:650}

/* the floating dock / answer bar */
.iv-float{position:absolute;z-index:3;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(680px,calc(100% - 32px));display:flex;justify-content:center}
.iv-dock-live{width:auto;gap:8px;padding:8px;background:#fff;box-shadow:inset 0 0 0 1px #e8e8ee,0 16px 40px -24px rgba(20,20,43,.25)}
.iv-dock-btn.round{flex:none;width:52px;height:52px;padding:0}
.iv-dock-btn.round.on{background:#22c55e;color:#fff;box-shadow:0 0 0 6px rgba(34,197,94,.18)}
.iv-dock-btn.round.off{background:#ef4444;color:#fff}
.iv-dock-btn:disabled{opacity:.4;cursor:default}
.iv-done{height:52px;padding:0 26px;border:none;border-radius:99px;background:#14142b;color:#fff;font:inherit;font-size:15.5px;font-weight:650;cursor:pointer}
.iv-done:disabled{opacity:.4;cursor:default}
.iv-type{display:flex;align-items:flex-end;gap:8px;width:100%;padding:8px 8px 8px 20px;border-radius:30px;background:#fff;box-shadow:inset 0 0 0 1px #e8e8ee,0 16px 40px -24px rgba(20,20,43,.25)}
.iv-type textarea{flex:1;min-width:0;border:none;background:none;resize:none;font:inherit;font-size:16px;line-height:1.45;color:#14142b;outline:none;padding:10px 0;max-height:160px}
.iv-send{width:44px;height:44px;flex-shrink:0;border:none;border-radius:50%;background:#14142b;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
.iv-send:disabled{opacity:.35;cursor:default}
.iv-send svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.iv-err-float{position:absolute;z-index:3;left:0;right:0;bottom:96px;text-align:center}

/* ── Report ── */
.iv-report{position:relative;z-index:1;max-width:820px;margin:0 auto;padding:7vh 0 64px}
.iv-loading{display:flex;flex-direction:column;align-items:center;gap:22px;padding:14vh 0;text-align:center}
.iv-loading b{font-size:20px;color:#14142b}
.iv-rep-top{display:flex;align-items:center;gap:28px;padding:22px;border-radius:30px;background:#fff;box-shadow:inset 0 0 0 1px #e8e8ee}
.iv-ring{--p:0;width:118px;height:118px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(closest-side,#fff 80%,transparent 81% 100%),conic-gradient(#7c3aed,#ec4899 calc(var(--p)*1%),rgba(20,20,43,.08) 0)}
.iv-ring b{font-size:38px;font-weight:700;letter-spacing:-.04em;color:#14142b}
.iv-rep-sum{margin:12px 0 0;font-size:17px;line-height:1.5;color:#3b3b55}
.iv-pills{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 22px}
.iv-pill{padding:8px 14px;border-radius:99px;font-size:13.5px;font-weight:550;background:#fff;box-shadow:inset 0 0 0 1px rgba(20,20,43,.08)}
.iv-pill.good::before{content:'+ ';color:#16a34a;font-weight:800}
.iv-pill.work::before{content:'→ ';color:#c026d3;font-weight:800}
.iv-q{margin-bottom:10px;border-radius:22px;background:#fff;box-shadow:inset 0 0 0 1px #e8e8ee}
.iv-q summary{display:flex;align-items:center;gap:14px;padding:16px 18px;cursor:pointer;list-style:none}
.iv-q summary::-webkit-details-marker{display:none}
.iv-q-t{flex:1;font-size:15px;font-weight:600;color:#14142b;line-height:1.4}
.iv-bars{display:flex;gap:3px;flex-shrink:0}
.iv-bars i{width:6px;height:16px;border-radius:3px;background:rgba(20,20,43,.1)}
.iv-bars i.on{background:linear-gradient(180deg,#c026d3,#7c3aed)}
.iv-q-body{padding:0 18px 18px}
.iv-q-body p{margin:0 0 10px;font-size:14.5px;line-height:1.55;color:#4a4a63}
.iv-q-you{font-style:italic;color:#8b8ba3!important}
.iv-better{padding:12px 14px;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1px #e9e3fb;color:#14142b!important}
.iv-better b{color:var(--c-accent);margin-right:4px}
.iv-acts{display:flex;align-items:center;gap:22px;margin-top:22px}
.iv-acts .iv-go{width:auto;padding:0 34px;margin:0}

@media (max-width:640px){
  .iv-intro{padding-top:5vh}
  .iv-sub{font-size:16px}
  .iv-glass{padding:14px;border-radius:26px;margin-top:30px}
  .iv-dock-btn{height:48px;font-size:14.5px;gap:7px}
  .iv-chip-job{flex-basis:100%}
  .iv-center{gap:26px;padding-bottom:150px}
  .iv-me{right:14px;top:calc(70px + env(safe-area-inset-top));bottom:auto;width:104px}
  .iv-me-tip{font-size:10px;padding:3px 8px}
  .iv-rep-top{flex-direction:column;align-items:flex-start;gap:16px}
}
@media (prefers-reduced-motion:reduce){ .iv-aura i,.iv-orb,.iv-orb i,.iv-live{animation:none} }
</style>
