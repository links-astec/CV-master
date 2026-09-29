# Changes

## 2026-09-29 — Redesign, new template engine, one-page fit, guest mode, email fix

### Fixed: the CV export didn't arrive
- **Email could not be sent from production at all.** Render's free tier blocks outbound SMTP (Gmail timed out after 2 minutes), and the Resend fallback refused a `@gmail.com` sender. Resend is now the primary sender, from `RESEND_FROM` (default `CVMaster <noreply@cvmaster.live>`). SMTP is a fast-failing fallback (10 s timeouts). **Action needed:** verify `cvmaster.live` in Resend (DEPLOY.md, step 6).
- **A paid CV can now always be downloaded directly** (`POST /api/cv/export-pdf`). If the email fails after payment, the paywall offers "Download PDF" instead of an error.
- **Removed "Try demo".** It created throwaway accounts with a fake `@cvmaster.app` address (and a shared password), so the emailed CV could never arrive.

### Fixed: white space in PDFs
- Shrink-to-fit zoomed out the fixed 700px CV, which left white strips on the right and at the bottom. The CV is now widened before zooming, so it fills the page exactly. The best zoom is found by binary search.

### New: one-page guide and shrink-to-fit
- The preview marks where page one ends, and hatches anything past it.
- When an edit pushes the CV past one A4 page, a toast says so. A notice gives the exact overflow ("13% longer than one page") with **Shrink to fit** and **Undo**.
- The choice is saved per CV (`shrinkToFit`). The paywall asks before exporting a long CV: "Edit it first" or "Continue & shrink to fit" (with the resulting text size, and a warning below 82%).
- The browser (`src/composables/pageFit.js`) and the server use the same fit algorithm, so the preview matches the PDF.

### New: template engine — 8 layouts × 12 colours (replaces the 107 templates)
- The old set was mostly colour copies of ~10 layouts. It included 12+ full-black pages, and the "infographic" template **printed fake stats ("8+ Yrs Exp. · 2M+ Users · £3.5M Rev.") on every CV**.
- The new layouts are Modern, Classic, Sidebar, Minimal, Executive, Compact, Timeline and Photo, all built from shared blocks:
  - **ATS-safe reading order.** The main column comes first in the PDF text, even when the sidebar is drawn on the left (verified by extracting text from the generated PDF).
  - **Real headings** (h1/h2) in the CV's language. There's a new **English / Français** switch in Design. French CVs used to get English headings.
  - **Contact line with separators.** Links are clickable, and URLs wrap only at "/" so an ATS never sees them split at a hyphen.
  - **Light, printable pages.** No placeholder text in exports.
- Template ids are now `layout:colour`. Every old id maps to the closest new layout, so existing CVs keep working.
- Fonts are limited to ones embedded in the PDF (DM Sans, Inter, Lora), so preview and PDF match. They're self-hosted; there's no Google Fonts dependency.

### Changed: skills are plain lists
- Skill bars, percentage sliders and skill levels are removed, as agreed. Skills render as clean text lists. Long lists wrap into a single line in narrow columns.

### New: guest mode (no account needed to start)
- Anyone can build, tailor and preview a CV in their browser. Creating an account is asked for only when exporting or downloading. The CV built so far is saved into the new account automatically.
- Signing out clears the CV from the browser (shared computers).

### New: UI redesign ("clean & calm")
- There's a new design system (`src/style.css`): neutral surfaces, one indigo accent, Inter, soft borders, and a working dark mode.
- Rebuilt or restyled:
  - landing page (honest copy, real rendered CVs instead of stock photos, FAQ);
  - app shell and navigation;
  - My CVs (live thumbnails, paid badge, Email again);
  - Templates (layout cards and a colour picker);
  - the Editor, now a page at `/editor`, with **Content / Design / Job & ATS** tabs;
  - wizard, paywall, download, sign-in pop-up and settings.
- The builder can now edit **work experience** (previously wizard-only). The duplicated mobile form is replaced by a shared editor drawer.
- In Review, **"Fix →" only shows on checks that failed**. In the editor it opens the matching section.

### Also fixed
- **Password-reset links didn't work:** `/reset-password?token=…` was redirected to `/` and the token was dropped.
- **Design settings** (font, sizes, spacing) weren't saved with the CV; they now are.
- **In production without a Stripe key, exports were free.** They now report "Payments temporarily unavailable" (`ALLOW_FREE_EXPORTS=true` restores free exports deliberately).
- **Guests can use the AI features,** with a separate hourly limit per IP.
- **Settings:** removed three notification toggles that weren't connected to anything.
- **Copy:** removed or softened unsupported claims ("top 10% of applicants", "Likely to pass ATS", "Pass every applicant tracking system", "Most popular").

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
