# PerfectCV — AI Resume Builder

**Vue 3 + Express + Groq** · Production-ready CV builder with auth, 16 templates, AI writing, dark mode, and Stripe paywall.

---

## Quick Start

```bash
unzip perfectcv.zip && cd craftcv
npm install
cp .env.example .env        # Add your GROQ_API_KEY
npm run dev                  # Starts frontend :5173 + API :3001
```

Open → **http://localhost:5173**

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Get free at [console.groq.com](https://console.groq.com) |
| `JWT_SECRET` | ✅ Yes | Long random string for auth tokens |
| `STRIPE_SECRET_KEY` | Optional | Paywall (runs in demo mode without it) |
| `PORT` | Optional | API port (default: 3001) |

---

## What's Built

### Auth & Onboarding
- Register / Login / Logout with **JWT httpOnly cookies**
- 3-step onboarding (industry + goal + summary)
- Demo login (one click, no email needed)
- Passwords hashed with bcrypt (12 rounds)

### CV Wizard
- **3 modes**: Manual (6-step), Narrate (story → AI extraction), Upload (import PDF/DOCX)  
- Live preview scales automatically to fill the right panel
- Template cycling with ◀ ▶ buttons — all 16 templates
- Auto-saves draft on close (X button)
- Photo upload for "Photo Professional" template

### 16 CV Templates
| Category | Templates |
|---|---|
| Professional | Executive Slate, Modern Azure, Gradient Flow, Swiss Design, Elegant Gold, **Photo Professional** |
| Minimal | Minimal Editorial, Compact Grid, Academic |
| Creative | Creative Violet, Teal Sidebar, Pastel Rose, Infographic |
| Tech | Bold Noir, Tech Dark |
| Unique | Newspaper |

### AI Features (Groq — server-side only, no key in UI)
- Enhance summary with tone picker (Professional / Creative / Concise)
- Quantify experience bullets with metrics
- Suggest skills for any job title
- Narrate mode: paste your story → full CV auto-filled
- CV score + improvement suggestions in Review step

### Notifications
- Bell icon with unread count badge
- Dropdown with mark-read / mark-all-read
- Auto-seeded on register: welcome + tips + feature alerts
- Payment notification on successful export unlock

### Dark Mode
- CSS variable swap (`data-theme="dark"`)  
- Persisted in `localStorage`  
- Toggle in Settings + quick icon in topbar

### Paywall (Stripe)
- £4.99 one-time export fee  
- Runs in **demo mode** if `STRIPE_SECRET_KEY` not set  
- Payment unlocks PDF download + fires notification

### Security
- `helmet` with strict CSP headers
- Rate limiting: 200/15min API · 20/min AI · 10/15min auth
- `httpOnly` + `SameSite=lax` cookies
- Groq API key **never sent to client**
- `compression` + CORS locked to frontend URL in prod

### SEO
- Full OG + Twitter Card meta tags
- `schema.org/WebApplication` structured data
- Canonical URL, robots index/follow
- Preconnect for Google Fonts

---

## Production Deployment

1. `npm run build` → builds to `dist/`
2. Set `NODE_ENV=production` and `FRONTEND_URL=https://yourdomain.com`
3. `npm start` serves both API + static frontend

**Replace before going live:**
- In-memory `Map` stores → PostgreSQL / SQLite
- CV upload stub → `pdf-parse` + Groq extraction
- PDF export → Puppeteer or `wkhtmltopdf`

---

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Start both servers (Vite + Express) |
| `npm run build` | Production frontend build |
| `npm start` | Production server |
