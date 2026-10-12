// The app's config is app.json; this adds what depends on the environment.
// Google sign-in on iPhone needs the iOS OAuth client id (from the same Google Cloud project as
// the website): set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (e.g. in .env or in EAS) and the URL
// scheme Google returns to is added. Without it, Google sign-in is simply hidden on iPhone.
import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosClient = (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '').trim()
  const plugins = [...(config.plugins || [])]
  if (iosClient) {
    plugins.push(['@react-native-google-signin/google-signin', {
      iosUrlScheme: `com.googleusercontent.apps.${iosClient.replace(/\.apps\.googleusercontent\.com$/, '')}`,
    }])
  }
  return { ...(config as ExpoConfig), plugins }
}
