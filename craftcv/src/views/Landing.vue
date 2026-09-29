<template>
  <div class="lp" ref="rootEl">
    <!-- Nav -->
    <header class="lp-nav" :class="{ scrolled }">
      <div class="lp-wrap lp-nav-in">
        <BrandLogo />
        <nav class="lp-links">
          <a href="#how" @click.prevent="go('#how')">How it works</a>
          <a href="#templates" @click.prevent="go('#templates')">Templates</a>
          <a href="#pricing" @click.prevent="go('#pricing')">Pricing</a>
          <a href="#faq" @click.prevent="go('#faq')">FAQ</a>
        </nav>
        <div class="lp-nav-cta">
          <button class="btn-ghost" @click="$emit('sign-in')">Sign in</button>
          <button class="btn-primary accent" @click="$emit('start')">Build my CV</button>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="lp-hero">
      <div class="lp-wrap lp-hero-in">
        <div class="lp-hero-copy">
          <span class="badge accent">ATS-ready · English &amp; Français</span>
          <h1>A CV that gets past the robots — and impresses the humans.</h1>
          <p class="lp-lead">Build your CV in minutes, tailor it to the exact job you want with AI, check how well it matches, and export a polished one-page PDF.</p>
          <div class="lp-cta">
            <button class="btn-primary accent btn-lg" @click="$emit('start')">
              Build my CV — free
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button class="btn-secondary btn-lg" @click="go('#templates')">See templates</button>
          </div>
          <p class="lp-note">No account needed to start · Pay only when you export</p>
        </div>

        <div class="lp-hero-art" aria-hidden="true">
          <div class="lp-sheet s1"><CvThumb template="classic:slate" :data="SAMPLE_CV" /></div>
          <div class="lp-sheet s2"><CvThumb template="modern:indigo" :data="SAMPLE_CV" /></div>
          <div class="lp-chip c1">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            Tailored to the job offer
          </div>
          <div class="lp-chip c2">
            <svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
            Fits on one A4 page
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="lp-sec" id="how">
      <div class="lp-wrap">
        <div class="lp-sec-hd">
          <span class="lp-eyebrow">How it works</span>
          <h2>From blank page to a job-ready CV</h2>
        </div>
        <div class="lp-steps">
          <div v-for="(s, i) in STEPS" :key="s.t" class="lp-step card">
            <span class="lp-step-n">{{ i + 1 }}</span>
            <h3>{{ s.t }}</h3>
            <p>{{ s.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Templates -->
    <section class="lp-sec lp-alt" id="templates">
      <div class="lp-wrap">
        <div class="lp-sec-hd">
          <span class="lp-eyebrow">Templates</span>
          <h2>8 layouts · 12 colours</h2>
          <p>Every layout is text-based and built so applicant tracking systems read it in the right order. Switch at any time — your content moves with you.</p>
        </div>
        <div class="lp-tpls">
          <figure v-for="t in SHOWCASE" :key="t.id" class="lp-tpl">
            <div class="lp-tpl-img"><CvThumb :template="t.id" :data="SAMPLE_CV" /></div>
            <figcaption>{{ t.name }}</figcaption>
          </figure>
        </div>
        <div class="lp-center"><button class="btn-secondary" @click="$emit('start')">Browse all templates</button></div>
      </div>
    </section>

    <!-- Features -->
    <section class="lp-sec">
      <div class="lp-wrap">
        <div class="lp-sec-hd">
          <span class="lp-eyebrow">Why CVMaster</span>
          <h2>Built for getting interviews</h2>
        </div>
        <div class="lp-feats">
          <div v-for="f in FEATURES" :key="f.t" class="lp-feat">
            <span class="lp-feat-ic"><svg viewBox="0 0 24 24" v-html="f.i"></svg></span>
            <h3>{{ f.t }}</h3>
            <p>{{ f.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="lp-sec lp-alt" id="pricing">
      <div class="lp-wrap">
        <div class="lp-sec-hd">
          <span class="lp-eyebrow">Pricing</span>
          <h2>Free to build. Pay once when you're ready.</h2>
          <p>No subscriptions.</p>
        </div>
        <div class="lp-prices">
          <div v-for="p in PLANS" :key="p.name" class="lp-price card" :class="{ featured: p.featured }">
            <span v-if="p.featured" class="badge accent lp-pop">Recommended</span>
            <h3>{{ p.name }}</h3>
            <div class="lp-amt">{{ p.price }}<span>{{ p.per }}</span></div>
            <ul>
              <li v-for="it in p.items" :key="it">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ it }}
              </li>
            </ul>
            <button class="btn-block" :class="p.featured ? 'btn-primary accent' : 'btn-secondary'" @click="$emit('start')">{{ p.cta }}</button>
          </div>
        </div>
        <p class="lp-small">Invite friends: every sign-up with your referral link earns you a free export.</p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="lp-sec" id="faq">
      <div class="lp-wrap lp-faq-wrap">
        <div class="lp-sec-hd">
          <span class="lp-eyebrow">FAQ</span>
          <h2>Good questions</h2>
        </div>
        <details v-for="q in FAQ" :key="q.q" class="lp-faq">
          <summary>{{ q.q }}<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></summary>
          <p>{{ q.a }}</p>
        </details>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="lp-final">
      <div class="lp-wrap lp-final-in">
        <h2>Your next CV is ten minutes away.</h2>
        <button class="btn-primary accent btn-lg" @click="$emit('start')">Build my CV — free</button>
      </div>
    </section>

    <footer class="lp-foot">
      <div class="lp-wrap lp-foot-in">
        <BrandLogo small />
        <span>© {{ new Date().getFullYear() }} CVMaster</span>
        <nav><a href="/legal">Privacy</a><a href="/legal">Terms</a><a href="mailto:gabbyquaye2021@gmail.com">Contact</a></nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BrandLogo from '../components/BrandLogo.vue'
import CvThumb from '../components/CvThumb.vue'
import { SAMPLE_CV } from '../composables/sampleCv.js'

defineEmits(['start', 'sign-in'])

const rootEl = ref(null)
const scrolled = ref(false)
function onScroll() { scrolled.value = (rootEl.value?.scrollTop || 0) > 8 }
function go(sel) {
  const el = rootEl.value?.querySelector(sel)
  if (el) rootEl.value.scrollTo({ top: el.offsetTop - 72, behavior: 'smooth' })
}
onMounted(() => rootEl.value?.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => rootEl.value?.removeEventListener('scroll', onScroll))

const STEPS = [
  { t: 'Build or import', d: 'Fill in guided steps, tell your story out loud and let AI structure it, or upload an existing PDF or Word CV.' },
  { t: 'Tailor it to the job', d: 'Paste the job offer. AI suggests wording that matches it — you approve every change, and it never invents experience.' },
  { t: 'Check and export', d: 'See your ATS match score and missing keywords, fix what matters, then export a clean one-page PDF.' },
]

const SHOWCASE = [
  { id: 'modern:indigo',   name: 'Modern' },
  { id: 'sidebar:teal',    name: 'Sidebar' },
  { id: 'executive:slate', name: 'Executive' },
  { id: 'timeline:burgundy', name: 'Timeline' },
]

const FEATURES = [
  { t: 'Tailored to each job', d: 'Keep one CV and adapt it to every application in a minute, using the words the employer uses.',
    i: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>' },
  { t: 'ATS job-match check', d: 'A match score with the keywords you have and the ones you are missing — before you apply.',
    i: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>' },
  { t: 'Honest AI', d: 'AI rewrites what you have done in stronger words. It never adds jobs, numbers or skills you do not have.',
    i: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { t: 'Always one page', d: 'A live page guide shows when you run long, and a smart fit squeezes the last few lines onto one A4 page.',
    i: '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>' },
  { t: 'English & Français', d: 'Write your CV in English or French — headings, AI help and job tailoring follow your language.',
    i: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>' },
  { t: 'Start without an account', d: 'Build and preview for free, right away. Create an account only when you want to export.',
    i: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>' },
]

const PLANS = [
  { name: 'Free', price: '£0', per: '', cta: 'Start building',
    items: ['All 8 layouts and 12 colours', 'AI writing and job tailoring', 'ATS job-match check', 'Watermarked PDF download'] },
  { name: 'Emailed CV', price: '£1.99', per: ' per CV', cta: 'Build my CV', featured: true,
    items: ['Clean, watermark-free PDF', 'Sent straight to your inbox', 'Re-send it free, even after edits', 'Direct download included'] },
  { name: 'Clean download', price: '€0.50', per: ' per download', cta: 'Build my CV',
    items: ['One watermark-free PDF', 'Instant download in your browser', 'Same one-page quality'] },
]

const FAQ = [
  { q: 'Is it really free to start?', a: 'Yes. You can build, edit, tailor and preview your CV without paying or creating an account. You only pay if you want a clean PDF: £1.99 to have it emailed (re-sends of that CV are free) or €0.50 for a single clean download.' },
  { q: 'Will my CV pass applicant tracking systems (ATS)?', a: 'No one can honestly guarantee that, because every company configures its ATS differently. What we do: every layout is plain, selectable text in a logical reading order with standard headings, and the ATS check shows how well your CV matches the specific job offer so you can close the gaps.' },
  { q: 'Does the AI make things up?', a: 'It is instructed not to. It rewrites and reorders what you have written using the job offer’s language, and you approve every change. Keywords you do not show evidence of are listed separately so you only add the ones that are true.' },
  { q: 'Do I need an account?', a: 'Not to build. Your CV is saved in your browser as you go. When you want to export, you create a free account (email or Google) and your CV moves into it automatically.' },
  { q: 'Can I write my CV in French?', a: 'Yes — switch the CV language to Français and headings, AI suggestions and tailoring follow.' },
]
</script>

<style scoped>
.lp{height:100vh;height:100dvh;overflow-y:auto;background:var(--c-surface);color:var(--c-text)}
.lp-wrap{max-width:1120px;margin:0 auto;padding:0 24px}

.lp-nav{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--c-surface) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid transparent;transition:border-color .2s}
.lp-nav.scrolled{border-bottom-color:var(--c-border)}
.lp-nav-in{height:68px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.lp-links{display:flex;gap:28px}
.lp-links a{color:var(--c-text2);text-decoration:none;font-size:14px;font-weight:500}
.lp-links a:hover{color:var(--c-text)}
.lp-nav-cta{display:flex;gap:6px}

.lp-hero{padding:56px 0 72px;background:radial-gradient(1200px 500px at 85% -10%,var(--c-accent-lt),transparent 60%)}
.lp-hero-in{display:grid;grid-template-columns:1.05fr 1fr;gap:48px;align-items:center}
.lp-hero-copy h1{font-size:clamp(34px,4.6vw,54px);line-height:1.06;letter-spacing:-.035em;font-weight:700;margin:18px 0 18px}
.lp-lead{font-size:18px;line-height:1.6;color:var(--c-text2);max-width:540px}
.lp-cta{display:flex;gap:10px;margin-top:28px;flex-wrap:wrap}
.lp-cta svg{width:17px;height:17px}
.lp-note{margin-top:14px;font-size:13.5px;color:var(--c-text3)}

.lp-hero-art{position:relative;height:500px}
.lp-sheet{position:absolute;width:300px;border-radius:6px;overflow:hidden;box-shadow:0 2px 4px rgba(17,24,39,.06),0 24px 60px rgba(17,24,39,.16);border:1px solid var(--c-border)}
.lp-sheet.s1{left:4%;top:40px;transform:rotate(-4deg);opacity:.9}
.lp-sheet.s2{right:4%;top:0;transform:rotate(2deg)}
.lp-chip{position:absolute;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;background:var(--c-surface);border:1px solid var(--c-border);box-shadow:var(--shadow-lg);font-size:13.5px;font-weight:600}
.lp-chip svg{width:17px;height:17px;fill:none;stroke:var(--c-green);stroke-width:2.2}
.lp-chip.c1{left:0;bottom:70px}
.lp-chip.c2{right:0;bottom:20px}
.lp-chip.c2 svg{stroke:var(--c-accent)}

.lp-sec{padding:88px 0}
.lp-alt{background:var(--c-bg)}
.lp-sec-hd{max-width:640px;margin:0 auto 44px;text-align:center}
.lp-eyebrow{font-size:13px;font-weight:600;color:var(--c-accent)}
.lp-sec-hd h2{font-size:clamp(26px,3.2vw,36px);letter-spacing:-.025em;font-weight:700;margin-top:8px;line-height:1.15}
.lp-sec-hd p{color:var(--c-text2);margin-top:12px;font-size:16px;line-height:1.6}

.lp-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.lp-step{padding:26px}
.lp-step-n{width:32px;height:32px;border-radius:9px;background:var(--c-accent-lt);color:var(--c-accent);display:flex;align-items:center;justify-content:center;font-weight:700;margin-bottom:16px}
.lp-step h3{font-size:17px;font-weight:600;margin-bottom:8px}
.lp-step p{color:var(--c-text2);line-height:1.6;font-size:14.5px}

.lp-tpls{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.lp-tpl{margin:0}
.lp-tpl-img{border-radius:6px;overflow:hidden;border:1px solid var(--c-border);box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s}
.lp-tpl:hover .lp-tpl-img{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.lp-tpl figcaption{text-align:center;margin-top:12px;font-weight:600;font-size:14px}
.lp-center{text-align:center;margin-top:36px}

.lp-feats{display:grid;grid-template-columns:repeat(3,1fr);gap:40px 36px}
.lp-feat-ic{width:40px;height:40px;border-radius:11px;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.lp-feat-ic svg{width:20px;height:20px;fill:none;stroke:var(--c-accent);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.lp-feat h3{font-size:16.5px;font-weight:600;margin-bottom:6px}
.lp-feat p{color:var(--c-text2);line-height:1.6;font-size:14.5px}

.lp-prices{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch}
.lp-price{padding:28px;display:flex;flex-direction:column;position:relative}
.lp-price.featured{border-color:var(--c-accent);box-shadow:0 0 0 1px var(--c-accent),var(--shadow-lg)}
.lp-pop{position:absolute;top:-11px;left:28px}
.lp-price h3{font-size:16px;font-weight:600;color:var(--c-text2)}
.lp-amt{font-size:40px;font-weight:700;letter-spacing:-.03em;margin:8px 0 18px}
.lp-amt span{font-size:14px;font-weight:500;color:var(--c-text3);letter-spacing:0}
.lp-price ul{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:24px;flex:1}
.lp-price li{display:flex;gap:9px;font-size:14.5px;color:var(--c-text2);line-height:1.45}
.lp-price li svg{width:17px;height:17px;flex-shrink:0;fill:none;stroke:var(--c-green);stroke-width:2.4;margin-top:1px}
.lp-small{text-align:center;color:var(--c-text3);margin-top:24px;font-size:14px}

.lp-faq-wrap{max-width:760px}
.lp-faq{border-bottom:1px solid var(--c-border)}
.lp-faq summary{list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 0;font-weight:600;font-size:16px;cursor:pointer}
.lp-faq summary::-webkit-details-marker{display:none}
.lp-faq summary svg{width:18px;height:18px;flex-shrink:0;fill:none;stroke:var(--c-text3);stroke-width:2;transition:transform .2s}
.lp-faq[open] summary svg{transform:rotate(180deg)}
.lp-faq p{color:var(--c-text2);line-height:1.7;padding:0 0 22px;font-size:15px}

.lp-final{padding:80px 0;background:linear-gradient(135deg,#4338ca,#6366f1)}
.lp-final-in{display:flex;flex-direction:column;align-items:center;gap:24px;text-align:center}
.lp-final h2{color:#fff;font-size:clamp(26px,3.4vw,38px);letter-spacing:-.025em;font-weight:700}
.lp-final .btn-primary{background:#fff;color:#312e81;box-shadow:0 8px 24px rgba(0,0,0,.15)}
.lp-final .btn-primary:hover{background:#eef2ff}

.lp-foot{padding:28px 0;border-top:1px solid var(--c-border)}
.lp-foot-in{display:flex;align-items:center;gap:20px;font-size:13.5px;color:var(--c-text3)}
.lp-foot nav{margin-left:auto;display:flex;gap:20px}
.lp-foot a{color:var(--c-text2);text-decoration:none}
.lp-foot a:hover{color:var(--c-text)}

@media (max-width:960px){
  .lp-links{display:none}
  .lp-hero-in{grid-template-columns:1fr}
  .lp-hero-art{height:420px;max-width:520px;width:100%;margin:0 auto}
  .lp-steps,.lp-prices{grid-template-columns:1fr}
  .lp-feats{grid-template-columns:1fr 1fr}
  .lp-tpls{grid-template-columns:1fr 1fr}
}
@media (max-width:560px){
  .lp-nav-cta .btn-ghost{display:none}
  .lp-hero{padding-top:32px}
  .lp-hero-art{height:360px}
  .lp-sheet{width:220px}
  .lp-feats{grid-template-columns:1fr}
  .lp-sec{padding:64px 0}
  .lp-foot-in{flex-direction:column;gap:12px}
  .lp-foot nav{margin-left:0}
}
</style>
