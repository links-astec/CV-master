import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLang } from '@/i18n'
import { useAuth } from '@/lib/auth'
import { useColors } from '@/lib/theme'
import { BRAND } from '@/brand'

export default function SignIn() {
  const { signIn } = useAuth()
  const { t } = useLang()
  const c = useColors()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!email.trim() || !password) { setError(t('Email and password required.')); return }
    setBusy(true); setError('')
    try { await signIn(email, password) }
    catch (e) { setError(e instanceof Error ? e.message : t('Login failed.')) }
    setBusy(false)
  }

  const input = [styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={[styles.brand, { color: c.text }]}>CV<Text style={{ color: c.accent }}>{BRAND.name.slice(2)}</Text></Text>
          <Text style={[styles.title, { color: c.text }]}>{t('Welcome back')}</Text>
          <Text style={[styles.sub, { color: c.text2 }]}>{t('Sign in to see your saved CVs.')}</Text>

          <Text style={[styles.label, { color: c.text2 }]}>{t('Email address')}</Text>
          <TextInput
            style={input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={c.text3}
            autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress"
            returnKeyType="next" accessibilityLabel={t('Email address')}
          />
          <Text style={[styles.label, { color: c.text2 }]}>{t('Password')}</Text>
          <TextInput
            style={input} value={password} onChangeText={setPassword} secureTextEntry
            autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={submit}
            accessibilityLabel={t('Password')}
          />
          {!!error && <Text style={[styles.error, { color: c.danger }]} accessibilityLiveRegion="polite">{error}</Text>}

          <Pressable
            onPress={submit} disabled={busy} accessibilityRole="button"
            style={({ pressed }) => [styles.button, { backgroundColor: c.accent, opacity: pressed || busy ? 0.8 : 1 }]}>
            {busy ? <ActivityIndicator color={c.accentText} /> : <Text style={[styles.buttonText, { color: c.accentText }]}>{t('Sign in')}</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 24, paddingTop: 56, gap: 6 },
  brand: { fontSize: 22, fontWeight: '700', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  sub: { fontSize: 15, marginBottom: 20, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 2 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  error: { fontSize: 14, marginTop: 8 },
  button: { marginTop: 22, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
})
