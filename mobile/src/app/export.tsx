// Export, like the website's export pop-up: a CV longer than one page is shrunk to fit only once
// the user agrees; then the clean PDF (€0.99 for this CV, or a referral credit, or free to re-send
// once paid) is emailed and can be downloaded. The free preview with the watermark is here too.
import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Check, X } from '@/components/icons'
import { Btn, Card, Field, IconBtn, LinkBtn, Toggle, Txt, useTopSpace } from '@/components/kit'
import { toast } from '@/components/dialogs'
import { useAuth } from '@/lib/auth'
import { flush, setField, useCurrentCvId } from '@/lib/editor'
import { useOpenCv } from '@/lib/useOpenCv'
import { pageInfoOf } from '@/lib/pageInfo'
import { checkout, emailCv, paidStatus, redeemCredit, shareCleanPdf, sharePreviewPdf } from '@/lib/pdf'
import { errorText } from '@/lib/ai'
import { api } from '@/lib/api'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

type State = 'checking' | 'tooLong' | 'ready' | 'sending' | 'sent' | 'emailFailed' | 'error'
const FEATURES = ['Clean, watermark-free PDF, emailed to you', 'Download it straight away too', 'Re-send or download again free, even after edits']
const okEmail = (s: string) => !s.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())

export default function Export() {
  const { t } = useLang()
  const { c } = useTheme()
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const top = useTopSpace(12, { sheet: true })
  const id = useCurrentCvId()
  const { cv } = useOpenCv(id)
  const [state, setState] = useState<State>('checking')
  const [paid, setPaid] = useState(false)
  const [demo, setDemo] = useState(false)
  const [credits, setCredits] = useState(0)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')

  const page = id ? pageInfoOf(id) : null
  const over = Math.max(1, Math.round((page?.overBy || 0) * 100))
  const zoom = Math.round((page?.zoom || 1) * 100)
  const fileName = cv ? ([cv.data.fn, cv.data.ln].filter(Boolean).join(' ') || 'My CV').replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-CV.pdf' : 'CV.pdf'

  async function prepare() {
    if (!id) return
    setState('checking'); setError('')
    try {
      await flush()
      const [isPaid, ref] = await Promise.all([
        paidStatus(id),
        api<{ credits: number }>('/api/referral/info').catch(() => ({ credits: 0 })),
      ])
      setPaid(isPaid)
      setCredits(Number(ref.credits) || 0)
      setState(page?.overflow && !cv?.data.shrinkToFit ? 'tooLong' : 'ready')
    } catch (e) { setError(errorText(e)); setState('error') }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (cv) queueMicrotask(prepare) }, [!!cv])

  async function send(sessionId?: string) {
    if (!id) return
    setState('sending'); setError('')
    try {
      await flush()
      const r = await emailCv({ draftId: id, overrideEmail: email.trim() || null, sessionId })
      setSentTo(r.sentTo); setPaid(true); setState('sent')
    } catch (e) {
      const status = (e as { status?: number }).status
      if (status === 401 || status === 403) { setError(errorText(e)); setState('ready') } else setState('emailFailed')
    }
  }

  async function pay() {
    if (!id || busy) return
    setBusy('pay'); setError('')
    try {
      const r = await checkout(id, consent)
      if (r.demo) setDemo(true)
      if (r.paid) await send(r.sessionId)
    } catch (e) { setError(errorText(e)) }
    setBusy('')
  }

  async function useCredit() {
    if (!id || busy) return
    setBusy('credit'); setError('')
    try {
      const r = await redeemCredit(id)
      if (typeof r.credits === 'number') setCredits(r.credits)
      setPaid(true)
      await send()
    } catch (e) { setError(errorText(e)) }
    setBusy('')
  }

  async function download(kind: 'clean' | 'preview') {
    if (!id || busy) return
    setBusy(kind)
    try { if (kind === 'clean') await shareCleanPdf(id, fileName); else await sharePreviewPdf(id) } catch (e) { toast(errorText(e)) }
    setBusy('')
  }

  const primary = () => { if (!okEmail(email)) return; if (paid || demo) send(); else pay() }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: top, paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'flex-end' }}>
          <IconBtn icon={X} onPress={() => router.back()} label={t('Close')} color={c.text3} />
        </View>

        {(state === 'checking' || state === 'sending') && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={c.accent} />
            <Txt w={700} size={20} style={{ textAlign: 'center' }}>{t(state === 'sending' ? 'Creating your PDF…' : 'Getting your CV ready…')}</Txt>
            {state === 'sending' && <Txt color={c.text2} style={{ textAlign: 'center' }}>{t('Sending to {email}. This takes a few seconds.', { email: email.trim() || user?.email || '' })}</Txt>}
          </View>
        )}

        {state === 'sent' && (
          <View style={styles.center}>
            <View style={[styles.ok, { backgroundColor: c.greenSoft }]}><Check size={30} color={c.green} strokeWidth={2.6} /></View>
            <Txt w={700} size={21} style={{ textAlign: 'center' }}>{t('Your CV is on its way')}</Txt>
            <Txt color={c.text2} style={{ textAlign: 'center', lineHeight: 22 }}>{t('We emailed the PDF to {email}. Check your spam folder if it isn’t there in a minute.', { email: sentTo })}</Txt>
            <View style={styles.row}>
              <Btn title={t('Download PDF')} kind="secondary" busy={busy === 'clean'} onPress={() => download('clean')} />
              <Btn title={t('Done')} onPress={() => router.back()} />
            </View>
          </View>
        )}

        {state === 'emailFailed' && (
          <View style={styles.center}>
            <Txt w={700} size={21} style={{ textAlign: 'center' }}>{t('We couldn’t email your CV')}</Txt>
            <Txt color={c.text2} style={{ textAlign: 'center', lineHeight: 22 }}>{t('Your payment is safe and this CV is unlocked. Download the PDF now, or try the email again.')}</Txt>
            <View style={styles.row}>
              <Btn title={t('Download PDF')} busy={busy === 'clean'} onPress={() => download('clean')} />
              <Btn title={t('Try email again')} kind="secondary" onPress={() => send()} />
            </View>
          </View>
        )}

        {state === 'error' && (
          <View style={styles.center}>
            <Txt w={700} size={21}>{t('Something went wrong')}</Txt>
            <Txt color={c.text2} style={{ textAlign: 'center' }}>{error}</Txt>
            <View style={styles.row}>
              <Btn title={t('Close')} kind="secondary" onPress={() => router.back()} />
              <Btn title={t('Try again')} onPress={prepare} />
            </View>
          </View>
        )}

        {state === 'tooLong' && (
          <View style={{ gap: 12 }}>
            <Txt w={700} size={22}>{t('Your CV is longer than one page')}</Txt>
            <Txt color={c.text2} style={{ lineHeight: 22 }}>
              {t((page?.zoom || 1) < 0.82
                ? 'It’s about {over}% over. We’ll shrink it to fit one A4 page. Text will be at {zoom}% of its normal size, which is quite small.'
                : 'It’s about {over}% over. We’ll shrink it to fit one A4 page. Text will be at {zoom}% of its normal size.', { over, zoom })}
            </Txt>
            <View style={styles.row}>
              <Btn title={t('Edit it first')} kind="secondary" onPress={() => router.back()} />
              <Btn title={t('Continue & shrink to fit')} onPress={() => { setField('shrinkToFit', true); setState('ready') }} />
            </View>
          </View>
        )}

        {state === 'ready' && (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 6 }}>
              <Txt w={700} size={22}>{t(paid ? 'Send your CV' : 'Get your CV as a PDF')}</Txt>
              <Txt color={c.text2} style={{ lineHeight: 22 }}>
                {t(paid ? 'This CV is already paid for. Send it as often as you like, even after edits.' : demo ? 'Payments aren’t switched on yet, so this is free for now.' : 'A clean, one-page PDF, emailed to you.')}
              </Txt>
            </View>
            {!paid && !demo && (
              <Card style={{ gap: 10 }}>
                <Txt w={800} size={26}>{t('€0.99')} <Txt size={14} color={c.text3}>{t('one-time, for this CV')}</Txt></Txt>
                {FEATURES.map(f => (
                  <View key={f} style={{ flexDirection: 'row', gap: 10 }}>
                    <Check size={17} color={c.success} strokeWidth={2.6} style={{ marginTop: 2 }} />
                    <Txt size={14.5} style={{ flex: 1, lineHeight: 21 }}>{t(f)}</Txt>
                  </View>
                ))}
              </Card>
            )}
            <Field
              label={t('Send to')} value={email} onChangeText={setEmail} placeholder={user?.email}
              autoCapitalize="none" keyboardType="email-address" autoComplete="email"
              hint={okEmail(email) ? t('Leave blank to use your account email.') : undefined}
              error={okEmail(email) ? undefined : t('Please enter a valid email address.')}
            />
            {!paid && !demo && (
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <Toggle value={consent} onChange={setConsent} label={t('I want my PDF straight away and agree that I lose my 14-day right of withdrawal once it’s delivered.')} />
                <Txt size={13.5} color={c.text2} style={{ flex: 1, lineHeight: 19 }}>{t('I want my PDF straight away and agree that I lose my 14-day right of withdrawal once it’s delivered.')}</Txt>
              </View>
            )}
            {!!error && <Txt size={14} color={c.danger}>{error}</Txt>}
            <Btn
              title={t(busy === 'pay' ? 'Please wait…' : paid || demo ? 'Email my CV' : 'Pay €0.99 and get my CV')}
              size="lg" full busy={busy === 'pay'} disabled={!okEmail(email) || (!paid && !demo && !consent)} onPress={primary}
            />
            {paid && <Btn title={t('Download PDF')} kind="secondary" size="lg" full busy={busy === 'clean'} onPress={() => download('clean')} />}
            {!paid && !demo && credits > 0 && (
              <Btn title={t('Use a referral credit instead, free ({n} left)', { n: credits })} kind="secondary" full busy={busy === 'credit'} onPress={useCredit} />
            )}
            {!paid && !demo && <Txt size={12.5} color={c.text3} style={{ textAlign: 'center' }}>{t('Secure payment by Stripe · No subscription')}</Txt>}
            {!paid && (
              <View style={{ alignItems: 'center', paddingTop: 6 }}>
                {busy === 'preview' ? <ActivityIndicator color={c.accent} /> : <LinkBtn title={t('Preview PDF with watermark')} onPress={() => download('preview')} />}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 24, gap: 14 },
  center: { alignItems: 'center', gap: 14, paddingTop: 30 },
  ok: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
})
