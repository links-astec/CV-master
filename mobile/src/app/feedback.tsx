// Feedback & complaints, like the website's form: what it is about, the message and an email for
// the reply. Messages go to the same place as the website's (/api/feedback).
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from '@/components/icons'
import { Btn, Field, IconBtn, Txt, useTopSpace } from '@/components/kit'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { errorText } from '@/lib/ai'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

const KINDS = [
  { id: 'suggestion', label: 'Suggestion', desc: 'An idea or improvement' },
  { id: 'problem', label: 'Problem', desc: 'Something isn’t working' },
  { id: 'payment', label: 'Payment', desc: 'Charged, refund, no PDF' },
  { id: 'complaint', label: 'Complaint', desc: 'You’re unhappy with us' },
] as const
type Kind = (typeof KINDS)[number]['id']
const PLACEHOLDERS: Record<Kind, string> = {
  suggestion: 'What would make CVMaster better for you?',
  problem: 'What happened, and what did you expect? The page and the steps help us fix it fast.',
  payment: 'What happened with your payment? Include the date and roughly when you paid.',
  complaint: 'Tell us what went wrong and what you would like us to do about it.',
}

export default function Feedback() {
  const params = useLocalSearchParams<{ kind?: string }>()
  const { t } = useLang()
  const { c } = useTheme()
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const top = useTopSpace(12, { sheet: true })
  const [kind, setKind] = useState<Kind>(KINDS.some(k => k.id === params.kind) ? params.kind as Kind : 'suggestion')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ref, setRef] = useState('')

  async function send() {
    setBusy(true); setError('')
    try {
      const j = await api<{ ref: string }>('/api/feedback', { body: { kind, message, email: email.trim(), page: 'app' } })
      setRef(j.ref); setMessage('')
    } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: top, paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Txt w={700} size={21} style={{ flex: 1 }}>{t(ref ? 'Thanks, we’ve got it' : 'Feedback & complaints')}</Txt>
          <IconBtn icon={X} onPress={() => router.back()} label={t('Close')} color={c.text3} />
        </View>
        {ref ? (
          <View style={{ gap: 12 }}>
            <Txt color={c.text2} style={{ lineHeight: 22 }}>
              {kind === 'complaint' || kind === 'payment'
                ? `${t('We take this seriously and will look into it.')} ${email ? t('We’ll reply to {email}.', { email }) : t('Add an email next time if you’d like a reply.')}`
                : email ? t('If we need more detail we’ll reply to {email}.', { email }) : t('We read every message.')}
            </Txt>
            <Txt size={13} color={c.text3}>{t('Reference #{ref}', { ref })}</Txt>
            <Btn title={t('Done')} onPress={() => router.back()} />
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            <Txt color={c.text2} style={{ lineHeight: 21 }}>{t('Tell us what’s working, what isn’t, or anything that went wrong. Every message is read.')}</Txt>
            <Txt w={600} size={14}>{t('What is it about?')}</Txt>
            <View style={styles.kinds}>
              {KINDS.map(k => {
                const on = k.id === kind
                return (
                  <Pressable key={k.id} onPress={() => setKind(k.id)} accessibilityRole="radio" accessibilityState={{ selected: on }}
                    style={[styles.kind, { borderColor: on ? c.accent : c.border, backgroundColor: on ? c.accentSoft : c.surface }]}>
                    <Txt w={600} size={14.5} color={on ? c.accent : c.text}>{t(k.label)}</Txt>
                    <Txt size={12.5} color={c.text3}>{t(k.desc)}</Txt>
                  </Pressable>
                )
              })}
            </View>
            <Field label={t('Your message')} value={message} onChangeText={setMessage} multiline maxLength={4000} placeholder={t(PLACEHOLDERS[kind])} />
            <Field label={t('Email for our reply')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder={t('you@email.com')} />
            {!!error && <Txt size={14} color={c.danger}>{error}</Txt>}
            <Txt size={13} color={c.text3}>{t('Urgent payment problem? Include the email you paid with.')}</Txt>
            <Btn title={t(busy ? 'Sending…' : 'Send')} size="lg" full busy={busy} disabled={message.trim().length < 10} onPress={send} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kind: { width: '48.5%', borderWidth: 1, borderRadius: 12, padding: 12, gap: 2 },
})
