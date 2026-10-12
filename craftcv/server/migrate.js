// server/migrate.js — UPDATED
// Run: node server/migrate.js
// Safe to re-run — uses IF NOT EXISTS and ADD COLUMN IF NOT EXISTS
import 'dotenv/config';
import { query } from './db.js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const SQL = `
-- USERS (existing table — add new columns safely)
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  hash          TEXT,
  provider      TEXT NOT NULL DEFAULT 'email',
  google_id     TEXT,
  google_picture TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',
  onboarded     BOOLEAN NOT NULL DEFAULT FALSE,
  avatar        TEXT,
  industry      TEXT,
  goal          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EXPERIENCE COLUMN
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience TEXT;

-- REFERRAL COLUMNS (safe to run on existing DB — ignored if already exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code    TEXT UNIQUE DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_credits INT  NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by      UUID REFERENCES users(id) ON DELETE SET NULL;

-- Backfill referral codes for existing users who do not have one yet
UPDATE users
SET referral_code = UPPER(
  SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', '', 'g') FROM 1 FOR 4) ||
  '-' ||
  SUBSTRING(MD5(id::TEXT) FROM 1 FOR 4)
)
WHERE referral_code IS NULL;

-- DRAFTS
CREATE TABLE IF NOT EXISTS drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT,
  cv_data     JSONB,
  template    TEXT DEFAULT 'executive',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS drafts_user_id ON drafts(user_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'system',
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notifications_user_id ON notifications(user_id);

-- PASSWORD RESET TOKENS
CREATE TABLE IF NOT EXISTS reset_tokens (
  token      TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  draft_id   TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  paid       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payments_draft_id ON payments(draft_id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS content_hash TEXT;
-- product: 'email_export' (€0.99, unlocks one draft) | 'clean_download' (€0.50, one watermark-free PDF)
-- source:  'stripe' | 'demo' | 'credit' (referral credit redemption)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS product TEXT NOT NULL DEFAULT 'email_export';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS source  TEXT NOT NULL DEFAULT 'stripe';
UPDATE payments SET product = 'clean_download' WHERE draft_id LIKE 'wm\\_%' AND product <> 'clean_download';
UPDATE payments SET source  = 'demo' WHERE session_id LIKE 'demo\\_%' AND source <> 'demo';
CREATE INDEX IF NOT EXISTS payments_user_product ON payments(user_id, product);

-- ADMINS (separate table from users)
-- AI ALLOWANCE (also created on demand by the server): daily free requests + paid extra credits
CREATE TABLE IF NOT EXISTS ai_usage (
  subject TEXT NOT NULL,   -- 'u:<user id>' or 'ip:<address>' for guests
  day     DATE NOT NULL,
  count   INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (subject, day)
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_credits INT NOT NULL DEFAULT 0;
-- Referral: set once the referred user's first purchase has rewarded their referrer
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_rewarded BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_welcomed BOOLEAN NOT NULL DEFAULT FALSE;
-- Email sign-ups confirm by link; Google accounts count as confirmed
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- REVIEWS (also created on demand): one per user, admins approve comments for the homepage
CREATE TABLE IF NOT EXISTS reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  rating       INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  display_name TEXT,
  role         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SESSIONS: bumped when the password changes, which signs out every other session
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0;
-- Notifications can link somewhere in the app; reminder bookkeeping on users
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS unpaid_nudged_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS review_nudged_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS review_nudge_count INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS review_emailed_at TIMESTAMPTZ;
-- AI personalisation from onboarding answers and the user's other CVs (switchable in Settings)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_personalize BOOLEAN NOT NULL DEFAULT TRUE;
-- The interface language the user picked (follows them across devices)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ui_lang TEXT;
-- A paid CV is tied to the name on it at its first export (one payment = one person's CV)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS locked_name TEXT;
-- Analysed job offers (keywords, requirements), shared by the ATS check and the AI helpers
CREATE TABLE IF NOT EXISTS job_briefs (
  hash       TEXT PRIMARY KEY,
  brief      JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Password reset links are now stored as SHA-256 hashes (old plain ones simply stop matching)

-- EMAIL SENDS FROM THE ADMIN (newsletters and important notices), for the send history
CREATE TABLE IF NOT EXISTS email_broadcasts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     TEXT NOT NULL,
  audience    TEXT NOT NULL,
  plan        TEXT,
  recipients  INT NOT NULL DEFAULT 0,
  sent        INT NOT NULL DEFAULT 0,
  failed      INT NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'sending',
  admin_email TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EMAIL TEMPLATES saved from the admin email builder (shared by all admins)
CREATE TABLE IF NOT EXISTS email_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  audience   TEXT NOT NULL DEFAULT 'all',
  blocks     JSONB NOT NULL DEFAULT '[]',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NEWSLETTER (also created on demand): only people who agreed; double opt-in from the homepage
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending',
  source          TEXT,
  token           TEXT UNIQUE NOT NULL,
  consent_at      TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUPPORT INBOX (also created on demand): emails to support@cvmaster.live received via Resend
CREATE TABLE IF NOT EXISTS inbox_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id   TEXT UNIQUE,
  message_id  TEXT,
  from_addr   TEXT NOT NULL,
  from_name   TEXT,
  to_addrs    TEXT,
  subject     TEXT,
  text_body   TEXT,
  html_body   TEXT,
  attachments JSONB NOT NULL DEFAULT '[]',
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  status      TEXT NOT NULL DEFAULT 'open',
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS admin_replies (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind     TEXT NOT NULL,
  ref_id   UUID NOT NULL,
  body     TEXT NOT NULL,
  sent_to  TEXT NOT NULL,
  sent_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_replies_ref ON admin_replies(ref_id);

-- FEEDBACK & COMPLAINTS (also created on demand by the server)
CREATE TABLE IF NOT EXISTS feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  email      TEXT,
  kind       TEXT NOT NULL,
  message    TEXT NOT NULL,
  page       TEXT,
  status     TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BLOG (also created on demand, server/blog.js): posts and their translations, uploaded images
CREATE TABLE IF NOT EXISTS posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     UUID NOT NULL DEFAULT gen_random_uuid(),
  lang         TEXT NOT NULL DEFAULT 'en',
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  body_md      TEXT NOT NULL DEFAULT '',
  body_html    TEXT NOT NULL DEFAULT '',
  cover_url    TEXT,
  category     TEXT NOT NULL DEFAULT 'article',
  source_name  TEXT,
  source_url   TEXT,
  status       TEXT NOT NULL DEFAULT 'draft',
  author       TEXT,
  views        INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS posts_pub ON posts(status, published_at DESC);
CREATE TABLE IF NOT EXISTS post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), mime TEXT NOT NULL, data BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SIGN IN WITH APPLE (iPhone app; also created on demand, server/apple.js)
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_refresh_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_apple_id ON users(apple_id) WHERE apple_id IS NOT NULL;

-- PUSH NOTIFICATIONS: the phone app's Expo push tokens (also created on demand, server/push.js)
CREATE TABLE IF NOT EXISTS push_tokens (
  token        TEXT PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS push_tokens_user ON push_tokens(user_id);

-- ACTIVITY for personalisation, first-party only (also created on demand, server/activity.js)
CREATE TABLE IF NOT EXISTS user_events (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  props      JSONB NOT NULL DEFAULT '{}',
  platform   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_events_user ON user_events(user_id, created_at DESC);
ALTER TABLE users ADD COLUMN IF NOT EXISTS personalize_activity BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nudged_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nudge_count INT NOT NULL DEFAULT 0;

-- SETTINGS changed from the admin (for example how many reviews before the homepage shows them)
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);
`;

async function migrate() {
  console.log('Running migrations...');
  try {
    await query(SQL);
    console.log('✓ Schema migrations complete.');
    console.log('✓ Referral columns ready (referral_code, referral_credits, referred_by).');
    console.log('✓ Existing users backfilled with referral codes.');

    // Create default admin if none exists
    const { rows } = await query('SELECT COUNT(*) AS cnt FROM admins');
    if (Number(rows[0].cnt) === 0) {
      const email    = process.env.ADMIN_EMAIL    || 'admin@cvmaster.com';
      const password = process.env.ADMIN_PASSWORD || randomBytes(12).toString('hex');
      const hash     = await bcrypt.hash(password, 12);
      await query(
        'INSERT INTO admins (email, password_hash, role) VALUES ($1, $2, $3)',
        [email, hash, 'superadmin']
      );
      console.log('\n✓ Admin account created:');
      console.log(`  Email:    ${email}`);
      if (!process.env.ADMIN_PASSWORD) {
        console.log(`  Password: ${password}  <- SAVE THIS NOW`);
      }
    } else {
      console.log('✓ Admin accounts already exist — skipping creation.');
    }

    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
}

migrate();