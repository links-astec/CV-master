// Templates, like the website's gallery: colour (suggested or one of 12), All / ATS-friendly /
// Creative, and a grid of real previews (the user's CV once it has content, an example otherwise).
// Tapping a layout applies it to the current CV, or starts a new CV with it.
import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import { router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { Check } from '@/components/icons'
import { TopBar } from '@/components/shell'
import { PageTitle, Segmented, Txt } from '@/components/kit'
import { CvThumb } from '@/components/CvThumb'
import { setCurrentCv, setTemplate, useCurrentCvId } from '@/lib/editor'
import { useOpenCv } from '@/lib/useOpenCv'
import { useAuth } from '@/lib/auth'
import { GUEST_ID, newGuest } from '@/lib/guest'
import { createDraft } from '@/lib/start'
import { emptyData, hasCvContent } from '@/lib/cv'
import { errorText } from '@/lib/ai'
import type { Draft } from '@/lib/api'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { LAYOUTS, THEMES, parseTemplate, templateId } from '@web/composables/cvRenderer.js'
import { sampleCv } from '@web/composables/sampleCv.js'

type Layout = { id: string; kind: 'ats' | 'creative'; name: string; theme: string; photo?: boolean }
type Kind = 'all' | 'ats' | 'creative'

export default function Templates() {
  const { t } = useLang()
  const { c } = useTheme()
  const qc = useQueryClient()
  const { user } = useAuth()
  const { width } = useWindowDimensions()
  const current = useCurrentCvId()
  const { cv } = useOpenCv(current)
  const [colour, setColour] = useState<string>('suggested')
  const [kind, setKind] = useState<Kind>('all')
  const [busy, setBusy] = useState('')

  const layouts = LAYOUTS as Layout[]
  const shown = useMemo(() => layouts.filter(l => kind === 'all' || l.kind === kind), [layouts, kind])
  const counts = { all: layouts.length, ats: layouts.filter(l => l.kind === 'ats').length, creative: layouts.filter(l => l.kind === 'creative').length }
  const mine = cv && hasCvContent(cv.data)
  const data = mine ? cv!.data : sampleCv()
  const currentLayout = cv ? parseTemplate(cv.template).layout : ''
  const cardW = (Math.min(width, 700) - 16 * 2 - 12) / 2

  async function use(l: Layout) {
    const tpl = templateId(l.id, colour === 'suggested' ? l.theme : colour)
    if (cv) { setTemplate(tpl); router.navigate('/editor'); return }
    setBusy(l.id)
    try {
      if (user) {
        const d = await createDraft(emptyData(), undefined, tpl)
        qc.setQueryData<Draft[]>(['drafts'], list => [d, ...(list || [])])
        setCurrentCv(d.id)
      } else {
        newGuest(emptyData(), tpl)
        qc.invalidateQueries({ queryKey: ['guest'] })
        setCurrentCv(GUEST_ID)
      }
      router.navigate('/editor')
    } catch (e) { Alert.alert(errorText(e)) }
    setBusy('')
  }

  const header = (
    <View style={{ gap: 18, marginBottom: 6 }}>
      <PageTitle title={t('Choose a layout')} sub={t('{n} layouts in 12 colours. Switch any time. Your content moves with you.', { n: layouts.length })} />
      <View style={styles.colours}>
        <Txt w={500} size={15} color={c.text2}>{t('Colour')}</Txt>
        <Pressable onPress={() => setColour('suggested')} accessibilityRole="radio" accessibilityState={{ selected: colour === 'suggested' }}
          style={[styles.suggested, { borderColor: colour === 'suggested' ? c.accent : c.border }]}>
          <Txt w={600} size={14} color={colour === 'suggested' ? c.accent : c.text2}>{t('Suggested')}</Txt>
        </Pressable>
        {(THEMES as { id: string; name: string; accent: string }[]).map(th => (
          <Pressable key={th.id} onPress={() => setColour(th.id)} accessibilityRole="radio" accessibilityState={{ selected: colour === th.id }} accessibilityLabel={t(th.name)}
            style={[styles.swatchRing, { borderColor: colour === th.id ? c.text : 'transparent' }]}>
            <View style={[styles.swatch, { backgroundColor: th.accent }]} />
          </Pressable>
        ))}
      </View>
      <Segmented
        items={[{ key: 'all', label: t('All'), count: counts.all }, { key: 'ats', label: t('ATS-friendly'), count: counts.ats }, { key: 'creative', label: t('Creative'), count: counts.creative }]}
        value={kind} onChange={setKind}
      />
      <Txt size={14.5} color={c.text2} style={{ lineHeight: 21 }}>{t('ATS-friendly layouts are for online applications. Creative ones are for print, in person, or sending straight to a person.')}</Txt>
      <Txt size={13} color={c.text3}>{t(mine ? 'Previews show your CV.' : 'Previews show an example CV.')}</Txt>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title={t('Templates')} />
      <FlatList
        data={shown}
        keyExtractor={l => l.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.body}
        ListHeaderComponent={header}
        initialNumToRender={4}
        windowSize={5}
        maxToRenderPerBatch={4}
        removeClippedSubviews
        renderItem={({ item: l }) => {
          const on = l.id === currentLayout
          return (
            <Pressable onPress={() => use(l)} accessibilityRole="button" accessibilityLabel={`${t(l.name)}, ${t(l.kind === 'ats' ? 'ATS-friendly' : 'Creative')}`}
              style={({ pressed }) => [styles.card, { width: cardW, borderColor: on ? c.accent : c.border, backgroundColor: c.surface, opacity: pressed ? 0.85 : 1 }]}>
              <View style={{ padding: 8, backgroundColor: c.surface2 }}>
                <CvThumb template={templateId(l.id, colour === 'suggested' ? l.theme : colour)} data={data} fmt={cv?.fmt} height={cardW * 1.2} radius={4} />
              </View>
              <View style={styles.cardFoot}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Txt w={600} size={16}>{t(l.name)}</Txt>
                  <View style={[styles.badge, { backgroundColor: l.kind === 'ats' ? c.greenSoft : c.accentSoft }]}>
                    <Txt w={600} size={12} color={l.kind === 'ats' ? c.green : c.accent}>{t(l.kind === 'ats' ? 'ATS-friendly' : 'Creative')}</Txt>
                  </View>
                </View>
                {busy === l.id ? <ActivityIndicator color={c.accent} /> : on ? <Check size={20} color={c.accent} /> : null}
              </View>
            </Pressable>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 40 },
  colours: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  suggested: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 4 },
  swatchRing: { borderWidth: 2, borderRadius: 999, padding: 2 },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  card: { borderWidth: 1.5, borderRadius: 16, overflow: 'hidden' },
  cardFoot: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
})
