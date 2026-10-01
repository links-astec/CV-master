<template>
  <div class="view-page legal" ref="scroller">
    <header class="lg-hero">
      <div class="lg-hero-in">
        <span class="lg-eyebrow">Legal</span>
        <h1>{{ doc.title }}</h1>
        <p>Written in plain English. Last updated {{ UPDATED }}.</p>
        <div class="seg lg-tabs" role="tablist">
          <button v-for="d in DOCS" :key="d.id" role="tab" :aria-selected="tab === d.id" :class="{ active: tab === d.id }" @click="setTab(d.id)">{{ d.tab }}</button>
        </div>
      </div>
    </header>

    <div class="lg-body">
      <aside class="lg-side">
        <nav class="lg-toc" aria-label="On this page">
          <div class="lg-toc-h">On this page</div>
          <a v-for="(s, i) in doc.sections" :key="s.id" :href="`#${s.id}`" :class="{ active: active === s.id }" @click.prevent="jump(s.id)">
            <span>{{ i + 1 }}</span>{{ s.title }}
          </a>
        </nav>
        <div class="lg-help">
          <div class="lg-help-t">Questions or a complaint?</div>
          <p>Tell us and we’ll look into it.</p>
          <button class="btn-secondary btn-sm" @click="openFeedback?.('complaint')">Contact us</button>
        </div>
      </aside>

      <article class="lg-doc">
        <div class="lg-summary">
          <div class="lg-summary-h">In short</div>
          <ul>
            <li v-for="(b, i) in doc.summary" :key="i">
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ b }}
            </li>
          </ul>
        </div>

        <!-- Section bodies are fixed text written here, never user input -->
        <section v-for="(s, i) in doc.sections" :key="s.id" :id="s.id" class="lg-sec">
          <h2><span class="lg-num">{{ i + 1 }}</span>{{ s.title }}</h2>
          <div class="lg-text" v-html="s.html"></div>
        </section>

        <div class="lg-foot">
          <p>Something unclear, or want to exercise your rights? Email <a :href="`mailto:${CONTACT}`">{{ CONTACT }}</a> or
            <a href="#" @click.prevent="openFeedback?.('complaint')">send us a message</a>.</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()
const openFeedback = inject('openFeedback', null)
const scroller = ref(null)

const UPDATED = '30 September 2026'
const CONTACT = 'support@cvmaster.live'
const mail = `<a href="mailto:${CONTACT}">${CONTACT}</a>`

const DOCS = [
  {
    id: 'privacy', tab: 'Privacy policy', title: 'Privacy policy',
    summary: [
      'We never sell your data or show you ads.',
      'Your CV is yours — delete it, or your whole account, whenever you like.',
      'Card details go straight to Stripe; we never see or store them.',
      'One login cookie. No tracking or advertising cookies.',
    ],
    sections: [
      { id: 'who', title: 'Who we are', html: `<p>CVMaster ("we", "us") is an AI-assisted CV builder at cvmaster.live, run by Gabriel Quaye in France, who is responsible for your personal data (the “data controller”). Contact: ${mail}.</p>` },
      { id: 'collect', title: 'What we collect', html: `<ul>
        <li><strong>Account details</strong> — your name, email address and password (stored only as a secure hash).</li>
        <li><strong>Your CVs</strong> — everything you put in them. Without an account, your CV stays only in your browser until you sign up.</li>
        <li><strong>Job offers</strong> — descriptions you paste to tailor a CV, saved with that CV.</li>
        <li><strong>Payments</strong> — handled by Stripe. We keep a record that a CV was paid for, never your card details.</li>
        <li><strong>Messages to us</strong> — feedback and complaints you send, with the email you give for our reply.</li>
        <li><strong>Technical data</strong> — basic server logs (IP address, time) for security and fixing problems.</li>
      </ul>` },
      { id: 'use', title: 'How we use it', html: `<ul>
        <li>To run your account and save your CVs.</li>
        <li>To power the AI features you choose to use (writing help, tailoring, the ATS check, translation).</li>
        <li>To email you your CV and account messages such as password resets.</li>
        <li>To take payments through Stripe.</li>
        <li>To answer your feedback and complaints, and to improve CVMaster.</li>
      </ul>` },
      { id: 'newsletter', title: 'Newsletter', html: `<p>We only send our newsletter (CV tips and CVMaster news) if you ask for it — on the homepage, with the optional box when you create an account, or in Settings. When you sign up on the homepage we first email you a link to confirm. The legal basis is your consent.</p><p>We keep your email address, when and where you agreed, and when you unsubscribed. Every newsletter has a one-click unsubscribe link, and you can also switch it off in Settings or email ${mail}. We stop sending straight away. Emails about your account and purchases are not affected.</p>` },
      { id: 'share', title: 'Who we share it with', html: `<p>We do not sell your data. We only share it with the services that make CVMaster work:</p><ul>
        <li><strong>Anthropic (Claude) and Groq</strong> — AI providers. The CV text and any job offer involved in an AI feature are sent to them to produce the result.</li>
        <li><strong>Stripe</strong> — payments.</li>
        <li><strong>Resend</strong> — sending emails, including the CV PDFs you export.</li>
        <li><strong>Google</strong> — only if you sign in with Google.</li>
        <li><strong>Vercel, Render and Neon</strong> — hosting and the database where your data is stored.</li>
      </ul><p>Some of these providers are based in, or process data in, the United States. Where data leaves the EU, it is protected by the safeguards the GDPR requires, such as the European Commission’s standard contractual clauses or the EU–US Data Privacy Framework.</p>` },
      { id: 'keep', title: 'How long we keep it', html: `<p>We keep your account and CVs until you delete them or ask us to. Feedback and complaints are kept for as long as we need them to deal with the matter. Payment records may be kept longer where the law requires it.</p>` },
      { id: 'rights', title: 'Your rights', html: `<p>Under UK and EU data protection law you can ask to see, correct, export or delete your personal data, or object to how we use it. Email ${mail} and we will respond within one month.</p><p>If you are unhappy with how we handle your data, you can complain to the CNIL (cnil.fr), the French data protection authority, or to the authority where you live — for example the ICO (ico.org.uk) in the UK.</p>` },
      { id: 'cookies', title: 'Cookies', html: `<p>We use one cookie to keep you signed in. We do not use tracking or advertising cookies. Your browser’s local storage holds your CV if you use CVMaster without an account.</p>` },
      { id: 'security', title: 'Security', html: `<p>Passwords are hashed with bcrypt, everything travels over HTTPS, and card payments are handled entirely by Stripe.</p>` },
      { id: 'changes', title: 'Changes to this policy', html: `<p>If we change this policy we will update the date above, and tell you by email for significant changes.</p>` },
    ],
  },
  {
    id: 'terms', tab: 'Terms of service', title: 'Terms of service',
    summary: [
      'Building and previewing your CV is free.',
      'A clean PDF costs €0.99 per CV — once, no subscription.',
      'You own what you write. Check AI suggestions before you send your CV.',
      'Something wrong? Tell us — we’ll resend or refund if your CV never arrived.',
    ],
    sections: [
      { id: 'accept', title: 'Using CVMaster', html: `<p>By using CVMaster you agree to these terms. If you don’t agree, please don’t use the service. You must be at least 16.</p>` },
      { id: 'service', title: 'The service', html: `<p>CVMaster lets you create, edit, tailor and export CVs with optional AI help. We work hard to keep it running well, but it is provided “as is” and may sometimes be unavailable.</p>` },
      { id: 'account', title: 'Your account', html: `<ul>
        <li>Give accurate details when you sign up.</li>
        <li>Keep your password safe — you are responsible for activity on your account.</li>
      </ul>` },
      { id: 'payments', title: 'Payments', html: `<ul>
        <li>The clean (watermark-free) PDF of a CV is a one-time payment of <strong>€0.99</strong>. It includes email delivery, direct download, and unlimited re-sends and downloads of that same CV, including after edits.</li>
        <li>A preview PDF with a watermark is free.</li>
        <li>AI features include <strong>30 free requests a day</strong> for accounts with a confirmed email (guests and unconfirmed accounts get 5), reset daily at midnight (UTC). A pack of <strong>100 extra requests</strong> costs <strong>€0.50</strong>; extra requests don’t expire, are used only after the day’s free ones, and have no cash value.</li>
        <li>Referrals: someone who signs up with your invite link gets 25 extra AI requests. When they buy their first clean PDF, you earn a referral credit, which unlocks the clean PDF of one CV. Credits have no cash value.</li>
        <li>Payments are processed by Stripe.</li>
        <li><strong>Right of withdrawal:</strong> you normally have 14 days to cancel an online purchase. Because your PDF (or AI requests) are delivered immediately, at checkout you ask us to start straight away and confirm that you lose this right once delivery has happened, as allowed by EU consumer law (in France, article L221-28 of the Code de la consommation).</li>
        <li>If your CV never arrived, or something went wrong with a payment, contact us within 14 days and we will resend it or refund you.</li>
      </ul>` },
      { id: 'complaints', title: 'Complaints', html: `<p>If you are unhappy with anything — the service, a payment or how we treated you — please tell us:</p><ul>
        <li>Use <strong>Feedback → Complaint</strong> (in the sidebar, Settings, or at the bottom of this page), or email ${mail}.</li>
        <li>Include what happened, when, and the email on your account or payment.</li>
        <li>You’ll get a reference number. We aim to reply within 5 working days and to resolve complaints within 14 days.</li>
      </ul>` },
      { id: 'use', title: 'Acceptable use', html: `<p>Please don’t:</p><ul>
        <li>use CVMaster for anything unlawful or misleading;</li>
        <li>try to get around payments or access paid features without paying;</li>
        <li>copy, reverse-engineer or resell the service or its templates;</li>
        <li>upload content that is illegal, harmful or infringes someone else’s rights.</li>
      </ul>` },
      { id: 'ai', title: 'AI-generated content', html: `<p>AI suggestions can be wrong. CVMaster never adds anything without your approval, but you are responsible for checking that everything on your CV is true before you send it.</p>` },
      { id: 'ip', title: 'Who owns what', html: `<p>You own the content of your CV. We own the CVMaster platform, its designs and templates.</p>` },
      { id: 'liability', title: 'Liability', html: `<p>We are not liable for indirect or consequential losses, including the outcome of any job application. Nothing in these terms limits rights you have under consumer law.</p>` },
      { id: 'law', title: 'Governing law', html: `<p>These terms are governed by French law. If you are a consumer, you also keep the protection of the mandatory consumer laws of the country where you live, and you can bring a claim in your local courts.</p>` },
      { id: 'notice', title: 'Legal notice', html: `<ul>
        <li><strong>Publisher:</strong> Gabriel Quaye, France — ${mail}</li>
        <li><strong>Website hosting:</strong> Vercel Inc. (vercel.com)</li>
        <li><strong>Application hosting:</strong> Render Services, Inc. (render.com)</li>
        <li><strong>Database:</strong> Neon (neon.tech)</li>
      </ul>` },
    ],
  },
]

const tab = ref(route.query.tab === 'terms' ? 'terms' : 'privacy')
const doc = computed(() => DOCS.find(d => d.id === tab.value))
const active = ref('')

function setTab(id) {
  tab.value = id
  active.value = ''
  router.replace({ path: '/legal', query: { tab: id } })
  nextTick(() => scroller.value?.scrollTo({ top: 0 }))
}
watch(() => route.query.tab, (t) => { if (t === 'terms' || t === 'privacy') tab.value = t })

function jump(id) {
  active.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.legal{padding:0;overflow-y:auto}
.lg-hero{background:linear-gradient(180deg,var(--c-accent-lt),transparent);border-bottom:1px solid var(--c-border)}
.lg-hero-in{max-width:1040px;margin:0 auto;padding:44px 24px 26px}
.lg-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-accent);margin-bottom:10px}
.lg-hero h1{font-size:34px;font-weight:800;letter-spacing:-.03em;color:var(--c-text);margin-bottom:6px}
.lg-hero p{font-size:14.5px;color:var(--c-text2);margin-bottom:22px}
.lg-tabs{display:inline-flex}

.lg-body{max-width:1040px;margin:0 auto;padding:32px 24px 72px;display:grid;grid-template-columns:230px minmax(0,1fr);gap:48px;align-items:start}
.lg-side{position:sticky;top:24px;display:flex;flex-direction:column;gap:18px}
.lg-toc{display:flex;flex-direction:column;gap:2px}
.lg-toc-h{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c-text3);margin-bottom:8px}
.lg-toc a{display:flex;gap:10px;align-items:baseline;padding:6px 10px;border-radius:8px;font-size:13.5px;color:var(--c-text2);text-decoration:none;line-height:1.35}
.lg-toc a span{font-size:11.5px;color:var(--c-text3);min-width:14px}
.lg-toc a:hover{background:var(--c-surface2);color:var(--c-text)}
.lg-toc a.active{background:var(--c-accent-lt);color:var(--c-accent);font-weight:600}
.lg-help{border:1px solid var(--c-border);border-radius:12px;padding:14px 16px;background:var(--c-surface)}
.lg-help-t{font-size:13.5px;font-weight:700;color:var(--c-text)}
.lg-help p{font-size:12.5px;color:var(--c-text2);margin:3px 0 10px}

.lg-doc{max-width:720px}
.lg-summary{border:1px solid var(--c-border);background:var(--c-surface);border-radius:14px;padding:18px 20px;margin-bottom:30px;box-shadow:var(--shadow-xs)}
.lg-summary-h{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c-accent);margin-bottom:10px}
.lg-summary ul{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;padding:0;margin:0}
.lg-summary li{display:flex;gap:9px;font-size:14px;line-height:1.5;color:var(--c-text)}
.lg-summary svg{width:16px;height:16px;flex-shrink:0;margin-top:2px;fill:none;stroke:var(--c-green);stroke-width:3}

.lg-sec{padding-top:6px;margin-bottom:26px;scroll-margin-top:20px}
.lg-sec h2{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700;letter-spacing:-.01em;color:var(--c-text);margin-bottom:10px}
.lg-num{width:26px;height:26px;border-radius:8px;background:var(--c-accent-lt);color:var(--c-accent);font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.lg-text{padding-left:38px}
.lg-text :deep(p){font-size:15px;color:var(--c-text2);line-height:1.75;margin-bottom:10px}
.lg-text :deep(ul){padding-left:18px;margin-bottom:10px}
.lg-text :deep(li){font-size:15px;color:var(--c-text2);line-height:1.7;margin-bottom:6px}
.lg-text :deep(strong){color:var(--c-text);font-weight:600}
.lg-text :deep(a),.lg-foot a{color:var(--c-accent)}
.lg-foot{margin-top:34px;padding-top:20px;border-top:1px solid var(--c-border)}
.lg-foot p{font-size:14px;color:var(--c-text2);line-height:1.6}

@media (max-width:860px){
  .lg-body{grid-template-columns:1fr;gap:0;padding-top:22px}
  .lg-side{position:static;order:2;margin-top:24px}
  .lg-toc{display:none}
  .lg-summary ul{grid-template-columns:1fr}
  .lg-text{padding-left:0}
  .lg-hero-in{padding:30px 16px 20px}
  .lg-hero h1{font-size:28px}
  .lg-tabs{display:flex;width:100%}
  .lg-tabs button{flex:1}
  .lg-body{padding-left:16px;padding-right:16px}
}
</style>
