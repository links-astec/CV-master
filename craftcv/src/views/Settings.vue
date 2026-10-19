<template>
  <div class="view-page st-page">
    <div class="view-inner st">
      <h1 class="st-h1">{{ $t('Settings') }}</h1>
      <nav class="st-jump" :aria-label="$t('Settings sections')">
        <a v-for="j in jumps" :key="j.id" :href="'#' + j.id" :class="{ on: activeJump === j.id }" @click.prevent="jump(j.id)">{{ $t(j.label) }}</a>
      </nav>

      <!-- Account -->
      <section v-if="auth.isLoggedIn" id="account" class="st-card st-hero">
        <div class="st-hero-bg" aria-hidden="true"></div>
        <div class="st-acct">
          <!-- Profile picture: the account's avatar everywhere, and the photo offered for CV layouts with one -->
          <button type="button" class="st-ava" :class="{ busy: detailsSaving }" :aria-label="$t('Change profile picture')" :title="$t('Change profile picture')" @click="picInput?.click()">
            <img v-if="auth.user?.photo" :src="auth.user.photo" alt="" />
            <template v-else>{{ (auth.user?.name || auth.user?.email || '?')[0].toUpperCase() }}</template>
            <span class="st-ava-cam" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
          </button>
          <input ref="picInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onPicture" />
          <div class="st-acct-txt">
            <div class="st-acct-name">{{ auth.user?.name }}</div>
            <div class="st-ava-acts">
              <button type="button" class="st-link-btn" :disabled="detailsSaving" @click="picInput?.click()">{{ $t(auth.user?.photo ? 'Change picture' : 'Add a profile picture') }}</button>
              <template v-if="auth.user?.photo"> · <button type="button" class="st-link-btn" :disabled="detailsSaving" @click="setPicture(null)">{{ $t('Remove') }}</button></template>
            </div>
            <div class="st-acct-mail">{{ auth.user?.email }}
              <span v-if="auth.user?.emailVerified === false" class="st-unv">· {{ $t('not confirmed') }}, <button class="st-link-btn" @click="resendVerification()">{{ $t('resend link') }}</button></span>
              <span v-else class="st-ver">· {{ $t('confirmed') }}</span></div>
          </div>
          <button class="btn-secondary btn-sm" @click="logout">{{ $t('Sign out') }}</button>
        </div>
        <!-- At a glance: plan, AI left today, free CVs earned -->
        <div class="st-glance">
          <button type="button" class="st-gl st-gl-plan" :class="{ pass }" @click="pass ? jump('pass') : router.push('/pricing')">
            <span class="st-gl-k">{{ $t('Your plan') }}</span>
            <b>{{ $t(pass ? 'Job Hunt Pass' : 'Free') }}</b>
            <span class="st-gl-s">{{ pass ? $t(pass.cancelAtEnd ? 'until {date}' : 'renews {date}', { date: fmtDay(pass.until) }) : $t('See plans') + ' →' }}</span>
          </button>
          <div class="st-gl">
            <span class="st-gl-k">{{ $t('AI today') }}</span>
            <b>{{ aiQuota ? aiQuota.freeLeft : '·' }}<small v-if="aiQuota">/{{ aiQuota.limit }}</small></b>
            <span class="st-gl-s">{{ aiQuota?.credits ? $t('{n} extra', { n: aiQuota.credits }) : $t('requests left') }}</span>
          </div>
          <button type="button" class="st-gl" @click="jump('invite')">
            <span class="st-gl-k">{{ $t('Free CVs') }}</span>
            <b>{{ referralInfo?.credits ?? 0 }}</b>
            <span class="st-gl-s">{{ $t('{n} friends joined', { n: referralInfo?.count ?? 0 }) }}</span>
          </button>
        </div>

        <div class="st-rows">
          <div class="st-row">
            <label class="st-lbl" for="st-name">{{ $t('Display name') }}</label>
            <div class="st-name">
              <input id="st-name" class="f-inp" v-model="name" :placeholder="auth.user?.name" @keydown.enter="dirty && saveProfile()" />
              <Transition name="st-pop"><button v-if="dirty" class="btn-primary accent btn-sm" :disabled="saving" @click="saveProfile">{{ $t(saving ? 'Saving…' : 'Save') }}</button></Transition>
            </div>
          </div>
          <div class="st-row st-row-pw">
            <span class="st-lbl">{{ $t('Password') }}</span>
            <div class="st-pw-line">
              <span v-if="hasPw" class="st-dots" aria-hidden="true">••••••••••</span>
              <span v-else class="st-muted">{{ $t('Not set. You sign in with Google.') }}</span>
              <button v-if="!changingPw" class="btn-secondary btn-sm" @click="openPw">{{ $t(hasPw ? 'Change' : 'Set a password') }}</button>
            </div>
          </div>
        </div>
        <div v-if="saveError" class="st-err">{{ $t(saveError) }}</div>

        <!-- Change (or set) the password: its own small form, with its own button -->
        <Transition name="st-pwt">
          <form v-if="changingPw" class="st-pwbox" @submit.prevent="savePassword">
            <div class="st-pwbox-hd">
              <span class="st-pwbox-ic"><svg viewBox="0 0 24 24"><rect x="4" y="10.5" width="16" height="10.5" rx="3"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/></svg></span>
              <div>
                <div class="st-pwbox-t">{{ $t(hasPw ? 'Change your password' : 'Set a password') }}</div>
                <p class="st-muted">{{ $t(hasPw ? 'Use at least 8 characters. Longer is stronger.' : 'Then you can also sign in with your email and this password.') }}</p>
              </div>
            </div>
            <input class="st-sr" type="email" :value="auth.user?.email" autocomplete="username" tabindex="-1" aria-hidden="true" readonly />
            <label v-if="hasPw" class="st-fld">
              <span>{{ $t('Current password') }}</span>
              <input ref="pwFirst" class="f-inp" v-model="currentPassword" type="password" autocomplete="current-password" />
            </label>
            <label class="st-fld">
              <span>{{ $t('New password') }}</span>
              <span class="st-pw">
                <input ref="pwNew" class="f-inp" v-model="newPassword" :type="showPw ? 'text' : 'password'" autocomplete="new-password" />
                <button type="button" class="st-eye" :aria-label="$t(showPw ? 'Hide password' : 'Show password')" :title="$t(showPw ? 'Hide password' : 'Show password')" @click="showPw = !showPw">
                  <svg v-if="showPw" viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.8 10.8 0 0112 5c6.5 0 10 7 10 7a17.6 17.6 0 01-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.9 9.9 0 005.4-1.6"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/></svg>
                  <svg v-else viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </span>
            </label>
            <div class="st-strength" :class="'lv' + pwLevel" aria-live="polite">
              <span class="st-bars"><i v-for="n in 4" :key="n"></i></span>
              <span class="st-strength-t">{{ pwLevel ? $t(PW_LABELS[pwLevel]) : '' }}</span>
            </div>
            <label class="st-fld">
              <span>{{ $t('Confirm new password') }}</span>
              <input class="f-inp" v-model="confirmPassword" :type="showPw ? 'text' : 'password'" autocomplete="new-password" :class="{ bad: pwMismatch }" />
            </label>
            <div v-if="pwMismatch" class="st-err">{{ $t('Passwords don’t match') }}</div>
            <div v-if="pwError" class="st-err">{{ $t(pwError) }}</div>
            <div class="st-pwbox-f">
              <button type="button" class="btn-ghost" @click="closePw">{{ $t('Cancel') }}</button>
              <button class="btn-primary accent" :disabled="!pwValid || pwSaving">{{ $t(pwSaving ? 'Saving…' : hasPw ? 'Update password' : 'Set password') }}</button>
            </div>
          </form>
        </Transition>
      </section>

      <!-- Guest -->
      <section v-else id="account" class="st-card st-guest">
        <div>
          <div class="st-card-t">{{ $t('You’re using CVMaster as a guest') }}</div>
          <p class="st-p">{{ $t('Your CV is saved in this browser only. Create a free account to keep it safe, use it on any device and export it.') }}</p>
        </div>
        <div class="st-btns">
          <button class="btn-primary accent" @click="openAuth('register', 'save')">{{ $t('Create free account') }}</button>
          <button class="btn-secondary" @click="openAuth('signin')">{{ $t('Sign in') }}</button>
        </div>
      </section>

      <!-- Invite friends -->
      <section v-if="auth.isLoggedIn" id="invite" class="st-card">
        <div class="st-card-hd">
          <div>
            <div class="st-card-t">{{ $t('Invite friends') }}</div>
            <p class="st-p">{{ $t('They get {n} extra AI requests when they join. When a friend gets their first clean CV, you get a free CV.', { n: referralInfo?.welcomeAi || 25 }) }}</p>
          </div>
        </div>

        <div v-if="referralLoading" class="st-muted">{{ $t('Loading…') }}</div>
        <template v-else-if="referralInfo">
          <div class="st-stats">
            <div><span>{{ referralInfo.count }}</span>{{ $t('joined') }}</div>
            <div><span>{{ referralInfo.rewarded ?? 0 }}</span>{{ $t('got their CV') }}</div>
            <div class="hl"><span>{{ referralInfo.credits }}</span>{{ $t(referralInfo.credits === 1 ? 'free CV to use' : 'free CVs to use') }}</div>
          </div>
          <p v-if="referralInfo.credits > 0" class="st-note">{{ $t('Use a free CV at export. Choose “Use a referral credit”.') }}</p>

          <div class="st-link">
            <input class="f-inp" :value="referralInfo.link" readonly :aria-label="$t('Your invite link')" @focus="$event.target.select()" />
            <button class="btn-primary accent" @click="copyLink">{{ $t(copied ? 'Copied ✓' : 'Copy link') }}</button>
          </div>
          <div class="st-share">
            <span>{{ $t('Share on') }}</span>
            <button class="st-share-btn" @click="shareWhatsApp">WhatsApp</button>
            <button class="st-share-btn" @click="shareLinkedIn">LinkedIn</button>
            <button class="st-share-btn" @click="shareTwitter">X</button>
            <button class="st-share-btn" @click="shareEmail">{{ $t('Email') }}</button>
          </div>
        </template>
        <div v-else class="st-muted">{{ $t('Couldn’t load your invite link, try refreshing.') }}</div>
      </section>

      <!-- Job Hunt Pass -->
      <section id="pass" class="st-card st-pass" :class="{ on: pass }">
        <div class="st-pass-glow" aria-hidden="true"></div>
        <span class="st-pass-kick">{{ $t('Job Hunt Pass') }}</span>
        <template v-if="pass">
          <div class="st-pass-title">{{ $t(pass.cancelAtEnd ? 'Your pass is cancelled' : 'Your pass is on') }}</div>
          <p class="st-pass-p">{{ pass.cancelAtEnd ? $t('Cancelled. You keep everything until {date}.', { date: fmtDay(pass.until) })
            : $t(pass.plan === 'quarter' ? 'Active. Renews on {date} for €14.99.' : 'Active. Renews on {date} for €6.99.', { date: fmtDay(pass.until) }) }}</p>
          <ul class="st-pass-list"><li v-for="f in PASS_FEATURES.slice(0, 3)" :key="f"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ $t(f) }}</li></ul>
          <button v-if="!pass.cancelAtEnd" class="st-pass-ghost" :disabled="passBusy" @click="changePass('cancel')">{{ $t('Cancel the pass') }}</button>
          <button v-else class="st-pass-cta" :disabled="passBusy" @click="changePass('resume')">{{ $t('Keep my pass') }}</button>
        </template>
        <template v-else>
          <div class="st-pass-title">{{ $t('Every CV you make, unlocked.') }}</div>
          <p class="st-pass-p">{{ $t('Applying to lots of jobs? Every CV you make as a clean PDF, emailed and downloadable, and 100 AI requests a day.') }}</p>
          <div class="st-plans" role="radiogroup" :aria-label="$t('Job Hunt Pass billing')">
            <button type="button" role="radio" class="st-po" :class="{ on: passPlan === 'month' }" :aria-checked="passPlan === 'month'" @click="passPlan = 'month'">
              <span class="st-po-t">{{ $t('Monthly') }}</span>
              <span class="st-po-p">€6.99</span>
              <span class="st-po-s">{{ $t('a month') }}<template v-if="approx(6.99)"> · {{ approx(6.99) }}</template></span>
            </button>
            <button type="button" role="radio" class="st-po" :class="{ on: passPlan === 'quarter' }" :aria-checked="passPlan === 'quarter'" @click="passPlan = 'quarter'">
              <span class="st-po-badge">−29%</span>
              <span class="st-po-t">{{ $t('Every 3 months') }}</span>
              <span class="st-po-p">€14.99</span>
              <span class="st-po-s">{{ $t('€5.00 a month') }}<template v-if="approx(14.99)"> · {{ approx(14.99) }}</template></span>
            </button>
          </div>
          <ul class="st-pass-list"><li v-for="f in PASS_FEATURES" :key="f"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{{ $t(f) }}</li></ul>
          <label v-if="auth.isLoggedIn" class="st-consent">
            <input type="checkbox" v-model="passConsent" />
            <span>{{ $t('I want the pass to start straight away and agree that I lose my 14-day right of withdrawal once it starts.') }}</span>
          </label>
          <div class="st-pass-row">
            <button class="st-pass-cta" :disabled="passBusy || (auth.isLoggedIn && !passConsent)" @click="getPass">{{ $t(passBusy ? 'Please wait…' : passPlan === 'quarter' ? 'Get 3 months for €14.99' : 'Get the pass for €6.99') }}</button>
            <RouterLink to="/pricing" class="st-pass-link">{{ $t('Compare all plans') }}</RouterLink>
          </div>
          <p class="st-pass-note">{{ $t('Secure payment by Stripe · Cancel any time, it then runs to the end of the period you paid for.') }}</p>
        </template>
      </section>

      <!-- AI requests -->
      <section id="ai" class="st-card">
        <div class="st-card-hd">
          <div>
            <div class="st-card-t">{{ $t('AI requests') }}</div>
            <p class="st-p">{{ $t(aiQuota?.tier === 'pass' ? '100 every day with your Job Hunt Pass, reset at midnight (UTC). Extra requests never expire.' : aiQuota?.tier === 'verified' ? '30 free every day, reset at midnight (UTC). Extra requests never expire.' : '5 free a day. 30 once your email is confirmed. Reset at midnight (UTC). Extra requests never expire.') }}</p>
          </div>
          <button class="btn-secondary btn-sm" @click="openAiAllowance()">{{ $t('Get 100 more for €0.50') }}<template v-if="approx(0.5)"> ({{ approx(0.5) }})</template></button>
        </div>
        <template v-if="aiQuota">
          <div class="st-meter"><div :style="{ width: (aiQuota.freeLeft / aiQuota.limit * 100) + '%' }"></div></div>
          <div class="st-meter-txt">{{ $t('{n} of {limit} free left today', { n: aiQuota.freeLeft, limit: aiQuota.limit }) }}<template v-if="aiQuota.credits"> · {{ $t('{n} extra', { n: aiQuota.credits }) }}</template></div>
        </template>
      </section>

      <!-- AI personalisation (own CVs only) -->
      <section v-if="auth.isLoggedIn" class="st-card">
        <div class="st-card-hd">
          <div>
            <div class="st-card-t">{{ $t('AI personalisation') }}</div>
            <p class="st-p">{{ $t('For CVs in your own name, the AI uses these answers and your other CVs to tailor its suggestions. CVs you make for someone else never use them.') }}</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="auth.user?.aiPersonalize !== false" :disabled="profileSaving" @change="saveAiProfile({ aiPersonalize: $event.target.checked })" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div v-if="auth.user?.aiPersonalize !== false" class="st-ai">
          <div v-for="g in aiGroups" :key="g.key" class="st-ai-g" role="radiogroup" :aria-label="$t(g.label)">
            <div class="st-lbl">{{ $t(g.label) }}</div>
            <div class="st-chips">
              <button v-for="o in g.options" :key="o.id" type="button" class="st-chip" role="radio"
                :class="{ on: auth.user?.[g.key] === o.id }" :aria-checked="auth.user?.[g.key] === o.id" :disabled="profileSaving"
                @click="saveAiProfile({ [g.key]: auth.user?.[g.key] === o.id ? '' : o.id })">
                {{ $t(o.label) }}<span v-if="o.years" class="st-chip-sub">{{ $t(o.years) }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Saved personal details: new CVs start with them filled in -->
      <section v-if="auth.isLoggedIn" id="details" class="st-card">
        <div class="st-card-hd">
          <div>
            <div class="st-card-t">{{ $t('Your details') }}</div>
            <p class="st-p">{{ $t('Your name, contact details, links, photo and languages are kept from the CVs you make for yourself, so every new CV starts with them filled in. CVs for someone else are never used.') }}</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="details?.autofill !== false" :disabled="!details || detailsSaving" @change="setAutofill($event.target.checked)" :aria-label="$t('Your details')" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <template v-if="details && details.autofill !== false">
          <!-- The details new CVs start with -->
          <div class="st-dgrid">
            <label v-for="f in DETAIL_FIELDS" :key="f.k" class="st-dfield" :class="{ wide: f.wide }">
              <span class="f-lbl">{{ $t(f.label) }}</span>
              <input class="f-inp" v-model="form[f.k]" :type="f.type || 'text'" :autocomplete="f.ac || 'off'" :placeholder="f.ph ? $t(f.ph) : ''" maxlength="200" />
            </label>
          </div>
          <p v-if="details.profile?.languages?.length" class="st-p st-dlangs">{{ $t('Languages') }}: {{ details.profile.languages.map(l => [l.name, l.level].filter(Boolean).join(' · ')).join(', ') }}</p>
          <div class="st-dacts">
            <button class="btn-primary accent btn-sm" :disabled="!detailsChanged || detailsSaving" @click="saveDetails">{{ $t(detailsSaving ? 'Saving…' : 'Save details') }}</button>
            <button v-if="detailRows.length" class="btn-ghost btn-sm st-forget" :disabled="detailsSaving" @click="forgetDetails">{{ $t('Forget my details') }}</button>
          </div>
        </template>
      </section>

      <!-- Preferences -->
      <section id="prefs" class="st-card">
        <div class="st-card-t">{{ $t('Preferences') }}</div>
        <div class="st-pref">
          <div><div class="st-pref-t">{{ $t('Language') }}</div><div class="st-pref-s">{{ $t('The language of CVMaster itself. Your CV’s language is set in the editor.') }}</div></div>
          <LangSwitch />
        </div>
        <div class="st-pref">
          <div><div class="st-pref-t">{{ $t('Dark mode') }}</div><div class="st-pref-s">{{ $t('Easier on the eyes at night') }}</div></div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.darkMode" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div v-if="auth.isLoggedIn" class="st-pref">
          <div>
            <div class="st-pref-t">{{ $t('Personalise with my activity') }}</div>
            <div class="st-pref-s">{{ $t('Suggests your next step and reminds you where you left off, from what you do in CVMaster. Kept on our servers only, never shared. Turning it off deletes it.') }}</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="auth.user?.personalizeActivity !== false" :disabled="profileSaving" @change="setPersonalize($event.target.checked)" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div v-if="auth.isLoggedIn" class="st-pref">
          <div>
            <div class="st-pref-t">{{ $t('Email newsletter') }}</div>
            <div class="st-pref-s">{{ $t(nlStatus === 'pending' ? 'Starts once you confirm your email address' : 'CV tips and CVMaster news. A couple of emails a month at most') }}</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="nlStatus === 'subscribed' || nlStatus === 'pending'" :disabled="nlStatus === null || nlSaving" @change="setNewsletter($event.target.checked)" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div class="st-pref">
          <div><div class="st-pref-t">{{ $t('Quick tour') }}</div><div class="st-pref-s">{{ $t('A one-minute walkthrough of building, tailoring and exporting') }}</div></div>
          <button class="btn-secondary btn-sm" @click="restartTour">{{ $t('Start tour') }}</button>
        </div>
      </section>

      <!-- Review (only shows for people who have made a CV) -->
      <ReviewPrompt id="review" class="st-review" />

      <!-- Help -->
      <section id="help" class="st-card">
        <div class="st-card-t">{{ $t('Help & feedback') }}</div>
        <div class="st-help">
          <button @click="openFeedback('suggestion')"><strong>{{ $t('Send feedback') }}</strong><span>{{ $t('Ideas or something that isn’t working') }}</span></button>
          <button @click="openFeedback('complaint')"><strong>{{ $t('Make a complaint') }}</strong><span>{{ $t('We reply to every complaint') }}</span></button>
          <RouterLink to="/privacy"><strong>{{ $t('Privacy policy') }}</strong><span>{{ $t('What we collect and why') }}</span></RouterLink>
          <RouterLink to="/terms"><strong>{{ $t('Terms of service') }}</strong><span>{{ $t('Payments, refunds and complaints') }}</span></RouterLink>
        </div>
      </section>

      <!-- Delete account -->
      <section v-if="auth.isLoggedIn" class="st-card">
        <div class="st-card-hd st-del-hd">
          <div>
            <div class="st-card-t">{{ $t('Delete account') }}</div>
            <p class="st-p">{{ $t('Deletes your account and every CV in it, on the website and in the app. This cannot be undone.') }}</p>
          </div>
          <button v-if="!deleting" class="btn-secondary btn-sm st-danger-ghost" @click="deleting = true">{{ $t('Delete account') }}</button>
        </div>
        <div v-if="deleting" class="st-del">
          <input v-if="auth.user?.hasPassword ?? auth.user?.provider !== 'google'" class="f-inp" v-model="deleteConfirm" type="password"
                 :placeholder="$t('Current password')" autocomplete="current-password" @keydown.enter="deleteAccount" />
          <input v-else class="f-inp" v-model="deleteConfirm" type="email" :placeholder="$t('Type your email address to confirm.')" @keydown.enter="deleteAccount" />
          <div v-if="deleteError" class="st-err">{{ $t(deleteError) }}</div>
          <div class="st-btns">
            <button class="btn-primary st-danger" :disabled="deleteBusy || !deleteConfirm" @click="deleteAccount">{{ $t(deleteBusy ? 'Deleting…' : 'Delete my account') }}</button>
            <button class="btn-ghost" :disabled="deleteBusy" @click="deleting = false; deleteConfirm = ''; deleteError = ''">{{ $t('Cancel') }}</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useCvStore } from '../stores/cv.js'
import ReviewPrompt from '../components/ReviewPrompt.vue'
import LangSwitch from '../components/LangSwitch.vue'
import { INDUSTRIES, GOALS, LEVELS } from '../composables/profileOptions.js'
import { t } from '../i18n/index.js'
import { resizePhoto } from '../composables/photo.js'
import { track } from '../composables/track.js'
import { approx } from '../composables/localPrice.js'

const apiUrl    = (p) => (import.meta.env.VITE_API_URL || '') + p
const auth      = useAuthStore()
const store     = useCvStore()
const router    = useRouter()
const showToast = inject('showToast')
const openAuth  = inject('openAuth')
const openFeedback    = inject('openFeedback')
const openAiAllowance = inject('openAiAllowance')
const resendVerification = inject('resendVerification')

// ── Saved personal details (filled into new CVs) ─────────────────────────────
const confirmDialog = inject('confirm')
const details = ref(null)          // { autofill, profile }
const detailsSaving = ref(false)
const DETAIL_LABELS = { fn: 'First Name', ln: 'Last Name', email: 'Email', phone: 'Phone', loc: 'Location', li: 'LinkedIn URL', github: 'GitHub', website: 'Website / Portfolio', photo: 'Photo', languages: 'Languages' }
const detailRows = computed(() => {
  const p = details.value?.profile || {}
  return Object.entries(DETAIL_LABELS).filter(([k]) => p[k] && (!Array.isArray(p[k]) || p[k].length)).map(([k, label]) => ({
    k, label,
    value: k === 'photo' ? t('Saved') : k === 'languages' ? p.languages.map(l => [l.name, l.level].filter(Boolean).join(' · ')).join(', ') : p[k],
  }))
})
// The editable form (a copy of the saved details until "Save details")
const DETAIL_FIELDS = [
  { k: 'fn', label: 'First Name', ac: 'given-name' }, { k: 'ln', label: 'Last Name', ac: 'family-name' },
  { k: 'email', label: 'Email', type: 'email', ac: 'email' }, { k: 'phone', label: 'Phone', type: 'tel', ac: 'tel' },
  { k: 'loc', label: 'Location', ph: 'London, UK' }, { k: 'li', label: 'LinkedIn URL', ph: 'linkedin.com/in/you' },
  { k: 'github', label: 'GitHub', ph: 'github.com/you' }, { k: 'website', label: 'Website / Portfolio', ph: 'yourportfolio.com' },
]
const EDITABLE = DETAIL_FIELDS.map(f => f.k)
const form = reactive({})
const picInput = ref(null)
function resetForm() { const p = details.value?.profile || {}; for (const k of EDITABLE) form[k] = p[k] || '' }
const detailsChanged = computed(() => EDITABLE.some(k => (form[k] || '') !== ((details.value?.profile || {})[k] || '')))
async function loadDetails() {
  try { const r = await fetch(apiUrl('/api/me/profile'), { credentials: 'include' }); if (r.ok) { details.value = await r.json(); resetForm() } } catch {}
}
async function saveDetails() {
  detailsSaving.value = true
  try {
    const body = Object.fromEntries(EDITABLE.map(k => [k, form[k] || '']))
    const r = await fetch(apiUrl('/api/me/profile'), { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || t('Could not save, please try again.'))
    details.value = { autofill: true, profile: j.profile || {} }
    resetForm()
    store.profile = details.value
    showToast(t('Saved'))
  } catch (e) { showToast(e.message) }
  detailsSaving.value = false
}
async function onPicture(e) {
  const file = e.target.files?.[0]; e.target.value = ''
  if (!file) return
  try { await setPicture(await resizePhoto(file)) } catch (err) { showToast(t(err.message)) }
}
// The picture is saved straight away (no need to press Save)
async function setPicture(dataUrl) {
  const before = auth.user?.photo || null
  if (auth.user) auth.user.photo = dataUrl   // shown straight away
  detailsSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/me/profile'), { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photo: dataUrl }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || t('Could not save, please try again.'))
    details.value = { autofill: true, profile: j.profile || {} }
    store.profile = details.value
    if (auth.user) auth.user.photo = j.profile?.photo || null
    showToast(t(dataUrl ? 'Profile picture saved' : 'Profile picture removed'))
  } catch (err) { if (auth.user) auth.user.photo = before; showToast(err.message) }
  detailsSaving.value = false
}
async function setAutofill(on) {
  if (!on && detailRows.value.length) {
    const ok = await confirmDialog({ title: t('Stop filling in new CVs?'), message: t('Your saved details are forgotten. Your existing CVs don’t change.'), ok: t('Turn off'), cancel: t('Keep'), mode: 'warning' })
    if (!ok) { details.value = { ...details.value }; return }
  }
  detailsSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/me/profile'), { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autofill: on }) })
    if (!r.ok) throw new Error()
    details.value = { autofill: on, profile: on ? details.value?.profile || {} : {} }
    showToast(t('Saved'))
  } catch { showToast(t('Could not save, please try again.')) }
  detailsSaving.value = false
}
async function forgetDetails() {
  const ok = await confirmDialog({ title: t('Forget your details?'), message: t('New CVs will start empty until you save a CV for yourself again. Your existing CVs don’t change.'), ok: t('Forget'), cancel: t('Keep'), mode: 'warning' })
  if (!ok) return
  detailsSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/me/profile'), { method: 'DELETE', credentials: 'include' })
    if (!r.ok) throw new Error()
    details.value = { ...details.value, profile: {} }
    resetForm(); store.profile = details.value; if (auth.user) auth.user.photo = null
    showToast(t('Your details were forgotten'))
  } catch { showToast(t('Could not save, please try again.')) }
  detailsSaving.value = false
}

// ── Newsletter ────────────────────────────────────────────────────────────────
const nlStatus = ref(null)     // null (loading) | none | pending | subscribed | unsubscribed
const nlSaving = ref(false)
async function loadNewsletter() {
  try { const r = await fetch(apiUrl('/api/newsletter/me'), { credentials: 'include' }); if (r.ok) nlStatus.value = (await r.json()).status } catch {}
}
async function setNewsletter(on) {
  nlSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/newsletter/me'), {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscribed: on }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error)
    nlStatus.value = d.status
    showToast(d.status === 'subscribed' ? 'Subscribed to the newsletter' : d.status === 'pending' ? 'Confirm your email to start the newsletter' : 'Unsubscribed')
  } catch (e) { showToast(e.message || 'Could not save, please try again.') }
  nlSaving.value = false
}

// ── AI allowance ──────────────────────────────────────────────────────────────
const aiQuota = ref(null)
async function loadAiQuota() {
  try { const r = await fetch(apiUrl('/api/ai/quota'), { credentials: 'include' }); if (r.ok) aiQuota.value = await r.json() } catch {}
}

// ── Profile ───────────────────────────────────────────────────────────────────
const name        = ref(auth.user?.name || '')
const saving      = ref(false)
const saveError   = ref('')
const dirty = computed(() => !!name.value.trim() && name.value.trim() !== auth.user?.name)

async function saveProfile() {
  saveError.value = ''
  saving.value = true
  try {
    const r = await fetch(apiUrl('/api/auth/settings'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value.trim() }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    if (auth.user) auth.user.name = name.value.trim()
    showToast('Saved')
  } catch (e) { saveError.value = e.message }
  saving.value = false
}

// ── Password: change it, or set a first one (Google accounts) ────────────────
const hasPw = computed(() => auth.user?.hasPassword ?? auth.user?.provider !== 'google')
const changingPw      = ref(false)
const currentPassword = ref('')
const newPassword     = ref('')
const confirmPassword = ref('')
const showPw   = ref(false)
const pwSaving = ref(false)
const pwError  = ref('')
const pwFirst  = ref(null)
const pwNew    = ref(null)
const PW_LABELS = ['', 'Too short', 'Fair', 'Good', 'Strong']
// 1 too short, 2 fair, 3 good, 4 strong: length plus a mix of lower case, capitals, numbers and symbols
const pwLevel = computed(() => {
  const p = newPassword.value
  if (!p) return 0
  if (p.length < 8) return 1
  const mix = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(rx => rx.test(p)).length + (p.length >= 12 ? 1 : 0)
  return mix >= 4 ? 4 : mix === 3 ? 3 : 2
})
const pwMismatch = computed(() => !!confirmPassword.value && confirmPassword.value !== newPassword.value)
const pwValid = computed(() => newPassword.value.length >= 8 && confirmPassword.value === newPassword.value && (!hasPw.value || !!currentPassword.value))

function openPw() {
  changingPw.value = true
  setTimeout(() => (pwFirst.value || pwNew.value)?.focus(), 60)
}
function closePw() {
  changingPw.value = false
  currentPassword.value = newPassword.value = confirmPassword.value = pwError.value = ''
  showPw.value = false
}
async function savePassword() {
  if (!pwValid.value || pwSaving.value) return
  pwError.value = ''
  pwSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/auth/settings'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword.value, currentPassword: currentPassword.value }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.error || 'Could not save, please try again.')
    const wasSet = hasPw.value
    if (auth.user) auth.user.hasPassword = true
    closePw()
    showToast(wasSet ? 'Password updated' : 'Password set')
  } catch (e) { pwError.value = e.message }
  pwSaving.value = false
}

// Personalisation switch and onboarding answers. Saved as soon as they change
const profileSaving = ref(false)
const aiGroups = [
  { key: 'industry', label: 'Your field', options: INDUSTRIES },
  { key: 'goal', label: 'What are you aiming for?', options: GOALS },
  { key: 'experience', label: 'Experience', options: LEVELS },
]
async function saveAiProfile(change) {
  profileSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/auth/settings'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(change),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.error)
    if (auth.user && data.user) Object.assign(auth.user, { aiPersonalize: data.user.aiPersonalize, industry: data.user.industry, goal: data.user.goal, experience: data.user.experience })
    showToast('Saved')
  } catch (e) { showToast(e.message || 'Could not save, please try again.') }
  profileSaving.value = false
}

// Personalisation from activity (turning it off deletes what was kept)
async function setPersonalize(on) {
  profileSaving.value = true
  try {
    const r = await fetch(apiUrl('/api/auth/settings'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalizeActivity: on }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.error)
    if (auth.user) auth.user.personalizeActivity = on
    showToast('Saved')
  } catch (e) { showToast(e.message || 'Could not save, please try again.') }
  profileSaving.value = false
}

// Signing out clears this browser's copy of the CV; App then shows the homepage
async function logout() {
  await auth.logout()
  store.resetData()
  router.push('/')
}

// Delete the account (confirmed with the password, or the email for Google accounts without one)
const deleting      = ref(false)
const deleteConfirm = ref('')
const deleteError   = ref('')
const deleteBusy    = ref(false)
async function deleteAccount() {
  if (!deleteConfirm.value || deleteBusy.value) return
  deleteError.value = ''
  deleteBusy.value = true
  try {
    const hasPw = auth.user?.hasPassword ?? auth.user?.provider !== 'google'
    const r = await fetch(apiUrl('/api/auth/delete-account'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hasPw ? { password: deleteConfirm.value } : { confirmEmail: deleteConfirm.value }),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.error || 'Something went wrong. Please try again.')
    auth.user = null
    store.resetData()
    router.push('/')
    showToast('Your account has been deleted.')
  } catch (e) { deleteError.value = e.message }
  deleteBusy.value = false
}

const startTutorial = inject('startTutorial', null)
function restartTour() {
  try { localStorage.removeItem('cvmaster-tour-done') } catch {}
  startTutorial?.()
}

// ── Referrals ─────────────────────────────────────────────────────────────────
const referralInfo    = ref(null)
const referralLoading = ref(true)
const copied          = ref(false)

async function loadReferral() {
  try {
    const r = await fetch(apiUrl('/api/referral/info'), { credentials: 'include' })
    if (r.ok) referralInfo.value = await r.json()
  } catch {}
  referralLoading.value = false
}
async function copyLink() {
  const link = referralInfo.value?.link || ''
  try {
    await navigator.clipboard.writeText(link)
    track('invite_shared', { channel: 'copy' })
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {
    // Clipboard blocked: select the link so it can be copied by hand
    const el = document.querySelector('.st-link input'); el?.focus(); el?.select()
    showToast(t('Select and copy your invite link.'))
  }
}
const shareMsg = () => t('I’ve been using CVMaster to build my CV. It tailors it to the job and checks it against ATS. Sign up with my link and get {n} extra AI requests: {link}', { n: referralInfo.value?.welcomeAi || 25, link: referralInfo.value?.link || '' })
function shareWhatsApp() { track('invite_shared', { channel: 'whatsapp' }); window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg())}`, '_blank') }
function shareTwitter()  { track('invite_shared', { channel: 'x' }); window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg())}`, '_blank') }
function shareLinkedIn() { track('invite_shared', { channel: 'linkedin' }); window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralInfo.value?.link || '')}`, '_blank') }
function shareEmail()    { track('invite_shared', { channel: 'email' }); window.location.href = `mailto:?subject=${encodeURIComponent(t('Try CVMaster for your CV'))}&body=${encodeURIComponent(shareMsg())}` }

// ── Job Hunt Pass ──
const PASS_FEATURES = ['Every CV as a clean PDF, emailed and downloadable', '100 AI requests a day (instead of 30)', 'Re-send any CV after edits, free', 'Cancel any time']
const pass = computed(() => auth.user?.pass || null)
const passBusy = ref(false)
const passConsent = ref(false)
// Chosen on the pricing page (?plan=month) or here; 3 months is the better deal
const passPlan = ref(new URLSearchParams(location.search).get('plan') === 'month' ? 'month' : 'quarter')
// Section shortcuts, and which one is in view
const jumps = computed(() => [
  { id: 'account', label: 'Account' }, { id: 'pass', label: 'Job Hunt Pass' },
  ...(auth.isLoggedIn ? [{ id: 'invite', label: 'Invite friends' }] : []), { id: 'ai', label: 'AI' },
  ...(auth.isLoggedIn ? [{ id: 'details', label: 'Your details' }] : []), { id: 'prefs', label: 'Preferences' }, { id: 'help', label: 'Help' },
])
const activeJump = ref('account')
function jump(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); activeJump.value = id }
function onScroll(e) {
  const top = e.target.getBoundingClientRect().top + 120
  // the section whose top most recently passed the line under the shortcuts
  let cur = jumps.value[0]?.id, best = -Infinity
  for (const j of jumps.value) { const t = document.getElementById(j.id)?.getBoundingClientRect().top; if (t != null && t <= top && t > best) { best = t; cur = j.id } }
  activeJump.value = cur
}
const fmtDay = (iso) => { try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return iso } }
async function getPass() {
  if (!auth.isLoggedIn) { openAuth('register', 'pass'); return }
  passBusy.value = true
  try {
    const r = await fetch(apiUrl('/api/payment/pass'), { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ withdrawalConsent: passConsent.value, plan: passPlan.value }) })
    const j = await r.json()
    if (!r.ok) throw new Error(j.error || 'Could not start payment. Please try again.')
    if (j.alreadyActive) { await auth.fetchMe(); showToast(t('Your Job Hunt Pass is already on')); return }
    location.href = j.url
  } catch (e) { showToast(t(e.message)) } finally { passBusy.value = false }
}
async function changePass(action) {
  if (action === 'cancel') {
    const ok = await confirmDialog({ title: t('Cancel the Job Hunt Pass?'), message: t('Nothing more is charged. You keep the pass until {date}.', { date: fmtDay(pass.value.until) }), ok: t('Cancel the pass'), cancel: t('Keep it'), mode: 'warning' })
    if (!ok) return
  }
  passBusy.value = true
  try {
    const r = await fetch(apiUrl('/api/payment/pass/' + action), { method: 'POST', credentials: 'include' })
    const j = await r.json()
    if (!r.ok) throw new Error(j.error || 'Could not change the pass. Please try again.')
    if (auth.user) auth.user.pass = j.pass
    showToast(t(action === 'cancel' ? 'Your pass won’t renew' : 'Your pass will renew'))
  } catch (e) { showToast(t(e.message)) } finally { passBusy.value = false }
}
// Back from Stripe checkout
async function passReturn() {
  const q = new URLSearchParams(location.search)
  if (!q.get('pass')) return
  router.replace({ path: '/settings', hash: '#pass' })
  if (q.get('pass') !== 'done') return
  try {
    const r = await fetch(apiUrl('/api/payment/pass/verify'), { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: q.get('session') }) })
    const j = await r.json()
    if (auth.user && j.pass) auth.user.pass = j.pass
    showToast(t(j.pass ? 'Your Job Hunt Pass is on. Good luck with the job hunt!' : 'Payment received. Your pass will switch on in a moment.'))
    loadAiQuota()
  } catch {}
}

onMounted(() => {
  passReturn()
  document.querySelector('.st-page')?.addEventListener('scroll', onScroll, { passive: true })
  if (location.hash === '#pass') setTimeout(() => document.getElementById('pass')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600)
  loadAiQuota(); if (auth.isLoggedIn) { loadReferral(); loadNewsletter(); loadDetails() }
  // Arriving from a "leave a rating" link or notification
  // Arriving from the homepage's referral section
  if (location.hash === '#invite') setTimeout(() => document.getElementById('invite')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600)
  if (location.hash === '#review') setTimeout(() => document.getElementById('review')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600)
})
watch(() => auth.isLoggedIn, (v) => { if (v) { loadReferral(); loadAiQuota(); loadDetails() } })
</script>

<style scoped>
.st{max-width:760px;display:flex;flex-direction:column;gap:20px}
.st-h1{font-size:clamp(32px,4vw,44px);font-weight:800;letter-spacing:-.04em;line-height:1.05;color:var(--c-text);margin:4px 0 10px}
.st-card{background:var(--c-surface);border:none;border-radius:26px;padding:28px 30px;box-shadow:var(--shadow-sm);animation:stIn .7s var(--ease) backwards}
.st > :nth-child(3){animation-delay:.07s}.st > :nth-child(4){animation-delay:.14s}.st > :nth-child(5){animation-delay:.21s}.st > :nth-child(n+6){animation-delay:.28s}
@keyframes stIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){ .st-card{animation:none} }
.st-card-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
/* Section shortcuts */
.st-jump{position:sticky;top:-36px;z-index:5;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:-2px -8px 2px;padding:10px 8px;background:color-mix(in srgb,var(--c-bg) 86%,transparent);backdrop-filter:saturate(1.8) blur(16px);-webkit-backdrop-filter:saturate(1.8) blur(16px)}
.st-jump::-webkit-scrollbar{display:none}
@media (max-width:768px){ .st-jump{top:-22px} }
.st-jump a{flex-shrink:0;height:36px;padding:0 15px;border-radius:99px;display:inline-flex;align-items:center;font-size:13.5px;font-weight:600;color:var(--c-text2);text-decoration:none;background:var(--fill);transition:background .2s var(--ease),color .2s var(--ease)}
.st-jump a:hover{color:var(--c-text)}
.st-jump a.on{background:var(--c-text);color:var(--c-bg)}
.st-card{scroll-margin-top:64px}
/* Account header */
.st-hero{position:relative;overflow:hidden;padding-top:0}
.st-hero-bg{height:92px;margin:0 -30px 0;background:radial-gradient(120% 140% at 100% 0%,#DB2777 0%,transparent 45%),radial-gradient(90% 160% at 0% 0%,#7C3AED 0%,transparent 55%),linear-gradient(120deg,#312E81,#4338CA)}
.st-hero .st-acct{margin-top:-38px;position:relative;align-items:flex-start}
.st-hero .st-acct-txt{padding-top:46px}
.st-hero .st-acct > .btn-secondary{margin-top:48px}
.st-hero .st-ava{box-shadow:0 0 0 5px var(--c-surface),0 10px 24px rgba(67,56,202,.3)}
.st-glance{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0 20px}
.st-gl{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:16px 18px;border-radius:20px;background:var(--fill);border:none;font:inherit;color:inherit;text-align:left}
button.st-gl{cursor:pointer;transition:transform .25s var(--ease),background .25s var(--ease)}
button.st-gl:hover{transform:translateY(-2px);background:color-mix(in srgb,var(--c-accent) 9%,transparent)}
.st-gl-k{font-size:12.5px;font-weight:650;color:var(--c-text3);text-transform:uppercase;letter-spacing:.05em}
.st-gl b{font-size:26px;font-weight:820;letter-spacing:-.035em;color:var(--c-text);line-height:1.15}
.st-gl b small{font-size:15px;font-weight:600;color:var(--c-text3);margin-left:2px}
.st-gl-s{font-size:13px;color:var(--c-text2)}
.st-gl-plan.pass{background:linear-gradient(135deg,#312E81,#4338CA);color:#fff}
.st-gl-plan.pass b,.st-gl-plan.pass .st-gl-s{color:#fff}.st-gl-plan.pass .st-gl-k{color:rgba(255,255,255,.7)}
/* The Job Hunt Pass */
.st-pass{position:relative;overflow:hidden;color:#fff;background:radial-gradient(110% 90% at 100% 0%,#7C3AED 0%,transparent 55%),linear-gradient(160deg,#312E81,#4338CA 55%,#5B21B6);box-shadow:0 30px 70px -24px rgba(67,56,202,.6)}
.st-pass-glow{position:absolute;width:320px;height:320px;right:-120px;bottom:-160px;border-radius:50%;background:radial-gradient(circle,rgba(219,39,119,.45),transparent 70%);pointer-events:none}
.st-pass-kick{display:inline-block;font-size:12.5px;font-weight:750;letter-spacing:.07em;text-transform:uppercase;color:#312E81;background:linear-gradient(135deg,#FDE68A,#FBBF24);padding:5px 12px;border-radius:99px}
.st-pass-title{font-size:clamp(24px,3vw,32px);font-weight:820;letter-spacing:-.035em;line-height:1.1;margin:14px 0 8px}
.st-pass-p{font-size:15px;line-height:1.6;color:rgba(255,255,255,.82);margin:0 0 20px;max-width:560px}
.st-plans{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.st-po{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:18px;border-radius:20px;border:none;font:inherit;color:#fff;text-align:left;cursor:pointer;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18);transition:background .25s var(--ease),box-shadow .25s var(--ease),transform .25s var(--ease)}
.st-po:hover{background:rgba(255,255,255,.16)}
.st-po.on{background:#fff;color:#312E81;box-shadow:0 12px 28px rgba(0,0,0,.2);transform:translateY(-2px)}
.st-po-t{font-size:13.5px;font-weight:650;opacity:.85}
.st-po-p{font-size:30px;font-weight:820;letter-spacing:-.04em;line-height:1.1}
.st-po-s{font-size:12.5px;opacity:.75}
.st-po-badge{position:absolute;top:12px;right:12px;font-size:12px;font-weight:750;color:#fff;background:linear-gradient(135deg,#16A34A,#059669);padding:3px 8px;border-radius:99px}
.st-pass-list{list-style:none;margin:0 0 20px;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:10px 18px}
.st-pass-list li{display:flex;gap:9px;font-size:14px;color:rgba(255,255,255,.92);line-height:1.45}
.st-pass-list svg{width:17px;height:17px;flex-shrink:0;fill:none;stroke:#86EFAC;stroke-width:2.6;margin-top:2px}
.st-pass .st-consent{color:rgba(255,255,255,.82)}
.st-pass-row{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.st-pass-cta{height:50px;padding:0 26px;border:none;border-radius:99px;background:#fff;color:#312E81;font:inherit;font-size:15.5px;font-weight:750;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.2);transition:transform .25s var(--ease),opacity .2s}
.st-pass-cta:hover:not(:disabled){transform:translateY(-2px)}
.st-pass-cta:disabled{opacity:.55;cursor:not-allowed}
.st-pass-ghost{height:40px;padding:0 18px;border:none;border-radius:99px;background:rgba(255,255,255,.14);color:#fff;font:inherit;font-size:14px;font-weight:650;cursor:pointer}
.st-pass-ghost:hover{background:rgba(255,255,255,.22)}
.st-pass-link{color:#fff;font-size:14px;font-weight:650;text-decoration:underline;text-underline-offset:3px;opacity:.9}
.st-pass-note{font-size:12.5px;color:rgba(255,255,255,.65);margin:14px 0 0}
@media (max-width:600px){
  .st-hero.st-card{padding-top:0}
  .st-hero-bg{margin:0 -20px}
  .st-glance{grid-template-columns:1fr 1fr}.st-gl-plan{grid-column:1/-1}
  .st-plans{grid-template-columns:1fr}.st-pass-list{grid-template-columns:1fr}
}
.st-consent{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--c-text2);line-height:1.5;margin-bottom:14px;cursor:pointer}
.st-consent input{margin-top:3px;flex-shrink:0}
.st-pass-note{margin-top:10px}
.st-card-t{font-size:19px;font-weight:750;letter-spacing:-.025em;color:var(--c-text);margin-bottom:6px}
.st-p{font-size:14.5px;color:var(--c-text2);line-height:1.6}
.st-dgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}
.st-dfield{display:flex;flex-direction:column;gap:6px;min-width:0}
.st-dfield .f-lbl{margin:0}
.st-dlangs{font-size:13px;margin-top:12px}
.st-dacts{display:flex;align-items:center;gap:10px;margin-top:16px;flex-wrap:wrap}
@media (max-width:560px){.st-dgrid{grid-template-columns:1fr}}
.st-details{display:grid;grid-template-columns:minmax(110px,max-content) 1fr;gap:8px 16px;margin:0 0 16px;font-size:14px}
.st-details dt{color:var(--c-text3)}
.st-details dd{margin:0;color:var(--c-text);min-width:0;overflow-wrap:anywhere}
.st-p strong{color:var(--c-text)}
.st-muted{font-size:13px;color:var(--c-text3)}
.st-err{font-size:12.5px;color:var(--c-rose);margin-top:8px}
.st-btns{display:flex;gap:8px;flex-wrap:wrap}

/* Account */
.st-acct{display:flex;align-items:center;gap:18px;padding-bottom:24px;margin-bottom:20px;border-bottom:1px solid var(--hair)}
.st-ava{position:relative;border:none;padding:0;cursor:pointer;overflow:visible;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#8B85FF,#4338CA 55%,#2A2390);color:#fff;font-size:26px;font-weight:750;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 10px 24px rgba(67,56,202,.28),inset 0 1px 0 rgba(255,255,255,.25)}
.st-ava img{width:100%;height:100%;border-radius:50%;object-fit:cover}
.st-ava.busy{opacity:.6}
.st-ava:focus-visible{outline:2px solid var(--c-accent);outline-offset:3px}
.st-ava-cam{position:absolute;right:-2px;bottom:-2px;width:24px;height:24px;border-radius:50%;background:var(--c-surface);box-shadow:0 2px 8px rgba(20,20,43,.18);display:flex;align-items:center;justify-content:center}
.st-ava-cam svg{width:13px;height:13px;fill:none;stroke:var(--c-accent);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.st-ava-acts{font-size:13px;color:var(--c-text3);margin-top:4px}
.st-acct-txt{flex:1;min-width:0}
.st-acct-name{font-size:22px;font-weight:750;letter-spacing:-.03em;color:var(--c-text);line-height:1.2}
.st-acct-mail{font-size:14px;color:var(--c-text3);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-unv{color:var(--c-amber)}
.st-ver{color:var(--c-green)}
.st-link-btn{background:none;border:none;padding:0;font:inherit;color:var(--c-accent);font-weight:600;text-decoration:underline}
.st-review{border-radius:26px;padding:26px 30px;box-shadow:var(--shadow-sm);border:none}
.st-rows{display:flex;flex-direction:column;gap:14px}
.st-row{display:grid;grid-template-columns:140px 1fr;align-items:center;gap:14px}
.st-lbl{font-size:14px;font-weight:600;color:var(--c-text)}
.st-ai{display:flex;flex-direction:column;gap:20px}
.st-ai-g{display:flex;flex-direction:column;gap:10px}
.st-chips{display:flex;flex-wrap:wrap;gap:8px}
.st-chip{height:38px;padding:0 16px;border-radius:999px;border:none;background:var(--fill);color:var(--c-text);
  font:inherit;font-size:14px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:6px;
  transition:background .18s ease,color .18s ease,box-shadow .18s ease,transform .12s ease}
.st-chip:hover{background:var(--fill-hover)}
.st-chip:active{transform:scale(.97)}
.st-chip:focus-visible{outline:none;box-shadow:0 0 0 4px var(--c-accent-ring)}
.st-chip.on{background:var(--c-accent);color:#fff;font-weight:600;box-shadow:0 6px 16px rgba(67,56,202,.28)}
.st-chip:disabled{cursor:default}
.st-chip-sub{font-size:12px;color:var(--c-text3);font-weight:500}
.st-chip.on .st-chip-sub{color:rgba(255,255,255,.8)}
.st-name{display:flex;gap:8px;align-items:center}
.st-name .f-inp{flex:1;min-width:0}
.st-pop-enter-active,.st-pop-leave-active{transition:opacity .2s var(--ease),transform .2s var(--ease)}
.st-pop-enter-from,.st-pop-leave-to{opacity:0;transform:scale(.92)}
.st-pw-line{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px}
.st-dots{font-size:18px;letter-spacing:.12em;color:var(--c-text2);line-height:1}

/* The password form */
.st-pwbox{margin-top:20px;padding:24px;border-radius:22px;background:color-mix(in srgb,var(--c-text) 3.5%,var(--c-surface));display:flex;flex-direction:column;gap:14px;transform-origin:top center}
.st-pwbox .f-inp{background:var(--c-surface)}
.st-pwbox .f-inp:hover{background:var(--c-surface)}
.st-pwbox-hd{display:flex;gap:14px;align-items:flex-start;margin-bottom:4px}
.st-pwbox-ic{width:40px;height:40px;border-radius:13px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;background:radial-gradient(circle at 30% 25%,#8B85FF,#4338CA 60%,#2A2390);box-shadow:0 6px 16px rgba(67,56,202,.25)}
.st-pwbox-ic svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.st-pwbox-t{font-size:16.5px;font-weight:700;letter-spacing:-.02em;color:var(--c-text);margin-bottom:2px}
.st-fld{display:flex;flex-direction:column;gap:7px}
.st-fld > span:first-child{font-size:13px;font-weight:600;color:var(--c-text2)}
.st-fld .f-inp.bad{border-color:var(--c-rose)}
.st-pw{position:relative;display:block}
.st-pw .f-inp{padding-right:48px}
.st-eye{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:999px;background:none;border:none;color:var(--c-text3);display:flex;align-items:center;justify-content:center;transition:background .2s var(--ease),color .2s var(--ease)}
.st-eye:hover{background:color-mix(in srgb,var(--c-text) 6%,transparent);color:var(--c-text)}
.st-eye svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.st-strength{display:flex;align-items:center;gap:12px;margin-top:-4px;min-height:16px}
.st-bars{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
.st-bars i{height:5px;border-radius:99px;background:color-mix(in srgb,var(--c-text) 9%,transparent);transition:background .3s var(--ease)}
.st-strength-t{font-size:12.5px;font-weight:600;min-width:64px;text-align:right}
.st-strength.lv1 .st-bars i:nth-child(-n+1){background:var(--c-rose)}
.st-strength.lv2 .st-bars i:nth-child(-n+2){background:var(--c-amber)}
.st-strength.lv3 .st-bars i:nth-child(-n+3){background:#22a35a}
.st-strength.lv4 .st-bars i{background:var(--c-green)}
.st-strength.lv1 .st-strength-t{color:var(--c-rose)}.st-strength.lv2 .st-strength-t{color:var(--c-amber)}
.st-strength.lv3 .st-strength-t,.st-strength.lv4 .st-strength-t{color:var(--c-green)}
.st-pwbox .st-err{margin-top:-6px}
.st-pwbox-f{display:flex;justify-content:flex-end;gap:8px;margin-top:6px}
.st-sr{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.st-pwt-enter-active,.st-pwt-leave-active{transition:opacity .3s var(--ease),transform .3s var(--ease)}
.st-pwt-enter-from,.st-pwt-leave-to{opacity:0;transform:translateY(-6px) scale(.985)}
.st-guest{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}

/* Invite */
.st-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
.st-stats > div{background:color-mix(in srgb,var(--c-text) 4%,var(--c-surface));border-radius:20px;padding:18px 18px 16px;font-size:13px;color:var(--c-text3)}
.st-stats span{display:block;font-size:34px;font-weight:800;color:var(--c-text);letter-spacing:-.04em;line-height:1.05;margin-bottom:4px}
.st-stats .hl{background:linear-gradient(140deg,var(--c-accent-lt),color-mix(in srgb,var(--c-accent-lt) 40%,var(--c-surface)))}
.st-stats .hl span{color:var(--c-accent)}
.st-note{font-size:12.5px;color:var(--c-green);margin-bottom:12px}
.st-link{display:flex;gap:8px}
.st-link .f-inp{flex:1;min-width:0;font-size:13.5px;color:var(--c-text2);border-radius:999px;padding:0 18px}
.st-share{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px;font-size:13px;color:var(--c-text3)}
.st-share span{margin-right:4px}
.st-share-btn{height:32px;padding:0 14px;border-radius:999px;border:none;background:color-mix(in srgb,var(--c-text) 6%,var(--c-surface));font-size:12.5px;font-weight:600;color:var(--c-text);transition:background .2s var(--ease)}
.st-share-btn:hover{background:color-mix(in srgb,var(--c-text) 10%,var(--c-surface))}

/* AI */
.st-meter{height:10px;border-radius:99px;background:color-mix(in srgb,var(--c-text) 7%,transparent);overflow:hidden;margin-top:6px}
.st-meter div{height:100%;border-radius:99px;background:linear-gradient(90deg,#4338CA,#8B85FF);transition:width .6s var(--ease)}
.st-meter-txt{font-size:13.5px;color:var(--c-text2);margin-top:10px}
.st-meter-txt strong{color:var(--c-text)}

/* Preferences */
.st-pref{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 0;border-top:1px solid var(--hair)}
.st-card-t + .st-pref{border-top:none;padding-top:6px}
.st-pref-t{font-size:15px;font-weight:600;letter-spacing:-.01em;color:var(--c-text)}
.st-pref-s{font-size:13px;color:var(--c-text3);margin-top:3px;line-height:1.5}

/* Help */
.st-help{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.st-help > *{display:flex;flex-direction:column;gap:3px;text-align:left;padding:16px 18px;border-radius:20px;border:none;background:color-mix(in srgb,var(--c-text) 4%,var(--c-surface));text-decoration:none;font:inherit;cursor:pointer;transition:background .2s var(--ease),transform .2s var(--ease)}
.st-help > *:hover{background:color-mix(in srgb,var(--c-text) 7%,var(--c-surface));transform:translateY(-1px)}
.st-help strong{font-size:14.5px;color:var(--c-text);letter-spacing:-.01em}
.st-help span{font-size:13px;color:var(--c-text3)}

/* Delete account */
.st-del-hd{margin-bottom:0}
.st-del{display:flex;flex-direction:column;gap:10px;margin-top:14px;max-width:380px}
.st-danger-ghost{color:var(--c-rose)}
.st-danger{background:var(--c-rose);color:#fff}

@media (max-width:600px){
  .st-card{padding:22px 20px;border-radius:24px}
  .st-ava{width:54px;height:54px;font-size:22px}
  .st-acct-name{font-size:19px}
  .st-card-hd{flex-direction:column}
  .st-row{grid-template-columns:1fr;gap:6px}
  .st-row.st-row-pw{grid-template-columns:auto 1fr;gap:16px}
  .st-pwbox{padding:20px 18px;border-radius:20px}
  .st-pwbox-f .btn-primary{flex:1}
  .st-stats{grid-template-columns:1fr 1fr 1fr}
  .st-stats span{font-size:20px}
  .st-link{flex-direction:column}
  .st-help{grid-template-columns:1fr}
}
</style>
