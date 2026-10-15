<template>
  <div class="lp" ref="rootEl">
    <!-- Nav: slim, frosted -->
    <header class="lp-nav" :class="{ scrolled }">
      <div class="lp-wrap lp-nav-in">
        <a href="/" class="lp-logo" @click.prevent="rootEl?.scrollTo({ top: 0, behavior: 'smooth' })"><BrandLogo small /></a>
        <nav class="lp-links">
          <a href="#how" @click.prevent="go('#how')">{{ $t('How it works') }}</a>
          <a href="#templates" @click.prevent="go('#templates')">{{ $t('Templates') }}</a>
          <a href="#pricing" @click.prevent="go('#pricing')">{{ $t('Pricing') }}</a>
          <a href="#invite" @click.prevent="go('#invite')">{{ $t('Invite friends') }}</a>
          <a :href="`/blog?lang=${lang}`">{{ $t('Blog') }}</a>
        </nav>
        <div class="lp-nav-cta">
          <LangSwitch />
          <button v-if="!signedIn" class="lp-signin" @click="$emit('sign-in')">{{ $t('Sign in') }}</button>
          <button class="btn-primary accent btn-sm" @click="$emit('start')">{{ $t(signedIn ? 'Open my CVs' : 'Build my CV') }}</button>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="lp-hero">
      <div class="lp-wrap lp-hero-copy">
        <h1>{{ $t('A CV that gets you') }}<br><span>{{ $t('the interview.') }}</span></h1>
        <p class="lp-lead">{{ $t('Build it in minutes, tailor it to the job, and see how well it matches, before you apply.') }}</p>
        <div class="lp-cta">
          <button class="btn-primary accent btn-lg" @click="$emit('start')">{{ $t('Build my CV for free') }}</button>
          <a href="#how" class="lp-more" @click.prevent="go('#how')">{{ $t('See how it works') }} <span aria-hidden="true">›</span></a>
        </div>
        <!-- The two things people should not miss -->
        <div class="lp-quick">
          <span class="lp-quick-lbl">{{ $t('Or start with:') }}</span>
          <button class="lp-q" @click="$emit('start', 'narrate')">
            <svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>{{ $t('Tell your story') }}
          </button>
          <button class="lp-q" @click="$emit('start', 'ats')">
            <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>{{ $t('Check your ATS score') }}
          </button>
        </div>
      </div>
      <div class="lp-stage" aria-hidden="true" inert :style="{ '--drift': drift }">
        <div class="lp-sheet s-l"><CvThumb template="harvard:charcoal" :data="sampleCv()" /></div>
        <div class="lp-sheet s-r"><CvThumb template="sidebar:teal" :data="sampleCv()" /></div>
        <div class="lp-sheet s-c"><CvThumb template="modern:indigo" :data="sampleCv()" /></div>
        <div class="lp-chip c-score"><b>86%</b><span>{{ $t('job match') }}</span></div>
        <div class="lp-chip c-ats"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>{{ $t('Readable by ATS') }}</div>
      </div>
    </section>

    <!-- The story: from blank page to interview, one chapter per feature (each one sells) -->
    <section class="lp-sec lp-story" id="how">
      <div class="lp-wrap">
        <h2 class="lp-h2" v-reveal>{{ $t('From blank page to interview.') }}</h2>
        <p class="lp-sub" v-reveal>{{ $t('Five steps, each one built to get you closer to the job.') }}</p>
        <nav class="lp-rail" :aria-label="$t('How it works')" v-reveal>
          <a v-for="(c, i) in CHAPTERS" :key="c.k" :href="'#ch-' + c.k" @click.prevent="go('#ch-' + c.k)"><span>{{ i + 1 }}</span>{{ $t(c.short) }}</a>
        </nav>
      </div>
    </section>

    <section v-for="(c, i) in CHAPTERS" :key="c.k" :id="'ch-' + c.k" class="lp-ch" :class="[i === CHAPTERS.length - 1 ? 'dark' : i % 2 === 0 ? 'lp-alt' : '', { rev: i % 2 === 1 }]">
      <div class="lp-wrap lp-ch-in">
        <div class="lp-ch-copy" v-reveal>
          <span class="lp-ch-step">{{ $t('Step {n} of {total}', { n: i + 1, total: CHAPTERS.length }) }} · {{ $t(c.short) }}</span>
          <h2>{{ $t(c.t) }}</h2>
          <p>{{ $t(c.lead) }}</p>
          <ul><li v-for="p in c.pts" :key="p"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>{{ $t(p) }}</li></ul>
          <button class="btn-primary accent btn-lg" @click="$emit('start', c.mode)">{{ $t(c.cta) }}</button>
        </div>
        <div class="lp-media lp-ch-media" :class="'m-' + c.k" aria-hidden="true" inert v-reveal="120">
          <!-- Story -->
          <template v-if="c.k === 'story'">
            <div class="m-mic"><span class="m-mic-btn"><svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg></span>
              <span class="m-wave"><i v-for="n in 14" :key="n" :style="{ animationDelay: (n * 0.07) + 's' }"></i></span>
              <span class="m-mic-txt">{{ $t('Recording… tap to stop') }}</span></div>
            <div class="m-page"><CvThumb template="modern:indigo" :data="sampleCv()" /></div>
          </template>
          <!-- Tailor -->
          <template v-else-if="c.k === 'tailor'">
            <div class="m-panel">
              <div class="m-tick"><span class="m-box"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></span>{{ $t('Summary') }}
                <span class="m-ba"><em>{{ $t('Before') }}</em><i class="old"></i><em>{{ $t('After') }}</em><i class="new"></i></span></div>
              <div v-for="sct in ['Experience', 'Skills']" :key="sct" class="m-tick"><span class="m-box"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></span>{{ $t(sct) }}<i class="m-line"></i></div>
              <span class="m-apply">{{ $t('Apply {n} changes', { n: 3 }) }}</span>
            </div>
          </template>
          <!-- How you match -->
          <template v-else-if="c.k === 'fit'">
            <div class="m-panel m-fit">
              <span class="m-good">{{ $t('Worth a go') }}</span>
              <div class="m-fit-sub">{{ $t('What already matches') }}</div>
              <div class="m-reason ok"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg><i style="width:82%"></i></div>
              <div class="m-reason ok"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg><i style="width:64%"></i></div>
              <div class="m-fit-sub">{{ $t('To strengthen your application') }}</div>
              <div class="m-reason gap"><svg viewBox="0 0 24 24"><line x1="12" y1="6" x2="12" y2="18" /><line x1="6" y1="12" x2="18" y2="12" /></svg><i style="width:74%"></i></div>
            </div>
          </template>
          <!-- ATS score -->
          <template v-else-if="c.k === 'ats'">
            <div class="m-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="track" /><circle cx="60" cy="60" r="50" class="bar" pathLength="100" /></svg><b>86</b></div>
            <div class="m-checks"><div class="m-ats-ttl">{{ $t('Your ATS score') }}</div>
              <div v-for="k in CHECKS" :key="k" class="m-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>{{ $t(k) }}</div></div>
          </template>
          <!-- PDF -->
          <template v-else>
            <div class="m-sheet"><CvThumb template="harvard:indigo" :data="sampleCv()" /><span class="m-pdf-tag">PDF</span></div>
          </template>
        </div>
      </div>
    </section>

    <!-- Get to know CVMaster: capsules on the left, the picture on the right -->
    <section class="lp-sec lp-alt" id="features">
      <div class="lp-wrap">
        <h2 class="lp-h2 left" v-reveal>{{ $t('Get to know CVMaster.') }}</h2>
        <div class="lp-explore" v-reveal>
          <div class="lp-pills">
            <button v-for="(f, i) in FEATURES" :key="f.k" class="lp-pill" :class="{ open: feat === i }" :aria-expanded="feat === i" @click="feat = i">
              <span class="lp-pill-hd"><span class="lp-plus" aria-hidden="true"><svg viewBox="0 0 24 24"><line x1="12" y1="6" x2="12" y2="18" /><line x1="6" y1="12" x2="18" y2="12" /></svg></span>{{ $t(f.t) }}</span>
              <span class="lp-pill-bd"><span>{{ $t(f.d) }}</span></span>
            </button>
          </div>
          <div class="lp-show" aria-hidden="true" inert>
            <Transition name="xfade" mode="out-in">
              <div :key="feat" class="lp-show-in" :class="'v-' + FEATURES[feat].k">
                <template v-if="FEATURES[feat].k === 'layouts'">
                  <div class="v-fan"><div class="lp-sheet f1"><CvThumb template="harvard:charcoal" :data="sampleCv()" /></div><div class="lp-sheet f2"><CvThumb template="magazine:crimson" :data="sampleCv()" /></div><div class="lp-sheet f3"><CvThumb template="sidebar:teal" :data="sampleCv()" /></div></div>
                </template>
                <template v-else-if="FEATURES[feat].k === 'import'">
                  <div class="v-file"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg><span>CV.pdf</span></div>
                  <svg class="v-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  <div class="lp-sheet v-one"><CvThumb template="modern:indigo" :data="sampleCv()" /></div>
                </template>
                <template v-else-if="FEATURES[feat].k === 'lang'">
                  <div class="v-langs"><span v-for="l in LANGS" :key="l">{{ l }}</span></div>
                  <div class="lp-sheet v-one"><CvThumb template="classic:indigo" :data="SAMPLE_CV_FR" /></div>
                </template>
                <template v-else-if="FEATURES[feat].k === 'honest'">
                  <div class="m-panel v-honest">
                    <div class="m-tick"><span class="m-box"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></span>{{ $t('Experience') }}<span class="m-ba"><em>{{ $t('Before') }}</em><i class="old"></i><em>{{ $t('After') }}</em><i class="new"></i></span></div>
                    <div class="m-tick off"><span class="m-box"></span>{{ $t('Skills') }}<span class="m-ba"><em>{{ $t('After') }}</em><i class="new"></i></span></div>
                  </div>
                </template>
                <template v-else-if="FEATURES[feat].k === 'private'">
                  <div class="v-lock"><svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V7.5a4 4 0 018 0V11" /></svg></div>
                </template>
                <template v-else>
                  <div class="v-devices">
                    <div class="v-browser"><div class="v-bar"><i></i><i></i><i></i><span>cvmaster.live</span></div>
                      <div class="v-browser-in"><div class="v-browser-page"><CvThumb template="modern:indigo" :data="sampleCv()" /></div></div></div>
                    <div class="v-handset"><span class="v-island"></span><div class="v-screen">
                      <div class="v-app-hd">{{ $t('My CVs') }}</div>
                      <div class="v-app-card"><div class="v-app-thumb"><CvThumb template="sidebar:indigo" :data="sampleCv()" /></div>
                        <div class="v-app-t">{{ sampleCv().fn }} {{ sampleCv().ln }}</div><div class="v-app-s">Sidebar · {{ $t('Indigo') }}</div>
                        <div class="v-app-btns"><span>{{ $t('Open') }}</span><span class="pri">{{ $t('Download') }}</span></div></div>
                      <div class="v-app-card v-app-peek"><div class="v-app-thumb"><CvThumb template="harvard:charcoal" :data="sampleCv()" /></div></div>
                    </div></div>
                  </div>
                </template>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- Templates: pick a colour, every layout follows -->
    <section class="lp-sec" id="templates">
      <div class="lp-wrap">
        <h2 class="lp-h2" v-reveal>{{ $t('50 layouts. 12 colours.') }}</h2>
        <p class="lp-sub" v-reveal>{{ $t('Plain ATS-friendly ones for online applications, standard ones for print and in person.') }}</p>
        <div class="lp-dots" role="radiogroup" :aria-label="$t('Colour')" v-reveal>
          <button v-for="c in THEMES" :key="c.id" class="lp-dot" :class="{ on: color === c.id }" :style="{ '--dot': c.accent }" role="radio" :aria-checked="color === c.id" :title="$t(c.name)" :aria-label="$t(c.name)" @click="color = c.id"></button>
        </div>
        <div class="lp-tpls">
          <figure v-for="(t, i) in SHOWCASE" :key="t.id" class="lp-tpl" v-reveal="i * 80">
            <div class="lp-tpl-img"><CvThumb :template="`${t.id}:${color}`" :data="sampleCv()" /></div>
            <figcaption>{{ t.name }}<span>{{ $t(t.kind === 'ats' ? 'ATS-friendly' : 'Standard') }}</span></figcaption>
          </figure>
        </div>
        <div class="lp-center"><button class="btn-secondary btn-lg" @click="$emit('start')">{{ $t('Browse all templates') }}</button></div>
      </div>
    </section>

    <!-- Reviews. Real ones only, shown once there are enough -->
    <section v-if="rv.average" class="lp-sec lp-alt" id="reviews">
      <div class="lp-wrap">
        <h2 class="lp-h2" v-reveal>{{ $t('Rated {n} out of 5', { n: rv.average.toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }) }}</h2>
        <p class="lp-sub" v-reveal><span class="lp-stars" role="img" :aria-label="$t('{n} out of 5 stars', { n: rv.average })">{{ '★'.repeat(Math.round(rv.average)) }}<span>{{ '★'.repeat(5 - Math.round(rv.average)) }}</span></span> {{ $t('from {n} reviews by people who built their CV here', { n: rv.count }) }}</p>
        <div v-if="rv.reviews.length" class="lp-reviews">
          <figure v-for="(r, i) in rv.reviews.slice(0, 3)" :key="i" class="lp-review" v-reveal="i * 80">
            <div class="lp-stars">{{ '★'.repeat(r.rating) }}<span>{{ '★'.repeat(5 - r.rating) }}</span></div>
            <blockquote>“{{ r.comment }}”</blockquote>
            <figcaption>{{ r.name }}<span v-if="r.role"> · {{ r.role }}</span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="lp-sec" :class="{ 'lp-alt': !rv.average }" id="pricing">
      <div class="lp-wrap">
        <h2 class="lp-h2" v-reveal>{{ $t('Free to build. €0.99 when you’re ready.') }}</h2>
        <p class="lp-sub" v-reveal>{{ $t('No subscription, no trial that renews.') }}</p>
        <div class="lp-prices">
          <div v-for="(p, i) in PLANS" :key="p.name" class="lp-price" :class="{ featured: p.featured }" v-reveal="i * 80">
            <h3>{{ $t(p.name) }}</h3>
            <div class="lp-amt">{{ $t(p.price) }}<span>{{ p.per && $t(p.per) }}</span></div>
            <ul>
              <li v-for="it in p.items" :key="it"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>{{ $t(it) }}</li>
            </ul>
            <button class="btn-block btn-lg" :class="p.featured ? 'btn-primary accent' : 'btn-secondary'" @click="$emit('start')">{{ $t(p.cta) }}</button>
          </div>
        </div>
        <p class="lp-small">{{ $t('Need more AI? 100 extra requests cost €0.50 and never expire.') }}</p>
      </div>
    </section>

    <!-- Referral: invite friends, get free CVs -->
    <section class="lp-ref" id="invite">
      <div class="lp-wrap lp-ref-in">
        <div class="lp-ref-copy" v-reveal>
          <span class="lp-ref-kick">{{ $t('Invite friends') }}</span>
          <h2>{{ $t('Help a friend.') }}<br><span>{{ $t('Get your CV free.') }}</span></h2>
          <p>{{ $t('Share your invite link with classmates and friends. They get 25 extra AI requests to build their CV, and every friend who gets their first clean CV earns you a free one.') }}</p>
          <ol class="lp-ref-steps">
            <li><b>1</b><div><strong>{{ $t('Share your link') }}</strong><span>{{ $t('By WhatsApp, email or anywhere you like.') }}</span></div></li>
            <li><b>2</b><div><strong>{{ $t('They build their CV') }}</strong><span>{{ $t('With 25 extra AI requests, on you.') }}</span></div></li>
            <li><b>3</b><div><strong>{{ $t('You get a free CV') }}</strong><span>{{ $t('For every friend who gets their first clean CV. No limit.') }}</span></div></li>
          </ol>
          <button class="btn-lg lp-ref-btn" @click="$emit('start', 'invite')">{{ $t('Get my invite link') }}</button>
        </div>
        <div class="lp-ref-art" aria-hidden="true" inert v-reveal="120">
          <div class="lp-ref-card">
            <div class="lp-ref-card-hd"><span class="lp-ref-gift"><svg viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" rx="1" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></svg></span>{{ $t('Your invite link') }}</div>
            <div class="lp-ref-link">cvmaster.live/invite/CHRISTABEL</div>
            <div class="lp-ref-share"><span>WhatsApp</span><span>{{ $t('Email') }}</span><span class="pri">{{ $t('Copy') }}</span></div>
            <div class="lp-ref-stats"><div><b>3</b><span>{{ $t('friends joined') }}</span></div><div><b>2</b><span>{{ $t('free CVs earned') }}</span></div></div>
          </div>
          <span class="lp-ref-chip c1">+1 {{ $t('free CV') }}</span>
          <span class="lp-ref-chip c2">+25 {{ $t('AI requests') }}</span>
          <div class="lp-ref-faces"><i>K</i><i>Y</i><i>S</i></div>
        </div>
      </div>
    </section>

    <!-- Latest from the blog -->
    <section v-if="posts.length" class="lp-sec" :class="{ 'lp-alt': rv.average }" id="blog">
      <div class="lp-wrap">
        <div class="lp-row-hd" v-reveal><h2 class="lp-h2 left">{{ $t('From the blog') }}</h2><a class="lp-more" :href="`/blog?lang=${lang}`">{{ $t('Read the blog') }} <span aria-hidden="true">›</span></a></div>
        <div class="lp-posts">
          <a v-for="(p, i) in posts" :key="p.slug" class="lp-post" :href="`/blog/${p.slug}`" v-reveal="i * 80">
            <span class="lp-post-img"><img v-if="p.cover" :src="p.cover" alt="" loading="lazy" /></span>
            <span class="lp-post-b"><strong>{{ p.title }}</strong><span>{{ p.excerpt }}</span></span>
          </a>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="lp-sec" :class="{ 'lp-alt': !rv.average }" id="faq">
      <div class="lp-wrap lp-faq-wrap">
        <h2 class="lp-h2" v-reveal>{{ $t('Questions') }}</h2>
        <details v-for="q in FAQ" :key="q.q" class="lp-faq">
          <summary>{{ $t(q.q) }}<span class="lp-plus" aria-hidden="true"><svg viewBox="0 0 24 24"><line x1="12" y1="6" x2="12" y2="18" /><line x1="6" y1="12" x2="18" y2="12" /></svg></span></summary>
          <p>{{ $t(q.a) }}</p>
        </details>
      </div>
    </section>

    <!-- Newsletter (double opt-in: we email a confirmation link) -->
    <section class="lp-sec lp-news-sec" :class="{ 'lp-alt': rv.average }" id="newsletter">
      <div class="lp-wrap">
        <div class="lp-news" v-reveal>
          <div class="lp-news-txt">
            <h2>{{ $t('CV tips in your inbox') }}</h2>
            <p>{{ $t('Short, practical advice on CVs, ATS and applications, plus new templates when they land. A couple of emails a month at most.') }}</p>
          </div>
          <div v-if="nl.state === 'done'" class="lp-news-done" role="status">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            <span>{{ $t(nl.already ? 'You’re already subscribed, thanks!' : 'Almost done. Click the link we just emailed you to confirm.') }}</span>
          </div>
          <form v-else class="lp-news-form" novalidate @submit.prevent="subscribe">
            <div class="lp-news-row">
              <input v-model="nl.email" class="f-inp" type="email" autocomplete="email" :placeholder="$t('you@example.com')" :aria-label="$t('Email address')" @input="nl.error = ''" />
              <button class="btn-primary accent" :disabled="nl.state === 'sending'">{{ $t(nl.state === 'sending' ? 'Subscribing…' : 'Subscribe') }}</button>
            </div>
            <p v-if="nl.error" class="lp-news-err" role="alert">{{ $t(nl.error) }}</p>
            <p v-else-if="nlSuggest" class="lp-news-fine">{{ $t('Did you mean') }} <button type="button" class="lp-news-fix" @click="nl.email = nlSuggest">{{ nlSuggest }}</button>?</p>
            <p class="lp-news-fine">{{ $t('No spam, and you can unsubscribe in one click.') }} <a href="/privacy">{{ $t('Privacy Policy') }}</a></p>
          </form>
        </div>
      </div>
    </section>

    <!-- Final: the mark draws itself as it comes into view -->
    <section class="lp-final" ref="finalEl">
      <div class="lp-wrap lp-final-in">
        <BrandLogo v-if="finalSeen" mark-only large animate dark class="lp-final-mark" />
        <div v-else class="lp-final-mark lp-final-ph"></div>
        <h2>{{ $t('Your next job starts with one page.') }}</h2>
        <button class="btn-primary accent btn-lg lp-final-btn" @click="$emit('start')">{{ $t('Build my CV for free') }}</button>
      </div>
    </section>

    <footer class="lp-foot">
      <div class="lp-wrap">
        <div class="lp-foot-cols">
          <div class="lp-foot-brand"><BrandLogo small /><p>{{ $t('Free AI CV builder. Write, tailor and download a CV that gets you the interview.') }}</p></div>
          <div><h4>{{ $t('Product') }}</h4><a href="/templates">{{ $t('CV templates') }}</a><a href="#pricing" @click.prevent="go('#pricing')">{{ $t('Pricing') }}</a><a :href="`/blog?lang=${lang}`">{{ $t('Blog') }}</a></div>
          <div><h4>{{ $t('Help') }}</h4><a href="#faq" @click.prevent="go('#faq')">{{ $t('Questions') }}</a><a href="#" @click.prevent="openFeedback?.()">{{ $t('Feedback') }}</a><a href="mailto:support@cvmaster.live">{{ $t('Contact') }}</a></div>
          <div><h4>{{ $t('Legal') }}</h4><a href="/privacy">{{ $t('Privacy') }}</a><a href="/terms">{{ $t('Terms') }}</a></div>
        </div>
        <div class="lp-foot-copy">© {{ new Date().getFullYear() }} CVMaster</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, onUnmounted, watch } from 'vue'
import BrandLogo from '../components/BrandLogo.vue'
import CvThumb from '../components/CvThumb.vue'
import { sampleCv, SAMPLE_CV_FR } from '../composables/sampleCv.js'
import { THEMES } from '../composables/cvRenderer.js'
import { suggestEmail } from '../composables/emailTypos.js'
import LangSwitch from '../components/LangSwitch.vue'
import { locale, lang } from '../i18n/index.js'

const openFeedback = inject('openFeedback', null)

// Newsletter
const nl = reactive({ email: '', state: 'idle', error: '', already: false })
const nlSuggest = computed(() => suggestEmail(nl.email))
async function subscribe() {
  const email = nl.email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { nl.error = 'Please enter a valid email address.'; return }
  nl.state = 'sending'; nl.error = ''
  try {
    const r = await fetch((import.meta.env.VITE_API_URL || '') + '/api/newsletter/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.error || 'Could not subscribe you, please try again.')
    nl.already = !!d.already; nl.state = 'done'
  } catch (e) { nl.error = e.message; nl.state = 'idle' }
}

// The latest blog posts, in the visitor's language (or English)
const posts = ref([])
async function loadPosts() {
  try { const r = await fetch((import.meta.env.VITE_API_URL || '') + `/api/posts?limit=3&lang=${lang.value}`); if (r.ok) posts.value = (await r.json()).items || [] } catch {}
}
onMounted(loadPosts)
watch(lang, loadPosts)

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
const drift = ref(0)
const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
function onScroll() {
  const y = rootEl.value?.scrollTop || 0
  scrolled.value = y > 8
  if (!still) drift.value = Math.min(1, y / 700).toFixed(3)
}
function go(sel) {
  const el = rootEl.value?.querySelector(sel)
  if (el) rootEl.value.scrollTo({ top: el.offsetTop - 52, behavior: 'smooth' })
}


// The final section's mark draws itself the first time it's on screen
const finalEl = ref(null)
const finalSeen = ref(false)
let io
onMounted(() => {
  rootEl.value?.addEventListener('scroll', onScroll, { passive: true })
  io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { finalSeen.value = true; io.disconnect() } }, { root: rootEl.value, threshold: 0.4 })
  if (finalEl.value) io.observe(finalEl.value)
})
onUnmounted(() => { rootEl.value?.removeEventListener('scroll', onScroll); io?.disconnect() })

const CHECKS = ['Keywords from the job', 'One A4 page', 'Readable by ATS']

// The story of an application, one chapter per feature. "mode" is what the button starts
const CHAPTERS = [
  { k: 'story', short: 'Tell your story', mode: 'narrate', cta: 'Tell your story',
    t: 'Just tell your story.', lead: 'No blank page. Type or speak about your studies, jobs and projects, the way you would to a friend. AI turns it into a complete CV, and asks a few short questions where a recruiter would want more.',
    pts: ['Speak or type, in your own words', 'A full CV in minutes, not hours', 'Already have a CV? Import your PDF or Word file instead'] },
  { k: 'tailor', short: 'Tailor it', mode: 'ats', cta: 'Tailor my CV to a job',
    t: 'Made for the job you want.', lead: 'Paste the job advert and AI rewords your CV in the employer’s own language, so it speaks to the people, and the software, reading it.',
    pts: ['Uses the job’s keywords, never invents experience', 'Every change shown before and after', 'Nothing changes without your OK'] },
  { k: 'fit', short: 'See how you match', mode: 'ats', cta: 'See how I match',
    t: 'Know where you stand.', lead: 'Before you apply, see how well you match the role: what already fits, and the few things that would make your application stronger.',
    pts: ['Your strengths for this job, named', 'Clear next steps, not a verdict', 'Apply with confidence, even for a reach'] },
  { k: 'ats', short: 'Check your ATS score', mode: 'ats', cta: 'Check my ATS score',
    t: 'Get past the robots.', lead: 'Most companies scan CVs with an applicant tracking system before anyone reads them. See your ATS score for the job and exactly which keywords are missing.',
    pts: ['A score out of 100 for each job', 'Missing keywords, ready to add', 'ATS-friendly layouts with plain, readable text'] },
  { k: 'pdf', short: 'Send it', mode: null, cta: 'Build my CV for free',
    t: 'One clean page, ready to send.', lead: 'Download a polished one-page PDF without a watermark, and get it by email. Edit it any time and download it again for free.',
    pts: ['One A4 page, checked for you', 'Emailed and downloadable', '€0.99 per CV, no subscription'] },
]

const feat = ref(0)
const FEATURES = [
  { k: 'layouts', t: '50 templates, 12 colours', d: 'Plain ATS-friendly ones for online applications, standard ones for print and in person.' },
  { k: 'import',  t: 'Import an existing CV',    d: 'Upload a PDF or Word file and everything is filled in for you, in your own words.' },
  { k: 'lang',    t: 'Your language',            d: 'Use CVMaster in seven languages, and switch your CV between English and French in one click.' },
  { k: 'honest',  t: 'AI that never invents',    d: 'It rewords what you wrote using the job’s language, and you approve every change. Skills you don’t show are only suggested.' },
  { k: 'private', t: 'Private by design',        d: 'We never sell your data or show you ads. Delete your account and everything in it whenever you like.' },
  { k: 'phone',   t: 'On any device',            d: 'Build, tailor and download from your phone or computer. Sign in and your CVs follow you.' },
]
const LANGS = ['English', 'Français', 'Español', 'Deutsch', 'Italiano', 'Português', '中文']

// Two ATS-friendly, two creative; the colour dots recolour all four
const color = ref('indigo')
const SHOWCASE = [
  { id: 'modern',   name: 'Modern',   kind: 'ats' },
  { id: 'harvard',  name: 'Harvard',  kind: 'ats' },
  { id: 'magazine', name: 'Magazine', kind: 'creative' },
  { id: 'bento',    name: 'Bento',    kind: 'creative' },
]

const PLANS = [
  { name: 'Free', price: '€0', per: '', cta: 'Start building',
    items: ['All 50 templates', 'AI help: 30 requests a day with a free account', 'ATS job-match check', 'Preview PDF with watermark'] },
  { name: 'Clean PDF', price: '€0.99', per: ' per CV', cta: 'Build my CV', featured: true,
    items: ['Watermark-free, one-page PDF', 'Emailed and downloadable', 'Free re-downloads after edits'] },
]

const FAQ = [
  { q: 'Is it really free to start?', a: 'Yes. Build, edit, tailor and preview your CV without paying or signing up. You only pay €0.99 if you want the clean PDF of a CV. And you can download it again for free after edits.' },
  { q: 'Will my CV pass applicant tracking systems (ATS)?', a: 'Nobody can honestly guarantee it. Every company sets up its ATS differently. Our ATS-friendly templates use plain, selectable text and standard headings, and the ATS check shows how well your CV matches the specific job so you can close the gaps.' },
  { q: 'Does the AI make things up?', a: 'No. It rewords what you wrote using the job’s language, and you approve every change. Skills you don’t show are only suggested, so you add just the ones that are true.' },
  { q: 'Can I write my CV in French?', a: 'Yes. Switch the CV to Français and your whole CV is translated for you to review.' },
]
</script>

<style scoped>
.lp{height:100vh;height:100dvh;overflow-y:auto;overflow-x:hidden;background:var(--c-surface);color:var(--c-text);scroll-behavior:smooth}
.lp-wrap{max-width:1080px;margin:0 auto;padding:0 24px}

/* Nav */
.lp-nav{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--c-surface) 78%,transparent);backdrop-filter:saturate(1.8) blur(20px);-webkit-backdrop-filter:saturate(1.8) blur(20px);border-bottom:1px solid transparent;transition:border-color .3s var(--ease)}
.lp-nav.scrolled{border-bottom-color:var(--hair)}
.lp-nav-in{height:56px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.lp-logo{display:flex;text-decoration:none}
.lp-links{display:flex;gap:30px}
.lp-links a{color:var(--c-text2);text-decoration:none;font-size:13.5px;font-weight:500;transition:color .2s}
.lp-links a:hover{color:var(--c-text)}
.lp-nav-cta{display:flex;gap:8px;align-items:center}
.lp-signin{background:none;border:none;font-size:13.5px;font-weight:500;color:var(--c-text2);padding:0 8px}
.lp-signin:hover{color:var(--c-text)}

/* Hero */
.lp-hero{padding:96px 0 0;text-align:center;overflow:hidden;background:radial-gradient(1100px 520px at 50% 100%,var(--c-accent-lt) 0%,transparent 70%)}
.lp-hero-copy h1{font-size:clamp(44px,7.2vw,86px);line-height:1.03;letter-spacing:-.036em;font-weight:800;animation:fup .9s var(--ease) both}
.lp-hero-copy h1 span{color:var(--c-accent)}
.lp-lead{font-size:clamp(18px,2vw,22px);line-height:1.5;color:var(--c-text2);max-width:620px;margin:24px auto 0;letter-spacing:-.01em;animation:fup .9s var(--ease) .1s both}
.lp-cta{display:flex;align-items:center;justify-content:center;gap:26px;margin-top:36px;flex-wrap:wrap;animation:fup .9s var(--ease) .18s both}
.lp-more{color:var(--c-accent);text-decoration:none;font-size:16px;font-weight:600;white-space:nowrap}
.lp-quick{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px 10px;margin-top:22px;animation:fup .9s var(--ease) .26s both}
.lp-quick-lbl{font-size:14px;color:var(--c-text3);font-weight:500}
.lp-q{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 16px;border-radius:99px;border:none;background:var(--c-surface);box-shadow:var(--shadow-xs),inset 0 0 0 1px var(--hair);font:inherit;font-size:14px;font-weight:600;color:var(--c-text);cursor:pointer;transition:transform .15s,box-shadow .15s}
.lp-q:hover{transform:translateY(-1px);box-shadow:var(--shadow-sm,0 4px 14px rgba(20,20,43,.08)),inset 0 0 0 1px var(--c-accent)}
.lp-q:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px}
.lp-q svg{width:16px;height:16px;fill:none;stroke:var(--c-accent);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.lp-more:hover{text-decoration:underline}
.lp-more span{font-size:1.2em;margin-left:2px}

.lp-stage{position:relative;height:clamp(300px,44vw,520px);max-width:980px;margin:72px auto 0;animation:fup 1.1s var(--ease) .25s both}
.lp-sheet{position:absolute;border-radius:6px;overflow:hidden;background:#fff;box-shadow:0 2px 6px rgba(20,20,43,.05),0 30px 70px rgba(20,20,43,.16)}
.s-c{width:clamp(220px,31vw,360px);left:50%;top:0;transform:translateX(-50%) translateY(calc(var(--drift,0) * -14px));z-index:3;will-change:transform}
.s-l{width:clamp(190px,26vw,300px);left:50%;top:40px;transform:translateX(calc(-128% - var(--drift,0) * 10%)) rotate(calc(-7deg - var(--drift,0) * 3deg));z-index:2;opacity:.96;will-change:transform}
.s-r{width:clamp(190px,26vw,300px);left:50%;top:40px;transform:translateX(calc(28% + var(--drift,0) * 10%)) rotate(calc(7deg + var(--drift,0) * 3deg));z-index:2;opacity:.96;will-change:transform}
.lp-chip{position:absolute;z-index:4;display:flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--c-surface) 80%,transparent);backdrop-filter:saturate(1.8) blur(18px);-webkit-backdrop-filter:saturate(1.8) blur(18px);border:1px solid var(--hair);border-radius:999px;padding:10px 18px 10px 12px;box-shadow:var(--shadow-lg);font-size:14px;font-weight:600;color:var(--c-text)}
.c-score{right:calc(50% - min(31vw,360px)/2 - 120px);top:30%;padding-left:16px}
.c-score b{font-size:26px;letter-spacing:-.03em;color:var(--c-pass)}
.c-score span{font-weight:500;color:var(--c-text2)}
.c-ats{left:calc(50% - min(31vw,360px)/2 - 120px);top:62%}
.c-ats svg{width:22px;height:22px;padding:4px;border-radius:50%;background:var(--c-pass);fill:none;stroke:#fff;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}

/* Section headings */
.lp-sec{padding:120px 0}
.lp-alt{background:var(--c-bg)}
.lp-h2{font-size:clamp(34px,5vw,56px);letter-spacing:-.034em;font-weight:800;line-height:1.05;text-align:center}
.lp-h2.left{text-align:left}
.lp-sub{text-align:center;color:var(--c-text2);margin:16px auto 0;font-size:clamp(17px,1.8vw,20px);line-height:1.5;max-width:640px;letter-spacing:-.01em}
.lp-center{text-align:center;margin-top:48px}
.lp-row-hd{display:flex;align-items:baseline;justify-content:space-between;gap:20px;flex-wrap:wrap}

/* Dark gallery */
/* The story: a header with a step rail, then one chapter per feature */
.lp-story{padding-bottom:64px}
.lp-rail{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:36px}
.lp-rail a{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px 0 6px;border-radius:999px;background:var(--c-bg);color:var(--c-text);text-decoration:none;font-size:14px;font-weight:600;transition:background .2s,transform .2s}
.lp-rail a:hover{background:var(--c-accent-lt);transform:translateY(-1px)}
.lp-rail a span{width:28px;height:28px;border-radius:50%;background:var(--c-accent);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}
.lp-ch{padding:110px 0}
.lp-ch-in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:64px;align-items:center}
.lp-ch.rev .lp-ch-copy{order:2}
.lp-ch-step{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--c-accent);margin-bottom:14px}
.lp-ch-copy h2{font-size:clamp(32px,4.4vw,50px);font-weight:800;letter-spacing:-.034em;line-height:1.05}
.lp-ch-copy > p{margin-top:18px;font-size:clamp(16.5px,1.6vw,19px);line-height:1.55;color:var(--c-text2);letter-spacing:-.01em}
.lp-ch-copy ul{list-style:none;margin:22px 0 30px;padding:0;display:flex;flex-direction:column;gap:10px}
.lp-ch-copy li{display:flex;align-items:flex-start;gap:10px;font-size:16px;font-weight:550;color:var(--c-text)}
.lp-ch-copy li svg{width:20px;height:20px;flex-shrink:0;margin-top:1px;padding:3.5px;border-radius:50%;background:var(--c-accent-lt);fill:none;stroke:var(--c-accent);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.lp-ch.dark{background:#0C0C10;color:#F3F4F6}
.lp-ch.dark .lp-ch-step{color:#A5A0FF}
.lp-ch.dark .lp-ch-copy > p{color:#B4B8C2}
.lp-ch.dark .lp-ch-copy li{color:#F3F4F6}
.lp-ch.dark .lp-ch-copy li svg{background:rgba(165,160,255,.16);stroke:#A5A0FF}
.lp-media{position:relative;aspect-ratio:16/12;border-radius:32px;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:5%;padding:6%}
.m-fit-sub{font-size:11.5px;font-weight:700;color:#6B6B84;text-transform:uppercase;letter-spacing:.04em}

/* Referral: invite friends, get free CVs */
.lp-ref{position:relative;overflow:hidden;padding:120px 0;color:#fff;background:radial-gradient(900px 500px at 85% 20%,rgba(167,139,250,.55),transparent 60%),radial-gradient(800px 500px at 10% 100%,rgba(56,189,248,.28),transparent 60%),linear-gradient(135deg,#2A2390 0%,#4338CA 55%,#5B4FE0 100%)}
.lp-ref-in{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:64px;align-items:center}
.lp-ref-kick{display:inline-flex;align-items:center;height:30px;padding:0 14px;border-radius:999px;background:rgba(255,255,255,.14);font-size:13px;font-weight:700;letter-spacing:.03em}
.lp-ref-copy h2{margin-top:18px;font-size:clamp(36px,5vw,58px);font-weight:800;letter-spacing:-.036em;line-height:1.02}
.lp-ref-copy h2 span{background:linear-gradient(90deg,#FDE68A,#FBCFE8);-webkit-background-clip:text;background-clip:text;color:transparent}
.lp-ref-copy > p{margin-top:18px;font-size:clamp(16.5px,1.6vw,19px);line-height:1.55;color:rgba(255,255,255,.82);max-width:520px}
.lp-ref-steps{list-style:none;margin:28px 0 32px;padding:0;display:flex;flex-direction:column;gap:12px}
.lp-ref-steps li{display:flex;gap:14px;align-items:flex-start;background:rgba(255,255,255,.08);border-radius:18px;padding:14px 16px;backdrop-filter:blur(6px)}
.lp-ref-steps b{width:32px;height:32px;flex-shrink:0;border-radius:50%;background:#fff;color:#4338CA;font-size:15px;font-weight:800;display:flex;align-items:center;justify-content:center}
.lp-ref-steps strong{display:block;font-size:16px;font-weight:700}
.lp-ref-steps span{display:block;font-size:14px;color:rgba(255,255,255,.75);margin-top:2px}
.lp-ref-btn{border:none;background:#fff;color:#2A2390;font-weight:700;border-radius:999px;padding:0 28px;height:52px;font-size:16px;box-shadow:0 14px 34px rgba(0,0,0,.25);transition:transform .2s}
.lp-ref-btn:hover{transform:translateY(-2px)}
.lp-ref-art{position:relative;min-height:420px;display:flex;align-items:center;justify-content:center}
.lp-ref-card{position:relative;z-index:1;width:min(100%,380px);background:#fff;color:#14142B;border-radius:28px;padding:26px;box-shadow:0 40px 90px rgba(10,8,60,.45);transform:rotate(-3deg)}
.lp-ref-card-hd{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700}
.lp-ref-gift{width:38px;height:38px;border-radius:12px;background:#EEF0FF;display:flex;align-items:center;justify-content:center}
.lp-ref-gift svg{width:20px;height:20px;fill:none;stroke:#4338CA;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.lp-ref-link{margin-top:16px;padding:12px 14px;border-radius:14px;background:#F2F2F7;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13.5px;color:#4A4A63;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lp-ref-share{display:flex;gap:8px;margin-top:12px}
.lp-ref-share span{flex:1;text-align:center;padding:9px 0;border-radius:999px;background:#F2F2F7;font-size:13px;font-weight:650}
.lp-ref-share span.pri{background:#4338CA;color:#fff}
.lp-ref-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
.lp-ref-stats div{background:#EEF0FF;border-radius:16px;padding:12px 14px}
.lp-ref-stats b{display:block;font-size:28px;font-weight:800;letter-spacing:-.03em;color:#4338CA}
.lp-ref-stats span{font-size:12.5px;color:#4A4A63;font-weight:600}
.lp-ref-chip{position:absolute;z-index:2;padding:10px 16px;border-radius:999px;background:#fff;color:#14142B;font-size:14px;font-weight:750;box-shadow:0 16px 36px rgba(10,8,60,.35);animation:refFloat 4s ease-in-out infinite}
.lp-ref-chip.c1{top:8%;right:4%;color:#15803D}
.lp-ref-chip.c2{bottom:10%;left:0;color:#4338CA;animation-delay:-2s}
.lp-ref-faces{position:absolute;z-index:2;top:14%;left:6%;display:flex}
.lp-ref-faces i{width:42px;height:42px;border-radius:50%;border:3px solid #4338CA;margin-left:-10px;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:800;color:#fff;background:linear-gradient(135deg,#F472B6,#A78BFA)}
.lp-ref-faces i:nth-child(2){background:linear-gradient(135deg,#34D399,#38BDF8)}
.lp-ref-faces i:nth-child(3){background:linear-gradient(135deg,#FBBF24,#F97316)}
@keyframes refFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@media (prefers-reduced-motion:reduce){.lp-ref-chip{animation:none}}

/* Card pictures */
.m-story{background:linear-gradient(140deg,#EEF0FF,#D9DCFF)}
.m-tailor{background:linear-gradient(140deg,#F4F1EA,#E6E0D3)}
.m-fit{background:linear-gradient(140deg,#E9F1E8,#D4E4D2)}
.m-ats{background:linear-gradient(140deg,#E8EEF8,#D3DFF2)}
.m-pdf{background:radial-gradient(120% 120% at 70% 0%,#6A60F2 0%,#4338CA 45%,#2A2390 100%)}
.m-mic{width:44%;background:#fff;border-radius:22px;padding:24px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;box-shadow:0 20px 50px rgba(20,20,43,.14)}
.m-mic-btn{width:64px;height:64px;border-radius:50%;background:#4338CA;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 10px rgba(67,56,202,.12)}
.m-mic-btn svg{width:28px;height:28px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round}
.m-wave{display:flex;align-items:center;gap:4px;height:34px}
.m-wave i{width:4px;border-radius:4px;background:#4338CA;animation:wave 1.1s ease-in-out infinite alternate;height:30%}
@keyframes wave{to{height:100%}}
.m-mic-txt{font-size:12.5px;font-weight:600;color:#4A4A63;text-align:center}
.m-page{width:34%;border-radius:4px;overflow:hidden;box-shadow:0 24px 60px rgba(20,20,43,.2);transform:rotate(4deg)}
.m-panel{width:min(80%,440px);background:#fff;border-radius:22px;padding:22px;box-shadow:0 20px 50px rgba(20,20,43,.14);display:flex;flex-direction:column;gap:12px;color:#14142B}
.m-tick{display:flex;align-items:center;gap:12px;font-size:14px;font-weight:650;flex-wrap:wrap}
.m-tick.off{opacity:.55}
.m-line{flex:1;height:7px;border-radius:4px;background:#C7EFD5;min-width:40px}
.m-box{width:22px;height:22px;border-radius:7px;background:#4338CA;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.m-tick.off .m-box{background:#fff;border:2px solid #D0D0DE}
.m-box svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.m-ba{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;width:100%;padding:12px 14px;border-radius:14px;background:#F7F7FB;font-weight:500}
.m-ba em{font-style:normal;font-size:10.5px;font-weight:700;color:#6B6B84}
.m-ba i{height:7px;border-radius:4px}
.m-ba .old{background:#E4E4EE;width:86%}
.m-ba .new{background:#C7EFD5;width:94%}
.m-apply{align-self:flex-end;background:#4338CA;color:#fff;border-radius:999px;padding:9px 16px;font-size:13px;font-weight:650}
.m-fit .m-panel,.m-panel.m-fit{gap:14px}
.m-verdict{align-self:flex-start;background:#FFF4DE;color:#B45309;border-radius:999px;padding:6px 14px;font-size:13px;font-weight:700}
.m-good{align-self:flex-start;background:#E4F7EB;color:#15803D;border-radius:999px;padding:6px 14px;font-size:13px;font-weight:700}
.m-reason{display:flex;align-items:center;gap:12px}
.m-reason svg{width:22px;height:22px;padding:4px;border-radius:50%;fill:none;stroke:#fff;stroke-width:3.2;stroke-linecap:round;flex-shrink:0}
.m-reason.ok svg{background:#16A34A}
.m-reason.gap svg{background:#D97706}
.m-reason i{height:8px;border-radius:4px;background:#E4E4EE}
.m-ring{position:relative;width:34%;aspect-ratio:1}
.m-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.m-ring circle{fill:none;stroke-width:11;stroke-linecap:round}
.m-ring .track{stroke:rgba(255,255,255,.75)}
.m-ring .bar{stroke:#16A34A;stroke-dasharray:86 100}
.m-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(34px,5vw,56px);font-weight:800;letter-spacing:-.04em;color:#14142B}
.m-checks{background:#fff;border-radius:22px;padding:20px 22px;box-shadow:0 20px 50px rgba(20,20,43,.12);display:flex;flex-direction:column;gap:10px;min-width:42%}
.m-ats-ttl{font-size:12px;font-weight:700;color:#6B6B84}
.m-check{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:#14142B}
.m-check svg{width:20px;height:20px;padding:3.5px;border-radius:50%;background:#16A34A;fill:none;stroke:#fff;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}

.m-sheet{position:relative;width:38%;border-radius:4px;overflow:visible;box-shadow:0 30px 70px rgba(0,0,0,.4)}
.m-pdf-tag{position:absolute;right:-18px;top:18px;background:#fff;color:#4338CA;border-radius:10px;padding:7px 12px;font-size:13px;font-weight:800;box-shadow:0 10px 24px rgba(0,0,0,.25)}

/* Feature explorer */
.lp-explore{margin-top:48px;background:var(--c-surface);border-radius:32px;padding:56px;display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:40px;align-items:center;min-height:620px;box-shadow:var(--shadow-sm)}
.lp-pills{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.lp-pill{display:flex;flex-direction:column;align-items:flex-start;text-align:left;border:none;background:color-mix(in srgb,var(--c-text) 6%,var(--c-surface));color:var(--c-text);border-radius:28px;padding:0;max-width:100%;transition:background .3s var(--ease)}
.lp-pill:hover{background:color-mix(in srgb,var(--c-text) 9%,var(--c-surface))}
.lp-pill-hd{display:flex;align-items:center;gap:12px;padding:15px 22px 15px 14px;font-size:16px;font-weight:650;letter-spacing:-.01em}
.lp-plus{width:26px;height:26px;border-radius:50%;border:1.6px solid currentColor;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .35s var(--ease),opacity .2s}
.lp-plus svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
.lp-pill-bd{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s var(--ease)}
.lp-pill-bd > span{overflow:hidden;font-size:15px;line-height:1.55;color:var(--c-text2);padding:0 24px;max-width:340px}
.lp-pill.open{background:color-mix(in srgb,var(--c-text) 6%,var(--c-surface))}
.lp-pill.open .lp-pill-bd{grid-template-rows:1fr}
.lp-pill.open .lp-pill-bd > span{padding-bottom:20px}
.lp-pill.open .lp-plus{transform:rotate(45deg);opacity:0;width:0;margin-right:-12px;border-width:0}
.lp-pill.open .lp-pill-hd{padding-left:24px}
.lp-show{position:relative;height:100%;min-height:460px;display:flex;align-items:center;justify-content:center}
.lp-show-in{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:28px;position:relative}
.xfade-enter-active,.xfade-leave-active{transition:opacity .35s var(--ease),transform .45s var(--ease)}
.xfade-enter-from{opacity:0;transform:translateY(14px) scale(.98)}
.xfade-leave-to{opacity:0;transform:translateY(-8px)}
.v-fan{position:relative;width:100%;height:420px}
.v-fan .f1{width:46%;left:2%;top:40px;transform:rotate(-6deg)}
.v-fan .f2{width:46%;left:27%;top:0;z-index:2}
.v-fan .f3{width:46%;left:52%;top:40px;transform:rotate(6deg)}
.v-one{position:relative;width:min(300px,52%)}
.v-file{display:flex;flex-direction:column;align-items:center;gap:10px;font-weight:650;color:var(--c-text2)}
.v-file svg{width:84px;height:84px;fill:var(--c-accent-lt);stroke:var(--c-accent);stroke-width:1.2;stroke-linejoin:round}
.v-arrow{width:34px;height:34px;fill:none;stroke:var(--c-text3);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.v-langs{display:flex;flex-direction:column;gap:8px}
.v-langs span{font-size:15px;font-weight:650;padding:8px 16px;border-radius:999px;background:color-mix(in srgb,var(--c-text) 6%,var(--c-surface));text-align:center}
.v-langs span:nth-child(2){background:var(--c-accent);color:#fff}
.v-honest{width:min(440px,92%)}
.v-lock{width:180px;height:180px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#6A60F2,#4338CA 55%,#2A2390);display:flex;align-items:center;justify-content:center;box-shadow:0 30px 70px rgba(67,56,202,.35)}
.v-lock svg{width:76px;height:76px;fill:none;stroke:#fff;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.v-devices{position:relative;width:100%;height:460px}
.v-browser{position:absolute;left:0;top:44px;width:80%;border-radius:16px;background:#fff;overflow:hidden;box-shadow:0 2px 6px rgba(20,20,43,.05),0 30px 70px rgba(20,20,43,.16);border:1px solid rgba(20,20,43,.06)}
.v-bar{height:32px;display:flex;align-items:center;gap:6px;padding:0 14px;background:#F2F2F7}
.v-bar i{width:10px;height:10px;border-radius:50%;background:#D9D9E2}
.v-bar span{margin:0 auto;padding:0 40px;height:20px;border-radius:7px;background:#fff;font-size:10.5px;font-weight:500;color:#8B909C;display:flex;align-items:center}
.v-browser-in{height:320px;overflow:hidden;background:#ECECF0;padding:22px 0 0}
.v-browser-page{width:58%;margin:0 0 0 12%;box-shadow:0 10px 30px rgba(20,20,43,.12)}
.v-handset{position:absolute;right:0;top:0;width:212px;height:436px;border-radius:46px;background:#0C0C10;padding:9px;box-shadow:0 40px 90px rgba(20,20,43,.32),inset 0 0 0 1.5px #3A3A44}
.v-island{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:64px;height:19px;border-radius:12px;background:#0C0C10;z-index:2}
.v-screen{width:100%;height:100%;border-radius:38px;overflow:hidden;background:#F5F5FA;padding:50px 13px 0}
.v-app-hd{font-size:20px;font-weight:800;letter-spacing:-.03em;color:#14142B;margin:0 4px 12px}
.v-app-card{background:#fff;border-radius:16px;padding:8px;box-shadow:0 1px 2px rgba(20,20,43,.04),0 4px 14px rgba(20,20,43,.06);margin-bottom:10px}
.v-app-thumb{height:132px;overflow:hidden;border-radius:9px;box-shadow:inset 0 0 0 1px rgba(20,20,43,.06)}
.v-app-t{font-size:12.5px;font-weight:700;letter-spacing:-.01em;color:#14142B;margin:9px 4px 1px}
.v-app-s{font-size:10.5px;color:#6B6B84;margin:0 4px 9px}
.v-app-btns{display:flex;gap:6px}
.v-app-btns span{flex:1;text-align:center;font-size:10.5px;font-weight:600;padding:7px 0;border-radius:999px;background:#EFEFF4;color:#14142B}
.v-app-btns .pri{background:#4338CA;color:#fff}
.v-app-peek .v-app-thumb{height:120px}

/* Templates */
.lp-dots{display:flex;justify-content:center;gap:10px;margin-top:34px;flex-wrap:wrap}
.lp-dot{width:26px;height:26px;border-radius:50%;border:none;background:var(--dot);box-shadow:0 0 0 2px var(--c-surface),0 0 0 3.5px transparent;transition:box-shadow .2s var(--ease),transform .2s var(--ease)}
.lp-dot:hover{transform:scale(1.1)}
.lp-dot.on{box-shadow:0 0 0 2px var(--c-surface),0 0 0 3.5px var(--dot)}
.lp-tpls{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;margin-top:44px}
.lp-tpl{margin:0}
.lp-tpl-img{border-radius:6px;overflow:hidden;box-shadow:0 2px 6px rgba(20,20,43,.05),0 20px 50px rgba(20,20,43,.12);transition:transform .4s var(--ease),box-shadow .4s var(--ease)}
.lp-tpl:hover .lp-tpl-img{transform:translateY(-6px);box-shadow:0 2px 6px rgba(20,20,43,.05),0 30px 70px rgba(20,20,43,.16)}
.lp-tpl figcaption{display:flex;flex-direction:column;align-items:center;gap:2px;margin-top:16px;font-weight:650;font-size:15px}
.lp-tpl figcaption span{font-size:13px;font-weight:500;color:var(--c-text3)}

/* Reviews */
.lp-stars{color:#F59E0B;letter-spacing:1px}
.lp-stars span{color:var(--c-border2)}
.lp-reviews{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.lp-review{margin:0;padding:28px;border-radius:24px;background:var(--c-surface);box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:12px}
.lp-review blockquote{margin:0;font-size:16px;line-height:1.6;color:var(--c-text)}
.lp-review figcaption{font-size:13.5px;font-weight:650;color:var(--c-text2);margin-top:auto}
.lp-review figcaption span{font-weight:500;color:var(--c-text3)}

/* Pricing */
.lp-prices{display:grid;grid-template-columns:repeat(2,minmax(0,380px));justify-content:center;gap:20px;align-items:stretch;margin-top:52px}
.lp-price{padding:36px;display:flex;flex-direction:column;border-radius:28px;background:var(--c-surface);box-shadow:var(--shadow-sm);border:1px solid var(--hair)}
.lp-price.featured{box-shadow:0 0 0 2px var(--c-accent),var(--shadow-lg);border-color:transparent}
.lp-price h3{font-size:17px;font-weight:650;color:var(--c-text2);letter-spacing:-.01em}
.lp-amt{font-size:56px;font-weight:800;letter-spacing:-.05em;margin:8px 0 22px;line-height:1}
.lp-amt span{font-size:15px;font-weight:500;color:var(--c-text3);letter-spacing:0}
.lp-price ul{list-style:none;display:flex;flex-direction:column;gap:12px;margin:0 0 28px;padding:0;flex:1}
.lp-price li{display:flex;gap:10px;font-size:15.5px;color:var(--c-text2);line-height:1.45}
.lp-price li svg{width:18px;height:18px;flex-shrink:0;fill:none;stroke:var(--c-pass);stroke-width:2.4;margin-top:2px}
.lp-small{text-align:center;color:var(--c-text3);margin-top:28px;font-size:14px}

/* Blog */
.lp-posts{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:40px}
.lp-post{display:flex;flex-direction:column;text-decoration:none;color:var(--c-text)}
.lp-post-img{display:block;aspect-ratio:16/10;border-radius:20px;overflow:hidden;background:var(--c-accent-lt)}
.lp-post img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s var(--ease)}
.lp-post:hover img{transform:scale(1.03)}
.lp-post-b{display:flex;flex-direction:column;gap:6px;padding:16px 4px 0}
.lp-post-b strong{font-size:18px;line-height:1.3;letter-spacing:-.015em}
.lp-post:hover strong{color:var(--c-accent)}
.lp-post-b span{font-size:14.5px;color:var(--c-text2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* FAQ */
.lp-faq-wrap{max-width:780px}
.lp-faq-wrap .lp-h2{margin-bottom:40px}
.lp-faq{border-bottom:1px solid var(--hair)}
.lp-faq summary{list-style:none;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:24px 0;font-weight:650;font-size:18px;letter-spacing:-.015em;cursor:pointer}
.lp-faq summary::-webkit-details-marker{display:none}
.lp-faq summary .lp-plus{color:var(--c-text3)}
.lp-faq[open] summary .lp-plus{transform:rotate(45deg)}
.lp-faq p{color:var(--c-text2);line-height:1.7;padding:0 40px 26px 0;font-size:16px}

/* Newsletter */
.lp-news-sec{padding:96px 0}
.lp-news{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.lp-news h2{font-size:clamp(26px,3vw,34px);letter-spacing:-.035em;font-weight:800;line-height:1.1}
.lp-news-txt p{color:var(--c-text2);margin-top:10px;line-height:1.6;font-size:16px}
.lp-news-row{display:flex;gap:10px}
.lp-news-row .f-inp{height:50px;font-size:15.5px;flex:1;min-width:0;border-radius:999px;padding:0 20px}
.lp-news-row .btn-primary{height:50px;padding:0 24px;white-space:nowrap}
.lp-news-fine{font-size:12.5px;color:var(--c-text3);margin-top:12px;line-height:1.5;padding-left:20px}
.lp-news-fine a{color:var(--c-text2)}
.lp-news-err{font-size:13px;color:var(--c-rose);margin-top:10px;padding-left:20px}
.lp-news-fix{background:none;border:0;padding:0;color:var(--c-accent);font:inherit;font-weight:600;text-decoration:underline;cursor:pointer}
.lp-news-done{display:flex;gap:10px;align-items:center;background:var(--c-accent-lt);color:var(--c-text);border-radius:20px;padding:18px 20px;font-size:15px;font-weight:500}
.lp-news-done svg{width:20px;height:20px;flex-shrink:0;fill:none;stroke:var(--c-accent);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

/* Final */
.lp-final{padding:140px 0;background:#0C0C10;color:#F3F4F6;text-align:center;overflow:hidden;position:relative}
.lp-final::before{content:'';position:absolute;left:50%;top:40%;width:900px;height:520px;transform:translate(-50%,-50%);background:radial-gradient(closest-side,rgba(139,133,255,.28),transparent);pointer-events:none}
.lp-final-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:28px}
.lp-final-mark :deep(svg){height:76px}
.lp-final-ph{height:76px}
.lp-final h2{font-size:clamp(34px,5.6vw,64px);letter-spacing:-.036em;font-weight:800;line-height:1.04;max-width:820px}
.lp-final-btn{margin-top:6px}

/* Footer */
.lp-foot{padding:56px 0 40px;background:var(--c-bg);font-size:13px;color:var(--c-text3)}
.lp-foot-cols{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:32px;padding-bottom:32px;border-bottom:1px solid var(--hair)}
.lp-foot-brand p{margin-top:14px;max-width:280px;line-height:1.6}
.lp-foot h4{font-size:12.5px;font-weight:650;color:var(--c-text);margin-bottom:12px}
.lp-foot a{display:block;color:var(--c-text3);text-decoration:none;padding:4px 0}
.lp-foot a:hover{color:var(--c-text)}
.lp-foot-copy{padding-top:22px}

@media (max-width:900px){
  .lp-links{display:none}
  .lp-hero{padding-top:64px}
  .lp-stage{margin-top:52px}
  .c-score{right:6%;top:46%}
  .c-ats{left:4%;top:72%}
  .lp-sec{padding:88px 0}
  .lp-ch{padding:80px 0}
  .lp-ch-in,.lp-ref-in{grid-template-columns:1fr;gap:36px}
  .lp-ch.rev .lp-ch-copy{order:0}
  .lp-ch-media{order:-1}
  .lp-ref{padding:88px 0}
  .lp-ref-art{min-height:380px}
  .lp-explore{grid-template-columns:1fr;padding:28px;gap:28px;min-height:0}
  .lp-show{min-height:360px;order:-1}
  .v-fan{height:330px}
  .v-devices{height:400px;max-width:520px}
  .v-handset{width:180px;height:372px;border-radius:40px}
  .v-screen{border-radius:32px;padding-top:44px}
  .v-app-thumb{height:108px}
  .v-browser-in{height:270px}
  .lp-tpls{grid-template-columns:1fr 1fr;gap:20px}
  .lp-reviews,.lp-prices,.lp-posts{grid-template-columns:1fr}
  .lp-news{grid-template-columns:1fr;gap:24px}
  .lp-foot-cols{grid-template-columns:1fr 1fr}
  .lp-foot-brand{grid-column:1/-1}
}
@media (max-width:560px){
  .lp-wrap{padding:0 20px}
  .lp-nav-cta .btn-primary{display:none}
  .lp-signin{display:none}
  .lp-hero{padding-top:48px}
  .lp-cta{flex-direction:column;gap:18px}
  .lp-cta .btn-lg{width:100%;max-width:340px}
  .lp-stage{height:300px;margin-top:44px}
  .s-c{width:200px}
  .s-l,.s-r{width:170px;top:28px}
  .lp-chip{font-size:12.5px;padding:8px 14px 8px 10px}
  .c-score b{font-size:20px}
  .c-score{right:2%;top:52%}
  .c-ats{left:2%;top:76%}
  .lp-media{aspect-ratio:4/3.4;border-radius:24px}
  .m-mic{width:52%;padding:16px 12px}
  .m-mic-btn{width:48px;height:48px}
  .m-panel{padding:16px}
  .lp-ch-copy .btn-lg,.lp-ref-btn{width:100%}
  .lp-rail a{font-size:13px}
  .lp-ref-art{min-height:340px}
  .lp-ref-faces{left:0}
  .lp-explore{padding:18px;border-radius:26px}
  .lp-pill-hd{font-size:15px;padding:13px 18px 13px 12px}
  .lp-show{min-height:300px}
  .v-fan{height:270px}
  .v-devices{height:320px}
  .lp-show{min-height:350px}
  .v-browser{top:30px;width:86%;border-radius:12px}
  .v-browser-in{height:210px;padding-top:14px}
  .v-handset{width:146px;height:300px;border-radius:34px;padding:7px}
  .v-island{top:14px;width:46px;height:14px}
  .v-screen{border-radius:28px;padding:34px 9px 0}
  .v-app-hd{font-size:15px;margin-bottom:8px}
  .v-app-card{border-radius:12px;padding:6px}
  .v-app-thumb{height:84px}
  .v-app-t{font-size:10.5px}.v-app-s{font-size:9px}.v-app-btns span{font-size:9px;padding:5px 0}
  .lp-faq summary{font-size:16.5px}
  .lp-final{padding:110px 0}
  .lp-news-row{flex-direction:column}
  .lp-news-row .f-inp{flex:none;width:100%}
  .lp-news-row .btn-primary{width:100%}
}
</style>
