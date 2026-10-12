// The editor, like the website's mobile editor: layout pill, zoom and Export PDF on top, the
// one-page notice (shrink to fit, or undo), the live CV preview with the end of page 1 marked,
// and a floating "Edit CV" button that opens the editing sheet.
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { ChevronDown, Download, FileText, PenLine, ZoomIn, ZoomOut } from '@/components/icons'
import { TopBar } from '@/components/shell'
import { Btn, Card, IconBtn, PageTitle, Txt } from '@/components/kit'
import { CvPreview } from '@/components/CvPreview'
import { setField, useCurrentCvId } from '@/lib/editor'
import { useOpenCv } from '@/lib/useOpenCv'
import { setPageInfo } from '@/lib/pageInfo'
import { useTourTarget } from '@/lib/tourTargets'
import type { PageInfo } from '@/lib/previewHtml'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { getTheme, parseTemplate, templateLabel } from '@web/composables/cvRenderer.js'

const SMALL_TEXT_ZOOM = 0.82   // the website's pageFit.js: below this the text is getting small

export default function Editor() {
  const { t } = useLang()
  const { c } = useTheme()
  const id = useCurrentCvId()
  const { cv, loading, missing } = useOpenCv(id)
  const [zoom, setZoom] = useState(false)
  const [page, setPage] = useState<PageInfo | null>(null)
  const exportTarget = useTourTarget('export')

  const onPage = useCallback((p: PageInfo) => { setPage(p); if (id) setPageInfo(id, p) }, [id])

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
  const shrink = !!cv?.data.shrinkToFit
  const over = page?.overflow ? Math.max(1, Math.round(page.overBy * 100)) : 0
  const fitPct = page ? Math.round(page.zoom * 100) : 100
  const warn = !!page?.overflow && (!shrink || page.zoom < SMALL_TEXT_ZOOM)

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
        <View ref={exportTarget} collapsable={false}>
          <Btn title={t('Export PDF')} icon={Download} size="sm" onPress={() => router.push('/export')} disabled={!cv} />
        </View>
      </View>

      {/* One page: the website's notice, made compact for a phone */}
      {!!page?.overflow && (
        <View style={[styles.notice, warn ? { backgroundColor: c.amberSoft, borderColor: c.amber + '33' } : { backgroundColor: c.surface, borderColor: c.border }]}>
          <FileText size={17} color={warn ? c.amber : c.text2} strokeWidth={2} />
          <Txt w={600} size={13} color={warn ? c.amber : c.text2} style={{ flex: 1, lineHeight: 18 }}>
            {!shrink ? t('Your CV is {n}% longer than one A4 page.', { n: over })
              : page.zoom < SMALL_TEXT_ZOOM ? t('Shrunk to fit one page. Text is at {n}%, which is getting small.', { n: fitPct })
              : t('Shrunk to fit one page, text at {n}%.', { n: fitPct })}
          </Txt>
          {!shrink
            ? <Pressable onPress={() => setField('shrinkToFit', true)} accessibilityRole="button" style={[styles.noticeBtn, { backgroundColor: c.amber }]}><Txt w={600} size={13} color="#fff">{t('Shrink to fit')}</Txt></Pressable>
            : <Pressable onPress={() => setField('shrinkToFit', false)} accessibilityRole="button" style={styles.noticeBtnGhost}><Txt w={600} size={13} color={c.accent}>{t('Undo')}</Txt></Pressable>}
        </View>
      )}

      {loading || !cv ? <ActivityIndicator style={{ flex: 1 }} color={c.accent} /> : (
        <CvPreview template={cv.template} data={cv.data} fmt={cv.fmt} zoomed={zoom} shrink={shrink} onPage={onPage} />
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
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginTop: 10, paddingVertical: 7, paddingLeft: 11, paddingRight: 7, borderRadius: 11, borderWidth: 1 },
  noticeBtn: { borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7 },
  noticeBtnGhost: { paddingHorizontal: 10, paddingVertical: 7 },
  fab: { position: 'absolute', bottom: 22, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
})
