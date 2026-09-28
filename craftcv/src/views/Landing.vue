<template>
  <div class="lp" ref="rootEl">

    <!-- ═══ NAV ═══ -->
    <nav class="lp-nav" :class="{ 'lp-nav--solid': scrolled }">
      <div class="lp-wrap lp-nav__inner">
        <div class="lp-logo">
          <div class="lp-logo__mark">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><rect x="5" y="2" width="16" height="22" rx="2" fill="white" opacity="0.95"/><path d="M21 2 L27 8 L21 8 Z" fill="#1d49b8"/><path d="M21 2 L21 8 L27 8" fill="none" stroke="white" stroke-width="1.2" opacity="0.4"/><line x1="8" y1="13" x2="18" y2="13" stroke="#2a5bd7" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="17" x2="19" y2="17" stroke="#c0cef8" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="21" x2="16" y2="21" stroke="#c0cef8" stroke-width="1.5" stroke-linecap="round"/><rect x="6" y="25" width="14" height="6" rx="2" fill="#1a1a2e"/><text x="13" y="30" font-family="system-ui,sans-serif" font-weight="800" font-size="4.5" fill="#7aa3f5" text-anchor="middle" letter-spacing="1">CV</text></svg>
          </div>
          <span>CV<b>Master</b></span>
        </div>
        <div class="lp-nav__links">
          <a href="#how" @click.prevent="scrollTo('#how')">How it works</a>
          <a href="#templates" @click.prevent="scrollTo('#templates')">Templates</a>
          <a href="#pricing" @click.prevent="scrollTo('#pricing')">Pricing</a>
        </div>
        <button class="lp-nav__cta" @click="$emit('get-started')">Get started free</button>
        <button class="lp-burger" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
          <span :style="menuOpen ? 'transform:rotate(45deg) translate(5px,5px)' : ''"/>
          <span :style="menuOpen ? 'opacity:0' : ''"/>
          <span :style="menuOpen ? 'transform:rotate(-45deg) translate(5px,-5px)' : ''"/>
        </button>
      </div>
      <!-- Mobile menu -->
      <div class="lp-mob-menu" :class="{ open: menuOpen }">
        <a href="#how" @click.prevent="menuOpen=false; scrollTo('#how')">How it works</a>
        <a href="#templates" @click.prevent="menuOpen=false; scrollTo('#templates')">Templates</a>
        <a href="#pricing" @click.prevent="menuOpen=false; scrollTo('#pricing')">Pricing</a>
        <button class="lp-mob-cta" @click="menuOpen=false; $emit('get-started')">Get started free →</button>
      </div>
    </nav>

    <!-- ═══ HERO ═══ -->
    <section class="lp-hero">
      <div class="lp-hero__bg">
        <div class="lp-blob lp-blob--1"/>
        <div class="lp-blob lp-blob--2"/>
        <div class="lp-blob lp-blob--3"/>
        <div class="lp-grid"/>
      </div>
      <div class="lp-wrap lp-hero__inner">
        <div class="lp-hero__text">
          <div class="lp-chip">
            <span class="lp-chip__dot"/>
            107 templates · AI-powered · Free to start
          </div>
          <h1 class="lp-h1">Your career,<br><em>beautifully told.</em></h1>
          <p class="lp-hero__p">CVMaster builds professional CVs that pass ATS filters and impress hiring managers. Narrate your story in 5 minutes — AI builds your entire CV automatically.</p>
          <div class="lp-hero__btns">
            <button class="lp-btn lp-btn--dark" @click="$emit('get-started')">
              Build my CV free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:16px;height:16px;flex-shrink:0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <a href="#how" class="lp-btn lp-btn--ghost" @click.prevent="scrollTo('#how')">See how it works</a>
          </div>
          <div class="lp-proof">
            <span>Free to build · pay only when you export</span>
          </div>
        </div>
        <div class="lp-hero__visual">
          <div class="lp-browser">
            <div class="lp-browser__bar">
              <span class="lp-dot lp-dot--r"/><span class="lp-dot lp-dot--y"/><span class="lp-dot lp-dot--g"/>
              <div class="lp-browser__url">cvmaster.live</div>
            </div>
            <div class="lp-browser__screen">
              <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=560&h=340&q=85&fit=crop" alt="CV Builder" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"/>
            </div>
          </div>
          <div class="lp-fbadge lp-fbadge--1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:13px;height:13px;color:var(--c-green);flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>
            ATS job-match check
          </div>
          <div class="lp-fbadge lp-fbadge--2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px;color:var(--c-accent);flex-shrink:0"><path d="M12 2a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
            AI-written
          </div>
          <div class="lp-fbadge lp-fbadge--3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px;color:var(--c-amber);flex-shrink:0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>
            Instant PDF
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ HOW IT WORKS ═══ -->
    <section class="lp-sec" id="how">
      <div class="lp-wrap">
        <div class="lp-eyebrow">How it works</div>
        <h2 class="lp-h2">From story to hired,<br><em>in minutes.</em></h2>
        <div class="lp-steps">
          <div class="lp-step" v-for="(s,i) in steps" :key="i">
            <div class="lp-step__num">{{ String(i+1).padStart(2,'0') }}</div>
            <div class="lp-step__img">
              <img :src="s.img" :alt="s.title" loading="lazy"/>
              <div class="lp-step__icon" :style="{background:s.bg,color:s.color}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px" v-html="s.icon"/>
              </div>
            </div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TEMPLATES ═══ -->
    <section class="lp-sec lp-sec--alt" id="templates">
      <div class="lp-wrap">
        <div class="lp-eyebrow">107+ templates</div>
        <h2 class="lp-h2">Every role. Every ambition.</h2>
        <p class="lp-sub">Switch templates instantly — your content always follows.</p>
        <div class="lp-tgrid">
          <div class="lp-tcard" v-for="(t,i) in tpls" :key="i" @click="$emit('get-started')">
            <div class="lp-tcard__img">
              <img :src="t.img" :alt="t.name" loading="lazy"/>
              <div class="lp-tcard__hover"><span>Use template →</span></div>
            </div>
            <div class="lp-tcard__foot">
              <span class="lp-tcard__name">{{ t.name }}</span>
              <span class="lp-tcard__tag">{{ t.tag }}</span>
            </div>
          </div>
        </div>
        <div class="lp-tmore">
          <p>+99 more: Photo CV, Infographic, Academic, Magazine, Newspaper, Swiss and more</p>
          <button class="lp-btn lp-btn--dark" @click="$emit('get-started')">
            Browse all 107 templates
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:16px;height:16px;flex-shrink:0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══ FEATURES ═══ -->
    <section class="lp-sec">
      <div class="lp-wrap">
        <div class="lp-eyebrow">Features</div>
        <h2 class="lp-h2">Built different.<br><em>For real results.</em></h2>
        <div class="lp-fgrid">
          <div class="lp-feat lp-feat--big">
            <div class="lp-feat__content">
              <span class="lp-feat__badge">New</span>
              <h3>AI Narrate mode</h3>
              <p>Speak your career story for 2–5 minutes. AI extracts every detail — experience, skills, achievements — and builds your complete CV automatically. In English or French.</p>
              <button class="lp-btn lp-btn--dark lp-btn--sm" @click="$emit('get-started')">Try it free →</button>
            </div>
            <div class="lp-feat__img">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=320&q=85&fit=crop" alt="AI Narrate" loading="lazy"/>
              <div class="lp-mic">
                <div class="lp-mic__ring"/>
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" style="width:22px;height:22px;position:relative;z-index:1"><path d="M12 2a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
              </div>
            </div>
          </div>
          <div class="lp-feat lp-feat--sm" v-for="f in feats" :key="f.title">
            <div class="lp-feat__ic" :style="{background:f.bg,color:f.color}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px" v-html="f.icon"/>
            </div>
            <div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- ═══ PRICING ═══ -->
    <section class="lp-sec" id="pricing">
      <div class="lp-wrap">
        <div class="lp-eyebrow">Simple pricing</div>
        <h2 class="lp-h2">Pay only when<br>you're ready.</h2>
        <p class="lp-sub">Build and preview free. Only pay to download your clean PDF.</p>
        <div class="lp-pgrid">
          <div class="lp-pcard" v-for="(p,i) in plans" :key="i" :class="{featured:p.f}">
            <div class="lp-pbadge" v-if="p.f">Most popular</div>
            <div class="lp-pplan">{{ p.plan }}</div>
            <div class="lp-pamt">{{ p.price }}</div>
            <div class="lp-pdesc">{{ p.desc }}</div>
            <ul class="lp-plist">
              <li v-for="ft in p.items" :key="ft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:13px;height:13px;flex-shrink:0;color:var(--c-green)"><polyline points="20 6 9 17 4 12"/></svg>
                {{ ft }}
              </li>
            </ul>
            <button :class="['lp-btn', p.f ? 'lp-btn--white' : 'lp-btn--outline']" @click="$emit('get-started')">
              {{ p.cta }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:13px;height:13px;flex-shrink:0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ FINAL CTA ═══ -->
    <section class="lp-fcta">
      <div class="lp-fcta__bg">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=600&q=70&fit=crop" alt="" loading="lazy"/>
        <div class="lp-fcta__ov"/>
      </div>
      <div class="lp-wrap lp-fcta__inner">
        <h2>Your next job<br>starts here.</h2>
        <p>Build yours in under 3 minutes. Free to start. No credit card.</p>
        <button class="lp-btn lp-btn--white lp-btn--lg" @click="$emit('get-started')">
          Build my CV — it's free
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:16px;height:16px;flex-shrink:0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <p class="lp-fcta__note">107 templates · ATS-ready · English & French</p>
      </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="lp-foot">
      <div class="lp-wrap lp-foot__inner">
        <div class="lp-foot__brand">
          <div class="lp-logo" style="margin-bottom:10px">
            <div class="lp-logo__mark"><svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><rect x="5" y="2" width="16" height="22" rx="2" fill="white" opacity="0.95"/><path d="M21 2 L27 8 L21 8 Z" fill="#1d49b8"/><line x1="8" y1="13" x2="18" y2="13" stroke="#2a5bd7" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="17" x2="19" y2="17" stroke="#c0cef8" stroke-width="1.5" stroke-linecap="round"/><rect x="6" y="25" width="14" height="6" rx="2" fill="#1a1a2e"/><text x="13" y="30" font-family="system-ui,sans-serif" font-weight="800" font-size="4.5" fill="#7aa3f5" text-anchor="middle" letter-spacing="1">CV</text></svg></div>
            <span>CV<b>Master</b></span>
          </div>
          <p>Professional CVs for ambitious people.<br>Built for the global workforce.</p>
        </div>
        <div class="lp-foot__links">
          <div><h4>Product</h4><a href="#how" @click.prevent="scrollTo('#how')">How it works</a><a href="#templates" @click.prevent="scrollTo('#templates')">Templates</a><a href="#pricing" @click.prevent="scrollTo('#pricing')">Pricing</a></div>
          <div><h4>Legal</h4><a href="/legal">Privacy</a><a href="/legal">Terms</a></div>
        </div>
      </div>
      <div class="lp-wrap lp-foot__btm">
        <span>© {{ new Date().getFullYear() }} CVMaster. All rights reserved.</span>
        <span class="lp-foot__tag">Made for job seekers everywhere.</span>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineEmits(['get-started'])

const rootEl   = ref(null)
const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() { scrolled.value = (rootEl.value?.scrollTop || 0) > 50 }

function scrollTo(selector) {
  const target = rootEl.value?.querySelector(selector)
  if (target && rootEl.value) {
    const top = target.offsetTop - 70
    rootEl.value.scrollTo({ top, behavior: 'smooth' })
  }
}

onMounted(() => {
  // Scroll listener on the root element itself (not window)
  // because .lp is position:fixed with its own scroll context
  if (rootEl.value) {
    rootEl.value.addEventListener('scroll', onScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (rootEl.value) {
    rootEl.value.removeEventListener('scroll', onScroll)
  }
  menuOpen.value = false
})



const steps = [
  { title:'Build or narrate', desc:'Fill in details step-by-step, speak your career story aloud, or upload an existing CV. AI extracts everything.', img:'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=220&q=80&fit=crop', icon:'<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>', bg:'var(--c-accent-lt)', color:'var(--c-accent)' },
  { title:'Pick your template', desc:'Browse 107 stunning professional designs. Switch instantly — your content always moves with you.', img:'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=220&q=80&fit=crop', icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', bg:'var(--c-violet-lt)', color:'var(--c-violet)' },
  { title:'Export and apply', desc:'Download a clean ATS-ready PDF for £1.99 or remove the watermark for €0.50. Apply with confidence.', img:'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=220&q=80&fit=crop', icon:'<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', bg:'var(--c-green-lt)', color:'var(--c-green)' },
]

const tpls = [
  { name:'Executive Slate', tag:'Corporate', img:'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=280&h=360&q=80&fit=crop' },
  { name:'Modern Azure',    tag:'Tech',      img:'https://images.unsplash.com/photo-1517842645767-c639042777db?w=280&h=360&q=80&fit=crop' },
  { name:'Teal Sidebar',   tag:'Creative',  img:'https://images.unsplash.com/photo-1579389083395-4507e98b5e67?w=280&h=360&q=80&fit=crop' },
  { name:'Bold Noir',      tag:'Design',    img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=280&h=360&q=80&fit=crop' },
  { name:'Warm Amber',     tag:'Finance',   img:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=280&h=360&q=80&fit=crop' },
  { name:'Clean Minimal',  tag:'All roles', img:'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=280&h=360&q=80&fit=crop' },
  { name:'Purple Creative',tag:'Marketing', img:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=280&h=360&q=80&fit=crop' },
  { name:'Navy Executive', tag:'Banking',   img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=280&h=360&q=80&fit=crop' },
]

const feats = [
  { title:'Upload & improve', desc:'Upload your existing CV — AI restructures and enhances every section in seconds.', bg:'var(--c-teal-lt)', color:'var(--c-teal)', icon:'<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' },
  { title:'ATS optimised', desc:'Clean, text-based layouts that applicant tracking systems can read — plus a job-match check against the offer you paste.', bg:'var(--c-violet-lt)', color:'var(--c-violet)', icon:'<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>' },
  { title:'Diaspora-first', desc:'Designed for African professionals in the UK and Europe. Full French language support.', bg:'var(--c-amber-lt)', color:'var(--c-amber)', icon:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>' },
  { title:'Email delivery', desc:'Pay once and receive your polished PDF directly in your inbox. No subscriptions ever.', bg:'var(--c-rose-lt)', color:'var(--c-rose)', icon:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/>' },
  { title:'Referral credits', desc:'Refer a friend and earn a free export. Help others land jobs while saving.', bg:'var(--c-accent-lt)', color:'var(--c-accent)', icon:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>' },
]


const plans = [
  { plan:'Free', price:'£0', desc:'Forever free', cta:'Start building',
    items:['All 107 templates','AI writing assistance','CV upload & import','Live preview','Watermarked download'] },
  { plan:'Export', price:'£1.99', desc:'One-time per CV', cta:'Get my clean CV', f:true,
    items:['Everything in Free','Clean PDF — no watermark','Emailed to your inbox','ATS-ready formatting','Re-send this CV free, even after edits'] },
  { plan:'Watermark removal', price:'€0.50', desc:'One-time instant download', cta:'Download clean',
    items:['Remove CVMaster stamp','Instant browser download','ATS-ready quality','One-time per download'] },
]
</script>

<style scoped>
/* ── Base ── */
.lp {
  font-family:'DM Sans',sans-serif;
  color:var(--c-text);
  background:var(--c-bg);
  /* Take over the full viewport, scroll independently of html/body */
  position:fixed;
  inset:0;
  overflow-y:scroll;
  overflow-x:hidden;
  -webkit-overflow-scrolling:touch;
  z-index:0;
}
.lp-wrap { max-width:1160px; margin:0 auto; padding:0 24px; }

/* ── Buttons ── */
.lp-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:12px 22px; border-radius:var(--radius-sm); font-size:14.5px;
  font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;
  transition:all .2s; text-decoration:none; border:none;
  -webkit-tap-highlight-color:transparent;
}
.lp-btn--dark  { background:var(--c-text); color:var(--c-surface); }
.lp-btn--dark:hover  { background:var(--c-accent); transform:translateY(-1px); }
.lp-btn--ghost { border:1.5px solid var(--c-border); color:var(--c-text2); background:none; }
.lp-btn--ghost:hover { border-color:var(--c-text); color:var(--c-text); }
.lp-btn--white { background:#fff; color:#111; }
.lp-btn--white:hover { background:var(--c-accent-lt); color:var(--c-accent); transform:translateY(-2px); }
.lp-btn--outline { border:1.5px solid var(--c-border); color:var(--c-text2); background:none; }
.lp-btn--outline:hover { border-color:var(--c-text); color:var(--c-text); }
.lp-btn--sm  { padding:9px 16px; font-size:13px; }
.lp-btn--lg  { padding:15px 32px; font-size:16px; border-radius:var(--radius); box-shadow:0 8px 40px rgba(0,0,0,.3); }

/* ── Section ── */
.lp-sec { padding:88px 0; }
.lp-sec--alt { background:var(--c-surface2); }
.lp-eyebrow { display:inline-block; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.11em; color:var(--c-accent); background:var(--c-accent-lt); padding:4px 12px; border-radius:20px; margin-bottom:12px; }
.lp-h2 { font-family:'DM Serif Display',serif; font-size:clamp(26px,4vw,44px); font-weight:700; line-height:1.18; letter-spacing:-.02em; color:var(--c-text); margin-bottom:12px; }
.lp-h2 em { color:var(--c-accent); font-style:italic; }
.lp-sub { font-size:15px; color:var(--c-text2); line-height:1.65; max-width:520px; margin-bottom:40px; }

/* ── Nav ── */
.lp-nav { position:fixed; top:0; left:0; right:0; z-index:200; padding:14px 0; transition:all .3s; }
.lp-nav--solid { background:rgba(245,244,240,.96); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid var(--c-border); padding:10px 0; box-shadow:var(--shadow-sm); }
.lp-nav__inner { display:flex; align-items:center; gap:20px; }
.lp-logo { display:flex; align-items:center; gap:9px; font-size:17px; font-weight:700; color:var(--c-text); flex:1; min-width:0; }
.lp-logo b { color:var(--c-accent); }
.lp-logo__mark { width:32px; height:32px; background:var(--c-accent); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.lp-logo__mark svg { width:16px; height:16px; }
.lp-nav__links { display:flex; gap:24px; }
.lp-nav__links a { color:var(--c-text2); font-size:14px; font-weight:500; text-decoration:none; transition:color .15s; white-space:nowrap; }
.lp-nav__links a:hover { color:var(--c-text); }
.lp-nav__cta { background:var(--c-text); color:var(--c-surface); border:none; padding:9px 18px; border-radius:var(--radius-sm); font-size:13.5px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .18s; white-space:nowrap; -webkit-tap-highlight-color:transparent; }
.lp-nav__cta:hover { background:var(--c-accent); }

/* Burger */
.lp-burger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:8px; border-radius:6px; -webkit-tap-highlight-color:transparent; }
.lp-burger span { display:block; width:22px; height:2px; background:var(--c-text); border-radius:2px; transition:all .25s ease; transform-origin:center; }

/* Mobile menu — uses max-height for animation, no position:absolute */
.lp-mob-menu {
  overflow:hidden; max-height:0; transition:max-height .3s ease;
  background:var(--c-surface); border-bottom:1px solid var(--c-border);
}
.lp-mob-menu.open { max-height:400px; }
.lp-mob-menu a {
  display:block; color:var(--c-text2); font-size:16px; font-weight:500;
  text-decoration:none; padding:14px 24px; border-bottom:1px solid var(--c-border);
  transition:color .15s; -webkit-tap-highlight-color:transparent;
}
.lp-mob-menu a:hover { color:var(--c-text); background:var(--c-bg); }
.lp-mob-cta {
  display:block; width:100%; background:var(--c-text); color:var(--c-surface);
  border:none; padding:16px 24px; font-size:15px; font-weight:700;
  cursor:pointer; font-family:'DM Sans',sans-serif; text-align:left;
  -webkit-tap-highlight-color:transparent;
}

/* ── Hero ── */
.lp-hero { padding:96px 0 0; position:relative; overflow:hidden; }
.lp-hero__bg { position:absolute; inset:0; pointer-events:none; }
.lp-blob { position:absolute; border-radius:50%; filter:blur(80px); }
.lp-blob--1 { top:-80px; right:-80px; width:500px; height:500px; background:rgba(42,91,215,.09); }
.lp-blob--2 { bottom:-100px; left:-80px; width:400px; height:400px; background:rgba(13,122,114,.07); }
.lp-blob--3 { top:40%; left:40%; width:260px; height:260px; background:rgba(98,54,176,.05); }
.lp-grid { position:absolute; inset:0; background-image:linear-gradient(var(--c-border) 1px,transparent 1px),linear-gradient(90deg,var(--c-border) 1px,transparent 1px); background-size:54px 54px; opacity:.18; }
.lp-hero__inner { display:grid; grid-template-columns:1fr 500px; align-items:center; gap:56px; padding:44px 0 60px; position:relative; z-index:1; }

.lp-chip { display:inline-flex; align-items:center; gap:8px; background:var(--c-surface); border:1px solid var(--c-border); border-radius:20px; padding:6px 14px; font-size:12.5px; color:var(--c-text2); margin-bottom:22px; box-shadow:var(--shadow-xs); }
.lp-chip__dot { width:7px; height:7px; border-radius:50%; background:var(--c-green); flex-shrink:0; animation:lp-dot 2s ease-in-out infinite; }
@keyframes lp-dot { 0%,100%{opacity:1}50%{opacity:.3} }
.lp-h1 { font-family:'DM Serif Display',serif; font-size:clamp(34px,5vw,62px); font-weight:700; line-height:1.1; letter-spacing:-.02em; color:var(--c-text); margin-bottom:18px; }
.lp-h1 em { color:var(--c-accent); font-style:italic; }
.lp-hero__p { font-size:16px; color:var(--c-text2); line-height:1.68; max-width:460px; margin-bottom:28px; }
.lp-hero__btns { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:28px; }
.lp-proof { display:flex; align-items:center; gap:12px; }
.lp-proof__avs { display:flex; }
.lp-proof__av { width:30px; height:30px; border-radius:50%; border:2px solid var(--c-bg); margin-left:-8px; object-fit:cover; flex-shrink:0; }
.lp-proof__av:first-child { margin-left:0; }
.lp-proof__stars { font-size:13px; color:var(--c-amber); letter-spacing:1px; margin-bottom:2px; }
.lp-proof span { font-size:12.5px; color:var(--c-text3); }
.lp-proof strong { color:var(--c-text); }

/* Browser mockup */
.lp-hero__visual { position:relative; flex-shrink:0; }
.lp-browser { background:var(--c-surface); border-radius:14px; box-shadow:var(--shadow-xl); overflow:hidden; border:1px solid var(--c-border); }
.lp-browser__bar { display:flex; align-items:center; gap:6px; padding:10px 14px; background:var(--c-surface2); border-bottom:1px solid var(--c-border); }
.lp-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.lp-dot--r { background:#ff5f57; } .lp-dot--y { background:#febc2e; } .lp-dot--g { background:#28c840; }
.lp-browser__url { flex:1; background:var(--c-bg); border-radius:5px; padding:4px 10px; font-size:11px; color:var(--c-text3); border:1px solid var(--c-border); margin:0 8px; }
.lp-browser__screen { height:280px; overflow:hidden; }

/* Floating badges */
.lp-fbadge { position:absolute; background:var(--c-surface); border:1px solid var(--c-border); border-radius:var(--radius-sm); padding:8px 12px; font-size:12px; font-weight:600; color:var(--c-text); display:flex; align-items:center; gap:6px; box-shadow:var(--shadow); white-space:nowrap; }
.lp-fbadge--1 { top:-14px; left:-20px; animation:lp-float 4s ease-in-out infinite; }
.lp-fbadge--2 { top:70px; right:-22px; animation:lp-float 4s ease-in-out infinite .8s; }
.lp-fbadge--3 { bottom:40px; right:-22px; animation:lp-float 4s ease-in-out infinite 1.5s; }
@keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }

/* Logos */
.lp-logos { padding:22px 0; border-top:1px solid var(--c-border); overflow:hidden; }
.lp-logos__lbl { text-align:center; font-size:11px; color:var(--c-text3); text-transform:uppercase; letter-spacing:.08em; margin-bottom:12px; display:block; }
.lp-logos__track { display:flex; gap:44px; animation:lp-mq 26s linear infinite; white-space:nowrap; }
.lp-logos__track span { font-size:13px; font-weight:600; color:var(--c-border2); letter-spacing:.04em; }
@keyframes lp-mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* Steps */
.lp-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; margin-top:44px; }
.lp-step__num { font-family:'DM Serif Display',serif; font-size:46px; font-weight:700; color:var(--c-border); line-height:1; margin-bottom:14px; }
.lp-step__img { border-radius:12px; overflow:hidden; margin-bottom:16px; height:168px; position:relative; }
.lp-step__img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s; }
.lp-step:hover .lp-step__img img { transform:scale(1.06); }
.lp-step__icon { position:absolute; bottom:10px; left:10px; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow); }
.lp-step h3 { font-size:17px; font-weight:700; color:var(--c-text); margin-bottom:7px; }
.lp-step p  { font-size:13.5px; color:var(--c-text2); line-height:1.65; }

/* Templates */
.lp-tgrid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
.lp-tcard { background:var(--c-surface); border-radius:var(--radius-lg); overflow:hidden; cursor:pointer; border:1px solid var(--c-border); transition:all .22s; -webkit-tap-highlight-color:transparent; }
.lp-tcard:hover { transform:translateY(-5px); box-shadow:var(--shadow-lg); }
.lp-tcard:hover .lp-tcard__hover { opacity:1; }
.lp-tcard__img { height:190px; position:relative; overflow:hidden; }
.lp-tcard__img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .45s; }
.lp-tcard:hover .lp-tcard__img img { transform:scale(1.08); }
.lp-tcard__hover { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .22s; background:rgba(0,0,0,.45); }
.lp-tcard__hover span { color:#fff; font-size:13px; font-weight:600; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.3); padding:7px 16px; border-radius:var(--radius-sm); backdrop-filter:blur(4px); }
.lp-tcard__foot { padding:10px 13px; display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--c-border); }
.lp-tcard__name { font-size:12.5px; font-weight:600; color:var(--c-text); }
.lp-tcard__tag  { font-size:10.5px; font-weight:600; color:var(--c-text3); background:var(--c-bg); padding:2px 8px; border-radius:20px; }
.lp-tmore { text-align:center; }
.lp-tmore p { font-size:13.5px; color:var(--c-text3); margin-bottom:16px; }

/* Features */
.lp-fgrid { display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:auto; gap:14px; margin-top:44px; }
.lp-feat--big { grid-column:1/3; background:linear-gradient(160deg,#0f0e0c 55%,#1a1916); border-radius:var(--radius-lg); overflow:hidden; display:flex; flex-direction:column; }
.lp-feat__content { padding:28px; }
.lp-feat__content h3 { font-size:22px; font-weight:700; color:#fff; margin-bottom:10px; }
.lp-feat__content p  { font-size:14px; color:#888; line-height:1.65; margin-bottom:20px; max-width:340px; }
.lp-feat__badge { display:inline-block; background:var(--c-accent); color:#fff; font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; margin-bottom:12px; letter-spacing:.05em; }
.lp-feat__img { flex:1; min-height:180px; position:relative; overflow:hidden; }
.lp-feat__img img { width:100%; height:100%; object-fit:cover; display:block; opacity:.55; }
.lp-mic { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:60px; height:60px; display:flex; align-items:center; justify-content:center; }
.lp-mic__ring { position:absolute; inset:-10px; border-radius:50%; border:2px solid rgba(42,91,215,.6); animation:lp-mpulse 2.2s ease-in-out infinite; }
@keyframes lp-mpulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.25);opacity:1} }
.lp-feat--sm { background:var(--c-surface2); border:1px solid var(--c-border); border-radius:var(--radius-lg); padding:22px; display:flex; gap:14px; align-items:flex-start; transition:transform .18s; }
.lp-feat--sm:hover { transform:translateY(-2px); }
.lp-feat__ic { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.lp-feat--sm h3 { font-size:15px; font-weight:700; color:var(--c-text); margin-bottom:5px; }
.lp-feat--sm p  { font-size:13px; color:var(--c-text2); line-height:1.65; }

/* Testimonials */
.lp-testis { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-top:44px; }
.lp-testi { background:var(--c-surface); border-radius:var(--radius-lg); border:1px solid var(--c-border); box-shadow:var(--shadow-xs); overflow:hidden; }
.lp-testi__q { font-family:'DM Serif Display',serif; font-size:60px; color:var(--c-accent-lt); line-height:.7; padding:20px 24px 0; }
.lp-testi p { font-size:14px; color:var(--c-text2); line-height:1.72; padding:10px 24px 16px; }
.lp-testi__foot { display:flex; align-items:center; gap:10px; padding:14px 24px; background:var(--c-bg); border-top:1px solid var(--c-border); }
.lp-testi__foot img { width:38px; height:38px; border-radius:50%; object-fit:cover; flex-shrink:0; }
.lp-testi__name { font-size:13px; font-weight:700; color:var(--c-text); }
.lp-testi__role { font-size:11.5px; color:var(--c-text3); }
.lp-testi__stars { margin-left:auto; font-size:13px; color:var(--c-amber); letter-spacing:1px; flex-shrink:0; }

/* Pricing */
.lp-pgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:44px; }
.lp-pcard { background:var(--c-surface2); border:1px solid var(--c-border); border-radius:var(--radius-lg); padding:28px; position:relative; }
.lp-pcard.featured { background:var(--c-text); border-color:var(--c-text); }
.lp-pbadge { position:absolute; top:-11px; left:50%; transform:translateX(-50%); background:var(--c-accent); color:#fff; font-size:10px; font-weight:700; padding:3px 13px; border-radius:20px; white-space:nowrap; }
.lp-pplan { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--c-text3); margin-bottom:6px; }
.lp-pcard.featured .lp-pplan { color:rgba(245,244,240,.4); }
.lp-pamt { font-family:'DM Serif Display',serif; font-size:40px; font-weight:700; line-height:1; color:var(--c-text); margin-bottom:4px; }
.lp-pcard.featured .lp-pamt { color:var(--c-surface); }
.lp-pdesc { font-size:12px; color:var(--c-text3); margin-bottom:20px; }
.lp-plist { list-style:none; display:flex; flex-direction:column; gap:8px; margin-bottom:22px; }
.lp-plist li { display:flex; align-items:center; gap:7px; font-size:13px; color:var(--c-text2); }
.lp-pcard.featured .lp-plist li { color:rgba(245,244,240,.7); }

/* Final CTA */
.lp-fcta { position:relative; padding:120px 0; text-align:center; overflow:hidden; }
.lp-fcta__bg { position:absolute; inset:0; }
.lp-fcta__bg img { width:100%; height:100%; object-fit:cover; display:block; }
.lp-fcta__ov { position:absolute; inset:0; background:linear-gradient(160deg,rgba(10,10,20,.94),rgba(20,50,160,.88)); }
.lp-fcta__inner { position:relative; z-index:1; color:#fff; }
.lp-fcta h2 { font-family:'DM Serif Display',serif; font-size:clamp(28px,5vw,54px); font-weight:700; line-height:1.15; color:#fff; margin-bottom:14px; }
.lp-fcta p  { font-size:15px; color:rgba(255,255,255,.6); margin-bottom:28px; }
.lp-fcta__note { font-size:12px; color:rgba(255,255,255,.3); margin-top:14px; margin-bottom:0; }

/* Footer */
.lp-foot { background:#07070e; color:#555; padding:52px 0 20px; }
.lp-foot__inner { display:grid; grid-template-columns:1fr auto; gap:40px; margin-bottom:40px; }
.lp-foot__brand p { font-size:12.5px; color:#444; max-width:210px; line-height:1.65; }
.lp-foot__links { display:flex; gap:44px; }
.lp-foot__links > div { display:flex; flex-direction:column; gap:9px; }
.lp-foot__links h4 { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.09em; color:#444; margin-bottom:3px; }
.lp-foot__links a { font-size:12.5px; color:#444; text-decoration:none; transition:color .15s; }
.lp-foot__links a:hover { color:#fff; }
.lp-foot__btm { border-top:1px solid #111; padding-top:16px; display:flex; justify-content:space-between; font-size:12px; color:#282828; }
.lp-foot__tag { color:#1e1e1e; }

/* ── RESPONSIVE ── */
/* 1060px */
@media (max-width:1060px) {
  .lp-tgrid { grid-template-columns:repeat(3,1fr); }
  .lp-hero__inner { grid-template-columns:1fr 420px; gap:40px; }
}

/* 900px */
@media (max-width:900px) {
  .lp-hero__inner { grid-template-columns:1fr; }
  .lp-hero__visual { display:none; }
  .lp-fgrid { grid-template-columns:1fr 1fr; }
  .lp-feat--big { grid-column:1/3; }
  .lp-steps { grid-template-columns:1fr 1fr; }
  .lp-testis { grid-template-columns:1fr; }
}

/* 768px */
@media (max-width:768px) {
  .lp-wrap { padding:0 16px; }
  .lp-nav__links { display:none; }
  .lp-nav__cta { display:none; }
  .lp-burger { display:flex; }
  .lp-hero { padding:72px 0 0; }
  .lp-h1 { font-size:32px; }
  .lp-hero__p { font-size:15px; }
  .lp-hero__btns { flex-direction:column; gap:10px; }
  .lp-btn { width:100%; }
  .lp-sec { padding:60px 0; }
  .lp-h2 { font-size:26px; }
  .lp-steps { grid-template-columns:1fr; }
  .lp-tgrid { grid-template-columns:1fr 1fr; gap:10px; }
  .lp-tcard__img { height:140px; }
  .lp-tcard__tag { display:none; }
  .lp-fgrid { grid-template-columns:1fr; }
  .lp-feat--big { grid-column:1/2; }
  .lp-feat__img { min-height:160px; }
  .lp-testis { grid-template-columns:1fr; }
  .lp-pgrid { grid-template-columns:1fr; }
  .lp-fcta { padding:72px 0; }
  .lp-fcta h2 { font-size:28px; }
  .lp-foot__inner { grid-template-columns:1fr; gap:24px; }
  .lp-foot__links { flex-wrap:wrap; gap:20px; }
  .lp-foot__btm { flex-direction:column; gap:6px; }
  .lp-foot__tag { display:none; }
}

/* 480px */
@media (max-width:480px) {
  .lp-tgrid { grid-template-columns:1fr 1fr; gap:8px; }
  .lp-tcard__img { height:118px; }
  .lp-tcard__name { font-size:11px; }
  .lp-h1 { font-size:28px; }
  .lp-hero__btns { gap:8px; }
}

/* Safe area */
@supports (padding:env(safe-area-inset-bottom)) {
  .lp-foot { padding-bottom:calc(20px + env(safe-area-inset-bottom)); }
}

/* Dark mode */
[data-theme="dark"] .lp-nav--solid { background:rgba(13,17,23,.96); }
[data-theme="dark"] .lp-browser { background:var(--c-surface); }
[data-theme="dark"] .lp-tcard,.lp-testi,.lp-pcard,.lp-feat--sm { background:var(--c-surface); }
</style>