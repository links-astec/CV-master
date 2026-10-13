// A password reset link (https://www.cvmaster.live/reset-password?token=…) opened in the app:
// the same check and rules as the website's (8+ characters, the link works once, for 1 hour).
// Setting the new password signs the person in.
import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from '@/components/icons'
import { Btn, Field, IconBtn, Txt, useTopSpace } from '@/components/kit'
import { Mark } from '@/components/Logo'
import { toast } from '@/components/dialogs'
import { api, type User } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { errorText } from '@/lib/ai'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { BrandLoader } from '@/components/BrandLoader'

export default function ResetPassword() {
  const { token = '' } = useLocalSearchParams<{ token?: string }>()
  const { t } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const top = useTopSpace(16, { sheet: true })
  const { adoptUser } = useAuth()
  const [state, setState] = useState<'checking' | 'ok' | 'bad'>(token ? 'checking' : 'bad')
  const [why, setWhy] = useState(token ? '' : t('This reset link is incomplete. Request a new one.'))
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    api<{ valid: boolean; error?: string }>(`/api/auth/reset-password/${encodeURIComponent(token)}`)
      .then(r => { if (r.valid) setState('ok'); else { setState('bad'); setWhy(t(r.error || 'This reset link is invalid or has expired.')) } })
      .catch(() => { setState('bad'); setWhy(t('We could not check this reset link. Please try again.')) })
  }, [token, t])

  async function save() {
    setError('')
    if (pw.length < 8) { setError(t('Password must be at least 8 characters.')); return }
    if (pw !== pw2) { setError(t('Passwords don’t match.')); return }
    setBusy(true)
    try {
      const { user } = await api<{ user: User }>('/api/auth/reset-password', { body: { token, password: pw } })
      toast(t('Password updated. You’re signed in.'))
      adoptUser(user)
      router.replace('/')
    } catch (e) { setError(errorText(e)); setBusy(false) }
  }

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'))
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: top, paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Mark size={44} />
          <IconBtn icon={X} onPress={close} label={t('Close')} color={c.text3} />
        </View>
        <Txt w={800} size={28} style={{ letterSpacing: -0.5 }}>{t('Choose a new password')}</Txt>
        {state === 'checking' && <BrandLoader size={36} />}
        {state === 'bad' && (
          <>
            <Txt color={c.danger} style={{ lineHeight: 22 }}>{why}</Txt>
            <Btn title={t('Request a new link')} onPress={() => router.replace({ pathname: '/auth', params: { mode: 'forgot' } })} />
          </>
        )}
        {state === 'ok' && (
          <>
            <Field label={t('New password')} value={pw} onChangeText={setPw} secureTextEntry placeholder={t('At least 8 characters')} autoComplete="new-password" textContentType="newPassword" />
            <Field label={t('Confirm new password')} value={pw2} onChangeText={setPw2} secureTextEntry autoComplete="new-password" textContentType="newPassword" returnKeyType="go" onSubmitEditing={save} />
            {!!error && <Txt size={14} color={c.danger}>{error}</Txt>}
            <Btn title={t('Set new password')} onPress={save} busy={busy} size="lg" full />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 24, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
})
