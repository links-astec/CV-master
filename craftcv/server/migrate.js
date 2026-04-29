// Run once to create all tables: node server/migrate.js
// Safe to re-run — uses CREATE TABLE IF NOT EXISTS
import 'dotenv/config';
import { query } from './db.js';

const SQL = `
-- USERS
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

-- DRAFTS  (cv_data is stored as JSONB so we can query it if needed later)
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
  session_id TEXT NOT NULL,
  paid       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payments_draft_id ON payments(draft_id);
`;

async function migrate() {
  console.log('Running migrations...');
  try {
    await query(SQL);
    console.log('Migrations complete.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
}

migrate();