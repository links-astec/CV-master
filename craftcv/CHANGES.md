# Changes

## 2026-09-28 — Job-offer tailoring, payment fixes, AI model swap

### New: tailor the CV to a job offer

- **Picking a template asks for the job offer** (`JobOfferModal.vue`). It's optional: "No job offer — skip" still opens the wizard. The offer is saved on the draft as `cv_data.jobOffer`.
- **New "Tailor" wizard step**, just before Review (`wizard/StepTailor.vue`). It calls the new `POST /api/ai/tailor` and shows a before/after for the headline, summary, each experience description and the skill order. The user ticks which changes to apply, and there's an **Undo**. Job keywords the CV doesn't show are listed separately and **unticked**, with the note "only tick the ones you genuinely have". Users who start with "+ New CV" can paste the offer here.
- **The tailoring prompt forbids inventing anything**: employers, tools, tasks, numbers, outcomes, language levels. Each bullet must restate that role's own description. Tested against real Groq output in English and French.
- **Review step**: when there's a job offer, the ATS job-match check comes first and **runs automatically**. Results are cached per CV + offer, so the builder's hidden Score tab doesn't re-bill the AI. A **"Get my CV →"** button opens the paywall straight from the review.

### Fixed: all AI features were down

- Groq retired `llama-3.3-70b-versatile`, so every AI call (upload, narrate, summary, skills, ATS, review) was failing. The server now uses **`openai/gpt-oss-120b`**, which can be overridden with the `GROQ_MODEL` env var. The model is no longer chosen by the browser.

### Fixed: payments

- **£1.99 now unlocks one CV (draft)**, with free re-sends even after edits. Previously any past payment, even €0.50, unlocked unlimited exports.
- **`/api/cv/email` no longer trusts a `demoMode` flag from the browser.** Before, anyone could send CVs to any address without logging in or paying. Login and a paid draft are now always required. Demo mode exists only when the server has no Stripe key.
- `payments` gains `product` (`email_export` / `clean_download`) and `source` (`stripe` / `demo` / `credit`) columns. The migration backfills existing rows, and payments recorded under the old draft id `'current'` still work.
- **Referral credits now work.** They're spent at checkout on either product via `POST /api/referral/redeem`, and the credit is refunded if the unlock can't be recorded. The old `use-credit` endpoint only decremented the counter; it's removed.
- The €0.50 webhook now matches: metadata is set on the payment intent too, and it also handles `checkout.session.completed`.
- Watermark tokens use `crypto.randomBytes` and are tied to the user who created them.
- In demo mode, the clean download now actually downloads instead of only showing "done".
- After returning from Stripe, the paid draft is loaded before the PDF is rendered.
- Admin revenue counts only real Stripe payments and shows £ and € separately. Email campaigns report actual sent/failed counts.

### Fixed: bugs

- `App.vue` called `apiUrl()` without defining it. Your latest draft never loaded on page open, and maintenance mode was never detected.
- Drafts were saved to `/api/drafts` on the Vercel domain, so **drafts never saved in production**. The profile save, referral lookup and reset-link check had the same problem.
- Skill-level sliders had no effect: the renderer expected an array but the store saves an object, and 14 templates used hardcoded levels. Levels now also stay with their skill when one is removed or reordered.
- Opening a CV no longer carries the previous CV's job offer or skill levels over.
- The Dashboard renders a draft directly instead of temporarily swapping it into the editor, which triggered autosaves.
- "Fix →" in Review jumped one step too early in Narrate/Upload modes.
- Narrate speech recognition follows the CV language (fr-FR / en-GB).

### Security

- **CV text is HTML-escaped once in the renderer** (all 107 templates). Photos must be `data:image/…` and project links must be http(s).
- **PDF rendering can't reach the network** (SSRF): Puppeteer blocks all non-`data:` requests and JavaScript, and web security is back on. The wkhtmltopdf fallback no longer allows local file access or network access.
- In production, JWT secrets never fall back to the values committed in the repo.
- `/api/ai/complete` caps prompt size and fixes the model on the server.
- Filenames are sanitised before going into `Content-Disposition`.

### Honesty and content

- "Quantify" no longer tells the AI to invent metrics. It uses placeholders like `[X%]` for the user to fill in.
- When an AI call fails, the app shows an error instead of quietly writing stock text into the CV (summary, skills, experience, narrate).
- Landing page: removed the placeholder testimonials, the stock avatars with "Trusted by 2,400+", the employer-name ticker and the "every template passes ATS" claim.
- The watermark modal no longer promises a DOCX, and the link lifetime now says 2 hours (it said 1 hour).
- Legal page: renamed from PerfectCV to CVMaster at cvmaster.live, added per-CV, €0.50 and referral terms, and fixed the "Last updated" date (it used to show today's date).

### Deployment

- `render.yaml` no longer creates a free Render Postgres, which expires after 30 days; that's what took the database down. `DATABASE_URL` is now set by hand (Neon).
- `DEPLOY.md` is rewritten for the Vercel + Render + Neon setup. `README.md` is updated, and `.env.example` is added.

### Known limitations (not changed)

- Pending watermark downloads are kept in server memory for 2 hours and are lost if the server restarts.
- Maintenance mode is also in memory and resets on restart unless `MAINTENANCE_MODE=true` is set.
