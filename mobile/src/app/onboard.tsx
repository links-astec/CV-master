// After creating an account: the website's three onboarding questions (field, goal, experience),
// all optional. The AI uses the answers to write in the right tone. Then the quick tour.
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowRight } from '@/components/icons'
import { Btn, Chip, Txt } from '@/components/kit'
import { Mark } from '@/components/Logo'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { startTour } from '@/lib/onboarding'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { INDUSTRIES, GOALS, LEVELS } from '@web/composables/profileOptions.js'

type Opt = { id: string; label: string; years?: string }

export default function Onboard() {
  const { t } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const { user, markOnboarded } = useAuth()
  const [industry, setIndustry] = useState('')
  const [goal, setGoal] = useState('')
  const [experience, setExperience] = useState('')
  const [busy, setBusy] = useState(false)

  async function finish(save: boolean) {
    setBusy(true)
    await api('/api/auth/onboard', { method: 'PATCH', body: save ? { industry, goal, experience } : {} }).catch(() => {})
    markOnboarded()
    setBusy(false)
    router.back()
    setTimeout(startTour, 400)
  }

  const group = (label: string, list: Opt[], value: string, set: (v: string) => void) => (
    <View style={{ gap: 12 }}>
      <Txt w={600} size={15.5}>{label}</Txt>
      <View style={styles.chips}>
        {list.map(o => <Chip key={o.id} label={t(o.label)} extra={o.years} on={value === o.id} onPress={() => set(value === o.id ? '' : o.id)} />)}
      </View>
    </View>
  )

  const first = (user?.name || '').trim().split(/\s+/)[0]
  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: insets.top + 24 }]}>
        <Mark size={48} />
        <Txt w={800} size={30} style={{ letterSpacing: -0.6, lineHeight: 36 }}>{first ? t('Welcome, {name}', { name: first }) : t('Welcome')}</Txt>
        <Txt size={16} color={c.text2} style={{ lineHeight: 23 }}>{t('Three quick questions so the AI writes in the right tone for you. All optional.')}</Txt>
        {group(t('Your field'), INDUSTRIES as Opt[], industry, setIndustry)}
        {group(t('What are you aiming for?'), GOALS as Opt[], goal, setGoal)}
        {group(t('Experience'), LEVELS as Opt[], experience, setExperience)}
      </ScrollView>
      <View style={[styles.foot, { borderTopColor: c.border, paddingBottom: insets.bottom + 14 }]}>
        <Btn title={t('Skip')} kind="ghost" onPress={() => finish(false)} disabled={busy} />
        <Btn title={t('Start building')} icon={ArrowRight} onPress={() => finish(true)} busy={busy} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, gap: 22, paddingBottom: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
})
