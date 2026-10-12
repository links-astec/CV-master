// A friend's invite link (https://www.cvmaster.live/invite/CODE) opened in the app: the code is
// kept for sign-up (it counts as their referral), then on to creating an account, or home if
// already signed in.
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { saveReferral } from '@/lib/referral'
import { markWelcomeDone } from '@/lib/onboarding'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'

export default function Invite() {
  const { code } = useLocalSearchParams<{ code?: string }>()
  const { user } = useAuth()
  const { c } = useTheme()
  useEffect(() => {
    if (code) saveReferral(String(code))
    if (user) { router.replace('/'); return }
    markWelcomeDone()
    router.replace('/welcome')
    setTimeout(() => router.push({ pathname: '/auth', params: { mode: 'signup' } }), 50)
  }, [code, user])
  return <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center' }}><ActivityIndicator color={c.accent} /></View>
}
