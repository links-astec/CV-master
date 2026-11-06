<template>
  <!-- CVM as a person, for a video interview at the Real level: a drawn interviewer in a call. Everything is vector and
       moved from here: the mouth follows the voice level, plus blinking, small head movements and glances. -->
  <div class="cvm-av" aria-hidden="true">
  <!-- The room, out of focus: its own layer, since it never changes and blur is slow to redraw -->
  <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="avWall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef3fd"/><stop offset="1" stop-color="#d9e3f8"/></linearGradient>
      <linearGradient id="avWindow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6eeff"/></linearGradient>
      <filter id="avSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    <rect width="640" height="480" fill="url(#avWall)"/>
    <g filter="url(#avSoft)">
      <rect x="28" y="36" width="168" height="250" rx="6" fill="url(#avWindow)"/>
      <rect x="108" y="36" width="7" height="250" fill="#cfdaf2"/>
      <rect x="470" y="96" width="150" height="9" fill="#b9c7e6"/>
      <rect x="486" y="52" width="16" height="44" fill="#6f86c9"/><rect x="506" y="62" width="13" height="34" fill="#9fb1df"/><rect x="523" y="48" width="18" height="48" fill="#4f67b3"/>
      <circle cx="584" cy="74" r="20" fill="#7fae8e"/>
    </g>
  </svg>
  <svg viewBox="80 40 480 360" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="avSkin" x1=".25" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#a06a48"/><stop offset=".6" stop-color="#8c5a3b"/><stop offset="1" stop-color="#744730"/></linearGradient>
      <linearGradient id="avNeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f3926"/><stop offset=".55" stop-color="#7b4c32"/><stop offset="1" stop-color="#855437"/></linearGradient>
      <linearGradient id="avJacket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#23357f"/><stop offset="1" stop-color="#16225a"/></linearGradient>
      <radialGradient id="avCheek"><stop offset="0" stop-color="#b5563f" stop-opacity=".15"/><stop offset="1" stop-color="#b5563f" stop-opacity="0"/></radialGradient>
      <clipPath id="avEyeL"><path :d="eyePath(286)"/></clipPath>
      <clipPath id="avEyeR"><path :d="eyePath(354)"/></clipPath>
      <clipPath id="avMouth"><path ref="mouthClip"/></clipPath>
    </defs>

    <g ref="body">
      <!-- Jacket, blouse, neck -->
      <path d="M92 500C96 420 170 376 272 346L368 346C470 376 544 420 548 500Z" fill="url(#avJacket)"/>
      <path d="M276 344L320 452L364 344L344 326H296Z" fill="#f7f8fe"/>
      <path d="M284 280L284 342C296 372 344 372 356 342L356 280Z" fill="url(#avNeck)"/>
      <path d="M272 346L238 368L296 500H320L320 452Z" fill="#2c3f90"/>
      <path d="M368 346L402 368L344 500H320L320 452Z" fill="#2c3f90"/>
      <path d="M286 358C300 386 340 386 354 358" fill="none" stroke="#d9a441" stroke-width="1.8" opacity=".9"/>
    </g>

    <g ref="head">
      <!-- Short natural hair: soft curls around the head -->
      <g fill="#1d1410">
        <ellipse cx="320" cy="146" rx="92" ry="80"/>
        <circle v-for="(c, i) in CURLS" :key="i" :cx="c.x" :cy="c.y" :r="c.r"/>
      </g>
      <!-- Ears, earrings -->
      <ellipse cx="240" cy="206" rx="10" ry="18" fill="#7f5035"/><ellipse cx="400" cy="206" rx="10" ry="18" fill="#7f5035"/>
      <circle cx="240" cy="228" r="4" fill="#e0b04e"/><circle cx="400" cy="228" r="4" fill="#e0b04e"/>

      <path ref="face" fill="url(#avSkin)"/>
      <!-- The hairline -->
      <path d="M240 186C232 120 272 86 320 86C368 86 408 120 400 186C394 158 380 140 356 134C334 129 306 129 284 134C260 140 246 158 240 186Z" fill="#1d1410"/>
      <path d="M268 112C288 96 322 92 348 100" fill="none" stroke="#3c2b23" stroke-width="7" stroke-linecap="round" opacity=".28"/>

      <ellipse cx="272" cy="232" rx="28" ry="20" fill="url(#avCheek)"/><ellipse cx="368" cy="232" rx="28" ry="20" fill="url(#avCheek)"/>

      <!-- Eyebrows -->
      <g ref="brows" fill="none" stroke="#241712" stroke-width="4.6" stroke-linecap="round">
        <path d="M266 171C276 164 292 163 305 169"/><path d="M374 171C364 164 348 163 335 169"/>
      </g>

      <!-- Eyes: the iris moves inside, a lid closes over them -->
      <g v-for="e in EYES" :key="e.id">
        <path :d="eyePath(e.x)" fill="#fbf8f4"/>
        <g :clip-path="`url(#${e.id})`">
          <g :ref="(el) => { if (el) irises[e.id] = el }">
            <circle :cx="e.x" cy="190" r="9" fill="#2e1b12"/><circle :cx="e.x" cy="190" r="4.6" fill="#0b0605"/>
            <circle :cx="e.x + 3" cy="187" r="2.1" fill="#fff"/>
          </g>
          <rect :ref="(el) => { if (el) lids[e.id] = el }" :x="e.x - 24" y="154" width="48" height="24" fill="#845338"/>
        </g>
        <path :ref="(el) => { if (el) lashes[e.id] = el }" :d="lidPath(e.x)" fill="none" stroke="#17100d" stroke-width="3.4" stroke-linecap="round"/>
      </g>

      <!-- Nose -->
      <path d="M314 234C316 240 324 240 326 234" fill="none" stroke="#5c3522" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M309 228C306 233 309 237 313 236M331 228C334 233 331 237 327 236" fill="none" stroke="#6a402a" stroke-width="2" stroke-linecap="round" opacity=".45"/>

      <!-- Mouth: shapes rewritten every frame -->
      <path ref="inner" fill="#3b1114"/>
      <g clip-path="url(#avMouth)">
        <path ref="teeth" fill="#ece6dd"/>
        <ellipse ref="tongue" cx="320" rx="16" ry="8" fill="#a8474a"/>
      </g>
      <path ref="lipTop" fill="#6d2c2c"/>
      <path ref="lipBottom" fill="#823a38"/>
    </g>
  </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  state: { type: String, default: 'idle' },   // idle | speaking | listening | thinking
  level: { type: Number, default: 0 },        // CVM's voice right now, 0 to 1
})

const EYES = [{ id: 'avEyeL', x: 286 }, { id: 'avEyeR', x: 354 }]
const eyePath = (x) => `M${x - 18} 192C${x - 10} 179 ${x + 9} 178 ${x + 18} 191C${x + 9} 199 ${x - 9} 200 ${x - 18} 192Z`
const lidPath = (x) => `M${x - 20} 193C${x - 10} 178 ${x + 9} 177 ${x + 20} 191`
// Curls along the hair's edge, fixed so the outline stays the same from frame to frame
const CURLS = Array.from({ length: 34 }, (_, i) => {
  const a = Math.PI * (1.02 + i / 33 * 0.96), wob = (i * 7 % 5) - 2
  return { x: 320 + Math.cos(a) * (84 + wob), y: 146 + Math.sin(a) * (72 + wob), r: 13 + (i * 5 % 4) }
})

const body = ref(null), head = ref(null), face = ref(null), brows = ref(null)
const inner = ref(null), teeth = ref(null), tongue = ref(null), lipTop = ref(null), lipBottom = ref(null), mouthClip = ref(null)
const irises = {}, lids = {}, lashes = {}

// The face and mouth for this much opening (0-1) and width (0 narrow, 1 wide)
function drawMouth(open, wide) {
  const smile = 4.5 * (1 - open)               // the corners lift when the mouth is at rest
  const w = 25 + wide * 6 - open * 3, y = 261   // half width, centre line
  const L = 320 - w, R = 320 + w, cy = y - smile
  const gap = open * 19                         // how far the lips part
  const upIn = y - gap * .18, lowIn = y + gap * .82
  const shape = (d) => d.replace(/\s+/g, ' ')
  // the opening between the lips
  const hole = shape(`M${L + 3} ${cy} C${L + 12} ${upIn - 1} ${R - 12} ${upIn - 1} ${R - 3} ${cy} C${R - 10} ${lowIn} ${L + 10} ${lowIn} ${L + 3} ${cy} Z`)
  inner.value.setAttribute('d', hole)
  mouthClip.value.setAttribute('d', hole)
  // the upper teeth show as the mouth opens, the tongue rests below
  teeth.value.setAttribute('d', `M${L} ${upIn - 4} H${R} V${upIn + Math.min(5.5, gap * .32)} H${L} Z`)
  tongue.value.setAttribute('cy', String(lowIn + 3))
  // lips: a cupid's bow above, a fuller curve below
  lipTop.value.setAttribute('d', shape(`M${L} ${cy} C${L + 9} ${y - 9} ${320 - 9} ${y - 12} 320 ${y - 7.5} C${320 + 9} ${y - 12} ${R - 9} ${y - 9} ${R} ${cy} C${R - 11} ${upIn + .6} ${L + 11} ${upIn + .6} ${L} ${cy} Z`))
  lipBottom.value.setAttribute('d', shape(`M${L} ${cy} C${L + 11} ${lowIn} ${R - 11} ${lowIn} ${R} ${cy} C${R - 9} ${lowIn + 13} ${L + 9} ${lowIn + 13} ${L} ${cy} Z`))
  // the jaw comes down a little with the mouth
  const c = 306 + open * 7
  face.value.setAttribute('d', `M242 170C242 112 398 112 398 170C400 218 396 256 372 282C354 ${c - 6} 336 ${c} 320 ${c}C304 ${c} 286 ${c - 6} 268 282C244 256 240 218 242 170Z`)
}

const HEAD_DOWN = 16
let raf = 0
onMounted(() => {
  head.value.setAttribute('transform', `translate(0 ${HEAD_DOWN})`)
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  let t = Math.random() * 50, last = performance.now()
  let open = 0, wide = .55, sway = 0, raise = 0, quiet = 0
  let nextBlink = 1.5, blinkAt = -1
  let gazeX = 0, gazeY = 0, toX = 0, toY = 0, nextGaze = 1
  const frame = (now) => {
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt
    const talking = props.state === 'speaking'
    // Talking but no sound level for a moment (some browsers can't give one): a speech rhythm instead
    quiet = talking && (props.level || 0) < .02 ? quiet + dt : 0
    const lv = quiet > .7 ? .42 + .2 * Math.sin(t * 3.1) : Math.min(1, props.level || 0)

    // Mouth: the voice level opens it, broken into syllables so it never just hangs open
    const syllable = .55 + .45 * Math.abs(Math.sin(t * 8.7 + Math.sin(t * 2.9) * 1.6))
    const wantOpen = talking ? Math.min(1, lv * 1.5) * syllable : 0
    const wantWide = talking ? .5 + .4 * Math.sin(t * 4.9 + Math.sin(t * 1.7) * 2) : .7
    open += (wantOpen - open) * Math.min(1, dt * 24)
    wide += (wantWide - wide) * Math.min(1, dt * 10)
    drawMouth(open, wide)

    // Blink every few seconds
    if (t > nextBlink) { blinkAt = t; nextBlink = t + 1.8 + Math.random() * 3.8 }
    const b = blinkAt < 0 ? 0 : Math.max(0, 1 - Math.abs((t - blinkAt) - .07) / .07)
    for (const e of EYES) {
      lids[e.id]?.setAttribute('transform', `translate(0 ${b * 20})`)
      lashes[e.id]?.setAttribute('transform', `translate(0 ${b * 8})`)
    }

    // Looks at you, with small glances; up and aside while thinking
    if (t > nextGaze) {
      nextGaze = t + 1.2 + Math.random() * 2.6
      toX = props.state === 'thinking' ? 4.5 : (Math.random() - .5) * (talking ? 4 : 2.5)
      toY = props.state === 'thinking' ? -4 : (Math.random() - .5) * 1.6
    }
    gazeX += (toX - gazeX) * Math.min(1, dt * 16); gazeY += (toY - gazeY) * Math.min(1, dt * 16)
    for (const e of EYES) irises[e.id]?.setAttribute('transform', `translate(${gazeX.toFixed(2)} ${gazeY.toFixed(2)})`)

    if (!still) {
      // The head: a slow sway, more alive while talking, a small tilt while listening
      const lively = talking ? 1 : .45
      const wantTilt = props.state === 'listening' ? 2.2 : props.state === 'thinking' ? -1.6 : 0
      sway += (wantTilt - sway) * Math.min(1, dt * 2)
      const rot = sway + Math.sin(t * .73) * 1.1 * lively + Math.sin(t * 1.9 + 1) * .5 * lively
      const nod = Math.sin(t * 1.3) * 1.1 * lively + lv * 2 * (talking ? 1 : 0)
      head.value.setAttribute('transform', `translate(${(Math.sin(t * .5) * 1.5).toFixed(2)} ${(HEAD_DOWN + nod).toFixed(2)}) rotate(${rot.toFixed(2)} 320 300)`)
      body.value.setAttribute('transform', `translate(${(Math.sin(t * .5) * .8).toFixed(2)} ${(Math.sin(t * 1.35) * 1.5).toFixed(2)})`)
      raise += ((talking ? lv * 3.5 : props.state === 'thinking' ? 2.5 : 0) - raise) * Math.min(1, dt * 8)
      brows.value.setAttribute('transform', `translate(0 ${(-raise).toFixed(2)})`)
    }
    raf = requestAnimationFrame(frame)
  }
  drawMouth(0, .7)
  raf = requestAnimationFrame(frame)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.cvm-av{position:relative;display:block;width:100%;height:100%}
.cvm-av svg{position:absolute;inset:0;display:block;width:100%;height:100%}
</style>
