import { useEffect, useRef, useState } from 'react'
import { Stack, router } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

SplashScreen.preventAutoHideAsync()
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })
setEditorQueryClient(queryClient)

function RootNavigator() {
  const { user, ready } = useAuth()
  const { c, dark } = useTheme()
  useLang()
  useEditorLifecycle()
  const welcomeDone = useWelcomeDone()
  const [langReady, setLangReady] = useState(false)
  const [fonts] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold })

  useEffect(() => { Promise.all([i18nReady, onboardingReady, currentReady]).finally(() => setLangReady(true)) }, [])
  const allReady = ready && langReady && fonts && welcomeDone !== null
  useEffect(() => { if (allReady) SplashScreen.hideAsync() }, [allReady])

  // New accounts answer the three onboarding questions once (like the website's welcome pop-up)
  const askedFor = useRef('')
  useEffect(() => {
    if (allReady && welcomeDone && user && !user.onboarded && askedFor.current !== user.id) {
      askedFor.current = user.id
      setTimeout(() => router.push('/onboard'), 300)
    }
  }, [allReady, welcomeDone, user])

  if (!allReady) return null
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        {/* First launch: the welcome screens, then the app (as a guest or signed in) */}
        <Stack.Protected guard={!welcomeDone}>
          <Stack.Screen name="welcome" />
        </Stack.Protected>
        <Stack.Protected guard={!!welcomeDone}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="story" />
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="onboard" options={{ presentation: 'modal', gestureEnabled: false }} />
          </Stack.Protected>
        </Stack.Protected>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
        </Stack.Protected>
      </Stack>
      <Tour />
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
