# Deploy PerfectCV — Vercel (app) + Render (Postgres database)

---

## Architecture

```
Vercel              →  Frontend (Vite build) + API (Express serverless)
Render PostgreSQL   →  Database (persistent storage)
```

The Express server runs as a single Vercel serverless function at `/api/server`.
Vercel rewrites all `/api/*` requests to it. The Vite frontend is served as static files.

---

## Step 1 — Create the Render PostgreSQL database

1. Go to https://render.com → **New → PostgreSQL**
2. Name: `perfectcv-db`, Plan: **Free**
3. Click **Create Database**
4. Once created, go to the database dashboard and copy the **External Database URL**
   (starts with `postgresql://...`) — you'll need this in Step 3.

---

## Step 2 — Push your code to GitHub

```bash
cd craftcv
git init
git add .
git commit -m "Initial PerfectCV commit"
git remote add origin https://github.com/YOUR_USERNAME/perfectcv.git
git push -u origin main
```

---

## Step 3 — Run the database migration

Before deploying, create the tables by running the migration from your local machine
using the **External** Render database URL:

```bash
# Add to your local .env file:
DATABASE_URL=postgresql://...your render EXTERNAL url...

# Then run:
npm run db:migrate
```

You should see: `Migrations complete.`

---

## Step 4 — Deploy to Vercel

1. Go to https://vercel.com/new → Import your GitHub repo
2. Vercel will detect the `vercel.json` — leave all settings as-is
3. Before clicking Deploy, go to **Environment Variables** and add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Use the **External** Render DB URL |
| `JWT_SECRET` | 64-char random string | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `GROQ_API_KEY` | `gsk_...` | Free at console.groq.com |
| `GOOGLE_CLIENT_ID` | `....apps.googleusercontent.com` | Optional — disables Google login if missing |
| `VITE_GOOGLE_CLIENT_ID` | same value as above | Needed at build time for the frontend |
| `SMTP_HOST` | e.g. `smtp.gmail.com` | Optional — uses Ethereal test email if missing |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` | your email | |
| `SMTP_PASS` | app password | Gmail: generate an App Password |
| `SMTP_FROM` | `noreply@yourdomain.com` | |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Optional — demo mode if missing |
| `NODE_ENV` | `production` | |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Set AFTER first deploy — see note below |

4. Click **Deploy**

> **FRONTEND_URL note:** On first deploy you won't know your URL yet. Deploy once,
> copy the `.vercel.app` URL from the dashboard, add it as `FRONTEND_URL`, then
> redeploy. This is needed for Stripe redirect URLs and password reset email links.

---

## Step 5 — Configure Google OAuth (if using Google login)

1. Go to https://console.cloud.google.com → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
   - `http://localhost:5173`
4. Save — Google sign-in will now work on your domain

---

## Local Development

```bash
cp .env.example .env
# Fill in DATABASE_URL with the Render External URL
# Fill in other vars as needed

npm install
npm run db:migrate   # only needed once (or after schema changes)
npm run dev          # starts Vite :5173 + Express :3001
```

---

## How it works on Vercel

```
vercel.json
  /api/:path*  →  api/server.js  (Express app as serverless function)
  /*           →  dist/index.html (Vite SPA)
```

`api/server.js` imports the Express app from `server/index.js`.
Vercel runs it as a Node.js 20 serverless function with a 30-second timeout.

---

## Free Tier Limits

**Vercel free:** 100GB bandwidth/month, unlimited deployments — plenty for a side project.

**Render free PostgreSQL:** The database is deleted after **90 days**. 
Before day 90, either upgrade to a paid plan ($7/mo) or export your data:
```bash
pg_dump "postgresql://...external url..." > backup.sql
```