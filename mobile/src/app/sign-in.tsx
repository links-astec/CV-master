// First screen when signed out: sign in, create an account, or get a password reset link.
// Same rules as the website: 8+ character passwords, Terms and Privacy agreement, optional newsletter.
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import { LANGS, useLang } from '@/i18n'
import { useAuth } from '@/lib/auth'
import { useColors } from '@/lib/theme'
import { BRAND } from '@/brand'

type Mode = 'signin' | 'signup' | 'forgot'

export default function SignIn() {
  const { signIn, register, forgotPassword } = useAuth()
  const { t, lang, setLang } = useLang()
  const c = useColors()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')
  const [langOpen, setLangOpen] = useState(false)

  function go(m: Mode) { setMode(m); setError(''); setSent('') }

  async function submit() {
    setError('')
    if (mode === 'forgot') {
      if (!email.trim()) { setError(t('Email required.')); return }
    } else {
      if (!email.trim() || !password) { setError(t('Email and password required.')); return }
      if (mode === 'signup') {
        if (!name.trim()) { setError(t('Please enter your name.')); return }
        if (password.length < 8) { setError(t('Password must be at least 8 characters.')); return }
        if (!agree) { setError(t('Please agree to the Terms and Privacy Policy.')); return }
      }
    }
    setBusy(true)
    try {
      if (mode === 'signin') await signIn(email, password)
      else if (mode === 'signup') await register({ name, email, password, newsletter })
      else { await forgotPassword(email); setSent(t('If an account exists for {email}, a reset link is on its way. It expires in 1 hour. Check your spam folder too.', { email: email.trim() })) }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Something went wrong. Please try again.'))
    }
    setBusy(false)
  }

  const input = [styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]
  const link = (path: string) => () => WebBrowser.openBrowserAsync(`${BRAND.website}${path}?lang=${lang}`)
  const title = mode === 'signin' ? t('Welcome back') : mode === 'signup' ? t('Create your free account') : t('Reset your password')
  const sub = mode === 'signin' ? t('Sign in to see your saved CVs.') : mode === 'signup' ? t('Free to build. Pay only when you export.') : t('Enter your email and we’ll send you a reset link.')

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.top}>
            <Text style={[styles.brand, { color: c.text }]}>CV<Text style={{ color: c.accent }}>{BRAND.name.slice(2)}</Text></Text>
            <Pressable onPress={() => setLangOpen(!langOpen)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('Language')}>
              <Text style={{ color: c.text2, fontSize: 14, fontWeight: '600' }}>🌐 {LANGS.find(l => l.code === lang)?.short}</Text>
            </Pressable>
          </View>
          {langOpen && (
            <View style={[styles.langs, { backgroundColor: c.surface, borderColor: c.border }]}>
              {LANGS.map(l => (
                <Pressable key={l.code} onPress={() => { setLang(l.code); setLangOpen(false) }} style={styles.langItem} accessibilityRole="button">
                  <Text style={{ color: l.code === lang ? c.accent : c.text, fontWeight: l.code === lang ? '700' : '500', fontSize: 15 }}>{l.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          <Text style={[styles.sub, { color: c.text2 }]}>{sub}</Text>

          {mode === 'signup' && (
            <>
              <Text style={[styles.label, { color: c.text2 }]}>{t('Full name')}</Text>
              <TextInput style={input} value={name} onChangeText={setName} autoComplete="name" textContentType="name" accessibilityLabel={t('Full name')} />
            </>
          )}
          <Text style={[styles.label, { color: c.text2 }]}>{t('Email address')}</Text>
          <TextInput
            style={input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={c.text3}
            autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" accessibilityLabel={t('Email address')}
          />
          {mode !== 'forgot' && (
            <>
              <Text style={[styles.label, { color: c.text2 }]}>{t('Password')}</Text>
              <TextInput
                style={input} value={password} onChangeText={setPassword} secureTextEntry
                placeholder={mode === 'signup' ? t('At least 8 characters') : undefined} placeholderTextColor={c.text3}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                returnKeyType="go" onSubmitEditing={submit} accessibilityLabel={t('Password')}
              />
            </>
          )}
          {mode === 'signin' && (
            <Pressable onPress={() => go('forgot')} hitSlop={8} style={{ alignSelf: 'flex-end', marginTop: 8 }} accessibilityRole="button">
              <Text style={{ color: c.accent, fontSize: 14 }}>{t('Forgot password?')}</Text>
            </Pressable>
          )}

          {mode === 'signup' && (
            <View style={{ gap: 12, marginTop: 14 }}>
              <View style={styles.switchRow}>
                <Switch value={agree} onValueChange={setAgree} accessibilityLabel={t('Please agree to the Terms and Privacy Policy.')} />
                <Text style={{ flex: 1, color: c.text2, fontSize: 14, lineHeight: 20 }}>
                  {t('I agree to the')} <Text style={{ color: c.accent }} onPress={link('/terms')}>{t('Terms of service')}</Text> {t('and the')} <Text style={{ color: c.accent }} onPress={link('/privacy')}>{t('Privacy policy')}</Text>
                </Text>
              </View>
              <View style={styles.switchRow}>
                <Switch value={newsletter} onValueChange={setNewsletter} accessibilityLabel={t('Email me CV tips and CVMaster news. At most a couple a month.')} />
                <Text style={{ flex: 1, color: c.text2, fontSize: 14, lineHeight: 20 }}>
                  {t('Email me CV tips and CVMaster news. At most a couple a month.')} <Text style={{ color: c.text3 }}>{t('Optional, unsubscribe any time.')}</Text>
                </Text>
              </View>
            </View>
          )}

          {!!error && <Text style={[styles.msg, { color: c.danger }]} accessibilityLiveRegion="polite">{error}</Text>}
          {!!sent && <Text style={[styles.msg, { color: c.success }]} accessibilityLiveRegion="polite">{sent}</Text>}

          <Pressable
            onPress={submit} disabled={busy} accessibilityRole="button"
            style={({ pressed }) => [styles.button, { backgroundColor: c.accent, opacity: pressed || busy ? 0.8 : 1 }]}>
            {busy ? <ActivityIndicator color={c.accentText} />
              : <Text style={[styles.buttonText, { color: c.accentText }]}>{mode === 'signin' ? t('Sign in') : mode === 'signup' ? t('Create account') : t('Send reset link')}</Text>}
          </Pressable>

          <View style={styles.switchMode}>
            {mode === 'signin' && (
              <Pressable onPress={() => go('signup')} hitSlop={8} accessibilityRole="button">
                <Text style={{ color: c.text2, fontSize: 15 }}>{t('Don’t have an account?')} <Text style={{ color: c.accent, fontWeight: '600' }}>{t('Create account')}</Text></Text>
              </Pressable>
            )}
            {mode === 'signup' && (
              <Pressable onPress={() => go('signin')} hitSlop={8} accessibilityRole="button">
                <Text style={{ color: c.text2, fontSize: 15 }}>{t('Already have an account?')} <Text style={{ color: c.accent, fontWeight: '600' }}>{t('Sign in')}</Text></Text>
              </Pressable>
            )}
            {mode === 'forgot' && (
              <Pressable onPress={() => go('signin')} hitSlop={8} accessibilityRole="button">
                <Text style={{ color: c.accent, fontSize: 15, fontWeight: '600' }}>{t('Back to sign in')}</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 24, paddingTop: 20, gap: 6, paddingBottom: 40 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  brand: { fontSize: 22, fontWeight: '700' },
  langs: { borderWidth: 1, borderRadius: 12, paddingVertical: 4, marginBottom: 16 },
  langItem: { paddingHorizontal: 16, paddingVertical: 10 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  sub: { fontSize: 15, marginBottom: 18, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 2 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  switchRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  msg: { fontSize: 14, marginTop: 12, lineHeight: 20 },
  button: { marginTop: 22, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  switchMode: { alignItems: 'center', marginTop: 22 },
})
