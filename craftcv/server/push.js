// ── PUSH NOTIFICATIONS (phone app) ────────────────────────────────────────────
// Sent through Expo's push service, which delivers to Apple and Google. Each phone registers
// its Expo push token after sign-in (and removes it on sign-out or when the user turns pushes
// off). A token that stops working is removed automatically.
// Texts are written in English, like the bell's, and translated here into the user's interface
// language with the website's dictionaries (the bell translates in the app; a push is shown
// by the phone itself, so it must arrive translated).
import { query } from './db.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const TOKEN_RE = /^Expo(nent)?PushToken\[[\w-]+\]$/;
export const isPushToken = (t) => typeof t === 'string' && t.length < 200 && TOKEN_RE.test(t);

// ── Translation (English text is the key, like everywhere else) ──
const LOADERS = {
  fr: async () => { const m = await import('../src/i18n/fr.js'); return { dict: m.default, patterns: m.PATTERNS || [] }; },
  es: async () => { const m = await import('../src/i18n/es.js'); return { dict: m.default, patterns: m.PATTERNS || [] }; },
  de: async () => { const m = await import('../src/i18n/de.js'); return { dict: m.default, patterns: m.PATTERNS || [] }; },
  it: async () => { const m = await import('../src/i18n/it.js'); return { dict: m.default, patterns: m.PATTERNS || [] }; },
  pt: async () => { const m = await import('../src/i18n/pt.js'); return { dict: m.default, patterns: m.PATTERNS || [] }; },
  zh: async () => { const m = await import('../src/i18n/zh.js'); return { dict: m.default, patterns: m.PATTERNS || [] }; },
};
const dicts = new Map();
export async function translate(lang, s) {
  if (!s || !LOADERS[lang]) return s;
  if (!dicts.has(lang)) dicts.set(lang, LOADERS[lang]().catch(() => ({ dict: {}, patterns: [] })));
  const { dict, patterns } = await dicts.get(lang);
  if (dict[s]) return dict[s];
  for (const [re, out] of patterns) if (re.test(s)) return s.replace(re, out);
  return s;
}

// ── Tokens ──
let _table = null;
export function ensurePushTable() {
  if (!_table) _table = query(`CREATE TABLE IF NOT EXISTS push_tokens (
      token        TEXT PRIMARY KEY,
      user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform     TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`)
    .then(() => query('CREATE INDEX IF NOT EXISTS push_tokens_user ON push_tokens(user_id)'))
    .catch(e => { _table = null; throw e; });
  return _table;
}

// A phone belongs to whoever signed in on it last
export async function registerToken(userId, token, platform) {
  await ensurePushTable();
  await query(`INSERT INTO push_tokens (token, user_id, platform) VALUES ($1, $2, $3)
    ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform, last_seen_at = NOW()`,
    [token, userId, platform === 'ios' || platform === 'android' ? platform : null]);
}
export async function removeToken(token) {
  await ensurePushTable();
  await query('DELETE FROM push_tokens WHERE token = $1', [token]);
}

// ── Sending ──
// to: a list of user ids, or 'all' (every phone with the app). text: { title, body, link, type }.
// translate: false for texts an admin wrote themselves (sent as written).
export async function sendPush(to, { title, body, link = null, type = null }, { translate: tr = true } = {}) {
  await ensurePushTable();
  const { rows } = to === 'all'
    ? await query('SELECT t.token, u.ui_lang FROM push_tokens t JOIN users u ON u.id = t.user_id')
    : await query('SELECT t.token, u.ui_lang FROM push_tokens t JOIN users u ON u.id = t.user_id WHERE t.user_id = ANY($1::uuid[])', [to]);
  if (!rows.length) return { sent: 0, failed: 0, devices: 0 };

  const messages = [];
  for (const r of rows) {
    messages.push({
      to: r.token, sound: 'default', priority: 'high', channelId: 'default',
      title: tr ? await translate(r.ui_lang, title) : title,
      body: tr ? await translate(r.ui_lang, body) : body,
      data: { link, type },
    });
  }
  let sent = 0, failed = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const r = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', Accept: 'application/json',
          ...(process.env.EXPO_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {}),
        },
        body: JSON.stringify(chunk),
        signal: AbortSignal.timeout(20000),
      });
      const j = await r.json().catch(() => ({}));
      const tickets = Array.isArray(j.data) ? j.data : [];
      if (!r.ok || !tickets.length) { failed += chunk.length; console.warn('[push]', r.status, JSON.stringify(j).slice(0, 200)); continue; }
      for (let k = 0; k < chunk.length; k++) {
        const t = tickets[k];
        if (t?.status === 'ok') sent++;
        else {
          failed++;
          // The app was removed from that phone, or the token is no longer valid
          if (t?.details?.error === 'DeviceNotRegistered') await removeToken(chunk[k].to).catch(() => {});
        }
      }
    } catch (e) { failed += chunk.length; console.warn('[push]', e.message); }
  }
  return { sent, failed, devices: rows.length };
}
