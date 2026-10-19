// AI requests, like the website's pop-up: opened when today's free AI is used up (reason=limit)
// or from Settings. Shows what's left, and 100 extra requests for €0.50 for confirmed accounts.
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MessageSquareText, X } from '@/components/icons'
import { Btn, IconBtn, Toggle, Txt, useTopSpace } from '@/components/kit'
import { useAuth } from '@/lib/auth'
import { useApprox } from '@/lib/local'
import { api } from '@/lib/api'
import { useQuota } from '@/lib/quota'
import { checkoutAiPack } from '@/lib/pdf'
import { errorText } from '@/lib/ai'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

export default function AiLimit() {
  const { reason } = useLocalSearchParams<{ reason?: string }>()
  const { t } = useLang()
  const { c } = useTheme()
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const top = useTopSpace(12, { sheet: true })
  const quota = useQuota()
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const tier = quota.data?.tier || (user?.emailVerified === false ? 'unverified' : 'verified')
  const approx = useApprox(0.5)
  const limit = reason === 'limit'

  async function buy() {
    setBusy(true); setError('')
    try { await checkoutAiPack(consent); await quota.refetch() } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }
  async function resend() {
    try { await api('/api/auth/resend-verification', { method: 'POST' }); setResent(true) } catch (e) { setError(errorText(e)) }
  }

  return (
    <ScrollView style={{ backgroundColor: c.surface }} contentContainerStyle={[styles.body, { paddingTop: top, paddingBottom: insets.bottom + 30 }]}>
      <View style={{ alignItems: 'flex-end' }}><IconBtn icon={X} onPress={() => router.back()} label={t('Close')} color={c.text3} /></View>
      <View style={[styles.icon, { backgroundColor: c.accentSoft }]}><MessageSquareText size={24} color={c.accent} /></View>
      <Txt w={700} size={21} style={{ textAlign: 'center' }}>{t(limit ? 'You’ve used today’s free AI' : 'Your AI requests')}</Txt>
      <Txt color={c.text2} style={{ textAlign: 'center', lineHeight: 22 }}>
        {t(tier === 'unverified'
          ? 'You get 5 a day until you confirm your email. Then it’s 30 a day. Check your inbox for our link.'
          : 'You get 30 free AI requests a day. Writing help, tailoring, ATS checks and fixes. They reset every day at midnight (UTC).')}
      </Txt>
      {tier === 'unverified' && <Btn title={t(resent ? 'Sent ✓' : 'Resend confirmation email')} onPress={resend} style={{ alignSelf: 'center' }} />}
      {quota.data && (
        <View style={styles.quota}>
          <Txt color={c.text3}><Txt w={700} size={20}>{quota.data.freeLeft}</Txt> {t('free left today')}</Txt>
          <Txt color={c.text3}><Txt w={700} size={20}>{quota.data.credits}</Txt> {t('extra')}</Txt>
        </View>
      )}
      {(tier === 'verified' || tier === 'pass') && (
        <>
          <View style={[styles.offer, { borderColor: c.accent, backgroundColor: c.accentSoft }]}>
            <Txt w={700} size={16}>{t('100 extra AI requests')}</Txt>
            <Txt size={13.5} color={c.text2}>{t('One-time €0.50 · they never expire')}{approx ? ` (${approx})` : ''}</Txt>
            <Btn title={t(busy ? 'Please wait…' : 'Get them for €0.50')} busy={busy} disabled={!consent} onPress={buy} full style={{ marginTop: 6 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <Toggle value={consent} onChange={setConsent} label={t('I want the requests straight away and agree that I lose my 14-day right of withdrawal once they’re added.')} />
            <Txt size={13} color={c.text2} style={{ flex: 1, lineHeight: 19 }}>{t('I want the requests straight away and agree that I lose my 14-day right of withdrawal once they’re added.')}</Txt>
          </View>
        </>
      )}
      {!!error && <Txt size={14} color={c.danger} style={{ textAlign: 'center' }}>{error}</Txt>}
      <Btn title={t(limit ? 'Maybe tomorrow' : 'Close')} kind="ghost" onPress={() => router.back()} style={{ alignSelf: 'center' }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 24, gap: 14 },
  icon: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  quota: { flexDirection: 'row', justifyContent: 'center', gap: 26 },
  offer: { borderWidth: 1.5, borderRadius: 14, padding: 16, gap: 4 },
})
