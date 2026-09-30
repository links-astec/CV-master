<template>
  <div class="lp" ref="rootEl">
    <!-- Nav -->
    <header class="lp-nav" :class="{ scrolled }">
      <div class="lp-wrap lp-nav-in">
        <BrandLogo />
        <nav class="lp-links">
          <a href="#templates" @click.prevent="go('#templates')">Templates</a>
          <a href="#pricing" @click.prevent="go('#pricing')">Pricing</a>
          <a href="#faq" @click.prevent="go('#faq')">FAQ</a>
        </nav>
        <div class="lp-nav-cta">
          <button v-if="!signedIn" class="btn-ghost" @click="$emit('sign-in')">Sign in</button>
          <button class="btn-primary accent" @click="$emit('start')">{{ signedIn ? 'Open my CVs' : 'Build my CV' }}</button>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="lp-hero">
      <div class="lp-wrap lp-hero-in">
        <div class="lp-hero-copy">
          <h1>A CV that gets you <span class="lp-hl">the interview.</span></h1>
          <p class="lp-lead">Build it in minutes, tailor it to the job, and see how well it matches — before you apply.</p>
          <div class="lp-cta">
            <button class="btn-primary accent btn-lg" @click="$emit('start')">
              Build my CV — free
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button class="btn-ghost btn-lg" @click="go('#templates')">See templates</button>
          </div>
          <ul class="lp-trust">
            <li v-for="t in TRUST" :key="t"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ t }}</li>
          </ul>
        </div>

        <div class="lp-hero-art" aria-hidden="true">
          <div class="lp-page"><CvThumb template="modern:indigo" :data="SAMPLE_CV" /></div>
          <div class="lp-check">
            <div class="lp-check-score"><span>86%</span>job match</div>
            <div v-for="c in CHECKS" :key="c" class="lp-check-row"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ c }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="lp-sec lp-alt" id="how">
      <div class="lp-wrap">
        <h2 class="lp-h2">Three steps, about ten minutes</h2>
        <div class="lp-steps">
          <div v-for="(s, i) in STEPS" :key="s.t" class="lp-step">
            <span class="lp-step-n">{{ i + 1 }}</span>
            <h3>{{ s.t }}</h3>
            <p>{{ s.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Templates -->
    <section class="lp-sec" id="templates">
      <div class="lp-wrap">
        <h2 class="lp-h2">50 templates, 12 colours</h2>
        <p class="lp-sub">Plain ATS-friendly ones for online applications, creative ones for print and in person.</p>
        <div class="lp-tpls">
          <figure v-for="t in SHOWCASE" :key="t.id" class="lp-tpl">
            <div class="lp-tpl-img"><CvThumb :template="t.id" :data="SAMPLE_CV" /></div>
            <figcaption>{{ t.name }}</figcaption>
          </figure>
        </div>
        <div class="lp-center"><button class="btn-secondary" @click="$emit('start')">Browse all templates</button></div>
      </div>
    </section>

    <!-- Reviews — real ones only, shown once there are enough -->
    <section v-if="rv.average" class="lp-sec" id="reviews">
      <div class="lp-wrap">
        <h2 class="lp-h2">Rated {{ rv.average.toFixed(1) }} out of 5</h2>
        <p class="lp-sub"><span class="lp-stars" :aria-label="`${rv.average} out of 5 stars`">{{ '★'.repeat(Math.round(rv.average)) }}<span>{{ '★'.repeat(5 - Math.round(rv.average)) }}</span></span> from {{ rv.count }} reviews by people who built their CV here</p>
        <div v-if="rv.reviews.length" class="lp-reviews">
          <figure v-for="(r, i) in rv.reviews.slice(0, 3)" :key="i" class="lp-review">
            <div class="lp-stars">{{ '★'.repeat(r.rating) }}<span>{{ '★'.repeat(5 - r.rating) }}</span></div>
            <blockquote>“{{ r.comment }}”</blockquote>
            <figcaption>{{ r.name }}<span v-if="r.role"> · {{ r.role }}</span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="lp-sec lp-alt" id="pricing">
      <div class="lp-wrap">
        <h2 class="lp-h2">Free to build. €0.99 when you’re ready.</h2>
        <p class="lp-sub">No subscription, no trial that renews.</p>
        <div class="lp-prices">
          <div v-for="p in PLANS" :key="p.name" class="lp-price" :class="{ featured: p.featured }">
            <h3>{{ p.name }}</h3>
            <div class="lp-amt">{{ p.price }}<span>{{ p.per }}</span></div>
            <ul>
              <li v-for="it in p.items" :key="it"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ it }}</li>
            </ul>
            <button class="btn-block btn-lg" :class="p.featured ? 'btn-primary accent' : 'btn-secondary'" @click="$emit('start')">{{ p.cta }}</button>
          </div>
        </div>
        <p class="lp-small">Need more AI? 100 extra requests cost €0.50 and never expire.</p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="lp-sec" id="faq">
      <div class="lp-wrap lp-faq-wrap">
        <h2 class="lp-h2">Questions</h2>
        <details v-for="q in FAQ" :key="q.q" class="lp-faq">
          <summary>{{ q.q }}<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></summary>
          <p>{{ q.a }}</p>
        </details>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="lp-final">
      <div class="lp-wrap lp-final-in">
        <h2>Ready when you are.</h2>
        <button class="btn-primary accent btn-lg" @click="$emit('start')">Build my CV — free</button>
      </div>
    </section>

    <footer class="lp-foot">
      <div class="lp-wrap lp-foot-in">
        <BrandLogo small />
        <span>© {{ new Date().getFullYear() }} CVMaster</span>
        <nav><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="#" @click.prevent="openFeedback?.()">Feedback</a><a href="mailto:support@cvmaster.live">Contact</a></nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import BrandLogo from '../components/BrandLogo.vue'
import CvThumb from '../components/CvThumb.vue'
import { SAMPLE_CV } from '../composables/sampleCv.js'

const openFeedback = inject('openFeedback', null)

// Real reviews; the rating is also given to search engines (structured data) once shown
const rv = ref({ count: 0, average: null, reviews: [] })
onMounted(async () => {
  try {
    const r = await fetch((import.meta.env.VITE_API_URL || '') + '/api/reviews/public')
    if (!r.ok) return
    rv.value = await r.json()
    if (!rv.value.average || document.getElementById('ld-rating')) return
    const ld = document.createElement('script')
    ld.type = 'application/ld+json'; ld.id = 'ld-rating'
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebApplication', name: 'CVMaster', url: 'https://www.cvmaster.live/',
      applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: rv.value.average, ratingCount: rv.value.count, bestRating: 5, worstRating: 1 },
    })
    document.head.appendChild(ld)
  } catch {}
})

defineProps({ signedIn: Boolean })
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

const TRUST  = ['No account needed to start', 'English & Français']
const CHECKS = ['Keywords from the job', 'One A4 page', 'Readable by ATS']

const STEPS = [
  { t: 'Build', d: 'Fill in guided steps, tell your story, or import the CV you already have.' },
  { t: 'Tailor', d: 'Paste the job offer. AI rewords your CV in the employer’s language — it never invents anything, and you approve every change.' },
  { t: 'Check & export', d: 'See your ATS match and what’s missing, fix it, then download a clean one-page PDF.' },
]

// Two ATS-friendly, two creative
const SHOWCASE = [
  { id: 'modern:indigo',    name: 'Modern' },
  { id: 'harvard:charcoal', name: 'Harvard' },
  { id: 'magazine:crimson', name: 'Magazine' },
  { id: 'bento:plum',       name: 'Bento' },
]

const PLANS = [
  { name: 'Free', price: '€0', per: '', cta: 'Start building',
    items: ['All 50 templates', 'AI help — 30 requests a day with a free account', 'ATS job-match check', 'Preview PDF with watermark'] },
  { name: 'Clean PDF', price: '€0.99', per: ' per CV', cta: 'Build my CV', featured: true,
    items: ['Watermark-free, one-page PDF', 'Emailed and downloadable', 'Free re-downloads after edits'] },
]

const FAQ = [
  { q: 'Is it really free to start?', a: 'Yes. Build, edit, tailor and preview your CV without paying or signing up. You only pay €0.99 if you want the clean PDF of a CV — and you can download it again for free after edits.' },
  { q: 'Will my CV pass applicant tracking systems (ATS)?', a: 'Nobody can honestly guarantee it — every company sets up its ATS differently. Our ATS-friendly templates use plain, selectable text and standard headings, and the ATS check shows how well your CV matches the specific job so you can close the gaps.' },
  { q: 'Does the AI make things up?', a: 'No. It rewords what you wrote using the job’s language, and you approve every change. Skills you don’t show are only suggested, so you add just the ones that are true.' },
  { q: 'Can I write my CV in French?', a: 'Yes. Switch the CV to Français and your whole CV is translated for you to review.' },
]
</script>

<style scoped>
.lp{height:100vh;height:100dvh;overflow-y:auto;background:var(--c-surface);color:var(--c-text)}
.lp-wrap{max-width:1080px;margin:0 auto;padding:0 24px}

.lp-nav{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--c-surface) 88%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid transparent;transition:border-color .2s}
.lp-nav.scrolled{border-bottom-color:var(--c-border)}
.lp-nav-in{height:68px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.lp-links{display:flex;gap:28px}
.lp-links a{color:var(--c-text2);text-decoration:none;font-size:14.5px;font-weight:500}
.lp-links a:hover{color:var(--c-text)}
.lp-nav-cta{display:flex;gap:6px}

/* Hero */
.lp-hero{padding:64px 0 80px;background:linear-gradient(180deg,var(--c-accent-lt) 0%,var(--c-surface) 85%)}
.lp-hero-in{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
.lp-hero-copy h1{font-size:clamp(38px,5vw,60px);line-height:1.03;letter-spacing:-.04em;font-weight:800;margin-bottom:18px}
.lp-hl{color:var(--c-accent)}
.lp-lead{font-size:19px;line-height:1.55;color:var(--c-text2);max-width:480px}
.lp-cta{display:flex;gap:8px;margin-top:30px;flex-wrap:wrap}
.lp-cta svg{width:17px;height:17px}
.lp-trust{list-style:none;display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:22px;padding:0}
.lp-trust li{display:flex;align-items:center;gap:7px;font-size:14px;color:var(--c-text2);font-weight:500}
.lp-trust svg{width:16px;height:16px;fill:none;stroke:var(--c-pass);stroke-width:2.6}

.lp-hero-art{position:relative;max-width:420px;margin-left:auto;width:100%}
.lp-page{border-radius:8px;overflow:hidden;background:#fff;box-shadow:0 2px 4px rgba(20,20,43,.05),0 28px 60px rgba(20,20,43,.16);transform:rotate(1.5deg)}
.lp-check{position:absolute;left:-44px;bottom:28px;width:210px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;padding:14px 16px;box-shadow:var(--shadow-lg)}
.lp-check-score{font-size:12.5px;color:var(--c-text3);margin-bottom:8px}
.lp-check-score span{display:block;font-size:30px;font-weight:800;letter-spacing:-.03em;color:var(--c-pass);line-height:1.1}
.lp-check-row{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;padding:3px 0}
.lp-check-row svg{width:14px;height:14px;flex-shrink:0;fill:none;stroke:var(--c-pass);stroke-width:3}

/* Sections */
.lp-sec{padding:84px 0}
.lp-alt{background:var(--c-bg)}
.lp-h2{font-size:clamp(27px,3.2vw,36px);letter-spacing:-.035em;font-weight:800;line-height:1.12;text-align:center}
.lp-sub{text-align:center;color:var(--c-text2);margin-top:10px;font-size:16.5px;line-height:1.6}

.lp-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:40px}
.lp-step{padding:26px}
.lp-step-n{width:34px;height:34px;border-radius:10px;background:var(--c-accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;margin-bottom:16px}
.lp-step h3{font-size:18px;font-weight:700;margin-bottom:6px;letter-spacing:-.01em}
.lp-step p{color:var(--c-text2);line-height:1.6;font-size:15px}

.lp-tpls{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:40px}
.lp-tpl{margin:0}
.lp-tpl-img{border-radius:8px;overflow:hidden;border:1px solid var(--c-border);box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s}
.lp-tpl:hover .lp-tpl-img{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.lp-tpl figcaption{text-align:center;margin-top:12px;font-weight:700;font-size:14.5px}
.lp-center{text-align:center;margin-top:34px}

.lp-stars{color:#F59E0B;letter-spacing:1px}
.lp-stars span{color:var(--c-border2)}
.lp-reviews{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:36px}
.lp-review{margin:0;padding:22px;border:1px solid var(--c-border);border-radius:18px;background:var(--c-surface);display:flex;flex-direction:column;gap:10px}
.lp-review blockquote{margin:0;font-size:15px;line-height:1.6;color:var(--c-text)}
.lp-review figcaption{font-size:13.5px;font-weight:700;color:var(--c-text2);margin-top:auto}
.lp-review figcaption span{font-weight:500;color:var(--c-text3)}
.lp-prices{display:grid;grid-template-columns:repeat(2,minmax(0,360px));justify-content:center;gap:18px;align-items:stretch;margin-top:40px}
.lp-price{padding:28px;display:flex;flex-direction:column;border-radius:20px;border:1px solid var(--c-border);background:var(--c-surface)}
.lp-price.featured{border-color:var(--c-accent);box-shadow:0 0 0 1px var(--c-accent),var(--shadow-lg)}
.lp-price h3{font-size:16px;font-weight:700;color:var(--c-text2)}
.lp-amt{font-size:42px;font-weight:800;letter-spacing:-.04em;margin:6px 0 18px}
.lp-amt span{font-size:14.5px;font-weight:500;color:var(--c-text3);letter-spacing:0}
.lp-price ul{list-style:none;display:flex;flex-direction:column;gap:10px;margin:0 0 24px;padding:0;flex:1}
.lp-price li{display:flex;gap:9px;font-size:15px;color:var(--c-text2);line-height:1.45}
.lp-price li svg{width:17px;height:17px;flex-shrink:0;fill:none;stroke:var(--c-pass);stroke-width:2.4;margin-top:2px}
.lp-small{text-align:center;color:var(--c-text3);margin-top:22px;font-size:14px}

.lp-faq-wrap{max-width:740px}
.lp-faq-wrap .lp-h2{margin-bottom:24px}
.lp-faq{border-bottom:1px solid var(--c-border)}
.lp-faq summary{list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 0;font-weight:700;font-size:16.5px;cursor:pointer}
.lp-faq summary::-webkit-details-marker{display:none}
.lp-faq summary svg{width:18px;height:18px;flex-shrink:0;fill:none;stroke:var(--c-text3);stroke-width:2;transition:transform .2s}
.lp-faq[open] summary svg{transform:rotate(180deg)}
.lp-faq p{color:var(--c-text2);line-height:1.7;padding:0 0 20px;font-size:15.5px}

.lp-final{padding:72px 0;background:var(--c-accent-lt)}
.lp-final-in{display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center}
.lp-final h2{font-size:clamp(26px,3.2vw,36px);letter-spacing:-.035em;font-weight:800}

.lp-foot{padding:26px 0;border-top:1px solid var(--c-border)}
.lp-foot-in{display:flex;align-items:center;gap:18px;font-size:13.5px;color:var(--c-text3)}
.lp-foot nav{margin-left:auto;display:flex;gap:20px}
.lp-foot a{color:var(--c-text2);text-decoration:none}
.lp-foot a:hover{color:var(--c-text)}

@media (max-width:900px){
  .lp-links{display:none}
  .lp-hero-in{grid-template-columns:1fr;gap:40px}
  .lp-hero-art{margin:0 auto;max-width:360px}
  .lp-check{left:-18px}
  .lp-steps,.lp-prices,.lp-reviews{grid-template-columns:1fr}
  .lp-tpls{grid-template-columns:1fr 1fr}
  .lp-step{padding:8px 4px}
}
@media (max-width:560px){
  .lp-nav-cta .btn-ghost{display:none}
  .lp-hero{padding:36px 0 56px}
  .lp-check{position:relative;left:auto;bottom:auto;width:auto;margin-top:-30px;margin-left:16px;margin-right:16px}
  .lp-sec{padding:60px 0}
  .lp-foot-in{flex-direction:column;gap:10px;text-align:center}
  .lp-foot nav{margin-left:0}
}
</style>
