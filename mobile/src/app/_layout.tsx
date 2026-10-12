import { useEffect, useRef, useState } from 'react'
import { Stack, router } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { AppState, Platform } from 'react-native'
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import {
  useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { i18nReady, useLang } from '@/i18n'
import { AuthProvider, useAuth } from '@/lib/auth'
import { currentReady, setEditorQueryClient, useEditorLifecycle } from '@/lib/editor'
import { ThemeProvider, useTheme } from '@/lib/theme'
import { onboardingReady, useWelcomeDone } from '@/lib/onboarding'
import { Tour } from '@/components/Tour'
import { DialogHost } from '@/components/dialogs'
import { useReferralLinks } from '@/lib/referral'

SplashScreen.preventAutoHideAsync()
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })
setEditorQueryClient(queryClient)
// Back in the app: refresh lists (CVs edited on the website, new notifications…)
if (Platform.OS !== 'web') {
  focusManager.setEventListener(onFocus => {
    const sub = AppState.addEventListener('change', s => onFocus(s === 'active'))
    return () => sub.remove()
  })
}

function RootNavigator() {
  const { user, ready } = useAuth()
  const { c, dark } = useTheme()
  useLang()
  useEditorLifecycle()
  useReferralLinks()
  const welcomeDone = useWelcomeDone()
  const [langReady, setLangReady] = useState(false)
  const [fonts] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold })

  useEffect(() => { Promise.all([i18nReady, onboardingReady, currentReady]).finally(() => setLangReady(true)) }, [])
  const allReady = ready && langReady && fonts && welcomeDone !== null
  useEffect(() => { if (allReady) SplashScreen.hideAsync() }, [allReady])

  // New accounts answer the three onboarding questions once (like the website's welcome pop-up)
  const askedFor = useRef('')
  useEffect(() => {
    if (allReady && user && !user.onboarded && askedFor.current !== user.id) {
      askedFor.current = user.id
      setTimeout(() => router.push('/onboard'), 300)
    }
  }, [allReady, user])

  if (!allReady) return null
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        {/* The app needs an account (the website also works as a guest). Signed out, and after
            signing out or deleting the account: the welcome screens, then sign in or sign up. */}
        <Stack.Protected guard={!user}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="auth" />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="export" options={{ presentation: 'modal' }} />
          <Stack.Screen name="feedback" options={{ presentation: 'modal' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
          <Stack.Screen name="ai-limit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="story" />
          <Stack.Screen name="onboard" options={{ presentation: 'modal', gestureEnabled: false }} />
        </Stack.Protected>
      </Stack>
      <Tour />
      <DialogHost />
    </>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
