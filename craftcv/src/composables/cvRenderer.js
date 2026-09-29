// CV template engine — 12 layouts (8 ATS-friendly, 4 creative) × 12 colour themes.
//
// Every layout is built from the same section blocks, so all of them share:
//  • ATS-safe reading order (name → contact → profile → experience → … in the HTML,
//    even when a sidebar is drawn on the left),
//  • real headings (h1 name, h2 sections) in the CV's language (EN/FR),
//  • a contact line with separators, plain-text skills, light printable pages,
//  • a 700 × 990 px page (A4 proportions) that the PDF step fits onto one page.
//
// Template ids are "layout:theme" (e.g. "modern:indigo"). Ids from the old 107-template
// system are mapped onto the closest layout + colour, so existing CVs keep working.

export const PAGE_W = 700
export const PAGE_H = 990

// kind 'ats': plain structure for online applications (tracking systems read them well).
// kind 'creative': more visual, for printing, handing over in person or emailing a person.
export const LAYOUTS = [
  { id: 'modern',    kind: 'ats',      name: 'Modern',    desc: 'Clean header, skills column on the right' },
  { id: 'classic',   kind: 'ats',      name: 'Classic',   desc: 'Single column, centred serif name' },
  { id: 'sidebar',   kind: 'ats',      name: 'Sidebar',   desc: 'Tinted column for contact, skills and education' },
  { id: 'minimal',   kind: 'ats',      name: 'Minimal',   desc: 'Pure text with side labels — the most ATS-friendly' },
  { id: 'executive', kind: 'ats',      name: 'Executive', desc: 'Strong colour header, two columns' },
  { id: 'compact',   kind: 'ats',      name: 'Compact',   desc: 'Dense layout that fits long CVs on one page' },
  { id: 'timeline',  kind: 'ats',      name: 'Timeline',  desc: 'Dates on the left, accent rule, confident name' },
  { id: 'photo',     kind: 'ats',      name: 'Photo',     desc: 'Headshot header, two columns' },
  { id: 'studio',    kind: 'creative', name: 'Studio',    desc: 'Dark full-height panel with photo and skill tags' },
  { id: 'elegant',   kind: 'creative', name: 'Elegant',   desc: 'Framed page, serif name, ornamental rules' },
  { id: 'bold',      kind: 'creative', name: 'Bold',      desc: 'Colour band, big name, numbered sections' },
  { id: 'portrait',  kind: 'creative', name: 'Portrait',  desc: 'Large photo block beside your name' },
]
export const LAYOUT_KINDS = {
  ats:      { name: 'ATS-friendly', desc: 'For online applications — tracking systems read these cleanly' },
  creative: { name: 'Creative',     desc: 'For print, in person or sending to a person — design first' },
}

export const THEMES = [
  { id: 'indigo',   name: 'Indigo',   accent: '#4338ca', dark: '#1e1b4b', tint: '#eef2ff' },
  { id: 'blue',     name: 'Blue',     accent: '#1d4ed8', dark: '#172554', tint: '#eff6ff' },
  { id: 'sky',      name: 'Sky',      accent: '#0369a1', dark: '#082f49', tint: '#f0f9ff' },
  { id: 'teal',     name: 'Teal',     accent: '#0f766e', dark: '#042f2e', tint: '#f0fdfa' },
  { id: 'emerald',  name: 'Emerald',  accent: '#047857', dark: '#022c22', tint: '#ecfdf5' },
  { id: 'slate',    name: 'Slate',    accent: '#475569', dark: '#0f172a', tint: '#f1f5f9' },
  { id: 'charcoal', name: 'Charcoal', accent: '#27272a', dark: '#18181b', tint: '#f4f4f5' },
  { id: 'burgundy', name: 'Burgundy', accent: '#9f1239', dark: '#4c0519', tint: '#fff1f2' },
  { id: 'crimson',  name: 'Crimson',  accent: '#b91c1c', dark: '#450a0a', tint: '#fef2f2' },
  { id: 'plum',     name: 'Plum',     accent: '#7e22ce', dark: '#3b0764', tint: '#faf5ff' },
  { id: 'amber',    name: 'Amber',    accent: '#b45309', dark: '#431407', tint: '#fffbeb' },
  { id: 'rose',     name: 'Rose',     accent: '#be185d', dark: '#500724', tint: '#fdf2f8' },
]

export const FONTS = [
  { id: 'DM Sans', name: 'DM Sans', note: 'Modern sans (default)' },
  { id: 'Inter',   name: 'Inter',   note: 'Neutral, very readable' },
  { id: 'Lora',    name: 'Lora',    note: 'Classic serif' },
]

export const DEFAULT_TEMPLATE = 'modern:indigo'

// Old template id → "layout:theme"
const LEGACY = {
  executive: 'executive:charcoal', modern: 'modern:blue', minimal: 'minimal:charcoal', bold: 'executive:charcoal',
  creative: 'sidebar:plum', academic: 'classic:charcoal', elegant: 'executive:amber', tech: 'executive:slate',
  teal: 'sidebar:teal', newspaper: 'classic:charcoal', swiss: 'minimal:crimson', gradient: 'modern:indigo',
  compact: 'compact:blue', photo: 'photo:blue', infographic: 'timeline:teal', pastel: 'modern:rose',
  corporate: 'executive:blue', magazine: 'timeline:charcoal', midnight: 'executive:indigo', clean: 'minimal:blue',
  slate: 'executive:slate', terra: 'timeline:amber', prism: 'timeline:indigo', ivory: 'classic:amber',
  split: 'sidebar:charcoal', forest: 'sidebar:emerald', ruby: 'modern:burgundy', ocean: 'modern:sky',
  purple: 'timeline:plum', charcoal: 'executive:charcoal', sunrise: 'modern:amber', silver: 'minimal:slate',
  mint: 'modern:emerald', indigo: 'timeline:indigo', amber: 'executive:amber', diamond: 'photo:indigo',
  bloom: 'timeline:rose', nordic: 'minimal:sky', sakura: 'modern:rose', emerald: 'photo:emerald',
  cobalt: 'executive:blue', lemon: 'modern:amber', graphite: 'sidebar:charcoal', vega: 'executive:indigo',
  rose: 'minimal:rose', onyx: 'executive:charcoal', aurora: 'modern:indigo', carbon: 'executive:charcoal',
  sky: 'classic:sky', obsidian: 'executive:charcoal', slate2: 'sidebar:slate', crimson: 'modern:crimson',
  sage: 'minimal:emerald', dusk: 'modern:plum', slate3: 'sidebar:slate', copper2: 'minimal:amber',
  neon: 'executive:emerald', blush: 'photo:rose', sand: 'classic:amber', phantom: 'executive:charcoal',
  electric: 'modern:sky', luxe: 'executive:amber', mono: 'minimal:charcoal', wave: 'modern:teal',
  navy: 'sidebar:blue', violet2: 'timeline:plum', midnight2: 'executive:indigo', glacier: 'modern:sky',
  lava: 'executive:crimson', verdant: 'timeline:emerald', parchment: 'classic:amber', matrix: 'executive:emerald',
  retro: 'timeline:amber', prism2: 'timeline:indigo', zinc: 'executive:charcoal', coral: 'modern:crimson',
  tan: 'minimal:amber', slate4: 'modern:slate', clay: 'sidebar:amber', frost: 'classic:sky',
  steel: 'minimal:slate', mauve: 'modern:plum', brick: 'minimal:crimson', peach: 'modern:amber',
  plum: 'executive:plum', spruce: 'sidebar:emerald', pine: 'compact:emerald', ochre: 'executive:amber',
  ash: 'compact:charcoal', jade: 'sidebar:teal', wine: 'modern:burgundy', ultraviolet: 'executive:plum',
  blueprint: 'executive:blue', meadow: 'classic:emerald', glacier2: 'sidebar:sky', garnet: 'executive:burgundy',
  topaz: 'compact:teal', walnut: 'sidebar:amber', ivory2: 'classic:charcoal', slate5: 'executive:slate',
  crimson2: 'compact:crimson', sepia: 'classic:amber', lavender: 'photo:plum', ink: 'minimal:charcoal',
  moss: 'sidebar:emerald', futura: 'compact:indigo', tealwave: 'modern:teal', stone: 'minimal:slate',
}

const layoutById = Object.fromEntries(LAYOUTS.map(l => [l.id, l]))
const themeById  = Object.fromEntries(THEMES.map(t => [t.id, t]))

// Any id (new or legacy) → { layout, theme, id }
export function parseTemplate(id) {
  let [layout, theme] = String(id || '').split(':')
  if (!theme) [layout, theme] = (LEGACY[layout] || DEFAULT_TEMPLATE).split(':')
  if (!layoutById[layout]) layout = 'modern'
  if (!themeById[theme])   theme  = 'indigo'
  return { layout, theme, id: `${layout}:${theme}` }
}
export const normalizeTemplate = (id) => parseTemplate(id).id
export const templateId = (layout, theme) => parseTemplate(`${layout}:${theme}`).id
export const getLayout = (id) => layoutById[id]
export const getTheme  = (id) => themeById[id]
export function templateLabel(id) {
  const { layout, theme } = parseTemplate(id)
  return `${layoutById[layout].name} · ${themeById[theme].name}`
}

// ── i18n ──────────────────────────────────────────────────────────────────────
const LABELS = {
  en: { profile: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills',
        projects: 'Projects', languages: 'Languages', certifications: 'Certifications', contact: 'Contact' },
  fr: { profile: 'Profil', experience: 'Expérience professionnelle', education: 'Formation', skills: 'Compétences',
        projects: 'Projets', languages: 'Langues', certifications: 'Certifications', contact: 'Contact' },
}
const PLACEHOLDERS = {
  en: { name: 'Your Name', title: 'Job title', email: 'you@email.com', phone: '+44 7700 900000', loc: 'City, Country',
        sum: 'A short professional summary: who you are, what you do best and what you are looking for.',
        expTitle: 'Job title', expCompany: 'Company', expPeriod: '2021 – Present',
        expDesc: 'What you did and achieved in this role.', degree: 'Degree', school: 'University', skills: ['Skill one', 'Skill two', 'Skill three'] },
  fr: { name: 'Votre nom', title: 'Intitulé du poste', email: 'vous@email.com', phone: '+33 6 00 00 00 00', loc: 'Ville, Pays',
        sum: 'Un court résumé professionnel : qui vous êtes, vos points forts et ce que vous recherchez.',
        expTitle: 'Intitulé du poste', expCompany: 'Entreprise', expPeriod: '2021 – Présent',
        expDesc: 'Vos missions et réalisations dans ce poste.', degree: 'Diplôme', school: 'Établissement', skills: ['Compétence', 'Compétence', 'Compétence'] },
}

// ── escaping ──────────────────────────────────────────────────────────────────
// User text is escaped once here, before any layout sees it. The same HTML is shown
// in the preview (v-html) and rendered by Puppeteer on the server.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const str = (v) => (typeof v === 'string' ? v.trim() : '')
const SAFE_PHOTO = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/

// Link target for a user-typed URL: only http(s), never javascript:/data: etc.
function hrefFor(raw) {
  const u = str(raw)
  if (!u) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return /^https?:/i.test(u) ? u : ''
  return 'https://' + u.replace(/^\/+/, '')
}
const displayUrl = (u) => str(u).replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')
// URL text that may wrap after "/" but never inside a segment — a URL split at a hyphen
// reads as two broken pieces to an ATS.
const urlHtml = (u) => displayUrl(u).split('/').map(part => `<span class="nw">${esc(part)}</span>`).join('/<wbr>')

// Description text → bullet lines (new lines, "•", or "-"/"*" at line start)
const toBullets = (desc) =>
  str(desc).split(/\n|•/).map(l => l.replace(/^\s*[-*–]\s+/, '').trim()).filter(l => l.length > 1)

// Raw CV data → escaped view model. `preview` fills empty fields with muted placeholders;
// exports never contain placeholders.
function buildModel(raw, preview) {
  const d    = raw || {}
  const lang = d.lang === 'fr' ? 'fr' : 'en'
  const P    = PLACEHOLDERS[lang]
  const ph   = (t) => (preview ? `<span class="ph">${esc(t)}</span>` : '')

  const name  = [str(d.fn), str(d.ln)].filter(Boolean).join(' ')
  const title = str(d.title)

  const contacts = []
  const email = str(d.email), phone = str(d.phone), loc = str(d.loc)
  if (email) contacts.push(`<a href="mailto:${esc(email)}">${esc(email)}</a>`)
  if (phone) contacts.push(`<span>${esc(phone)}</span>`)
  if (loc)   contacts.push(`<span>${esc(loc)}</span>`)
  for (const u of [str(d.li), str(d.website)]) {
    if (!u) continue
    const h = hrefFor(u)
    contacts.push(h ? `<a href="${esc(h)}">${urlHtml(u)}</a>` : `<span>${esc(u)}</span>`)
  }
  if (!contacts.length && preview) contacts.push(ph(P.email), ph(P.phone), ph(P.loc))

  const exps = (Array.isArray(d.experiences) ? d.experiences : [])
    .filter(e => e && (str(e.title) || str(e.company) || str(e.desc)))
    .map(e => ({ title: esc(str(e.title)), company: esc(str(e.company)), period: esc(str(e.period)), bullets: toBullets(e.desc).map(esc) }))
  const eduRaw = Array.isArray(d.education) ? d.education : (d.education ? [d.education] : [])
  const edu = eduRaw.filter(e => e && (str(e.degree) || str(e.school) || str(e.year)))
    .map(e => ({ degree: esc(str(e.degree)), school: esc(str(e.school)), year: esc(str(e.year)) }))
  const skills = (Array.isArray(d.skills) ? d.skills : []).map(str).filter(Boolean).map(esc)
  const projects = (Array.isArray(d.projects) ? d.projects : [])
    .filter(p => p && (str(p.name) || str(p.desc)))
    .map(p => {
      const h = hrefFor(p.url)
      return { name: esc(str(p.name)), tech: esc(str(p.tech)), desc: esc(str(p.desc)),
               url: h ? `<a href="${esc(h)}">${urlHtml(p.url)}</a>` : '' }
    })
  const languages = (Array.isArray(d.languages) ? d.languages : [])
    .filter(l => l && str(l.name)).map(l => ({ name: esc(str(l.name)), level: esc(str(l.level)) }))
  const certs = (Array.isArray(d.certifications) ? d.certifications : []).map(str).filter(Boolean).map(esc)

  return {
    lang, L: LABELS[lang], preview,
    name: name ? esc(name) : ph(P.name),
    first: esc(str(d.fn)), last: esc(str(d.ln)),
    initials: esc(((str(d.fn)[0] || '') + (str(d.ln)[0] || '')).toUpperCase()),
    title: title ? esc(title) : ph(P.title),
    contacts,
    photo: typeof d.photo === 'string' && SAFE_PHOTO.test(d.photo) ? d.photo : null,
    sum: str(d.sum) ? esc(str(d.sum)) : ph(P.sum),
    exps: exps.length ? exps : (preview ? [{ title: ph(P.expTitle), company: ph(P.expCompany), period: ph(P.expPeriod), bullets: [ph(P.expDesc)] }] : []),
    edu: edu.length ? edu : (preview ? [{ degree: ph(P.degree), school: ph(P.school), year: '' }] : []),
    skills: skills.length ? skills : (preview ? P.skills.map(ph) : []),
    projects, languages, certs,
  }
}

// ── section blocks ────────────────────────────────────────────────────────────
const sep = '<span class="sep"> · </span>'

function sec(key, label, body) {
  if (!body) return ''
  return `<section class="sec s-${key}"><h2 class="sec-h">${label}</h2><div class="sec-b">${body}</div></section>`
}

const bulletsHtml = (bullets) =>
  bullets.length > 1 ? `<ul class="bl">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
  : bullets.length ? `<p class="prose">${bullets[0]}</p>` : ''

const B = {
  contact: (m) => m.contacts.length ? `<p class="contact">${m.contacts.join(sep)}</p>` : '',
  contactList: (m) => m.contacts.length ? `<ul class="contact-list">${m.contacts.map(c => `<li>${c}</li>`).join('')}</ul>` : '',
  profile: (m) => m.sum ? `<p class="prose">${m.sum}</p>` : '',
  experience: (m) => m.exps.map(e => `
    <article class="item">
      <div class="item-hd"><h3 class="item-t">${e.title}</h3>${e.period ? `<span class="item-d">${e.period}</span>` : ''}</div>
      ${e.company ? `<p class="item-s">${e.company}</p>` : ''}
      ${bulletsHtml(e.bullets)}
    </article>`).join(''),
  timeline: (m) => m.exps.map(e => `
    <article class="item tl">
      <div class="tl-d">${e.period || ''}</div>
      <div class="tl-c">
        <h3 class="item-t">${e.title}</h3>
        ${e.company ? `<p class="item-s">${e.company}</p>` : ''}
        ${bulletsHtml(e.bullets)}
      </div>
    </article>`).join(''),
  education: (m) => m.edu.map(e => `
    <article class="item item-sm">
      <h3 class="item-t">${e.degree}</h3>
      ${e.school || e.year ? `<p class="item-m">${[e.school, e.year].filter(Boolean).join(sep)}</p>` : ''}
    </article>`).join(''),
  // Short skills never break mid-word ("Scikit-|learn"); long phrases may still wrap
  skillsInline: (m) => m.skills.length ? `<p class="inline">${m.skills.map(s => s.length <= 24 ? `<span class="nw">${s}</span>` : s).join(sep)}</p>` : '',
  skillsList: (m) => m.skills.length ? `<ul class="list">${m.skills.map(s => `<li>${s}</li>`).join('')}</ul>` : '',
  // Creative layouts: skills as tags (still plain text)
  skillsChips: (m) => m.skills.length ? `<ul class="chips">${m.skills.map(s => `<li>${s}</li>`).join('')}</ul>` : '',
  projects: (m) => m.projects.map(p => `
    <article class="item">
      <div class="item-hd"><h3 class="item-t">${p.name}</h3>${p.url ? `<span class="item-d">${p.url}</span>` : ''}</div>
      ${p.tech ? `<p class="item-m">${p.tech}</p>` : ''}
      ${p.desc ? `<p class="prose">${p.desc}</p>` : ''}
    </article>`).join(''),
  langInline: (m) => m.languages.length ? `<p class="inline">${m.languages.map(l => !l.level ? l.name : l.level.includes('(') ? `${l.name} — ${l.level}` : `${l.name} (${l.level})`).join(sep)}</p>` : '',
  langList: (m) => m.languages.length ? `<ul class="list">${m.languages.map(l => `<li><strong>${l.name}</strong>${l.level ? ` <span class="muted">— ${l.level}</span>` : ''}</li>`).join('')}</ul>` : '',
  certs: (m) => m.certs.length ? `<ul class="list">${m.certs.map(c => `<li>${c}</li>`).join('')}</ul>` : '',
}

// Sections in the given reading order. `side` = rendered in a narrow column (lists, not inline)
function sections(m, keys, side = false) {
  const L = m.L
  const html = {
    profile:        () => sec('profile', L.profile, B.profile(m)),
    experience:     () => sec('experience', L.experience, B.experience(m)),
    timeline:       () => sec('experience', L.experience, B.timeline(m)),
    projects:       () => sec('projects', L.projects, B.projects(m)),
    education:      () => sec('education', L.education, B.education(m)),
    // In a narrow column a long skill list reads better (and fits) as one wrapped line
    skills:         () => sec('skills', L.skills, side && m.skills.length <= 12 ? B.skillsList(m) : B.skillsInline(m)),
    languages:      () => sec('languages', L.languages, side ? B.langList(m) : B.langInline(m)),
    certifications: () => sec('certifications', L.certifications, B.certs(m)),
    contact:        () => sec('contact', L.contact, B.contactList(m)),
    // Tags look good for a handful of skills; a long list is kinder as one wrapped line
    chips:          () => sec('skills', L.skills, m.skills.length <= 16 ? B.skillsChips(m) : B.skillsInline(m)),
    langList:       () => sec('languages', L.languages, B.langList(m)),
  }
  return keys.map(k => html[k]()).join('')
}

const MAIN  = ['profile', 'experience', 'projects']
const SIDE  = ['skills', 'education', 'languages', 'certifications']
const ALL   = ['profile', 'experience', 'projects', 'education', 'skills', 'languages', 'certifications']

// ── layouts ───────────────────────────────────────────────────────────────────
const avatar = (m) => m.photo
  ? `<img class="avatar" src="${m.photo}" alt="" />`
  : `<div class="avatar initials" aria-hidden="true">${m.initials || (m.preview ? '<span class="ph">AB</span>' : '')}</div>`

const header = (m, extra = '') => `
  <header class="hd">${extra}
    <div class="hd-t">
      <h1 class="name">${m.name}</h1>
      <p class="title">${m.title}</p>
      ${B.contact(m)}
    </div>
  </header>`

const LAYOUT_HTML = {
  classic:   (m) => `${header(m)}<main class="body">${sections(m, ALL)}</main>`,
  minimal:   (m) => `${header(m)}<main class="body">${sections(m, ALL)}</main>`,
  modern:    (m) => `${header(m)}<div class="grid"><main class="main">${sections(m, MAIN)}</main><aside class="aside">${sections(m, SIDE, true)}</aside></div>`,
  executive: (m) => `${header(m)}<div class="grid"><main class="main">${sections(m, MAIN)}</main><aside class="aside">${sections(m, SIDE, true)}</aside></div>`,
  photo:     (m) => `${header(m, avatar(m))}<div class="grid"><main class="main">${sections(m, MAIN)}</main><aside class="aside">${sections(m, SIDE, true)}</aside></div>`,

  // ── creative ──
  // Name first in the HTML; the dark panel is drawn on the left by CSS.
  studio: (m) => `
    <div class="grid">
      <main class="main">
        <header class="hd"><h1 class="name">${m.name}</h1><p class="title">${m.title}</p></header>
        ${sections(m, ['profile', 'experience', 'projects', 'education'])}
      </main>
      <aside class="aside">
        ${avatar(m)}
        ${sections(m, ['contact', 'chips', 'langList', 'certifications'])}
      </aside>
    </div>`,

  elegant: (m) => `
    <header class="hd">
      <h1 class="name">${m.name}</h1>
      <p class="title">${m.title}</p>
      ${B.contact(m)}
      <div class="orn" aria-hidden="true"></div>
    </header>
    <main class="body">${sections(m, ALL)}</main>`,

  bold: (m) => `
    <header class="hd">
      <h1 class="name">${m.name}</h1>
      <p class="title">${m.title}</p>
      ${B.contact(m)}
    </header>
    <div class="grid">
      <main class="main">${sections(m, MAIN)}</main>
      <aside class="aside">${sections(m, ['chips', 'education', 'langList', 'certifications'])}</aside>
    </div>`,

  portrait: (m) => `
    <header class="hd">
      <div class="pic">${m.photo ? `<img src="${m.photo}" alt="" />` : `<span aria-hidden="true">${m.initials || (m.preview ? '<span class="ph">AB</span>' : '')}</span>`}</div>
      <div class="hd-t">
        <h1 class="name">${m.name}</h1>
        <p class="title">${m.title}</p>
        ${B.contactList(m)}
      </div>
    </header>
    <main class="body">
      ${sections(m, ['profile', 'timeline', 'projects'])}
      <div class="split">
        <div>${sections(m, ['education', 'certifications'])}</div>
        <div>${sections(m, ['chips', 'langList'])}</div>
      </div>
    </main>`,

  // Main column comes first in the HTML (what an ATS reads); CSS draws the sidebar on the left.
  sidebar: (m) => `
    <div class="grid">
      <main class="main">
        <header class="hd"><h1 class="name">${m.name}</h1><p class="title">${m.title}</p></header>
        ${sections(m, MAIN)}
      </main>
      <aside class="aside">
        ${m.photo ? avatar(m) : ''}
        ${sections(m, ['contact', ...SIDE], true)}
      </aside>
    </div>`,

  compact: (m) => `
    <header class="hd">
      <div class="hd-t"><h1 class="name">${m.name}</h1><p class="title">${m.title}</p></div>
      ${B.contactList(m)}
    </header>
    <main class="body">
      ${sections(m, MAIN)}
      <div class="split">
        <div>${sections(m, ['education', 'certifications'])}</div>
        <div>${sections(m, ['skills', 'languages'])}</div>
      </div>
    </main>`,

  timeline: (m) => `
    <header class="hd">
      <h1 class="name">${m.first || m.last ? `${m.first} <span class="accent">${m.last}</span>` : m.name}</h1>
      <p class="title">${m.title}</p>
      ${B.contact(m)}
    </header>
    <main class="body">${sections(m, ['profile', 'timeline', 'projects', 'education', 'skills', 'languages', 'certifications'])}</main>`,
}

// ── styles ────────────────────────────────────────────────────────────────────
// Scoped under .cvr so the preview (injected into the app) and the PDF share one stylesheet.
const BASE_CSS = `
.cvr{box-sizing:border-box;width:700px;min-height:990px;background:#fff;color:#1f2937;font-family:var(--font),'DM Sans',Arial,sans-serif;
  font-size:calc(10.5px*var(--s));line-height:var(--lh);-webkit-font-smoothing:antialiased;position:relative;
  display:flex;flex-direction:column;text-align:left;overflow-wrap:break-word;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.cvr *{box-sizing:border-box;margin:0;padding:0}
.cvr a{color:inherit;text-decoration:none}
.cvr strong{font-weight:600;color:#111827}
.cvr .ph{color:#9ca3af;font-style:italic;font-weight:400}
.cvr .muted{color:#6b7280}
.cvr .nw{white-space:nowrap}
.cvr .accent{color:var(--ac)}
.cvr .name{font-family:var(--hfont);font-weight:700;color:#111827;font-size:calc(30px*var(--s));line-height:1.12;letter-spacing:-.015em}
.cvr .title{color:var(--ac);font-weight:600;font-size:calc(12.4px*var(--s));margin-top:5px;letter-spacing:.01em}
.cvr .contact{color:#4b5563;font-size:calc(9.8px*var(--s));margin-top:9px;line-height:1.65}
.cvr .sep{color:#9ca3af}
.cvr .contact-list{list-style:none;font-size:calc(9.6px*var(--s));color:#4b5563;line-height:1.6}
.cvr .contact-list li{overflow-wrap:anywhere}
.cvr .sec{margin-top:var(--gap)}
.cvr .body > .sec:first-child,.cvr .main > .sec:first-child,.cvr .aside > .sec:first-child{margin-top:0}
.cvr .sec-h{font-family:var(--font);font-size:calc(9.4px*var(--s));font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--ac);margin-bottom:9px;line-height:1.3}
.cvr .prose,.cvr .inline,.cvr .bl{color:#374151}
.cvr .item{margin-bottom:calc(var(--gap)*.62)}
.cvr .item:last-child{margin-bottom:0}
.cvr .item-hd{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.cvr .item-t{font-family:var(--font);font-size:calc(11.3px*var(--s));font-weight:600;color:#111827;line-height:1.35}
.cvr .item-d{flex-shrink:0;white-space:nowrap;font-size:calc(9.6px*var(--s));color:#6b7280}
.cvr .item-s{font-weight:600;color:var(--acd);font-size:calc(10.3px*var(--s));margin-top:1px}
.cvr .item-m{color:#6b7280;font-size:calc(9.8px*var(--s));margin-top:1px}
.cvr .item-sm{margin-bottom:9px}
.cvr .item-sm .item-t{font-size:calc(10.6px*var(--s))}
.cvr .item > .prose,.cvr .item .bl,.cvr .tl-c > .prose{margin-top:4px}
.cvr .bl{padding-left:14px}
.cvr .bl li{margin-bottom:2px;padding-left:2px}
.cvr .bl li::marker{color:var(--ac)}
.cvr .list{list-style:none}
.cvr .list li{padding:2px 0;overflow-wrap:anywhere}
.cvr .avatar{width:84px;height:84px;border-radius:50%;object-fit:cover;flex-shrink:0;display:block}
.cvr .avatar.initials{display:flex;align-items:center;justify-content:center;background:var(--ac);color:#fff;font-weight:600;font-size:28px;font-family:var(--hfont)}
.cvr .grid{flex:1}
.cvr .chips{list-style:none;display:flex;flex-wrap:wrap;gap:5px}
.cvr .chips li{padding:3px 9px;border-radius:999px;background:var(--act);color:var(--acd);font-size:calc(9.6px*var(--s));font-weight:500;line-height:1.4}
`

const TWO_COL = (l) => `
.l-${l} .grid{display:grid;grid-template-columns:1fr 192px;gap:28px}
.l-${l} .aside{padding-left:22px;border-left:1px solid #e5e7eb}
.l-${l} .aside .sec{margin-top:calc(var(--gap)*.9)}
.l-${l} .aside .sec:first-child{margin-top:0}`

const LAYOUT_CSS = {
  classic: `
.l-classic{padding:46px 56px 40px}
.l-classic .hd{text-align:center;padding-bottom:18px;border-bottom:1.5px solid var(--ac);margin-bottom:22px}
.l-classic .name{font-size:calc(32px*var(--s));font-weight:400}
.l-classic .title{color:#4b5563;font-weight:500;text-transform:uppercase;letter-spacing:.14em;font-size:calc(10.2px*var(--s));margin-top:8px}
.l-classic .sec-h{color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:5px}`,

  modern: TWO_COL('modern') + `
.l-modern{border-top:6px solid var(--ac)}
.l-modern .hd{padding:32px 44px 22px}
.l-modern .grid{padding:4px 44px 36px}`,

  sidebar: `
.l-sidebar .grid{display:grid;grid-template-columns:208px 1fr;grid-template-areas:'aside main'}
.l-sidebar .main{grid-area:main;padding:40px 40px 36px 32px}
.l-sidebar .aside{grid-area:aside;background:var(--act);padding:40px 20px 36px 26px}
.l-sidebar .hd{margin-bottom:24px}
.l-sidebar .avatar{margin-bottom:22px}
.l-sidebar .aside .sec{margin-top:calc(var(--gap)*.95)}
.l-sidebar .aside > .sec:first-child,.l-sidebar .aside > .avatar + .sec{margin-top:0}
.l-sidebar .aside .sec-h{color:var(--acd)}`,

  minimal: `
.l-minimal{padding:48px 54px 40px}
.l-minimal .hd{padding-bottom:20px;margin-bottom:22px;border-bottom:1px solid #e5e7eb}
.l-minimal .name{font-weight:600;font-size:calc(28px*var(--s))}
.l-minimal .title{color:#4b5563;font-weight:500}
.l-minimal .sec{display:grid;grid-template-columns:112px 1fr;gap:18px}
.l-minimal .sec-h{margin:2px 0 0;font-size:calc(9px*var(--s))}`,

  executive: TWO_COL('executive') + `
.l-executive .hd{background:var(--acd);padding:36px 44px 28px;margin-bottom:28px}
.l-executive .name{color:#fff;font-weight:400;font-size:calc(32px*var(--s))}
.l-executive .title{color:var(--act);opacity:.9;font-weight:500;text-transform:uppercase;letter-spacing:.14em;font-size:calc(10.2px*var(--s));margin-top:8px}
.l-executive .contact{color:rgba(255,255,255,.85)}
.l-executive .contact .sep{color:rgba(255,255,255,.45)}
.l-executive .grid{padding:0 44px 36px}`,

  compact: `
.l-compact{padding:32px 40px 30px;--gap:calc(15px*var(--sp))}
.l-compact .hd{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding-bottom:14px;margin-bottom:16px;border-bottom:2px solid var(--ac)}
.l-compact .name{font-size:calc(26px*var(--s))}
.l-compact .title{margin-top:3px}
.l-compact .contact-list{text-align:right;flex-shrink:0;max-width:260px}
.l-compact .sec-h{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.l-compact .sec-h::after{content:'';flex:1;height:1px;background:#e5e7eb}
.l-compact .item{margin-bottom:9px}
.l-compact .split{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:var(--gap)}
.l-compact .split > div > .sec:first-child{margin-top:0}`,

  timeline: `
.l-timeline{padding:44px 50px 38px 56px;border-left:8px solid var(--ac)}
.l-timeline .hd{margin-bottom:26px}
.l-timeline .name{font-size:calc(34px*var(--s));font-weight:700;letter-spacing:-.025em}
.l-timeline .title{color:#4b5563;text-transform:uppercase;letter-spacing:.14em;font-size:calc(10.2px*var(--s));font-weight:600;margin-top:7px}
.l-timeline .sec-h{display:flex;align-items:center;gap:8px}
.l-timeline .sec-h::before{content:'';width:14px;height:3px;background:var(--ac);border-radius:2px}
.l-timeline .item.tl{display:grid;grid-template-columns:88px 1fr;gap:16px}
.l-timeline .tl-d{font-size:calc(9.4px*var(--s));color:#6b7280;padding-top:2px;line-height:1.35}
.l-timeline .tl-c{border-left:2px solid var(--act);padding-left:14px;position:relative}
.l-timeline .tl-c::before{content:'';position:absolute;left:-5px;top:5px;width:8px;height:8px;border-radius:50%;background:var(--ac)}`,

  photo: TWO_COL('photo') + `
.l-photo .hd{display:flex;align-items:center;gap:24px;padding:34px 44px 24px;margin-bottom:26px;background:var(--act);border-bottom:3px solid var(--ac)}
.l-photo .avatar{width:92px;height:92px;border:3px solid #fff}
.l-photo .grid{padding:0 44px 36px}`,

  // ── creative ──
  studio: `
.l-studio .grid{display:grid;grid-template-columns:236px 1fr;grid-template-areas:'aside main'}
.l-studio .main{grid-area:main;padding:48px 42px 36px 36px}
.l-studio .aside{grid-area:aside;background:var(--acd);color:rgba(255,255,255,.86);padding:44px 24px 36px 28px}
.l-studio .hd{margin-bottom:26px;padding-bottom:20px;border-bottom:3px solid var(--ac)}
.l-studio .name{font-size:calc(36px*var(--s));font-weight:800;letter-spacing:-.03em;line-height:1.02}
.l-studio .title{text-transform:uppercase;letter-spacing:.16em;font-size:calc(10.4px*var(--s));margin-top:10px}
.l-studio .avatar{width:124px;height:124px;margin:0 auto 26px;border:4px solid rgba(255,255,255,.14);font-size:40px;background:var(--ac)}
.l-studio .aside .sec{margin-top:calc(var(--gap)*1.05)}
.l-studio .aside .sec-h{color:#fff;letter-spacing:.18em;border-bottom:1px solid rgba(255,255,255,.18);padding-bottom:6px}
.l-studio .aside .contact-list{color:rgba(255,255,255,.86)}
.l-studio .aside .chips li{background:rgba(255,255,255,.12);color:#fff}
.l-studio .aside .list,.l-studio .aside strong,.l-studio .aside .inline,.l-studio .aside .prose{color:rgba(255,255,255,.86)}
.l-studio .aside .muted{color:rgba(255,255,255,.6)}`,

  elegant: `
.l-elegant{padding:58px 64px 50px;background:#fffdf9}
.l-elegant::before{content:'';position:absolute;inset:16px;border:1px solid color-mix(in srgb,var(--ac) 40%,transparent);pointer-events:none}
.l-elegant::after{content:'';position:absolute;inset:20px;border:1px solid color-mix(in srgb,var(--ac) 18%,transparent);pointer-events:none}
.l-elegant .hd{text-align:center;margin-bottom:26px}
.l-elegant .name{font-size:calc(38px*var(--s));font-weight:400;letter-spacing:.01em}
.l-elegant .title{color:var(--ac);font-weight:500;text-transform:uppercase;letter-spacing:.28em;font-size:calc(9.8px*var(--s));margin-top:10px}
.l-elegant .contact{margin-top:12px}
.l-elegant .orn{margin:18px auto 0;width:180px;height:9px;position:relative}
.l-elegant .orn::before{content:'';position:absolute;left:0;right:0;top:4px;height:1px;background:var(--ac);opacity:.6}
.l-elegant .orn::after{content:'';position:absolute;left:50%;top:0;width:8px;height:8px;margin-left:-4px;background:#fffdf9;border:1px solid var(--ac);transform:rotate(45deg)}
.l-elegant .sec-h{display:flex;align-items:center;gap:14px;justify-content:center;color:var(--acd);letter-spacing:.24em;font-weight:600;margin-bottom:12px}
.l-elegant .sec-h::before,.l-elegant .sec-h::after{content:'';flex:1;height:1px;background:color-mix(in srgb,var(--ac) 30%,transparent)}
.l-elegant .s-profile .prose,.l-elegant .s-skills .inline,.l-elegant .s-languages .inline{text-align:center}
.l-elegant .item-t{font-family:var(--hfont);font-weight:400;font-size:calc(13px*var(--s))}`,

  bold: `
.l-bold{counter-reset:sec}
.l-bold .hd{background:var(--ac);padding:46px 46px 34px;margin-bottom:30px}
.l-bold .name{color:#fff;font-size:calc(46px*var(--s));font-weight:800;letter-spacing:-.04em;line-height:.98}
.l-bold .title{color:rgba(255,255,255,.8);font-weight:600;font-size:calc(13px*var(--s));margin-top:12px}
.l-bold .contact{color:rgba(255,255,255,.88);margin-top:14px}
.l-bold .contact .sep{color:rgba(255,255,255,.5)}
.l-bold .grid{display:grid;grid-template-columns:1fr 196px;gap:30px;padding:0 46px 36px}
.l-bold .sec-h{display:flex;align-items:baseline;gap:10px;color:#111827;font-size:calc(11px*var(--s));letter-spacing:.1em;margin-bottom:11px}
.l-bold .sec-h::before{counter-increment:sec;content:counter(sec,decimal-leading-zero);font-size:calc(20px*var(--s));font-weight:800;color:var(--ac);letter-spacing:-.02em}
.l-bold .aside .sec{margin-top:calc(var(--gap)*.9)}
.l-bold .aside .sec:first-child{margin-top:0}`,

  portrait: `
.l-portrait .hd{display:grid;grid-template-columns:230px 1fr;min-height:230px;background:var(--act)}
.l-portrait .pic{background:var(--ac);display:flex;align-items:center;justify-content:center;overflow:hidden}
.l-portrait .pic img{width:100%;height:100%;object-fit:cover;display:block}
.l-portrait .pic > span{color:#fff;font-family:var(--hfont);font-size:64px;font-weight:700;letter-spacing:-.02em}
.l-portrait .hd-t{padding:34px 42px;display:flex;flex-direction:column;justify-content:center}
.l-portrait .name{font-size:calc(36px*var(--s));font-weight:800;letter-spacing:-.03em;line-height:1.02}
.l-portrait .title{margin-top:8px;margin-bottom:14px}
.l-portrait .body{padding:30px 44px 36px}
.l-portrait .item.tl{display:grid;grid-template-columns:86px 1fr;gap:16px}
.l-portrait .tl-d{font-size:calc(9.4px*var(--s));color:#6b7280;padding-top:2px;line-height:1.35}
.l-portrait .tl-c{border-left:2px solid var(--act);padding-left:14px;position:relative}
.l-portrait .tl-c::before{content:'';position:absolute;left:-5px;top:5px;width:8px;height:8px;border-radius:50%;background:var(--ac)}
.l-portrait .split{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:var(--gap)}
.l-portrait .split > div > .sec:first-child{margin-top:0}`,
}

const SERIF_HEADINGS = new Set(['classic', 'executive', 'elegant'])

// ── render ────────────────────────────────────────────────────────────────────
// render(templateId, data, fmt, { preview }) → HTML string whose root is the page.
// `preview: true` shows muted placeholders for empty fields (editor only, never exported).
export function render(tpl, rawData, fmt = {}, opts = {}) {
  const { layout, theme } = parseTemplate(tpl)
  const t = themeById[theme]
  const m = buildModel(rawData, !!opts.preview)

  const font  = FONTS.some(f => f.id === fmt.fontFamily) ? fmt.fontFamily : 'DM Sans'
  const scale = fmt.fontSize === 'small' ? 0.93 : fmt.fontSize === 'large' ? 1.07 : 1
  const lh    = fmt.lineSpacing === 'compact' ? 1.42 : fmt.lineSpacing === 'relaxed' ? 1.68 : 1.55
  const sp    = fmt.sectionSpacing === 'compact' ? 0.78 : fmt.sectionSpacing === 'relaxed' ? 1.22 : 1
  const hfont = SERIF_HEADINGS.has(layout) && font !== 'Lora' ? "'DM Serif Display',Georgia,serif" : `'${font}'`

  const vars = [
    `--ac:${t.accent}`, `--acd:${t.dark}`, `--act:${t.tint}`,
    `--font:'${font}'`, `--hfont:${hfont}`,
    `--s:${scale}`, `--lh:${lh}`, `--sp:${sp}`, `--gap:calc(20px*${sp})`,
  ].join(';')

  return `<div class="cvr l-${layout}" data-cv-root data-template="${layout}:${theme}" lang="${m.lang}" style="${vars}">`
    // Layout rules get .cvr.l-x so they always beat the base rules, even when several
    // CVs (e.g. thumbnails) put their stylesheets on the same page
    + `<style>${BASE_CSS}${LAYOUT_CSS[layout].replace(/\.l-/g, '.cvr.l-')}</style>`
    + LAYOUT_HTML[layout](m)
    + `</div>`
}

// Kept for existing callers: `const { render } = useCvRenderer()`
export function useCvRenderer() {
  return { render }
}
