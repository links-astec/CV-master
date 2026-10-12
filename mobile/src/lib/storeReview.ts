// Ratings on the App Store and Google Play. At a good moment (just after someone's CV has been
// sent or downloaded) the phone's own review sheet is offered: Apple's and Google's rating
// pop-up, shown inside the app. Their rules: use their sheet, and don't ask "Do you like the
// app?" first (no filtering of unhappy users), so no question of ours comes before it.
// The phone decides whether the sheet actually appears (Apple: at most 3 times a year), and we
// only offer it after 2 days of use and then at most every 4 months.
import { Linking, Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import * as StoreReview from 'expo-store-review'

const FIRST = 'cvmaster-first-open'
const ASKED = 'cvmaster-store-review-at'
const DAY = 864e5

// Remembers when the app was first opened (root layout)
export async function noteFirstOpen() {
  try { if (!(await SecureStore.getItemAsync(FIRST))) await SecureStore.setItemAsync(FIRST, String(Date.now())) } catch {}
}

export async function maybeAskForStoreReview() {
  if (Platform.OS === 'web') return
  try {
    const first = Number(await SecureStore.getItemAsync(FIRST)) || Date.now()
    const asked = Number(await SecureStore.getItemAsync(ASKED)) || 0
    // While testing (Expo Go / dev builds) the sheet is offered every time, so it can be seen
    if (!__DEV__ && (Date.now() - first < 2 * DAY || Date.now() - asked < 120 * DAY)) return
    if (!(await StoreReview.isAvailableAsync()) || !(await StoreReview.hasAction())) return
    await SecureStore.setItemAsync(ASKED, String(Date.now()))
    setTimeout(() => { StoreReview.requestReview().catch(() => {}) }, 1200)   // after the success screen has shown
  } catch {}
}

// "Rate CVMaster" in Settings: the app's page in the store, from app.json (android.playStoreUrl;
// ios.appStoreUrl to add once the App Store gives the app its number)
export const storePageUrl = (): string | null => (Platform.OS === 'web' ? null : StoreReview.storeUrl())
export const openStorePage = () => { const u = storePageUrl(); if (u) Linking.openURL(u).catch(() => {}) }
