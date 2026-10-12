// Everything that changes with a rebrand lives here, plus the icons in assets/images, the name,
// ids and splash colour in app.json, and the colour tokens in src/lib/theme.tsx (kept in step with
// the website's src/style.css).
export const BRAND = {
  name: 'CVMaster',
  website: 'https://www.cvmaster.live',
  api: process.env.EXPO_PUBLIC_API_URL || 'https://api.cvmaster.live',
  support: 'support@cvmaster.live',
  // Google sign-in: the website's OAuth client id (public; the server checks sign-ins against it).
  // The iPhone app also needs EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, see app.config.ts.
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '645096295861-76m7h940l3dvi6f8a5990r0e6obu6sin.apps.googleusercontent.com',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
}
