// Sign in / create account / reset password, as a sheet like the website's sign-in pop-up.
// Same rules as the site: 8+ character passwords, Terms and Privacy agreement, optional newsletter.
// A guest's CV moves into the account (see lib/auth.tsx).
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import { X } from '@/components/icons'
import { Btn, Field, IconBtn, Toggle, Txt } from '@/components/kit'
import { Mark } from '@/components/Logo'
import { useAuth } from '@/lib/auth'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { BRAND } from '@/brand'

type Mode = 'signin' | 'signup' | 'forgot'

export default function Auth() {
  const params = useLocalSearchParams<{ mode?: string; reason?: string }>()
  const { signIn, register, forgotPassword } = useAuth()
  const { t, lang } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<Mode>(params.mode === 'signin' ? 'signin' : 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')

  const go = (m: Mode) => { setMode(m); setError(''); setSent('') }
  const web = (p: string) => () => WebBrowser.openBrowserAsync(`${BRAND.website}${p}?lang=${lang}`)

  async function submit() {
    setError('')
    if (mode === 'forgot') { if (!email.trim()) { setError(t('Email required.')); return } }
    else {
      if (!email.trim() || !password) { setError(t('Email and password required.')); return }
      if (mode === 'signup') {
        if (!name.trim()) { setError(t('Please enter your name.')); return }
        if (password.length < 8) { setError(t('Password must be at least 8 characters.')); return }
        if (!agree) { setError(t('Please agree to the Terms and Privacy Policy.')); return }
      }
    }
    setBusy(true)
    try {
      // Signing in closes this sheet by itself (it's only available while signed out)
      if (mode === 'signin') await signIn(email, password)
      else if (mode === 'signup') await register({ name, email, password, newsletter })
      else { await forgotPassword(email); setSent(t('If an account exists for {email}, a reset link is on its way. It expires in 1 hour. Check your spam folder too.', { email: email.trim() })) }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Something went wrong. Please try again.'))
    }
    setBusy(false)
  }

  const title = mode === 'signin' ? t('Welcome back') : mode === 'signup' ? t('Create your free account') : t('Reset your password')
  const sub = params.reason === 'download' && mode !== 'forgot'
    ? t('Create a free account to download. The CV you built comes with you.')
    : mode === 'signin' ? t('Sign in to see your saved CVs.') : mode === 'signup' ? t('Free to build. Pay only when you export.') : t('Enter your email and we’ll send you a reset link.')

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: Platform.OS === 'android' ? insets.top + 16 : 24, paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Mark size={44} />
          <IconBtn icon={X} onPress={() => router.back()} label={t('Close')} color={c.text3} />
        </View>
        <Txt w={800} size={28} style={{ letterSpacing: -0.5, lineHeight: 34 }}>{title}</Txt>
        <Txt size={15.5} color={c.text2} style={{ lineHeight: 22, marginBottom: 6 }}>{sub}</Txt>

        {mode === 'signup' && <Field label={t('Full name')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" />}
        <Field
          label={t('Email address')} value={email} onChangeText={setEmail} placeholder="you@example.com"
          autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress"
        />
        {mode !== 'forgot' && (
          <Field
            label={t('Password')} value={password} onChangeText={setPassword} secureTextEntry
            placeholder={mode === 'signup' ? t('At least 8 characters') : undefined}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} textContentType={mode === 'signup' ? 'newPassword' : 'password'}
            returnKeyType="go" onSubmitEditing={submit}
          />
        )}
        {mode === 'signin' && (
          <Pressable onPress={() => go('forgot')} hitSlop={8} style={{ alignSelf: 'flex-end' }} accessibilityRole="button">
            <Txt w={600} size={14} color={c.accent}>{t('Forgot password?')}</Txt>
          </Pressable>
        )}

        {mode === 'signup' && (
          <View style={{ gap: 14, marginTop: 4 }}>
            <View style={styles.switchRow}>
              <Toggle value={agree} onChange={setAgree} label={t('Please agree to the Terms and Privacy Policy.')} />
              <Txt size={14} color={c.text2} style={{ flex: 1, lineHeight: 20 }}>
                {t('I agree to the')} <Txt size={14} color={c.accent} onPress={web('/terms')}>{t('Terms of service')}</Txt> {t('and the')} <Txt size={14} color={c.accent} onPress={web('/privacy')}>{t('Privacy policy')}</Txt>
              </Txt>
            </View>
            <View style={styles.switchRow}>
              <Toggle value={newsletter} onChange={setNewsletter} label={t('Email me CV tips and CVMaster news. At most a couple a month.')} />
              <Txt size={14} color={c.text2} style={{ flex: 1, lineHeight: 20 }}>
                {t('Email me CV tips and CVMaster news. At most a couple a month.')} <Txt size={14} color={c.text3}>{t('Optional, unsubscribe any time.')}</Txt>
              </Txt>
            </View>
          </View>
        )}

        {!!error && <Txt size={14} color={c.danger} style={{ lineHeight: 20 }} accessibilityLiveRegion="polite">{error}</Txt>}
        {!!sent && <Txt size={14} color={c.green} style={{ lineHeight: 20 }} accessibilityLiveRegion="polite">{sent}</Txt>}

        <Btn
          title={mode === 'signin' ? t('Sign in') : mode === 'signup' ? t('Create account') : t('Send reset link')}
          onPress={submit} busy={busy} size="lg" full style={{ marginTop: 6 }}
        />

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          {mode === 'signin' && (
            <Txt size={15} color={c.text2}>{t('Don’t have an account?')} <Txt w={600} size={15} color={c.accent} onPress={() => go('signup')}>{t('Create account')}</Txt></Txt>
          )}
          {mode === 'signup' && (
            <Txt size={15} color={c.text2}>{t('Already have an account?')} <Txt w={600} size={15} color={c.accent} onPress={() => go('signin')}>{t('Sign in')}</Txt></Txt>
          )}
          {mode === 'forgot' && <Txt w={600} size={15} color={c.accent} onPress={() => go('signin')}>{t('Back to sign in')}</Txt>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 24, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  switchRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
})
