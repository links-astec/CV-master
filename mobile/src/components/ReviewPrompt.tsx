// "How was CVMaster?" stars and a comment, like the website's ReviewPrompt. Shown only to people
// who have made a CV; `onlyIfNew` hides it once they have reviewed (My CVs, the sent screen).
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Btn, Field, Txt } from '@/components/kit'
import { api } from '@/lib/api'
import { errorText } from '@/lib/ai'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

type Mine = { review: { rating: number; comment: string | null; awaitingApproval?: boolean } | null; canReview: boolean }

export function ReviewPrompt({ onlyIfNew, onShown }: { onlyIfNew?: boolean; onShown?: () => void }) {
  const { t } = useLang()
  const { c } = useTheme()
  const [state, setState] = useState<'hidden' | 'ask' | 'done'>('hidden')
  const [existing, setExisting] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    api<Mine>('/api/reviews/mine').then(j => {
      if (!live || !j.canReview) return
      if (j.review) {
        if (onlyIfNew) return
        setExisting(true); setRating(j.review.rating); setComment(j.review.comment || '')
      }
      setState('ask'); onShown?.()
    }).catch(() => {})
    return () => { live = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function send() {
    setBusy(true); setError('')
    try {
      await api('/api/reviews', { body: { rating, comment } })
      setState('done')
    } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }

  if (state === 'hidden') return null
  if (state === 'done') return <Txt w={600} size={14.5} color={c.green} style={{ lineHeight: 21 }}>{t('Thank you. Your review helps other job seekers find CVMaster.')}</Txt>
  return (
    <View style={{ gap: 8 }}>
      <Txt w={700} size={16}>{t(existing ? 'Your review' : 'How was CVMaster?')}</Txt>
      <View style={{ flexDirection: 'row', gap: 4 }} accessibilityRole="radiogroup" accessibilityLabel={t('Rating')}>
        {[1, 2, 3, 4, 5].map(n => (
          <Pressable key={n} onPress={() => setRating(n)} hitSlop={4} accessibilityRole="radio" accessibilityState={{ checked: rating === n }}
            accessibilityLabel={t(n > 1 ? '{n} stars' : '{n} star', { n })}>
            <Txt size={34} color={n <= rating ? '#F59E0B' : c.border2} style={{ lineHeight: 40 }}>★</Txt>
          </Pressable>
        ))}
      </View>
      {rating > 0 && (
        <>
          <Field value={comment} onChangeText={setComment} multiline maxLength={600} style={{ minHeight: 80 }}
            placeholder={t(rating >= 4 ? 'What did you like? (optional, may appear on our homepage)' : 'What should we improve? (optional)')} />
          <Txt size={12.5} color={c.text3}>{t('Shown as your first name and initial.')}</Txt>
          {!!error && <Txt size={13.5} color={c.danger}>{error}</Txt>}
          <Btn title={t(busy ? 'Sending…' : existing ? 'Update review' : 'Send review')} size="sm" busy={busy} onPress={send} />
        </>
      )}
    </View>
  )
}
