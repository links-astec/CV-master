# CVMaster mobile app (Expo, React Native)

Lives on the `mobile` branch. The website (`../craftcv`) is not changed by anything here.

## How it reuses the website
- `metro.config.js` lets the app import website files from `../craftcv/src` (CV renderer,
  layouts, example CVs, interface dictionaries).
- The website's `i18n/index.js` is Vue-based; when website code imports it, Metro gives it
  `src/i18n/index.ts` instead (same exports, React-friendly). See the comment in metro.config.js.
- The app talks to the live server (`api.cvmaster.live`, override with `EXPO_PUBLIC_API_URL`).

## Rebranding
`src/brand.ts` (name, colours, URLs), `app.json` (name, ids, splash), `assets/images/icon.png`.

## Run it
    npm install
    npm run go              # Expo Go: scan the QR code with the Camera app (iPhone) or Expo Go (Android)
    npx expo start          # the development build (installed from EAS), not Expo Go

The project includes expo-dev-client, so a plain `npx expo start` makes a QR code for the development
build, which Expo Go cannot open. Use `npm run go` (or press s in the terminal to switch to Expo Go).

## Before calling anything done
    npx tsc --noEmit && npx expo lint && npx expo-doctor
    npx expo export --platform android   # proves the website code bundles
