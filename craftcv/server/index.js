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
import nodemailer from 'nodemailer';
import { query } from './db.js';

const __dirname    = dirname(fileURLToPath(import.meta.url));
const app          = express();
const upload       = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const JWT_SECRET       = process.env.JWT_SECRET || 'perfectcv-dev-secret-change-in-prod';
const GROQ_KEY         = process.env.GROQ_API_KEY || '';
const STRIPE_KEY       = process.env.STRIPE_SECRET_KEY || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const IS_PROD          = process.env.NODE_ENV === 'production';
const FRONTEND_URL     = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Mailer ────────────────────────────────────────────────────────────────────
let mailer = null;
async function getMailer() {
  if (mailer) return mailer;
  if (process.env.SMTP_HOST) {
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    const acct = await nodemailer.createTestAccount();
    mailer = nodemailer.createTransport({
      host: 'smtp.ethereal.email', port: 587, secure: false,
      auth: { user: acct.user, pass: acct.pass },
    });
    console.log('Dev email (Ethereal):', acct.user);
  }
  return mailer;
}
async function sendMail({ to, subject, html, attachments }) {
  const t = await getMailer();
  const info = await t.sendMail({
    from: `"PerfectCV" <${process.env.SMTP_FROM || 'noreply@perfectcv.app'}>`,
    to, subject, html, attachments,
  });
  if (!process.env.SMTP_HOST) console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
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
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(cors({
  origin: IS_PROD ? FRONTEND_URL : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

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
    httpOnly: true, secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
function authMiddleware(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Session expired, please sign in again.' }); }
}
function publicUser(row) {
  return {
    id:        row.id,
    email:     row.email,
    name:      row.name,
    plan:      row.plan,
    onboarded: row.onboarded,
    avatar:    row.avatar,
    provider:  row.provider,
  };
}

async function seedNotifications(userId) {
  await query(`
    INSERT INTO notifications (user_id, type, title, body, created_at) VALUES
    ($1, 'welcome', 'Welcome to PerfectCV',  'Your account is ready. Start building your CV now.',                  NOW()),
    ($1, 'tip',     'AI Tip',                'Use Narrate mode — tell your story and AI builds your whole CV.',      NOW() - INTERVAL '1 minute'),
    ($1, 'feature', 'Photo Templates',       'Upload a headshot to unlock the Photo Professional template.',         NOW() - INTERVAL '2 minutes')
  `, [userId]);
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const key = email.toLowerCase().trim();
    const existing = await query('SELECT id FROM users WHERE email = $1', [key]);
    if (existing.rows.length) return res.status(409).json({ error: 'An account with this email already exists.' });
    const hash   = await bcrypt.hash(password, 12);
    const avatar = name.trim()[0].toUpperCase();
    const { rows } = await query(
      `INSERT INTO users (email, name, hash, provider, avatar)
       VALUES ($1, $2, $3, 'email', $4) RETURNING *`,
      [key, name.trim(), hash, avatar]
    );
    const user = rows[0];
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
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential missing.' });
    if (!GOOGLE_CLIENT_ID) return res.status(503).json({ error: 'Google login is not configured on this server.' });
    const client  = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket  = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    const key = email.toLowerCase();

    // Upsert: if email exists link Google, otherwise create new user
    const { rows } = await query(
      `INSERT INTO users (email, name, provider, google_id, google_picture, avatar)
       VALUES ($1, $2, 'google', $3, $4, $5)
       ON CONFLICT (email) DO UPDATE
         SET google_id = EXCLUDED.google_id,
             google_picture = COALESCE(users.google_picture, EXCLUDED.google_picture)
       RETURNING *`,
      [key, name || key.split('@')[0], googleId, picture, name?.[0]?.toUpperCase() || 'G']
    );
    const user = rows[0];

    // Seed notifications only for brand-new users (created_at very recent)
    const age = Date.now() - new Date(user.created_at).getTime();
    if (age < 5000) await seedNotifications(user.id);

    setAuthCookie(res, signToken(user.id));
    res.json({ user: publicUser(user) });
  } catch (e) {
    console.error('Google auth error:', e.message);
    res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
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
      subject: 'Reset your PerfectCV password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
            <div style="width:36px;height:36px;background:#2a5bd7;border-radius:9px;display:flex;align-items:center;justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <span style="font-size:18px;font-weight:700;color:#1a1916;">PerfectCV</span>
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
  res.clearCookie('token');
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
      'UPDATE users SET onboarded = TRUE, industry = $1, goal = $2 WHERE id = $3',
      [req.body.industry || null, req.body.goal || null, req.user.sub]
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
async function callGroq(prompt, model = 'llama-3.3-70b-versatile') {
  if (!GROQ_KEY) throw new Error('AI is not configured. Add GROQ_API_KEY to your environment.');
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body:    JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 800, temperature: 0.72 }),
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
  const prompts = {
    summary:    `Write a compelling professional summary (2-3 sentences, ATS-optimised, under 60 words). Name: ${data.name}, Title: ${data.title}. Current: "${data.current}". Return only the summary text.`,
    experience: `Improve this job description with strong action verbs and quantified metrics (1-2 sentences). Role: ${data.title} at ${data.company}. Current: "${data.desc}". Return only improved text.`,
    skills:     `List 10 in-demand skills for a ${data.title} role. Return a JSON array of strings only — no markdown, no explanation.`,
  };
  try { res.json({ result: await callGroq(prompts[type] || prompts.summary) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CV UPLOAD (real Groq extraction) ─────────────────────────────────────────
app.post('/api/cv/upload', authMiddleware, upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  try {
    // Convert buffer to text — works for plain-text CVs and most PDFs
    const rawText = req.file.buffer.toString('utf-8', 0, Math.min(req.file.buffer.length, 12000))
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // strip non-printable chars
      .replace(/\s{3,}/g, '\n')
      .trim();

    if (!GROQ_KEY) {
      // No Groq key — return a best-effort parse from raw text
      return res.json({ extracted: parseFallback(rawText), message: `Parsed ${req.file.originalname}` });
    }

    const prompt = `Extract CV/resume information from the following text and return ONLY a valid JSON object with these exact keys:
{
  "fn": "first name",
  "ln": "last name",
  "title": "current or target job title",
  "email": "email address",
  "phone": "phone number",
  "loc": "city, country",
  "li": "linkedin url or username",
  "website": "personal website if present",
  "sum": "professional summary (2-3 sentences)",
  "experiences": [{"title":"","company":"","period":"","desc":""}],
  "skills": ["skill1","skill2"],
  "education": {"degree":"","school":"","year":""},
  "certifications": ["cert1"],
  "languages": [{"name":"","level":""}]
}
Return ONLY the JSON, no markdown, no explanation.

CV TEXT:
${rawText.slice(0, 8000)}`;

    const raw = await callGroq(prompt, 'llama-3.3-70b-versatile');
    // Strip any markdown fences Groq might add
    const clean = raw.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
    let extracted;
    try { extracted = JSON.parse(clean); }
    catch { extracted = parseFallback(rawText); }

    res.json({ extracted, message: `Extracted from ${req.file.originalname} (${(req.file.size/1024).toFixed(0)} KB)` });
  } catch (e) {
    console.error('Upload error:', e.message);
    res.status(500).json({ error: 'Extraction failed: ' + e.message });
  }
});

function parseFallback(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const phoneMatch = text.match(/[\+\d][\d\s\-\(\)]{8,}/);
  return {
    fn: lines[0]?.split(' ')[0] || 'First',
    ln: lines[0]?.split(' ').slice(1).join(' ') || 'Last',
    title: lines[1] || '',
    email: emailMatch?.[0] || '',
    phone: phoneMatch?.[0]?.trim() || '',
    loc: '', li: '', website: '',
    sum: lines.slice(2,5).join(' ').slice(0,300),
    experiences: [],
    skills: [],
    education: { degree: '', school: '', year: '' },
    certifications: [], languages: [],
  };
}

// ── SEND CV BY EMAIL (PDF attachment) ────────────────────────────────────────
app.post('/api/cv/email', authMiddleware, async (req, res) => {
  try {
    const { htmlContent, fileName } = req.body;
    if (!htmlContent) return res.status(400).json({ error: 'CV content required.' });

    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.sub]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const toEmail = user.email;
    const pdfName = (fileName || 'my-cv').replace(/\.html?$/i, '') + '.pdf';

    // Generate PDF using wkhtmltopdf (available on Linux/Render)
    let pdfBuffer = null;
    try {
      const { execFile } = await import('child_process');
      const { writeFileSync, readFileSync, unlinkSync } = await import('fs');
      const { tmpdir } = await import('os');
      const { join } = await import('path');
      const { promisify } = await import('util');
      const execFileAsync = promisify(execFile);

      const tmpHtml = join(tmpdir(), `cv_${Date.now()}.html`);
      const tmpPdf  = join(tmpdir(), `cv_${Date.now()}.pdf`);

      writeFileSync(tmpHtml, htmlContent, 'utf-8');

      await execFileAsync('wkhtmltopdf', [
        '--page-size', 'A4',
        '--margin-top', '0',
        '--margin-bottom', '0',
        '--margin-left', '0',
        '--margin-right', '0',
        '--encoding', 'UTF-8',
        '--enable-local-file-access',
        '--quiet',
        tmpHtml,
        tmpPdf,
      ], { timeout: 30000 });

      pdfBuffer = readFileSync(tmpPdf);
      try { unlinkSync(tmpHtml); unlinkSync(tmpPdf); } catch {}
    } catch (pdfErr) {
      console.warn('wkhtmltopdf failed, falling back to HTML attachment:', pdfErr.message);
    }

    const attachment = pdfBuffer
      ? { filename: pdfName,                   content: pdfBuffer,   contentType: 'application/pdf' }
      : { filename: pdfName.replace('.pdf','.html'), content: htmlContent, contentType: 'text/html' };

    await sendMail({
      to: toEmail,
      subject: `Your CV from PerfectCV`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#fff;">
          <div style="margin-bottom:28px;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;background:#2a5bd7;border-radius:9px;display:flex;align-items:center;justify-content:center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <span style="font-size:18px;font-weight:700;color:#1a1916;">PerfectCV</span>
            </div>
          </div>
          <h1 style="font-size:24px;color:#1a1916;margin:0 0 10px;">Here's your CV, ${user.name}!</h1>
          <p style="color:#6b6860;font-size:15px;line-height:1.7;margin:0 0 28px;">
            Your professional CV is attached${pdfBuffer ? ' as a PDF' : ''} — ready to send to employers. Good luck with your applications!
          </p>
          <div style="border-top:1px solid #f0ede8;padding-top:20px;">
            <p style="color:#b0ada6;font-size:12px;margin:0;">
              Made with <a href="https://cv-master-rose.vercel.app" style="color:#2a5bd7;text-decoration:none;">PerfectCV</a>
            </p>
          </div>
        </div>`,
      attachments: [attachment],
    });

    res.json({ ok: true, sentTo: toEmail, format: pdfBuffer ? 'pdf' : 'html' });
  } catch (e) {
    console.error('Email send error:', e.message);
    res.status(500).json({ error: 'Failed to send email: ' + e.message });
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
      line_items: [{ price_data: { currency: 'gbp', product_data: { name: 'PerfectCV Export', description: 'Professional PDF CV download' }, unit_amount: 499 }, quantity: 1 }],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/export-success?session={CHECKOUT_SESSION_ID}&draft=${draftId}`,
      cancel_url:  `${FRONTEND_URL}/builder`,
      metadata: { draftId, userId: req.user.sub },
    });
    res.json({ url: session.url, sessionId: session.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/payment/verify', authMiddleware, async (req, res) => {
  try {
    const { draftId = 'current' } = req.body;
    const { rows } = await query(
      'SELECT paid FROM payments WHERE (draft_id = $1 OR draft_id = $2) AND user_id = $3 AND paid = TRUE LIMIT 1',
      [draftId, 'current', req.user.sub]
    );
    res.json({ paid: rows.length > 0 });
  } catch (e) { res.status(500).json({ error: 'Verification failed.' }); }
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

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let db = false;
  try { await query('SELECT 1'); db = true; } catch {}
  res.json({ ok: true, db, groq: !!GROQ_KEY, stripe: !!STRIPE_KEY, google: !!GOOGLE_CLIENT_ID, time: new Date().toISOString() });
});

// ── STATIC (production) ───────────────────────────────────────────────────────
if (IS_PROD) {
  const distPath = join(__dirname, '../dist');
  app.use(express.static(distPath, { maxAge: '7d' }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found.' });
    res.sendFile(join(distPath, 'index.html'));
  });
}

export default app;

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\nPerfectCV API → http://localhost:${PORT}`);
    console.log(`  DB:     ${process.env.DATABASE_URL ? 'connected' : 'NOT SET — add DATABASE_URL'}`);
    console.log(`  Groq:   ${GROQ_KEY   ? 'configured' : 'NOT SET'}`);
    console.log(`  Stripe: ${STRIPE_KEY ? 'configured' : 'NOT SET (demo mode)'}`);
    console.log(`  Google: ${GOOGLE_CLIENT_ID ? 'configured' : 'NOT SET'}\n`);
  });
}