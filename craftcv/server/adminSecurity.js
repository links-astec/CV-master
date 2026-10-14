// Admin account security: two-step sign-in with an authenticator app (TOTP, RFC 6238), single-use
// backup codes, and session versions so every admin session can be ended at once.
// The authenticator secret is stored encrypted (key from ADMIN_JWT_SECRET); backup codes only as
// hashes, so they keep working even if that key ever changes.
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import QRCode from 'qrcode';
import { query } from './db.js';

let _cols = null;
export function ensureAdminSecurity() {
  if (!_cols) _cols = query(`ALTER TABLE admins
      ADD COLUMN IF NOT EXISTS totp_secret TEXT,
      ADD COLUMN IF NOT EXISTS totp_pending TEXT,
      ADD COLUMN IF NOT EXISTS totp_last_step BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS backup_codes JSONB,
      ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0`)
    .catch(e => { _cols = null; throw e; });
  return _cols;
}

// ── Base32 (authenticator apps read the secret in this alphabet) ──────────────
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function toBase32(buf) {
  let bits = 0, val = 0, out = '';
  for (const b of buf) {
    val = ((val << 8) | b) & 0xffff; bits += 8;
    while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}
function fromBase32(s) {
  const clean = String(s).toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0, val = 0; const out = [];
  for (const c of clean) {
    val = ((val << 5) | B32.indexOf(c)) & 0xffff; bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

// ── The secret at rest ────────────────────────────────────────────────────────
const KEY = process.env.ADMIN_JWT_SECRET ? createHash('sha256').update('cvmaster-admin-2fa:' + process.env.ADMIN_JWT_SECRET).digest() : null;
function seal(text) {
  if (!KEY) return 'plain:' + text;
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return 'enc:' + Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64');
}
function unseal(stored) {
  if (!stored) return null;
  if (stored.startsWith('plain:')) return stored.slice(6);
  if (!stored.startsWith('enc:') || !KEY) return null;
  try {
    const raw = Buffer.from(stored.slice(4), 'base64');
    const d = createDecipheriv('aes-256-gcm', KEY, raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8');
  } catch { return null; }
}

// ── Codes ─────────────────────────────────────────────────────────────────────
function totpAt(secret, step) {
  const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', fromBase32(secret)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, '0');
}
// The 30-second step the code belongs to (now, or one step either side for clock drift), or null.
// A step at or before the last one used is refused, so a code can't be replayed.
function matchTotp(secret, code, lastStep = 0) {
  const c = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(c) || !secret) return null;
  const now = Math.floor(Date.now() / 30000);
  for (const step of [now, now - 1, now + 1]) {
    if (step <= Number(lastStep || 0)) continue;
    if (timingSafeEqual(Buffer.from(totpAt(secret, step)), Buffer.from(c))) return step;
  }
  return null;
}
const hashCode = (c) => createHash('sha256').update('cvmaster-backup:' + String(c).toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex');
function newBackupCodes(n = 10) {
  return Array.from({ length: n }, () => { const s = toBase32(randomBytes(7)).slice(0, 10); return `${s.slice(0, 5)}-${s.slice(5)}`; });
}

export const twoStepOn = (admin) => !!admin?.totp_secret;

// Checks a code from the app or a backup code, and records its use. Returns 'app', 'backup' or null.
export async function checkSecondStep(admin, code) {
  const c = String(code || '').trim();
  if (/^\d{3}\s?\d{3}$/.test(c)) {
    const step = matchTotp(unseal(admin.totp_secret), c, admin.totp_last_step);
    if (step === null) return null;
    // only the first request with this code wins
    const r = await query('UPDATE admins SET totp_last_step = $2 WHERE id = $1 AND totp_last_step < $2 RETURNING id', [admin.id, step]);
    return r.rows.length ? 'app' : null;
  }
  const h = hashCode(c);
  const list = Array.isArray(admin.backup_codes) ? admin.backup_codes : [];
  if (!c || !list.includes(h)) return null;
  const r = await query(`UPDATE admins SET backup_codes = backup_codes - $2 WHERE id = $1 AND backup_codes ? $2 RETURNING id`, [admin.id, h]);
  return r.rows.length ? 'backup' : null;
}

// Starts setting up: a new secret (kept as "pending" until a code proves the app has it)
export async function startSetup(admin) {
  const secret = toBase32(randomBytes(20));
  await query('UPDATE admins SET totp_pending = $2 WHERE id = $1', [admin.id, seal(secret)]);
  const uri = `otpauth://totp/CVMaster%20Admin:${encodeURIComponent(admin.email)}?secret=${secret}&issuer=CVMaster%20Admin&algorithm=SHA1&digits=6&period=30`;
  const qr = await QRCode.toString(uri, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#14142B', light: '#FFFFFF' } });
  return { qr, secret: secret.match(/.{1,4}/g).join(' ') };
}

// Finishes setting up with a code from the app; returns the backup codes (shown once), or null
export async function finishSetup(admin, code) {
  const secret = unseal(admin.totp_pending);
  const step = matchTotp(secret, code, 0);
  if (step === null) return null;
  const codes = newBackupCodes();
  await query(`UPDATE admins SET totp_secret = totp_pending, totp_pending = NULL, totp_last_step = $2, backup_codes = $3::jsonb WHERE id = $1`,
    [admin.id, step, JSON.stringify(codes.map(hashCode))]);
  return codes;
}

export async function newCodes(admin) {
  const codes = newBackupCodes();
  await query('UPDATE admins SET backup_codes = $2::jsonb WHERE id = $1', [admin.id, JSON.stringify(codes.map(hashCode))]);
  return codes;
}

export async function turnOff(admin) {
  await query('UPDATE admins SET totp_secret = NULL, totp_pending = NULL, backup_codes = NULL, totp_last_step = 0 WHERE id = $1', [admin.id]);
}

// ── Sessions: a token carries its admin's version; raising the version ends every session ──
const versions = new Map(); // id → { v, at }
export async function sessionVersion(id) {
  const hit = versions.get(id);
  if (hit && Date.now() - hit.at < 20000) return hit.v;
  await ensureAdminSecurity();
  const { rows } = await query('SELECT token_version FROM admins WHERE id = $1', [id]);
  const v = rows[0] ? rows[0].token_version : null;
  versions.set(id, { v, at: Date.now() });
  return v;
}
export async function endAllSessions(id) {
  const { rows } = await query('UPDATE admins SET token_version = token_version + 1 WHERE id = $1 RETURNING token_version', [id]);
  versions.delete(id);
  return rows[0]?.token_version;
}

// For tests of the code maths (not used by the server)
export const _test = { toBase32, fromBase32, totpAt, matchTotp, seal, unseal, hashCode };
