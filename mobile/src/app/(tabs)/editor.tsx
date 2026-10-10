// The editor, like the website's mobile editor: layout pill, zoom and Export PDF on top, the
// live CV preview, and a floating "Edit CV" button that opens the editing sheet.
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { ChevronDown, Download, PenLine, ZoomIn, ZoomOut } from '@/components/icons'
import { TopBar } from '@/components/shell'
import { Btn, Card, IconBtn, PageTitle, Txt } from '@/components/kit'
import { CvPreview } from '@/components/CvPreview'
import { useCurrentCvId } from '@/lib/editor'
import { useOpenCv } from '@/lib/useOpenCv'
import { GUEST_ID } from '@/lib/guest'
import { sharePreviewPdf } from '@/lib/pdf'
import { errorText } from '@/lib/ai'
import { useAuth } from '@/lib/auth'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { getTheme, parseTemplate, templateLabel } from '@web/composables/cvRenderer.js'

export default function Editor() {
  const { t } = useLang()
  const { c } = useTheme()
  const { user } = useAuth()
  const id = useCurrentCvId()
  const { cv, loading, missing } = useOpenCv(id)
  const [zoom, setZoom] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function exportPdf() {
    if (!cv) return
    if (!user || cv.id === GUEST_ID) { router.push({ pathname: '/auth', params: { reason: 'download' } }); return }
    setExporting(true)
    try { await sharePreviewPdf(cv.id) } catch (e) { Alert.alert(errorText(e)) }
    setExporting(false)
  }

  if (!id || missing) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <TopBar title={t('Editor')} />
        <View style={styles.emptyWrap}>
          <Card>
            <PageTitle title={t('Let’s build your CV')} sub={t('Pick a layout, tell us about your experience (or import an old CV), tailor it to a job offer, and export a one-page PDF.')} />
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Btn title={t('Choose a layout')} onPress={() => router.navigate('/templates')} />
              <Btn title={t('New CV')} kind="secondary" onPress={() => router.push('/new')} />
            </View>
          </Card>
        </View>
      </View>
    )
  }

  const theme = cv ? getTheme(parseTemplate(cv.template).theme) : null
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopBar title={t('Editor')} />
      <View style={[styles.bar, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Pressable
          onPress={() => router.push({ pathname: '/edit', params: { tab: 'design' } })} disabled={!cv}
          accessibilityRole="button" accessibilityLabel={t('Change layout and colour')}
          style={({ pressed }) => [styles.layoutPill, { borderColor: c.border, backgroundColor: c.surface, opacity: pressed ? 0.75 : 1 }]}>
          <View style={[styles.dot, { backgroundColor: theme?.accent || c.accent }]} />
          <Txt w={500} size={14.5} numberOfLines={1} style={{ flexShrink: 1 }}>{cv ? templateLabel(cv.template) : '…'}</Txt>
          <ChevronDown size={15} color={c.text3} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <IconBtn icon={zoom ? ZoomOut : ZoomIn} onPress={() => setZoom(!zoom)} label={t(zoom ? 'Fit to screen' : 'Zoom in')} />
        <Btn title={t('Export PDF')} icon={Download} size="sm" onPress={exportPdf} busy={exporting} disabled={!cv} />
      </View>

      {loading || !cv ? <ActivityIndicator style={{ flex: 1 }} color={c.accent} /> : (
        <CvPreview template={cv.template} data={cv.data} fmt={cv.fmt} zoomed={zoom} />
      )}

      <Pressable
        onPress={() => router.push('/edit')} disabled={!cv} accessibilityRole="button"
        style={({ pressed }) => [styles.fab, { backgroundColor: c.text, opacity: pressed ? 0.88 : 1 }]}>
        <PenLine size={18} color={c.surface} strokeWidth={2} />
        <Txt w={600} size={15.5} color={c.surface}>{t('Edit CV')}</Txt>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyWrap: { padding: 16, paddingTop: 22 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  layoutPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, maxWidth: '50%' },
  dot: { width: 16, height: 16, borderRadius: 8 },
  fab: { position: 'absolute', bottom: 22, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
})
