# CVMaster — AI CV Builder

**Vue 3 + Express + Groq + PostgreSQL** · Live at [cvmaster.live](https://cvmaster.live)

Build a CV (step by step, by narrating your story, or by uploading an old CV), tailor it to a
job offer with AI, check it against applicant tracking systems (ATS), then export it as a PDF.

---

## Quick start

```bash
cd craftcv
npm install
cp .env.example .env     # add DATABASE_URL, JWT_SECRET, GROQ_API_KEY at minimum
npm run db:migrate
npm run dev              # Vite on :5173 + API on :3001
```

Deployment (Vercel + Render + Neon): see [DEPLOY.md](DEPLOY.md).

---

## The main flow

1. **Pick a template** → asked for the **job offer** (optional, can be skipped).
2. **Build the CV** in the wizard: Manual, Narrate (story → AI extraction) or Upload (PDF/DOCX/TXT).
3. **Tailor** step: AI proposes a before/after for the headline, summary, experience bullets and
   skill order, using the job offer's wording. The user ticks which changes to apply. The AI is
   told never to invent facts; job keywords the CV doesn't show are offered separately, unticked.
4. **Review** step: the ATS job-match check runs automatically against the saved job offer
   (score, matched/missing keywords, gaps, suggestions) alongside the general quality check.
5. **Get my CV** → paywall → the PDF is emailed.

The job offer is stored on the draft (`cv_data.jobOffer`), so it follows the CV everywhere.

## Pricing and payments

| Product | Price | What it unlocks |
|---|---|---|
| Emailed export | £1.99 | That one CV — re-send it free as often as you like, even after edits |
| Clean download | €0.50 | One watermark-free PDF download (the watermarked one is free) |
| Referral credit | free | One of the above, chosen at checkout. Earned when someone signs up with your link |

Payments are rows in `payments` with a `product` (`email_export` / `clean_download`) and a
`source` (`stripe` / `demo` / `credit`). Without `STRIPE_SECRET_KEY` the server runs in
**demo mode** and exports are free.

## Structure

| Path | What |
|---|---|
| `server/index.js` | All API routes: auth, drafts, AI proxy + `/api/ai/tailor`, CV upload, PDF (Puppeteer), payments, admin |
| `server/migrate.js` | Idempotent schema migrations (runs on every Render deploy) |
| `src/composables/cvRenderer.js` | 107 templates → 700px HTML strings. All user text is escaped once at the entry point |
| `src/stores/cv.js` | CV data, autosave (localStorage + debounced DB save) |
| `src/components/WizardModal.vue` | Wizard shell; steps live in `src/components/wizard/` |
| `src/components/PaywallModal.vue` | £1.99 email export |
| `src/components/WatermarkUnlock.vue` | Free watermarked / €0.50 clean download |
| `admin.html` | Admin panel served at `/admin` |

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Vite + Express together |
| `npm run build` | Production frontend build |
| `npm start` | Production API server |
| `npm run db:migrate` | Create/upgrade the database schema |

See [CHANGES.md](CHANGES.md) for the change log.
