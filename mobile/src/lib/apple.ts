// Sign in with Apple (iPhone). Apple requires it in an iPhone app that offers Google sign-in.
// Apple gives an identity token the server checks (/api/auth/apple); the account is matched by
// Apple id or by email, so it is the same account as on the website. Apple shares the name and
// email only the first time someone signs in with it.
// Only in the app's own iPhone build: in Expo Go the token would be issued for Expo Go, not CVMaster.
import { Platform } from 'react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import * as AppleAuthentication from 'expo-apple-authentication'

// For a quick test in Expo Go before the iPhone build exists: EXPO_PUBLIC_APPLE_IN_EXPO_GO=1 here and
// APPLE_AUDIENCES=host.exp.Exponent on the server. Remove both afterwards (Expo Go's tokens aren't ours).
const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient
// Expo Go has Apple's sign-in but not Apple's native button, so it gets a look-alike (see AppleButton)
export const appleNativeButton = !inExpoGo
export const appleAvailable = Platform.OS === 'ios' && (!inExpoGo || process.env.EXPO_PUBLIC_APPLE_IN_EXPO_GO === '1')

export type AppleSignIn = { identityToken: string; authorizationCode: string | null; fullName: { givenName: string | null; familyName: string | null } | null }

// → the credential, or null if the person closed Apple's sheet
export async function appleSignIn(): Promise<AppleSignIn | null> {
  try {
    const c = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    })
    if (!c.identityToken) return null
    return {
      identityToken: c.identityToken, authorizationCode: c.authorizationCode,
      fullName: c.fullName ? { givenName: c.fullName.givenName, familyName: c.fullName.familyName } : null,
    }
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null
    throw e
  }
}
