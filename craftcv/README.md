# CVMaster — AI CV Builder

**Vue 3 + Express + Groq + PostgreSQL** · Live at [cvmaster.live](https://cvmaster.live)

Build a CV (step by step, by narrating your story, or by uploading an old CV), tailor it to a
job offer with AI, check it against applicant tracking systems (ATS), then export it as a PDF.

---

## Quick start

```bash
cd craftcv
npm install
cp .env.example .env     # add DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY (or GROQ_API_KEY) at minimum
npm run db:migrate
npm run dev              # Vite on :5173 + API on :3001
```

Deployment (Vercel + Render + Neon): see [DEPLOY.md](DEPLOY.md).

---

## The main flow

No account is needed to start: guests build a CV that is saved in their browser, and create an
account (email or Google) only when they export — the CV moves into the account automatically.

1. **Pick a layout and colour** → asked for the **job offer** (optional, can be skipped).
2. **Build the CV** in the wizard: Manual, Narrate (story → AI extraction) or Upload (PDF/DOCX/TXT).
3. **Tailor** step: AI proposes a before/after for the headline, summary, experience bullets and
   skill order, using the job offer's wording. The user ticks which changes to apply. The AI is
   told never to invent facts; job keywords the CV doesn't show are offered separately, unticked.
4. **Review** step: the ATS job-match check runs automatically against the saved job offer
   (score, matched/missing keywords, gaps, suggestions) alongside the general quality check.
5. **Get my CV** → paywall → the PDF is emailed (and can be downloaded directly).

**One page, always.** The preview marks where page one ends. When a CV runs long, the user is
told and can trim it or choose *Shrink to fit*; exports are always fitted onto one A4 page
(`src/composables/pageFit.js` in the browser and `renderPdfFromHtml` on the server use the
same algorithm so the preview matches the PDF).

The job offer is stored on the draft (`cv_data.jobOffer`), so it follows the CV everywhere.

## Pricing and payments

| Product | Price | What it unlocks |
|---|---|---|
| Clean PDF | €0.99 | That one CV — re-send it free as often as you like, even after edits |
| Clean download | €0.50 | One watermark-free PDF download (the watermarked one is free) |
| Referral credit | free | One of the above, chosen at checkout. Earned when someone signs up with your link |

Payments are rows in `payments` with a `product` (`email_export` / `clean_download`) and a
`source` (`stripe` / `demo` / `credit`). Without `STRIPE_SECRET_KEY`, exports are free in
development (demo mode); in production they are unavailable unless `ALLOW_FREE_EXPORTS=true`.

## Structure

| Path | What |
|---|---|
| `server/index.js` | All API routes: auth, drafts, AI proxy + `/api/ai/tailor`, CV upload, PDF (Puppeteer), payments, admin |
| `server/migrate.js` | Idempotent schema migrations (runs on every Render deploy) |
| `src/composables/cvRenderer.js` | Template engine: 50 layouts (26 ATS-friendly, 24 creative; 38 of them in `cvLayoutsMore.js`) × 12 colours (`"layout:colour"` ids, old ids mapped). ATS-safe reading order, EN/FR headings, user text escaped once |
| `src/composables/pageFit.js` | One-page measurement and shrink-to-fit (mirrors the server) |
| `src/views/Editor.vue` | Editor page: `CvEditor` (Content / Design / Job & ATS) + `CvPreview` |
| `src/stores/cv.js` | CV data + formatting, autosave (browser for guests, account when signed in) |
| `src/components/WizardModal.vue` | Wizard shell; steps live in `src/components/wizard/` |
| `src/components/PaywallModal.vue` | €0.99 clean PDF (email + download) |
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
