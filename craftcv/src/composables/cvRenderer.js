// @ts-nocheck
// ── helpers ───────────────────────────────────────────────────
const LVL = [88, 82, 76, 90, 85, 72, 94, 79, 83, 68]
const pct = (i) => LVL[i % LVL.length]

const skBars = (sk, fg = '#2a5bd7', bg = '#e8e6e0') =>
  sk.map((s, i) => `
    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px;color:inherit;opacity:.75;">
        <span>${s}</span><span>${pct(i)}%</span>
      </div>
      <div style="height:3px;background:${bg};border-radius:2px;">
        <div style="width:${pct(i)}%;height:100%;background:${fg};border-radius:2px;"></div>
      </div>
    </div>`
  ).join('')

const skDots = (sk, col) =>
  sk.map((s, i) => `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
      <div style="display:flex;gap:3px;">${[1,2,3,4,5].map(n => `<div style="width:6px;height:6px;border-radius:50%;background:${n <= Math.round(pct(i)/20) ? col : 'rgba(255,255,255,.18)'};"></div>`).join('')}</div>
      <span style="font-size:10.5px;">${s}</span>
    </div>`
  ).join('')

const skChips = (sk, bg, fg, br = '4px') =>
  sk.map(s => `<span style="display:inline-block;background:${bg};color:${fg};font-size:10px;font-weight:600;padding:3px 9px;border-radius:${br};margin:2px 3px 2px 0;">${s}</span>`).join('')

const skList = (sk, col) =>
  sk.map(s => `<div style="font-size:11px;color:${col};padding:5px 0;border-bottom:1px solid rgba(0,0,0,.06);display:flex;align-items:center;gap:6px;"><div style="width:4px;height:4px;border-radius:50%;background:currentColor;flex-shrink:0;opacity:.4;"></div>${s}</div>`).join('')

const exItem = (e, titleCol, metaCol, descCol) => `
  <div style="margin-bottom:14px;">
    <div style="font-size:12.5px;font-weight:700;color:${titleCol};margin-bottom:1px;">${e.title}</div>
    <div style="font-size:10.5px;color:${metaCol};margin-bottom:4px;font-weight:500;">${e.company} · ${e.period}</div>
    <div style="font-size:11px;color:${descCol};line-height:1.65;">${e.desc}</div>
  </div>`

const sectionHead = (label, col, borderCol) => `
  <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${col};margin:18px 0 9px;padding-bottom:5px;border-bottom:1.5px solid ${borderCol};">${label}</div>`

const photoOrInitials = (d, size, bg, fg, fontSize) => d.photo
  ? `<img src="${d.photo}" style="width:${size};height:${size};border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.25);display:block;" alt="${d.fn}" />`
  : `<div style="width:${size};height:${size};border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:${fontSize};font-weight:700;color:${fg};font-family:'DM Serif Display',serif;flex-shrink:0;">${(d.fn?.[0]||'A')+(d.ln?.[0]||'M')}</div>`

export function useCvRenderer() {
  function render(tpl, d) {
    const nm   = `${d.fn || 'First'} ${d.ln || 'Last'}`
    const init = (d.fn?.[0]||'A') + (d.ln?.[0]||'M')
    const sk   = d.skills?.length ? d.skills : ['Leadership', 'Communication', 'Project Management', 'Analysis']
    const exp  = d.experiences?.length ? d.experiences : [{ title:'Role', company:'Company', period:'2020–Present', desc:'Description of your responsibilities and achievements.' }]
    const edu  = d.education || { degree:'Degree', school:'University', year:'2020' }
    const cert = d.certifications || []
    const langs = d.languages || []
    const contacts = [d.email, d.phone, d.loc, d.li].filter(Boolean)

    const T = {

      // ── 1. EXECUTIVE SLATE ──────────────────────────────────
      executive: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
          <div style="background:#1a1916;padding:36px 40px 28px;">
            <div style="font-family:'DM Serif Display',serif;font-size:34px;color:#fff;letter-spacing:-.01em;margin-bottom:4px;">${nm}</div>
            <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5a5855;margin-bottom:16px;font-weight:500;">${d.title||'Job Title'}</div>
            <div style="display:flex;flex-wrap:wrap;gap:16px;">
              ${contacts.map(x=>`<span style="font-size:10.5px;color:#4a4845;display:flex;align-items:center;gap:5px;">${x}</span>`).join('')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:200px 1fr;">
            <div style="background:#f9f8f4;padding:24px 18px;border-right:1px solid #ece9e2;">
              ${sectionHead('Skills','#2a5bd7','#dce6f7')}
              ${skBars(sk,'#2a5bd7','#dce6f7')}
              ${sectionHead('Education','#2a5bd7','#dce6f7')}
              <div style="font-size:11.5px;color:#1a1916;font-weight:600;margin-bottom:2px;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#9a9790;">${edu.school}</div>
              <div style="font-size:10px;color:#b0ada6;margin-top:2px;">${edu.year}</div>
              ${langs.length ? `${sectionHead('Languages','#2a5bd7','#dce6f7')}${langs.map(l=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;"><span style="font-weight:600;color:#1a1916;">${l.name}</span> — ${l.level}</div>`).join('')}` : ''}
            </div>
            <div style="padding:24px 28px;">
              ${sectionHead('Profile','#2a5bd7','#dce6f7')}
              <p style="font-size:11.5px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${d.sum||'Professional summary.'}</p>
              ${sectionHead('Experience','#2a5bd7','#dce6f7')}
              ${exp.map(e=>exItem(e,'#1a1916','#9a9790','#6b6860')).join('')}
              ${cert.length ? `${sectionHead('Certifications','#2a5bd7','#dce6f7')}<div style="font-size:11px;color:#6b6860;line-height:2;">${cert.map(c=>`<div style="display:flex;align-items:center;gap:6px;"><div style="width:4px;height:4px;border-radius:50%;background:#2a5bd7;flex-shrink:0;"></div>${c}</div>`).join('')}</div>` : ''}
            </div>
          </div>
        </div>`,

      // ── 2. MODERN AZURE ────────────────────────────────────
      modern: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
          <div style="background:linear-gradient(135deg,#1a3fa0 0%,#2a5bd7 60%,#3d6ee0 100%);padding:32px 36px;display:flex;align-items:center;gap:20px;">
            ${photoOrInitials(d,'72px','rgba(255,255,255,.15)','#fff','26px')}
            <div>
              <div style="font-size:26px;font-weight:700;color:#fff;margin-bottom:3px;letter-spacing:-.01em;">${nm}</div>
              <div style="font-size:12px;color:rgba(255,255,255,.65);margin-bottom:10px;">${d.title||'Job Title'}</div>
              <div style="display:flex;flex-wrap:wrap;gap:14px;">
                ${contacts.map(x=>`<span style="font-size:10.5px;color:rgba(255,255,255,.5);">${x}</span>`).join('')}
              </div>
            </div>
          </div>
          <div style="padding:26px 32px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px;">
              <div>
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#1a3fa0;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #e8eefb;">About</div>
                <p style="font-size:11px;color:#6b6860;line-height:1.7;">${d.sum||'Professional summary.'}</p>
              </div>
              <div>
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#1a3fa0;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #e8eefb;">Skills</div>
                <div>${skChips(sk,'#e8eefb','#1a3fa0','20px')}</div>
              </div>
            </div>
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#1a3fa0;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #e8eefb;">Experience</div>
            ${exp.map(e=>exItem(e,'#1a1916','#9a9790','#6b6860')).join('')}
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#1a3fa0;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #e8eefb;">Education</div>
            <div style="font-size:11.5px;color:#1a1916;font-weight:600;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#9a9790;margin-top:1px;">${edu.school} · ${edu.year}</div>
          </div>
        </div>`,

      // ── 3. MINIMAL EDITORIAL ────────────────────────────────
      minimal: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;padding:52px 58px;">
          <div style="font-family:'DM Serif Display',serif;font-size:44px;color:#1a1916;letter-spacing:-.03em;line-height:1;">${nm}</div>
          <div style="font-size:13px;color:#9a9790;margin:6px 0 16px;font-weight:400;">${d.title||'Job Title'}</div>
          <div style="height:.5px;background:#1a1916;margin-bottom:14px;"></div>
          <div style="display:flex;gap:22px;font-size:10.5px;color:#b0ada6;margin-bottom:28px;flex-wrap:wrap;">
            ${contacts.map(x=>`<span>${x}</span>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 210px;gap:40px;">
            <div>
              <div style="font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#1a1916;margin-bottom:8px;">Profile</div>
              <p style="font-size:11.5px;color:#6b6860;line-height:1.75;margin-bottom:22px;">${d.sum||'Professional summary.'}</p>
              <div style="font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#1a1916;margin-bottom:10px;">Experience</div>
              ${exp.map(e=>`
                <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:.5px solid #f0ede8;">
                  <div style="font-size:13px;font-weight:700;color:#1a1916;margin-bottom:2px;">${e.title}</div>
                  <div style="font-family:'DM Serif Display',serif;font-style:italic;font-size:11px;color:#b0ada6;margin-bottom:5px;">${e.company} · ${e.period}</div>
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
              ${langs.length ? `<div style="font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#1a1916;margin:18px 0 8px;">Languages</div>${langs.map(l=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}` : ''}
            </div>
          </div>
        </div>`,

      // ── 4. BOLD NOIR ────────────────────────────────────────
      bold: () => `
        <div style="width:700px;background:#0f0e0c;font-family:'DM Sans',sans-serif;min-height:990px;">
          <div style="padding:36px 36px 0;display:flex;align-items:flex-start;gap:0;position:relative;">
            <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#2a5bd7,#6236b0);"></div>
            <div style="padding-left:24px;padding-bottom:28px;border-bottom:1px solid #1e1d1a;width:100%;">
              <div style="font-size:30px;font-weight:800;color:#fff;letter-spacing:-.01em;margin-bottom:4px;">${nm}</div>
              <div style="font-size:11px;color:#2a5bd7;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px;">${d.title||'Job Title'}</div>
              <div style="display:flex;flex-wrap:wrap;gap:16px;">
                ${contacts.map(x=>`<span style="font-size:10.5px;color:#4a4845;">${x}</span>`).join('')}
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 205px;padding:0 36px;">
            <div style="padding:24px 24px 24px 0;border-right:1px solid #1e1d1a;">
              ${sectionHead('Profile','#2a5bd7','#1e2d4a')}
              <p style="font-size:11px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${d.sum||'Professional summary.'}</p>
              ${sectionHead('Experience','#2a5bd7','#1e2d4a')}
              ${exp.map(e=>`
                <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #1a1916;">
                  <div style="font-size:13px;font-weight:700;color:#d0e4ff;margin-bottom:1px;">${e.title}</div>
                  <div style="font-size:10.5px;color:#2d3d55;margin-bottom:4px;">${e.company} · ${e.period}</div>
                  <div style="font-size:11px;color:#4a5568;line-height:1.65;">${e.desc}</div>
                </div>`).join('')}
            </div>
            <div style="padding:24px 0 24px 20px;">
              ${sectionHead('Skills','#2a5bd7','#1e2d4a')}
              ${sk.map(s=>`<div style="font-size:11px;color:#4a5568;padding:5px 0;border-bottom:1px solid #1a1916;">${s}</div>`).join('')}
              ${sectionHead('Education','#2a5bd7','#1e2d4a')}
              <div style="font-size:11.5px;font-weight:600;color:#d0e4ff;margin-bottom:2px;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#2d3d55;">${edu.school}</div>
              <div style="font-size:10px;color:#1e2d4a;margin-top:2px;">${edu.year}</div>
            </div>
          </div>
        </div>`,

      // ── 5. CREATIVE VIOLET ──────────────────────────────────
      creative: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;display:grid;grid-template-columns:205px 1fr;min-height:990px;">
          <div style="background:linear-gradient(160deg,#3b1d8a 0%,#6236b0 100%);padding:30px 18px;">
            <div style="width:64px;height:64px;border-radius:16px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;font-family:'DM Serif Display',serif;margin-bottom:12px;">${init}</div>
            <div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:2px;">${nm}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,.45);margin-bottom:20px;">${d.title||'Job Title'}</div>
            <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:8px;">Contact</div>
            ${contacts.map(x=>`<div style="font-size:10.5px;color:rgba(255,255,255,.65);margin-bottom:5px;word-break:break-all;">${x}</div>`).join('')}
            <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin:16px 0 8px;">Skills</div>
            ${skDots(sk,'rgba(255,255,255,.9)')}
            <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin:16px 0 8px;">Education</div>
            <div style="font-size:11px;color:rgba(255,255,255,.75);font-weight:600;margin-bottom:2px;">${edu.degree}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,.45);">${edu.school}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:2px;">${edu.year}</div>
            ${langs.length ? `<div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin:16px 0 8px;">Languages</div>${langs.map(l=>`<div style="font-size:10.5px;color:rgba(255,255,255,.65);margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}` : ''}
          </div>
          <div style="padding:28px 26px;">
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#6236b0;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #f0ebfa;">Profile</div>
            <p style="font-size:11.5px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${d.sum||'Professional summary.'}</p>
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#6236b0;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #f0ebfa;">Experience</div>
            ${exp.map(e=>exItem(e,'#1a1916','#9a9790','#6b6860')).join('')}
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#6236b0;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #f0ebfa;">Key Skills</div>
            <div>${skChips(sk,'#f0ebfa','#6236b0','20px')}</div>
          </div>
        </div>`,

      // ── 6. ACADEMIC ─────────────────────────────────────────
      academic: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;padding:44px 52px;">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-family:'DM Serif Display',serif;font-size:32px;color:#1a1916;letter-spacing:-.01em;">${nm}</div>
            <div style="font-size:13px;color:#6b6860;margin:5px 0 12px;">${d.title||'Job Title'}</div>
            <div style="display:flex;justify-content:center;gap:18px;font-size:10.5px;color:#b0ada6;flex-wrap:wrap;">
              ${contacts.map(x=>`<span>${x}</span>`).join('')}
            </div>
          </div>
          <div style="border-top:2.5px solid #1a1916;border-bottom:1px solid #1a1916;margin-bottom:20px;padding:4px 0;"></div>
          <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin-bottom:10px;">Professional Summary</div>
          <p style="font-size:11.5px;color:#6b6860;line-height:1.75;margin-bottom:18px;">${d.sum||'Professional summary.'}</p>
          <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin-bottom:10px;">Work Experience</div>
          ${exp.map(e=>`
            <div style="margin-bottom:14px;display:grid;grid-template-columns:100px 1fr;gap:16px;">
              <div style="font-size:10px;color:#b0ada6;font-style:italic;padding-top:2px;text-align:right;">${e.period}</div>
              <div>
                <div style="font-size:12.5px;font-weight:700;color:#1a1916;">${e.title}</div>
                <div style="font-size:10.5px;color:#9a9790;margin-bottom:4px;">${e.company}</div>
                <div style="font-size:11px;color:#6b6860;line-height:1.65;">${e.desc}</div>
              </div>
            </div>`).join('')}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:8px;">
            <div>
              <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin-bottom:10px;">Education</div>
              <div style="font-size:12.5px;font-weight:700;color:#1a1916;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school}, ${edu.year}</div>
              ${cert.length ? `<div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin:14px 0 8px;">Certifications</div>${cert.map(c=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${c}</div>`).join('')}` : ''}
            </div>
            <div>
              <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin-bottom:10px;">Core Skills</div>
              <div style="display:flex;flex-wrap:wrap;gap:5px;">${sk.map(s=>`<span style="font-size:10.5px;color:#6b6860;">${s}</span>`).map((s,i,a)=>i<a.length-1?s+'<span style="color:#c8c4be;"> ·</span>':s).join('')}</div>
              ${langs.length ? `<div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a1916;border-bottom:1px solid #e8e6e0;padding-bottom:5px;margin:14px 0 8px;">Languages</div>${langs.map(l=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}` : ''}
            </div>
          </div>
        </div>`,

      // ── 7. ELEGANT GOLD ─────────────────────────────────────
      elegant: () => `
        <div style="width:700px;background:#fdf9f0;font-family:'DM Sans',sans-serif;">
          <div style="background:#1a1208;padding:32px 40px;">
            <div style="font-family:'DM Serif Display',serif;font-size:30px;color:#f0e0b0;letter-spacing:-.01em;margin-bottom:4px;">${nm}</div>
            <div style="font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#7a6840;margin-bottom:14px;">${d.title||'Job Title'}</div>
            <div style="height:1px;background:linear-gradient(90deg,#c9a84c,rgba(201,168,76,0));margin-bottom:14px;"></div>
            <div style="display:flex;flex-wrap:wrap;gap:18px;">
              ${contacts.map(x=>`<span style="font-size:10.5px;color:#5a4c2a;">${x}</span>`).join('')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1.6fr 1fr;">
            <div style="padding:24px 26px;border-right:1px solid #e8dcc0;">
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#c9a84c;margin-bottom:9px;padding-bottom:5px;border-bottom:1px solid #ede2c0;">Profile</div>
              <p style="font-size:11.5px;color:#5a4f3a;line-height:1.7;margin-bottom:4px;">${d.sum||'Professional summary.'}</p>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#c9a84c;margin:18px 0 9px;padding-bottom:5px;border-bottom:1px solid #ede2c0;">Experience</div>
              ${exp.map(e=>`
                <div style="margin-bottom:14px;">
                  <div style="font-size:12.5px;font-weight:700;color:#1a1208;margin-bottom:1px;">${e.title}</div>
                  <div style="font-size:10.5px;color:#8a7a5a;margin-bottom:4px;">${e.company} · ${e.period}</div>
                  <div style="font-size:11px;color:#5a4f3a;line-height:1.65;">${e.desc}</div>
                </div>`).join('')}
            </div>
            <div style="padding:24px 20px;background:#f5f0e0;">
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#c9a84c;margin-bottom:9px;padding-bottom:5px;border-bottom:1px solid #ede2c0;">Skills</div>
              ${sk.map(s=>`<div style="font-size:11px;color:#6b5f3a;padding:5px 0;border-bottom:1px solid #ede2c0;">${s}</div>`).join('')}
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#c9a84c;margin:18px 0 9px;padding-bottom:5px;border-bottom:1px solid #ede2c0;">Education</div>
              <div style="font-size:11.5px;font-weight:600;color:#1a1208;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#8a7a5a;margin-top:2px;">${edu.school} · ${edu.year}</div>
              ${cert.length ? `<div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#c9a84c;margin:18px 0 9px;padding-bottom:5px;border-bottom:1px solid #ede2c0;">Certifications</div>${cert.map(c=>`<div style="font-size:10.5px;color:#6b5f3a;margin-bottom:4px;">${c}</div>`).join('')}` : ''}
            </div>
          </div>
        </div>`,

      // ── 8. TECH DARK ────────────────────────────────────────
      tech: () => `
        <div style="width:700px;background:#0c1018;font-family:'JetBrains Mono',monospace;min-height:990px;">
          <div style="padding:28px 32px;border-bottom:1px solid #1e2d4a;">
            <div style="display:inline-flex;align-items:center;gap:6px;background:#0d1e38;border:1px solid #1a3a6a;padding:3px 10px;border-radius:4px;margin-bottom:12px;">
              <div style="width:6px;height:6px;border-radius:50%;background:#22c55e;"></div>
              <span style="font-size:9px;color:#60a5fa;letter-spacing:.06em;">RESUME.json</span>
            </div>
            <div style="font-size:26px;font-weight:700;color:#e8f0ff;margin-bottom:4px;letter-spacing:-.01em;font-family:'DM Sans',sans-serif;">${nm}</div>
            <div style="font-size:11px;color:#60a5fa;margin-bottom:12px;letter-spacing:.02em;">${d.title||'Job Title'}</div>
            <div style="display:flex;flex-wrap:wrap;gap:14px;">
              ${contacts.map(x=>`<span style="font-size:9.5px;color:#2d3d55;">${x}</span>`).join('')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 195px;">
            <div style="padding:22px 26px;border-right:1px solid #1e2d4a;">
              <div style="font-size:8px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;margin-bottom:10px;display:flex;align-items:center;gap:6px;"><span style="color:#2d3d55;">//</span> about</div>
              <p style="font-size:11px;color:#4a5568;line-height:1.7;margin-bottom:18px;">${d.sum||'Professional summary.'}</p>
              <div style="font-size:8px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;margin-bottom:10px;display:flex;align-items:center;gap:6px;"><span style="color:#2d3d55;">//</span> experience</div>
              ${exp.map(e=>`
                <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #1e2d4a;">
                  <div style="font-size:12.5px;font-weight:700;color:#d0e4ff;margin-bottom:1px;">${e.title}</div>
                  <div style="font-size:9.5px;color:#2d3d55;margin-bottom:4px;">${e.company} · ${e.period}</div>
                  <div style="font-size:11px;color:#4a5568;line-height:1.65;">${e.desc}</div>
                </div>`).join('')}
              <div style="font-size:8px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;margin-bottom:10px;display:flex;align-items:center;gap:6px;"><span style="color:#2d3d55;">//</span> stack</div>
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
          </div>
        </div>`,

      // ── 9. PASTEL ROSE ──────────────────────────────────────
      pastel: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
          <div style="background:linear-gradient(135deg,#fdf2f8 0%,#fef3f2 50%,#f0f9f4 100%);padding:30px 36px;border-bottom:1.5px solid #fde8f5;">
            <div style="font-family:'DM Serif Display',serif;font-size:30px;color:#1a1916;letter-spacing:-.01em;margin-bottom:4px;">${nm}</div>
            <div style="font-size:12px;color:#be185d;font-weight:600;margin-bottom:12px;">${d.title||'Job Title'}</div>
            <div style="display:flex;flex-wrap:wrap;gap:16px;">
              ${contacts.map(x=>`<span style="font-size:10.5px;color:#b0ada6;">${x}</span>`).join('')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:195px 1fr;">
            <div style="background:#fdf8ff;padding:20px 16px;border-right:1.5px solid #fde8f5;">
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#be185d;margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid #fde8f5;">Skills</div>
              <div>${skChips(sk,'#fce7f3','#be185d','20px')}</div>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#be185d;margin:16px 0 8px;padding-bottom:4px;border-bottom:2px solid #fde8f5;">Education</div>
              <div style="font-size:11.5px;font-weight:600;color:#1a1916;margin-bottom:2px;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#b0ada6;">${edu.school}</div>
              <div style="font-size:10px;color:#c8c4be;margin-top:2px;">${edu.year}</div>
              ${langs.length ? `<div style="font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#be185d;margin:16px 0 8px;padding-bottom:4px;border-bottom:2px solid #fde8f5;">Languages</div>${langs.map(l=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}` : ''}
            </div>
            <div style="padding:22px 26px;">
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#be185d;margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid #fde8f5;">About Me</div>
              <p style="font-size:11.5px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${d.sum||'Professional summary.'}</p>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#be185d;margin:18px 0 8px;padding-bottom:4px;border-bottom:2px solid #fde8f5;">Experience</div>
              ${exp.map(e=>exItem(e,'#1a1916','#b0ada6','#6b6860')).join('')}
            </div>
          </div>
        </div>`,

      // ── 10. TEAL SIDEBAR ────────────────────────────────────
      teal: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;display:grid;grid-template-columns:200px 1fr;min-height:990px;">
          <div style="background:#0d7a72;padding:30px 18px;">
            ${d.photo
              ? `<img src="${d.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.25);margin-bottom:14px;display:block;" />`
              : `<div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;font-family:'DM Serif Display',serif;margin-bottom:14px;">${init}</div>`
            }
            <div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:2px;">${nm}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,.5);margin-bottom:20px;">${d.title||'Job Title'}</div>
            <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:8px;">Contact</div>
            ${contacts.map(x=>`<div style="font-size:10px;color:rgba(255,255,255,.65);margin-bottom:5px;word-break:break-all;">${x}</div>`).join('')}
            <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.35);margin:16px 0 8px;">Skills</div>
            ${skBars(sk,'rgba(255,255,255,.85)','rgba(255,255,255,.15)')}
            <div style="font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.35);margin:16px 0 8px;">Education</div>
            <div style="font-size:11px;color:rgba(255,255,255,.8);font-weight:600;margin-bottom:2px;">${edu.degree}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.45);">${edu.school} · ${edu.year}</div>
          </div>
          <div style="padding:28px 26px;">
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#0d7a72;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #e6f5f4;">Summary</div>
            <p style="font-size:11.5px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${d.sum||'Professional summary.'}</p>
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#0d7a72;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #e6f5f4;">Experience</div>
            ${exp.map(e=>exItem(e,'#1a1916','#9a9790','#6b6860')).join('')}
            ${cert.length ? `<div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#0d7a72;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #e6f5f4;">Certifications</div>${cert.map(c=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${c}</div>`).join('')}` : ''}
          </div>
        </div>`,

      // ── 11. NEWSPAPER ───────────────────────────────────────
      newspaper: () => `
        <div style="width:700px;background:#fdfcf8;font-family:'DM Serif Display',serif;padding:36px 44px;">
          <div style="text-align:center;margin-bottom:10px;">
            <div style="font-size:42px;color:#1a1916;letter-spacing:-.02em;line-height:1;">${nm}</div>
          </div>
          <div style="border-top:3px double #1a1916;border-bottom:1px solid #1a1916;padding:5px 0;margin:10px 0;"></div>
          <div style="text-align:center;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-family:'DM Sans',sans-serif;color:#1a1916;margin-bottom:4px;">${d.title||'Job Title'}</div>
          <div style="border-bottom:1px solid #1a1916;margin-bottom:10px;"></div>
          <div style="display:flex;justify-content:center;gap:20px;font-size:10px;color:#9a9790;font-family:'DM Sans',sans-serif;margin-bottom:16px;flex-wrap:wrap;">
            ${contacts.map(x=>`<span>${x}</span>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1px 1fr;gap:20px;">
            <div>
              <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin-bottom:10px;">Profile</div>
              <p style="font-size:11px;color:#6b6860;line-height:1.75;margin-bottom:14px;font-family:'DM Sans',sans-serif;">${d.sum||'Professional summary.'}</p>
              <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin-bottom:10px;">Experience</div>
              ${exp.map(e=>`
                <div style="margin-bottom:12px;">
                  <div style="font-size:12.5px;color:#1a1916;">${e.title}</div>
                  <div style="font-size:10px;color:#9a9790;font-style:italic;font-family:'DM Sans',sans-serif;margin-bottom:3px;">${e.company} · ${e.period}</div>
                  <div style="font-size:10.5px;color:#6b6860;line-height:1.65;font-family:'DM Sans',sans-serif;">${e.desc}</div>
                </div>`).join('')}
            </div>
            <div style="background:#1a1916;"></div>
            <div>
              <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin-bottom:10px;">Skills</div>
              ${sk.map(s=>`<div style="font-size:10.5px;color:#6b6860;padding:4px 0;border-bottom:.5px solid #e8e6e0;font-family:'DM Sans',sans-serif;">${s}</div>`).join('')}
              <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin:14px 0 8px;">Education</div>
              <div style="font-size:12px;color:#1a1916;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#9a9790;font-style:italic;font-family:'DM Sans',sans-serif;margin-top:2px;">${edu.school}, ${edu.year}</div>
              ${langs.length ? `<div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Sans',sans-serif;border-bottom:1.5px solid #1a1916;padding-bottom:4px;margin:14px 0 8px;">Languages</div>${langs.map(l=>`<div style="font-size:10.5px;color:#6b6860;font-family:'DM Sans',sans-serif;margin-bottom:4px;">${l.name} — ${l.level}</div>`).join('')}` : ''}
            </div>
          </div>
        </div>`,

      // ── 12. SWISS DESIGN ────────────────────────────────────
      swiss: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
          <div style="background:#f0ede8;padding:30px 38px;display:flex;align-items:flex-end;justify-content:space-between;border-bottom:3px solid #1a1916;">
            <div>
              <div style="font-size:32px;font-weight:800;color:#1a1916;letter-spacing:-.02em;">${nm}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#6b6860;">${d.title||'Job Title'}</div>
              <div style="font-size:10px;color:#b0ada6;margin-top:4px;display:flex;flex-direction:column;gap:2px;align-items:flex-end;">
                ${contacts.map(x=>`<span>${x}</span>`).join('')}
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:200px 1fr;min-height:780px;">
            <div style="padding:22px 20px;background:#f8f7f3;border-right:3px solid #1a1916;">
              <div style="font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:#1a1916;color:#fff;padding:4px 8px;display:inline-block;margin-bottom:10px;">Profile</div>
              <p style="font-size:11px;color:#6b6860;line-height:1.7;margin-bottom:4px;">${d.sum||'Professional summary.'}</p>
              <div style="font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:#1a1916;color:#fff;padding:4px 8px;display:inline-block;margin:16px 0 10px;">Skills</div>
              ${sk.map(s=>`<div style="font-size:11px;color:#6b6860;padding:4px 0;border-bottom:1px solid #e8e6e0;">${s}</div>`).join('')}
              <div style="font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:#1a1916;color:#fff;padding:4px 8px;display:inline-block;margin:16px 0 10px;">Education</div>
              <div style="font-size:11.5px;font-weight:700;color:#1a1916;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school} · ${edu.year}</div>
            </div>
            <div style="padding:22px 28px;">
              <div style="font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;background:#1a1916;color:#fff;padding:4px 8px;display:inline-block;margin-bottom:12px;">Experience</div>
              ${exp.map(e=>exItem(e,'#1a1916','#9a9790','#6b6860')).join('')}
            </div>
          </div>
        </div>`,

      // ── 13. GRADIENT FLOW ───────────────────────────────────
      gradient: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
          <div style="background:#1a1916;padding:34px 36px;display:flex;align-items:center;gap:20px;position:relative;overflow:hidden;">
            <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(42,91,215,.6) 0%,rgba(98,54,176,.4) 60%,transparent 100%);"></div>
            <div style="position:relative;z-index:1;">${photoOrInitials(d,'78px','rgba(255,255,255,.15)','#fff','28px')}</div>
            <div style="position:relative;z-index:1;">
              <div style="font-size:28px;font-weight:700;color:#fff;margin-bottom:4px;letter-spacing:-.01em;">${nm}</div>
              <div style="font-size:12px;color:rgba(255,255,255,.6);margin-bottom:10px;">${d.title||'Job Title'}</div>
              <div style="display:flex;flex-wrap:wrap;gap:12px;">
                ${contacts.map(x=>`<span style="font-size:10px;color:rgba(255,255,255,.45);">${x}</span>`).join('')}
              </div>
            </div>
          </div>
          <div style="padding:24px 32px;">
            <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:24px;margin-bottom:20px;">
              <div>
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#4338ca;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #eef2ff;">About</div>
                <p style="font-size:11px;color:#6b6860;line-height:1.7;">${d.sum||'Professional summary.'}</p>
              </div>
              <div>
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#4338ca;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #eef2ff;">Skills</div>
                <div>${skChips(sk,'#eef2ff','#4338ca','20px')}</div>
              </div>
            </div>
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#4338ca;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #eef2ff;">Experience</div>
            ${exp.map(e=>exItem(e,'#1a1916','#9a9790','#6b6860')).join('')}
            <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#4338ca;margin:18px 0 9px;padding-bottom:5px;border-bottom:2px solid #eef2ff;">Education</div>
            <div style="font-size:11.5px;font-weight:600;color:#1a1916;">${edu.degree}</div>
            <div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school} · ${edu.year}</div>
          </div>
        </div>`,

      // ── 14. COMPACT GRID ────────────────────────────────────
      compact: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;padding:26px 32px;">
          <div style="border-left:5px solid #2a5bd7;padding-left:16px;margin-bottom:14px;">
            <div style="font-size:24px;font-weight:800;color:#1a1916;letter-spacing:-.01em;margin-bottom:3px;">${nm}</div>
            <div style="font-size:12.5px;color:#2a5bd7;font-weight:700;">${d.title||'Job Title'}</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:10.5px;color:#b0ada6;margin-bottom:14px;">
            ${contacts.map(x=>`<span>${x}</span>`).join('')}
          </div>
          <div style="font-size:11.5px;color:#6b6860;line-height:1.7;border-left:3px solid #e8eefb;padding-left:12px;margin-bottom:18px;">${d.sum||'Professional summary.'}</div>
          <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:24px;">
            <div>
              <div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:#2a5bd7;padding:4px 8px;border-radius:3px;display:inline-block;margin-bottom:10px;">Experience</div>
              ${exp.map(e=>exItem(e,'#1a1916','#9a9790','#6b6860')).join('')}
            </div>
            <div>
              <div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:#2a5bd7;padding:4px 8px;border-radius:3px;display:inline-block;margin-bottom:10px;">Skills</div>
              ${sk.map(s=>`<div style="font-size:11px;color:#6b6860;padding:4px 0;border-bottom:.5px solid #f0ede8;">${s}</div>`).join('')}
              <div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:#2a5bd7;padding:4px 8px;border-radius:3px;display:inline-block;margin:14px 0 10px;">Education</div>
              <div style="font-size:12px;font-weight:700;color:#1a1916;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school} · ${edu.year}</div>
              ${cert.length ? `<div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:#2a5bd7;padding:4px 8px;border-radius:3px;display:inline-block;margin:14px 0 10px;">Certifications</div>${cert.map(c=>`<div style="font-size:11px;color:#6b6860;margin-bottom:4px;">${c}</div>`).join('')}` : ''}
            </div>
          </div>
        </div>`,

      // ── 15. PHOTO PROFESSIONAL ──────────────────────────────
      photo: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;">
          <div style="display:grid;grid-template-columns:225px 1fr;">
            <div style="background:#1a1916;padding:28px 22px;display:flex;flex-direction:column;align-items:center;text-align:center;">
              ${d.photo
                ? `<img src="${d.photo}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,.2);margin-bottom:16px;display:block;" />`
                : `<div style="width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,rgba(42,91,215,.5),rgba(98,54,176,.5));border:4px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:700;color:#fff;font-family:'DM Serif Display',serif;margin-bottom:16px;">
                    ${init}
                    <div style="position:absolute;bottom:-4px;right:-4px;width:28px;height:28px;background:#2a5bd7;border-radius:50%;border:2px solid #1a1916;display:flex;align-items:center;justify-content:center;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                   </div>`
              }
              <div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:3px;">${nm}</div>
              <div style="font-size:10px;color:rgba(255,255,255,.45);margin-bottom:20px;">${d.title||'Job Title'}</div>
              <div style="width:100%;height:1px;background:rgba(255,255,255,.1);margin-bottom:18px;"></div>
              ${contacts.map(x=>`<div style="font-size:9.5px;color:rgba(255,255,255,.55);margin-bottom:6px;word-break:break-all;">${x}</div>`).join('')}
              <div style="width:100%;margin-top:18px;">
                <div style="font-size:7.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);text-align:left;margin-bottom:10px;">Skills</div>
                ${skBars(sk,'#2a5bd7','rgba(255,255,255,.1)')}
              </div>
              ${langs.length ? `
                <div style="width:100%;margin-top:14px;">
                  <div style="font-size:7.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);text-align:left;margin-bottom:8px;">Languages</div>
                  ${langs.map(l=>`<div style="display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,.65);margin-bottom:4px;text-align:left;"><span>${l.name}</span><span style="color:rgba(255,255,255,.35);">${l.level}</span></div>`).join('')}
                </div>` : ''}
            </div>
            <div style="background:#2a5bd7;padding:28px 26px;display:flex;flex-direction:column;justify-content:flex-end;">
              <div style="font-family:'DM Serif Display',serif;font-size:13px;color:rgba(255,255,255,.5);font-style:italic;line-height:1.6;">"${d.sum?.split(' ').slice(0,18).join(' ')||'A passionate professional...'}..."</div>
            </div>
          </div>
          <div style="padding:24px 28px;">
            <div style="display:grid;grid-template-columns:225px 1fr;gap:24px;">
              <div>
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2a5bd7;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #e8eefb;">Education</div>
                <div style="font-size:11.5px;font-weight:700;color:#1a1916;margin-bottom:2px;">${edu.degree}</div>
                <div style="font-size:10.5px;color:#9a9790;">${edu.school}</div>
                <div style="font-size:10px;color:#b0ada6;margin-top:2px;">${edu.year}</div>
                ${cert.length ? `<div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2a5bd7;margin:14px 0 9px;padding-bottom:5px;border-bottom:2px solid #e8eefb;">Certifications</div>${cert.map(c=>`<div style="font-size:10.5px;color:#6b6860;margin-bottom:3px;">${c}</div>`).join('')}` : ''}
              </div>
              <div>
                <div style="font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2a5bd7;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #e8eefb;">Experience</div>
                ${exp.map(e=>`
                  <div style="margin-bottom:12px;display:grid;grid-template-columns:120px 1fr;gap:14px;">
                    <div style="padding-top:2px;">
                      <div style="font-size:9.5px;font-weight:700;color:#2a5bd7;">${e.period}</div>
                      <div style="font-size:9.5px;color:#9a9790;margin-top:1px;">${e.company}</div>
                    </div>
                    <div>
                      <div style="font-size:12.5px;font-weight:700;color:#1a1916;margin-bottom:3px;">${e.title}</div>
                      <div style="font-size:11px;color:#6b6860;line-height:1.6;">${e.desc}</div>
                    </div>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>`,

      // ── 16. INFOGRAPHIC ─────────────────────────────────────
      infographic: () => `
        <div style="width:700px;background:#fff;font-family:'DM Sans',sans-serif;padding:28px 32px;">
          <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px;">
            <div style="width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#0d7a72,#1a7a4a);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff;font-family:'DM Serif Display',serif;flex-shrink:0;">${init}</div>
            <div>
              <div style="font-size:26px;font-weight:700;color:#1a1916;margin-bottom:3px;letter-spacing:-.01em;">${nm}</div>
              <div style="font-size:12.5px;color:#0d7a72;font-weight:600;margin-bottom:8px;">${d.title||'Job Title'}</div>
              <div style="display:flex;flex-wrap:wrap;gap:12px;">
                ${contacts.map(x=>`<span style="font-size:10px;color:#b0ada6;">${x}</span>`).join('')}
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px;">
            ${['8+ Yrs Exp.','2M+ Users','£3.5M Rev.'].map((v,i)=>`
              <div style="background:linear-gradient(135deg,#e6f5f4,#f0fdf4);border:1px solid #a0e0d8;border-radius:12px;padding:14px;">
                <div style="font-size:20px;font-weight:800;color:#0d7a72;">${v.split(' ')[0]}</div>
                <div style="font-size:10.5px;color:#6b6860;margin-top:2px;">${v.split(' ').slice(1).join(' ')}</div>
              </div>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;">
            <div>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0d7a72;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #e6f5f4;">Profile</div>
              <p style="font-size:11px;color:#6b6860;line-height:1.7;margin-bottom:14px;">${d.sum||'Professional summary.'}</p>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0d7a72;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #e6f5f4;">Core Skills</div>
              <div style="display:flex;flex-wrap:wrap;gap:5px;">${skChips(sk,'#e6f5f4','#0d7a72','20px')}</div>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0d7a72;margin:16px 0 9px;padding-bottom:5px;border-bottom:2px solid #e6f5f4;">Education</div>
              <div style="font-size:11.5px;font-weight:600;color:#1a1916;">${edu.degree}</div>
              <div style="font-size:10.5px;color:#9a9790;margin-top:2px;">${edu.school} · ${edu.year}</div>
            </div>
            <div>
              <div style="font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0d7a72;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #e6f5f4;">Experience</div>
              ${exp.map(e=>exItem(e,'#1a1916','#9a9790','#6b6860')).join('')}
            </div>
          </div>
        </div>`,
    }

    return (T[tpl] || T.executive)()
  }

  return { render }
}