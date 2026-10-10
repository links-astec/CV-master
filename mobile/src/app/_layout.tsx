import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18nReady, useLang } from '@/i18n'
import { AuthProvider, useAuth } from '@/lib/auth'
import { setEditorQueryClient, useEditorLifecycle } from '@/lib/editor'

SplashScreen.preventAutoHideAsync()
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })
setEditorQueryClient(queryClient)

function RootNavigator() {
  const { user, ready } = useAuth()
  useLang()
  useEditorLifecycle()
  const [langReady, setLangReady] = useState(false)

  useEffect(() => { i18nReady.finally(() => setLangReady(true)) }, [])
  useEffect(() => { if (ready && langReady) SplashScreen.hideAsync() }, [ready, langReady])
  if (!ready || !langReady) return null

  // Everything in (app) needs an account; sign-in is only reachable when signed out
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" />
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
