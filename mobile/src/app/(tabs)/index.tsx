// My CVs, like the website's dashboard: CV cards (picture, name, layout, progress, Open /
// Download / delete) for an account, or the guest CV kept on this phone, or "Let's build your CV".
import { useState } from 'react'
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { Download, Plus, Trash } from '@/components/icons'
import { TopBar } from '@/components/shell'
import { Btn, Card, IconBtn, LinkBtn, PageTitle, Txt } from '@/components/kit'
import { CvThumb } from '@/components/CvThumb'
import { useDrafts } from '@/lib/drafts'
import { useGuest } from '@/lib/useOpenCv'
import { api, type Draft } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { setCurrentCv, closeEditor, useCurrentCvId } from '@/lib/editor'
import { GUEST_ID, clearGuest, guestHasContent } from '@/lib/guest'
import { normalise, type CvData } from '@/lib/cv'
import { rules } from '@/lib/checklist'
import { sharePreviewPdf } from '@/lib/pdf'
import { errorText } from '@/lib/ai'
import { startTour } from '@/lib/onboarding'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import { templateLabel } from '@web/composables/cvRenderer.js'
import { sampleCv } from '@web/composables/sampleCv.js'

type T = (s: string, p?: Record<string, unknown>) => string
function ago(iso: string, t: T) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return t('just now')
  if (s < 3600) return t('{n} min ago', { n: Math.round(s / 60) })
  if (s < 86400) return t('{n} h ago', { n: Math.round(s / 3600) })
  return t('{n} d ago', { n: Math.round(s / 86400) })
}
// The website's "% complete": the checklist points this CV earns
function completion(d: CvData) {
  const all = rules(d)
  const total = all.reduce((n, r) => n + r.points, 0)
  return Math.round((all.filter(r => r.severity === 'pass').reduce((n, r) => n + r.points, 0) / total) * 100)
}

function CvCard({ id, title, template, data, updatedAt, onDelete, guest }: {
  id: string; title: string; template: string; data: Record<string, unknown>; updatedAt: string; onDelete: () => void; guest?: boolean
}) {
  const { t } = useLang()
  const c = useColors()
  const [busy, setBusy] = useState(false)
  const { data: cv, fmt } = normalise(data)
  const pct = completion(cv)
  const open = () => { setCurrentCv(id); router.navigate('/editor') }
  async function download() {
    if (guest) { router.push({ pathname: '/auth', params: { reason: 'download' } }); return }
    setBusy(true)
    try { await sharePreviewPdf(id) } catch (e) { Alert.alert(errorText(e)) }
    setBusy(false)
  }
  return (
    <Card pad={0} style={{ overflow: 'hidden', gap: 0 }}>
      <View style={{ padding: 16, paddingBottom: 0, backgroundColor: c.surface2 }}>
        <CvThumb template={template} data={cv} fmt={fmt} height={230} />
      </View>
      <View style={{ padding: 16, gap: 10 }}>
        <Txt w={700} size={17} numberOfLines={2}>{title || t('Untitled CV')}</Txt>
        <Txt size={14} color={c.text3}>{templateLabel(template)} · {ago(updatedAt, t)}</Txt>
        <View style={[styles.bar, { backgroundColor: c.border }]} accessibilityLabel={t('{n}% complete', { n: pct })}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: c.accent, borderRadius: 99 }} />
        </View>
        <View style={styles.actions}>
          <Btn title={t('Open')} kind="secondary" size="sm" onPress={open} />
          <Btn title={t('Download')} kind="secondary" size="sm" icon={Download} onPress={download} busy={busy} />
          <View style={{ flex: 1 }} />
          <IconBtn icon={Trash} onPress={onDelete} label={t('Delete this CV?')} color={c.text2} />
        </View>
      </View>
    </Card>
  )
}

export default function MyCvs() {
  const { t } = useLang()
  const c = useColors()
  const qc = useQueryClient()
  const { user } = useAuth()
  const current = useCurrentCvId()
  const drafts = useDrafts(!!user)
  const guest = useGuest()

  function askDelete(id: string) {
    Alert.alert(t('Delete this CV?'), t('It will be permanently deleted from your account.'), [
      { text: t('Keep it'), style: 'cancel' },
      {
        text: t('Delete'), style: 'destructive',
        onPress: async () => {
          if (id === GUEST_ID) { if (current === GUEST_ID) closeEditor(); clearGuest(); qc.invalidateQueries({ queryKey: ['guest'] }); return }
          try {
            await api(`/api/drafts/${id}`, { method: 'DELETE' })
            if (current === id) closeEditor()
            qc.setQueryData<Draft[]>(['drafts'], list => (list || []).filter(x => x.id !== id))
          } catch { Alert.alert(t('Could not delete this CV.')) }
        },
      },
    ])
  }

  const list = user ? (drafts.data || []) : []
  const g = !user && guestHasContent(guest.data ?? null) ? guest.data! : null
  const empty = user ? !drafts.isLoading && !list.length : !g
  const sample = sampleCv()

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title={t('My CVs')} />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={user ? <RefreshControl refreshing={drafts.isRefetching} onRefresh={() => drafts.refetch()} tintColor={c.accent} /> : undefined}>
        <PageTitle title={t('My CVs')} sub={user ? t('Open a CV to edit it, or download and send it.') : t('You’re using CVMaster as a guest. Your CV is saved on this phone.')} />
        <Btn title={t('New CV')} icon={Plus} onPress={() => router.push('/new')} />

        {list.map(d => (
          <CvCard key={d.id} id={d.id} title={d.title} template={d.template} data={d.data} updatedAt={d.updatedAt} onDelete={() => askDelete(d.id)} />
        ))}
        {!!user && drafts.error && (
          <Card><Txt color={c.text2}>{drafts.error.message}</Txt><LinkBtn title={t('Try again')} onPress={() => drafts.refetch()} /></Card>
        )}

        {g && (
          <>
            <CvCard guest id={GUEST_ID} title={[g.data.fn, g.data.ln].filter(Boolean).join(' ') + (g.data.title ? ' · ' + g.data.title : '')}
              template={g.template} data={{ ...g.data, fmt: g.fmt }} updatedAt={g.updatedAt} onDelete={() => askDelete(GUEST_ID)} />
            <Card style={{ backgroundColor: c.accentSoft, borderColor: c.accentSoft }}>
              <Txt w={700} size={17}>{t('This CV is only on this phone.')}</Txt>
              <Txt color={c.text2} style={{ lineHeight: 22 }}>{t('Create a free account to keep it safe, edit it on any device and export it.')}</Txt>
              <Btn title={t('Create account')} onPress={() => router.push('/auth')} />
            </Card>
          </>
        )}

        {empty && (
          <Card style={{ gap: 18 }}>
            <View style={{ paddingHorizontal: 28, paddingTop: 6 }}>
              <View style={{ transform: [{ rotate: '-2deg' }], shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 }}>
                <CvThumb template="modern:indigo" data={sample} height={300} radius={4} />
              </View>
            </View>
            <Txt w={800} size={24} style={{ letterSpacing: -0.4 }}>{t('Let’s build your CV')}</Txt>
            <Txt size={15.5} color={c.text2} style={{ lineHeight: 23 }}>{t('Pick a layout, tell us about your experience (or import an old CV), tailor it to a job offer, and export a one-page PDF.')}</Txt>
            <View style={styles.actions}>
              <Btn title={t('Choose a layout')} onPress={() => router.navigate('/templates')} />
              <Btn title={t('Import an existing CV')} kind="secondary" onPress={() => router.push('/new')} />
            </View>
            <LinkBtn title={t('Take a 1-minute tour')} onPress={startTour} />
          </Card>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 22, gap: 18, paddingBottom: 40 },
  bar: { height: 6, borderRadius: 99, overflow: 'hidden' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
})
