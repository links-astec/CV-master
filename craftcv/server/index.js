import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { OAuth2Client } from 'google-auth-library';
import { Resend } from 'resend';
import { query } from './db.js';

const __dirname    = dirname(fileURLToPath(import.meta.url));
const app          = express();
const upload       = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const JWT_SECRET       = process.env.JWT_SECRET || 'cvmaster-dev-secret-change-in-prod';
const GROQ_KEY         = process.env.GROQ_API_KEY || '';
const STRIPE_KEY       = process.env.STRIPE_SECRET_KEY || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const IS_PROD          = process.env.NODE_ENV === 'production';
const FRONTEND_URL     = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Mailer ────────────────────────────────────────────────────────────────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendMail({ to, subject, html, attachments }) {
  const from = process.env.SMTP_FROM || 'noreply@cvmaster.live';

  if (resend) {
    const payload = { from: `CVMaster <${from}>`, to, subject, html };
    if (attachments?.length) {
      payload.attachments = attachments.map(a => ({
        filename: a.filename,
        content:  Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content),
      }));
    }
    const { error } = await resend.emails.send(payload);
    if (error) throw new Error(error.message);
    console.log('[mailer] Resend: sent to', to);
  } else {
    // Dev fallback — log only
    console.log('[mailer] No RESEND_API_KEY — email skipped. To:', to, '| Subject:', subject);
    throw new Error('Email not configured. Set RESEND_API_KEY in environment.');
  }
}

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://accounts.google.com"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "blob:", "https://lh3.googleusercontent.com"],
      connectSrc: ["'self'", "https://api.groq.com", "https://api.stripe.com", "https://oauth2.googleapis.com"],
      frameSrc:   ["https://js.stripe.com", "https://accounts.google.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(compression());
app.use(cookieParser());

// ── MAINTENANCE MODE ──────────────────────────────────────────────────────────
let maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

app.use((req, res, next) => {
  if (!maintenanceMode) return next();
  if (
    req.path.startsWith('/api/admin') ||
    req.path === '/admin' ||
    req.path === '/api/health' ||
    req.path.startsWith('/assets')
  ) return next();
  if (req.path.startsWith('/api')) {
    return res.status(503).json({
      error: 'CVMaster is currently under maintenance. Please check back shortly.',
      maintenance: true,
    });
  }
  res.status(503).send(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>CVMaster — Maintenance</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0d1117;color:#e6edf3;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px}.box{max-width:420px}.logo{font-size:24px;font-weight:700;margin-bottom:24px}.logo b{color:#2f81f7}h1{font-size:28px;font-weight:700;margin-bottom:12px}p{color:#8b949e;font-size:15px;line-height:1.6}</style>
</head><body><div class="box">
<div class="logo">CV<b>Master</b></div>
<h1>Under Maintenance</h1>
<p>We're making improvements. CVMaster will be back shortly.</p>
</div></body></html>`);
});

// Stripe webhook for watermark unlock — raw body required, must be BEFORE express.json
app.post('/api/webhooks/stripe', express.raw({type:'application/json'}), handleWatermarkWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: IS_PROD
    ? [
        FRONTEND_URL,
        'https://cvmaster.live',
        'https://www.cvmaster.live',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
        /\.vercel\.app$/,
      ].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Trust Render/Vercel proxy so rate-limit sees real client IPs
app.set('trust proxy', 1);

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/',      rateLimit({ windowMs: 15*60*1000, max: 200, standardHeaders: true, legacyHeaders: false }));
app.use('/api/ai/',   rateLimit({ windowMs: 60*1000,    max: 20,  message: { error: 'Too many AI requests, wait a minute.' } }));
app.use('/api/auth/', rateLimit({ windowMs: 15*60*1000, max: 15,  message: { error: 'Too many attempts, try again later.' } }));

// ── Auth helpers ──────────────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}
function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    domain: IS_PROD ? '.cvmaster.live' : undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
// ── REFERRAL CODE GENERATOR ──────────────────────────────────────────────────
function generateReferralCode(name, email) {
  const prefix = (name || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X')
  const suffix = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `${prefix}-${suffix}`
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Session expired, please sign in again.' }); }
}
function publicUser(row) {
  return {
    id:         row.id,
    email:      row.email,
    name:       row.name,
    plan:       row.plan,
    onboarded:  row.onboarded,
    avatar:     row.avatar,
    provider:   row.provider,
    industry:   row.industry   || null,
    goal:       row.goal       || null,
    experience: row.experience || null,
  };
}

async function seedNotifications(userId) {
  await query(`
    INSERT INTO notifications (user_id, type, title, body, created_at) VALUES
    ($1, 'welcome', 'Welcome to CVMaster',  'Your account is ready. Start building your CV now.',                  NOW()),
    ($1, 'tip',     'AI Tip',                'Use Narrate mode — tell your story and AI builds your whole CV.',      NOW() - INTERVAL '1 minute'),
    ($1, 'feature', 'Photo Templates',       'Upload a headshot to unlock the Photo Professional template.',         NOW() - INTERVAL '2 minutes')
  `, [userId]);
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, referredBy } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const key = email.toLowerCase().trim();
    const existing = await query('SELECT id FROM users WHERE email = $1', [key]);
    if (existing.rows.length) return res.status(409).json({ error: 'An account with this email already exists.' });
    const hash   = await bcrypt.hash(password, 12);
    const avatar = name.trim()[0].toUpperCase();

    // Resolve referrer
    let referrerId = null;
    if (referredBy) {
      const ref = await query('SELECT id FROM users WHERE UPPER(referral_code) = $1', [referredBy.trim().toUpperCase()]);
      if (ref.rows.length) referrerId = ref.rows[0].id;
    } else {
    }

    // Generate unique referral code
    let referralCode = ''
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateReferralCode(name, key)
      const existing  = await query('SELECT id FROM users WHERE referral_code = $1', [candidate])
      if (!existing.rows.length) { referralCode = candidate; break }
    }

    const { rows } = await query(
      `INSERT INTO users (email, name, hash, provider, avatar, referred_by, referral_code)
       VALUES ($1, $2, $3, 'email', $4, $5, $6) RETURNING *`,
      [key, name.trim(), hash, avatar, referrerId, referralCode]
    );
    const user = rows[0];

    // Credit referrer +1
    if (referrerId) {
      await query(
        'UPDATE users SET referral_credits = referral_credits + 1 WHERE id = $1',
        [referrerId]
      );
    }

    await seedNotifications(user.id);
    setAuthCookie(res, signToken(user.id));
    res.json({ user: publicUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Registration failed.' }); }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = rows[0];
    if (!user || !user.hash) return res.status(401).json({ error: 'Invalid email or password.' });
    const ok = await bcrypt.compare(password, user.hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });
    setAuthCookie(res, signToken(user.id));
    res.json({ user: publicUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Login failed.' }); }
});

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, referredBy } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential missing.' });
    if (!GOOGLE_CLIENT_ID) return res.status(503).json({ error: 'Google login is not configured on this server.' });
    const client  = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket  = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    const key = email.toLowerCase();

    // Resolve referrer
    let googleReferrerId = null;
    if (referredBy) {
      const ref = await query('SELECT id FROM users WHERE referral_code = $1', [referredBy.trim().toUpperCase()]);
      if (ref.rows.length) googleReferrerId = ref.rows[0].id;
    }

    const googleRefCode = generateReferralCode(name || key.split('@')[0], key);
    const avatar        = (name?.[0] || 'G').toUpperCase();

    // Upsert: if email exists link Google, otherwise create new user
    const { rows } = await query(
      `INSERT INTO users (email, name, provider, google_id, google_picture, avatar, referral_code, referred_by)
       VALUES ($1, $2, 'google', $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE
         SET google_id      = EXCLUDED.google_id,
             google_picture = COALESCE(users.google_picture, EXCLUDED.google_picture)
       RETURNING *, (xmax = 0) AS is_new_row`,
      [key, name || key.split('@')[0], googleId, picture, avatar, googleRefCode, googleReferrerId]
    );
    const user      = rows[0];
    const isNewUser = user.is_new_row;

    // Credit referrer only for brand-new users
    if (isNewUser && googleReferrerId) {
      await query(
        'UPDATE users SET referral_credits = referral_credits + 1 WHERE id = $1',
        [googleReferrerId]
      );
    }

    // Seed notifications only for brand-new users
    if (isNewUser) await seedNotifications(user.id);

    setAuthCookie(res, signToken(user.id));
    res.json({ user: publicUser(user) });
  } catch (e) {
    console.error('Google auth error:', e.message, '| audience:', GOOGLE_CLIENT_ID?.slice(0,20));
    res.status(401).json({ error: `Google sign-in failed: ${e.message}` });
  }
});

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required.' });
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = rows[0];
    // Always return 200 — never reveal whether an email exists
    if (!user || user.provider === 'google') return res.json({ ok: true });

    const token    = uuid().replace(/-/g, '') + uuid().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this user, then insert new one
    await query('DELETE FROM reset_tokens WHERE user_id = $1', [user.id]);
    await query(
      'INSERT INTO reset_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [token, user.id, expiresAt]
    );

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your CVMaster password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
            <div style="width:36px;height:36px;background:#2a5bd7;border-radius:9px;display:flex;align-items:center;justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <span style="font-size:18px;font-weight:700;color:#1a1916;">CVMaster</span>
          </div>
          <h2 style="font-size:22px;color:#1a1916;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#6b6860;line-height:1.65;margin-bottom:24px;">
            Hi ${user.name},<br/><br/>
            We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#2a5bd7;color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:600;font-size:15px;margin-bottom:24px;">
            Reset Password
          </a>
          <p style="color:#b0ada6;font-size:12px;line-height:1.6;border-top:1px solid #f0ede8;padding-top:16px;">
            If you didn't request this, you can safely ignore this email — your password won't change.<br/>
            Or copy this link: ${resetUrl}
          </p>
        </div>`,
    });
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to send reset email.' }); }
});

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const { rows } = await query(
      'SELECT * FROM reset_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired reset link.' });
    const { user_id } = rows[0];

    const hash = await bcrypt.hash(password, 12);
    await query('UPDATE users SET hash = $1 WHERE id = $2', [hash, user_id]);
    await query('DELETE FROM reset_tokens WHERE token = $1', [token]);

    const { rows: userRows } = await query('SELECT * FROM users WHERE id = $1', [user_id]);
    const user = userRows[0];
    setAuthCookie(res, signToken(user.id));
    res.json({ user: publicUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Password reset failed.' }); }
});

// ── VALIDATE RESET TOKEN ──────────────────────────────────────────────────────
app.get('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id FROM reset_tokens WHERE token = $1 AND expires_at > NOW()',
      [req.params.token]
    );
    if (!rows.length) return res.status(400).json({ valid: false, error: 'Invalid or expired link.' });
    res.json({ valid: true });
  } catch (e) { res.status(500).json({ valid: false, error: 'Validation failed.' }); }
});

// ── LOGOUT ────────────────────────────────────────────────────────────────────
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { domain: IS_PROD ? '.cvmaster.live' : undefined });
  res.json({ ok: true });
});

// ── ME ────────────────────────────────────────────────────────────────────────
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.sub]);
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(publicUser(rows[0]));
  } catch (e) { res.status(500).json({ error: 'Failed to fetch user.' }); }
});

// ── ONBOARD ───────────────────────────────────────────────────────────────────
app.patch('/api/auth/onboard', authMiddleware, async (req, res) => {
  try {
    await query(
      'UPDATE users SET onboarded = TRUE, industry = $1, goal = $2, experience = $3 WHERE id = $4',
      [req.body.industry || null, req.body.goal || null, req.body.experience || null, req.user.sub]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Onboarding update failed.' }); }
});

// ── SETTINGS ──────────────────────────────────────────────────────────────────
app.patch('/api/auth/settings', authMiddleware, async (req, res) => {
  try {
    const updates = [];
    const params  = [];
    if (req.body.name) {
      params.push(req.body.name.trim(), req.body.name.trim()[0].toUpperCase());
      updates.push(`name = $${params.length - 1}`, `avatar = $${params.length}`);
    }
    if (req.body.password) {
      if (req.body.password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      params.push(await bcrypt.hash(req.body.password, 12));
      updates.push(`hash = $${params.length}`);
    }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update.' });
    params.push(req.user.sub);
    const { rows } = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json({ ok: true, user: publicUser(rows[0]) });
  } catch (e) { res.status(500).json({ error: 'Settings update failed.' }); }
});

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.sub]
    );
    res.json(rows.map(n => ({
      id: n.id, type: n.type, title: n.title,
      body: n.body, read: n.read, time: new Date(n.created_at).getTime(),
    })));
  } catch (e) { res.status(500).json({ error: 'Failed to fetch notifications.' }); }
});

app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.sub]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Update failed.' }); }
});

app.patch('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await query('UPDATE notifications SET read = TRUE WHERE user_id = $1', [req.user.sub]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Update failed.' }); }
});

// Add a notification programmatically (called from frontend events)
app.post('/api/notifications/add', authMiddleware, async (req, res) => {
  try {
    const { type = 'system', title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body required.' });
    await query(
      'INSERT INTO notifications (user_id, type, title, body) VALUES ($1, $2, $3, $4)',
      [req.user.sub, type, title, body]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed to add notification.' }); }
});

// ── AI PROXY ──────────────────────────────────────────────────────────────────
async function callGroq(prompt, model = 'llama-3.3-70b-versatile', systemPrompt = null, maxTokens = 800) {
  if (!GROQ_KEY) throw new Error('AI is not configured. Add GROQ_API_KEY to your environment.');
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body:    JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.1 }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'AI request failed.');
  return j.choices?.[0]?.message?.content || '';
}

app.post('/api/ai/complete', authMiddleware, async (req, res) => {
  const { prompt, model } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required.' });
  try { res.json({ result: await callGroq(prompt, model) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/enhance', authMiddleware, async (req, res) => {
  const { type, data } = req.body;
  const isFrench = data.lang === 'fr';
  const prompts = isFrench ? {
    summary:    `Rédige un résumé professionnel percutant en FRANÇAIS (2-3 phrases, optimisé ATS, moins de 60 mots). Nom: ${data.name}, Titre: ${data.title}. Actuel: "${data.current}". Retourne uniquement le texte du résumé en français.`,
    experience: `Améliore cette description de poste en FRANÇAIS avec des verbes d'action forts et des métriques quantifiées (1-2 phrases). Rôle: ${data.title} chez ${data.company}. Actuel: "${data.desc}". Retourne uniquement le texte amélioré en français.`,
    skills:     `Liste 10 compétences recherchées pour un poste de ${data.title}. Retourne uniquement un tableau JSON de chaînes en français — sans markdown, sans explication.`,
  } : {
    summary:    `Write a compelling professional summary (2-3 sentences, ATS-optimised, under 60 words). Name: ${data.name}, Title: ${data.title}. Current: "${data.current}". Return only the summary text.`,
    experience: `Improve this job description with strong action verbs and quantified metrics (1-2 sentences). Role: ${data.title} at ${data.company}. Current: "${data.desc}". Return only improved text.`,
    skills:     `List 10 in-demand skills for a ${data.title} role. Return a JSON array of strings only — no markdown, no explanation.`,
  };
  try { res.json({ result: await callGroq(prompts[type] || prompts.summary) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CV UPLOAD (real Groq extraction) ─────────────────────────────────────────
async function extractTextFromBuffer(buffer, mimetype, originalname) {
  const ext = originalname.split('.').pop().toLowerCase();

  // PDF
  if (ext === 'pdf' || (mimetype && mimetype.includes('pdf'))) {
    try {
      const mod = await import('pdf-parse').catch(() => null);
      if (mod) {
        const data = await mod.default(buffer);
        if (data.text && data.text.trim().length > 50) return data.text;
      }
    } catch (e) { console.warn('[upload] pdf-parse:', e.message); }
    throw new Error('Could not read text from this PDF. Try exporting it as a text-based PDF or upload a DOCX/TXT version.');
  }

  // DOCX
  if (ext === 'docx' || (mimetype && mimetype.includes('wordprocessingml'))) {
    try {
      const mod = await import('mammoth').catch(() => null);
      if (mod) {
        const result = await mod.default.extractRawText({ buffer });
        if (result.value && result.value.trim().length > 50) return result.value;
      }
    } catch (e) { console.warn('[upload] mammoth:', e.message); }
    throw new Error('Could not read text from this Word document. Try saving it as DOCX again or upload a TXT/PDF version.');
  }

  // Plain text / TXT / fallback
  return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, '\n').trim();
}

app.post('/api/cv/upload', authMiddleware, upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  try {
    const rawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    const cleaned = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{4,}/g, '\n\n')
      .trim();

    console.log('[upload] Extracted', cleaned.length, 'chars from', req.file.originalname);

    if (cleaned.length < 30) {
      return res.status(400).json({ error: 'Could not read text from this file. Try a text-based PDF or a .txt file.' });
    }

    if (!GROQ_KEY) {
      const extracted = normalizeExtracted(parseFallback(cleaned));
      return res.json({ extracted, message: uploadMessage(req.file.originalname, extracted, 'Parsed') });
    }

    // Use up to 12000 chars — covers most CVs fully
    const textFull = cleaned.slice(0, 12000);

    const systemPrompt = `You are an expert CV/resume parser. Your job is to extract structured data from CV text with high accuracy.
Rules:
- Extract ALL work experiences, not just recent ones
- For each experience, write a detailed desc summarising key responsibilities and achievements from the CV text
- Extract ALL education entries (degrees, diplomas, bootcamps, courses)
- Extract ALL skills mentioned anywhere in the CV
- If a professional summary exists, use it verbatim or improve it slightly; if not, write one based on the experience
- Detect the CV language and use that same language for all text fields
- For LinkedIn: extract just the URL or username
- For period: use the format found in the CV (e.g. "Jan 2020 – Mar 2023" or "2020–2023")
- For certifications: extract full certification names
- For languages: use levels like Native, Fluent, Advanced, Intermediate, Basic
- NEVER invent data — only extract what is actually in the CV
- Return ONLY valid JSON, no markdown fences, no explanation`;

    const userPrompt = `Extract all information from this CV and return a JSON object with exactly these fields:

{
  "fn": "first name",
  "ln": "last name", 
  "title": "current job title or most recent role title",
  "email": "email address",
  "phone": "phone number with country code if present",
  "loc": "city and country",
  "li": "LinkedIn URL or username",
  "website": "personal website or portfolio URL",
  "sum": "professional summary (3-4 sentences highlighting experience, key skills, and value)",
  "experiences": [
    {
      "title": "exact job title",
      "company": "company name",
      "period": "date range as written in CV",
      "desc": "detailed description of responsibilities, achievements, and impact (2-4 sentences)"
    }
  ],
  "skills": ["skill1", "skill2", "...all technical and soft skills mentioned"],
  "education": [
    {
      "degree": "full degree/qualification name and field",
      "school": "institution name",
      "year": "graduation year or date range"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "desc": "what it does and your role",
      "tech": "technologies used",
      "url": "project URL if mentioned"
    }
  ],
  "certifications": ["full certification name with issuer if mentioned"],
  "languages": [{"name": "language", "level": "proficiency level"}]
}

CV TEXT:
${textFull}`;

    // First pass: full extraction with system prompt and high token limit
    let raw = '';
    try {
      raw = await callGroq(userPrompt, 'llama-3.3-70b-versatile', systemPrompt, 4000);
    } catch (aiErr) {
      console.warn('[upload] AI extraction failed, using fallback parser:', aiErr.message);
      const extracted = normalizeExtracted(parseFallback(cleaned));
      return res.json({ extracted, message: uploadMessage(req.file.originalname, extracted, 'Parsed') });
    }
    let clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    // Sometimes the model adds text before/after JSON — find the JSON object
    const jsonStart = clean.indexOf('{');
    const jsonEnd   = clean.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      clean = clean.slice(jsonStart, jsonEnd + 1);
    }

    let extracted;
    try {
      extracted = JSON.parse(clean);
    } catch (parseErr) {
      console.warn('[upload] JSON parse failed, attempting repair...');
      // Second attempt: ask AI to fix malformed JSON
      try {
        const fixPrompt = "The following text is supposed to be a JSON object but has syntax errors. Fix it and return ONLY valid JSON:\n\n" + clean.slice(0, 4000);
        const fixed = await callGroq(fixPrompt, 'llama-3.3-70b-versatile');
        const fixedClean = fixed.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        extracted = JSON.parse(fixedClean.slice(fixedClean.indexOf('{'), fixedClean.lastIndexOf('}') + 1));
      } catch {
        console.warn('[upload] JSON repair failed, using fallback parser');
        extracted = parseFallback(cleaned);
      }
    }

    extracted = normalizeExtracted(extracted);

    console.log(`[upload] Extracted: ${extracted.experiences.length} jobs, ${extracted.skills.length} skills, ${extracted.education.length} education, ${extracted.projects.length} projects`);

    res.json({
      extracted,
      message: uploadMessage(req.file.originalname, extracted, 'Extracted from'),
    });
  } catch (e) {
    console.error('[upload] Error:', e.message);
    res.status(500).json({ error: 'Extraction failed: ' + e.message });
  }
});

function parseFallback(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const phoneMatch = text.match(/[\+\d][\d\s\-\(\)]{8,}/);
  const linkedInMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s,;]+/i);
  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin\.com)(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,;]*)?/i);
  const nameLine = lines.find(l => !l.includes('@') && !/\d{4}/.test(l)) || lines[0] || '';
  const nameParts = nameLine.split(/\s+/).filter(Boolean);
  const titleLine = lines.find((l, i) =>
    i > 0 &&
    !l.includes('@') &&
    !/^(experience|work|employment|education|skills|certifications|languages|profile|summary)$/i.test(l) &&
    l.length < 90
  ) || '';
  const skills = extractListSection(text, ['skills', 'technical skills', 'core skills', 'competencies'])
    .flatMap(v => v.split(/[,;|]/))
    .map(v => v.replace(/^[•\-*]\s*/, '').trim())
    .filter(v => v.length > 1 && v.length < 45)
    .slice(0, 24);
  const educationLines = extractListSection(text, ['education', 'academic background', 'qualifications']);
  const experienceLines = extractListSection(text, ['experience', 'work experience', 'employment history', 'professional experience']);
  const education = educationLines.slice(0, 4).map(line => ({
    degree: line,
    school: '',
    year: line.match(/\b(19|20)\d{2}\b/)?.[0] || '',
  }));
  const experiences = experienceLines.slice(0, 6).map((line, i) => ({
    id: Date.now() + i,
    title: line.split(/\s+[-–—|]\s+/)[0] || line,
    company: line.split(/\s+[-–—|]\s+/)[1] || '',
    period: line.match(/\b(?:19|20)\d{2}\b.*?(?:present|current|\b(?:19|20)\d{2}\b)?/i)?.[0] || '',
    desc: line,
  }));
  const summaryStart = lines.findIndex(l => /^(profile|summary|professional summary|about)$/i.test(l));
  const sum = summaryStart >= 0
    ? lines.slice(summaryStart + 1, summaryStart + 4).join(' ').slice(0, 500)
    : lines.slice(2, 6).join(' ').slice(0, 500);

  return {
    fn: nameParts[0] || '',
    ln: nameParts.slice(1).join(' '),
    title: titleLine,
    email: emailMatch?.[0] || '',
    phone: phoneMatch?.[0]?.trim() || '',
    loc: '',
    li: linkedInMatch?.[0] || '',
    website: websiteMatch?.[0] || '',
    sum,
    experiences,
    skills,
    education,
    certifications: [], languages: [],
  };
}

function extractListSection(text, headings) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const start = lines.findIndex(l => headings.some(h => new RegExp(`^${h}:?$`, 'i').test(l)));
  if (start === -1) return [];
  const out = [];
  for (const line of lines.slice(start + 1)) {
    if (/^(experience|work experience|employment history|professional experience|education|academic background|qualifications|skills|technical skills|core skills|competencies|certifications|languages|profile|summary|projects):?$/i.test(line)) break;
    if (line.length > 1) out.push(line);
    if (out.length >= 12) break;
  }
  return out;
}

function normalizeExtracted(extracted = {}) {
  const asString = v => typeof v === 'string' ? v.trim() : '';
  const arr = v => Array.isArray(v) ? v : (v ? [v] : []);
  return {
    fn: asString(extracted.fn),
    ln: asString(extracted.ln),
    title: asString(extracted.title),
    email: asString(extracted.email),
    phone: asString(extracted.phone),
    loc: asString(extracted.loc),
    li: asString(extracted.li),
    website: asString(extracted.website),
    sum: asString(extracted.sum),
    experiences: arr(extracted.experiences).filter(e => e && typeof e === 'object').map((e, i) => ({
      id: e.id || Date.now() + i,
      title: asString(e.title),
      company: asString(e.company),
      period: asString(e.period),
      desc: asString(e.desc),
    })).filter(e => e.title || e.company || e.desc).slice(0, 10),
    skills: arr(extracted.skills).map(s => asString(s)).filter(Boolean).slice(0, 30),
    education: arr(extracted.education).filter(e => e && typeof e === 'object').map(e => ({
      degree: asString(e.degree),
      school: asString(e.school),
      year: asString(e.year),
    })).filter(e => e.degree || e.school || e.year).slice(0, 6),
    projects: arr(extracted.projects).filter(p => p && typeof p === 'object').map((p, i) => ({
      id: p.id || Date.now() + 100 + i,
      name: asString(p.name),
      desc: asString(p.desc),
      url: asString(p.url),
      tech: asString(p.tech),
    })).filter(p => p.name || p.desc).slice(0, 8),
    certifications: arr(extracted.certifications).map(c => asString(c)).filter(Boolean).slice(0, 12),
    languages: arr(extracted.languages).filter(l => l && typeof l === 'object').map(l => ({
      name: asString(l.name),
      level: asString(l.level),
    })).filter(l => l.name || l.level).slice(0, 8),
  };
}

function uploadMessage(fileName, extracted, prefix) {
  return `${prefix} ${fileName}: ${extracted.experiences.length} roles, ${extracted.skills.length} skills, ${extracted.education.length} education entries`;
}

// ── SEND CV BY EMAIL ─────────────────────────────────────────────────────────

// Injects print-safe styles so Puppeteer captures colors and exact layout.
function enforceSinglePage(html) {
  let out = html
    .replace(/max-height\s*:\s*\d+px\s*(!important)?/gi, '')
    .replace(/@page\s*\{[^}]*\}/gi, '')

  const style = `<style>
*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box;}
html,body{margin:0!important;padding:0!important;background:#fff!important;width:700px!important;max-width:700px!important;overflow-x:hidden!important;}
@page{margin:0;}
</style>`;
  if (out.includes('</head>')) return out.replace('</head>', style + '</head>');
  if (out.includes('<body'))   return out.replace('<body',  style + '<body');
  return style + out;
}

// ── SHARED PUPPETEER BROWSER ──────────────────────────────────────────────────
// One browser instance shared across all PDF requests.
// Avoids 3-8s cold-start per request — pages open in ~200ms instead.
let _browser = null;
let _browserReady = null;

async function getBrowser() {
  if (_browser && _browser.connected) return _browser;
  if (_browserReady) return _browserReady; // wait if another request is launching it
  _browserReady = (async () => {
    const puppeteer = await import('puppeteer');
    _browser = await puppeteer.default.launch({
      headless: 'new',
      args: [
        '--no-sandbox', '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', '--disable-gpu',
        '--disable-web-security', '--font-render-hinting=none',
      ],
    });
    _browser.on('disconnected', () => { _browser = null; _browserReady = null; });
    return _browser;
  })();
  const b = await _browserReady;
  _browserReady = null;
  return b;
}

// Load local font files once at startup and cache as base64
// Install with: npm install @fontsource/dm-sans @fontsource/dm-serif-display
let _fontCss = null;
async function getLocalFontCss() {
  if (_fontCss !== null) return _fontCss;
  try {
    const { readFileSync, existsSync } = await import('fs');
    const { join: pjoin } = await import('path');
    const { fileURLToPath } = await import('url');
    const root = pjoin(fileURLToPath(import.meta.url), '..', '..');
    const fonts = [
      // DM Sans weights
      { pkg: '@fontsource/dm-sans/files/dm-sans-latin-300-normal.woff2',   family: 'DM Sans', weight: 300, style: 'normal' },
      { pkg: '@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2',   family: 'DM Sans', weight: 400, style: 'normal' },
      { pkg: '@fontsource/dm-sans/files/dm-sans-latin-400-italic.woff2',   family: 'DM Sans', weight: 400, style: 'italic' },
      { pkg: '@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2',   family: 'DM Sans', weight: 500, style: 'normal' },
      { pkg: '@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2',   family: 'DM Sans', weight: 600, style: 'normal' },
      { pkg: '@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2',   family: 'DM Sans', weight: 700, style: 'normal' },
      // DM Serif Display
      { pkg: '@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff2', family: 'DM Serif Display', weight: 400, style: 'normal' },
      { pkg: '@fontsource/dm-serif-display/files/dm-serif-display-latin-400-italic.woff2', family: 'DM Serif Display', weight: 400, style: 'italic' },
    ];
    const faces = [];
    for (const f of fonts) {
      const fullPath = pjoin(root, 'node_modules', f.pkg);
      if (!existsSync(fullPath)) continue;
      const b64 = readFileSync(fullPath).toString('base64');
      faces.push(`@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:${f.style};src:url(data:font/woff2;base64,${b64}) format('woff2');font-display:block;}`);
    }
    _fontCss = faces.length > 0 ? `<style>${faces.join('')}</style>` : '';
    if (faces.length > 0) console.log(`[pdf] Loaded ${faces.length} local fonts for PDF rendering`);
    else console.warn('[pdf] Local fonts not found — run: npm install @fontsource/dm-sans @fontsource/dm-serif-display');
  } catch {
    _fontCss = '';
  }
  return _fontCss;
}

async function renderPdfFromHtml(html) {
  const PAGE_W = 700;
  const PAGE_H = 990; // A4 proportions at 700px width (700 × 297/210 ≈ 990)

  const browser = await getBrowser();
  const page    = await browser.newPage();
  try {
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (u.includes('fonts.googleapis.com') || u.includes('fonts.gstatic.com')) req.abort();
      else req.continue();
    });

    const fontCss = await getLocalFontCss();
    let prepared  = html.replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '');
    if (fontCss) {
      prepared = prepared.includes('</head>')
        ? prepared.replace('</head>', fontCss + '</head>')
        : fontCss + prepared;
    }

    await page.setViewport({ width: PAGE_W, height: PAGE_H, deviceScaleFactor: 1 });
    await page.setContent(enforceSinglePage(prepared), { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Measure natural content height at full 700px width
    const naturalH = await page.evaluate(() =>
      Math.max(document.body.scrollHeight, document.body.offsetHeight,
               document.documentElement.scrollHeight)
    );

    // If content overflows the page, scale it down to fit exactly one page.
    // Widen the body to 700/scale so after zoom it renders at exactly 700px wide.
    if (naturalH > PAGE_H) {
      const scale = PAGE_H / naturalH;
      const widerW = Math.ceil(PAGE_W / scale);
      await page.addStyleTag({ content:
        `html,body { zoom:${scale} !important; width:${widerW}px !important; max-width:${widerW}px !important; }`
      });
    }

    return await page.pdf({
      width:             `${PAGE_W}px`,
      height:            `${PAGE_H}px`,
      printBackground:   true,
      preferCSSPageSize: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
  } finally {
    await page.close();
  }
}

// ── SHARED PDF GENERATOR ──────────────────────────────────────────────────────
// Used by both the email route and the watermark clean download route.
// Tries Puppeteer → wkhtmltopdf → html-pdf-node in order.
// Returns a Buffer or null if all methods fail.
// PDF method cache — auto-detected on first call, reused forever
let _pdfMethod = null;

async function generateCvPdf(htmlContent) {
  const t0 = Date.now();

  // ── Method: Puppeteer (shared browser, fonts blocked, domcontentloaded) ──
  if (_pdfMethod === null || _pdfMethod === 'puppeteer') {
    try {
      const pdf = await Promise.race([
        renderPdfFromHtml(htmlContent),
        new Promise((_, rej) => setTimeout(() => rej(new Error('puppeteer_timeout')), 6000)),
      ]);
      if (pdf && pdf.length > 1000) {
        if (!_pdfMethod) { _pdfMethod = 'puppeteer'; console.log(`[pdf] Method: Puppeteer (${Date.now()-t0}ms)`); }
        return pdf;
      }
    } catch (e) {
      console.warn(`[pdf] Puppeteer failed (${Date.now()-t0}ms):`, e.message);
      _pdfMethod = null; // try next
    }
  }

  // ── Method: wkhtmltopdf ──
  if (_pdfMethod === null || _pdfMethod === 'wkhtmltopdf') {
    try {
      const { execFile } = await import('child_process');
      const { writeFileSync, readFileSync, unlinkSync, existsSync } = await import('fs');
      const { tmpdir } = await import('os');
      const { join: pj } = await import('path');
      const tmpH = pj(tmpdir(), `cv_${Date.now()}.html`);
      const tmpP = pj(tmpdir(), `cv_${Date.now()}.pdf`);
      writeFileSync(tmpH, htmlContent, 'utf-8');
      const err = await new Promise(res => {
        execFile('wkhtmltopdf', [
          '--page-width', '700px',
          '--margin-top', '0', '--margin-bottom', '0', '--margin-left', '0', '--margin-right', '0',
          '--encoding', 'UTF-8', '--enable-local-file-access',
          '--load-error-handling', 'ignore', '--load-media-error-handling', 'ignore',
          '--no-stop-slow-scripts', '--javascript-delay', '100', '--quiet',
          tmpH, tmpP,
        ], { timeout: 15000 }, res);
      });
      if (!err && existsSync(tmpP)) {
        const pdf = readFileSync(tmpP);
        try { unlinkSync(tmpH); unlinkSync(tmpP); } catch {}
        if (pdf.length > 1000) {
          if (!_pdfMethod) { _pdfMethod = 'wkhtmltopdf'; console.log(`[pdf] Method: wkhtmltopdf (${Date.now()-t0}ms)`); }
          return pdf;
        }
      }
      try { unlinkSync(tmpH); unlinkSync(tmpP); } catch {}
    } catch (e) {
      console.warn('[pdf] wkhtmltopdf failed:', e.message);
      _pdfMethod = null;
    }
  }

  // ── Method: html-pdf-node ──
  if (_pdfMethod === null || _pdfMethod === 'htmlpdf') {
    try {
      const htmlPdf = await import('html-pdf-node');
      const pdf = await htmlPdf.default.generatePdf(
        { content: htmlContent },
        { width: '700px', margin: { top:'0', bottom:'0', left:'0', right:'0' }, printBackground: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
      );
      if (pdf && pdf.length > 1000) {
        if (!_pdfMethod) { _pdfMethod = 'htmlpdf'; console.log(`[pdf] Method: html-pdf-node (${Date.now()-t0}ms)`); }
        return pdf;
      }
    } catch (e) {
      console.warn('[pdf] html-pdf-node failed:', e.message);
    }
  }

  console.error(`[pdf] All methods failed after ${Date.now()-t0}ms`);
  return null;
}


app.post('/api/cv/email', async (req, res) => {
  try {
    const { htmlContent, fileName, overrideEmail, demoMode, sessionId, draftId = 'current' } = req.body;
    if (!htmlContent) return res.status(400).json({ error: 'CV content required.' });

    // Auth via cookie, or fall back to Stripe session (handles cross-site cookie loss after redirect)
    let userId;
    try {
      const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
      if (token) userId = jwt.verify(token, JWT_SECRET).sub;
    } catch {}

    if (!userId && sessionId && !demoMode) {
      try {
        const { default: Stripe } = await import('stripe');
        const stripe   = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session  = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
          userId = session.client_reference_id || session.metadata?.userId;
        }
      } catch (e) { console.warn('[email] Stripe session fallback failed:', e.message); }
    }

    if (!userId && !demoMode) return res.status(401).json({ error: 'Unauthorized' });

    const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = rows[0];
    if (!user && !demoMode) return res.status(404).json({ error: 'User not found.' });

    // Attach to req so downstream code can use req.user.sub
    req.user = { sub: userId };

    const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

    if (stripeConfigured && !demoMode) {
      let hasPaid = false;

      // Step 1: If we have a fresh Stripe session ID, verify with Stripe and record it
      if (sessionId) {
        try {
          const { default: Stripe } = await import('stripe');
          const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          console.log('[email] Stripe session status:', session.payment_status);
          if (session.payment_status === 'paid') {
            await query(
              `INSERT INTO payments (user_id, draft_id, session_id, paid)
               VALUES ($1, $2, $3, TRUE)
               ON CONFLICT DO NOTHING`,
              [req.user.sub, draftId, sessionId]
            );
            hasPaid = true;
          }
        } catch (e) {
          console.warn('[email] Stripe verify error:', e.message);
        }
      }

      // Step 2: Fallback — check payments table
      if (!hasPaid) {
        const { rows: payRows } = await query(
          'SELECT paid FROM payments WHERE user_id = $1 AND paid = TRUE LIMIT 1',
          [req.user.sub]
        );
        hasPaid = payRows.length > 0;
      }

      if (!hasPaid) {
        console.warn('[email] 403 — no payment found for user:', req.user.sub);
        return res.status(403).json({ error: 'Payment required to export CV.' });
      }
    }

    // Determine recipient
    let toEmail;
    if (demoMode) {
      if (!overrideEmail || !overrideEmail.includes('@')) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
      toEmail = overrideEmail.trim().toLowerCase();
    } else {
      toEmail = (overrideEmail && overrideEmail.includes('@')) ? overrideEmail.trim() : user.email;
    }
    console.log('[email] Sending to:', toEmail, '| demo:', !!demoMode);


    // Generate PDF using shared helper (Puppeteer → wkhtmltopdf → html-pdf-node)
    const pdfBuffer = await generateCvPdf(htmlContent);

    if (pdfBuffer) {
      console.log('[email] PDF ready, sending as attachment');
    } else {
      console.warn('[email] All PDF methods failed — sending HTML');
    }

    const attachFileName = pdfBuffer
      ? (fileName || 'my-cv').replace(/\.pdf$/i,'').replace(/\.html?$/i,'') + '.pdf'
      : (fileName || 'my-cv').replace(/\.pdf$/i,'').replace(/\.html?$/i,'') + '.html';

    const attachment = pdfBuffer
      ? { filename: attachFileName, content: pdfBuffer,  contentType: 'application/pdf' }
      : { filename: attachFileName, content: htmlContent, contentType: 'text/html' };

    await sendMail({
      to: toEmail,
      subject: 'Your CV from CVMaster',
      html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:36px 24px;">
        <div style="margin-bottom:24px;display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;background:#2a5bd7;border-radius:9px;display:flex;align-items:center;justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span style="font-size:18px;font-weight:700;color:#1a1916;">CVMaster</span>
        </div>
        <h2 style="font-size:22px;color:#1a1916;margin:0 0 10px;">Your CV is attached, ${user.name || 'there'}!</h2>
        <p style="color:#6b6860;font-size:14px;line-height:1.7;margin:0 0 20px;">
          ${pdfBuffer
            ? 'Your CV is attached as a ready-to-send PDF.'
            : 'Your CV is attached as an HTML file. Open it in Chrome and press <strong>Ctrl+P → Save as PDF</strong> to get a PDF.'}
        </p>
        <p style="color:#b0ada6;font-size:12px;margin:0;">CVMaster · <a href="https://cv-master-rose.vercel.app" style="color:#2a5bd7;">cv-master-rose.vercel.app</a></p>
      </div>`,
      attachments: [attachment],
    });

    console.log('[email] Sent successfully to:', toEmail);
    res.json({ ok: true, sentTo: toEmail, format: pdfBuffer ? 'pdf' : 'html' });
  } catch (e) {
    console.error('[email] FAILED:', e.message, e.stack);
    res.status(500).json({ error: 'Failed to send email: ' + e.message });
  }
});

// ── EMAIL TEST (dev only) ─────────────────────────────────────────────────────
app.get('/api/email-test', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query('SELECT email, name FROM users WHERE id = $1', [req.user.sub]);
    const user = rows[0];
    await sendMail({
      to: user.email,
      subject: 'CVMaster — Email Test',
      html: '<p>If you receive this, email is working correctly.</p>',
    });
    res.json({ ok: true, sentTo: user.email, smtp: process.env.SMTP_HOST || 'ethereal (dev)' });
  } catch (e) {
    res.status(500).json({ error: e.message, smtp: process.env.SMTP_HOST || 'NOT SET' });
  }
});
// ── DRAFTS ────────────────────────────────────────────────────────────────────
app.get('/api/drafts', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM drafts WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.sub]
    );
    res.json(rows.map(d => ({ id: d.id, userId: d.user_id, title: d.title, data: d.cv_data, template: d.template, createdAt: d.created_at, updatedAt: d.updated_at })));
  } catch (e) { res.status(500).json({ error: 'Failed to fetch drafts.' }); }
});

app.post('/api/drafts', authMiddleware, async (req, res) => {
  try {
    const { title, data, template } = req.body;
    const { rows } = await query(
      `INSERT INTO drafts (user_id, title, cv_data, template)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.sub, title || 'Untitled CV', JSON.stringify(data || {}), template || 'executive']
    );
    const d = rows[0];
    res.json({ id: d.id, userId: d.user_id, title: d.title, data: d.cv_data, template: d.template, createdAt: d.created_at, updatedAt: d.updated_at });
  } catch (e) { res.status(500).json({ error: 'Failed to create draft.' }); }
});

app.put('/api/drafts/:id', authMiddleware, async (req, res) => {
  try {
    const { title, data, template } = req.body;
    const { rows } = await query(
      `UPDATE drafts SET title = COALESCE($1, title), cv_data = COALESCE($2, cv_data),
       template = COALESCE($3, template), updated_at = NOW()
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [title, data ? JSON.stringify(data) : null, template, req.params.id, req.user.sub]
    );
    if (!rows.length) return res.status(404).json({ error: 'Draft not found.' });
    const d = rows[0];
    res.json({ id: d.id, userId: d.user_id, title: d.title, data: d.cv_data, template: d.template, createdAt: d.created_at, updatedAt: d.updated_at });
  } catch (e) { res.status(500).json({ error: 'Failed to update draft.' }); }
});

app.delete('/api/drafts/:id', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM drafts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.sub]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete draft.' }); }
});

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
app.post('/api/payment/create-session', authMiddleware, async (req, res) => {
  try {
    const { draftId = 'current' } = req.body;
    if (!STRIPE_KEY) {
      // Demo mode
      const sessionId = `demo_${uuid()}`;
      await query(
        'INSERT INTO payments (user_id, draft_id, session_id, paid) VALUES ($1,$2,$3,TRUE) ON CONFLICT DO NOTHING',
        [req.user.sub, draftId, sessionId]
      );
      await query(
        `INSERT INTO notifications (user_id, type, title, body)
         VALUES ($1, 'payment', 'Export Unlocked', 'Your CV is ready to download as a PDF.')`,
        [req.user.sub]
      );
      return res.json({ url: null, sessionId, demo: true });
    }
    const { default: Stripe } = await import('stripe');
    const stripe  = new Stripe(STRIPE_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'gbp', product_data: { name: 'CVMaster Export', description: 'Professional PDF CV — emailed instantly' }, unit_amount: 199 }, quantity: 1 }],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/export-success?session={CHECKOUT_SESSION_ID}&draft=${draftId}`,
      cancel_url:  `${FRONTEND_URL}/builder`,
      client_reference_id: req.user.sub,
      metadata: { draftId, userId: req.user.sub },
    });
    res.json({ url: session.url, sessionId: session.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/payment/verify', authMiddleware, async (req, res) => {
  try {
    const { sessionId, draftId = 'current' } = req.body;

    // If we have a Stripe session ID, verify it with Stripe and record payment
    if (sessionId && STRIPE_KEY) {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(STRIPE_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        await query(
          `INSERT INTO payments (user_id, draft_id, session_id, paid)
           VALUES ($1, $2, $3, TRUE)
           ON CONFLICT (session_id) DO UPDATE SET paid = TRUE`,
          [req.user.sub, draftId, sessionId]
        ).catch(async () => {
          // Fallback if no unique constraint yet on existing DB
          const exists = await query('SELECT id FROM payments WHERE session_id = $1', [sessionId])
          if (exists.rows.length === 0) {
            await query(
              'INSERT INTO payments (user_id, draft_id, session_id, paid) VALUES ($1, $2, $3, TRUE)',
              [req.user.sub, draftId, sessionId]
            )
          }
        });
        await query(
          `INSERT INTO notifications (user_id, type, title, body)
           VALUES ($1, 'payment', 'Export Unlocked', 'Your CV is ready — check your email for the PDF.')
           ON CONFLICT DO NOTHING`,
          [req.user.sub]
        );
        return res.json({ paid: true, recorded: true });
      }
      return res.json({ paid: false });
    }

    // Fallback: just check the DB
    const { rows } = await query(
      'SELECT paid FROM payments WHERE (draft_id = $1 OR draft_id = $2) AND user_id = $3 AND paid = TRUE LIMIT 1',
      [draftId, 'current', req.user.sub]
    );
    res.json({ paid: rows.length > 0 });
  } catch (e) {
    console.error('[verify]', e.message);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// GET /api/payment/status/any — check if user has ANY paid export (for re-download)
app.get('/api/payment/status/any', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT paid FROM payments WHERE user_id = $1 AND paid = TRUE LIMIT 1',
      [req.user.sub]
    );
    res.json({ paid: rows.length > 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/payment/status/:draftId', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT paid FROM payments WHERE draft_id = $1 AND user_id = $2 AND paid = TRUE LIMIT 1',
      [req.params.draftId, req.user.sub]
    );
    res.json({ paid: rows.length > 0 });
  } catch (e) { res.status(500).json({ error: 'Status check failed.' }); }
});


// ── CV WATERMARK DOWNLOAD ─────────────────────────────────────────────────────
// CV WATERMARK DOWNLOAD SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
// Flow:
//  1. POST /api/cv/store-for-unlock  → stores HTML + token, returns immediately
//  2. User chooses free or paid in modal
//  3a. Free:  POST /api/cv/download-watermarked → generates watermarked PDF and returns it
//  3b. Paid:  POST /api/cv/unlock → Stripe PaymentIntent
//  4. Stripe confirms → GET /api/cv/clean/:token → generateCvPdf (same as email) → return bytes
//
// The clean download uses EXACTLY the same PDF pipeline as the email export.
// Quality is identical to what the user sees in the preview.

const cleanStore = new Map();

function makeToken() {
  return Array.from({length: 48}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function addHtmlWatermark(html) {
  const row  = '<div style="width:320px;padding:18px 0;font-family:sans-serif;font-size:13px;font-weight:700;color:#111;letter-spacing:.06em;white-space:nowrap;">CVMaster — upgrade at cvmaster.live</div>';
  const rows = Array(120).fill(row).join('');
  // Use position:absolute (not fixed) — Puppeteer PDF ignores fixed positioning
  // The wrapper must be inside a position:relative container (body) to fill the whole page
  const wm   = `<div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;overflow:hidden;"><div style="position:absolute;top:-50%;left:-50%;width:200%;height:200%;display:flex;flex-wrap:wrap;align-content:flex-start;transform:rotate(-28deg);opacity:0.18;">${rows}</div></div>`;
  // Make body position:relative so absolute watermark is relative to it
  const bodyStyle = '<style>body{position:relative!important;}</style>';
  let out = html.includes('</head>') ? html.replace('</head>', bodyStyle + '</head>') : bodyStyle + html;
  return out.includes('</body>') ? out.replace('</body>', wm + '</body>') : out + wm;
}

// renderPdf alias for compatibility
async function renderPdf(html) { return renderPdfFromHtml(html); }

// POST /api/cv/store-for-unlock
// Returns token immediately. Kicks off background rendering of BOTH PDFs.
// By the time user reads modal + enters card details (~15-30s), PDFs are ready.
// cv/clean then serves pre-rendered bytes instantly — no wait after payment.
app.post('/api/cv/store-for-unlock', authMiddleware, async (req, res) => {
  try {
    const { htmlContent, fileName = 'cv.pdf' } = req.body;
    if (!htmlContent) return res.status(400).json({ error: 'htmlContent required.' });
    const token   = makeToken();
    const safe    = fileName.replace(/\.pdf$/i, '') + '.pdf';
    const entry   = { html: htmlContent, fileName: safe, cleanPdf: null, watermarkedPdf: null, ready: false, expiresAt: Date.now() + 2 * 60 * 60 * 1000 };
    cleanStore.set(token, entry);
    setTimeout(() => cleanStore.delete(token), 2 * 60 * 60 * 1000);

    // Respond immediately — don't wait for rendering
    res.json({ token, fileName: safe });

    // Render both PDFs concurrently in background
    console.log('[pdf] Background render starting for token:', token.slice(0,8));
    Promise.all([
      generateCvPdf(htmlContent),
      generateCvPdf(addHtmlWatermark(htmlContent)),
    ]).then(([cleanPdf, watermarkedPdf]) => {
      if (cleanStore.has(token)) {
        entry.cleanPdf       = cleanPdf       ? Buffer.from(cleanPdf)       : null;
        entry.watermarkedPdf = watermarkedPdf ? Buffer.from(watermarkedPdf) : null;
        entry.ready          = true;
        console.log('[pdf] Background render done, clean:', cleanPdf?.length, 'watermarked:', watermarkedPdf?.length);
      }
    }).catch((e) => {
      console.error('[pdf] Background render FAILED:', e.message, e.stack?.split('\n')[1]);
      entry.ready = false;
    });
  } catch (e) {
    res.status(500).json({ error: 'Could not prepare download: ' + e.message });
  }
});

// POST /api/cv/download-watermarked — serves pre-rendered watermarked PDF instantly
app.post('/api/cv/download-watermarked', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token required.' });
    const entry = cleanStore.get(token);
    if (!entry || Date.now() > entry.expiresAt) {
      return res.status(404).json({ error: 'Session expired. Please click download again.' });
    }
    // Wait up to 30s if still rendering (user clicked very fast)
    let waited = 0;
    while (!entry.ready && waited < 30000) { await new Promise(r => setTimeout(r, 300)); waited += 300; }
    if (!entry.watermarkedPdf) {
      // Fallback: generate now if background render failed
      const pdf = await generateCvPdf(addHtmlWatermark(entry.html));
      if (!pdf) return res.status(500).json({ error: 'PDF generation failed. Please try again.' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${entry.fileName.replace('.pdf', '-preview.pdf')}"`);
      return res.send(Buffer.from(pdf));
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${entry.fileName.replace('.pdf', '-preview.pdf')}"`);
    res.send(entry.watermarkedPdf);
  } catch (e) {
    res.status(500).json({ error: 'Download failed: ' + e.message });
  }
});

// POST /api/cv/unlock — creates Stripe PaymentIntent for €0.50
app.post('/api/cv/unlock', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token required.' });
    if (!cleanStore.has(token)) return res.status(404).json({ error: 'Session expired. Please click download again.' });

    if (!STRIPE_KEY) {
      await query(
        `INSERT INTO payments (user_id, draft_id, session_id, paid) VALUES ($1,$2,$3,TRUE) ON CONFLICT (session_id) DO UPDATE SET paid=TRUE`,
        [req.user.sub, 'wm_' + token, token]
      );
      return res.json({ demo: true });
    }

    const { default: Stripe } = await import('stripe');
    const stripe  = new Stripe(STRIPE_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'CVMaster — Clean CV Download', description: 'Watermark-free PDF · ATS-ready' },
          unit_amount: 50,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/download-clean?token=${token}&session={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${FRONTEND_URL}/`,
      metadata: { product: 'cvmaster_clean_download', clean_token: token, user_id: req.user.sub },
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: 'Could not create payment: ' + e.message });
  }
});

// GET /api/cv/clean/:token
// If X-Payment-Intent-Id header present: verify with Stripe directly (instant, no polling).
// Otherwise: check payments DB (set by webhook or background poll).
app.get('/api/cv/clean/:token', authMiddleware, async (req, res) => {
  try {
    const { token }       = req.params;
    const paymentIntentId = req.headers['x-payment-intent-id'];

    let paid = false;

    // Fast path: frontend sends Checkout Session ID — verify with Stripe directly
    if (paymentIntentId && STRIPE_KEY) {
      try {
        const { default: Stripe } = await import('stripe');
        const stripe  = new Stripe(STRIPE_KEY);
        const session = await stripe.checkout.sessions.retrieve(paymentIntentId);
        if (session.payment_status === 'paid' && session.metadata?.clean_token === token) {
          paid = true;
          await query(
            `INSERT INTO payments (user_id, draft_id, session_id, paid)
             VALUES ($1, $2, $3, TRUE) ON CONFLICT (session_id) DO UPDATE SET paid = TRUE`,
            [req.user.sub, 'wm_' + token, token]
          ).catch(() => {});
        }
      } catch {}
    }

    // Fallback: check DB (set by webhook or background poll)
    if (!paid) {
      const { rows } = await query(
        'SELECT paid FROM payments WHERE session_id=$1 AND paid=TRUE LIMIT 1', [token]
      );
      paid = rows.length > 0;
    }

    if (!paid) return res.status(402).json({ error: 'Payment not confirmed yet.' });

    const entry = cleanStore.get(token);

    // Entry missing (expired or server restarted) but payment IS confirmed
    if (!entry || Date.now() > entry.expiresAt) {
      cleanStore.delete(token);
      return res.status(410).json({
        error: 'Your download link has expired (2-hour limit). Please click Download again from the dashboard — your payment is saved and you will not be charged again.',
        expired: true,
      });
    }

    // If pre-rendered PDF is ready, serve instantly
    if (entry.ready && entry.cleanPdf) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${entry.fileName}"`);
      return res.send(entry.cleanPdf);
    }

    // Still rendering — wait up to 30s
    let waited = 0;
    while (!entry.ready && waited < 30000) { await new Promise(r => setTimeout(r, 300)); waited += 300; }
    if (entry.ready && entry.cleanPdf) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${entry.fileName}"`);
      return res.send(entry.cleanPdf);
    }

    // Last resort: generate now from stored HTML
    const pdf = await generateCvPdf(entry.html);
    if (!pdf) return res.status(500).json({ error: 'PDF generation failed. Please try again.' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${entry.fileName}"`);
    res.send(Buffer.from(pdf));
  } catch (e) {
    res.status(500).json({ error: 'Could not generate clean PDF: ' + e.message });
  }
});

// Stripe webhook — marks token paid
async function handleWatermarkWebhook(req, res) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return res.json({ received: true });
  let event;
  try {
    const { default: Stripe } = await import('stripe');
    event = new Stripe(STRIPE_KEY).webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret);
  } catch (e) {
    return res.status(400).json({ error: 'Webhook signature invalid: ' + e.message });
  }
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object, token = pi.metadata?.clean_token;
    if (pi.metadata?.product === 'cvmaster_clean_download' && token) {
      await query(
        `INSERT INTO payments (user_id,draft_id,session_id,paid) VALUES ($1,$2,$3,TRUE) ON CONFLICT (session_id) DO UPDATE SET paid=TRUE`,
        [pi.metadata.user_id || '00000000-0000-0000-0000-000000000000', 'wm_' + token, token]
      ).catch(() => {});
    }
  }
  res.json({ received: true });
}

// ── CV RE-DOWNLOAD (paid users only) ─────────────────────────────────────────
// If a user has already paid for a draft, allow them to re-export it for free.
// They still go through the PaywallModal but we skip Stripe and send immediately.
app.post('/api/cv/redownload', authMiddleware, async (req, res) => {
  try {
    const { draftId, htmlContent, fileName, overrideEmail } = req.body;
    if (!htmlContent) return res.status(400).json({ error: 'htmlContent required.' });

    // Verify this user has paid for this draft (or any draft — one-time unlocks all)
    const { rows } = await query(
      `SELECT paid FROM payments
       WHERE user_id = $1 AND paid = TRUE LIMIT 1`,
      [req.user.sub]
    );
    if (!rows.length) {
      return res.status(402).json({ error: 'No paid export found for this account.' });
    }

    // Send the PDF — reuse the same email logic
    // JWT only carries sub (user ID) — fetch email from DB
    const { rows: userRows } = await query('SELECT email FROM users WHERE id = $1', [req.user.sub]);
    const toEmail = overrideEmail || userRows[0]?.email;
    if (!toEmail) return res.status(400).json({ error: 'No email address found for this account.' });

    // Generate PDF
    let pdfBuffer = null;
    try {
      pdfBuffer = await renderPdfFromHtml(htmlContent);
    } catch (e) {
      console.warn('[redownload] Puppeteer failed:', e.message);
    }

    const safeName = (fileName || 'cv.pdf').replace(/[^a-zA-Z0-9-_.]/g, '-');
    const attachment = pdfBuffer
      ? { filename: safeName, content: Buffer.from(pdfBuffer), contentType: 'application/pdf' }
      : { filename: safeName.replace('.pdf', '.html'), content: htmlContent, contentType: 'text/html' };

    await sendMail({
      to: toEmail,
      subject: `Your CVMaster — ${safeName.replace('-CV.pdf','').replace(/-/g,' ')}`,
      html: `<p>Hi! Here's your CV re-sent as requested.</p>
             <p>Your CV is attached as a ${pdfBuffer ? 'PDF' : 'HTML'} file.</p>
             <p style="color:#888;font-size:12px;">CVMaster — cvmaster.com</p>`,
      attachments: [attachment],
    });

    res.json({ ok: true, sentTo: toEmail, format: pdfBuffer ? 'pdf' : 'html' });
  } catch (e) {
    console.error('[cv/redownload]', e.message);
    res.status(500).json({ error: 'Re-send failed: ' + e.message });
  }
});

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
// Serve admin.html at /admin — protected by its own JWT (no user auth crossover)
import { readFileSync as _readFileSync } from 'fs';
import { join as _join } from 'path';
import { fileURLToPath as _fileURLToPath } from 'url';
const _dirname = _join(_fileURLToPath(import.meta.url), '..');

app.get('/admin', (req, res) => {
  try {
    const html = _readFileSync(_join(_dirname, '../admin.html'), 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(html);
  } catch {
    res.status(404).send('Admin panel not found. Place admin.html in the project root.');
  }
});

// ── ADMIN AUTH ────────────────────────────────────────────────────────────────
const ADMIN_JWT_SECRET    = process.env.ADMIN_JWT_SECRET || 'admin-change-this-secret';
const adminLoginAttempts  = new Map(); // ip → { count, lockedUntil }

function adminAuthMiddleware(req, res, next) {
  const token = req.cookies?.admin_token || req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ error: 'Admin authentication required.' });
  try {
    req.admin = jwt.verify(token, ADMIN_JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired admin session.' });
  }
}

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  const ip  = req.ip || 'unknown';
  const now = Date.now();
  const att = adminLoginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  if (att.lockedUntil > now) {
    const wait = Math.ceil((att.lockedUntil - now) / 60000);
    return res.status(429).json({ error: `Too many attempts. Try again in ${wait} minute(s).` });
  }
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  try {
    const { rows } = await query('SELECT * FROM admins WHERE email = $1', [email.toLowerCase().trim()]);
    const admin = rows[0];
    const valid = admin && await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      att.count += 1;
      if (att.count >= 5) att.lockedUntil = now + 15 * 60 * 1000;
      adminLoginAttempts.set(ip, att);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    adminLoginAttempts.delete(ip);
    await query('UPDATE admins SET last_login = NOW() WHERE id = $1', [admin.id]).catch(() => {});
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, ADMIN_JWT_SECRET, { expiresIn: '8h' });
    res.cookie('admin_token', token, { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? 'none' : 'lax', maxAge: 8 * 60 * 60 * 1000 });
    res.json({ ok: true, email: admin.email, role: admin.role });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ ok: true });
});

// GET /api/admin/me
app.get('/api/admin/me', adminAuthMiddleware, (req, res) => {
  res.json({ email: req.admin.email, role: req.admin.role });
});

// GET /api/admin/stats
app.get('/api/admin/stats', adminAuthMiddleware, async (req, res) => {
  try {
    const [users, payments, drafts, referrals, recentPayments] = await Promise.all([
      query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS week FROM users`),
      query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS week FROM payments WHERE paid = TRUE`),
      query(`SELECT COUNT(*) AS total FROM drafts`),
      query(`SELECT COUNT(*) AS total FROM users WHERE referred_by IS NOT NULL`),
      query(`SELECT u.email, p.created_at FROM payments p JOIN users u ON u.id = p.user_id WHERE p.paid = TRUE ORDER BY p.created_at DESC LIMIT 10`),
    ]);
    res.json({
      users:           { total: Number(users.rows[0].total), week: Number(users.rows[0].week) },
      payments:        { total: Number(payments.rows[0].total), week: Number(payments.rows[0].week) },
      drafts:          { total: Number(drafts.rows[0].total) },
      referrals:       { total: Number(referrals.rows[0].total) },
      revenue_pence:   Number(payments.rows[0].total) * 199,
      recent_payments: recentPayments.rows,
      maintenance:     maintenanceMode,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/admin/users
app.get('/api/admin/users', adminAuthMiddleware, async (req, res) => {
  try {
    const { page = 1, search = '', plan = '' } = req.query;
    const limit = 25, offset = (Number(page) - 1) * limit;
    const params = [], conds = ['1=1'];
    if (search) { params.push(`%${search}%`); conds.push(`(email ILIKE $${params.length} OR name ILIKE $${params.length})`); }
    if (plan)   { params.push(plan); conds.push(`plan = $${params.length}`); }
    const where = 'WHERE ' + conds.join(' AND ');
    params.push(limit, offset);
    const { rows } = await query(
      `SELECT id, email, name, plan, provider, onboarded, referral_code, referral_credits,
              (SELECT COUNT(*) FROM payments WHERE user_id = users.id AND paid = TRUE) AS payment_count,
              (SELECT COUNT(*) FROM drafts WHERE user_id = users.id) AS draft_count,
              created_at
       FROM users ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    const { rows: tot } = await query(`SELECT COUNT(*) FROM users ${where}`, params.slice(0, -2));
    res.json({ users: rows, total: Number(tot[0].count), page: Number(page), pages: Math.ceil(Number(tot[0].count) / limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/admin/users/:id
app.patch('/api/admin/users/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { plan, referral_credits } = req.body;
    const sets = [], params = [req.params.id];
    if (plan !== undefined)             { params.push(plan); sets.push(`plan = $${params.length}`); }
    if (referral_credits !== undefined) { params.push(Number(referral_credits)); sets.push(`referral_credits = $${params.length}`); }
    if (!sets.length) return res.status(400).json({ error: 'Nothing to update.' });
    const { rows } = await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $1 RETURNING id, email, plan, referral_credits`, params);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/email/send
app.post('/api/admin/email/send', adminAuthMiddleware, async (req, res) => {
  try {
    const { subject, body, plan_filter, test_email } = req.body;
    if (!subject || !body) return res.status(400).json({ error: 'subject and body required.' });
    if (test_email) {
      await sendMail({ to: test_email, subject: `[TEST] ${subject}`, html: body });
      return res.json({ ok: true, sent: 1, test: true });
    }
    let sql = 'SELECT email FROM users WHERE email IS NOT NULL';
    const p = [];
    if (plan_filter && plan_filter !== 'all') { p.push(plan_filter); sql += ` AND plan = $${p.length}`; }
    const { rows } = await query(sql, p);
    let sent = 0;
    for (let i = 0; i < rows.length; i += 10) {
      await Promise.allSettled(rows.slice(i, i + 10).map(r => sendMail({ to: r.email, subject, html: body })));
      sent += Math.min(10, rows.length - i);
      if (i + 10 < rows.length) await new Promise(r => setTimeout(r, 300));
    }
    res.json({ ok: true, sent });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/maintenance — toggle maintenance mode
app.post('/api/admin/maintenance', adminAuthMiddleware, (req, res) => {
  const { enabled } = req.body;
  maintenanceMode = !!enabled;
  res.json({ ok: true, maintenance: maintenanceMode });
});

// ── REFERRAL ROUTES ───────────────────────────────────────────────────────────
// GET /api/referral/lookup?code=XXX — public, returns referrer name for banner
app.get('/api/referral/lookup', async (req, res) => {
  try {
    const code = (req.query.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'code required' });
    const { rows } = await query('SELECT name FROM users WHERE UPPER(referral_code) = $1', [code.toUpperCase()]);
    if (!rows.length) return res.status(404).json({ error: 'Invalid code' });
    res.json({ name: rows[0].name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/referral/info', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT referral_code, referral_credits,
              (SELECT COUNT(*) FROM users WHERE referred_by = $1) AS referral_count,
              (SELECT COUNT(*) FROM users WHERE referred_by = $1 AND created_at > NOW() - INTERVAL '30 days') AS recent_count
       FROM users WHERE id = $1`, [req.user.sub]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    const { referral_code, referral_credits, referral_count, recent_count } = rows[0];
    res.json({
      code:        referral_code,
      credits:     Number(referral_credits),
      count:       Number(referral_count),
      recentCount: Number(recent_count),
      link:        `${FRONTEND_URL}?ref=${referral_code}`,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/referral/apply', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'code required.' });
    const { rows } = await query('SELECT id FROM users WHERE referral_code = $1', [code]);
    if (!rows.length) return res.status(404).json({ error: 'Invalid referral code.' });
    res.cookie('pcv_ref', code, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/referral/use-credit', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE users SET referral_credits = referral_credits - 1
       WHERE id = $1 AND referral_credits > 0
       RETURNING referral_credits`,
      [req.user.sub]
    );
    if (!rows.length) return res.status(400).json({ error: 'No credits available.' });
    res.json({ ok: true, credits: Number(rows[0].referral_credits) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ADMIN PANEL (serve HTML) ──────────────────────────────────────────────────

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let db = false;
  try { await query('SELECT 1'); db = true; } catch {}
  if (maintenanceMode) {
    return res.status(503).json({ ok: false, maintenance: true, message: 'Under maintenance' });
  }
  res.json({ ok: true, maintenance: false, db, groq: !!GROQ_KEY, stripe: !!STRIPE_KEY, google: !!GOOGLE_CLIENT_ID, time: new Date().toISOString() });
});

// Frontend is served by Vercel — no static file serving needed here.

export default app;

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3001;
  // Warm up Puppeteer on server start so first PDF is fast
  getBrowser().then(() => {
    console.log('  PDF:    Puppeteer ready');
  }).catch(() => {
    console.warn('  PDF:    Puppeteer warmup failed — will retry on first request');
  });

  app.listen(PORT, () => {
    console.log(`\nCVMaster API → http://localhost:${PORT}`);
    console.log(`  DB:     ${process.env.DATABASE_URL ? 'connected' : 'NOT SET — add DATABASE_URL'}`);
    console.log(`  Groq:   ${GROQ_KEY   ? 'configured' : 'NOT SET'}`);
    console.log(`  Stripe: ${STRIPE_KEY ? 'configured' : 'NOT SET (demo mode)'}`);
    console.log(`  Google: ${GOOGLE_CLIENT_ID ? 'configured' : 'NOT SET'}`);
    console.log(`  Email:  ${process.env.RESEND_API_KEY ? 'Resend (configured)' : 'NOT SET — emails will fail'}\n`);
  });
}