<template>
  <!-- CVM, the AI interviewer: a glossy blue blob that keeps changing shape. Drawn by a small WebGL shader (a sphere
       bent by moving waves), moving with the voice while CVM talks. Without WebGL, a CSS blob instead. -->
  <span class="cvm-orb" :class="{ plain: !drawn }" aria-hidden="true"><canvas ref="canvas"></canvas></span>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  state: { type: String, default: 'idle' },   // idle | speaking | listening | thinking
  level: { type: Number, default: 0 },        // the sound right now, 0 to 1
})
const canvas = ref(null), drawn = ref(true)

const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;uniform float uT;uniform float uAmp;uniform float uPale;
// The shape: a sphere pushed in and out by waves that travel through it, so it folds and swells
float map(vec3 p){
  float a=uT*.22;float c=cos(a),s=sin(a);
  p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);
  vec3 q=p+.15*uAmp*vec3(sin(1.7*p.y+uT*.9),sin(1.9*p.z+uT*.7+1.),sin(1.6*p.x+uT*1.1+2.));
  float d=length(q)-1.;
  d+=uAmp*.15*sin(2.2*q.x+uT)*sin(1.9*q.y+uT*.8+1.3)*sin(2.3*q.z+uT*.6+.6);
  d+=uAmp*.03*sin(4.3*q.x+uT*1.4+2.)*sin(4.1*q.y+uT*1.2)*sin(4.6*q.z+uT+1.);
  return d*.8;
}
vec3 normalAt(vec3 p){
  vec2 e=vec2(.004,-.004);
  return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));
}
void main(){
  vec2 uv=(gl_FragCoord.xy*2.-uRes)/min(uRes.x,uRes.y);
  vec3 ro=vec3(0.,0.,3.4),rd=normalize(vec3(uv,-2.2));
  float t=1.9,near=1.;bool hit=false;
  for(int i=0;i<30;i++){
    float d=map(ro+rd*t);
    near=min(near,d);
    if(d<.002){hit=true;break;}
    t+=d;
    if(t>5.2)break;
  }
  // a soft edge, like the out-of-focus edge of a real object
  float alpha=hit?1.:1.-smoothstep(0.,.012,near);
  if(alpha<=0.){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*t,n=normalAt(p),l=normalize(vec3(-.55,.75,.6));
  float wrap=.5+.5*dot(n,l);
  float rim=pow(1.-max(dot(n,-rd),0.),2.4);
  vec3 deep=vec3(.0,.02,.6),mid=vec3(.01,.13,.93),light=vec3(.47,.68,1.);
  vec3 col=mix(deep,mid,smoothstep(.1,.5,wrap));
  // a broad, soft light on the upper side, swept by a slow streak
  float sweep=.5+.5*sin(p.x*2.3-p.y*1.4+uT*.5);
  col=mix(col,light,smoothstep(.52,.98,wrap)*(.62+.33*sweep));
  // the fold: a darker band that wanders across the lower part, with light catching its edge below
  float wave=p.y+.42+.17*sin(p.x*2.1+uT*.6)+.09*sin(p.x*4.+p.z*2.+uT*.9);
  float band=smoothstep(.3,.0,abs(wave));
  col=mix(col,deep,band*band*.62);
  col+=vec3(.0,.12,.5)*smoothstep(.0,-.2,wave)*smoothstep(-.42,-.2,wave)*.8;
  float crease=clamp(map(p+n*.2)/.14,0.,1.);
  col*=mix(.62,1.,crease);
  col+=light*rim*.22*smoothstep(.2,.7,wrap);
  col+=vec3(.8,.9,1.)*pow(max(dot(reflect(rd,n),l),0.),14.)*.16;
  col=mix(col,vec3(.62,.72,1.),uPale);
  gl_FragColor=vec4(col*alpha,alpha);
}`

// How much it moves in each state: the shape's depth and how fast it changes (voice adds to both)
const LOOK = {
  idle:      { amp: .5,  speed: .45, pale: 0 },
  speaking:  { amp: .8,  speed: .85, pale: 0 },
  listening: { amp: .6,  speed: .55, pale: .22 },
  thinking:  { amp: .42, speed: 1.3, pale: .1 },
}

let gl = null, raf = 0, stopWatching = null
function start() {
  const el = canvas.value
  gl = el.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' })
  if (!gl) { drawn.value = false; return }
  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s }
  const prog = gl.createProgram()
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG))
  gl.bindAttribLocation(prog, 0, 'a'); gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { drawn.value = false; return }
  gl.useProgram(prog)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  const U = Object.fromEntries(['uRes', 'uT', 'uAmp', 'uPale'].map(n => [n, gl.getUniformLocation(prog, n)]))

  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const size = () => {
    const px = Math.min(640, Math.round(el.clientWidth * Math.min(window.devicePixelRatio || 1, 2)))
    if (px && el.width !== px) { el.width = el.height = px; gl.viewport(0, 0, px, px) }
  }
  // Eased towards the state's values, so changing state or a loud syllable never jumps
  let time = Math.random() * 40, amp = LOOK.idle.amp, pale = 0, last = performance.now(), seen = true
  const frame = (now) => {
    const dt = Math.min(.05, (now - last) / 1000); last = now
    const look = LOOK[props.state] || LOOK.idle, lv = Math.min(1, props.level || 0)
    amp += (look.amp + lv * .35 - amp) * Math.min(1, dt * 7)
    pale += (look.pale - pale) * Math.min(1, dt * 4)
    if (!still) time += dt * (look.speed + lv * .9)
    size()
    gl.uniform2f(U.uRes, el.width, el.height); gl.uniform1f(U.uT, time); gl.uniform1f(U.uAmp, amp); gl.uniform1f(U.uPale, pale)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    raf = seen && !document.hidden && !still ? requestAnimationFrame(frame) : 0
  }
  raf = requestAnimationFrame(frame)
  // Off screen or in a background tab: nothing is drawn
  const resume = () => { if (!raf && seen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
  const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; resume() })
  io.observe(el)
  document.addEventListener('visibilitychange', resume)
  const lost = (e) => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; drawn.value = false }
  el.addEventListener('webglcontextlost', lost)
  stopWatching = () => { io.disconnect(); document.removeEventListener('visibilitychange', resume); el.removeEventListener('webglcontextlost', lost) }
}
onMounted(() => { try { start() } catch { drawn.value = false } })
onBeforeUnmount(() => {
  cancelAnimationFrame(raf); raf = 0; stopWatching?.()
  gl?.getExtension('WEBGL_lose_context')?.loseContext(); gl = null
})
</script>

<style scoped>
.cvm-orb{position:relative;display:block;aspect-ratio:1}
.cvm-orb canvas{display:block;width:100%;height:100%}
/* No WebGL: the same colours on a blob that morphs with CSS */
.cvm-orb.plain canvas{display:none}
.cvm-orb.plain::before{content:'';position:absolute;inset:14%;background:radial-gradient(circle at 34% 26%,#8fb4ff 0%,#2a55f5 34%,#0a22d8 66%,#02108f 100%);animation:cvmMorph 7s ease-in-out infinite}
@keyframes cvmMorph{
  0%,100%{border-radius:52% 48% 46% 54%/50% 54% 46% 50%;transform:rotate(0)}
  33%{border-radius:44% 56% 58% 42%/56% 44% 56% 44%;transform:rotate(12deg)}
  66%{border-radius:58% 42% 48% 52%/44% 58% 42% 56%;transform:rotate(-10deg)}
}
@media (prefers-reduced-motion:reduce){ .cvm-orb.plain::before{animation:none;border-radius:50%} }
</style>
