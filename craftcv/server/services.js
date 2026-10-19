// Every outside service CVMaster depends on: its plan, what it costs, how much of its limits is used,
// and when it renews. Measured live where the service lets us (Neon, the database itself, Groq, our own
// email count, the domain registry); the rest (plans, prices, renewal dates) is typed in by the admin.
// The admin is emailed at 70% and 90% of a limit, when one is used up, and 14 and 3 days before a renewal.

// ── Counters kept by the server (written to the database once an hour) ────────────────────────────
const month = () => new Date().toISOString().slice(0, 7);
const today = () => new Date().toISOString().slice(0, 10);
const pending = { ai: { calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, mail: 0 };
const mailToday = { day: today(), n: 0 };
export const live = { groq: null, claudeNoCredit: null };

export function countClaude(u = {}) {
  pending.ai.calls++;
  pending.ai.input += u.input_tokens || 0; pending.ai.output += u.output_tokens || 0;
  pending.ai.cacheRead += u.cache_read_input_tokens || 0; pending.ai.cacheWrite += u.cache_creation_input_tokens || 0;
}
// Claude refuses with a billing error when the prepaid credit is used up
export function claudeFailed(message = '') {
  if (/credit balance|billing|purchase credits/i.test(message)) live.claudeNoCredit = new Date().toISOString();
}
export function claudeWorked() { live.claudeNoCredit = null; }
// Groq says in every reply how many requests are left today (and tokens this minute)
export function countGroq(headers) {
  const n = (k) => { const v = Number(headers.get(k)); return Number.isFinite(v) ? v : null; };
  const limit = n('x-ratelimit-limit-requests'), left = n('x-ratelimit-remaining-requests');
  if (limit != null && left != null) live.groq = { limit, left, at: new Date().toISOString() };
}
export function countMail() {
  pending.mail++;
  if (mailToday.day !== today()) Object.assign(mailToday, { day: today(), n: 0 });
  mailToday.n++;
}

// ── What is known about each service (the admin corrects plans, prices and dates in Settings) ──────
const GB = 1024 ** 3;
const DEFAULTS = [
  { id: 'neon', name: 'Neon', what: 'Database: accounts, CVs, payments', plan: 'Free', cost: 0, url: 'https://console.neon.tech',
    limits: { compute: 100, transfer: 5, storage: 0.5 } },
  { id: 'anthropic', name: 'Claude (Anthropic)', what: 'AI features (main)', plan: 'Prepaid credit', cost: 0, url: 'https://console.anthropic.com/settings/billing' },
  { id: 'groq', name: 'Groq', what: 'AI backup and voice transcription', plan: 'Free', cost: 0, url: 'https://console.groq.com/settings/limits' },
  { id: 'render', name: 'Render', what: 'API server (api.cvmaster.live)', plan: 'Free', cost: 0, url: 'https://dashboard.render.com' },
  { id: 'vercel', name: 'Vercel', what: 'Website (www.cvmaster.live)', plan: 'Hobby (free)', cost: 0, url: 'https://vercel.com/dashboard' },
  { id: 'resend', name: 'Resend', what: 'Sending email', plan: 'Free', cost: 0, url: 'https://resend.com/overview',
    limits: { month: 3000, day: 100 } },
  { id: 'domain', name: 'cvmaster.live (Namecheap)', what: 'Domain name', plan: 'Yearly', cost: 0, url: 'https://ap.www.namecheap.com/domains/list/' },
  { id: 'cloudflare', name: 'Cloudflare', what: 'DNS for the domain', plan: 'Free', cost: 0, url: 'https://dash.cloudflare.com' },
  { id: 'stripe', name: 'Stripe', what: 'Card payments (a fee per payment)', plan: 'Pay per payment', cost: 0, url: 'https://dashboard.stripe.com' },
  { id: 'github', name: 'GitHub', what: 'Code and the nightly database backup', plan: 'Free', cost: 0, url: 'https://github.com/settings/billing' },
  { id: 'uptimerobot', name: 'UptimeRobot', what: 'Outside check that the site is up', plan: 'Free', cost: 0, url: 'https://dashboard.uptimerobot.com' },
  { id: 'firebase', name: 'Firebase', what: 'Phone app notifications', plan: 'Spark (free)', cost: 0, url: 'https://console.firebase.google.com' },
  { id: 'expo', name: 'Expo (EAS)', what: 'Building the phone app', plan: 'Free', cost: 0, url: 'https://expo.dev/accounts' },
  { id: 'apple', name: 'Apple Developer', what: 'iPhone app on the App Store', plan: 'Not paid yet', cost: 0, url: 'https://developer.apple.com/account' },
  { id: 'googleplay', name: 'Google Play Console', what: 'Android app on Google Play', plan: 'Not paid yet', cost: 0, url: 'https://play.google.com/console' },
];
const EDITABLE = ['plan', 'cost', 'period', 'renews', 'notes', 'credit', 'creditAt'];
export function cleanEdit(b = {}) {
  const out = {};
  for (const k of EDITABLE) {
    if (!(k in b)) continue;
    const v = b[k];
    if (k === 'cost' || k === 'credit') { const n = Number(v); if (v === '' || v == null) out[k] = null; else if (Number.isFinite(n) && n >= 0 && n < 1e6) out[k] = Math.round(n * 100) / 100; }
    else if (k === 'renews' || k === 'creditAt') out[k] = /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null;
    else if (k === 'period') out[k] = ['month', 'year', 'once'].includes(v) ? v : 'month';
    else out[k] = String(v ?? '').trim().slice(0, k === 'notes' ? 300 : 60);
  }
  if (b.limits && typeof b.limits === 'object') {
    out.limits = {};
    for (const [k, v] of Object.entries(b.limits)) { const n = Number(v); if (/^[a-z]{2,12}$/.test(k) && Number.isFinite(n) && n > 0) out.limits[k] = n; }
  }
  return out;
}

// ── Measuring ──────────────────────────────────────────────────────────────────────────────────────
// deps: { query, getSetting, setSetting, getJson }
async function neonUsage() {
  const key = process.env.NEON_API_KEY, project = process.env.NEON_PROJECT_ID;
  if (!key || !project) return null;
  const r = await fetch(`https://console.neon.tech/api/v2/projects/${encodeURIComponent(project)}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' }, signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`Neon answered ${r.status}`);
  const p = (await r.json()).project || {};
  return { computeHours: (p.compute_time_seconds || 0) / 3600, transferGb: (p.data_transfer_bytes || 0) / GB, resets: p.consumption_period_end || null };
}
async function domainExpiry(getJson) {
  const d = await getJson('https://rdap.org/domain/cvmaster.live');
  const ev = (d?.events || []).find(e => e.eventAction === 'expiration');
  return ev?.eventDate ? ev.eventDate.slice(0, 10) : null;
}
const nextMonthStart = () => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString().slice(0, 10); };
const tomorrow = () => new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const meter = (key, label, used, limit, unit, resets, digits = 0) => ({ key, label, used: +used.toFixed(digits), limit, unit, resets, share: limit ? Math.min(999, Math.round(used / limit * 100)) : null });

export async function flushCounters({ getSetting, setSetting }) {
  const a = pending.ai, m = pending.mail;
  if (!a.calls && !m) return;
  const key = 'usage_' + month();
  const u = await getSetting(key, {}) || {};
  const ai = u.ai || {};
  for (const k of Object.keys(a)) ai[k] = (ai[k] || 0) + a[k];
  await setSetting(key, { ...u, ai, mail: (u.mail || 0) + m });
  for (const k of Object.keys(a)) a[k] = 0;
  pending.mail = 0;
}

export async function servicesReport(deps) {
  const { query, getSetting, getJson } = deps;
  await flushCounters(deps).catch(() => {});
  const edits = await getSetting('services', {}).catch(() => ({})) || {};
  const usage = await getSetting('usage_' + month(), {}).catch(() => ({})) || {};
  const [neon, dbBytes, expiry] = await Promise.all([
    neonUsage().catch(e => ({ error: e.message })),
    query('SELECT pg_database_size(current_database())::bigint AS b').then(r => Number(r.rows[0].b)).catch(() => null),
    domainExpiry(getJson).catch(() => null),
  ]);
  const list = DEFAULTS.map(d => {
    const e = edits[d.id] || {};
    const s = { ...d, ...e, limits: { ...(d.limits || {}), ...(e.limits || {}) }, meters: [], info: [] };
    if (d.id === 'neon') {
      if (neon && !neon.error) {
        s.meters.push(meter('compute', 'Compute this month', neon.computeHours, s.limits.compute, 'hours', neon.resets?.slice(0, 10) || nextMonthStart(), 1));
        s.meters.push(meter('transfer', 'Data transfer this month', neon.transferGb, s.limits.transfer, 'GB', neon.resets?.slice(0, 10) || nextMonthStart(), 2));
      } else s.info.push(neon?.error ? `Couldn’t read usage from Neon: ${neon.error}` : 'Add NEON_API_KEY and NEON_PROJECT_ID in Render to see compute hours and data transfer here.');
      if (dbBytes != null) s.meters.push(meter('storage', 'Storage', dbBytes / GB, s.limits.storage, 'GB', null, 3));
      else s.info.push('The database is not answering.');
    }
    if (d.id === 'anthropic') {
      const ai = { ...(usage.ai || {}) };
      for (const k of Object.keys(pending.ai)) ai[k] = (ai[k] || 0) + pending.ai[k];
      s.info.push(`${(ai.calls || 0).toLocaleString('en')} AI requests this month · ${Math.round(((ai.input || 0) + (ai.cacheRead || 0) + (ai.cacheWrite || 0)) / 1000).toLocaleString('en')}k tokens read, ${Math.round((ai.output || 0) / 1000).toLocaleString('en')}k written`);
      if (live.claudeNoCredit) s.alertPeriod = live.claudeNoCredit.slice(0, 10);
      if (live.claudeNoCredit) s.alert = `Claude has no credit left (since ${live.claudeNoCredit.slice(0, 16).replace('T', ' ')} UTC). The AI backup is answering for now: top up.`;
      if (s.credit != null) s.info.push(`Credit: $${s.credit.toFixed(2)}${s.creditAt ? ` on ${s.creditAt}` : ''}. Anthropic doesn’t share the balance with apps, so update it here when you top up.`);
      else s.info.push('Anthropic doesn’t share your balance with apps: type it in (Edit) when you top up. If the credit runs out you’re emailed straight away.');
    }
    if (d.id === 'groq') {
      if (live.groq) s.meters.push(meter('day', 'Requests today', live.groq.limit - live.groq.left, live.groq.limit, 'requests', tomorrow()));
      else s.info.push('Shown after the next request Groq answers (it only answers when Claude can’t, and for voice input).');
    }
    if (d.id === 'resend') {
      const sent = (usage.mail || 0) + pending.mail;
      s.meters.push(meter('month', 'Emails this month', sent, s.limits.month, 'emails', nextMonthStart()));
      s.meters.push(meter('day', 'Emails today', mailToday.day === today() ? mailToday.n : 0, s.limits.day, 'emails', tomorrow()));
    }
    if (d.id === 'domain' && expiry && !e.renews) s.renews = expiry;
    if (s.renews) s.daysLeft = Math.ceil((Date.parse(s.renews) - Date.now()) / 864e5);
    return s;
  });
  const monthly = list.reduce((t, s) => t + (s.cost ? (s.period === 'year' ? s.cost / 12 : s.period === 'once' ? 0 : s.cost) : 0), 0);
  return { at: new Date().toISOString(), services: list, monthly: Math.round(monthly * 100) / 100, reminders: reminders(list) };
}

// What needs attention now, most urgent first
function reminders(list) {
  const out = [];
  for (const s of list) {
    if (s.alert) out.push({ key: `${s.id}:alert`, level: 3, text: `${s.name}: ${s.alert}`, id: s.id, period: s.alertPeriod || '' });
    for (const m of s.meters) {
      if (m.share == null || m.share < 70) continue;
      const level = m.share >= 100 ? 3 : m.share >= 90 ? 2 : 1;
      out.push({ key: `${s.id}:${m.key}:${level}`, level, id: s.id, period: m.resets || '',
        text: `${s.name}: ${m.label.toLowerCase()} ${m.share >= 100 ? 'has reached its limit' : `is at ${m.share}%`} (${m.used} of ${m.limit} ${m.unit})${m.resets ? `, resets ${m.resets}` : ''}` });
    }
    if (s.daysLeft != null && s.daysLeft <= 14) {
      const level = s.daysLeft <= 3 ? 2 : 1;
      out.push({ key: `${s.id}:renew:${level}`, level, id: s.id, period: s.renews,
        text: s.daysLeft < 0 ? `${s.name}: renewal date ${s.renews} has passed` : `${s.name} renews in ${s.daysLeft} day${s.daysLeft === 1 ? '' : 's'} (${s.renews})${s.cost ? `: €${s.cost} ${s.period === 'year' ? 'a year' : s.period === 'once' ? 'once' : 'a month'}` : ''}` });
    }
  }
  return out.sort((a, b) => b.level - a.level);
}

// Email new reminders (each one once per limit period). Remembered in memory too, so a database
// outage can't make the server email the same reminder every hour.
const sentMem = {};
export async function serviceAlerts(deps, { to, send, esc }) {
  const rep = await servicesReport(deps);
  if (!to) return rep;
  const sent = { ...sentMem, ...(await deps.getSetting('service_alerts', {}).catch(() => ({})) || {}) };
  const fresh = rep.reminders.filter(r => sent[r.key] !== (r.period || 'x'));
  if (!fresh.length) return rep;
  await send({
    to, subject: fresh.length === 1 ? `CVMaster: ${fresh[0].text}` : `CVMaster: ${fresh.length} things need your attention`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;color:#14142B">
      <h2 style="margin:0 0 10px">Subscriptions and limits</h2><ul>${fresh.map(r => `<li style="margin:6px 0;${r.level >= 2 ? 'color:#B42318' : ''}">${esc(r.text)}</li>`).join('')}</ul>
      <p><a href="https://api.cvmaster.live/admin#settings">Open Settings</a></p></div>`,
  });
  for (const r of fresh) sent[r.key] = sentMem[r.key] = r.period || 'x';
  await deps.setSetting('service_alerts', sent).catch(() => {});
  return rep;
}
