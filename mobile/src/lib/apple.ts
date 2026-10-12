// Sign in with Apple (iPhone). Apple requires it in an iPhone app that offers Google sign-in.
// Apple gives an identity token the server checks (/api/auth/apple); the account is matched by
// Apple id or by email, so it is the same account as on the website. Apple shares the name and
// email only the first time someone signs in with it.
import { Platform } from 'react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import * as AppleAuthentication from 'expo-apple-authentication'

// Expo Go doesn't include Apple's sign-in, so the button only shows in the app's own iPhone build
export const appleAvailable = Platform.OS === 'ios' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient

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
