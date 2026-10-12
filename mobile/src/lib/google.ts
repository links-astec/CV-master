// "Continue with Google", the phone's own Google sign-in. It returns the same kind of Google ID
// token the website's button does (issued for the website's client id), so the server's
// /api/auth/google signs the person into the same account on the website and in the app.
// Not available in Expo Go (it needs the app's own build), on the web build, or on iPhone until
// EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is set (see app.config.ts).
import { Platform } from 'react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import { BRAND } from '@/brand'

export const googleAvailable =
  Platform.OS !== 'web' &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient &&
  !!BRAND.googleWebClientId &&
  (Platform.OS === 'android' || !!BRAND.googleIosClientId)

type Lib = typeof import('@react-native-google-signin/google-signin')
// Loaded only when used: in Expo Go the native part is missing and loading it would fail
// eslint-disable-next-line @typescript-eslint/no-require-imports
const lib = (): Lib => require('@react-native-google-signin/google-signin')

let configured = false
function setup(l: Lib) {
  if (configured) return
  l.GoogleSignin.configure({ webClientId: BRAND.googleWebClientId, iosClientId: BRAND.googleIosClientId || undefined })
  configured = true
}

// The ID token, or null if the person closed Google's window
export async function googleIdToken(): Promise<string | null> {
  const l = lib()
  setup(l)
  if (Platform.OS === 'android') await l.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  try {
    const r = await l.GoogleSignin.signIn()
    if (!l.isSuccessResponse(r)) return null
    return r.data.idToken
  } catch (e) {
    if (l.isErrorWithCode(e) && (e.code === l.statusCodes.SIGN_IN_CANCELLED || e.code === l.statusCodes.IN_PROGRESS)) return null
    throw e
  }
}

// Signing out of CVMaster also forgets the Google account chosen, so the next sign-in can pick another
export async function googleSignOut() {
  if (!googleAvailable) return
  try { const l = lib(); setup(l); await l.GoogleSignin.signOut() } catch {}
}
