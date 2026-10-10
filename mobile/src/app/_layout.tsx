import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18nReady, useLang } from '@/i18n'
import { AuthProvider, useAuth } from '@/lib/auth'
import { useColors } from '@/lib/theme'

SplashScreen.preventAutoHideAsync()
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

function RootNavigator() {
  const { user, ready } = useAuth()
  const { t } = useLang()
  const c = useColors()
  const [langReady, setLangReady] = useState(false)

  useEffect(() => { i18nReady.finally(() => setLangReady(true)) }, [])
  useEffect(() => { if (ready && langReady) SplashScreen.hideAsync() }, [ready, langReady])
  if (!ready || !langReady) return null

  const header = {
    headerStyle: { backgroundColor: c.surface },
    headerTintColor: c.accent,
    headerTitleStyle: { color: c.text, fontWeight: '600' as const },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: c.bg },
  }

  return (
    <Stack screenOptions={header}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="index" options={{ title: t('My CVs') }} />
        <Stack.Screen name="cv/[id]" options={{ title: '' }} />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  )
}
