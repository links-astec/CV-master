// Tell your story: the user writes about their career (the keyboard's dictation works too), the AI
// asks follow-up questions for what's missing (up to the server's limit of rounds), then builds the CV.
import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from '@/components/AppText'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft } from '@/components/icons'
import { IconBtn, Txt } from '@/components/kit'
import { useQueryClient } from '@tanstack/react-query'
import type { Draft } from '@/lib/api'
import { fromExtracted, startCv, tellStory, type StoryAnswer } from '@/lib/start'
import { useAuth } from '@/lib/auth'
import { errorText } from '@/lib/ai'
import { Button, Card, Field } from '@/components/ui'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

export default function Story() {
  const { t } = useLang()
  const c = useColors()
  const insets = useSafeAreaInsets()
  const qc = useQueryClient()
  const { user } = useAuth()
  const [story, setStory] = useState('')
  const [questions, setQuestions] = useState<{ q: string; hint: string }[]>([])
  const [answers, setAnswers] = useState<StoryAnswer[]>([])
  const [draftAnswers, setDraftAnswers] = useState<string[]>([])
  const [round, setRound] = useState(0)
  const [maxRounds, setMaxRounds] = useState(3)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [unusable, setUnusable] = useState('')

  async function send(force = false) {
    setBusy(true); setError(''); setUnusable('')
    const all = [...answers, ...questions.map((q, i) => ({ q: q.q, a: draftAnswers[i] || '' }))]
    try {
      const r = await tellStory(story.trim(), all, round, force)
      if (r.verdict === 'unusable') setUnusable(r.reason)
      else if (r.verdict === 'needs_more') {
        setAnswers(all); setQuestions(r.questions); setDraftAnswers(r.questions.map(() => ''))
        setRound(r.round); setMaxRounds(r.maxRounds)
      } else {
        const d = await startCv(!!user, fromExtracted(r.cv))
        if (d) qc.setQueryData<Draft[]>(['drafts'], list => [d, ...(list || [])])
        else qc.invalidateQueries({ queryKey: ['guest'] })
        router.back()
        router.navigate('/editor')
      }
    } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }

  const tooShort = story.trim().split(/\s+/).filter(Boolean).length < 15
  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="interactive">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: insets.top + 4 }}>
        <IconBtn icon={ChevronLeft} onPress={() => router.back()} label={t('Back')} />
        <Txt w={700} size={20}>{t('Tell your story')}</Txt>
      </View>
      {!questions.length ? (
        <Card>
          <Field
            label={t('Your story')} value={story} onChangeText={setStory} multiline style={{ minHeight: 220 }}
            placeholder={t('e.g. I’ve been in product management for 8 years. I started at a startup in London where I built their first mobile app from scratch. Then I moved to a fintech where I led a team of 12 and grew the user base from 50K to 2M. I’m passionate about data-driven decisions…')}
            hint={t('Be as detailed as you like. More context gives a better CV.')}
          />
          {!!unusable && (
            <View style={{ gap: 4 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>{t('We can’t build a CV from that yet')}</Text>
              <Text style={{ color: c.text2, lineHeight: 20 }}>{unusable}</Text>
            </View>
          )}
          <Button title={busy ? t('AI is reading your story…') : t('Build my CV now')} onPress={() => send(false)} disabled={busy || tooShort} />
        </Card>
      ) : (
        <Card>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>{t('A few details will make your CV much stronger')}</Text>
          <Text style={{ color: c.text3, fontSize: 13 }}>{t('Round {n} of up to {max}', { n: round, max: maxRounds })}</Text>
          <Text style={{ color: c.text2, lineHeight: 20 }}>{t('Answer what you can and skip anything you’d rather not. We only use what you tell us.')}</Text>
          {questions.map((q, i) => (
            <Field
              key={i} label={q.q} hint={q.hint || undefined} placeholder={t('Your answer')} multiline style={{ minHeight: 80 }}
              value={draftAnswers[i] || ''} onChangeText={v => setDraftAnswers(a => a.map((x, k) => (k === i ? v : x)))}
            />
          ))}
          {round < maxRounds && <Button title={busy ? t('AI is reading your story…') : t('Continue')} onPress={() => send(false)} disabled={busy} />}
          <Button kind={round < maxRounds ? 'ghost' : 'primary'} title={t('Build my CV now')} onPress={() => send(true)} disabled={busy} />
          <Button kind="ghost" title={t('Edit story')} onPress={() => { setQuestions([]); setAnswers([]); setRound(0) }} disabled={busy} />
        </Card>
      )}
      {busy && <ActivityIndicator color={c.accent} />}
      {!!error && <Text style={{ color: c.danger, textAlign: 'center' }} accessibilityLiveRegion="polite">{error}</Text>}
    </ScrollView>
  )
}

const styles = StyleSheet.create({ body: { padding: 16, gap: 12, paddingBottom: 48 } })
