// The second set of CV layouts (38 of the 50). Same rules as the first 12 in cvRenderer.js:
// every layout is built from the shared section blocks, keeps an ATS-safe reading order
// (name → contact → profile → experience … in the HTML) and draws on a 700 × 990 px page.
// CSS here is written as `.l-<id>`; render() turns it into `.cvr.l-<id>`, so never use a
// class name that starts with "l-".

export const MORE_LAYOUTS = [
  // ── ATS-friendly ──
  { id: 'standard',   kind: 'ats', name: 'Standard',   theme: 'charcoal', desc: 'The plainest, most compatible layout — bold headings with full rules' },
  { id: 'harvard',    kind: 'ats', name: 'Harvard',    theme: 'charcoal', hfont: 'EB Garamond', desc: 'Traditional résumé: centred Garamond name, ruled sections' },
  { id: 'corporate',  kind: 'ats', name: 'Corporate',  theme: 'blue',     hfont: 'Manrope', desc: 'Name left, contact right, double rule, accent-bar headings' },
  { id: 'swiss',      kind: 'ats', name: 'Swiss',      theme: 'crimson',  hfont: 'Space Grotesk', desc: 'Big grotesk name, headings in a left grid column' },
  { id: 'banner',     kind: 'ats', name: 'Banner',     theme: 'teal',     hfont: 'Outfit', desc: 'Soft tinted header band with the contact strip underneath' },
  { id: 'ledger',     kind: 'ats', name: 'Ledger',     theme: 'emerald',  hfont: 'Manrope', desc: 'Full-width header, tinted column on the right' },
  { id: 'mono',       kind: 'ats', name: 'Developer',  theme: 'emerald',  hfont: 'Space Grotesk', desc: 'Code-style labels in a monospace font — for tech roles' },
  { id: 'clarity',    kind: 'ats', name: 'Clarity',    theme: 'indigo',   hfont: 'Manrope', desc: 'Section names in soft pills, lots of air' },
  { id: 'margin',     kind: 'ats', name: 'Margin',     theme: 'plum',     hfont: 'Outfit', desc: 'A quiet accent line runs beside every section' },
  { id: 'statement',  kind: 'ats', name: 'Statement',  theme: 'amber',    hfont: 'Manrope', desc: 'Very large name, contact details in a neat grid' },
  { id: 'graduate',   kind: 'ats', name: 'Graduate',   theme: 'sky',      hfont: 'Outfit', desc: 'Education and projects first — for students and first jobs' },
  { id: 'technical',  kind: 'ats', name: 'Technical',  theme: 'blue',     hfont: 'Space Grotesk', desc: 'Skills grid up front, then experience — for engineers' },
  { id: 'consultant', kind: 'ats', name: 'Consultant', theme: 'burgundy', hfont: 'Playfair Display', desc: 'Highlighted profile box and a core-skills grid' },
  { id: 'scholar',    kind: 'ats', name: 'Scholar',    theme: 'slate',    hfont: 'Playfair Display', desc: 'Serif headings and an accent rule under the name' },
  { id: 'outline',    kind: 'ats', name: 'Outline',    theme: 'teal',     desc: 'Framed header and outlined section labels' },
  { id: 'overview',   kind: 'ats', name: 'Overview',   theme: 'indigo',   hfont: 'Manrope', desc: 'Contact, skills and languages in one strip at the top' },
  { id: 'airy',       kind: 'ats', name: 'Airy',       theme: 'slate',    hfont: 'Outfit', desc: 'Light name, grey labels, generous spacing' },
  { id: 'nordic',     kind: 'ats', name: 'Nordic',     theme: 'sky',      hfont: 'Manrope', desc: 'Pale grey header, calm two-column body' },

  // ── creative ──
  { id: 'aurora',     kind: 'creative', name: 'Aurora',   theme: 'plum',     hfont: 'Outfit', desc: 'Gradient header with a floating content card' },
  { id: 'magazine',   kind: 'creative', name: 'Magazine', theme: 'crimson',  hfont: 'Playfair Display', desc: 'Editorial: stacked serif name, bold rules, italic profile' },
  { id: 'neo',        kind: 'creative', name: 'Neo',      theme: 'indigo',   hfont: 'Space Grotesk', desc: 'Neo-brutalist boxes with hard offset shadows' },
  { id: 'pastel',     kind: 'creative', name: 'Pastel',   theme: 'rose',     hfont: 'Outfit', desc: 'Soft tinted page with white rounded cards' },
  { id: 'ribbon',     kind: 'creative', name: 'Ribbon',   theme: 'rose',     desc: 'Section names on colour ribbons from the page edge' },
  { id: 'circle',     kind: 'creative', name: 'Circle',   theme: 'emerald',  hfont: 'Playfair Display', photo: true, desc: 'Round photo centred above your name' },
  { id: 'duo',        kind: 'creative', name: 'Duo',      theme: 'blue',     hfont: 'Space Grotesk', desc: 'Bold colour column holds your name and profile' },
  { id: 'diagonal',   kind: 'creative', name: 'Diagonal', theme: 'sky',      hfont: 'Outfit', desc: 'Angled dark header, two columns' },
  { id: 'zen',        kind: 'creative', name: 'Zen',      theme: 'emerald',  hfont: 'Outfit', desc: 'Whisper-light type, dotted headings, lots of space' },
  { id: 'journey',    kind: 'creative', name: 'Journey',  theme: 'indigo',   hfont: 'Manrope', desc: 'Numbered stops along one line down the page' },
  { id: 'blocks',     kind: 'creative', name: 'Blocks',   theme: 'amber',    hfont: 'Space Grotesk', desc: 'Two-tone header blocks, square markers' },
  { id: 'deco',       kind: 'creative', name: 'Deco',     theme: 'amber',    hfont: 'Playfair Display', desc: 'Dark header with a fine inner frame, spaced capitals' },
  { id: 'column',     kind: 'creative', name: 'Column',   theme: 'teal',     hfont: 'Outfit', photo: true, desc: 'Colour column on the right with photo and skill tags' },
  { id: 'headline',   kind: 'creative', name: 'Headline', theme: 'crimson',  hfont: 'Space Grotesk', desc: 'Huge name with a highlighter stroke' },
  { id: 'frame',      kind: 'creative', name: 'Frame',    theme: 'indigo',   hfont: 'Manrope', desc: 'Thick colour frame around the whole page' },
  { id: 'monogram',   kind: 'creative', name: 'Monogram', theme: 'burgundy', hfont: 'Playfair Display', desc: 'Your initials in a crest beside a serif name' },
  { id: 'bento',      kind: 'creative', name: 'Bento',    theme: 'plum',     hfont: 'Space Grotesk', photo: true, desc: 'Header built from tiles, sections in cards' },
  { id: 'wave',       kind: 'creative', name: 'Wave',     theme: 'sky',      hfont: 'Outfit', desc: 'Curved colour header, centred name' },
  { id: 'polaroid',   kind: 'creative', name: 'Polaroid', theme: 'amber',    photo: true, desc: 'Your photo as a tilted instant print' },
  { id: 'mosaic',     kind: 'creative', name: 'Mosaic',   theme: 'emerald',  hfont: 'Manrope', desc: 'Sections as cards with colour title bars' },
]

// Builds the HTML functions with the shared helpers from cvRenderer.js
export function moreLayoutHtml({ sections, B, header, avatar, ALL, MAIN, SIDE }) {
  const nameTitle = (m) => `<h1 class="name">${m.name}</h1><p class="title">${m.title}</p>`
  const single = (m, keys = ALL) => `${header(m)}<main class="body">${sections(m, keys)}</main>`
  const twoCol = (m, side = SIDE, sideFlag = true, main = MAIN) =>
    `<div class="grid"><main class="main">${sections(m, main)}</main><aside class="aside">${sections(m, side, sideFlag)}</aside></div>`
  const CREATIVE_SIDE = ['chips', 'education', 'langList', 'certifications']
  const photoOrInitials = (m) => m.photo
    ? `<img src="${m.photo}" alt="" />`
    : `<span aria-hidden="true">${m.initials || (m.preview ? '<span class="ph">AB</span>' : '')}</span>`

  return {
    // ── ATS ──
    standard:  (m) => single(m),
    harvard:   (m) => single(m),
    corporate: (m) => `
      <header class="hd"><div class="hd-t">${nameTitle(m)}</div>${B.contactList(m)}</header>
      <main class="body">${sections(m, ALL)}</main>`,
    swiss:     (m) => single(m),
    banner:    (m) => single(m),
    ledger:    (m) => `${header(m)}${twoCol(m)}`,
    mono:      (m) => single(m, ['profile', 'experience', 'projects', 'chips', 'education', 'languages', 'certifications']),
    clarity:   (m) => single(m),
    margin:    (m) => single(m),
    statement: (m) => `
      <header class="hd">${nameTitle(m)}${B.contactList(m)}</header>
      <main class="body">${sections(m, ALL)}</main>`,
    graduate:  (m) => `
      <header class="hd"><div class="hd-t">${nameTitle(m)}</div>${B.contactList(m)}</header>
      <main class="body">${sections(m, ['profile', 'education', 'projects', 'experience', 'skills', 'languages', 'certifications'])}</main>`,
    technical: (m) => single(m, ['profile', 'skillsGrid', 'experience', 'projects', 'education', 'languages', 'certifications']),
    consultant:(m) => single(m, ['profile', 'skillsGrid', 'experience', 'projects', 'education', 'languages', 'certifications']),
    scholar:   (m) => single(m),
    outline:   (m) => single(m),
    overview:  (m) => `
      <header class="hd">${nameTitle(m)}</header>
      <div class="strip">${sections(m, ['contact', 'skills', 'languages'], true)}</div>
      <main class="body">${sections(m, ['profile', 'experience', 'projects', 'education', 'certifications'])}</main>`,
    airy:      (m) => single(m),
    nordic:    (m) => `${header(m)}${twoCol(m)}`,

    // ── creative ──
    aurora:   (m) => `${header(m)}<div class="card">${twoCol(m, CREATIVE_SIDE, false)}</div>`,
    magazine: (m) => `
      <header class="hd">
        <h1 class="name">${m.first || m.last ? `<span>${m.first}</span> <span class="accent">${m.last}</span>` : m.name}</h1>
        <p class="title">${m.title}</p>
        ${B.contact(m)}
      </header>
      ${sections(m, ['profile'])}
      ${twoCol(m, CREATIVE_SIDE, false, ['experience', 'projects'])}`,
    neo:      (m) => `${header(m)}${twoCol(m, CREATIVE_SIDE, false)}`,
    pastel:   (m) => `${header(m)}${twoCol(m, CREATIVE_SIDE, false)}`,
    ribbon:   (m) => single(m, ['profile', 'experience', 'projects', 'education', 'chips', 'languages', 'certifications']),
    circle:   (m) => `
      <header class="hd">${avatar(m)}${nameTitle(m)}${B.contact(m)}</header>
      ${sections(m, ['profile'])}
      <div class="grid"><main class="main">${sections(m, ['experience', 'projects'])}</main><aside class="aside">${sections(m, CREATIVE_SIDE)}</aside></div>`,
    duo:      (m) => `
      <div class="grid">
        <aside class="aside"><header class="hd">${nameTitle(m)}</header>${sections(m, ['profile', 'contact', 'langList'])}</aside>
        <main class="main">${sections(m, ['experience', 'projects', 'education', 'chips', 'certifications'])}</main>
      </div>`,
    diagonal: (m) => `${header(m)}${twoCol(m, CREATIVE_SIDE, false)}`,
    zen:      (m) => single(m, ['profile', 'experience', 'projects', 'education', 'skills', 'languages', 'certifications']),
    journey:  (m) => single(m, ['profile', 'timeline', 'projects', 'education', 'chips', 'languages', 'certifications']),
    blocks:   (m) => `
      <header class="hd"><div class="hd-t">${nameTitle(m)}</div><div class="hd-c">${B.contactList(m)}</div></header>
      ${twoCol(m, CREATIVE_SIDE, false)}`,
    deco:     (m) => `${header(m)}${twoCol(m, CREATIVE_SIDE, false)}`,
    column:   (m) => `
      <div class="grid">
        <main class="main"><header class="hd">${nameTitle(m)}</header>${sections(m, ['profile', 'experience', 'projects', 'education'])}</main>
        <aside class="aside"><div class="pic">${photoOrInitials(m)}</div>${sections(m, ['contact', 'chips', 'langList', 'certifications'])}</aside>
      </div>`,
    headline: (m) => single(m, ['profile', 'experience', 'projects', 'education', 'chips', 'languages', 'certifications']),
    frame:    (m) => `${header(m)}${twoCol(m, CREATIVE_SIDE, false)}`,
    monogram: (m) => `
      <header class="hd">
        <div class="mono-mark" aria-hidden="true">${m.initials || (m.preview ? '<span class="ph">AB</span>' : '')}</div>
        <div class="hd-t">${nameTitle(m)}${B.contact(m)}</div>
      </header>
      <main class="body">${sections(m, ALL)}</main>`,
    bento:    (m) => `
      <header class="hd">
        <div class="tile t-name">${nameTitle(m)}</div>
        <div class="tile t-pic">${photoOrInitials(m)}</div>
        <div class="tile t-contact">${B.contactList(m)}</div>
      </header>
      ${twoCol(m, CREATIVE_SIDE, false)}`,
    wave:     (m) => `${header(m)}${twoCol(m, CREATIVE_SIDE, false)}`,
    polaroid: (m) => `
      <header class="hd">
        <div class="hd-t">${nameTitle(m)}${B.contactList(m)}</div>
        <div class="print"><div class="print-pic">${photoOrInitials(m)}</div></div>
      </header>
      <main class="body">${sections(m, ['profile', 'experience', 'projects', 'education', 'chips', 'languages', 'certifications'])}</main>`,
    mosaic:   (m) => `
      <header class="hd"><div class="hd-t">${nameTitle(m)}</div>${B.contactList(m)}</header>
      ${twoCol(m, CREATIVE_SIDE, false)}`,
  }
}

const TWO = (l, side = 190, gap = 28) => `
.l-${l} .grid{display:grid;grid-template-columns:1fr ${side}px;gap:${gap}px}
.l-${l} .aside .sec{margin-top:calc(var(--gap)*.9)}
.l-${l} .aside .sec:first-child{margin-top:0}`

export const MORE_LAYOUT_CSS = {
  // ── ATS ──────────────────────────────────────────────────────────────────────
  standard: `
.l-standard{padding:44px 52px 40px}
.l-standard .hd{margin-bottom:20px}
.l-standard .name{font-size:calc(28px*var(--s))}
.l-standard .title{color:#374151}
.l-standard .sec-h{color:#111827;font-size:calc(10.4px*var(--s));letter-spacing:.08em;border-bottom:1.5px solid #111827;padding-bottom:4px;margin-bottom:8px}
.l-standard .item-s{color:#374151}`,

  harvard: `
.l-harvard{padding:44px 56px 40px}
.l-harvard .hd{text-align:center;margin-bottom:18px}
.l-harvard .name{font-size:calc(30px*var(--s));font-weight:500;text-transform:uppercase;letter-spacing:.07em}
.l-harvard .title{font-family:var(--hfont);color:#374151;font-weight:500;font-size:calc(13px*var(--s));font-style:italic;margin-top:4px}
.l-harvard .contact{margin-top:6px}
.l-harvard .sec-h{font-family:var(--hfont);color:#111827;font-size:calc(13px*var(--s));font-weight:600;letter-spacing:.09em;border-bottom:1px solid #111827;padding-bottom:3px;margin-bottom:8px}
.l-harvard .item-t{font-family:var(--hfont);font-size:calc(13px*var(--s));font-weight:600}
.l-harvard .item-s{font-family:var(--hfont);font-style:italic;font-weight:500;color:#374151;font-size:calc(12px*var(--s))}
.l-harvard .bl li::marker{color:#111827}`,

  corporate: `
.l-corporate{padding:42px 50px 38px}
.l-corporate .hd{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding-bottom:16px;margin-bottom:22px;border-bottom:4px double var(--ac)}
.l-corporate .name{font-weight:800;font-size:calc(30px*var(--s));letter-spacing:-.02em}
.l-corporate .contact-list{text-align:right;flex-shrink:0;max-width:250px}
.l-corporate .sec-h{font-family:var(--hfont);color:#111827;font-size:calc(10.6px*var(--s));letter-spacing:.1em;border-left:3px solid var(--ac);padding-left:9px;margin-bottom:10px}`,

  swiss: `
.l-swiss{padding:50px 50px 40px}
.l-swiss .hd{padding-bottom:22px;margin-bottom:6px;border-bottom:3px solid #111827}
.l-swiss .name{font-size:calc(44px*var(--s));letter-spacing:-.04em;line-height:1}
.l-swiss .title{font-family:var(--hfont);font-size:calc(14px*var(--s));margin-top:10px}
.l-swiss .sec{display:grid;grid-template-columns:140px 1fr;gap:20px;padding-top:14px;border-top:1px solid #e5e7eb;margin-top:14px}
.l-swiss .body > .sec:first-child{border-top:none}
.l-swiss .sec-h{font-family:var(--hfont);text-transform:none;letter-spacing:-.01em;font-size:calc(13px*var(--s));color:#111827;margin:0}
.l-swiss .item-t{font-family:var(--hfont)}`,

  banner: `
.l-banner .hd{background:var(--act);padding:36px 48px 0}
.l-banner .name{font-weight:600;font-size:calc(32px*var(--s));color:var(--acd);letter-spacing:-.01em}
.l-banner .contact{margin-top:18px;padding:11px 0 12px;border-top:1px solid color-mix(in srgb,var(--ac) 22%,transparent)}
.l-banner .body{padding:28px 48px 36px}
.l-banner .sec-h{font-family:var(--hfont);font-weight:600;color:var(--acd);letter-spacing:.1em;padding-bottom:6px;border-bottom:2px solid var(--act)}`,

  ledger: TWO('ledger', 206, 0) + `
.l-ledger .hd{padding:38px 46px 24px;border-bottom:1px solid #e5e7eb}
.l-ledger .name{font-weight:800;letter-spacing:-.02em}
.l-ledger .main{padding:26px 30px 36px 46px}
.l-ledger .aside{background:var(--act);padding:26px 24px 36px}
.l-ledger .aside .sec-h{color:var(--acd)}`,

  mono: `
.l-mono{padding:46px 50px 40px}
.l-mono .hd{margin-bottom:24px}
.l-mono .name{font-size:calc(34px*var(--s));letter-spacing:-.03em}
.l-mono .title{font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:calc(11px*var(--s));margin-top:8px}
.l-mono .title::before{content:'> ';color:#9ca3af}
.l-mono .contact{font-family:'IBM Plex Mono',monospace;font-size:calc(9px*var(--s))}
.l-mono .sec-h{font-family:'IBM Plex Mono',monospace;text-transform:lowercase;letter-spacing:0;font-size:calc(11px*var(--s));font-weight:500}
.l-mono .sec-h::before{content:'// ';color:#9ca3af}
.l-mono .item-d,.l-mono .item-m{font-family:'IBM Plex Mono',monospace;font-size:calc(9px*var(--s))}
.l-mono .chips li{font-family:'IBM Plex Mono',monospace;border-radius:4px;background:#fff;border:1px solid color-mix(in srgb,var(--ac) 35%,transparent);font-size:calc(9px*var(--s))}`,

  clarity: `
.l-clarity{padding:46px 52px 40px}
.l-clarity .hd{margin-bottom:24px}
.l-clarity .name{font-weight:800;font-size:calc(34px*var(--s));letter-spacing:-.03em}
.l-clarity .sec-h{display:inline-block;background:var(--act);color:var(--acd);padding:4px 12px;border-radius:99px;letter-spacing:.1em;margin-bottom:10px}`,

  margin: `
.l-margin{padding:46px 52px 40px}
.l-margin .hd{margin-bottom:24px}
.l-margin .name{font-weight:600;font-size:calc(32px*var(--s))}
.l-margin .name::after{content:'';display:block;width:48px;height:3px;background:var(--ac);border-radius:2px;margin-top:12px}
.l-margin .title{margin-top:12px}
.l-margin .sec{border-left:2px solid var(--act);padding-left:18px}
.l-margin .sec-h{margin-left:-20px;padding-left:18px;border-left:2px solid var(--ac);font-family:var(--hfont);font-weight:600}`,

  statement: `
.l-statement{padding:46px 50px 40px}
.l-statement .name{font-weight:800;font-size:calc(48px*var(--s));letter-spacing:-.045em;line-height:.98}
.l-statement .title{font-family:var(--hfont);font-size:calc(14px*var(--s));margin-top:10px}
.l-statement .contact-list{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 18px;margin:18px 0 24px;padding:11px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb}
.l-statement .sec-h{color:#111827;letter-spacing:.1em}
.l-statement .sec-h::after{content:'';display:block;width:26px;height:2px;background:var(--ac);margin-top:6px}`,

  graduate: `
.l-graduate{padding:42px 50px 38px}
.l-graduate .hd{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:22px}
.l-graduate .name{font-weight:700;font-size:calc(32px*var(--s))}
.l-graduate .contact-list{text-align:right;flex-shrink:0;max-width:250px}
.l-graduate .sec-h{font-family:var(--hfont);font-weight:600;letter-spacing:.1em;padding-bottom:5px;border-bottom:2px solid var(--ac)}
.l-graduate .s-education .item-t{font-size:calc(11.3px*var(--s))}`,

  technical: `
.l-technical{padding:44px 50px 38px}
.l-technical .hd{padding-bottom:18px;margin-bottom:22px;border-bottom:1px solid #d1d5db}
.l-technical .name{font-size:calc(32px*var(--s));letter-spacing:-.03em}
.l-technical .title{font-family:var(--hfont)}
.l-technical .sec-h{font-family:var(--hfont);letter-spacing:.08em}
.l-technical .sgrid li::before{content:'';display:inline-block;width:5px;height:5px;background:var(--ac);margin:0 7px 2px 0}`,

  consultant: `
.l-consultant{padding:44px 52px 40px}
.l-consultant .hd{margin-bottom:22px}
.l-consultant .name{font-size:calc(34px*var(--s));font-weight:700}
.l-consultant .title{text-transform:uppercase;letter-spacing:.14em;font-size:calc(10px*var(--s))}
.l-consultant .s-profile .sec-b{background:var(--act);border-left:3px solid var(--ac);padding:12px 16px;border-radius:0 6px 6px 0}
.l-consultant .sec-h{font-family:var(--hfont);text-transform:none;letter-spacing:0;font-size:calc(15px*var(--s));color:var(--acd)}
.l-consultant .sgrid li::before{content:'✓';color:var(--ac);font-weight:700;margin-right:7px}`,

  scholar: `
.l-scholar{padding:48px 56px 40px}
.l-scholar .hd{margin-bottom:22px}
.l-scholar .name{font-size:calc(36px*var(--s));font-weight:600}
.l-scholar .name::after{content:'';display:block;width:60px;height:2px;background:var(--ac);margin-top:12px}
.l-scholar .title{margin-top:12px;font-variant:small-caps;letter-spacing:.06em;font-size:calc(13px*var(--s))}
.l-scholar .sec-h{font-family:var(--hfont);text-transform:none;letter-spacing:0;font-size:calc(15px*var(--s));font-weight:600;color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
.l-scholar .item-d{font-variant:small-caps}`,

  outline: `
.l-outline{padding:40px 48px 38px}
.l-outline .hd{border:1.5px solid var(--ac);border-radius:4px;padding:22px 26px;margin-bottom:24px}
.l-outline .sec-h{display:inline-block;border:1px solid var(--ac);border-radius:3px;padding:3px 10px;margin-bottom:10px}`,

  overview: `
.l-overview{padding:42px 48px 38px}
.l-overview .name{font-weight:800;font-size:calc(34px*var(--s));letter-spacing:-.03em}
.l-overview .hd{margin-bottom:18px}
.l-overview .strip{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:22px;background:var(--act);border-radius:10px;padding:16px 20px;margin-bottom:24px}
.l-overview .strip .sec{margin-top:0}
.l-overview .strip .sec-h{color:var(--acd)}`,

  airy: `
.l-airy{padding:58px 72px 48px;--gap:calc(26px*var(--sp))}
.l-airy .hd{margin-bottom:30px}
.l-airy .name{font-weight:300;font-size:calc(38px*var(--s));letter-spacing:-.01em}
.l-airy .title{font-weight:500;margin-top:8px}
.l-airy .sec-h{font-family:var(--hfont);font-weight:500;color:#9ca3af;letter-spacing:.2em;display:flex;align-items:center;gap:8px}
.l-airy .sec-h::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ac)}`,

  nordic: `
.l-nordic .grid{display:grid;grid-template-columns:200px 1fr;grid-template-areas:'aside main'}
.l-nordic .aside .sec{margin-top:calc(var(--gap)*.9)}
.l-nordic .aside .sec:first-child{margin-top:0}
.l-nordic .hd{background:#f3f4f6;padding:38px 46px 28px}
.l-nordic .name{font-weight:300;font-size:calc(34px*var(--s))}
.l-nordic .main{grid-area:main;padding:28px 46px 36px 28px}
.l-nordic .aside{grid-area:aside;padding:28px 0 36px 46px}
.l-nordic .aside .sec-h{color:#6b7280}`,

  // ── creative ─────────────────────────────────────────────────────────────────
  aurora: TWO('aurora', 180, 26) + `
.l-aurora .hd{background:linear-gradient(135deg,var(--ac),var(--acd));padding:46px 50px 74px}
.l-aurora .name{color:#fff;font-weight:700;font-size:calc(40px*var(--s));letter-spacing:-.03em}
.l-aurora .title{color:rgba(255,255,255,.85);font-weight:500}
.l-aurora .contact{color:rgba(255,255,255,.85)}
.l-aurora .contact .sep{color:rgba(255,255,255,.45)}
.l-aurora .card{flex:1;margin:-44px 30px 30px;background:#fff;border-radius:14px;box-shadow:0 10px 30px rgba(17,24,39,.1);padding:28px 30px}`,

  magazine: TWO('magazine', 186, 26) + `
.l-magazine{padding:44px 48px 38px}
.l-magazine .hd{padding-bottom:14px;border-bottom:4px solid #111827;margin-bottom:3px}
.l-magazine .name{font-weight:900;font-size:calc(52px*var(--s));letter-spacing:-.02em;line-height:.95}
.l-magazine .name span{display:block}
.l-magazine .title{text-transform:uppercase;letter-spacing:.2em;font-size:calc(10px*var(--s));color:#111827;margin-top:12px}
.l-magazine > .s-profile{border-top:1px solid #111827;padding-top:14px;margin:0 0 22px}
.l-magazine > .s-profile .sec-h{display:none}
.l-magazine > .s-profile .prose{font-family:var(--hfont);font-style:italic;font-size:calc(13.5px*var(--s));line-height:1.5;color:#1f2937}
.l-magazine .aside{border-left:1px solid #e5e7eb;padding-left:20px}
.l-magazine .sec-h{font-family:var(--hfont);text-transform:none;letter-spacing:0;font-size:calc(16px*var(--s));font-weight:700;color:#111827;border-top:2px solid #111827;padding-top:6px}`,

  neo: TWO('neo', 196, 20) + `
.l-neo{padding:34px 36px;background:#fafaf9}
.l-neo .hd{border:2.5px solid #111827;box-shadow:6px 6px 0 var(--ac);background:#fff;padding:22px 24px;margin-bottom:26px}
.l-neo .name{font-size:calc(36px*var(--s));text-transform:uppercase;letter-spacing:-.02em}
.l-neo .title{color:#111827;font-family:var(--hfont)}
.l-neo .sec{border:2px solid #111827;background:#fff;box-shadow:4px 4px 0 #111827;padding:14px 16px;margin-top:18px}
.l-neo .main > .sec:first-child,.l-neo .aside > .sec:first-child{margin-top:0}
.l-neo .aside .sec{margin-top:18px}
.l-neo .sec-h{display:inline-block;background:var(--ac);color:#fff;padding:3px 8px;letter-spacing:.08em;font-family:var(--hfont)}
.l-neo .chips li{border-radius:0;background:#fff;border:1.5px solid #111827;color:#111827}`,

  pastel: TWO('pastel', 196, 16) + `
.l-pastel{background:var(--act);padding:40px 34px 32px}
.l-pastel .hd{padding:0 10px 24px}
.l-pastel .name{font-weight:700;font-size:calc(36px*var(--s));color:var(--acd);letter-spacing:-.02em}
.l-pastel .sec{background:#fff;border-radius:14px;padding:16px 18px;margin-top:14px;box-shadow:0 1px 2px rgba(17,24,39,.05)}
.l-pastel .main > .sec:first-child,.l-pastel .aside > .sec:first-child{margin-top:0}
.l-pastel .aside .sec{margin-top:14px}
.l-pastel .sec-h{font-family:var(--hfont);font-weight:600;color:var(--acd)}
.l-pastel .chips li{background:var(--act)}`,

  ribbon: `
.l-ribbon{padding:44px 50px 40px}
.l-ribbon .hd{margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid #e5e7eb}
.l-ribbon .name{font-size:calc(36px*var(--s))}
.l-ribbon .sec-h{display:inline-block;background:var(--ac);color:#fff;margin-left:-50px;padding:5px 16px 5px 50px;border-radius:0 99px 99px 0;letter-spacing:.12em;margin-bottom:11px}`,

  circle: TWO('circle', 190, 28) + `
.l-circle{padding:40px 48px 38px}
.l-circle .hd{text-align:center;margin-bottom:20px}
.l-circle .avatar{width:118px;height:118px;margin:0 auto 16px;border:4px solid var(--act);font-size:38px}
.l-circle .name{font-size:calc(34px*var(--s));font-weight:700}
.l-circle .title{text-transform:uppercase;letter-spacing:.18em;font-size:calc(10px*var(--s));margin-top:8px}
.l-circle > .s-profile{text-align:center;padding:14px 30px 18px;margin:0 0 22px;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb}
.l-circle > .s-profile .sec-h{display:none}
.l-circle .sec-h{font-family:var(--hfont);text-transform:none;letter-spacing:0;font-size:calc(14px*var(--s));color:var(--acd)}`,

  duo: `
.l-duo .grid{display:grid;grid-template-columns:250px 1fr}
.l-duo .aside{background:var(--ac);color:rgba(255,255,255,.9);padding:46px 26px 36px 30px}
.l-duo .hd{margin-bottom:26px}
.l-duo .name{color:#fff;font-size:calc(34px*var(--s));letter-spacing:-.03em;line-height:1.02}
.l-duo .title{color:rgba(255,255,255,.8);margin-top:10px}
.l-duo .aside .sec{margin-top:calc(var(--gap)*1.1)}
.l-duo .aside .sec-h{color:#fff;opacity:.75}
.l-duo .aside .prose,.l-duo .aside .contact-list,.l-duo .aside .list,.l-duo .aside strong,.l-duo .aside .inline{color:rgba(255,255,255,.92)}
.l-duo .aside .muted{color:rgba(255,255,255,.65)}
.l-duo .main{padding:46px 40px 36px 34px}
.l-duo .main > .sec:first-child{margin-top:0}
.l-duo .sec-h{font-family:var(--hfont)}`,

  diagonal: TWO('diagonal', 186, 28) + `
.l-diagonal .hd{background:var(--acd);padding:44px 50px 72px;clip-path:polygon(0 0,100% 0,100% 72%,0 100%)}
.l-diagonal .name{color:#fff;font-size:calc(36px*var(--s));font-weight:700}
.l-diagonal .title{color:var(--act);opacity:.9}
.l-diagonal .contact{color:rgba(255,255,255,.85)}
.l-diagonal .contact .sep{color:rgba(255,255,255,.4)}
.l-diagonal .grid{padding:8px 50px 36px}`,

  zen: `
.l-zen{padding:64px 76px 50px;--gap:calc(28px*var(--sp))}
.l-zen .hd{text-align:center;margin-bottom:34px}
.l-zen .name{font-weight:200;font-size:calc(40px*var(--s));letter-spacing:.02em}
.l-zen .title{color:#6b7280;font-weight:400;letter-spacing:.1em;margin-top:10px}
.l-zen .contact{margin-top:12px}
.l-zen .sec-h{font-family:var(--hfont);font-weight:500;color:#111827;text-transform:lowercase;letter-spacing:.04em;font-size:calc(13px*var(--s));display:flex;align-items:center;gap:9px}
.l-zen .sec-h::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ac)}`,

  journey: `
.l-journey{counter-reset:stop}
.l-journey .hd{padding:44px 50px 26px 86px}
.l-journey .name{font-weight:800;font-size:calc(34px*var(--s));letter-spacing:-.03em}
.l-journey .body{position:relative;padding:4px 50px 38px 86px;flex:1}
.l-journey .body::before{content:'';position:absolute;left:56px;top:0;bottom:30px;width:2px;background:var(--act)}
.l-journey .sec{position:relative}
.l-journey .sec-h{font-family:var(--hfont);color:#111827;letter-spacing:.1em;line-height:22px}
.l-journey .sec-h::before{counter-increment:stop;content:counter(stop);position:absolute;left:-41px;top:0;width:22px;height:22px;border-radius:50%;background:var(--ac);color:#fff;font-size:10px;font-weight:700;letter-spacing:0;display:flex;align-items:center;justify-content:center}
.l-journey .item.tl{display:grid;grid-template-columns:84px 1fr;gap:14px}
.l-journey .tl-d{font-size:calc(9.4px*var(--s));color:#6b7280;padding-top:2px}`,

  blocks: TWO('blocks', 190, 28) + `
.l-blocks .hd{display:grid;grid-template-columns:1fr 250px;margin-bottom:28px}
.l-blocks .hd-t{background:var(--ac);padding:40px 34px 30px 48px}
.l-blocks .name{color:#fff;font-size:calc(34px*var(--s));letter-spacing:-.03em}
.l-blocks .title{color:rgba(255,255,255,.85)}
.l-blocks .hd-c{background:var(--act);padding:40px 28px 30px;display:flex;align-items:flex-end}
.l-blocks .grid{padding:0 48px 36px}
.l-blocks .sec-h{font-family:var(--hfont);color:#111827;display:flex;align-items:center;gap:8px}
.l-blocks .sec-h::before{content:'';width:9px;height:9px;background:var(--ac)}`,

  deco: TWO('deco', 190, 28) + `
.l-deco .hd{background:var(--acd);padding:44px 50px 36px;text-align:center;position:relative;margin-bottom:28px}
.l-deco .hd::after{content:'';position:absolute;inset:10px;border:1px solid color-mix(in srgb,var(--ac) 70%,#fff 30%);pointer-events:none}
.l-deco .name{color:#fff;text-transform:uppercase;letter-spacing:.14em;font-weight:500;font-size:calc(30px*var(--s))}
.l-deco .title{color:color-mix(in srgb,var(--ac) 55%,#fff 45%);text-transform:uppercase;letter-spacing:.3em;font-size:calc(9.6px*var(--s));margin-top:10px}
.l-deco .contact{color:rgba(255,255,255,.8);margin-top:12px}
.l-deco .contact .sep{color:rgba(255,255,255,.4)}
.l-deco .grid{padding:0 48px 36px}
.l-deco .sec-h{font-family:var(--hfont);color:var(--acd);letter-spacing:.2em;font-weight:600;padding-bottom:5px;border-bottom:1px solid var(--ac)}`,

  column: `
.l-column .grid{display:grid;grid-template-columns:1fr 226px}
.l-column .main{padding:48px 34px 36px 46px}
.l-column .hd{margin-bottom:24px}
.l-column .name{font-weight:700;font-size:calc(36px*var(--s));letter-spacing:-.03em;line-height:1.02}
.l-column .title{margin-top:10px}
.l-column .aside{background:var(--ac);color:rgba(255,255,255,.92);padding:40px 24px 36px}
.l-column .pic{width:150px;height:150px;margin:0 auto 26px;border-radius:18px;overflow:hidden;background:var(--acd);display:flex;align-items:center;justify-content:center;border:4px solid rgba(255,255,255,.25)}
.l-column .pic img{width:100%;height:100%;object-fit:cover}
.l-column .pic > span{color:#fff;font-family:var(--hfont);font-size:48px;font-weight:600}
.l-column .aside .sec{margin-top:calc(var(--gap)*1.05)}
.l-column .aside .sec-h{color:#fff;opacity:.8}
.l-column .aside .contact-list,.l-column .aside .list,.l-column .aside strong,.l-column .aside .inline,.l-column .aside .prose{color:rgba(255,255,255,.92)}
.l-column .aside .muted{color:rgba(255,255,255,.65)}
.l-column .aside .chips li{background:rgba(255,255,255,.16);color:#fff}`,

  headline: `
.l-headline{padding:48px 52px 40px}
.l-headline .hd{margin-bottom:26px}
.l-headline .name{font-size:calc(52px*var(--s));letter-spacing:-.045em;line-height:1}
.l-headline .name{background:linear-gradient(transparent 60%,color-mix(in srgb,var(--ac) 26%,transparent) 60%);display:inline;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.l-headline .title{font-family:var(--hfont);color:#111827;font-size:calc(16px*var(--s));margin-top:16px}
.l-headline .sec-h{font-family:var(--hfont);text-transform:none;letter-spacing:-.01em;font-size:calc(14px*var(--s));color:#111827}
.l-headline .sec-h::before{content:'/ ';color:var(--ac)}`,

  frame: TWO('frame', 186, 26) + `
.l-frame{border:14px solid var(--ac);padding:34px 36px 30px}
.l-frame .hd{margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid #e5e7eb}
.l-frame .name{font-weight:800;font-size:calc(34px*var(--s));letter-spacing:-.03em}
.l-frame .title{display:inline-block;background:var(--act);color:var(--acd);padding:3px 10px;border-radius:4px}
.l-frame .sec-h{font-family:var(--hfont)}`,

  monogram: `
.l-monogram{padding:46px 54px 40px}
.l-monogram .hd{display:grid;grid-template-columns:82px 1fr;gap:22px;align-items:center;padding-bottom:20px;margin-bottom:24px;border-bottom:1px solid color-mix(in srgb,var(--ac) 35%,transparent)}
.l-monogram .mono-mark{width:82px;height:82px;border:2px solid var(--ac);outline:1px solid var(--ac);outline-offset:3px;display:flex;align-items:center;justify-content:center;font-family:var(--hfont);font-size:30px;color:var(--ac);letter-spacing:.02em}
.l-monogram .name{font-size:calc(32px*var(--s));font-weight:600}
.l-monogram .sec-h{font-family:var(--hfont);font-variant:small-caps;text-transform:lowercase;letter-spacing:.12em;font-size:calc(14px*var(--s));font-weight:600}`,

  bento: TWO('bento', 190, 14) + `
.l-bento{padding:30px 30px 28px}
.l-bento .hd{display:grid;grid-template-columns:1fr 128px;grid-template-rows:auto auto;gap:12px;margin-bottom:14px}
.l-bento .tile{border-radius:16px;padding:22px 24px}
.l-bento .t-name{background:var(--acd);grid-row:1}
.l-bento .t-name .name{color:#fff;font-size:calc(34px*var(--s));letter-spacing:-.03em}
.l-bento .t-name .title{color:color-mix(in srgb,var(--ac) 40%,#fff 60%)}
.l-bento .t-pic{background:var(--ac);padding:0;overflow:hidden;display:flex;align-items:center;justify-content:center;grid-row:1 / span 2;grid-column:2}
.l-bento .t-pic img{width:100%;height:100%;object-fit:cover}
.l-bento .t-pic > span{color:#fff;font-family:var(--hfont);font-size:40px;font-weight:700}
.l-bento .t-contact{background:var(--act);padding:12px 24px;grid-row:2}
.l-bento .t-contact .contact-list{display:flex;flex-wrap:wrap;gap:2px 18px}
.l-bento .sec{border:1px solid #e5e7eb;border-radius:16px;padding:16px 18px;margin-top:14px}
.l-bento .main > .sec:first-child,.l-bento .aside > .sec:first-child{margin-top:0}
.l-bento .aside .sec{margin-top:14px}
.l-bento .sec-h{font-family:var(--hfont)}`,

  wave: TWO('wave', 186, 28) + `
.l-wave .hd{background:var(--ac);padding:44px 50px 56px;text-align:center;border-radius:0 0 50% 50% / 0 0 46px 46px;margin-bottom:28px}
.l-wave .name{color:#fff;font-size:calc(36px*var(--s));font-weight:600}
.l-wave .title{color:rgba(255,255,255,.85)}
.l-wave .contact{color:rgba(255,255,255,.85)}
.l-wave .contact .sep{color:rgba(255,255,255,.45)}
.l-wave .grid{padding:0 50px 36px}
.l-wave .sec-h{font-family:var(--hfont);font-weight:600}`,

  polaroid: `
.l-polaroid .hd{display:flex;justify-content:space-between;align-items:center;gap:24px;background:var(--act);padding:38px 56px 34px 50px}
.l-polaroid .name{font-size:calc(38px*var(--s));line-height:1.02}
.l-polaroid .title{margin:8px 0 12px}
.l-polaroid .print{background:#fff;padding:9px 9px 30px;box-shadow:0 6px 18px rgba(17,24,39,.18);transform:rotate(3deg);flex-shrink:0}
.l-polaroid .print-pic{width:132px;height:132px;background:var(--ac);display:flex;align-items:center;justify-content:center;overflow:hidden}
.l-polaroid .print-pic img{width:100%;height:100%;object-fit:cover}
.l-polaroid .print-pic > span{color:#fff;font-family:var(--hfont);font-size:44px}
.l-polaroid .body{padding:28px 50px 38px}`,

  mosaic: TWO('mosaic', 196, 16) + `
.l-mosaic{padding:36px 34px 32px}
.l-mosaic .hd{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding:0 4px 20px}
.l-mosaic .name{font-weight:800;font-size:calc(34px*var(--s));letter-spacing:-.03em}
.l-mosaic .contact-list{text-align:right;max-width:240px}
.l-mosaic .sec{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-top:14px}
.l-mosaic .main > .sec:first-child,.l-mosaic .aside > .sec:first-child{margin-top:0}
.l-mosaic .aside .sec{margin-top:14px}
.l-mosaic .sec-h{background:var(--ac);color:#fff;padding:7px 14px;margin:0;font-family:var(--hfont)}
.l-mosaic .sec-b{padding:12px 14px}`,
}
