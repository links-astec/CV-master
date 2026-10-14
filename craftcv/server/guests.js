// ── GUESTS: people using CVMaster without an account ──────────────────────────
// Anonymous statistics only. A guest is the random cvm_gid cookie the site already uses for the
// fair AI allowance: no name, email, IP address or CV content is kept, just when the guest was
// first and last seen and daily counts of a few actions. Browsers that send Global Privacy
// Control (Sec-GPC: 1) are not counted. Rows are deleted after 13 months. When a guest creates
// an account (or signs in), the guest is marked as converted, so the admin can see how many do.
import { query } from './db.js';

// The only actions counted (the website reports them; AI use comes from ai_usage)
export const GUEST_EVENTS = {
  visit:       'Visits',
  cv_started:  'CVs started',
  story:       'Tell your story',
  job_offer:   'Job offers pasted',
  template:    'Layouts picked',
  download:    'PDF downloads (watermarked)',
  signup_open: 'Opened sign-up',
};
const PLATFORMS = ['web', 'ios', 'android'];

let _ready = null;
export function ensureGuests() {
  if (!_ready) _ready = (async () => {
    await query(`CREATE TABLE IF NOT EXISTS guests (
        gid          TEXT PRIMARY KEY,
        first_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        platform     TEXT,
        user_id      UUID,
        converted_at TIMESTAMPTZ)`);
    await query(`CREATE TABLE IF NOT EXISTS guest_days (
        gid    TEXT NOT NULL,
        day    DATE NOT NULL DEFAULT CURRENT_DATE,
        counts JSONB NOT NULL DEFAULT '{}',
        PRIMARY KEY (gid, day))`);
    await query('CREATE INDEX IF NOT EXISTS guest_days_day ON guest_days(day)');
  })().catch(e => { _ready = null; throw e; });
  return _ready;
}

// Count a batch of actions for one guest. Unknown actions are ignored.
export async function recordGuest(gid, platform, names) {
  await ensureGuests();
  const plat = PLATFORMS.includes(platform) ? platform : 'web';
  const counts = {};
  for (const n of (Array.isArray(names) ? names : []).slice(0, 20)) if (GUEST_EVENTS[n]) counts[n] = (counts[n] || 0) + 1;
  await query(`INSERT INTO guests (gid, platform) VALUES ($1, $2)
               ON CONFLICT (gid) DO UPDATE SET last_seen = NOW(), platform = EXCLUDED.platform`, [gid, plat]);
  if (!Object.keys(counts).length) return 0;
  // Add each count to today's row (jsonb merge, summing what was already there)
  await query(`INSERT INTO guest_days (gid, day, counts) VALUES ($1, CURRENT_DATE, $2::jsonb)
               ON CONFLICT (gid, day) DO UPDATE SET counts = (
                 SELECT COALESCE(jsonb_object_agg(k, COALESCE((guest_days.counts->>k)::int, 0) + COALESCE((EXCLUDED.counts->>k)::int, 0)), '{}')
                 FROM (SELECT jsonb_object_keys(guest_days.counts || EXCLUDED.counts) AS k) keys)`, [gid, JSON.stringify(counts)]);
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

// A guest signed up or signed in: remember which account, once
export async function linkGuest(gid, userId) {
  await ensureGuests();
  await query(`UPDATE guests SET user_id = $2, converted_at = NOW() WHERE gid = $1 AND user_id IS NULL`, [gid, userId]);
}

export async function pruneGuests() {
  await ensureGuests();
  await query(`DELETE FROM guest_days WHERE day < CURRENT_DATE - INTERVAL '13 months'`);
  await query(`DELETE FROM guests WHERE last_seen < NOW() - INTERVAL '13 months'`);
}

// What the admin sees: totals, a daily chart, what guests do, and the latest guests
export async function guestStats(days = 30) {
  await ensureGuests();
  const d = Math.max(1, Math.min(365, Math.floor(Number(days) || 30)));
  const one = async (sql, p = []) => (await query(sql, p)).rows[0];
  const seen = await one(`SELECT
      COUNT(*) FILTER (WHERE last_seen >= CURRENT_DATE)::int AS today,
      COUNT(*) FILTER (WHERE last_seen >= NOW() - INTERVAL '7 days')::int AS week,
      COUNT(*) FILTER (WHERE last_seen >= NOW() - make_interval(days => $1))::int AS period,
      COUNT(*) FILTER (WHERE first_seen >= NOW() - make_interval(days => $1))::int AS new_in_period,
      COUNT(*) FILTER (WHERE converted_at >= NOW() - make_interval(days => $1))::int AS converted,
      COUNT(*)::int AS total
    FROM guests`, [d]);
  const daily = (await query(`SELECT day::text AS day, COUNT(DISTINCT gid)::int AS guests
      FROM guest_days WHERE day > CURRENT_DATE - $1::int GROUP BY day ORDER BY day`, [d])).rows;
  const totals = (await query(`SELECT k AS name, SUM((counts->>k)::int)::int AS n, COUNT(DISTINCT gid)::int AS guests
      FROM guest_days, jsonb_object_keys(counts) k WHERE day > CURRENT_DATE - $1::int GROUP BY k`, [d])).rows;
  const ai = await one(`SELECT COALESCE(SUM(count), 0)::int AS n, COUNT(DISTINCT subject)::int AS guests
      FROM ai_usage WHERE subject LIKE 'g:%' AND day > CURRENT_DATE - $1::int`, [d]).catch(() => ({ n: 0, guests: 0 }));
  const recent = (await query(`SELECT g.gid, g.first_seen, g.last_seen, g.platform, g.converted_at,
        (SELECT COUNT(*)::int FROM guest_days x WHERE x.gid = g.gid) AS days_active,
        (SELECT COALESCE(jsonb_object_agg(k, s), '{}') FROM (SELECT k, SUM((x.counts->>k)::int) AS s FROM guest_days x, jsonb_object_keys(x.counts) k WHERE x.gid = g.gid GROUP BY k) t) AS counts,
        (SELECT COALESCE(SUM(count), 0)::int FROM ai_usage a WHERE a.subject = 'g:' || g.gid) AS ai
      FROM guests g ORDER BY g.last_seen DESC LIMIT 50`)).rows
    // the admin sees a short label, never the cookie itself
    .map(r => ({ ...r, gid: undefined, label: 'Guest ' + r.gid.slice(0, 6).toUpperCase() }));
  return { days: d, seen, daily, totals, ai, recent, labels: GUEST_EVENTS };
}
