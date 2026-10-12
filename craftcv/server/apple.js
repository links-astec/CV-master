// ── SIGN IN WITH APPLE (iPhone app) ───────────────────────────────────────────
// Apple requires it in an iPhone app that also offers Google sign-in. The app gets an identity
// token from Apple; we check it with Apple's public keys (it must be issued by Apple for our
// app), then sign the person in to the account with that Apple id, or with the same email
// (so it is the same account as on the website), or create one.
// Apple also requires that deleting the account revokes Apple's link to the app. That needs
// our Apple key (APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY from developer.apple.com →
// Keys, with Sign in with Apple): sign-in then keeps Apple's refresh token, and deleting the
// account revokes it. Without those settings sign-in still works and revoking is skipped.
import { createPublicKey } from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const ISSUER = 'https://appleid.apple.com';
// Who the token may be issued for: the app's bundle id (APPLE_AUDIENCES adds others, comma-separated)
export const APPLE_AUDIENCES = ['live.cvmaster.app', ...String(process.env.APPLE_AUDIENCES || '').split(',').map(s => s.trim())].filter(Boolean);

let _keys = { at: 0, list: [] };
async function appleKeys(force = false) {
  if (!force && _keys.list.length && Date.now() - _keys.at < 60 * 60 * 1000) return _keys.list;
  const r = await fetch(`${ISSUER}/auth/keys`, { signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error('Apple keys unavailable');
  _keys = { at: Date.now(), list: (await r.json()).keys || [] };
  return _keys.list;
}

// → { sub, email, emailVerified } or throws
export async function verifyAppleToken(identityToken) {
  const decoded = jwt.decode(String(identityToken || ''), { complete: true });
  if (!decoded?.header?.kid) throw new Error('Invalid Apple token');
  let jwk = (await appleKeys()).find(k => k.kid === decoded.header.kid);
  if (!jwk) jwk = (await appleKeys(true)).find(k => k.kid === decoded.header.kid);   // Apple rotated its keys
  if (!jwk) throw new Error('Unknown Apple key');
  const p = jwt.verify(identityToken, createPublicKey({ key: jwk, format: 'jwk' }), { algorithms: ['RS256'], issuer: ISSUER, audience: APPLE_AUDIENCES });
  if (!p.sub) throw new Error('Invalid Apple token');
  return { sub: p.sub, email: typeof p.email === 'string' ? p.email.toLowerCase() : '', emailVerified: p.email_verified === true || p.email_verified === 'true' };
}

let _cols = null;
export function ensureAppleCols() {
  if (!_cols) _cols = query('ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id TEXT')
    .then(() => query('ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_refresh_token TEXT'))
    .then(() => query('CREATE UNIQUE INDEX IF NOT EXISTS users_apple_id ON users(apple_id) WHERE apple_id IS NOT NULL'))
    .catch(e => { _cols = null; throw e; });
  return _cols;
}

// ── Apple's REST API (only with our Apple key configured) ──
const keyReady = () => !!(process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY);
function clientSecret() {
  const key = String(process.env.APPLE_PRIVATE_KEY).replace(/\\n/g, '\n');
  return jwt.sign({}, key, {
    algorithm: 'ES256', expiresIn: '10m', issuer: process.env.APPLE_TEAM_ID, audience: ISSUER,
    subject: APPLE_AUDIENCES[0], keyid: process.env.APPLE_KEY_ID,
  });
}
async function appleForm(path, fields) {
  const r = await fetch(`${ISSUER}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: APPLE_AUDIENCES[0], client_secret: clientSecret(), ...fields }), signal: AbortSignal.timeout(15000),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Apple ${path}: ${r.status} ${j.error || ''}`);
  return j;
}
// After sign-in: swap the one-time code for a refresh token, kept to revoke on account deletion
export async function keepAppleRefreshToken(userId, authorizationCode) {
  if (!keyReady() || !authorizationCode) return;
  const j = await appleForm('/auth/token', { grant_type: 'authorization_code', code: String(authorizationCode) });
  if (j.refresh_token) await query('UPDATE users SET apple_refresh_token = $1 WHERE id = $2', [j.refresh_token, userId]);
}
// Account deletion: end Apple's link between the person and the app
export async function revokeApple(refreshToken) {
  if (!keyReady() || !refreshToken) return false;
  await appleForm('/auth/revoke', { token: refreshToken, token_type_hint: 'refresh_token' });
  return true;
}
