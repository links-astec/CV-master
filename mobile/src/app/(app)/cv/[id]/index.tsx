// A CV's overview: preview, layout and colour, and each section with a one-line summary.
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useOpenCv } from '@/lib/useOpenCv'
import { SaveStatus } from '@/components/SaveStatus'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import { SECTIONS, SECTION_TITLE, summaryOf } from '@/lib/sections'
import { getTheme, parseTemplate, templateLabel } from '@web/composables/cvRenderer.js'

export default function CvOverview() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { cv, loading, missing } = useOpenCv(id)
  const { t } = useLang()
  const c = useColors()

  if (missing) return <View style={styles.center}><Text style={{ color: c.text2 }}>{t('Draft not found.')}</Text></View>
  if (loading || !cv) return <ActivityIndicator style={styles.center} color={c.accent} />

  const theme = getTheme(parseTemplate(cv.template).theme)
  const name = [cv.data.fn, cv.data.ln].filter(Boolean).join(' ')
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Stack.Screen options={{ title: name || t('Untitled CV'), headerRight: () => <SaveStatus state={cv.save} /> }} />

      <Pressable
        onPress={() => router.push({ pathname: '/cv/[id]/preview', params: { id } })}
        accessibilityRole="button"
        style={({ pressed }) => [styles.preview, { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 }]}>
        <Text style={[styles.previewText, { color: c.accentText }]}>{t('Preview')}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push({ pathname: '/cv/[id]/job', params: { id } })}
        accessibilityRole="button"
        style={({ pressed }) => [styles.row, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
        <Text style={{ fontSize: 18, color: c.accent }}>✦</Text>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: c.text }]}>{t('ATS Job Match')}</Text>
          <Text style={[styles.rowSub, { color: cv.data.jobOffer ? c.text3 : c.accent }]} numberOfLines={1}>
            {cv.data.jobOffer ? ([cv.data.jobTarget?.title, cv.data.jobTarget?.company].filter(Boolean).join(' · ') || t('Job offer')) : t('Match your CV to a job')}
          </Text>
        </View>
        <Text style={[styles.chev, { color: c.text3 }]}>›</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push({ pathname: '/cv/[id]/design', params: { id } })}
        accessibilityRole="button"
        style={({ pressed }) => [styles.row, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
        <View style={[styles.swatch, { backgroundColor: theme?.accent || c.accent }]} />
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: c.text }]}>{t('Change layout and colour')}</Text>
          <Text style={[styles.rowSub, { color: c.text3 }]} numberOfLines={1}>{templateLabel(cv.template)}</Text>
        </View>
        <Text style={[styles.chev, { color: c.text3 }]}>›</Text>
      </Pressable>

      <View style={[styles.group, { backgroundColor: c.surface, borderColor: c.border }]}>
        {SECTIONS.map((s, i) => {
          const sub = summaryOf(s, cv.data)
          return (
            <Pressable
              key={s}
              onPress={() => router.push({ pathname: '/cv/[id]/section/[section]', params: { id, section: s } })}
              accessibilityRole="button"
              style={({ pressed }) => [styles.item, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }, pressed && { backgroundColor: c.surface2 }]}>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: c.text }]}>{t(SECTION_TITLE[s])}</Text>
                <Text style={[styles.rowSub, { color: sub ? c.text3 : c.accent }]} numberOfLines={1}>{sub || t('Add')}</Text>
              </View>
              <Text style={[styles.chev, { color: c.text3 }]}>›</Text>
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  body: { padding: 16, gap: 12, paddingBottom: 40 },
  preview: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  previewText: { fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14 },
  swatch: { width: 22, height: 22, borderRadius: 11 },
  group: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15.5, fontWeight: '600' },
  rowSub: { fontSize: 13 },
  chev: { fontSize: 24, marginLeft: 8 },
})
