<template>
  <div class="view-page legal" ref="scroller">
    <header class="lg-hero">
      <div class="lg-hero-in">
        <span class="lg-eyebrow">{{ $t('Legal') }}</span>
        <h1>{{ doc.title }}</h1>
        <p>{{ $t('Written in plain language. Last updated {date}.', { date: updated }) }}</p>
        <p v-if="translated" class="lg-only">{{ $t('This is a translation for convenience. If it differs from the English version, the English version applies.') }}</p>
        <div class="seg lg-tabs" role="tablist">
          <button v-for="d in docs" :key="d.id" role="tab" :aria-selected="tab === d.id" :class="{ active: tab === d.id }" @click="setTab(d.id)">{{ d.tab }}</button>
        </div>
      </div>
    </header>

    <div class="lg-body">
      <aside class="lg-side">
        <nav class="lg-toc" :aria-label="$t('On this page')">
          <div class="lg-toc-h">{{ $t('On this page') }}</div>
          <a v-for="(s, i) in doc.sections" :key="s.id" :href="`#${s.id}`" :class="{ active: active === s.id }" @click.prevent="jump(s.id)">
            <span>{{ i + 1 }}</span>{{ s.title }}
          </a>
        </nav>
        <div class="lg-help">
          <div class="lg-help-t">{{ $t('Questions or a complaint?') }}</div>
          <p>{{ $t('Tell us and we’ll look into it.') }}</p>
          <button class="btn-secondary btn-sm" @click="openFeedback?.('complaint')">{{ $t('Contact us') }}</button>
        </div>
      </aside>

      <article class="lg-doc">
        <div class="lg-summary">
          <div class="lg-summary-h">{{ $t('In short') }}</div>
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
          <p>{{ $t('Something unclear, or want to exercise your rights? Email') }} <a :href="`mailto:${CONTACT}`">{{ CONTACT }}</a> {{ $t('or') }}
            <a href="#" @click.prevent="openFeedback?.('complaint')">{{ $t('send us a message') }}</a>.</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { lang } from '../i18n/index.js'

const route  = useRoute()
const router = useRouter()
const openFeedback = inject('openFeedback', null)
const scroller = ref(null)

const UPDATED = { en: '15 October 2026', fr: '15 octobre 2026' }
const CONTACT = 'support@cvmaster.live'
const mail = `<a href="mailto:${CONTACT}">${CONTACT}</a>`
// The people behind CVMaster
const TEAM_EN = 'Gabriel Quaye and Nisy Adjei Acheampong'
const TEAM_FR = 'Gabriel Quaye et Nisy Adjei Acheampong'

const DOCS = [
  {
    id: 'privacy', tab: 'Privacy policy', title: 'Privacy policy',
    summary: [
      'We never sell your data or show you ads.',
      'Your CV is yours. Delete it, or your whole account, whenever you like.',
      'Card details go straight to Stripe; we never see or store them.',
      'Only essential cookies, plus anonymous visit counts of our own. No tracking or advertising cookies.',
    ],
    sections: [
      { id: 'who', title: 'Who we are', html: `<p>CVMaster ("we", "us") is an AI-assisted CV builder at cvmaster.live, run in France by ${TEAM_EN}, who are responsible for your personal data (the “data controllers”). Contact: ${mail}.</p>` },
      { id: 'collect', title: 'What we collect', html: `<ul>
        <li><strong>Account details</strong>: your name, email address and password (stored only as a secure hash).</li>
        <li><strong>Your CVs</strong>: everything you put in them. Without an account, your CV stays only in your browser until you sign up.</li>
        <li><strong>Job offers</strong>: descriptions you paste to tailor a CV, saved with that CV.</li>
        <li><strong>Payments</strong>: handled by Stripe. We keep a record that a CV was paid for, never your card details.</li>
        <li><strong>Messages to us</strong>: feedback and complaints you send, with the email you give for our reply.</li>
        <li><strong>Technical data</strong>: basic server logs (IP address, time) for security and fixing problems.</li>
      </ul>` },
      { id: 'use', title: 'How we use it', html: `<ul>
        <li>To run your account and save your CVs.</li>
        <li>To power the AI features you choose to use (writing help, tailoring, the ATS check, the job-fit check, translation).</li>
        <li>To personalise AI suggestions on CVs in your own name, using your sign-up answers and your other CVs. CVs you make for someone else don’t use them, and you can switch this off in Settings.</li>
        <li>To email you your CV and account messages such as password resets.</li>
        <li>To take payments through Stripe.</li>
        <li>To answer your feedback and complaints, and to improve CVMaster.</li>
      </ul>` },
      { id: 'personal', title: 'Personalisation, notifications and voice', html: `<p><strong>Your country</strong>: the website and the app note which country your device is set to, from its time zone setting (never from your internet address). We use it to show prices in your own currency and to count how many people use CVMaster in each country, for accounts and for visitors without an account.</p><p><strong>Your details for new CVs</strong>: when you are signed in, we keep your name, contact details, links, photo and languages from the CVs you make for yourself (never from a CV you make for someone else), so each new CV starts with them filled in. You can see them, switch this off or forget them at any time in Settings (“Your details”). They are deleted with your account.</p><p>When you are signed in, we keep a short record of what you do in CVMaster, on the website and in the app: for example that you created a CV, chose a layout, used an AI feature, checked a CV against a job or exported it. We use it only to personalise CVMaster for you: to suggest your next step, show the layouts you like first, and remind you, at most once a week, where you left off. It stays on our own servers, is never sold or shared, and is never used for advertising. It is deleted after 13 months, and with your account.</p><p>You can switch this off at any time in Settings (“Personalise with my activity”); what we kept is then deleted. We rely on our legitimate interest in making CVMaster useful to you, and your right to object always applies.</p><p><strong>Push notifications</strong> (phone app): if you allow them, we send notifications such as a free CV earned with your invite link, and the reminders above. For this we store a notification token for your phone; notifications are delivered through Expo, Apple and Google. Turn them off in the app’s Settings or in your phone’s settings.</p><p><strong>Voice input</strong> (phone app): if you record your story, the recording is sent to a transcription service to turn it into text. We don’t keep the recording.</p>` },
      { id: 'newsletter', title: 'Newsletter', html: `<p>We only send our newsletter (CV tips and CVMaster news) if you ask for it: on the homepage, with the optional box when you create an account, or in Settings. When you sign up on the homepage we first email you a link to confirm. The legal basis is your consent.</p><p>We keep your email address, when and where you agreed, and when you unsubscribed. Every newsletter has a one-click unsubscribe link, and you can also switch it off in Settings or email ${mail}. We stop sending straight away. Emails about your account and purchases are not affected.</p>` },
      { id: 'share', title: 'Who we share it with', html: `<p>We do not sell your data. We only share it with the services that make CVMaster work:</p><ul>
        <li><strong>AI service providers</strong>: The CV text and any job offer involved in an AI feature are sent to them to produce the result, including the writing check, which reads the text of the field you are typing in to suggest corrections.</li>
        <li><strong>Stripe</strong>: payments.</li>
        <li><strong>Resend</strong>: sending emails, including the CV PDFs you export.</li>
        <li><strong>Google</strong>: only if you sign in with Google.</li>
        <li><strong>Vercel, Render and Neon</strong>: hosting and the database where your data is stored.</li>
      </ul><p>Some of these providers are based in, or process data in, the United States. Where data leaves the EU, it is protected by the safeguards the GDPR requires, such as the European Commission’s standard contractual clauses or the EU–US Data Privacy Framework.</p>` },
      { id: 'keep', title: 'How long we keep it', html: `<p>We keep your account and CVs until you delete them or ask us to. Feedback and complaints are kept for as long as we need them to deal with the matter. Payment records may be kept longer where the law requires it.</p>` },
      { id: 'rights', title: 'Your rights', html: `<p>Under UK and EU data protection law you can ask to see, correct, export or delete your personal data, or object to how we use it. Email ${mail} and we will respond within one month.</p><p>If you are unhappy with how we handle your data, you can complain to the CNIL (cnil.fr), the French data protection authority, or to the authority where you live, for example the ICO (ico.org.uk) in the UK.</p>` },
      { id: 'cookies', title: 'Cookies', html: `<p>We only use cookies that CVMaster needs to work, and one that also gives us anonymous statistics of our own, so we don’t ask for consent. We do not use tracking or advertising cookies, or any outside analytics service.</p><ul><li><strong>token</strong>: keeps you signed in (7 days).</li><li><strong>cvm_gid</strong>: a random identifier that lets us apply fair-use limits to the AI before you create an account (1 year). We also use it to count, anonymously, how CVMaster is used without an account: for example how many people start a CV, paste a job offer or download a PDF, and how many later create an account. These counts stay on our own servers, are never shared or used to identify you, and are deleted after 13 months. If your browser sends Global Privacy Control, you are not counted; you can also object by writing to us.</li><li><strong>g_state</strong>: set by Google only when you open the sign-in window, to remember the state of its sign-in prompt (up to 6 months).</li></ul><p>Your browser’s local storage holds your CV if you use CVMaster without an account, and your preferences (language, dark mode). You can clear cookies and local storage at any time in your browser’s settings.</p>` },
      { id: 'security', title: 'Security', html: `<p>Passwords are hashed with bcrypt, everything travels over HTTPS, and card payments are handled entirely by Stripe.</p>` },
      { id: 'changes', title: 'Changes to this policy', html: `<p>If we change this policy we will update the date above, and tell you by email for significant changes.</p>` },
    ],
  },
  {
    id: 'terms', tab: 'Terms of service', title: 'Terms of service',
    summary: [
      'Building and previewing your CV is free.',
      'A clean PDF costs €0.99 per CV, once. Or the Job Hunt Pass: every CV for €6.99 a month or €14.99 every 3 months, cancel any time.',
      'You own what you write. Check AI suggestions before you send your CV.',
      'Something wrong? Tell us. We’ll resend or refund if your CV never arrived.',
    ],
    sections: [
      { id: 'accept', title: 'Using CVMaster', html: `<p>By using CVMaster you agree to these terms. If you don’t agree, please don’t use the service. You must be at least 16.</p>` },
      { id: 'service', title: 'The service', html: `<p>CVMaster lets you create, edit, tailor and export CVs with optional AI help. We work hard to keep it running well, but it is provided “as is” and may sometimes be unavailable.</p>` },
      { id: 'account', title: 'Your account', html: `<ul>
        <li>Give accurate details when you sign up.</li>
        <li>Keep your password safe. You are responsible for activity on your account.</li>
      </ul>` },
      { id: 'payments', title: 'Payments', html: `<ul>
        <li>The clean (watermark-free) PDF of a CV is a one-time payment of <strong>€0.99</strong>. It includes email delivery, direct download, and unlimited re-sends and downloads of that same CV, including after edits.</li>
        <li>The <strong>Job Hunt Pass</strong> costs <strong>€6.99 a month</strong>, or <strong>€14.99 every 3 months</strong>, and renews at the end of each period until you cancel. While it is active, every CV in your account can be emailed and downloaded as a clean PDF, and you get 100 AI requests a day. You can cancel at any time in Settings: nothing more is charged and the pass stays active until the end of the period already paid, which is not refunded. Because the pass starts straight away at your request, you agree when you buy it that your 14-day right of withdrawal ends once it starts.</li>
        <li>A preview PDF with a watermark is free.</li>
        <li>AI features include <strong>30 free requests a day</strong> for accounts with a confirmed email (guests and unconfirmed accounts get 5), reset daily at midnight (UTC). A pack of <strong>100 extra requests</strong> costs <strong>€0.50</strong>; extra requests don’t expire, are used only after the day’s free ones, and have no cash value.</li>
        <li>Referrals: someone who signs up with your invite link gets 25 extra AI requests. When they buy their first clean PDF, you earn a referral credit, which unlocks the clean PDF of one CV. Credits have no cash value.</li>
        <li>Payments are processed by Stripe.</li>
        <li><strong>Right of withdrawal:</strong> you normally have 14 days to cancel an online purchase. Because your PDF (or AI requests) are delivered immediately, at checkout you ask us to start straight away and confirm that you lose this right once delivery has happened, as allowed by EU consumer law (in France, article L221-28 of the Code de la consommation).</li>
        <li>If your CV never arrived, or something went wrong with a payment, contact us within 14 days and we will resend it or refund you.</li>
      </ul>` },
      { id: 'complaints', title: 'Complaints', html: `<p>If you are unhappy with anything, whether the service, a payment or how we treated you, please tell us:</p><ul>
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
      { id: 'reviews', title: 'Reviews', html: `<p>People who have made a CV can rate CVMaster. Star ratings count straight away. Written comments, and later edits to them, are checked by us before they appear on our website, to keep out spam, abuse and personal details; until an edit is approved, the earlier version stays. We never remove or hide a review because it is negative, and we don’t pay for reviews.</p>` },
      { id: 'ai', title: 'AI-generated content', html: `<p>AI suggestions can be wrong. CVMaster never adds anything without your approval, but you are responsible for checking that everything on your CV is true before you send it.</p>` },
      { id: 'ip', title: 'Who owns what', html: `<p>You own the content of your CV. We own the CVMaster platform, its designs and templates.</p>` },
      { id: 'liability', title: 'Liability', html: `<p>We are not liable for indirect or consequential losses, including the outcome of any job application. Nothing in these terms limits rights you have under consumer law.</p>` },
      { id: 'law', title: 'Governing law', html: `<p>These terms are governed by French law. If you are a consumer, you also keep the protection of the mandatory consumer laws of the country where you live, and you can bring a claim in your local courts.</p>` },
      { id: 'notice', title: 'Legal notice', html: `<ul>
        <li><strong>Publishers:</strong> ${TEAM_EN}, France, ${mail}</li>
        <li><strong>Website hosting:</strong> Vercel Inc. (vercel.com)</li>
        <li><strong>Application hosting:</strong> Render Services, Inc. (render.com)</li>
        <li><strong>Database:</strong> Neon (neon.tech)</li>
      </ul>` },
    ],
  },
]


// French version of both documents (same sections and ids as the English)
const DOCS_FR = [
  {
    id: 'privacy', tab: 'Politique de confidentialité', title: 'Politique de confidentialité',
    summary: [
      'Nous ne vendons jamais vos données et ne vous montrons pas de publicité.',
      'Votre CV vous appartient. Supprimez-le, ou tout votre compte, quand vous voulez.',
      'Les données de carte vont directement chez Stripe ; nous ne les voyons ni ne les conservons jamais.',
      'Uniquement des cookies essentiels, et un comptage anonyme de nos visites. Aucun cookie de suivi ou publicitaire.',
    ],
    sections: [
      { id: 'who', title: 'Qui sommes-nous', html: `<p>CVMaster (« nous ») est un outil de création de CV assisté par IA, disponible sur cvmaster.live et édité en France par ${TEAM_FR}, responsables du traitement de vos données personnelles. Contact : ${mail}.</p>` },
      { id: 'collect', title: 'Ce que nous collectons', html: `<ul>
        <li><strong>Informations de compte</strong>: votre nom, votre adresse e-mail et votre mot de passe (conservé uniquement sous forme de hachage sécurisé).</li>
        <li><strong>Vos CV</strong>: tout ce que vous y saisissez. Sans compte, votre CV reste uniquement dans votre navigateur jusqu’à votre inscription.</li>
        <li><strong>Offres d’emploi</strong>: les descriptions que vous collez pour adapter un CV, enregistrées avec ce CV.</li>
        <li><strong>Paiements</strong>: gérés par Stripe. Nous gardons la trace du paiement d’un CV, jamais vos données de carte.</li>
        <li><strong>Vos messages</strong>: les avis et réclamations que vous nous envoyez, avec l’adresse e-mail indiquée pour notre réponse.</li>
        <li><strong>Données techniques</strong>: journaux serveur de base (adresse IP, heure) pour la sécurité et la résolution de problèmes.</li>
      </ul>` },
      { id: 'use', title: 'Comment nous les utilisons', html: `<ul>
        <li>Pour gérer votre compte et enregistrer vos CV.</li>
        <li>Pour faire fonctionner les fonctionnalités d’IA que vous choisissez d’utiliser (aide à la rédaction, adaptation à une offre, vérification ATS, avis sur l’adéquation au poste, traduction).</li>
        <li>Pour personnaliser les suggestions de l’IA sur les CV à votre nom, à partir de vos réponses à l’inscription et de vos autres CV. Les CV que vous créez pour quelqu’un d’autre ne les utilisent pas, et vous pouvez désactiver cette option dans les Paramètres.</li>
        <li>Pour vous envoyer votre CV et les messages liés à votre compte, comme la réinitialisation du mot de passe.</li>
        <li>Pour encaisser les paiements via Stripe.</li>
        <li>Pour répondre à vos avis et réclamations, et pour améliorer CVMaster.</li>
      </ul>` },
      { id: 'personal', title: 'Personnalisation, notifications et voix', html: `<p><strong>Votre pays</strong> : le site et l’application notent le pays réglé sur votre appareil, d’après son fuseau horaire (jamais d’après votre adresse internet). Nous l’utilisons pour afficher les prix dans votre monnaie et pour compter combien de personnes utilisent CVMaster dans chaque pays, avec ou sans compte.</p><p><strong>Vos coordonnées pour les nouveaux CV</strong> : lorsque vous êtes connecté, nous gardons votre nom, vos coordonnées, vos liens, votre photo et vos langues issus des CV que vous faites pour vous-même (jamais d’un CV fait pour quelqu’un d’autre), afin que chaque nouveau CV commence déjà rempli. Vous pouvez les consulter, désactiver ce pré-remplissage ou les oublier à tout moment dans Paramètres (« Vos coordonnées »). Elles sont supprimées avec votre compte.</p><p>Lorsque vous êtes connecté, nous gardons une trace succincte de ce que vous faites dans CVMaster, sur le site et dans l’application : par exemple que vous avez créé un CV, choisi une mise en page, utilisé une fonction d’IA, comparé un CV à une offre ou exporté un CV. Nous l’utilisons uniquement pour personnaliser CVMaster pour vous : vous proposer la prochaine étape, afficher d’abord les mises en page que vous aimez et vous rappeler, au plus une fois par semaine, où vous en étiez. Ces données restent sur nos propres serveurs, ne sont jamais vendues ni partagées, et ne servent jamais à la publicité. Elles sont supprimées au bout de 13 mois, et avec votre compte.</p><p>Vous pouvez désactiver cela à tout moment dans les Paramètres (« Personnaliser avec mon activité ») ; ce que nous avions gardé est alors supprimé. Nous nous fondons sur notre intérêt légitime à rendre CVMaster utile pour vous, et votre droit d’opposition s’applique toujours.</p><p><strong>Notifications push</strong> (application mobile) : si vous les autorisez, nous envoyons des notifications, par exemple un CV gratuit gagné grâce à votre lien d’invitation, et les rappels ci-dessus. Pour cela, nous conservons un identifiant de notification pour votre téléphone ; les notifications passent par Expo, Apple et Google. Désactivez-les dans les Paramètres de l’application ou de votre téléphone.</p><p><strong>Saisie vocale</strong> (application mobile) : si vous enregistrez votre parcours, l’enregistrement est envoyé à un service de transcription pour être transcrit. Nous ne conservons pas l’enregistrement.</p>` },
      { id: 'newsletter', title: 'Newsletter', html: `<p>Nous n’envoyons notre newsletter (conseils CV et actualités CVMaster) que si vous la demandez : sur la page d’accueil, avec la case facultative lors de la création de votre compte, ou dans les Paramètres. Si vous vous inscrivez depuis la page d’accueil, nous vous envoyons d’abord un lien de confirmation. La base légale est votre consentement.</p><p>Nous conservons votre adresse e-mail, la date et le lieu de votre accord, et la date de votre désinscription. Chaque newsletter contient un lien de désinscription en un clic ; vous pouvez aussi la désactiver dans les Paramètres ou écrire à ${mail}. Les envois s’arrêtent immédiatement. Les e-mails concernant votre compte et vos achats ne sont pas concernés.</p>` },
      { id: 'share', title: 'Avec qui nous les partageons', html: `<p>Nous ne vendons pas vos données. Nous les partageons uniquement avec les services qui font fonctionner CVMaster :</p><ul>
        <li><strong>Fournisseurs de services d’IA</strong>: Le texte du CV et l’éventuelle offre d’emploi concernés par une fonctionnalité d’IA leur sont envoyés pour produire le résultat, y compris la vérification de l’écriture, qui lit le texte du champ que vous remplissez pour proposer des corrections.</li>
        <li><strong>Stripe</strong>: paiements.</li>
        <li><strong>Resend</strong>: envoi des e-mails, y compris les CV en PDF que vous exportez.</li>
        <li><strong>Google</strong>: uniquement si vous vous connectez avec Google.</li>
        <li><strong>Vercel, Render et Neon</strong>: hébergement et base de données où vos données sont stockées.</li>
      </ul><p>Certains de ces prestataires sont établis aux États-Unis ou y traitent des données. Lorsque des données quittent l’UE, elles sont protégées par les garanties exigées par le RGPD, comme les clauses contractuelles types de la Commission européenne ou le cadre de protection des données UE–États-Unis (Data Privacy Framework).</p>` },
      { id: 'keep', title: 'Durée de conservation', html: `<p>Nous conservons votre compte et vos CV jusqu’à ce que vous les supprimiez ou nous le demandiez. Les avis et réclamations sont conservés le temps nécessaire pour traiter la demande. Les justificatifs de paiement peuvent être conservés plus longtemps lorsque la loi l’exige.</p>` },
      { id: 'rights', title: 'Vos droits', html: `<p>Conformément au RGPD et à la loi Informatique et Libertés, vous pouvez demander à accéder à vos données personnelles, à les rectifier, à les exporter ou à les supprimer, ou vous opposer à leur utilisation. Écrivez à ${mail} : nous répondrons dans un délai d’un mois.</p><p>Si vous n’êtes pas satisfait de la manière dont nous traitons vos données, vous pouvez adresser une réclamation à la CNIL (cnil.fr), l’autorité française de protection des données, ou à l’autorité du pays où vous vivez, par exemple l’ICO (ico.org.uk) au Royaume-Uni.</p>` },
      { id: 'cookies', title: 'Cookies', html: `<p>Nous utilisons uniquement les cookies nécessaires au fonctionnement de CVMaster, dont un qui nous sert aussi à établir des statistiques anonymes pour notre seul usage : votre consentement n’est donc pas requis. Nous n’utilisons aucun cookie de suivi ou publicitaire, ni aucun service de mesure d’audience extérieur.</p><ul><li><strong>token</strong> : vous garde connecté (7 jours).</li><li><strong>cvm_gid</strong> : un identifiant aléatoire qui nous permet d’appliquer des limites d’usage raisonnables à l’IA avant la création d’un compte (1 an). Il nous sert aussi à compter, de façon anonyme, l’utilisation de CVMaster sans compte : par exemple combien de personnes commencent un CV, collent une offre d’emploi ou téléchargent un PDF, et combien créent ensuite un compte. Ces comptages restent sur nos serveurs, ne sont jamais partagés ni utilisés pour vous identifier, et sont supprimés au bout de 13 mois. Si votre navigateur envoie le signal Global Privacy Control, vous n’êtes pas compté ; vous pouvez aussi vous y opposer en nous écrivant.</li><li><strong>g_state</strong> : déposé par Google uniquement lorsque vous ouvrez la fenêtre de connexion, pour mémoriser l’état de sa fenêtre de connexion (jusqu’à 6 mois).</li></ul><p>Le stockage local de votre navigateur conserve votre CV si vous utilisez CVMaster sans compte, ainsi que vos préférences (langue, mode sombre). Vous pouvez effacer les cookies et le stockage local à tout moment dans les réglages de votre navigateur.</p>` },
      { id: 'security', title: 'Sécurité', html: `<p>Les mots de passe sont hachés avec bcrypt, toutes les communications passent par HTTPS, et les paiements par carte sont entièrement gérés par Stripe.</p>` },
      { id: 'changes', title: 'Modifications de cette politique', html: `<p>Si nous modifions cette politique, nous mettrons à jour la date ci-dessus et vous préviendrons par e-mail en cas de changement important.</p>` },
    ],
  },
  {
    id: 'terms', tab: 'Conditions d’utilisation', title: 'Conditions d’utilisation',
    summary: [
      'Créer et prévisualiser votre CV est gratuit.',
      'Un PDF sans filigrane coûte 0,99 € par CV, une seule fois. Ou le Job Hunt Pass : tous vos CV pour 6,99 € par mois ou 14,99 € tous les 3 mois, sans engagement.',
      'Vous êtes propriétaire de ce que vous écrivez. Vérifiez les suggestions de l’IA avant d’envoyer votre CV.',
      'Un problème ? Dites-le-nous. Nous renvoyons ou remboursons si votre CV n’est jamais arrivé.',
    ],
    sections: [
      { id: 'accept', title: 'Utilisation de CVMaster', html: `<p>En utilisant CVMaster, vous acceptez ces conditions. Si vous ne les acceptez pas, merci de ne pas utiliser le service. Vous devez avoir au moins 16 ans.</p>` },
      { id: 'service', title: 'Le service', html: `<p>CVMaster vous permet de créer, modifier, adapter et exporter des CV, avec une aide facultative de l’IA. Nous faisons tout pour qu’il fonctionne bien, mais il est fourni « en l’état » et peut parfois être indisponible.</p>` },
      { id: 'account', title: 'Votre compte', html: `<ul>
        <li>Donnez des informations exactes lors de votre inscription.</li>
        <li>Gardez votre mot de passe en sécurité. Vous êtes responsable de l’activité de votre compte.</li>
      </ul>` },
      { id: 'payments', title: 'Paiements', html: `<ul>
        <li>Le PDF sans filigrane d’un CV est un paiement unique de <strong>0,99 €</strong>. Il comprend l’envoi par e-mail, le téléchargement direct, et des renvois et téléchargements illimités de ce même CV, y compris après modification.</li>
        <li>Le <strong>Job Hunt Pass</strong> coûte <strong>6,99 € par mois</strong>, ou <strong>14,99 € tous les 3 mois</strong>, et se renouvelle à la fin de chaque période jusqu’à ce que vous l’annuliez. Tant qu’il est actif, chaque CV de votre compte peut être envoyé par e-mail et téléchargé en PDF sans filigrane, et vous disposez de 100 requêtes d’IA par jour. Vous pouvez l’annuler à tout moment dans les Paramètres : plus rien n’est prélevé et le pass reste actif jusqu’à la fin de la période déjà payée, qui n’est pas remboursé. Comme le pass démarre immédiatement à votre demande, vous acceptez en l’achetant que votre droit de rétractation de 14 jours prenne fin dès son démarrage.</li>
        <li>Un aperçu PDF avec filigrane est gratuit.</li>
        <li>Les fonctionnalités d’IA comprennent <strong>30 requêtes gratuites par jour</strong> pour les comptes dont l’e-mail est confirmé (5 pour les invités et les comptes non confirmés), remises à zéro chaque jour à minuit (UTC). Un pack de <strong>100 requêtes supplémentaires</strong> coûte <strong>0,50 €</strong> ; ces requêtes n’expirent pas, ne sont utilisées qu’après les requêtes gratuites du jour et n’ont aucune valeur monétaire.</li>
        <li>Parrainage : une personne qui s’inscrit avec votre lien d’invitation reçoit 25 requêtes IA supplémentaires. Lorsqu’elle achète son premier PDF sans filigrane, vous gagnez un crédit de parrainage, qui débloque le PDF sans filigrane d’un CV. Les crédits n’ont aucune valeur monétaire.</li>
        <li>Les paiements sont traités par Stripe.</li>
        <li><strong>Droit de rétractation :</strong> vous disposez normalement de 14 jours pour annuler un achat en ligne. Comme votre PDF (ou vos requêtes IA) est fourni immédiatement, vous nous demandez au moment du paiement de commencer tout de suite et reconnaissez perdre ce droit une fois la fourniture effectuée, comme le permet le droit européen de la consommation (en France, article L221-28 du Code de la consommation).</li>
        <li>Si votre CV n’est jamais arrivé, ou si un paiement a posé problème, contactez-nous dans les 14 jours : nous vous le renverrons ou vous rembourserons.</li>
      </ul>` },
      { id: 'complaints', title: 'Réclamations', html: `<p>Si quelque chose ne vous convient pas, qu’il s’agisse du service, d’un paiement ou de la façon dont nous vous avons traité, dites-le-nous :</p><ul>
        <li>Utilisez <strong>Avis → Réclamation</strong> (dans la barre latérale, les Paramètres ou en bas de cette page), ou écrivez à ${mail}.</li>
        <li>Indiquez ce qui s’est passé, quand, et l’adresse e-mail de votre compte ou de votre paiement.</li>
        <li>Vous recevrez un numéro de référence. Nous visons une réponse sous 5 jours ouvrés et une résolution sous 14 jours.</li>
      </ul>` },
      { id: 'use', title: 'Utilisation acceptable', html: `<p>Merci de ne pas :</p><ul>
        <li>utiliser CVMaster à des fins illégales ou trompeuses ;</li>
        <li>tenter de contourner les paiements ou d’accéder aux fonctionnalités payantes sans payer ;</li>
        <li>copier, désassembler ou revendre le service ou ses modèles ;</li>
        <li>importer du contenu illégal, nuisible ou qui porte atteinte aux droits d’autrui.</li>
      </ul>` },
      { id: 'reviews', title: 'Avis', html: `<p>Les personnes qui ont créé un CV peuvent noter CVMaster. Les notes en étoiles comptent tout de suite. Les commentaires écrits, et leurs modifications ultérieures, sont vérifiés par nous avant d’apparaître sur notre site, pour écarter le spam, les propos abusifs et les données personnelles ; tant qu’une modification n’est pas approuvée, la version précédente reste affichée. Nous ne supprimons ni ne masquons jamais un avis parce qu’il est négatif, et nous ne payons pas pour des avis.</p>` },
      { id: 'ai', title: 'Contenu généré par l’IA', html: `<p>Les suggestions de l’IA peuvent être erronées. CVMaster n’ajoute jamais rien sans votre accord, mais il vous appartient de vérifier que tout ce qui figure sur votre CV est exact avant de l’envoyer.</p>` },
      { id: 'ip', title: 'Propriété', html: `<p>Vous êtes propriétaire du contenu de votre CV. Nous sommes propriétaires de la plateforme CVMaster, de ses designs et de ses modèles.</p>` },
      { id: 'liability', title: 'Responsabilité', html: `<p>Nous ne sommes pas responsables des pertes indirectes, y compris de l’issue d’une candidature. Rien dans ces conditions ne limite les droits dont vous disposez en tant que consommateur.</p>` },
      { id: 'law', title: 'Droit applicable', html: `<p>Ces conditions sont régies par le droit français. Si vous êtes consommateur, vous conservez la protection des lois impératives de protection des consommateurs du pays où vous résidez, et vous pouvez saisir les tribunaux de votre lieu de résidence.</p>` },
      { id: 'notice', title: 'Mentions légales', html: `<ul>
        <li><strong>Éditeurs :</strong> ${TEAM_FR}, France, ${mail}</li>
        <li><strong>Hébergement du site :</strong> Vercel Inc. (vercel.com)</li>
        <li><strong>Hébergement de l’application :</strong> Render Services, Inc. (render.com)</li>
        <li><strong>Base de données :</strong> Neon (neon.tech)</li>
      </ul>` },
    ],
  },
]

// Other languages load on demand (src/legal/<code>.js); the English shows until they arrive
const LOADERS = {
  es: () => import('../legal/es.js'), de: () => import('../legal/de.js'), it: () => import('../legal/it.js'),
  pt: () => import('../legal/pt.js'), zh: () => import('../legal/zh.js'),
}
const loaded = ref({})
watch(lang, async (code) => {
  if (!LOADERS[code] || loaded.value[code]) return
  try {
    const m = await LOADERS[code]()
    loaded.value = { ...loaded.value, [code]: { docs: m.default({ mail }), updated: m.UPDATED } }
  } catch {}
}, { immediate: true })
const translated = computed(() => !!loaded.value[lang.value])
const docs = computed(() => (lang.value === 'fr' ? DOCS_FR : loaded.value[lang.value]?.docs || DOCS))
const updated = computed(() => UPDATED[lang.value] || loaded.value[lang.value]?.updated || UPDATED.en)
const tab = ref(route.query.tab === 'terms' ? 'terms' : 'privacy')
const doc = computed(() => docs.value.find(d => d.id === tab.value))
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
.lg-hero{background:linear-gradient(180deg,var(--c-accent-lt),transparent)}
.lg-hero-in{max-width:1040px;margin:0 auto;padding:44px 24px 26px}
.lg-eyebrow{display:inline-block;font-size:13px;font-weight:650;letter-spacing:-.005em;color:var(--c-accent);margin-bottom:10px}
.lg-hero h1{font-size:34px;font-weight:800;letter-spacing:-.03em;color:var(--c-text);margin-bottom:6px}
.lg-hero p{font-size:14.5px;color:var(--c-text2);margin-bottom:22px}
.lg-tabs{display:inline-flex}
.lg-only{font-size:13px!important;color:var(--c-text3)!important;margin-top:-14px}

.lg-body{max-width:1040px;margin:0 auto;padding:32px 24px 72px;display:grid;grid-template-columns:230px minmax(0,1fr);gap:48px;align-items:start}
.lg-side{position:sticky;top:24px;display:flex;flex-direction:column;gap:18px}
.lg-toc{display:flex;flex-direction:column;gap:2px}
.lg-toc-h{font-size:13px;font-weight:650;letter-spacing:-.005em;color:var(--c-text3);margin-bottom:8px}
.lg-toc a{display:flex;gap:10px;align-items:baseline;padding:6px 10px;border-radius:8px;font-size:13.5px;color:var(--c-text2);text-decoration:none;line-height:1.35}
.lg-toc a span{font-size:11.5px;color:var(--c-text3);min-width:14px}
.lg-toc a:hover{background:var(--c-surface2);color:var(--c-text)}
.lg-toc a.active{background:var(--c-accent-lt);color:var(--c-accent);font-weight:600}
.lg-help{border:none;border-radius:20px;padding:18px 20px;background:var(--c-surface);box-shadow:var(--shadow-sm)}
.lg-help-t{font-size:13.5px;font-weight:700;color:var(--c-text)}
.lg-help p{font-size:12.5px;color:var(--c-text2);margin:3px 0 10px}

.lg-doc{max-width:720px}
.lg-summary{border:none;background:var(--c-surface);border-radius:24px;padding:24px 26px;margin-bottom:36px;box-shadow:var(--shadow-sm)}
.lg-summary-h{font-size:13px;font-weight:650;letter-spacing:-.005em;color:var(--c-accent);margin-bottom:10px}
.lg-summary ul{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;padding:0;margin:0}
.lg-summary li{display:flex;gap:9px;font-size:14px;line-height:1.5;color:var(--c-text)}
.lg-summary svg{width:16px;height:16px;flex-shrink:0;margin-top:2px;fill:none;stroke:var(--c-green);stroke-width:3}

.lg-sec{padding-top:6px;margin-bottom:26px;scroll-margin-top:20px}
.lg-sec h2{display:flex;align-items:center;gap:12px;font-size:21px;font-weight:700;letter-spacing:-.025em;color:var(--c-text);margin-bottom:10px}
.lg-num{width:28px;height:28px;border-radius:999px;background:var(--c-accent-lt);color:var(--c-accent);font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
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
