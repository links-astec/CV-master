// @ts-nocheck
// ── helpers ───────────────────────────────────────────────────────────────────
const LVL = [88, 82, 76, 91, 85, 73, 94, 79, 87, 68, 92, 77]
const pct = (i) => LVL[i % LVL.length]

const bars = (sk, fg, bg = 'rgba(0,0,0,.08)', h = '3px') =>
  sk.map((s,i) => `<div style="margin-bottom:8px;">
    <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px;opacity:.75;"><span>${s}</span><span>${pct(i)}%</span></div>
    <div style="height:${h};background:${bg};border-radius:2px;"><div style="width:${pct(i)}%;height:100%;background:${fg};border-radius:2px;"></div></div>
  </div>`).join('')

const dots = (sk, col) => sk.map((s, i) => {
  const dotsFilled = Math.round(pct(i) / 20)
  const dotsHtml = [1,2,3,4,5].map(n => {
    const bg = n <= dotsFilled ? col : 'rgba(255,255,255,.18)'
    return '<div style="width:6px;height:6px;border-radius:50%;background:' + bg + ';"></div>'
  }).join('')
  return '<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;"><div style="display:flex;gap:2px;">' + dotsHtml + '</div><span style="font-size:10.5px;">' + s + '</span></div>'
}).join('')

const chips = (sk, bg, fg, r='4px') =>
  sk.map(s=>`<span style="display:inline-block;background:${bg};color:${fg};font-size:10px;font-weight:600;padding:3px 9px;border-radius:${r};margin:2px 3px 2px 0;">${s}</span>`).join('')

const list = (sk, col) =>
  sk.map(s=>`<div style="font-size:11px;color:${col};padding:5px 0;border-bottom:1px solid rgba(0,0,0,.06);display:flex;align-items:center;gap:6px;"><div style="width:4px;height:4px;border-radius:50%;background:currentColor;flex-shrink:0;opacity:.4;"></div>${s}</div>`).join('')

const xp = (e, tc, mc, dc) => `
  <div style="margin-bottom:14px;">
    <div style="font-size:12.5px;font-weight:700;color:${tc};margin-bottom:1px;">${e.title || '<span style="color:#c8c4be;font-style:italic;">Job Title</span>'}</div>
    <div style="font-size:10.5px;color:${mc};margin-bottom:4px;font-weight:500;">${e.company || '<span style="color:#c8c4be;font-style:italic;">Company</span>'}${e.period ? ' · '+e.period : ''}</div>
    <div style="font-size:11px;color:${dc};line-height:1.65;">${e.desc || '<span style="color:#c8c4be;font-style:italic;">Describe your key responsibilities and achievements.</span>'}</div>
  </div>`

const sh = (lbl, col, bc) =>
  `<div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${col};margin:18px 0 9px;padding-bottom:5px;border-bottom:1.5px solid ${bc};">${lbl}</div>`

const photoOrInit = (d, sz, bg, fg, fs) => d.photo
  ? `<img src="${d.photo}" style="width:${sz};height:${sz};border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.25);display:block;" />`
  : `<div style="width:${sz};height:${sz};border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:${fs};font-weight:700;color:${fg};font-family:'DM Serif Display',serif;flex-shrink:0;">${(d.fn?.[0]||'Y')+(d.ln?.[0]||'N')}</div>`

export function useCvRenderer() {
  // Helper: render placeholder text in muted italic style
  const ph = (text, col = '#c8c4be') =>
    `<span style="color:${col};font-style:italic;opacity:.7;">${text}</span>`

  function render(tpl, d) {
    const hasName = d.fn || d.ln
    const nm   = hasName ? `${d.fn||''} ${d.ln||''}`.trim() : ph('Your Full Name')
    const init = hasName ? ((d.fn?.[0]||'Y')+(d.ln?.[0]||'N')) : 'YN'

    const sk   = d.skills?.length ? d.skills : ['Your Skill','Communication','Leadership','Analysis']
    const exp  = d.experiences?.filter(e => e.title || e.company || e.desc).length
      ? d.experiences
      : [{ title: 'Job Title', company: 'Company Name', period: '2020–Present', desc: 'Describe your key responsibilities and achievements here.' }]
    const edu  = d.education?.degree
      ? d.education
      : { degree: 'Your Degree', school: 'University Name', year: '2020' }
    const cert = d.certifications || []
    const lang = d.languages || []
    const web  = d.website || ''
    const ctc  = [
      d.email || 'your@email.com',
      d.phone || '+44 7700 000000',
      d.loc   || 'City, Country',
      d.li, web
    ].filter(Boolean)
    const titleStr = d.title || 'Job Title / Desired Role'
    const sumStr   = d.sum   || 'Write a compelling 2–3 sentence professional summary highlighting your key skills, experience level, and what makes you stand out to employers.'

    const T = {

      // ── 1. EXECUTIVE SLATE ──────────────────────────────────────────────────
      executive: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
        <div style="background:#1a1916;padding:36px 40px 28px;">
          <div style="font-family:'DM Serif Display',serif;font-size:34px;color:#fff;letter-spacing:-.01em;margin-bottom:4px;">${nm}</div>
          <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5a5855;margin-bottom:16px;">${titleStr}</div>
          <div style="display:flex;flex-wrap:wrap;gap:16px;">${ctc.map(x=>`<span style="font-size:10.5px;color:#4a4845;">${x}</span>`).join('')}</div>
        </div>
        <div style="display:grid;grid-template-columns:200px 1fr;">
          <div style="background:#f9f8f4;padding:24px 18px;border-right:1px solid #ece9e2;">
            ${sh('Skills','#2a5bd7','#dce6f7')}${bars(sk,'#2a5bd7','#dce6f7')}
            ${sh('Education','#2a5bd7','#dce6f7')}
            <div style="font-size:11.5px;color:#1a1916;font-weight:600;margin-bottom:2px;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#9a9790;">${edu.school}</div>
            <div style="font-size:10px;color:#b0ada6;margin-top:2px;">${edu.year}</div>
            ${lang.length?`${sh('Languages','#2a5bd7','#dce6f7')}${lang.map(l=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;"><span style="font-weight:600;color:#1a1916;">${l.name}</span> — ${l.level}</div>`).join('')}`:''}
          </div>
          <div style="padding:24px 28px;">
            ${sh('Profile','#2a5bd7','#dce6f7')}<p style="font-size:11.5px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
            ${sh('Experience','#2a5bd7','#dce6f7')}${exp.map(e=>xp(e,'#1a1916','#9a9790','#6b6860')).join('')}
            ${cert.length?`${sh('Certifications','#2a5bd7','#dce6f7')}<div style="font-size:11px;color:#6b6860;line-height:2;">${cert.map(c=>`<div style="display:flex;align-items:center;gap:6px;"><div style="width:4px;height:4px;border-radius:50%;background:#2a5bd7;flex-shrink:0;"></div>${c}</div>`).join('')}</div>`:''}</div>
        </div></div>`,

      // ── 2. MODERN AZURE ─────────────────────────────────────────────────────
      modern: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
        <div style="background:linear-gradient(135deg,#1a3fa0,#2a5bd7 60%,#3d6ee0);padding:32px 36px;display:flex;align-items:center;gap:20px;">
          ${photoOrInit(d,'72px','rgba(255,255,255,.15)','#fff','26px')}
          <div>
            <div style="font-size:26px;font-weight:700;color:#fff;margin-bottom:3px;">${nm}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.65);margin-bottom:10px;">${titleStr}</div>
            <div style="display:flex;flex-wrap:wrap;gap:14px;">${ctc.map(x=>`<span style="font-size:10.5px;color:rgba(255,255,255,.5);">${x}</span>`).join('')}</div>
          </div>
        </div>
        <div style="padding:24px 32px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-bottom:18px;">
            <div>${sh('About','#1a3fa0','#e8eefb')}<p style="font-size:11px;color:#6b6860;line-height:1.7;">${sumStr}</p></div>
            <div>${sh('Skills','#1a3fa0','#e8eefb')}<div>${chips(sk,'#e8eefb','#1a3fa0','20px')}</div></div>
          </div>
          ${sh('Experience','#1a3fa0','#e8eefb')}${exp.map(e=>xp(e,'#1a1916','#9a9790','#6b6860')).join('')}
          ${sh('Education','#1a3fa0','#e8eefb')}<div style="font-size:11.5px;color:#1a1916;font-weight:600;">${edu.degree}</div><div style="font-size:10.5px;color:#9a9790;">${edu.school} · ${edu.year}</div>
        </div></div>`,

      // ── 3. MINIMAL EDITORIAL ────────────────────────────────────────────────
      minimal: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;padding:52px 58px;">
        <div style="font-family:'DM Serif Display',serif;font-size:44px;color:#1a1916;letter-spacing:-.03em;line-height:1;">${nm}</div>
        <div style="font-size:13px;color:#9a9790;margin:6px 0 16px;">${titleStr}</div>
        <div style="height:.5px;background:#1a1916;margin-bottom:14px;"></div>
        <div style="display:flex;gap:22px;font-size:10.5px;color:#b0ada6;margin-bottom:28px;flex-wrap:wrap;">${ctc.map(x=>`<span>${x}</span>`).join('')}</div>
        <div style="display:grid;grid-template-columns:1fr 210px;gap:40px;">
          <div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#1a1916;margin-bottom:8px;">Profile</div>
            <p style="font-size:11.5px;color:#6b6860;line-height:1.75;margin-bottom:22px;">${sumStr}</p>
            <div style="font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#1a1916;margin-bottom:10px;">Experience</div>
            ${exp.map(e=>`<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:.5px solid #f0ede8;">
              <div style="font-size:13px;font-weight:700;color:#1a1916;margin-bottom:2px;">${e.title}</div>
              <div style="font-family:'DM Serif Display',serif;font-style:italic;font-size:11px;color:#b0ada6;margin-bottom:5px;">${e.company}${e.period?' · '+e.period:''}</div>
              <div style="font-size:11px;color:#6b6860;line-height:1.65;">${e.desc}</div>
            </div>`).join('')}
          </div>
          <div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#1a1916;margin-bottom:8px;">Skills</div>
            ${sk.map(s=>`<div style="font-size:11px;color:#6b6860;padding:5px 0;border-bottom:.5px solid #f0ede8;">${s}</div>`).join('')}
            <div style="font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#1a1916;margin:18px 0 8px;">Education</div>
            <div style="font-size:11.5px;color:#1a1916;font-weight:600;margin-bottom:2px;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#9a9790;">${edu.school}</div>
            <div style="font-size:10px;color:#b0ada6;margin-top:2px;">${edu.year}</div>
            ${lang.length?`<div style="font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#1a1916;margin:18px 0 8px;">Languages</div>${lang.map(l=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}`:''}
          </div>
        </div></div>`,

      // ── 4. BOLD NOIR ────────────────────────────────────────────────────────
      bold: () => `<div style="width:700px;background:#0f0e0c;font-family:'DM Sans',sans-serif;min-height:990px;">
        <div style="padding:36px 36px 0;position:relative;">
          <div style="position:absolute;left:0;top:0;width:4px;height:100%;background:linear-gradient(180deg,#2a5bd7,#6236b0);"></div>
          <div style="padding-left:24px;padding-bottom:28px;border-bottom:1px solid #1e1d1a;">
            <div style="font-size:30px;font-weight:800;color:#fff;letter-spacing:-.01em;margin-bottom:4px;">${nm}</div>
            <div style="font-size:11px;color:#2a5bd7;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px;">${titleStr}</div>
            <div style="display:flex;flex-wrap:wrap;gap:16px;">${ctc.map(x=>`<span style="font-size:10.5px;color:#4a4845;">${x}</span>`).join('')}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 205px;padding:0 36px;">
          <div style="padding:24px 24px 24px 0;border-right:1px solid #1e1d1a;">
            ${sh('Profile','#2a5bd7','#1e2d4a')}<p style="font-size:11px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
            ${sh('Experience','#2a5bd7','#1e2d4a')}
            ${exp.map(e=>`<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #1a1916;">
              <div style="font-size:13px;font-weight:700;color:#d0e4ff;margin-bottom:1px;">${e.title}</div>
              <div style="font-size:10.5px;color:#2d3d55;margin-bottom:4px;">${e.company}${e.period?' · '+e.period:''}</div>
              <div style="font-size:11px;color:#4a5568;line-height:1.65;">${e.desc}</div>
            </div>`).join('')}
          </div>
          <div style="padding:24px 0 24px 20px;">
            ${sh('Skills','#2a5bd7','#1e2d4a')}${sk.map(s=>`<div style="font-size:11px;color:#4a5568;padding:5px 0;border-bottom:1px solid #1a1916;">${s}</div>`).join('')}
            ${sh('Education','#2a5bd7','#1e2d4a')}<div style="font-size:11.5px;font-weight:600;color:#d0e4ff;">${edu.degree}</div><div style="font-size:10.5px;color:#2d3d55;margin-top:2px;">${edu.school} · ${edu.year}</div>
            ${cert.length?`${sh('Certifications','#2a5bd7','#1e2d4a')}${cert.map(c=>`<div style="font-size:10.5px;color:#4a5568;margin-bottom:4px;">${c}</div>`).join('')}`:''}
          </div>
        </div></div>`,

      // ── 5. CREATIVE VIOLET ──────────────────────────────────────────────────
      creative: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;display:grid;grid-template-columns:205px 1fr;min-height:990px;">
        <div style="background:linear-gradient(160deg,#3b1d8a,#6236b0);padding:30px 18px;">
          <div style="width:64px;height:64px;border-radius:16px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;font-family:'DM Serif Display',serif;margin-bottom:12px;">${init}</div>
          <div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:2px;">${nm}</div>
          <div style="font-size:10.5px;color:rgba(255,255,255,.45);margin-bottom:20px;">${titleStr}</div>
          <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:8px;">Contact</div>
          ${ctc.map(x=>`<div style="font-size:10.5px;color:rgba(255,255,255,.65);margin-bottom:5px;word-break:break-all;">${x}</div>`).join('')}
          <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin:16px 0 8px;">Skills</div>
          ${dots(sk,'rgba(255,255,255,.9)')}
          <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin:16px 0 8px;">Education</div>
          <div style="font-size:11px;color:rgba(255,255,255,.75);font-weight:600;margin-bottom:2px;">${edu.degree}</div>
          <div style="font-size:10.5px;color:rgba(255,255,255,.45);">${edu.school} · ${edu.year}</div>
        </div>
        <div style="padding:28px 26px;">
          ${sh('Profile','#6236b0','#f0ebfa')}<p style="font-size:11.5px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
          ${sh('Experience','#6236b0','#f0ebfa')}${exp.map(e=>xp(e,'#1a1916','#9a9790','#6b6860')).join('')}
          ${sh('Key Skills','#6236b0','#f0ebfa')}<div>${chips(sk,'#f0ebfa','#6236b0','20px')}</div>
        </div></div>`,

      // ── 6. ACADEMIC ─────────────────────────────────────────────────────────
      academic: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;padding:44px 52px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-family:'DM Serif Display',serif;font-size:32px;color:#1a1916;">${nm}</div>
          <div style="font-size:13px;color:#6b6860;margin:5px 0 12px;">${titleStr}</div>
          <div style="display:flex;justify-content:center;gap:18px;font-size:10.5px;color:#b0ada6;flex-wrap:wrap;">${ctc.map(x=>`<span>${x}</span>`).join('')}</div>
        </div>
        <div style="border-top:2.5px solid #1a1916;border-bottom:1px solid #1a1916;margin-bottom:20px;padding:4px 0;"></div>
        <p style="font-size:11.5px;color:#6b6860;line-height:1.75;margin-bottom:18px;">${sumStr}</p>
        <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin-bottom:10px;">Work Experience</div>
        ${exp.map(e=>`<div style="margin-bottom:14px;display:grid;grid-template-columns:110px 1fr;gap:16px;">
          <div style="font-size:10px;color:#b0ada6;font-style:italic;padding-top:2px;text-align:right;">${e.period||''}</div>
          <div><div style="font-size:12.5px;font-weight:700;color:#1a1916;">${e.title}</div><div style="font-size:10.5px;color:#9a9790;margin-bottom:4px;">${e.company}</div><div style="font-size:11px;color:#6b6860;line-height:1.65;">${e.desc}</div></div>
        </div>`).join('')}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:8px;">
          <div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin-bottom:10px;">Education</div>
            <div style="font-size:12.5px;font-weight:700;color:#1a1916;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school}, ${edu.year}</div>
            ${cert.length?`<div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin:14px 0 8px;">Certifications</div>${cert.map(c=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${c}</div>`).join('')}`:''}
          </div>
          <div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin-bottom:10px;">Core Skills</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">${sk.map((s,i,a)=>`<span style="font-size:10.5px;color:#6b6860;">${s}${i<a.length-1?'<span style="color:#c8c4be;"> ·</span>':''}</span>`).join('')}</div>
            ${lang.length?`<div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin:14px 0 8px;">Languages</div>${lang.map(l=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}`:''}
          </div>
        </div></div>`,

      // ── 7. ELEGANT GOLD ─────────────────────────────────────────────────────
      elegant: () => `<div style="width:700px;background:#fdf9f0;font-family:'DM Sans',sans-serif;">
        <div style="background:#1a1208;padding:32px 40px;">
          <div style="font-family:'DM Serif Display',serif;font-size:30px;color:#f0e0b0;margin-bottom:4px;">${nm}</div>
          <div style="font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#7a6840;margin-bottom:14px;">${titleStr}</div>
          <div style="height:1px;background:linear-gradient(90deg,#c9a84c,transparent);margin-bottom:14px;"></div>
          <div style="display:flex;flex-wrap:wrap;gap:18px;">${ctc.map(x=>`<span style="font-size:10.5px;color:#5a4c2a;">${x}</span>`).join('')}</div>
        </div>
        <div style="display:grid;grid-template-columns:1.6fr 1fr;">
          <div style="padding:24px 26px;border-right:1px solid #e8dcc0;">
            ${sh('Profile','#c9a84c','#ede2c0')}<p style="font-size:11.5px;color:#5a4f3a;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
            ${sh('Experience','#c9a84c','#ede2c0')}${exp.map(e=>`<div style="margin-bottom:14px;"><div style="font-size:12.5px;font-weight:700;color:#1a1208;">${e.title}</div><div style="font-size:10.5px;color:#8a7a5a;margin-bottom:4px;">${e.company}${e.period?' · '+e.period:''}</div><div style="font-size:11px;color:#5a4f3a;line-height:1.65;">${e.desc}</div></div>`).join('')}
          </div>
          <div style="padding:24px 20px;background:#f5f0e0;">
            ${sh('Skills','#c9a84c','#ede2c0')}${sk.map(s=>`<div style="font-size:11px;color:#6b5f3a;padding:5px 0;border-bottom:1px solid #ede2c0;">${s}</div>`).join('')}
            ${sh('Education','#c9a84c','#ede2c0')}<div style="font-size:11.5px;font-weight:600;color:#1a1208;">${edu.degree}</div><div style="font-size:10.5px;color:#8a7a5a;margin-top:2px;">${edu.school} · ${edu.year}</div>
            ${cert.length?`${sh('Certifications','#c9a84c','#ede2c0')}${cert.map(c=>`<div style="font-size:10.5px;color:#6b5f3a;margin-bottom:4px;">${c}</div>`).join('')}`:''}
            ${lang.length?`${sh('Languages','#c9a84c','#ede2c0')}${lang.map(l=>`<div style="font-size:11px;color:#6b5f3a;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}`:''}
          </div>
        </div></div>`,

      // ── 8. TECH DARK ────────────────────────────────────────────────────────
      tech: () => `<div style="width:700px;background:#0c1018;font-family:'JetBrains Mono',monospace;min-height:990px;">
        <div style="padding:28px 32px;border-bottom:1px solid #1e2d4a;">
          <div style="display:inline-flex;align-items:center;gap:6px;background:#0d1e38;border:1px solid #1a3a6a;padding:3px 10px;border-radius:4px;margin-bottom:12px;">
            <div style="width:6px;height:6px;border-radius:50%;background:#22c55e;"></div>
            <span style="font-size:9px;color:#60a5fa;letter-spacing:.06em;">RESUME.json</span>
          </div>
          <div style="font-size:26px;font-weight:700;color:#e8f0ff;margin-bottom:4px;font-family:'DM Sans',sans-serif;">${nm}</div>
          <div style="font-size:11px;color:#60a5fa;margin-bottom:12px;">${titleStr}</div>
          <div style="display:flex;flex-wrap:wrap;gap:14px;">${ctc.map(x=>`<span style="font-size:9.5px;color:#2d3d55;">${x}</span>`).join('')}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 195px;">
          <div style="padding:22px 26px;border-right:1px solid #1e2d4a;">
            <div style="font-size:8px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;margin-bottom:10px;">// about</div>
            <p style="font-size:11px;color:#4a5568;line-height:1.7;margin-bottom:18px;">${sumStr}</p>
            <div style="font-size:8px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;margin-bottom:10px;">// experience</div>
            ${exp.map(e=>`<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #1e2d4a;"><div style="font-size:12.5px;font-weight:700;color:#d0e4ff;">${e.title}</div><div style="font-size:9.5px;color:#2d3d55;margin-bottom:4px;">${e.company}${e.period?' · '+e.period:''}</div><div style="font-size:11px;color:#4a5568;line-height:1.65;">${e.desc}</div></div>`).join('')}
            <div style="font-size:8px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;margin-bottom:10px;">// stack</div>
            <div>${sk.map(s=>`<span style="display:inline-block;background:#0d1e38;border:1px solid #1a3a6a;color:#60a5fa;font-size:9.5px;padding:2px 8px;border-radius:3px;margin:2px 3px 2px 0;">${s}</span>`).join('')}</div>
          </div>
          <div style="padding:22px 18px;background:#080c14;">
            <div style="font-size:8px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;margin-bottom:10px;">skills</div>
            ${sk.map(s=>`<div style="font-size:10.5px;color:#4a5568;padding:4px 0;border-bottom:1px solid #1e2d4a;">${s}</div>`).join('')}
            <div style="font-size:8px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;margin:18px 0 9px;">education</div>
            <div style="font-size:11px;font-weight:600;color:#d0e4ff;">${edu.degree}</div>
            <div style="font-size:10px;color:#2d3d55;margin-top:3px;">${edu.school}</div>
            <div style="font-size:9.5px;color:#1a3a6a;margin-top:2px;">${edu.year}</div>
          </div>
        </div></div>`,

      // ── 9. TEAL SIDEBAR ─────────────────────────────────────────────────────
      teal: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;display:grid;grid-template-columns:200px 1fr;min-height:990px;">
        <div style="background:#0d7a72;padding:30px 18px;">
          ${d.photo?`<img src="${d.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.25);margin-bottom:14px;display:block;" />`:`<div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;font-family:'DM Serif Display',serif;margin-bottom:14px;">${init}</div>`}
          <div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:2px;">${nm}</div>
          <div style="font-size:10.5px;color:rgba(255,255,255,.5);margin-bottom:20px;">${titleStr}</div>
          <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:8px;">Contact</div>
          ${ctc.map(x=>`<div style="font-size:10px;color:rgba(255,255,255,.65);margin-bottom:5px;word-break:break-all;">${x}</div>`).join('')}
          <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.35);margin:16px 0 8px;">Skills</div>
          ${bars(sk,'rgba(255,255,255,.85)','rgba(255,255,255,.15)')}
          <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.35);margin:16px 0 8px;">Education</div>
          <div style="font-size:11px;color:rgba(255,255,255,.8);font-weight:600;margin-bottom:2px;">${edu.degree}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.45);">${edu.school} · ${edu.year}</div>
          ${lang.length?`<div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.35);margin:16px 0 8px;">Languages</div>${lang.map(l=>`<div style="font-size:10.5px;color:rgba(255,255,255,.65);margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}`:''}
        </div>
        <div style="padding:28px 26px;">
          ${sh('Summary','#0d7a72','#e6f5f4')}<p style="font-size:11.5px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
          ${sh('Experience','#0d7a72','#e6f5f4')}${exp.map(e=>xp(e,'#1a1916','#9a9790','#6b6860')).join('')}
          ${cert.length?`${sh('Certifications','#0d7a72','#e6f5f4')}${cert.map(c=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${c}</div>`).join('')}`:''}
        </div></div>`,

      // ── 10. NEWSPAPER ───────────────────────────────────────────────────────
      newspaper: () => `<div style="width:700px;background:#fdfcf8;font-family:'DM Serif Display',serif;padding:36px 44px;">
        <div style="text-align:center;margin-bottom:10px;">
          <div style="font-size:42px;color:#1a1916;letter-spacing:-.02em;line-height:1;">${nm}</div>
        </div>
        <div style="border-top:3px double #1a1916;border-bottom:1px solid #1a1916;padding:5px 0;margin:10px 0;"></div>
        <div style="text-align:center;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-family:'DM Sans',sans-serif;color:#1a1916;margin-bottom:4px;">${titleStr}</div>
        <div style="border-bottom:1px solid #1a1916;margin-bottom:10px;"></div>
        <div style="display:flex;justify-content:center;gap:20px;font-size:10px;color:#9a9790;font-family:'DM Sans',sans-serif;margin-bottom:16px;flex-wrap:wrap;">${ctc.map(x=>`<span>${x}</span>`).join('')}</div>
        <div style="display:grid;grid-template-columns:1fr 1px 1fr;gap:20px;">
          <div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin-bottom:10px;">Profile</div>
            <p style="font-size:11px;color:#6b6860;line-height:1.75;margin-bottom:14px;font-family:'DM Sans',sans-serif;">${sumStr}</p>
            <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin-bottom:10px;">Experience</div>
            ${exp.map(e=>`<div style="margin-bottom:12px;"><div style="font-size:12.5px;color:#1a1916;">${e.title}</div><div style="font-size:10px;color:#9a9790;font-style:italic;font-family:'DM Sans',sans-serif;margin-bottom:3px;">${e.company}${e.period?' · '+e.period:''}</div><div style="font-size:10.5px;color:#6b6860;line-height:1.65;font-family:'DM Sans',sans-serif;">${e.desc}</div></div>`).join('')}
          </div>
          <div style="background:#1a1916;"></div>
          <div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin-bottom:10px;">Skills</div>
            ${sk.map(s=>`<div style="font-size:10.5px;color:#6b6860;padding:4px 0;border-bottom:.5px solid #e8e6e0;font-family:'DM Sans',sans-serif;">${s}</div>`).join('')}
            <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin:14px 0 8px;">Education</div>
            <div style="font-size:12px;color:#1a1916;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#9a9790;font-style:italic;font-family:'DM Sans',sans-serif;margin-top:2px;">${edu.school}, ${edu.year}</div>
            ${lang.length?`<div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin:14px 0 8px;">Languages</div>${lang.map(l=>`<div style="font-size:10.5px;color:#6b6860;font-family:'DM Sans',sans-serif;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}`:''}
          </div>
        </div></div>`,

      // ── 11. SWISS DESIGN ────────────────────────────────────────────────────
      swiss: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
        <div style="background:#f0ede8;padding:30px 38px;display:flex;align-items:flex-end;justify-content:space-between;border-bottom:3px solid #1a1916;">
          <div><div style="font-size:32px;font-weight:800;color:#1a1916;letter-spacing:-.02em;">${nm}</div></div>
          <div style="text-align:right;"><div style="font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#6b6860;">${titleStr}</div><div style="font-size:10px;color:#b0ada6;margin-top:4px;">${ctc.slice(0,3).join(' · ')}</div></div>
        </div>
        <div style="display:grid;grid-template-columns:200px 1fr;min-height:780px;">
          <div style="padding:22px 20px;background:#f8f7f3;border-right:3px solid #1a1916;">
            <div style="font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:#1a1916;color:#fff;padding:4px 8px;display:inline-block;margin-bottom:10px;">Profile</div>
            <p style="font-size:11px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
            <div style="font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:#1a1916;color:#fff;padding:4px 8px;display:inline-block;margin:16px 0 10px;">Skills</div>
            ${sk.map(s=>`<div style="font-size:11px;color:#6b6860;padding:4px 0;border-bottom:1px solid #e8e6e0;">${s}</div>`).join('')}
            <div style="font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:#1a1916;color:#fff;padding:4px 8px;display:inline-block;margin:16px 0 10px;">Education</div>
            <div style="font-size:11.5px;font-weight:700;color:#1a1916;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school} · ${edu.year}</div>
            ${web?`<div style="font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:#1a1916;color:#fff;padding:4px 8px;display:inline-block;margin:16px 0 8px;">Web</div><div style="font-size:10.5px;color:#6b6860;word-break:break-all;">${web}</div>`:''}
          </div>
          <div style="padding:22px 28px;"><div style="font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:#1a1916;color:#fff;padding:4px 8px;display:inline-block;margin-bottom:12px;">Experience</div>${exp.map(e=>xp(e,'#1a1916','#9a9790','#6b6860')).join('')}</div>
        </div></div>`,

      // ── 12. GRADIENT FLOW ───────────────────────────────────────────────────
      gradient: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
        <div style="background:#1a1916;padding:34px 36px;display:flex;align-items:center;gap:20px;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(42,91,215,.6),rgba(98,54,176,.4),transparent);"></div>
          <div style="position:relative;z-index:1;">${photoOrInit(d,'78px','rgba(255,255,255,.15)','#fff','28px')}</div>
          <div style="position:relative;z-index:1;">
            <div style="font-size:28px;font-weight:700;color:#fff;margin-bottom:4px;">${nm}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.6);margin-bottom:10px;">${titleStr}</div>
            <div style="display:flex;flex-wrap:wrap;gap:12px;">${ctc.map(x=>`<span style="font-size:10px;color:rgba(255,255,255,.45);">${x}</span>`).join('')}</div>
          </div>
        </div>
        <div style="padding:24px 32px;">
          <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:24px;margin-bottom:20px;">
            <div>${sh('About','#4338ca','#eef2ff')}<p style="font-size:11px;color:#6b6860;line-height:1.7;">${sumStr}</p></div>
            <div>${sh('Skills','#4338ca','#eef2ff')}<div>${chips(sk,'#eef2ff','#4338ca','20px')}</div></div>
          </div>
          ${sh('Experience','#4338ca','#eef2ff')}${exp.map(e=>xp(e,'#1a1916','#9a9790','#6b6860')).join('')}
          ${sh('Education','#4338ca','#eef2ff')}<div style="font-size:11.5px;font-weight:600;color:#1a1916;">${edu.degree}</div><div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school} · ${edu.year}</div>
        </div></div>`,

      // ── 13. COMPACT GRID ────────────────────────────────────────────────────
      compact: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;padding:26px 32px;">
        <div style="border-left:5px solid #2a5bd7;padding-left:16px;margin-bottom:14px;">
          <div style="font-size:24px;font-weight:800;color:#1a1916;margin-bottom:3px;">${nm}</div>
          <div style="font-size:12.5px;color:#2a5bd7;font-weight:700;">${titleStr}</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:10.5px;color:#b0ada6;margin-bottom:14px;">${ctc.map(x=>`<span>${x}</span>`).join('')}</div>
        <div style="font-size:11.5px;color:#6b6860;line-height:1.7;border-left:3px solid #e8eefb;padding-left:12px;margin-bottom:18px;">${sumStr}</div>
        <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:24px;">
          <div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:#2a5bd7;padding:4px 8px;border-radius:3px;display:inline-block;margin-bottom:10px;">Experience</div>
            ${exp.map(e=>xp(e,'#1a1916','#9a9790','#6b6860')).join('')}
          </div>
          <div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:#2a5bd7;padding:4px 8px;border-radius:3px;display:inline-block;margin-bottom:10px;">Skills</div>
            ${sk.map(s=>`<div style="font-size:11px;color:#6b6860;padding:4px 0;border-bottom:.5px solid #f0ede8;">${s}</div>`).join('')}
            <div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:#2a5bd7;padding:4px 8px;border-radius:3px;display:inline-block;margin:14px 0 10px;">Education</div>
            <div style="font-size:12px;font-weight:700;color:#1a1916;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school} · ${edu.year}</div>
            ${web?`<div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:#2a5bd7;padding:4px 8px;border-radius:3px;display:inline-block;margin:14px 0 10px;">Portfolio</div><div style="font-size:10.5px;color:#6b6860;word-break:break-all;">${web}</div>`:''}
          </div>
        </div></div>`,

      // ── 14. PHOTO PROFESSIONAL (fixed — no empty space) ──────────────────────
      photo: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
        <div style="background:linear-gradient(135deg,#1a3fa0,#2a5bd7);padding:0;display:grid;grid-template-columns:175px 1fr;">
          <div style="background:#1a1916;padding:28px 18px;display:flex;flex-direction:column;align-items:center;text-align:center;">
            ${d.photo
              ? `<img src="${d.photo}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,.2);margin-bottom:14px;display:block;" />`
              : `<div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,rgba(42,91,215,.5),rgba(98,54,176,.5));border:4px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:700;color:#fff;font-family:'DM Serif Display',serif;margin-bottom:14px;">${init}</div>`}
            <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:8px;width:100%;text-align:left;">Contact</div>
            ${ctc.map(x=>`<div style="font-size:9.5px;color:rgba(255,255,255,.6);margin-bottom:5px;word-break:break-all;text-align:left;width:100%;">${x}</div>`).join('')}
            <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin:14px 0 8px;width:100%;text-align:left;">Skills</div>
            ${bars(sk,'#2a5bd7','rgba(255,255,255,.12)')}
            ${lang.length?`<div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin:14px 0 8px;width:100%;text-align:left;">Languages</div>${lang.map(l=>`<div style="display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,.65);margin-bottom:4px;"><span>${l.name}</span><span style="color:rgba(255,255,255,.35);">${l.level}</span></div>`).join('')}`:''}</div>
          <div style="background:#2a5bd7;padding:28px 24px;display:flex;flex-direction:column;justify-content:center;">
            <div style="font-family:'DM Serif Display',serif;font-size:30px;color:#fff;margin-bottom:6px;line-height:1.1;">${nm}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.65);margin-bottom:14px;font-weight:500;">${titleStr}</div>
            <div style="height:1px;background:rgba(255,255,255,.2);margin-bottom:14px;"></div>
            <div style="font-size:11px;color:rgba(255,255,255,.8);line-height:1.65;">${sumStr.split(' ').slice(0,40).join(' ')}${sumStr.split(' ').length > 40 ? '...' : ''}</div>
          </div>
        </div>
        <div style="padding:24px 26px;">
          <div style="display:grid;grid-template-columns:175px 1fr;gap:24px;">
            <div>
              ${sh('Education','#2a5bd7','#e8eefb')}<div style="font-size:11.5px;font-weight:700;color:#1a1916;">${edu.degree}</div><div style="font-size:10.5px;color:#9a9790;">${edu.school} · ${edu.year}</div>
              ${cert.length?`${sh('Certifications','#2a5bd7','#e8eefb')}${cert.map(c=>`<div style="font-size:10.5px;color:#6b6860;margin-bottom:4px;">${c}</div>`).join('')}`:''}
            </div>
            <div>
              ${sh('Experience','#2a5bd7','#e8eefb')}
              ${exp.map(e=>`<div style="margin-bottom:12px;display:grid;grid-template-columns:120px 1fr;gap:12px;">
                <div><div style="font-size:9.5px;font-weight:700;color:#2a5bd7;">${e.period||''}</div><div style="font-size:9.5px;color:#9a9790;">${e.company}</div></div>
                <div><div style="font-size:12px;font-weight:700;color:#1a1916;margin-bottom:3px;">${e.title}</div><div style="font-size:11px;color:#6b6860;line-height:1.6;">${e.desc}</div></div>
              </div>`).join('')}
            </div>
          </div>
        </div></div>`,

      // ── 15. INFOGRAPHIC ─────────────────────────────────────────────────────
      infographic: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;padding:28px 32px;">
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px;">
          <div style="width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#0d7a72,#1a7a4a);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff;font-family:'DM Serif Display',serif;flex-shrink:0;">${init}</div>
          <div>
            <div style="font-size:26px;font-weight:700;color:#1a1916;margin-bottom:3px;">${nm}</div>
            <div style="font-size:12.5px;color:#0d7a72;font-weight:600;margin-bottom:8px;">${titleStr}</div>
            <div style="display:flex;flex-wrap:wrap;gap:12px;">${ctc.map(x=>`<span style="font-size:10px;color:#b0ada6;">${x}</span>`).join('')}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px;">
          ${['8+ Yrs Exp.','2M+ Users','£3.5M Rev.'].map((v,i)=>`<div style="background:linear-gradient(135deg,#e6f5f4,#f0fdf4);border:1px solid #a0e0d8;border-radius:12px;padding:14px;"><div style="font-size:20px;font-weight:800;color:#0d7a72;">${v.split(' ')[0]}</div><div style="font-size:10.5px;color:#6b6860;margin-top:2px;">${v.split(' ').slice(1).join(' ')}</div></div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;">
          <div>
            ${sh('Profile','#0d7a72','#e6f5f4')}<p style="font-size:11px;color:#6b6860;line-height:1.7;margin-bottom:14px;">${sumStr}</p>
            ${sh('Core Skills','#0d7a72','#e6f5f4')}<div>${chips(sk,'#e6f5f4','#0d7a72','20px')}</div>
            ${sh('Education','#0d7a72','#e6f5f4')}<div style="font-size:11.5px;font-weight:600;color:#1a1916;">${edu.degree}</div><div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school} · ${edu.year}</div>
          </div>
          <div>${sh('Experience','#0d7a72','#e6f5f4')}${exp.map(e=>xp(e,'#1a1916','#9a9790','#6b6860')).join('')}</div>
        </div></div>`,

      // ── 16. PASTEL ROSE ─────────────────────────────────────────────────────
      pastel: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
        <div style="background:linear-gradient(135deg,#fdf2f8,#fef3f2 50%,#f0f9f4);padding:30px 36px;border-bottom:1.5px solid #fde8f5;">
          <div style="font-family:'DM Serif Display',serif;font-size:30px;color:#1a1916;margin-bottom:4px;">${nm}</div>
          <div style="font-size:12px;color:#be185d;font-weight:600;margin-bottom:12px;">${titleStr}</div>
          <div style="display:flex;flex-wrap:wrap;gap:16px;">${ctc.map(x=>`<span style="font-size:10.5px;color:#b0ada6;">${x}</span>`).join('')}</div>
        </div>
        <div style="display:grid;grid-template-columns:195px 1fr;">
          <div style="background:#fdf8ff;padding:20px 16px;border-right:1.5px solid #fde8f5;">
            ${sh('Skills','#be185d','#fde8f5')}<div>${chips(sk,'#fce7f3','#be185d','20px')}</div>
            ${sh('Education','#be185d','#fde8f5')}<div style="font-size:11.5px;font-weight:600;color:#1a1916;">${edu.degree}</div><div style="font-size:10.5px;color:#b0ada6;">${edu.school} · ${edu.year}</div>
            ${lang.length?`${sh('Languages','#be185d','#fde8f5')}${lang.map(l=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}`:''}
            ${web?`${sh('Portfolio','#be185d','#fde8f5')}<div style="font-size:10.5px;color:#6b6860;word-break:break-all;">${web}</div>`:''}
          </div>
          <div style="padding:22px 26px;">
            ${sh('About Me','#be185d','#fde8f5')}<p style="font-size:11.5px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
            ${sh('Experience','#be185d','#fde8f5')}${exp.map(e=>xp(e,'#1a1916','#b0ada6','#6b6860')).join('')}
            ${cert.length?`${sh('Certifications','#be185d','#fde8f5')}${cert.map(c=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${c}</div>`).join('')}`:''}
          </div>
        </div></div>`,

      // ── 17. CORPORATE BLUE (NEW) ────────────────────────────────────────────
      corporate: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
        <div style="background:#003366;padding:0;">
          <div style="padding:28px 36px 20px;border-bottom:3px solid #0066cc;">
            <div style="font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:8px;">Curriculum Vitae</div>
            <div style="font-family:'DM Serif Display',serif;font-size:36px;color:#fff;letter-spacing:-.01em;margin-bottom:4px;">${nm}</div>
            <div style="font-size:12px;color:#80b3ff;margin-bottom:0;">${titleStr}</div>
          </div>
          <div style="padding:10px 36px;display:flex;flex-wrap:wrap;gap:20px;">${ctc.map(x=>`<span style="font-size:10.5px;color:rgba(255,255,255,.4);">${x}</span>`).join('')}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 220px;">
          <div style="padding:24px 26px;border-right:1px solid #e8e6e0;">
            ${sh('Executive Summary','#003366','#d6e4ff')}<p style="font-size:11.5px;color:#444;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
            ${sh('Professional Experience','#003366','#d6e4ff')}
            ${exp.map(e=>`<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f0ede8;">
              <div style="font-size:12.5px;font-weight:700;color:#003366;">${e.title}</div>
              <div style="font-size:10.5px;color:#0066cc;font-weight:600;margin-bottom:4px;">${e.company}${e.period?' · <span style="color:#999;">'+e.period+'</span>':''}</div>
              <div style="font-size:11px;color:#555;line-height:1.65;">${e.desc}</div>
            </div>`).join('')}
          </div>
          <div style="padding:24px 20px;background:#f7f9ff;">
            ${sh('Core Competencies','#003366','#d6e4ff')}${bars(sk,'#003366','#d6e4ff')}
            ${sh('Education','#003366','#d6e4ff')}<div style="font-size:11.5px;font-weight:600;color:#003366;">${edu.degree}</div><div style="font-size:10.5px;color:#888;">${edu.school}</div><div style="font-size:10px;color:#aaa;margin-top:2px;">${edu.year}</div>
            ${cert.length?`${sh('Certifications','#003366','#d6e4ff')}${cert.map(c=>`<div style="font-size:10.5px;color:#555;margin-bottom:4px;">• ${c}</div>`).join('')}`:''}
            ${lang.length?`${sh('Languages','#003366','#d6e4ff')}${lang.map(l=>`<div style="font-size:11px;color:#555;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}`:''}
          </div>
        </div></div>`,

      // ── 18. MAGAZINE EDITORIAL (NEW) ────────────────────────────────────────
      magazine: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
        <div style="display:grid;grid-template-columns:1fr 1fr;min-height:200px;">
          <div style="background:#f5f4f0;padding:36px 28px;display:flex;flex-direction:column;justify-content:flex-end;">
            <div style="font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#b0ada6;margin-bottom:12px;">Professional Profile</div>
            <div style="font-family:'DM Serif Display',serif;font-size:38px;line-height:1;color:#1a1916;margin-bottom:8px;">${nm}</div>
            <div style="font-size:13px;color:#6b6860;">${titleStr}</div>
          </div>
          <div style="background:#1a1916;padding:36px 28px;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="font-size:11.5px;color:rgba(255,255,255,.65);line-height:1.7;font-style:italic;font-family:'DM Serif Display',serif;">"${sumStr.split(' ').slice(0,20).join(' ')}..."</div>
            <div>${ctc.slice(0,3).map(x=>`<div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:5px;">${x}</div>`).join('')}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-top:3px solid #1a1916;">
          <div style="padding:20px;border-right:1px solid #e8e6e0;">
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:10px;color:#1a1916;">Experience</div>
            ${exp.map(e=>`<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:700;color:#1a1916;">${e.title}</div><div style="font-size:10px;color:#9a9790;margin-bottom:3px;">${e.company}${e.period?' · '+e.period:''}</div><div style="font-size:10.5px;color:#6b6860;line-height:1.6;">${e.desc}</div></div>`).join('')}
          </div>
          <div style="padding:20px;border-right:1px solid #e8e6e0;">
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:10px;color:#1a1916;">About</div>
            <p style="font-size:11px;color:#6b6860;line-height:1.7;margin-bottom:14px;">${sumStr}</p>
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:8px;color:#1a1916;">Education</div>
            <div style="font-size:11.5px;font-weight:600;color:#1a1916;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#9a9790;">${edu.school} · ${edu.year}</div>
          </div>
          <div style="padding:20px;background:#fafaf8;">
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:10px;color:#1a1916;">Skills</div>
            ${sk.map(s=>`<div style="font-size:10.5px;color:#6b6860;padding:4px 0;border-bottom:.5px solid #e8e6e0;">${s}</div>`).join('')}
            ${lang.length?`<div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin:14px 0 8px;color:#1a1916;">Languages</div>${lang.map(l=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}`:''}
          </div>
        </div></div>`,

      // ── 19. MIDNIGHT EXECUTIVE (NEW) ────────────────────────────────────────
      midnight: () => `<div style="width:700px;background:#0a0f1e;font-family:'DM Sans',sans-serif;min-height:990px;">
        <div style="padding:40px 40px 24px;position:relative;">
          <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#00d4ff,#7b2ff7,#ff6b6b);"></div>
          <div style="font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#00d4ff;margin-bottom:10px;">${titleStr}</div>
          <div style="font-family:'DM Serif Display',serif;font-size:38px;color:#fff;margin-bottom:14px;">${nm}</div>
          <div style="display:flex;flex-wrap:wrap;gap:16px;">${ctc.map(x=>`<span style="font-size:10px;color:rgba(255,255,255,.3);">${x}</span>`).join('')}</div>
        </div>
        <div style="margin:0 40px;height:1px;background:rgba(255,255,255,.06);"></div>
        <div style="display:grid;grid-template-columns:1fr 210px;padding:24px 40px;gap:32px;">
          <div>
            <div style="font-size:8px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#00d4ff;margin-bottom:10px;">Profile</div>
            <p style="font-size:11px;color:rgba(255,255,255,.5);line-height:1.75;margin-bottom:24px;">${sumStr}</p>
            <div style="font-size:8px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#00d4ff;margin-bottom:12px;">Experience</div>
            ${exp.map(e=>`<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.05);">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2px;">
                <div style="font-size:13px;font-weight:700;color:#fff;">${e.title}</div>
                <div style="font-size:9.5px;color:#00d4ff;font-weight:600;white-space:nowrap;margin-left:8px;">${e.period||''}</div>
              </div>
              <div style="font-size:10.5px;color:rgba(255,255,255,.3);margin-bottom:5px;">${e.company}</div>
              <div style="font-size:11px;color:rgba(255,255,255,.45);line-height:1.6;">${e.desc}</div>
            </div>`).join('')}
          </div>
          <div>
            <div style="font-size:8px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#7b2ff7;margin-bottom:12px;">Skills</div>
            ${sk.map((s,i)=>`<div style="margin-bottom:8px;"><div style="font-size:10.5px;color:rgba(255,255,255,.55);margin-bottom:3px;">${s}</div><div style="height:2px;background:rgba(255,255,255,.07);border-radius:1px;"><div style="width:${pct(i)}%;height:100%;background:linear-gradient(90deg,#00d4ff,#7b2ff7);border-radius:1px;"></div></div></div>`).join('')}
            <div style="font-size:8px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#7b2ff7;margin:20px 0 10px;">Education</div>
            <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.7);">${edu.degree}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:3px;">${edu.school} · ${edu.year}</div>
            ${lang.length?`<div style="font-size:8px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#7b2ff7;margin:16px 0 8px;">Languages</div>${lang.map(l=>`<div style="font-size:10.5px;color:rgba(255,255,255,.45);margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}`:''}
          </div>
        </div></div>`,

      // ── 20. CLEAN PROFESSIONAL (NEW) ────────────────────────────────────────
      clean: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;padding:40px 44px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;padding-bottom:16px;border-bottom:2px solid #1a1916;">
          <div>
            <div style="font-family:'DM Serif Display',serif;font-size:36px;color:#1a1916;letter-spacing:-.01em;margin-bottom:4px;">${nm}</div>
            <div style="font-size:14px;color:#555;font-weight:500;">${titleStr}</div>
          </div>
          <div style="text-align:right;padding-top:6px;">${ctc.map(x=>`<div style="font-size:10.5px;color:#888;margin-bottom:2px;">${x}</div>`).join('')}</div>
        </div>
        <div style="font-size:11.5px;color:#555;line-height:1.75;margin-bottom:20px;">${sumStr}</div>
        <div style="display:grid;grid-template-columns:1fr 190px;gap:28px;">
          <div>
            <div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1a1916;border-bottom:2px solid #1a1916;padding-bottom:4px;margin-bottom:12px;">Experience</div>
            ${exp.map(e=>`<div style="margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
                <div style="font-size:12.5px;font-weight:700;color:#1a1916;">${e.title}</div>
                <div style="font-size:10px;color:#888;">${e.period||''}</div>
              </div>
              <div style="font-size:10.5px;color:#888;margin-bottom:5px;font-style:italic;">${e.company}</div>
              <div style="font-size:11px;color:#555;line-height:1.65;">${e.desc}</div>
            </div>`).join('')}
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1a1916;border-bottom:2px solid #1a1916;padding-bottom:4px;margin-bottom:12px;">Skills</div>
            ${sk.map(s=>`<div style="font-size:11px;color:#555;padding:4px 0;border-bottom:1px solid #f0ede8;">${s}</div>`).join('')}
            <div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1a1916;border-bottom:2px solid #1a1916;padding-bottom:4px;margin:16px 0 10px;">Education</div>
            <div style="font-size:12px;font-weight:700;color:#1a1916;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#888;margin-top:2px;">${edu.school}</div>
            <div style="font-size:10px;color:#aaa;margin-top:2px;">${edu.year}</div>
            ${cert.length?`<div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1a1916;border-bottom:2px solid #1a1916;padding-bottom:4px;margin:16px 0 10px;">Certifications</div>${cert.map(c=>`<div style="font-size:10.5px;color:#555;margin-bottom:4px;">${c}</div>`).join('')}`:''}
            ${web?`<div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1a1916;border-bottom:2px solid #1a1916;padding-bottom:4px;margin:16px 0 8px;">Portfolio</div><div style="font-size:10.5px;color:#2a5bd7;word-break:break-all;">${web}</div>`:''}
          </div>
        </div></div>`,

      // ── 21. SLATE IMPACT (NEW) ──────────────────────────────────────────────
      slate: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
        <div style="background:#1e293b;padding:36px 40px 24px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;right:0;width:180px;height:100%;background:linear-gradient(135deg,#3b82f6,#1d4ed8);opacity:.15;"></div>
          <div style="position:relative;">
            <div style="font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#64748b;margin-bottom:10px;">${titleStr}</div>
            <div style="font-family:'DM Serif Display',serif;font-size:36px;color:#fff;letter-spacing:-.01em;margin-bottom:14px;">${nm}</div>
            <div style="display:flex;flex-wrap:wrap;gap:18px;">${ctc.map(x => '<span style="font-size:10.5px;color:#475569;">'+x+'</span>').join('')}</div>
          </div>
        </div>
        <div style="height:4px;background:linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899);"></div>
        <div style="display:grid;grid-template-columns:1fr 205px;">
          <div style="padding:24px 26px;border-right:1px solid #f1f5f9;">
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#3b82f6;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #eff6ff;">Profile</div>
            <p style="font-size:11.5px;color:#475569;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#3b82f6;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #eff6ff;">Experience</div>
            ${exp.map(e => '<div style="margin-bottom:14px;"><div style="font-size:12.5px;font-weight:700;color:#1e293b;">'+e.title+'</div><div style="font-size:10.5px;color:#94a3b8;margin-bottom:4px;font-weight:500;">'+(e.company||'')+(e.period?' · '+e.period:'')+'</div><div style="font-size:11px;color:#64748b;line-height:1.65;">'+(e.desc||'')+'</div></div>').join('')}
          </div>
          <div style="padding:24px 20px;background:#f8fafc;">
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#3b82f6;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #eff6ff;">Skills</div>
            ${bars(sk,'#3b82f6','#dbeafe')}
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#3b82f6;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #eff6ff;">Education</div>
            <div style="font-size:11.5px;font-weight:600;color:#1e293b;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#94a3b8;margin-top:2px;">${edu.school} · ${edu.year}</div>
            ${lang.length ? '<div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#3b82f6;margin:16px 0 8px;padding-bottom:5px;border-bottom:2px solid #eff6ff;">Languages</div>'+lang.map(l=>'<div style="font-size:11px;color:#64748b;margin-bottom:4px;">'+l.name+' — '+l.level+'</div>').join('') : ''}
          </div>
        </div></div>`,

      // ── 22. TERRA (NEW) — warm earthy tones ─────────────────────────────────
      terra: () => `<div style="width:700px;background:#faf8f5;font-family:'DM Sans',sans-serif;">
        <div style="padding:36px 40px 0;">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:20px;border-bottom:2px solid #d6a97a;">
            <div>
              <div style="font-family:'DM Serif Display',serif;font-size:38px;color:#3d2b1a;letter-spacing:-.02em;line-height:1.05;margin-bottom:6px;">${nm}</div>
              <div style="font-size:12px;color:#a0714f;font-weight:600;letter-spacing:.04em;">${titleStr}</div>
            </div>
            <div style="text-align:right;">${ctc.map(x=>'<div style="font-size:10px;color:#a0714f;margin-bottom:3px;">'+x+'</div>').join('')}</div>
          </div>
        </div>
        <div style="padding:0 40px 32px;">
          <div style="display:grid;grid-template-columns:1fr 195px;gap:28px;padding-top:20px;">
            <div>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#a0714f;margin-bottom:9px;">Profile</div>
              <p style="font-size:11.5px;color:#5c3d2e;line-height:1.75;margin-bottom:18px;">${sumStr}</p>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#a0714f;margin-bottom:10px;">Experience</div>
              ${exp.map(e=>'<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #e8d5c4;"><div style="font-size:12.5px;font-weight:700;color:#3d2b1a;">'+(e.title||'')+'</div><div style="font-size:10.5px;color:#a0714f;margin-bottom:4px;">'+(e.company||'')+(e.period?' · '+e.period:'')+'</div><div style="font-size:11px;color:#6b5040;line-height:1.65;">'+(e.desc||'')+'</div></div>').join('')}
            </div>
            <div>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#a0714f;margin-bottom:9px;">Skills</div>
              ${sk.map(s=>'<div style="font-size:11px;color:#6b5040;padding:5px 0;border-bottom:1px solid #e8d5c4;">'+s+'</div>').join('')}
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#a0714f;margin:16px 0 9px;">Education</div>
              <div style="font-size:11.5px;font-weight:600;color:#3d2b1a;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#a0714f;margin-top:2px;">${edu.school} · ${edu.year}</div>
              ${cert.length?'<div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#a0714f;margin:16px 0 9px;">Certifications</div>'+cert.map(c=>'<div style="font-size:10.5px;color:#6b5040;margin-bottom:4px;">'+c+'</div>').join(''):''}
              ${lang.length?'<div style="font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#a0714f;margin:16px 0 9px;">Languages</div>'+lang.map(l=>'<div style="font-size:11px;color:#6b5040;margin-bottom:4px;">'+l.name+' — '+l.level+'</div>').join(''):''}
            </div>
          </div>
        </div></div>`,

      // ── 23. PRISM (NEW) — colourful accent strip ─────────────────────────────
      prism: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;min-height:990px;">
        <div style="display:grid;grid-template-columns:8px 1fr;">
          <div style="background:linear-gradient(180deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#10b981);"></div>
          <div>
            <div style="padding:32px 32px 20px;border-bottom:1px solid #f1f5f9;">
              <div style="font-family:'DM Serif Display',serif;font-size:34px;color:#111827;margin-bottom:4px;letter-spacing:-.01em;">${nm}</div>
              <div style="font-size:12px;color:#6366f1;font-weight:700;margin-bottom:12px;">${titleStr}</div>
              <div style="display:flex;flex-wrap:wrap;gap:16px;">${ctc.map(x=>'<span style="font-size:10.5px;color:#9ca3af;">'+x+'</span>').join('')}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 195px;">
              <div style="padding:22px 26px 22px 32px;border-right:1px solid #f1f5f9;">
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#6366f1;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #eef2ff;">About</div>
                <p style="font-size:11.5px;color:#4b5563;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#6366f1;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #eef2ff;">Experience</div>
                ${exp.map(e=>'<div style="margin-bottom:14px;"><div style="font-size:12.5px;font-weight:700;color:#111827;">'+(e.title||'')+'</div><div style="font-size:10.5px;color:#9ca3af;margin-bottom:4px;">'+(e.company||'')+(e.period?' · '+e.period:'')+'</div><div style="font-size:11px;color:#6b7280;line-height:1.65;">'+(e.desc||'')+'</div></div>').join('')}
              </div>
              <div style="padding:22px 22px 22px 20px;background:#fafafa;">
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8b5cf6;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #f5f3ff;">Skills</div>
                <div style="margin-bottom:4px;">${chips(sk,'#eef2ff','#6366f1','20px')}</div>
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8b5cf6;margin:16px 0 9px;padding-bottom:5px;border-bottom:2px solid #f5f3ff;">Education</div>
                <div style="font-size:11.5px;font-weight:600;color:#111827;">${edu.degree}</div>
                <div style="font-size:10.5px;color:#9ca3af;margin-top:2px;">${edu.school} · ${edu.year}</div>
                ${lang.length?'<div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8b5cf6;margin:16px 0 9px;padding-bottom:5px;border-bottom:2px solid #f5f3ff;">Languages</div>'+lang.map(l=>'<div style="font-size:11px;color:#6b7280;margin-bottom:4px;">'+l.name+' — '+l.level+'</div>').join(''):''}
              </div>
            </div>
          </div>
        </div></div>`,

      // ── 24. IVORY (NEW) — soft luxury off-white ──────────────────────────────
      ivory: () => `<div style="width:700px;background:#fffef9;font-family:'DM Sans',sans-serif;padding:44px 50px;">
        <div style="text-align:center;margin-bottom:22px;">
          <div style="font-family:'DM Serif Display',serif;font-size:40px;color:#2c2c2c;letter-spacing:-.02em;margin-bottom:6px;">${nm}</div>
          <div style="font-size:12px;color:#9a8c7e;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;">${titleStr}</div>
          <div style="display:flex;justify-content:center;gap:18px;flex-wrap:wrap;">${ctc.map(x=>'<span style="font-size:10.5px;color:#b0a898;">'+x+'</span>').join('')}</div>
        </div>
        <div style="height:1px;background:linear-gradient(90deg,transparent,#c8b89a,transparent);margin-bottom:22px;"></div>
        <div style="font-size:11.5px;color:#6b6057;line-height:1.8;text-align:center;max-width:500px;margin:0 auto 22px;font-style:italic;">${sumStr}</div>
        <div style="height:1px;background:linear-gradient(90deg,transparent,#c8b89a,transparent);margin-bottom:22px;"></div>
        <div style="display:grid;grid-template-columns:1fr 180px;gap:28px;">
          <div>
            <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#9a8c7e;margin-bottom:10px;">Experience</div>
            ${exp.map(e=>'<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #ede8e0;"><div style="font-size:12.5px;font-weight:700;color:#2c2c2c;">'+(e.title||'')+'</div><div style="font-size:10.5px;color:#b0a898;font-style:italic;margin-bottom:4px;">'+(e.company||'')+(e.period?' · '+e.period:'')+'</div><div style="font-size:11px;color:#6b6057;line-height:1.65;">'+(e.desc||'')+'</div></div>').join('')}
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#9a8c7e;margin-bottom:10px;">Skills</div>
            ${sk.map(s=>'<div style="font-size:11px;color:#6b6057;padding:4px 0;border-bottom:1px solid #ede8e0;">'+s+'</div>').join('')}
            <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#9a8c7e;margin:16px 0 10px;">Education</div>
            <div style="font-size:11.5px;font-weight:600;color:#2c2c2c;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#b0a898;margin-top:2px;">${edu.school} · ${edu.year}</div>
            ${lang.length?'<div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#9a8c7e;margin:16px 0 9px;">Languages</div>'+lang.map(l=>'<div style="font-size:11px;color:#6b6057;margin-bottom:4px;">'+l.name+' — '+l.level+'</div>').join(''):''}
          </div>
        </div></div>`,

      // ── 25. BOLD SPLIT (NEW) — dramatic half-half layout ─────────────────────
      split: () => `<div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;display:grid;grid-template-columns:280px 1fr;min-height:990px;">
        <div style="background:#111827;padding:32px 22px;display:flex;flex-direction:column;">
          ${photoOrInit(d,'80px','rgba(255,255,255,.1)','#fff','28px')}
          <div style="font-family:'DM Serif Display',serif;font-size:22px;color:#fff;margin:14px 0 2px;line-height:1.15;">${nm}</div>
          <div style="font-size:10px;color:#4b5563;letter-spacing:.12em;text-transform:uppercase;margin-bottom:20px;">${titleStr}</div>
          <div style="height:1px;background:rgba(255,255,255,.08);margin-bottom:18px;"></div>
          <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#374151;margin-bottom:8px;">Contact</div>
          ${ctc.map(x=>'<div style="font-size:10px;color:#6b7280;margin-bottom:5px;word-break:break-all;">'+x+'</div>').join('')}
          <div style="height:1px;background:rgba(255,255,255,.08);margin:16px 0;"></div>
          <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#374151;margin-bottom:10px;">Skills</div>
          ${bars(sk,'#f59e0b','rgba(255,255,255,.1)')}
          <div style="flex:1;"></div>
          <div style="height:1px;background:rgba(255,255,255,.08);margin:16px 0;"></div>
          <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#374151;margin-bottom:8px;">Education</div>
          <div style="font-size:11px;color:#9ca3af;font-weight:600;margin-bottom:2px;">${edu.degree}</div>
          <div style="font-size:10px;color:#4b5563;">${edu.school} · ${edu.year}</div>
          ${lang.length?'<div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#374151;margin:14px 0 8px;">Languages</div>'+lang.map(l=>'<div style="font-size:10.5px;color:#6b7280;margin-bottom:4px;">'+l.name+' — '+l.level+'</div>').join(''):''}
        </div>
        <div style="padding:32px 26px;">
          <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#f59e0b;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #fef3c7;">About</div>
          <p style="font-size:11.5px;color:#374151;line-height:1.7;margin-bottom:4px;">${sumStr}</p>
          <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#f59e0b;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #fef3c7;">Experience</div>
          ${exp.map(e=>'<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f9fafb;"><div style="font-size:12.5px;font-weight:700;color:#111827;">'+(e.title||'')+'</div><div style="font-size:10.5px;color:#9ca3af;margin-bottom:4px;">'+(e.company||'')+(e.period?' · '+e.period:'')+'</div><div style="font-size:11px;color:#6b7280;line-height:1.65;">'+(e.desc||'')+'</div></div>').join('')}
          ${cert.length?'<div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#f59e0b;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #fef3c7;">Certifications</div>'+cert.map(c=>'<div style="font-size:11px;color:#374151;margin-bottom:4px;">'+c+'</div>').join(''):''}
        </div></div>`,
    }

    return (T[tpl] || T.executive)()
  }

  return { render }
}