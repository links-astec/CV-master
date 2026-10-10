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
    npx expo start          # scan the QR code with Expo Go (Android) or the Camera app (iPhone)

## Before calling anything done
    npx tsc --noEmit && npx expo lint && npx expo-doctor
    npx expo export --platform android   # proves the website code bundles
