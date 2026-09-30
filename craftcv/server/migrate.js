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