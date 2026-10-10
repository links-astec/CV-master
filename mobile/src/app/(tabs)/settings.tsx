// Settings, like the website's: account (or guest), AI requests, preferences (language, dark mode,
// quick tour), help and legal, and deleting the account (required by the App Store).
import { useState } from 'react'
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { ChevronRight } from '@/components/icons'
import { LangPill, TopBar } from '@/components/shell'
import { Btn, Card, Field, LinkBtn, PageTitle, SettingRow, Toggle, Txt } from '@/components/kit'
import { useAuth } from '@/lib/auth'
import { api, ApiError } from '@/lib/api'
import { startTour } from '@/lib/onboarding'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { BRAND } from '@/brand'

type Quota = { tier: string; limit: number; fullLimit?: number; freeLeft: number; credits?: number }

export default function Settings() {
  const { user, signOut, deleteAccount } = useAuth()
  const { t, lang } = useLang()
  const { c, dark, toggleDark } = useTheme()
  const quota = useQuery({ queryKey: ['quota', !!user], queryFn: () => api<Quota>('/api/ai/quota') })
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const usesPassword = user?.provider !== 'google'
  const web = (p: string) => WebBrowser.openBrowserAsync(`${BRAND.website}${p}?lang=${lang}`)
  const mail = (subject: string) => Linking.openURL(`mailto:${BRAND.support}?subject=${encodeURIComponent(subject)}`)

  function askDelete() {
    setError('')
    if (!confirm.trim()) { setError(usesPassword ? t('Please enter your password.') : t('Type your email address to confirm.')); return }
    Alert.alert(t('Delete your account?'), t('Your account and all your CVs will be deleted permanently. This can’t be undone.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete account'), style: 'destructive',
        onPress: async () => {
          setBusy(true)
          try { await deleteAccount(usesPassword ? { password: confirm } : { confirmEmail: confirm }) }
          catch (e) {
            // Until the server update is deployed, deletion is done by support
            if (e instanceof ApiError && e.status === 404) setError(t('Email {email} from this address and we’ll delete your account and CVs.', { email: BRAND.support }))
            else setError(e instanceof Error ? e.message : t('Something went wrong. Please try again.'))
          }
          setBusy(false)
        },
      },
    ])
  }

  const q = quota.data
  const help = [
    { title: t('Send feedback'), desc: t('Ideas or something that isn’t working'), go: () => mail('Feedback') },
    { title: t('Make a complaint'), desc: t('We reply to every complaint'), go: () => mail('Complaint') },
    { title: t('Privacy policy'), desc: t('What we collect and why'), go: () => web('/privacy') },
    { title: t('Terms of service'), desc: t('Payments, refunds and complaints'), go: () => web('/terms') },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title={t('Settings')} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <PageTitle title={t('Settings')} />

        {user ? (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={[styles.avatar, { backgroundColor: c.accentSoft }]}><Txt w={700} size={20} color={c.accent}>{(user.name || user.email)[0].toUpperCase()}</Txt></View>
              <View style={{ flex: 1 }}>
                <Txt w={700} size={17}>{user.name}</Txt>
                <Txt size={14} color={c.text3}>{user.email}</Txt>
              </View>
            </View>
            {!user.emailVerified && <Txt size={13.5} color={c.amber} style={{ lineHeight: 19 }}>{t('Confirm your email to unlock 30 AI requests a day. We sent a link to {email}.', { email: user.email })}</Txt>}
            <LinkBtn title={t('Sign out')} onPress={signOut} />
          </Card>
        ) : (
          <Card>
            <Txt w={700} size={18}>{t('You’re using CVMaster as a guest')}</Txt>
            <Txt color={c.text2} style={{ lineHeight: 22 }}>{t('Your CV is saved on this phone only. Create a free account to keep it safe, use it on any device and export it.')}</Txt>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Btn title={t('Create free account')} onPress={() => router.push('/auth')} />
              <Btn title={t('Sign in')} kind="secondary" onPress={() => router.push({ pathname: '/auth', params: { mode: 'signin' } })} />
            </View>
          </Card>
        )}

        <Card>
          <Txt w={700} size={18}>{t('AI requests')}</Txt>
          <Txt color={c.text2} style={{ lineHeight: 22 }}>
            {t(user?.emailVerified ? '30 free every day, reset at midnight (UTC). Extra requests never expire.' : '5 free a day. 30 once your email is confirmed. Reset at midnight (UTC). Extra requests never expire.')}
          </Txt>
          {q && (
            <Txt w={600} size={15}>
              {t('{n} of {limit} free left today', { n: q.freeLeft, limit: q.limit })}{q.credits ? ` · ${t('{n} extra', { n: q.credits })}` : ''}
            </Txt>
          )}
        </Card>

        <Card style={{ gap: 0 }}>
          <Txt w={700} size={18} style={{ marginBottom: 4 }}>{t('Preferences')}</Txt>
          <SettingRow first title={t('Language')} desc={t('The language of CVMaster itself. Your CV’s language is set in the editor.')} right={<LangPill />} />
          <SettingRow title={t('Dark mode')} desc={t('Easier on the eyes at night')} right={<Toggle value={dark} onChange={toggleDark} label={t('Dark mode')} />} />
          <SettingRow title={t('Quick tour')} desc={t('A one-minute walkthrough of building, tailoring and exporting')} right={<Btn title={t('Start tour')} kind="secondary" size="sm" onPress={startTour} />} />
        </Card>

        <Card style={{ gap: 0 }}>
          <Txt w={700} size={18} style={{ marginBottom: 4 }}>{t('Help & feedback')}</Txt>
          {help.map((h, i) => (
            <Pressable key={h.title} onPress={h.go} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <SettingRow first={i === 0} title={h.title} desc={h.desc} right={<ChevronRight size={20} color={c.text3} />} />
            </Pressable>
          ))}
        </Card>

        {user && (
          <Card>
            {!deleting ? (
              <LinkBtn title={t('Delete account')} color={c.danger} onPress={() => setDeleting(true)} />
            ) : (
              <>
                <Txt w={700} size={17}>{t('Delete your account?')}</Txt>
                <Txt color={c.text2} style={{ lineHeight: 22 }}>{t('Your account and all your CVs will be deleted permanently. This can’t be undone.')}</Txt>
                <Field
                  value={confirm} onChangeText={setConfirm} secureTextEntry={usesPassword} autoCapitalize="none"
                  placeholder={usesPassword ? t('Current password') : user.email}
                  accessibilityLabel={usesPassword ? t('Current password') : t('Type your email address to confirm.')} error={error || undefined}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Btn title={t('Cancel')} kind="secondary" onPress={() => { setDeleting(false); setConfirm(''); setError('') }} />
                  <Btn title={t('Delete account')} kind="danger" onPress={askDelete} busy={busy} />
                </View>
              </>
            )}
          </Card>
        )}

        <Txt size={12} color={c.text3} style={{ textAlign: 'center' }}>{BRAND.name} {Constants.expoConfig?.version}</Txt>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 22, gap: 18, paddingBottom: 40 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
})
