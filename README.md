# CVMaster

Everything for CVMaster (www.cvmaster.live) in one place.

| Folder | What's inside |
|---|---|
| `craftcv/` | The website (Vue) and the API server (Express, in `craftcv/server`). The `main` branch deploys it: Vercel for the site, Render for the API. |
| `mobile/` | The phone app (Expo). Developed on the `mobile` branch only. |
| `brand-kit/` | The designer's logo kit: SVGs, logo animations and the original zip. `craftcv/scripts/build-brand.mjs` reads it to make every logo, icon and image. |
| `presentations/` | Presentations, the original deck templates (`templates/`) and their videos and images (`assets/`). |
| `reports/dmarc/` | Email authentication reports from Google and Amazon SES. |

`brand-kit/`, `presentations/` and `reports/` stay on this computer and are not committed.

## Common tasks
- **Run the website locally:** in `craftcv/`, `npm run dev`. See `craftcv/README.md` and `craftcv/DEPLOY.md`.
- **Run the app:** in `mobile/`, `npx expo start -c`, then scan the QR code with Expo Go.
- **Rebuild brand assets after a logo change:** in `craftcv/`, `node scripts/build-brand.mjs`.
- **Release the website:** commit on `mobile`, apply the `craftcv/` changes to `main`, and push `main`.

## Database backups
Every night at 02:17 UTC, GitHub Actions (`.github/workflows/db-backup.yml`) copies the whole database with a read-only account, checks the copy can be read, encrypts it, and keeps it for 30 days under **Actions → Database backup → a run → Artifacts**. GitHub emails you if a run fails. You can also start one by hand there with **Run workflow**.

Backups are encrypted with `.github/backup-public-key.asc`. Only the private key opens them. Keep `CVMaster-backup-PRIVATE-key.asc` in your password manager, never in this repository.

### Restoring a backup
1. Download the artifact from the run you want, and unzip it (`cvmaster-db-YYYY-MM-DD.dump.gpg`).
2. Decrypt it: `gpg --import CVMaster-backup-PRIVATE-key.asc`, then `gpg --output cvmaster-db.dump --decrypt cvmaster-db-YYYY-MM-DD.dump.gpg`.
3. In Neon, create a new branch (or database) to restore into, and copy its connection string.
4. Restore with the PostgreSQL 18 tools: `pg_restore --no-owner --no-privileges --dbname "<new connection string>" cvmaster-db.dump`.
5. Check the data there, then point `DATABASE_URL` on Render at it. Delete the decrypted `cvmaster-db.dump` when you're done.
