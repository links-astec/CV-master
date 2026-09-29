<template>
  <div class="lp" ref="rootEl">
    <!-- Nav -->
    <header class="lp-nav" :class="{ scrolled }">
      <div class="lp-wrap lp-nav-in">
        <BrandLogo />
        <nav class="lp-links">
          <a href="#how" @click.prevent="go('#how')">How it works</a>
          <a href="#tailor" @click.prevent="go('#tailor')">Tailoring</a>
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
          <button class="lp-pill" @click="go('#tailor')">
            <span class="lp-pill-tag">New</span> Tailor your CV to any job offer
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <h1>A CV that gets past the robots — and <span class="lp-hl">impresses the humans.</span></h1>
          <p class="lp-lead">Build your CV in minutes, tailor it to the job you want, check how well it matches, and export a polished one-page PDF. In English or French.</p>
          <div class="lp-cta">
            <button class="btn-primary accent btn-lg" @click="$emit('start')">
              Build my CV — free
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button class="btn-secondary btn-lg" @click="go('#templates')">See templates</button>
          </div>
          <ul class="lp-trust">
            <li v-for="t in TRUST" :key="t"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ t }}</li>
          </ul>
        </div>

        <div class="lp-hero-art" aria-hidden="true">
          <div class="lp-app">
            <div class="lp-app-bar"><span></span><span></span><span></span><div class="lp-app-url">cvmaster.live/editor</div></div>
            <div class="lp-app-body">
              <div class="lp-app-side">
                <div class="lp-app-tab on">Content</div><div class="lp-app-tab">Design</div><div class="lp-app-tab">Job &amp; ATS</div>
                <div v-for="n in 5" :key="n" class="lp-app-row"><i></i><b :style="{ width: 40 + (n * 13) % 45 + '%' }"></b></div>
              </div>
              <div class="lp-app-page"><CvThumb template="modern:indigo" :data="SAMPLE_CV" /></div>
            </div>
          </div>
          <div class="lp-float f1">
            <div class="lp-float-hd">Checked before you export</div>
            <div v-for="c in CHECKS" :key="c" class="lp-float-row"><span class="ok"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>{{ c }}</div>
          </div>
          <div class="lp-float f2">
            <span class="lp-float-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg></span>
            <div><div class="lp-float-t">Tailored to the job offer</div><div class="lp-float-s">You approve every change</div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="lp-sec" id="how">
      <div class="lp-wrap">
        <div class="lp-sec-hd">
          <span class="lp-eyebrow">How it works</span>
          <h2>From blank page to job-ready in three steps</h2>
        </div>
        <div class="lp-steps">
          <div v-for="(s, i) in STEPS" :key="s.t" class="lp-step">
            <span class="lp-step-n">{{ i + 1 }}</span>
            <h3>{{ s.t }}</h3>
            <p>{{ s.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tailoring in action -->
    <section class="lp-sec lp-alt" id="tailor">
      <div class="lp-wrap lp-tailor">
        <div class="lp-tailor-copy">
          <span class="lp-eyebrow">Tailoring, in action</span>
          <h2>Same facts. Stronger words. Nothing invented.</h2>
          <p>Paste the job offer and CVMaster rewrites your experience in the employer's language, so applicant tracking systems find the right keywords. You see every change side by side and keep only what's true.</p>
          <ul class="lp-list">
            <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Keeps your employers, dates and numbers exactly as you wrote them</li>
            <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Skills you don't show are suggested separately — you decide</li>
            <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Then an ATS check scores your match against the offer</li>
          </ul>
        </div>
        <div class="lp-ba">
          <div class="lp-ba-card before">
            <div class="lp-ba-lbl">Before</div>
            <div class="lp-ba-role">Support Agent · Acme Telecom</div>
            <p>Answered around 40 customer calls a day. Resolved billing issues. Trained 2 new starters.</p>
          </div>
          <div class="lp-ba-arrow"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></div>
          <div class="lp-ba-card after">
            <div class="lp-ba-lbl">After — for a Customer Success role</div>
            <div class="lp-ba-role">Support Agent · Acme Telecom</div>
            <ul>
              <li>Managed approximately 40 inbound customer calls daily</li>
              <li>Resolved customer billing issues</li>
              <li>Trained two new team members</li>
            </ul>
            <div class="lp-ba-tags"><span>+ customer success</span><span>+ onboarding</span><span class="warn">Zendesk — only if true</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Templates -->
    <section class="lp-sec" id="templates">
      <div class="lp-wrap">
        <div class="lp-sec-hd">
          <span class="lp-eyebrow">Templates</span>
          <h2>50 layouts · 12 colours</h2>
          <p>ATS-friendly layouts for online applications, creative ones for print and in person. All real, selectable text — switch any time and your content moves with you.</p>
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
    <section class="lp-sec lp-alt">
      <div class="lp-wrap">
        <div class="lp-sec-hd">
          <span class="lp-eyebrow">Why CVMaster</span>
          <h2>Everything a CV needs. Nothing it doesn't.</h2>
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
    <section class="lp-sec" id="pricing">
      <div class="lp-wrap">
        <div class="lp-sec-hd">
          <span class="lp-eyebrow">Pricing</span>
          <h2>Free to build. Pay once when you're ready.</h2>
          <p>No subscriptions, no trials that renew.</p>
        </div>
        <div class="lp-prices">
          <div v-for="p in PLANS" :key="p.name" class="lp-price" :class="{ featured: p.featured }">
            <span v-if="p.featured" class="lp-pop">Recommended</span>
            <h3>{{ p.name }}</h3>
            <div class="lp-amt">{{ p.price }}<span>{{ p.per }}</span></div>
            <ul>
              <li v-for="it in p.items" :key="it">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ it }}
              </li>
            </ul>
            <button class="btn-block btn-lg" :class="p.featured ? 'btn-primary accent' : 'btn-secondary'" @click="$emit('start')">{{ p.cta }}</button>
          </div>
        </div>
        <p class="lp-small">Invite friends: every sign-up with your referral link earns you a free export.</p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="lp-sec lp-alt" id="faq">
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
        <BrandLogo mark-only large />
        <h2>Your next CV is ten minutes away.</h2>
        <p>Free to build. No account needed to start.</p>
        <button class="btn-lg lp-final-btn" @click="$emit('start')">Build my CV — free</button>
      </div>
    </section>

    <footer class="lp-foot">
      <div class="lp-wrap lp-foot-in">
        <BrandLogo small />
        <span>© {{ new Date().getFullYear() }} CVMaster · Made for job seekers in the UK and France</span>
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

const TRUST = ['No account needed to start', 'Free to build', 'English & Français']
const CHECKS = ['Keywords from the job offer', 'Fits on one A4 page', 'Readable by ATS software']

const STEPS = [
  { t: 'Build or import', d: 'Fill in guided steps, tell your story and let AI structure it, or upload the CV you already have (PDF or Word).' },
  { t: 'Tailor it to the job', d: 'Paste the job offer. AI suggests wording that matches it — you approve every change, and it never invents experience.' },
  { t: 'Check and export', d: 'See your ATS match and missing keywords, fix what matters, then export a clean one-page PDF.' },
]

// Two ATS-friendly, two creative
const SHOWCASE = [
  { id: 'modern:indigo',    name: 'Modern' },
  { id: 'harvard:charcoal', name: 'Harvard' },
  { id: 'magazine:crimson', name: 'Magazine' },
  { id: 'bento:plum',       name: 'Bento' },
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
  { t: 'English & Français', d: 'Switch language and your whole CV is translated for you to review — headings, summary, experience and skills.',
    i: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>' },
  { t: 'Start without an account', d: 'Build and preview for free, right away. Create an account only when you want to export.',
    i: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>' },
]

const PLANS = [
  { name: 'Free', price: '£0', per: '', cta: 'Start building',
    items: ['All 50 layouts and 12 colours', 'AI writing and job tailoring', 'ATS job-match check', 'Watermarked PDF download'] },
  { name: 'Clean PDF', price: '£0.99', per: ' per CV', cta: 'Build my CV', featured: true,
    items: ['Watermark-free, one-page PDF', 'Emailed to you and downloadable', 'Re-send or download again free, even after edits', 'Pay once per CV — no subscription'] },
]

const FAQ = [
  { q: 'Is it really free to start?', a: 'Yes. You can build, edit, tailor and preview your CV without paying or creating an account. You only pay if you want the clean PDF: £0.99 once per CV, emailed and downloadable, and you can re-send or download it again for free after edits.' },
  { q: 'Will my CV pass applicant tracking systems (ATS)?', a: 'No one can honestly guarantee that, because every company configures its ATS differently. What we do: every layout is plain, selectable text in a logical reading order with standard headings, and the ATS check shows how well your CV matches the specific job offer so you can close the gaps.' },
  { q: 'Does the AI make things up?', a: 'It is instructed not to. It rewrites and reorders what you have written using the job offer’s language, and you approve every change. Keywords you do not show evidence of are listed separately so you only add the ones that are true.' },
  { q: 'Do I need an account?', a: 'Not to build. Your CV is saved in your browser as you go. When you want to export, you create a free account (email or Google) and your CV moves into it automatically.' },
  { q: 'Can I write my CV in French?', a: 'Yes. Switch the CV language to Français and your whole CV is translated for you to review before anything changes — headings follow automatically.' },
]
</script>

<style scoped>
.lp{height:100vh;height:100dvh;overflow-y:auto;background:var(--c-surface);color:var(--c-text)}
.lp-wrap{max-width:1160px;margin:0 auto;padding:0 24px}

.lp-nav{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--c-surface) 86%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid transparent;transition:border-color .2s}
.lp-nav.scrolled{border-bottom-color:var(--c-border)}
.lp-nav-in{height:70px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.lp-links{display:flex;gap:26px}
.lp-links a{color:var(--c-text2);text-decoration:none;font-size:14.5px;font-weight:500}
.lp-links a:hover{color:var(--c-text)}
.lp-nav-cta{display:flex;gap:6px}

/* Hero */
.lp-hero{position:relative;padding:60px 0 84px;overflow:hidden;
  background:radial-gradient(900px 480px at 88% 0%,rgba(67,56,202,.13),transparent 62%),radial-gradient(700px 400px at 0% 100%,rgba(165,180,252,.18),transparent 60%)}
.lp-hero::before{content:'';position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(rgba(67,56,202,.10) 1px,transparent 1px);background-size:22px 22px;
  mask-image:linear-gradient(180deg,#000 0%,transparent 75%);-webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 75%)}
.lp-hero-in{position:relative;display:grid;grid-template-columns:1fr 1.02fr;gap:56px;align-items:center}
.lp-pill{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 12px 0 5px;border-radius:999px;border:1px solid var(--c-border);background:var(--c-surface);font-size:13.5px;font-weight:600;color:var(--c-text);box-shadow:var(--shadow-xs)}
.lp-pill:hover{border-color:var(--c-border2)}
.lp-pill-tag{height:24px;display:inline-flex;align-items:center;padding:0 9px;border-radius:999px;background:var(--c-accent);color:#fff;font-size:12px;font-weight:700}
.lp-pill svg{width:14px;height:14px;fill:none;stroke:var(--c-text3);stroke-width:2.2}
.lp-hero-copy h1{font-size:clamp(36px,4.9vw,58px);line-height:1.04;letter-spacing:-.04em;font-weight:800;margin:22px 0 18px}
.lp-hl{color:var(--c-accent);background:linear-gradient(transparent 72%,rgba(165,180,252,.55) 72%,rgba(165,180,252,.55) 92%,transparent 92%)}
.lp-lead{font-size:18.5px;line-height:1.6;color:var(--c-text2);max-width:540px}
.lp-cta{display:flex;gap:10px;margin-top:30px;flex-wrap:wrap}
.lp-cta svg{width:17px;height:17px}
.lp-trust{list-style:none;display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:22px}
.lp-trust li{display:flex;align-items:center;gap:7px;font-size:14px;color:var(--c-text2);font-weight:500}
.lp-trust svg{width:16px;height:16px;fill:none;stroke:var(--c-pass);stroke-width:2.6}

.lp-hero-art{position:relative;padding:18px 0 40px}
.lp-app{border-radius:16px;background:var(--c-surface);border:1px solid var(--c-border);box-shadow:0 2px 4px rgba(20,20,43,.05),0 30px 70px rgba(20,20,43,.16);overflow:hidden}
.lp-app-bar{height:36px;display:flex;align-items:center;gap:6px;padding:0 14px;border-bottom:1px solid var(--c-border);background:var(--c-surface2)}
.lp-app-bar > span{width:10px;height:10px;border-radius:50%;background:#E4E4EE}
.lp-app-url{margin-left:10px;height:20px;padding:0 10px;border-radius:6px;background:var(--c-surface);border:1px solid var(--c-border);font-size:11px;color:var(--c-text3);display:flex;align-items:center}
.lp-app-body{display:grid;grid-template-columns:150px 1fr;min-height:360px}
.lp-app-side{border-right:1px solid var(--c-border);padding:12px;display:flex;flex-direction:column;gap:8px;background:var(--c-bg)}
.lp-app-tab{font-size:11px;font-weight:600;color:var(--c-text3);padding:5px 8px;border-radius:6px}
.lp-app-tab.on{background:var(--c-surface);color:var(--c-text);box-shadow:var(--shadow-xs)}
.lp-app-row{display:flex;align-items:center;gap:7px;padding:8px;border-radius:8px;background:var(--c-surface);border:1px solid var(--c-border)}
.lp-app-row i{width:10px;height:10px;border-radius:50%;background:var(--c-pass);flex-shrink:0}
.lp-app-row b{height:6px;border-radius:4px;background:#E4E4EE;display:block}
.lp-app-page{padding:18px 26px 0;background:var(--c-canvas);overflow:hidden;max-height:380px}
.lp-app-page :deep(.cvt){box-shadow:0 1px 3px rgba(20,20,43,.08),0 10px 30px rgba(20,20,43,.10);border-radius:3px 3px 0 0}
.lp-float{position:absolute;background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;box-shadow:var(--shadow-lg)}
.lp-float.f1{left:-30px;bottom:0;padding:14px 16px;width:250px}
.lp-float-hd{font-size:12px;font-weight:700;color:var(--c-text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.lp-float-row{display:flex;align-items:center;gap:9px;font-size:13.5px;font-weight:600;padding:4px 0}
.lp-float-row .ok{width:20px;height:20px;border-radius:50%;background:var(--c-green-lt);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.lp-float-row .ok svg{width:12px;height:12px;fill:none;stroke:var(--c-pass);stroke-width:3}
.lp-float.f2{right:-18px;top:-4px;display:flex;align-items:center;gap:12px;padding:12px 16px 12px 12px}
.lp-float-ic{width:38px;height:38px;border-radius:11px;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center}
.lp-float-ic svg{width:20px;height:20px;fill:none;stroke:var(--c-accent);stroke-width:2}
.lp-float-t{font-size:14px;font-weight:700}
.lp-float-s{font-size:12.5px;color:var(--c-text2)}

/* Sections */
.lp-sec{padding:92px 0}
.lp-alt{background:var(--c-bg)}
.lp-sec-hd{max-width:660px;margin:0 auto 46px;text-align:center}
.lp-eyebrow{font-size:13.5px;font-weight:700;color:var(--c-accent)}
.lp-sec h2{font-size:clamp(27px,3.3vw,38px);letter-spacing:-.035em;font-weight:800;margin-top:8px;line-height:1.12}
.lp-sec-hd p{color:var(--c-text2);margin-top:12px;font-size:16.5px;line-height:1.6}

.lp-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.lp-step{padding:28px;border-radius:18px;border:1px solid var(--c-border);background:var(--c-surface);box-shadow:var(--shadow-xs)}
.lp-step-n{width:36px;height:36px;border-radius:10px;background:var(--c-accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;margin-bottom:18px}
.lp-step h3{font-size:18px;font-weight:700;margin-bottom:8px;letter-spacing:-.01em}
.lp-step p{color:var(--c-text2);line-height:1.6;font-size:15px}

.lp-tailor{display:grid;grid-template-columns:1fr 1.05fr;gap:56px;align-items:center}
.lp-tailor-copy h2{margin-bottom:14px}
.lp-tailor-copy > p{color:var(--c-text2);font-size:16.5px;line-height:1.65}
.lp-list{list-style:none;display:flex;flex-direction:column;gap:12px;margin-top:22px}
.lp-list li{display:flex;gap:10px;font-size:15px;line-height:1.5;color:var(--c-text)}
.lp-list svg{width:18px;height:18px;flex-shrink:0;fill:none;stroke:var(--c-pass);stroke-width:2.6;margin-top:2px}
.lp-ba{display:flex;flex-direction:column;align-items:stretch}
.lp-ba-card{border-radius:16px;padding:20px 22px;border:1px solid var(--c-border);background:var(--c-surface)}
.lp-ba-card.before{color:var(--c-text2)}
.lp-ba-card.after{border-color:var(--c-accent);box-shadow:0 0 0 1px var(--c-accent),var(--shadow-lg)}
.lp-ba-lbl{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--c-text3);margin-bottom:8px}
.lp-ba-card.after .lp-ba-lbl{color:var(--c-accent)}
.lp-ba-role{font-weight:700;color:var(--c-text);margin-bottom:6px}
.lp-ba-card p{line-height:1.6}
.lp-ba-card ul{padding-left:18px;line-height:1.7}
.lp-ba-card li::marker{color:var(--c-accent)}
.lp-ba-arrow{align-self:center;width:36px;height:36px;margin:-6px 0;z-index:1;border-radius:50%;background:var(--c-accent);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 5px var(--c-bg)}
.lp-ba-arrow svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2.5}
.lp-ba-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.lp-ba-tags span{font-size:12.5px;font-weight:600;padding:4px 10px;border-radius:999px;background:var(--c-accent-lt);color:var(--c-accent)}
.lp-ba-tags span.warn{background:var(--c-amber-lt);color:var(--c-amber)}

.lp-tpls{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.lp-tpl{margin:0}
.lp-tpl-img{border-radius:8px;overflow:hidden;border:1px solid var(--c-border);box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s}
.lp-tpl:hover .lp-tpl-img{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.lp-tpl figcaption{text-align:center;margin-top:12px;font-weight:700;font-size:14.5px}
.lp-center{text-align:center;margin-top:36px}

.lp-feats{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.lp-feat{padding:26px;border-radius:18px;background:var(--c-surface);border:1px solid var(--c-border)}
.lp-feat-ic{width:42px;height:42px;border-radius:12px;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.lp-feat-ic svg{width:21px;height:21px;fill:none;stroke:var(--c-accent);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.lp-feat h3{font-size:17px;font-weight:700;margin-bottom:6px}
.lp-feat p{color:var(--c-text2);line-height:1.6;font-size:15px}

.lp-prices{display:grid;grid-template-columns:repeat(2,minmax(0,380px));justify-content:center;gap:18px;align-items:stretch}
.lp-price{padding:30px;display:flex;flex-direction:column;position:relative;border-radius:20px;border:1px solid var(--c-border);background:var(--c-surface)}
.lp-price.featured{background:#14142B;border-color:#14142B;color:#fff;box-shadow:0 24px 60px rgba(20,20,43,.25)}
.lp-price.featured h3,.lp-price.featured li{color:rgba(255,255,255,.78)}
.lp-price.featured .lp-amt span{color:rgba(255,255,255,.6)}
.lp-price.featured li svg{stroke:#A5B4FC}
.lp-pop{position:absolute;top:22px;right:22px;font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;background:#A5B4FC;color:#14142B}
.lp-price h3{font-size:16px;font-weight:700;color:var(--c-text2)}
.lp-amt{font-size:44px;font-weight:800;letter-spacing:-.04em;margin:8px 0 20px}
.lp-amt span{font-size:14.5px;font-weight:500;color:var(--c-text3);letter-spacing:0}
.lp-price ul{list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:26px;flex:1}
.lp-price li{display:flex;gap:9px;font-size:15px;color:var(--c-text2);line-height:1.45}
.lp-price li svg{width:17px;height:17px;flex-shrink:0;fill:none;stroke:var(--c-pass);stroke-width:2.4;margin-top:2px}
.lp-small{text-align:center;color:var(--c-text3);margin-top:26px;font-size:14px}

.lp-faq-wrap{max-width:780px}
.lp-faq{border-bottom:1px solid var(--c-border)}
.lp-faq summary{list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:22px 0;font-weight:700;font-size:16.5px;cursor:pointer}
.lp-faq summary::-webkit-details-marker{display:none}
.lp-faq summary svg{width:18px;height:18px;flex-shrink:0;fill:none;stroke:var(--c-text3);stroke-width:2;transition:transform .2s}
.lp-faq[open] summary svg{transform:rotate(180deg)}
.lp-faq p{color:var(--c-text2);line-height:1.7;padding:0 0 22px;font-size:15.5px}

.lp-final{padding:88px 0;background:#14142B;position:relative;overflow:hidden}
.lp-final::before{content:'';position:absolute;inset:0;background:radial-gradient(600px 300px at 50% 0%,rgba(99,102,241,.35),transparent 70%)}
.lp-final-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}
.lp-final h2{color:#fff;font-size:clamp(28px,3.6vw,42px);letter-spacing:-.035em;font-weight:800;margin-top:6px}
.lp-final p{color:rgba(255,255,255,.7);font-size:16.5px}
.lp-final-btn{margin-top:10px;background:#fff;color:#14142B;border:none;border-radius:11px;font-weight:700;display:inline-flex;align-items:center;height:48px;padding:0 24px;font-size:15.5px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.lp-final-btn:hover{background:#EEF0FF}

.lp-foot{padding:30px 0;border-top:1px solid var(--c-border)}
.lp-foot-in{display:flex;align-items:center;gap:20px;font-size:13.5px;color:var(--c-text3)}
.lp-foot nav{margin-left:auto;display:flex;gap:20px}
.lp-foot a{color:var(--c-text2);text-decoration:none}
.lp-foot a:hover{color:var(--c-text)}

@media (max-width:1000px){
  .lp-links{display:none}
  .lp-hero-in,.lp-tailor{grid-template-columns:1fr}
  .lp-hero-art{max-width:560px;width:100%;margin:0 auto}
  .lp-steps,.lp-prices{grid-template-columns:1fr}
  .lp-feats{grid-template-columns:1fr 1fr}
  .lp-tpls{grid-template-columns:1fr 1fr}
  .lp-float.f1{left:0}
  .lp-float.f2{right:0}
}
@media (max-width:560px){
  .lp-nav-cta .btn-ghost{display:none}
  .lp-hero{padding-top:30px}
  .lp-app-body{grid-template-columns:1fr}
  .lp-app-side{display:none}
  .lp-float.f1{position:relative;left:auto;bottom:auto;width:auto;margin-top:14px}
  .lp-float.f2{display:none}
  .lp-feats{grid-template-columns:1fr}
  .lp-sec{padding:64px 0}
  .lp-foot-in{flex-direction:column;gap:12px;text-align:center}
  .lp-foot nav{margin-left:0}
}
</style>
