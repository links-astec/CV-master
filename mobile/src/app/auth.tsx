// Sign in / create account / reset password, as a sheet like the website's sign-in pop-up.
// Same rules as the site: 8+ character passwords, Terms and Privacy agreement, optional newsletter,
// and a friend's invite code (from their link, or typed in) counts as the referral.
import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import { X } from '@/components/icons'
import { Btn, Field, IconBtn, Toggle, Txt, useTopSpace } from '@/components/kit'
import { Mark } from '@/components/Logo'
import { useAuth } from '@/lib/auth'
import { referrerName, savedReferral } from '@/lib/referral'
import { googleAvailable, googleIdToken } from '@/lib/google'
import { appleAvailable, appleSignIn } from '@/lib/apple'
import { AppleButton } from '@/components/AppleButton'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { BRAND } from '@/brand'

type Mode = 'signin' | 'signup' | 'forgot'

export default function Auth() {
  const params = useLocalSearchParams<{ mode?: string; reason?: string }>()
  const { signIn, register, forgotPassword, signInWithGoogle, signInWithApple } = useAuth()
  const { t, lang } = useLang()
  const { c, dark } = useTheme()
  const insets = useSafeAreaInsets()
  const top = useTopSpace(16)   // a full screen (from the welcome screens), so below the notch on iPhone
  const [mode, setMode] = useState<Mode>(params.mode === 'signin' || params.mode === 'forgot' ? params.mode : 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')
  const [refCode, setRefCode] = useState('')
  const [refName, setRefName] = useState('')
  const [refOpen, setRefOpen] = useState(false)

  // A friend's code from the link that opened the app
  useEffect(() => { savedReferral().then(code => { if (code) { setRefCode(code); referrerName(code).then(setRefName) } }) }, [])
  const checkRef = () => { if (refCode.trim()) referrerName(refCode).then(setRefName); else setRefName('') }

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
      else if (mode === 'signup') await register({ name, email, password, newsletter, referredBy: refCode.trim() })
      else { await forgotPassword(email); setSent(t('If an account exists for {email}, a reset link is on its way. It expires in 1 hour. Check your spam folder too.', { email: email.trim() })) }
    } catch (e) {
      // A Google account without a password: the app signs in by email, so offer to set one
      if ((e as { code?: string }).code === 'GOOGLE_ACCOUNT') { setMode('forgot'); setError(t('This account signs in with Google. To use the app, set a password: tap “Send reset link” and we’ll email you a link.')) }
      else setError(e instanceof Error ? e.message : t('Something went wrong. Please try again.'))
    }
    setBusy(false)
  }

  // Same Google account as on the website. Creating an account this way needs the Terms too.
  async function google() {
    setError('')
    if (mode === 'signup' && !agree) { setError(t('Please agree to the Terms and Privacy Policy first.')); return }
    setBusy(true)
    try {
      const idToken = await googleIdToken()
      if (idToken) await signInWithGoogle({ idToken, newsletter: mode === 'signup' && newsletter, referredBy: refCode.trim() })
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t('Google sign-in failed, please try again.'))
    }
    setBusy(false)
  }

  // Sign in with Apple (iPhone), the same rules as Google
  async function apple() {
    setError('')
    if (mode === 'signup' && !agree) { setError(t('Please agree to the Terms and Privacy Policy first.')); return }
    setBusy(true)
    try {
      const cred = await appleSignIn()
      if (cred) await signInWithApple({ ...cred, newsletter: mode === 'signup' && newsletter, referredBy: refCode.trim() })
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t('Apple sign-in failed, please try again.'))
    }
    setBusy(false)
  }

  const title = mode === 'signin' ? t('Welcome back') : mode === 'signup' ? t('Create your free account') : t('Reset your password')
  const sub = mode === 'signin' ? t('Sign in to see your saved CVs.') : mode === 'signup' ? t('Free to build. Pay only when you export.') : t('Enter your email and we’ll send you a reset link.')

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: top, paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Mark size={44} />
          <IconBtn icon={X} onPress={() => router.back()} label={t('Close')} color={c.text3} />
        </View>
        <Txt w={800} size={28} style={{ letterSpacing: -0.5, lineHeight: 34 }}>{title}</Txt>
        <Txt size={15.5} color={c.text2} style={{ lineHeight: 22, marginBottom: 6 }}>{sub}</Txt>

        {mode === 'signup' && !!refCode && !refOpen && (
          <View style={[styles.ref, { backgroundColor: c.greenSoft }]}>
            <Txt size={14} color={c.green} style={{ lineHeight: 20 }}>
              <Txt w={700} size={14} color={c.green}>{refName ? t('{name} invited you.', { name: refName }) : t('You were invited.')}</Txt> {t('They earn a free export credit when you join.')}
            </Txt>
          </View>
        )}
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

        {mode === 'signup' && (refOpen ? (
          <Field label={t('Invite code (optional)')} value={refCode} onChangeText={setRefCode} onBlur={checkRef} autoCapitalize="characters" autoCorrect={false}
            hint={refName ? t('{name} invited you.', { name: refName }) : undefined} />
        ) : !refCode && (
          <Pressable onPress={() => setRefOpen(true)} hitSlop={8} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
            <Txt w={600} size={14} color={c.accent}>{t('Have an invite code?')}</Txt>
          </Pressable>
        ))}
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

        {(googleAvailable || appleAvailable) && mode !== 'forgot' && (
          <>
            <View style={styles.or}>
              <View style={[styles.orLine, { backgroundColor: c.border }]} />
              <Txt size={13} color={c.text3}>{t('or')}</Txt>
              <View style={[styles.orLine, { backgroundColor: c.border }]} />
            </View>
            {appleAvailable && (
              <AppleButton signUp={mode === 'signup'} dark={dark} disabled={busy} onPress={apple} />
            )}
            {googleAvailable && <Pressable onPress={google} disabled={busy} accessibilityRole="button"
              style={({ pressed }) => [styles.google, { borderColor: c.border2, backgroundColor: c.surface, opacity: busy ? 0.6 : pressed ? 0.85 : 1 }]}>
              <Txt w={800} size={18} color="#4285F4">G</Txt>
              <Txt w={600} size={16}>{t('Continue with Google')}</Txt>
            </Pressable>}
          </>
        )}

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
  ref: { borderRadius: 12, padding: 12 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth },
  google: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderRadius: 10, paddingVertical: 14 },
})
