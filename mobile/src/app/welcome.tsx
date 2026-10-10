// First launch: three welcome screens with the website's homepage message, then straight into the
// app as a guest ("No account needed to start") or to sign in.
import { useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Check } from '@/components/icons'
import { Btn, Txt } from '@/components/kit'
import { Logo } from '@/components/Logo'
import { LangPill } from '@/components/shell'
import { CvThumb } from '@/components/CvThumb'
import { markWelcomeDone } from '@/lib/onboarding'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { sampleCv } from '@web/composables/sampleCv.js'

export default function Welcome() {
  const { t } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const pager = useRef<ScrollView>(null)
  const [page, setPage] = useState(0)
  const pages = 3

  const go = (n: number) => { pager.current?.scrollTo({ x: n * width, animated: true }); setPage(n) }
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))
  const start = () => { markWelcomeDone(); router.replace('/') }
  const signIn = () => { markWelcomeDone(); router.replace('/'); setTimeout(() => router.push({ pathname: '/auth', params: { mode: 'signin' } }), 50) }

  const steps = [
    { t: 'Build', d: 'Fill in guided steps, tell your story, or import the CV you already have.' },
    { t: 'Tailor', d: 'Paste the job offer. AI rewords your CV in the employer’s language. It never invents anything, and you approve every change.' },
    { t: 'Check & export', d: 'See your ATS match and what’s missing, fix it, then download a clean one-page PDF.' },
  ]
  const free = ['All 50 templates', 'AI help: 30 requests a day with a free account', 'ATS job-match check', 'Preview PDF with watermark']

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 8 }}>
      <View style={styles.top}>
        <Logo size={30} />
        <View style={{ flex: 1 }} />
        <LangPill />
      </View>

      <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScroll} style={{ flex: 1 }}>
        <ScrollView style={{ width }} contentContainerStyle={styles.page}>
          <Txt w={800} size={34} style={{ letterSpacing: -0.8, lineHeight: 40 }}>
            {t('A CV that gets you')} <Txt w={800} size={34} color={c.accent}>{t('the interview.')}</Txt>
          </Txt>
          <Txt size={17} color={c.text2} style={{ lineHeight: 25 }}>{t('Build it in minutes, tailor it to the job, and see how well it matches, before you apply.')}</Txt>
          <View style={{ paddingHorizontal: 22, paddingTop: 8 }}>
            <View style={{ transform: [{ rotate: '-2deg' }], shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
              <CvThumb template="modern:indigo" data={sampleCv()} height={330} radius={4} />
            </View>
          </View>
        </ScrollView>

        <ScrollView style={{ width }} contentContainerStyle={styles.page}>
          <Txt w={800} size={30} style={{ letterSpacing: -0.6, lineHeight: 36 }}>{t('Three steps, about ten minutes')}</Txt>
          {steps.map((s, i) => (
            <View key={s.t} style={[styles.step, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={[styles.num, { backgroundColor: c.accentSoft }]}><Txt w={700} size={16} color={c.accent}>{i + 1}</Txt></View>
              <View style={{ flex: 1, gap: 4 }}>
                <Txt w={700} size={17}>{t(s.t)}</Txt>
                <Txt size={14.5} color={c.text2} style={{ lineHeight: 21 }}>{t(s.d)}</Txt>
              </View>
            </View>
          ))}
        </ScrollView>

        <ScrollView style={{ width }} contentContainerStyle={styles.page}>
          <Txt w={800} size={30} style={{ letterSpacing: -0.6, lineHeight: 36 }}>{t('Free to build. €0.99 when you’re ready.')}</Txt>
          <Txt size={16} color={c.text2}>{t('No subscription, no trial that renews.')}</Txt>
          <View style={[styles.step, { backgroundColor: c.surface, borderColor: c.border, flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
            {free.map(f => (
              <View key={f} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Check size={18} color={c.success} strokeWidth={2.6} style={{ marginTop: 2 }} />
                <Txt size={15} style={{ flex: 1, lineHeight: 21 }}>{t(f)}</Txt>
              </View>
            ))}
          </View>
          <Txt size={14} color={c.text3}>{t('No account needed to start')}</Txt>
        </ScrollView>
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.dots}>
          {Array.from({ length: pages }).map((_, k) => (
            <Pressable key={k} onPress={() => go(k)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${k + 1} / ${pages}`}>
              <View style={[styles.dot, { backgroundColor: k === page ? c.accent : c.border2, width: k === page ? 22 : 8 }]} />
            </Pressable>
          ))}
        </View>
        {page < pages - 1 ? (
          <View style={styles.row}>
            <Btn title={t('Skip')} kind="ghost" onPress={() => go(pages - 1)} />
            <View style={{ flex: 1 }} />
            <Btn title={t('Next')} onPress={() => go(page + 1)} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Btn title={t('Build my CV for free')} size="lg" full onPress={start} />
            <Btn title={t('Sign in')} kind="secondary" size="lg" full onPress={signIn} />
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 },
  page: { padding: 24, paddingTop: 22, gap: 18 },
  step: { flexDirection: 'row', gap: 14, borderWidth: 1, borderRadius: 16, padding: 16, alignItems: 'flex-start' },
  num: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  foot: { paddingHorizontal: 20, gap: 16 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
})
