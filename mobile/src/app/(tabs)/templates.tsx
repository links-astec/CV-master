// Templates, like the website's gallery: colour (suggested or one of 12), All / ATS-friendly /
// Creative, and a grid of real previews, 2 per row (the user's CV once it has content, an example
// otherwise). Tapping a layout applies it to the current CV, or starts a new CV with it.
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { TopBar } from '@/components/shell'
import { PageTitle, Segmented, Txt } from '@/components/kit'
import { LayoutGrid } from '@/components/LayoutGrid'
import { toast } from '@/components/dialogs'
import { setCurrentCv, setTemplate, useCurrentCvId } from '@/lib/editor'
import { useOpenCv } from '@/lib/useOpenCv'
import { createDraft } from '@/lib/start'
import { emptyData, hasCvContent } from '@/lib/cv'
import { errorText } from '@/lib/ai'
import type { Draft } from '@/lib/api'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { LAYOUTS, THEMES, parseTemplate, render, templateId } from '@web/composables/cvRenderer.js'
import { sampleCv } from '@web/composables/sampleCv.js'

type Layout = { id: string; kind: 'ats' | 'creative'; name: string; theme: string; photo?: boolean }
type Kind = 'all' | 'ats' | 'creative'

export default function Templates() {
  const { t, lang } = useLang()
  const { c } = useTheme()
  const qc = useQueryClient()
  const { width } = useWindowDimensions()
  const current = useCurrentCvId()
  const { cv } = useOpenCv(current)
  const [colour, setColour] = useState<string>('suggested')
  const [kind, setKind] = useState<Kind>('all')
  const [busy, setBusy] = useState(false)

  const layouts = LAYOUTS as Layout[]
  const shown = useMemo(() => layouts.filter(l => kind === 'all' || l.kind === kind), [layouts, kind])
  const counts = { all: layouts.length, ats: layouts.filter(l => l.kind === 'ats').length, creative: layouts.filter(l => l.kind === 'creative').length }
  const mine = !!cv && hasCvContent(cv.data)
  const data = mine ? cv!.data : null
  const fmt = cv?.fmt
  const currentLayout = cv ? parseTemplate(cv.template).layout : ''

  const items = useMemo(() => {
    const d = data || sampleCv()
    return shown.map(l => ({
      id: l.id,
      html: render(templateId(l.id, colour === 'suggested' ? l.theme : colour), d, fmt || {}, { preview: false }),
      name: t(l.name),
      badge: l.kind === 'ats' ? { text: t('ATS-friendly'), bg: c.greenSoft, fg: c.green } : { text: t('Creative'), bg: c.accentSoft, fg: c.accent },
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, colour, data, fmt, lang, c])

  const cardW = (Math.min(width, 700) - 32 - 12) / 2
  const estimate = Math.ceil(shown.length / 2) * (cardW * 990 / 700 + 46)

  const use = useCallback(async (id: string) => {
    const l = layouts.find(x => x.id === id)
    if (!l || busy) return
    const tpl = templateId(l.id, colour === 'suggested' ? l.theme : colour)
    if (cv) { setTemplate(tpl); router.navigate('/editor'); return }
    setBusy(true)
    try {
      const d = await createDraft(emptyData(), undefined, tpl)
      qc.setQueryData<Draft[]>(['drafts'], list => [d, ...(list || [])])
      setCurrentCv(d.id)
      router.navigate('/editor')
    } catch (e) { toast(errorText(e)) }
    setBusy(false)
  }, [layouts, busy, colour, cv, qc])

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title={t('Templates')} />
      <ScrollView contentContainerStyle={styles.body}>
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
        {busy && <ActivityIndicator color={c.accent} />}
        <LayoutGrid key={kind} items={items} selected={currentLayout} onPick={use} estimate={estimate} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 22, gap: 16, paddingBottom: 40 },
  colours: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  suggested: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 4 },
  swatchRing: { borderWidth: 2, borderRadius: 999, padding: 2 },
  swatch: { width: 30, height: 30, borderRadius: 15 },
})
