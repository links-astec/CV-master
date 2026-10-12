// ── ACTIVITY & PERSONALISATION ────────────────────────────────────────────────
// What a signed-in user does in CVMaster (website and app), kept on our own server only: no
// third-party trackers, nothing sold or shared. It is used to personalise CVMaster for that
// user: the "next step" card, a favourite layout first, and the occasional reminder about
// where they left off. Users can switch it off in Settings ("Personalise with my activity");
// their events are then deleted and nothing new is kept. Events are deleted after 13 months,
// and with the account.
import { query } from './db.js';

// The only events kept, and the only details each may carry
export const EVENTS = {
  app_open:          [],
  cv_created:        ['source'],            // blank | template | import | story
  template_chosen:   ['layout', 'theme'],
  ai_used:           ['feature'],           // write | fix | translate | tailor | story | import
  job_match:         ['score'],
  export:            ['kind'],              // preview | clean | email
  invite_shared:     ['channel'],
  tour_done:         [],
  notification_open: ['type'],
};
const PLATFORMS = ['web', 'ios', 'android'];

let _ready = null;
export function ensureActivity() {
  if (!_ready) _ready = (async () => {
    await query(`CREATE TABLE IF NOT EXISTS user_events (
        id         BIGSERIAL PRIMARY KEY,
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        props      JSONB NOT NULL DEFAULT '{}',
        platform   TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await query('CREATE INDEX IF NOT EXISTS user_events_user ON user_events(user_id, created_at DESC)');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS personalize_activity BOOLEAN NOT NULL DEFAULT TRUE');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS nudged_at TIMESTAMPTZ');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS nudge_count INT NOT NULL DEFAULT 0');
  })().catch(e => { _ready = null; throw e; });
  return _ready;
}

// Keep a batch of events from one device. Unknown events and details are dropped.
export async function recordEvents(userId, platform, events) {
  await ensureActivity();
  const u = (await query('SELECT personalize_activity FROM users WHERE id = $1', [userId])).rows[0];
  if (!u) return 0;
  // Being active is always noted (it only stops reminders while someone is using CVMaster)
  await query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [userId]);
  if (!u.personalize_activity) return 0;
  const plat = PLATFORMS.includes(platform) ? platform : null;
  let n = 0;
  for (const e of (Array.isArray(events) ? events : []).slice(0, 50)) {
    const keys = EVENTS[e?.name];
    if (!keys) continue;
    const props = {};
    for (const k of keys) {
      const v = e.props?.[k];
      if (typeof v === 'string') props[k] = v.slice(0, 40);
      else if (typeof v === 'number' && Number.isFinite(v)) props[k] = Math.round(v);
    }
    await query('INSERT INTO user_events (user_id, name, props, platform) VALUES ($1, $2, $3, $4)', [userId, e.name, JSON.stringify(props), plat]);
    n++;
  }
  return n;
}

// Switching personalisation off deletes what was kept
export async function setPersonalize(userId, on) {
  await ensureActivity();
  await query('UPDATE users SET personalize_activity = $1 WHERE id = $2', [!!on, userId]);
  if (!on) await query('DELETE FROM user_events WHERE user_id = $1', [userId]);
}

// ── The next step for this user ──
// From their latest CV (what's missing) and, when personalisation is on, what they've already
// done. Texts are English keys, translated on the website, in the app and in pushes.
const s = (v) => typeof v === 'string' && v.trim() !== '';
const list = (v) => (Array.isArray(v) ? v : []);
const hasContent = (d) => !!d && (s(d.title) || s(d.sum) || list(d.skills).some(s) ||
  list(d.experiences).some(e => s(e?.title) || s(e?.company) || s(e?.desc)) || list(d.education).some(e => s(e?.degree) || s(e?.school)));

export const STEPS = {
  start:      { title: 'Build your first CV', body: 'Tell your story and AI writes the first draft, or import the CV you already have.', action: 'new' },
  experience: { title: 'Add your work experience', body: 'It’s the part recruiters read first. Add your latest job in two minutes.', action: 'edit', section: 'experience' },
  summary:    { title: 'Add a short profile', body: 'Two or three lines at the top about who you are and what you want next. AI can write it for you.', action: 'edit', section: 'summary' },
  skills:     { title: 'List your key skills', body: 'Add a few skills so tracking systems match your CV to job offers.', action: 'edit', section: 'skills' },
  education:  { title: 'Add your education', body: 'Your degree or training, with the school and the year.', action: 'edit', section: 'education' },
  job:        { title: 'Match your CV to a job', body: 'Paste a job offer to see your ATS score and what’s missing.', action: 'job' },
  export:     { title: 'Your CV is ready to send', body: 'Get the clean one-page PDF, emailed to you and ready to download.', action: 'export' },
  tailor:     { title: 'Applying somewhere new?', body: 'Tailor your CV to each job offer for a better ATS score.', action: 'job' },
};

export async function nextStep(userId) {
  await ensureActivity();
  const u = (await query('SELECT personalize_activity FROM users WHERE id = $1', [userId])).rows[0];
  const drafts = (await query('SELECT id, cv_data, template FROM drafts WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 10', [userId])).rows;
  const main = drafts.find(d => hasContent(d.cv_data));
  const personal = !!u?.personalize_activity;
  let done = new Set(), favLayout = null;
  if (personal) {
    done = new Set((await query(`SELECT DISTINCT name FROM user_events WHERE user_id = $1 AND created_at > NOW() - INTERVAL '90 days'`, [userId])).rows.map(r => r.name));
    favLayout = (await query(`SELECT props->>'layout' AS layout, COUNT(*) n FROM user_events
        WHERE user_id = $1 AND name = 'template_chosen' AND props ? 'layout' GROUP BY 1 ORDER BY n DESC LIMIT 1`, [userId])).rows[0]?.layout || null;
  }
  const step = (key, draftId = null) => ({ key, ...STEPS[key], draftId, favLayout, personal });
  if (!main) return step('start');
  const d = main.cv_data || {};
  if (!list(d.experiences).some(e => s(e?.title) || s(e?.company))) return step('experience', main.id);
  if (!s(d.sum)) return step('summary', main.id);
  if (list(d.skills).filter(s).length < 3) return step('skills', main.id);
  if (!list(d.education).some(e => s(e?.degree) || s(e?.school))) return step('education', main.id);
  if (!s(d.jobOffer) && !done.has('job_match')) return step('job', main.id);
  const paid = (await query(`SELECT 1 FROM payments WHERE user_id = $1 AND draft_id = $2 AND paid AND product = 'email_export' LIMIT 1`, [userId, main.id])).rows.length > 0;
  if (!paid) return step('export', main.id);
  return step('tailor', main.id);
}

// ── Reminders about where they left off (bell + push) ──
// Only with personalisation on, after 3 quiet days, at most once a week and 4 times in all.
export async function personalNudges(notify) {
  await ensureActivity();
  const users = (await query(`SELECT u.id FROM users u
      WHERE u.personalize_activity AND u.nudge_count < 4
        AND COALESCE(u.last_active_at, u.created_at) < NOW() - INTERVAL '3 days'
        AND COALESCE(u.last_active_at, u.created_at) > NOW() - INTERVAL '60 days'
        AND (u.nudged_at IS NULL OR u.nudged_at < NOW() - INTERVAL '7 days')
      LIMIT 200`)).rows;
  let sent = 0;
  for (const { id } of users) {
    const st = await nextStep(id);
    if (st.key === 'tailor') continue;   // nothing left to finish
    await notify(id, 'nudge', st.title, st.body, st.action === 'export' ? '/editor' : '/');
    await query('UPDATE users SET nudged_at = NOW(), nudge_count = nudge_count + 1 WHERE id = $1', [id]);
    sent++;
  }
  // Events older than 13 months are deleted
  await query(`DELETE FROM user_events WHERE created_at < NOW() - INTERVAL '13 months'`);
  return sent;
}
