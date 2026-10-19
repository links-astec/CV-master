<template>
  <div class="view-page pr-page">
    <div class="view-inner pr">
      <!-- Hero -->
      <header class="pr-hero">
        <span class="pr-kicker">{{ $t('Pricing') }}</span>
        <h1 class="pr-h1">{{ $t('Free to build.') }}<br><span class="pr-grad">{{ $t('Pay only when you send it.') }}</span></h1>
        <p class="pr-lead">{{ $t('Build, tailor and check every CV for free. When you’re ready to apply, download it once for €0.99, or get every CV with the Job Hunt Pass.') }}</p>
        <div class="pr-bill" role="radiogroup" :aria-label="$t('Job Hunt Pass billing')">
          <button type="button" role="radio" :aria-checked="bill === 'month'" :class="{ on: bill === 'month' }" @click="bill = 'month'">{{ $t('Monthly') }}</button>
          <button type="button" role="radio" :aria-checked="bill === 'quarter'" :class="{ on: bill === 'quarter' }" @click="bill = 'quarter'">{{ $t('Every 3 months') }}<span class="pr-save">−29%</span></button>
        </div>
      </header>

      <!-- Plans -->
      <section class="pr-plans">
        <article class="pr-plan" v-reveal>
          <div class="pr-plan-hd"><h2>{{ $t('Free') }}</h2><p>{{ $t('Everything you need to write a great CV') }}</p></div>
          <div class="pr-amt">€0</div>
          <div class="pr-per">{{ $t('forever') }}</div>
          <ul>
            <li v-for="f in FREE" :key="f"><Tick />{{ $t(f) }}</li>
          </ul>
          <button class="btn-secondary btn-lg btn-block" @click="start('new')">{{ $t('Start building') }}</button>
        </article>

        <article class="pr-plan" v-reveal="80">
          <div class="pr-plan-hd"><h2>{{ $t('Clean PDF') }}</h2><p>{{ $t('For one great application') }}</p></div>
          <div class="pr-amt">€0.99</div>
          <div class="pr-per">{{ $t('per CV, once') }}<template v-if="approx(0.99)"> · {{ approx(0.99) }}</template></div>
          <ul>
            <li v-for="f in ONE" :key="f"><Tick />{{ $t(f) }}</li>
          </ul>
          <button class="btn-secondary btn-lg btn-block" @click="start('new')">{{ $t('Build my CV') }}</button>
        </article>

        <article class="pr-plan pr-pass" v-reveal="160">
          <span class="pr-badge">{{ $t('Best for job hunters') }}</span>
          <div class="pr-plan-hd"><h2>{{ $t('Job Hunt Pass') }}</h2><p>{{ $t('For applying to lots of jobs') }}</p></div>
          <Transition name="pr-flip" mode="out-in">
            <div :key="bill">
              <div class="pr-amt">{{ bill === 'quarter' ? '€14.99' : '€6.99' }}</div>
              <div class="pr-per">{{ $t(bill === 'quarter' ? 'every 3 months · €5.00 a month' : 'a month') }}<template v-if="approx(bill === 'quarter' ? 14.99 : 6.99)"> · {{ approx(bill === 'quarter' ? 14.99 : 6.99) }}</template></div>
            </div>
          </Transition>
          <ul>
            <li v-for="f in PASS" :key="f"><Tick />{{ $t(f) }}</li>
          </ul>
          <button class="btn-lg btn-block pr-pass-btn" @click="getPass">{{ $t(passActive ? 'Manage my pass' : 'Get the pass') }}</button>
          <p class="pr-fine">{{ $t('Cancel any time. It then runs to the end of the period you paid for.') }}</p>
        </article>
      </section>

      <!-- Which is cheapest for me? -->
      <section class="pr-calc" v-reveal>
        <div class="pr-calc-q">
          <h2>{{ $t('How many CVs will you send this month?') }}</h2>
          <p>{{ $t('A tailored CV for each job gets more interviews. Slide to see what that costs.') }}</p>
        </div>
        <div class="pr-slider">
          <input type="range" min="1" max="20" v-model.number="cvs" :aria-label="$t('CVs this month')" :style="{ '--p': ((cvs - 1) / 19 * 100) + '%' }" />
          <div class="pr-count"><b>{{ cvs }}</b> {{ $t(cvs === 1 ? 'CV' : 'CVs') }}</div>
        </div>
        <div class="pr-bars">
          <div v-for="o in options" :key="o.k" class="pr-bar" :class="{ best: o.k === best }">
            <div class="pr-bar-t"><span>{{ $t(o.label) }}</span><b>€{{ o.cost.toFixed(2) }}</b></div>
            <div class="pr-bar-track"><i :style="{ width: Math.max(4, o.cost / maxCost * 100) + '%' }"></i></div>
          </div>
        </div>
        <p class="pr-verdict">
          <template v-if="best === 'one'">{{ $t('Pay per CV: €{a} for {n}.', { a: (cvs * 0.99).toFixed(2), n: cvs }) }}</template>
          <template v-else>{{ $t('The Job Hunt Pass saves you €{s} this month, and every extra CV is free.', { s: (cvs * 0.99 - (best === 'quarter' ? 5 : 6.99)).toFixed(2) }) }}</template>
        </p>
      </section>

      <!-- Side by side -->
      <section class="pr-table-wrap" v-reveal>
        <h2 class="pr-h2">{{ $t('Compare the plans') }}</h2>
        <div class="pr-table" role="table">
          <div class="pr-tr pr-th" role="row"><div role="columnheader"></div><div role="columnheader">{{ $t('Free') }}</div><div role="columnheader">{{ $t('Clean PDF') }}</div><div role="columnheader" class="hl">{{ $t('Job Hunt Pass') }}</div></div>
          <div v-for="r in ROWS" :key="r[0]" class="pr-tr" role="row">
            <div role="rowheader">{{ $t(r[0]) }}</div>
            <div v-for="(v, i) in r.slice(1)" :key="i" role="cell" :class="{ hl: i === 2 }">
              <Tick v-if="v === true" /><span v-else-if="v === false" class="pr-no">·</span><span v-else>{{ $t(v) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Extras -->
      <section class="pr-extras">
        <div class="pr-extra" v-reveal>
          <span class="pr-ic">✦</span>
          <div><h3>{{ $t('Need more AI?') }}</h3><p>{{ $t('100 extra AI requests for €0.50. They never expire.') }}<template v-if="approx(0.5)"> {{ approx(0.5) }}</template></p></div>
        </div>
        <div class="pr-extra" v-reveal="80">
          <span class="pr-ic">♥</span>
          <div><h3>{{ $t('Or earn your CVs') }}</h3><p>{{ $t('Invite friends: you get a free CV for every friend who gets their first clean CV.') }} <button class="pr-link" @click="start('invite')">{{ $t('Get my invite link') }}</button></p></div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="pr-faq" v-reveal>
        <h2 class="pr-h2">{{ $t('Questions') }}</h2>
        <details v-for="f in FAQ" :key="f.q"><summary>{{ $t(f.q) }}</summary><p>{{ $t(f.a) }}</p></details>
      </section>

      <section class="pr-cta" v-reveal>
        <h2>{{ $t('Your next job starts with a better CV.') }}</h2>
        <button class="btn-lg pr-pass-btn" @click="start('new')">{{ $t('Build my CV for free') }}</button>
      </section>
    </div>
  </div>
</template>

<script setup>
// Prices, side by side, with a quick "what's cheapest for me" slider. Payment stays in euros; visitors
// outside the euro area see an estimate in their currency next to each price.
import { ref, computed, inject, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { approx } from '../composables/localPrice.js'

const Tick = () => h('svg', { viewBox: '0 0 24 24', class: 'pr-tick', 'aria-hidden': 'true' }, [h('polyline', { points: '20 6 9 17 4 12' })])
const router = useRouter()
const auth = useAuthStore()
const startBuilding = inject('startBuilding', null)
const bill = ref('quarter')
const cvs = ref(6)
const passActive = computed(() => !!auth.user?.pass)

const FREE = ['All 50 templates in 12 colours', '30 AI requests a day with a free account', 'Tailor your CV to any job offer', 'ATS score and job match check', 'Writing check as you type', 'Preview PDF with a watermark']
const ONE = ['Everything in Free', 'A watermark-free, one-page PDF', 'Emailed and downloadable', 'Free re-downloads after edits']
const PASS = ['Every CV you make as a clean PDF', '100 AI requests a day', 'Re-send any CV after edits, free', 'Cancel any time']
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
const maxCost = computed(() => Math.max(...options.value.map(o => o.cost)))

function start(mode) { if (startBuilding) startBuilding(mode); else router.push('/') }
function getPass() { router.push({ path: '/settings', query: passActive.value ? {} : { plan: bill.value }, hash: '#pass' }) }
</script>

<style scoped>
.pr{display:flex;flex-direction:column;gap:72px;padding-bottom:32px}
.pr-hero{text-align:center;display:flex;flex-direction:column;align-items:center;gap:18px;padding-top:12px}
.pr-kicker{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-accent);background:var(--c-accent-lt);padding:6px 14px;border-radius:99px}
.pr-h1{font-size:clamp(38px,5.6vw,68px);font-weight:820;letter-spacing:-.045em;line-height:1.02;color:var(--c-text);margin:0}
.pr-grad{background:linear-gradient(100deg,#4338CA 10%,#7C3AED 55%,#DB2777 95%);-webkit-background-clip:text;background-clip:text;color:transparent}
.pr-lead{max-width:640px;font-size:clamp(16px,1.6vw,19px);line-height:1.6;color:var(--c-text2);margin:0}
.pr-bill{display:inline-flex;gap:4px;padding:5px;border-radius:99px;background:var(--fill);margin-top:6px}
.pr-bill button{height:42px;padding:0 20px;border:none;border-radius:99px;background:transparent;color:var(--c-text2);font:inherit;font-size:14.5px;font-weight:650;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:background .25s var(--ease),color .25s var(--ease),box-shadow .25s var(--ease)}
.pr-bill button.on{background:var(--c-surface);color:var(--c-text);box-shadow:var(--shadow-sm)}
.pr-save{font-size:12px;font-weight:750;color:#fff;background:linear-gradient(135deg,#16A34A,#059669);padding:3px 8px;border-radius:99px}

.pr-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:stretch}
.pr-plan{position:relative;display:flex;flex-direction:column;padding:32px 28px;border-radius:30px;background:var(--c-surface);box-shadow:var(--shadow-sm);transition:transform .45s var(--ease),box-shadow .45s var(--ease)}
.pr-plan:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.pr-plan-hd h2{font-size:20px;font-weight:750;letter-spacing:-.02em;margin:0;color:var(--c-text)}
.pr-plan-hd p{font-size:14px;color:var(--c-text3);margin:4px 0 0}
.pr-amt{font-size:52px;font-weight:820;letter-spacing:-.045em;line-height:1;margin-top:26px;color:var(--c-text)}
.pr-per{font-size:14px;color:var(--c-text3);margin-top:8px;min-height:20px}
.pr-plan ul{list-style:none;margin:26px 0 28px;padding:0;display:flex;flex-direction:column;gap:12px;flex:1}
.pr-plan li{display:flex;gap:10px;font-size:15px;line-height:1.45;color:var(--c-text2)}
.pr-plan :deep(.pr-tick){width:18px;height:18px;flex-shrink:0;fill:none;stroke:var(--c-pass);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;margin-top:2px}
/* The pass: the one to pick */
.pr-pass{background:radial-gradient(120% 90% at 100% 0%,#7C3AED 0%,transparent 55%),linear-gradient(160deg,#312E81,#4338CA 55%,#5B21B6);color:#fff;box-shadow:0 30px 70px -20px rgba(67,56,202,.55);transform:translateY(-10px)}
.pr-pass:hover{transform:translateY(-14px);box-shadow:0 40px 80px -20px rgba(67,56,202,.65)}
.pr-pass .pr-plan-hd h2,.pr-pass .pr-amt{color:#fff}
.pr-pass .pr-plan-hd p,.pr-pass .pr-per{color:rgba(255,255,255,.72)}
.pr-pass li{color:rgba(255,255,255,.92)}
.pr-pass :deep(.pr-tick){stroke:#86EFAC}
.pr-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:12.5px;font-weight:750;color:#312E81;background:linear-gradient(135deg,#FDE68A,#FBBF24);padding:6px 14px;border-radius:99px;box-shadow:0 8px 20px rgba(251,191,36,.35)}
.pr-pass-btn{border:none;border-radius:99px;background:#fff;color:#312E81;font-weight:750;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.18);transition:transform .25s var(--ease),box-shadow .25s var(--ease)}
.pr-pass-btn:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(0,0,0,.24)}
.pr-fine{font-size:12.5px;color:rgba(255,255,255,.7);text-align:center;margin:12px 0 0;line-height:1.5}
.pr-flip-enter-active,.pr-flip-leave-active{transition:opacity .2s var(--ease),transform .25s var(--ease)}
.pr-flip-enter-from{opacity:0;transform:translateY(8px)}.pr-flip-leave-to{opacity:0;transform:translateY(-8px)}

/* Slider */
.pr-calc{padding:40px;border-radius:32px;background:var(--c-surface);box-shadow:var(--shadow-sm);display:grid;grid-template-columns:1fr 1fr;gap:28px 48px;align-items:center}
.pr-calc-q h2{font-size:clamp(24px,2.6vw,32px);font-weight:800;letter-spacing:-.035em;line-height:1.1;margin:0;color:var(--c-text)}
.pr-calc-q p{font-size:15px;color:var(--c-text2);line-height:1.6;margin:10px 0 0}
.pr-slider{display:flex;align-items:center;gap:18px}
.pr-slider input{flex:1;-webkit-appearance:none;appearance:none;height:8px;border-radius:99px;background:linear-gradient(90deg,var(--c-accent) var(--p),var(--fill) var(--p));outline:none;cursor:pointer}
.pr-slider input::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:#fff;border:3px solid var(--c-accent);box-shadow:0 4px 12px rgba(67,56,202,.35);cursor:grab}
.pr-slider input::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:#fff;border:3px solid var(--c-accent);box-shadow:0 4px 12px rgba(67,56,202,.35);cursor:grab}
.pr-slider input:focus-visible{box-shadow:0 0 0 4px var(--c-accent-lt)}
.pr-count{min-width:86px;font-size:15px;color:var(--c-text2)}.pr-count b{font-size:34px;font-weight:820;letter-spacing:-.04em;color:var(--c-text);margin-right:4px}
.pr-bars{grid-column:1/-1;display:flex;flex-direction:column;gap:14px}
.pr-bar-t{display:flex;justify-content:space-between;font-size:14.5px;color:var(--c-text2);margin-bottom:6px}.pr-bar-t b{color:var(--c-text);font-variant-numeric:tabular-nums}
.pr-bar-track{height:12px;border-radius:99px;background:var(--fill);overflow:hidden}
.pr-bar-track i{display:block;height:100%;border-radius:99px;background:color-mix(in srgb,var(--c-text) 22%,transparent);transition:width .45s var(--ease),background .3s}
.pr-bar.best .pr-bar-t span{color:var(--c-text);font-weight:700}
.pr-bar.best .pr-bar-track i{background:linear-gradient(90deg,#16A34A,#22C55E)}
.pr-verdict{grid-column:1/-1;margin:0;font-size:16px;font-weight:650;color:var(--c-text);padding:14px 18px;border-radius:16px;background:color-mix(in srgb,#16A34A 10%,transparent)}

/* Table */
.pr-h2{font-size:clamp(26px,3vw,36px);font-weight:820;letter-spacing:-.04em;text-align:center;margin:0 0 26px;color:var(--c-text)}
.pr-table{border-radius:26px;background:var(--c-surface);box-shadow:var(--shadow-sm);overflow:hidden}
.pr-tr{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;align-items:center}
.pr-tr > div{padding:15px 20px;font-size:14.5px;color:var(--c-text2);text-align:center;border-top:1px solid var(--hair)}
.pr-tr > div:first-child{text-align:left;color:var(--c-text);font-weight:550}
.pr-th > div{border-top:none;font-size:14px;font-weight:750;color:var(--c-text)}
.pr-tr > .hl{background:color-mix(in srgb,var(--c-accent) 6%,transparent)}
.pr-th > .hl{color:var(--c-accent)}
.pr-table :deep(.pr-tick){width:18px;height:18px;fill:none;stroke:var(--c-pass);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;vertical-align:middle}
.pr-no{color:var(--c-text3)}

.pr-extras{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.pr-extra{display:flex;gap:18px;align-items:flex-start;padding:28px;border-radius:26px;background:var(--c-surface);box-shadow:var(--shadow-sm)}
.pr-ic{width:48px;height:48px;flex-shrink:0;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;background:linear-gradient(135deg,#4338CA,#7C3AED)}
.pr-extra:nth-child(2) .pr-ic{background:linear-gradient(135deg,#DB2777,#F97316)}
.pr-extra h3{font-size:18px;font-weight:750;letter-spacing:-.02em;margin:0 0 6px;color:var(--c-text)}
.pr-extra p{font-size:14.5px;line-height:1.6;color:var(--c-text2);margin:0}
.pr-link{border:none;background:none;padding:0;color:var(--c-accent);font:inherit;font-weight:650;cursor:pointer;text-decoration:underline;text-underline-offset:3px}

.pr-faq{max-width:760px;margin:0 auto;width:100%}
.pr-faq details{background:var(--c-surface);border-radius:20px;box-shadow:var(--shadow-sm);margin-bottom:10px;overflow:hidden}
.pr-faq summary{list-style:none;cursor:pointer;padding:20px 24px;font-size:16px;font-weight:650;color:var(--c-text);display:flex;justify-content:space-between;gap:16px}
.pr-faq summary::-webkit-details-marker{display:none}
.pr-faq summary::after{content:'+';font-size:22px;line-height:1;color:var(--c-text3);transition:transform .25s var(--ease)}
.pr-faq details[open] summary::after{transform:rotate(45deg)}
.pr-faq details p{padding:0 24px 20px;margin:0;font-size:15px;line-height:1.65;color:var(--c-text2)}

.pr-cta{text-align:center;padding:56px 32px;border-radius:36px;background:radial-gradient(80% 120% at 0% 0%,#7C3AED 0%,transparent 60%),linear-gradient(135deg,#312E81,#4338CA);color:#fff;display:flex;flex-direction:column;align-items:center;gap:24px}
.pr-cta h2{font-size:clamp(26px,3.4vw,40px);font-weight:820;letter-spacing:-.04em;margin:0;line-height:1.1}
.pr-cta .pr-pass-btn{padding:0 30px;height:54px;font-size:16px}

@media (max-width:980px){
  .pr-plans{grid-template-columns:1fr;max-width:460px;margin:0 auto;width:100%}
  .pr-pass{order:-1;margin-top:14px}
  .pr-pass{transform:none}.pr-pass:hover{transform:translateY(-4px)}
  .pr-calc{grid-template-columns:1fr;padding:28px 22px}
  .pr-extras{grid-template-columns:1fr}
}
@media (max-width:640px){
  .pr{gap:52px}
  .pr-tr{grid-template-columns:1.3fr .8fr .9fr .9fr}
  .pr-tr > div{padding:12px 8px;font-size:13px}
  .pr-tr > div:first-child{padding-left:14px}
  .pr-bill button{padding:0 14px;font-size:13.5px}
}
@media (prefers-reduced-motion:reduce){ .pr-plan,.pr-pass,.pr-bar-track i{transition:none} }
</style>
