// Settings: the account, the app's language (saved to the account like on the website), legal
// pages, support, signing out and deleting the account (required by the App Store).
import { useState } from 'react'
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Stack } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { LANGS, useLang } from '@/i18n'
import { useAuth } from '@/lib/auth'
import { api, ApiError } from '@/lib/api'
import { useColors } from '@/lib/theme'
import { BRAND } from '@/brand'

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  const c = useColors()
  return (
    <View style={{ gap: 8 }}>
      {!!title && <Text style={[styles.groupTitle, { color: c.text3 }]}>{title}</Text>}
      <View style={[styles.group, { backgroundColor: c.surface, borderColor: c.border }]}>{children}</View>
    </View>
  )
}

function Row({ label, value, onPress, color, first }: { label: string; value?: string; onPress?: () => void; color?: string; first?: boolean }) {
  const c = useColors()
  return (
    <Pressable
      onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : 'text'}
      style={({ pressed }) => [styles.row, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }, pressed && { backgroundColor: c.surface2 }]}>
      <Text style={{ flex: 1, color: color || c.text, fontSize: 15.5 }}>{label}</Text>
      {!!value && <Text style={{ color: c.text3, fontSize: 14, maxWidth: '60%' }} numberOfLines={1}>{value}</Text>}
      {onPress && !color && <Text style={{ color: c.text3, fontSize: 22, marginLeft: 6 }}>›</Text>}
    </Pressable>
  )
}

export default function Settings() {
  const { user, signOut, deleteAccount } = useAuth()
  const { t, lang, setLang } = useLang()
  const c = useColors()
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const usesPassword = user?.provider !== 'google'
  const open = (path: string) => () => WebBrowser.openBrowserAsync(`${BRAND.website}${path}?lang=${lang}`)

  function chooseLang(code: string) {
    setLang(code)
    api('/api/auth/settings', { method: 'PATCH', body: { uiLang: code } }).catch(() => {})
  }

  function askDelete() {
    setError('')
    if (!confirm.trim()) { setError(usesPassword ? t('Please enter your password.') : t('Type your email address to confirm.')); return }
    Alert.alert(t('Delete your account?'), t('Your account and all your CVs will be deleted permanently. This can’t be undone.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete account'), style: 'destructive',
        onPress: async () => {
          setBusy(true)
          try {
            await deleteAccount(usesPassword ? { password: confirm } : { confirmEmail: confirm })
          } catch (e) {
            // Until the server update is deployed, deletion is done by support
            if (e instanceof ApiError && e.status === 404) {
              setError(t('Email {email} from this address and we’ll delete your account and CVs.', { email: BRAND.support }))
            } else setError(e instanceof Error ? e.message : t('Something went wrong. Please try again.'))
          }
          setBusy(false)
        },
      },
    ])
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <Stack.Screen options={{ title: t('Settings') }} />

      <Group title={t('Account')}>
        <Row first label={user?.name || ''} value={user?.email} />
        {user && !user.emailVerified && (
          <View style={[styles.note, { borderTopColor: c.border }]}>
            <Text style={{ color: c.text2, fontSize: 13.5, lineHeight: 19 }}>{t('Confirm your email to unlock 30 AI requests a day. We sent a link to {email}.', { email: user.email })}</Text>
          </View>
        )}
      </Group>

      <Group title={t('Language')}>
        {LANGS.map((l, i) => (
          <Row key={l.code} first={i === 0} label={l.label} value={l.code === lang ? '✓' : undefined} onPress={l.code === lang ? undefined : () => chooseLang(l.code)} />
        ))}
      </Group>

      <Group title={t('Legal')}>
        <Row first label={t('Privacy policy')} onPress={open('/privacy')} />
        <Row label={t('Terms of service')} onPress={open('/terms')} />
        <Row label={t('Contact')} value={BRAND.support} onPress={() => Linking.openURL(`mailto:${BRAND.support}`)} />
      </Group>

      <Group>
        <Row first label={t('Sign out')} onPress={signOut} color={c.accent} />
      </Group>

      <Group>
        {!deleting ? (
          <Row first label={t('Delete account')} onPress={() => setDeleting(true)} color={c.danger} />
        ) : (
          <View style={styles.deleteBox}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 15.5 }}>{t('Delete your account?')}</Text>
            <Text style={{ color: c.text2, fontSize: 14, lineHeight: 20 }}>{t('Your account and all your CVs will be deleted permanently. This can’t be undone.')}</Text>
            <TextInput
              value={confirm} onChangeText={setConfirm} secureTextEntry={usesPassword}
              placeholder={usesPassword ? t('Current password') : user?.email} placeholderTextColor={c.text3}
              autoCapitalize="none" accessibilityLabel={usesPassword ? t('Current password') : t('Type your email address to confirm.')}
              style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]}
            />
            {!!error && <Text style={{ color: c.danger, fontSize: 13.5, lineHeight: 19 }} accessibilityLiveRegion="polite">{error}</Text>}
            <View style={styles.deleteActions}>
              <Pressable onPress={() => { setDeleting(false); setConfirm(''); setError('') }} hitSlop={8} accessibilityRole="button">
                <Text style={{ color: c.text2, fontSize: 15, fontWeight: '600' }}>{t('Cancel')}</Text>
              </Pressable>
              <Pressable onPress={askDelete} disabled={busy} hitSlop={8} accessibilityRole="button">
                {busy ? <ActivityIndicator color={c.danger} /> : <Text style={{ color: c.danger, fontSize: 15, fontWeight: '700' }}>{t('Delete account')}</Text>}
              </Pressable>
            </View>
          </View>
        )}
      </Group>

      <Text style={{ color: c.text3, fontSize: 12, textAlign: 'center' }}>{BRAND.name} {Constants.expoConfig?.version}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 20, paddingBottom: 48 },
  groupTitle: { fontSize: 12.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginLeft: 4 },
  group: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  note: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12 },
  deleteBox: { padding: 16, gap: 10 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  deleteActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
})
