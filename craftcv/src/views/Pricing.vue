<template>
  <div class="view-page px-page">
    <div class="view-inner pr">
      <!-- Hero: plain, confident type -->
      <header class="px-hero">
        <p class="px-eyebrow hide-mobile">{{ $t('Pricing') }}</p>
        <h1 class="px-h1">{{ $t('Free to build.') }} <span>{{ $t('Pay only when you send it.') }}</span></h1>
        <p class="px-lead">{{ $t('Build, tailor and check every CV for free. When you’re ready to apply, download it once for €0.99, or get every CV with the Job Hunt Pass.') }}</p>
      </header>

      <!-- Plans -->
      <section class="px-plans">
        <article class="px-plan" v-reveal>
          <h2>{{ $t('Free') }}</h2>
          <p class="px-sub">{{ $t('Everything you need to write a great CV') }}</p>
          <div class="px-amt">€0</div>
          <div class="px-per">{{ $t('forever') }}</div>
          <button class="px-btn" @click="start('new')">{{ $t('Start building') }}</button>
          <ul><li v-for="f in FREE" :key="f"><Tick />{{ $t(f) }}</li></ul>
        </article>

        <article class="px-plan" v-reveal="60">
          <h2>{{ $t('Clean PDF') }}</h2>
          <p class="px-sub">{{ $t('For one great application') }}</p>
          <div class="px-amt">€0.99</div>
          <div class="px-per">{{ $t('per CV, once') }}<template v-if="approx(0.99)"> · {{ approx(0.99) }}</template></div>
          <button class="px-btn" @click="start('new')">{{ $t('Build my CV') }}</button>
          <ul><li v-for="f in ONE" :key="f"><Tick />{{ $t(f) }}</li></ul>
        </article>

        <article class="px-plan px-pass" v-reveal="120">
          <p class="px-best">{{ $t('Best for job hunters') }}</p>
          <h2>{{ $t('Job Hunt Pass') }}</h2>
          <p class="px-sub">{{ $t('For applying to lots of jobs') }}</p>
          <div class="px-seg" role="radiogroup" :aria-label="$t('Job Hunt Pass billing')">
            <button type="button" role="radio" :aria-checked="bill === 'month'" :class="{ on: bill === 'month' }" @click="bill = 'month'">{{ $t('Monthly') }}</button>
            <button type="button" role="radio" :aria-checked="bill === 'quarter'" :class="{ on: bill === 'quarter' }" @click="bill = 'quarter'">{{ $t('Every 3 months') }}</button>
          </div>
          <Transition name="px-fade" mode="out-in">
            <div :key="bill">
              <div class="px-amt">{{ bill === 'quarter' ? '€14.99' : '€6.99' }}</div>
              <div class="px-per">{{ $t(bill === 'quarter' ? 'every 3 months · €5.00 a month' : 'a month') }}<template v-if="approx(bill === 'quarter' ? 14.99 : 6.99)"> · {{ approx(bill === 'quarter' ? 14.99 : 6.99) }}</template></div>
              <div class="px-save">{{ bill === 'quarter' ? $t('You save 29% compared with paying monthly.') : ' ' }}</div>
            </div>
          </Transition>
          <button class="px-btn px-btn-light" @click="getPass">{{ $t(passActive ? 'Manage my pass' : 'Get the pass') }}</button>
          <ul><li v-for="f in PASS" :key="f"><Tick />{{ $t(f) }}</li></ul>
          <p class="px-fine">{{ $t('Cancel any time. It then runs to the end of the period you paid for.') }}</p>
        </article>
      </section>

      <!-- Which is cheapest for me? -->
      <section class="px-calc" v-reveal>
        <div class="px-calc-hd">
          <h2 class="px-h2">{{ $t('How many CVs will you send this month?') }}</h2>
          <p>{{ $t('A tailored CV for each job gets more interviews. Slide to see what that costs.') }}</p>
        </div>
        <div class="px-slider">
          <input type="range" min="1" max="50" v-model.number="cvs" :aria-label="$t('CVs this month')" :style="{ '--p': ((cvs - 1) / 49 * 100) + '%' }" />
          <output class="px-count"><b>{{ cvs }}</b> {{ $t(cvs === 1 ? 'CV' : 'CVs') }}</output>
        </div>
        <div class="px-rows">
          <div v-for="o in options" :key="o.k" class="px-row" :class="{ best: o.k === best }">
            <span class="px-row-l">{{ $t(o.label) }}<small v-if="o.k === best">{{ $t('Cheapest for you') }}</small></span>
            <b class="px-row-v">€{{ o.cost.toFixed(2) }}</b>
            <svg v-if="o.k === best" class="px-row-tick" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg><span v-else class="px-row-tick"></span>
          </div>
        </div>
        <p class="px-verdict">
          <template v-if="best === 'one'">{{ $t('Pay per CV: €{a} for {n}.', { a: (cvs * 0.99).toFixed(2), n: cvs }) }}</template>
          <template v-else>{{ $t('The Job Hunt Pass saves you €{s} this month, and every extra CV is free.', { s: (cvs * 0.99 - (best === 'quarter' ? 5 : 6.99)).toFixed(2) }) }}</template>
        </p>
      </section>

      <!-- Side by side (computers: the plan cards already list everything, and four columns don't fit a phone) -->
      <section v-reveal class="hide-mobile">
        <h2 class="px-h2 px-center">{{ $t('Compare the plans') }}</h2>
        <div class="px-table" role="table">
          <div class="px-tr px-th" role="row"><div role="columnheader"></div><div role="columnheader">{{ $t('Free') }}</div><div role="columnheader">{{ $t('Clean PDF') }}</div><div role="columnheader">{{ $t('Job Hunt Pass') }}</div></div>
          <div v-for="r in ROWS" :key="r[0]" class="px-tr" role="row">
            <div role="rowheader">{{ $t(r[0]) }}</div>
            <div v-for="(v, i) in r.slice(1)" :key="i" role="cell">
              <Tick v-if="v === true" /><span v-else-if="v === false" class="px-no" aria-label="No">–</span><span v-else>{{ $t(v) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Extras -->
      <section class="px-extras">
        <div class="px-extra" v-reveal>
          <h3>{{ $t('Need more AI?') }}</h3>
          <p>{{ $t('100 extra AI requests for €0.50. They never expire.') }}<template v-if="approx(0.5)"> {{ approx(0.5) }}</template></p>
          <button class="px-link" @click="buyAi">{{ $t('Get 100 more for €0.50') }} ›</button>
        </div>
        <div class="px-extra" v-reveal="60">
          <h3>{{ $t('Or earn your CVs') }}</h3>
          <p>{{ $t('Invite friends: you get a free CV for every friend who gets their first clean CV.') }}</p>
          <button class="px-link" @click="start('invite')">{{ $t('Get my invite link') }} ›</button>
        </div>
      </section>

      <!-- FAQ -->
      <section class="px-faq" v-reveal>
        <h2 class="px-h2 px-center">{{ $t('Questions') }}</h2>
        <details v-for="f in FAQ" :key="f.q"><summary>{{ $t(f.q) }}</summary><p>{{ $t(f.a) }}</p></details>
      </section>

      <section class="px-cta" v-reveal>
        <h2>{{ $t('Your next job starts with a better CV.') }}</h2>
        <button class="px-btn px-btn-dark" @click="start('new')">{{ $t('Build my CV for free') }}</button>
      </section>
    </div>
  </div>
</template>

<script setup>
// Prices side by side, with a quick "what's cheapest for me" slider. Apple-like: plain type, soft fills,
// one dark card for the pass. Payment stays in euros; visitors outside the euro area see an estimate.
import { ref, computed, inject, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { approx } from '../composables/localPrice.js'

const Tick = () => h('svg', { viewBox: '0 0 24 24', class: 'px-tick', 'aria-hidden': 'true' }, [h('polyline', { points: '20 6 9 17 4 12' })])
const router = useRouter()
const auth = useAuthStore()
const startBuilding = inject('startBuilding', null)
const openAiAllowance = inject('openAiAllowance', null)
const openAuth = inject('openAuth', null)
// The €0.50 pack is bought from the AI requests window (it needs an account)
function buyAi() { if (!auth.isLoggedIn) { openAuth?.('register'); return } openAiAllowance ? openAiAllowance() : router.push({ path: '/settings', hash: '#ai' }) }
const bill = ref('quarter')
const cvs = ref(6)
const passActive = computed(() => !!auth.user?.pass)

const FREE = ['All 50 templates in 12 colours', '30 AI requests a day with a free account', 'Tailor your CV to any job offer', 'A cover letter for each job', 'ATS score and job match check', 'Writing check as you type', 'Preview PDF with a watermark']
const ONE = ['Everything in Free', 'A watermark-free, one-page PDF', 'Emailed and downloadable', 'Free re-downloads after edits']
const PASS = ['Every CV you make as a clean PDF', 'Every cover letter as a PDF', 'Interview prep for every job offer', '100 AI requests a day', 'Cancel any time']
const ROWS = [
  ['Templates', '50', '50', '50'],
  ['AI requests a day', '30', '30', '100'],
  ['Tailor to a job offer', true, true, true],
  ['ATS score and job match', true, true, true],
  ['Tell your story (AI first draft)', true, true, true],
  ['Writing check', true, true, true],
  ['Watermark-free PDF', false, 'That CV', 'Every CV'],
  ['Emailed to you', false, true, true],
  ['Re-send after edits', false, true, true],
  ['Cover letter for each job', true, true, true],
  ['Cover letter as a PDF', false, 'With that CV', 'Every letter'],
  ['Interview prep for each job', false, false, true],
]
const FAQ = [
  { q: 'Can I cancel the Job Hunt Pass?', a: 'Yes, any time in Settings, in two clicks. Nothing more is charged, and the pass keeps working until the end of the month (or 3 months) you already paid for.' },
  { q: 'What happens to my CVs when the pass ends?', a: 'They stay in your account. CVs you downloaded stay yours. New clean PDFs are €0.99 each again, or you can restart the pass any time.' },
  { q: 'Monthly or every 3 months?', a: 'Same pass. Paying every 3 months costs €14.99, which is €5.00 a month instead of €6.99. Most job searches take a few months, so it usually works out cheaper.' },
  { q: 'How do I pay?', a: 'By card, through Stripe. We never see or store your card number. Prices are in euros; your bank converts them if your card is in another currency.' },
  { q: 'Is it really free to build?', a: 'Yes. Building, editing, tailoring, the ATS check and the preview are free. You only pay for the clean PDF.' },
]

const options = computed(() => [
  { k: 'one', label: 'Pay per CV', cost: cvs.value * 0.99 },
  { k: 'month', label: 'Job Hunt Pass, monthly', cost: 6.99 },
  { k: 'quarter', label: 'Job Hunt Pass, every 3 months', cost: 5 },
])
const best = computed(() => options.value.reduce((a, b) => (b.cost < a.cost ? b : a)).k)

function start(mode) { if (startBuilding) startBuilding(mode); else router.push('/') }
function getPass() { router.push({ path: '/settings', query: passActive.value ? {} : { plan: bill.value }, hash: '#pass' }) }
</script>

<style scoped>
/* Apple-like: large plain type, grey second line, soft fills, no borders, one dark card */
.pr{--ink:#1d1d1f;display:flex;flex-direction:column;gap:96px;padding-bottom:24px}
.px-hero{text-align:center;max-width:820px;margin:0 auto;padding-top:24px}
.px-eyebrow{font-size:17px;font-weight:600;color:var(--c-text3);margin:0 0 14px}
.px-h1{font-size:clamp(40px,6vw,72px);font-weight:700;letter-spacing:-.035em;line-height:1.04;color:var(--c-text);margin:0}
.px-h1 span{display:block;color:var(--c-text3)}
.px-lead{font-size:clamp(17px,1.7vw,21px);line-height:1.5;color:var(--c-text2);margin:24px auto 0;max-width:640px;font-weight:450}

.px-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:stretch}
.px-plan{display:flex;flex-direction:column;padding:36px 32px 32px;border-radius:28px;background:var(--c-surface)}
.px-plan h2{font-size:24px;font-weight:700;letter-spacing:-.025em;margin:0;color:var(--c-text)}
.px-sub{font-size:15px;color:var(--c-text3);margin:6px 0 0;min-height:22px}
.px-plan:not(.px-pass) .px-sub{margin-bottom:63px}
.px-plan:not(.px-pass) h2{margin-top:27px}
.px-amt{font-size:48px;font-weight:700;letter-spacing:-.04em;line-height:1;margin-top:28px;color:var(--c-text)}
.px-per{font-size:14px;color:var(--c-text3);margin-top:10px}
.px-save{font-size:13.5px;color:var(--c-accent);margin-top:6px;font-weight:600}
.px-plan ul{flex:1;list-style:none;margin:28px 0 0;padding:24px 0 0;display:flex;flex-direction:column;gap:13px;border-top:1px solid var(--hair)}
.px-plan li{display:flex;gap:11px;font-size:15px;line-height:1.45;color:var(--c-text2)}
.pr :deep(.px-tick){width:16px;height:16px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;margin-top:3px;color:var(--c-text)}
.px-btn{margin-top:26px;height:46px;border:none;border-radius:99px;font:inherit;font-size:15.5px;font-weight:600;cursor:pointer;background:var(--fill);color:var(--c-text);transition:background .2s,transform .2s}
.px-btn:hover{background:color-mix(in srgb,var(--c-text) 10%,transparent)}
.px-btn:active{transform:scale(.98)}
/* The pass: the dark product card */
.px-pass{background:var(--c-accent);color:#fff}
.px-pass h2,.px-pass .px-amt{color:#fff}
.px-pass .px-sub,.px-pass .px-per{color:rgba(255,255,255,.72)}
.px-pass .px-save{color:#fff}
.px-pass ul{border-top-color:rgba(255,255,255,.2)}
.px-pass li{color:rgba(255,255,255,.88)}
.px-pass :deep(.px-tick){color:#fff}
.px-best{font-size:13px;font-weight:600;color:rgba(255,255,255,.88);margin:0 0 8px}
.px-btn-light{background:#fff;color:var(--c-accent)}.px-btn-light:hover{background:rgba(255,255,255,.9)}
.px-fine{font-size:12.5px;color:rgba(255,255,255,.72);margin:20px 0 0;line-height:1.5}
.px-seg{display:inline-flex;align-self:flex-start;gap:2px;padding:3px;border-radius:99px;background:rgba(255,255,255,.16);margin-top:22px}
.px-seg button{height:32px;padding:0 14px;border:none;border-radius:99px;background:transparent;color:rgba(255,255,255,.88);font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s,color .2s}
.px-seg button.on{background:#fff;color:var(--c-accent)}
.px-seg + div .px-amt{margin-top:20px}
.px-fade-enter-active,.px-fade-leave-active{transition:opacity .18s ease}
.px-fade-enter-from,.px-fade-leave-to{opacity:0}

.px-h2{font-size:clamp(28px,3.4vw,44px);font-weight:700;letter-spacing:-.035em;line-height:1.08;margin:0;color:var(--c-text)}
.px-center{text-align:center;margin-bottom:32px}

/* Slider */
.px-calc{max-width:820px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:30px}
.px-calc-hd{text-align:center}
.px-calc-hd p{font-size:17px;color:var(--c-text2);line-height:1.5;margin:14px 0 0}
.px-slider{display:flex;align-items:center;gap:22px;padding:24px 28px;border-radius:24px 24px 0 0;background:var(--c-surface)}
.px-slider input{flex:1;-webkit-appearance:none;appearance:none;height:4px;border-radius:99px;background:linear-gradient(90deg,var(--c-accent) var(--p),var(--fill) var(--p));outline:none;cursor:pointer}
.px-slider input::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25),0 0 0 .5px rgba(0,0,0,.06);cursor:grab}
.px-slider input::-moz-range-thumb{width:26px;height:26px;border:none;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25);cursor:grab}
.px-slider input:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 4px color-mix(in srgb,var(--c-accent) 35%,transparent)}
.px-count{min-width:80px;text-align:right;font-size:15px;color:var(--c-text3)}.px-count b{font-size:32px;font-weight:700;letter-spacing:-.04em;color:var(--c-text);margin-right:3px;font-variant-numeric:tabular-nums}
.px-rows{display:flex;flex-direction:column;border-radius:0 0 24px 24px;background:var(--c-surface);overflow:hidden;margin-top:-30px}
.px-row{display:grid;grid-template-columns:1fr auto 22px;gap:16px;align-items:center;padding:16px 24px;border-top:1px solid var(--hair)}
.px-row-l small{display:block;font-size:12.5px;font-weight:600;color:var(--c-accent);margin-top:2px}
.px-row-tick{width:20px;height:20px;fill:none;stroke:var(--c-accent);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.px-row:first-child{border-top:none}
.px-row-l{font-size:15px;color:var(--c-text2)}
.px-row-v{text-align:right;font-size:15px;color:var(--c-text);font-variant-numeric:tabular-nums;font-weight:600}
.px-row.best .px-row-l{color:var(--c-text);font-weight:600}
.px-verdict{text-align:center;margin:0;font-size:17px;font-weight:500;color:var(--c-text)}

/* Table */
.px-table{border-radius:24px;background:var(--c-surface);overflow:hidden}
.px-tr{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;align-items:center}
.px-tr > div{padding:16px 22px;font-size:15px;color:var(--c-text2);text-align:center;border-top:1px solid var(--hair)}
.px-tr > div:first-child{text-align:left;color:var(--c-text)}
.px-th > div{border-top:none;font-size:14px;font-weight:600;color:var(--c-text);padding-top:20px}
.px-no{color:var(--c-text3)}

.px-extras{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.px-extra{padding:34px 32px;border-radius:28px;background:var(--c-surface)}
.px-ic{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--fill);margin-bottom:18px}
.px-ic svg{width:21px;height:21px;fill:none;stroke:var(--c-text);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.px-extra h3{font-size:21px;font-weight:700;letter-spacing:-.02em;margin:0 0 8px;color:var(--c-text)}
.px-extra p{font-size:15.5px;line-height:1.55;color:var(--c-text2);margin:0}
.px-link{border:none;background:none;padding:0;margin-top:14px;color:var(--c-accent);font:inherit;font-size:15.5px;font-weight:500;cursor:pointer}
.px-link:hover{text-decoration:underline}

.px-faq{max-width:760px;margin:0 auto;width:100%}
.px-faq details{border-top:1px solid var(--hair)}
.px-faq details:last-child{border-bottom:1px solid var(--hair)}
.px-faq summary{list-style:none;cursor:pointer;padding:22px 4px;font-size:17px;font-weight:600;color:var(--c-text);display:flex;justify-content:space-between;align-items:center;gap:16px}
.px-faq summary::-webkit-details-marker{display:none}
.px-faq summary::after{content:'';width:9px;height:9px;flex-shrink:0;border-right:1.8px solid var(--c-text3);border-bottom:1.8px solid var(--c-text3);transform:rotate(45deg) translate(-2px,-2px);transition:transform .25s ease}
.px-faq details[open] summary::after{transform:rotate(-135deg) translate(-2px,-2px)}
.px-faq details p{padding:0 4px 22px;margin:0;font-size:16px;line-height:1.6;color:var(--c-text2)}

.px-cta{text-align:center;padding:64px 32px;border-radius:32px;background:var(--c-surface);display:flex;flex-direction:column;align-items:center;gap:26px}
.px-cta h2{font-size:clamp(28px,3.6vw,44px);font-weight:700;letter-spacing:-.035em;margin:0;line-height:1.08;color:var(--c-text);max-width:640px}
.px-btn-dark{margin:0;padding:0 28px;height:50px;background:var(--c-accent);color:#fff;font-size:16px}
.px-btn-dark:hover{background:color-mix(in srgb,var(--c-accent) 88%,#000)}

/* Dark mode: the pass card stays dark, lifted a little from the page */
:global([data-theme="dark"]) .px-pass{background:#5b54e8}

@media (max-width:980px){
  .px-plans{grid-template-columns:1fr;max-width:480px;margin:0 auto;width:100%}
  .px-plan:not(.px-pass) .px-sub{margin-bottom:0}
  .px-plan:not(.px-pass) h2{margin-top:0}
  .px-pass{order:-1}
  .px-extras{grid-template-columns:1fr}
}
@media (max-width:640px){
  .pr{gap:56px}
  .px-hero{text-align:left;padding-top:4px}
  .px-h1{font-size:34px;line-height:1.08}
  .px-h1 span{display:block}
  .px-lead{font-size:16px;margin:14px 0 0}
  .px-plan{padding:24px 22px 22px;border-radius:22px}
  .px-amt{font-size:40px;margin-top:20px}
  .px-h2{font-size:26px!important}
  .px-row{padding:14px 18px;gap:12px}
  .px-slider{padding:20px}
  .px-tr{grid-template-columns:1.3fr .8fr .9fr .9fr}
  .px-tr > div{padding:13px 8px;font-size:13px}
  .px-tr > div:first-child{padding-left:16px}
}
</style>
