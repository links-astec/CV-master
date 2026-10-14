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
