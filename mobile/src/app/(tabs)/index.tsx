// My CVs, like the website's dashboard: CV cards (picture, name, layout, progress, Paid, Open /
// Download / Email again / delete), the occasional "How was CVMaster?" card, or "Let's build your
// CV". The same CVs as on the website: they live in the account.
import { useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Mail, Plus, Trash } from '@/components/icons'
import { TopBar, useLargeTitle } from '@/components/shell'
import { Btn, Card, IconBtn, LinkBtn, PageTitle, Txt } from '@/components/kit'
import { CvThumb } from '@/components/CvThumb'
import { confirm, toast } from '@/components/dialogs'
import { useDrafts } from '@/lib/drafts'
import { api, type Draft } from '@/lib/api'
import { setCurrentCv, closeEditor, useCurrentCvId, useEditor } from '@/lib/editor'
import { hasCvContent, normalise, type CvData } from '@/lib/cv'
import { rules } from '@/lib/checklist'
import { shareCleanPdf, sharePreviewPdf } from '@/lib/pdf'
import { errorText } from '@/lib/ai'
import { startTour } from '@/lib/onboarding'
import { goNext, NEXT_LABEL, useNextStep } from '@/lib/next'
import { usePosts } from '@/lib/blog'
import { PostCard } from '@/components/PostCard'
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
const titleOf = (d: CvData) => [d.fn, d.ln].filter(Boolean).join(' ') + (d.title ? ' · ' + d.title : '')
const fileNameOf = (d: CvData) => ([d.fn, d.ln].filter(Boolean).join(' ') || 'My CV').replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-CV.pdf'

function CvCard({ draft, paid, onDelete }: { draft: Draft; paid: boolean; onDelete: () => void }) {
  const { t } = useLang()
  const c = useColors()
  const open = useEditor()
  const [busy, setBusy] = useState('')
  // The open CV may have newer edits than the list
  const live = open?.id === draft.id
  const { data: saved, fmt: savedFmt } = normalise(draft.data)
  const cv = live ? open!.data : saved
  const fmt = live ? open!.fmt : savedFmt
  const template = live ? open!.template : draft.template
  const pct = completion(cv)
  const go = () => { setCurrentCv(draft.id); router.navigate('/editor') }
  async function download() {
    setBusy('dl')
    try { if (paid) await shareCleanPdf(draft.id, fileNameOf(cv)); else await sharePreviewPdf(draft.id) } catch (e) { toast(t('Download failed: {e}', { e: errorText(e) })) }
    setBusy('')
  }
  async function resend() {
    setBusy('send')
    try { const j = await api<{ sentTo: string }>('/api/cv/redownload', { body: { draftId: draft.id } }); toast(t('Sent to {email}', { email: j.sentTo })) } catch (e) { toast(errorText(e)) }
    setBusy('')
  }
  return (
    <Card pad={0} style={{ overflow: 'hidden', gap: 0 }}>
      <View style={{ paddingHorizontal: 22, paddingTop: 22, backgroundColor: c.fill }}>
        <CvThumb template={template} data={cv} fmt={fmt} height={230} />
      </View>
      <View style={{ padding: 16, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Txt w={700} size={18} numberOfLines={2} style={{ flex: 1, letterSpacing: -0.3 }}>{titleOf(cv) || draft.title || t('Untitled CV')}</Txt>
          {paid && <View style={[styles.badge, { backgroundColor: c.greenSoft }]}><Txt w={600} size={12} color={c.green}>{t('Paid')}</Txt></View>}
        </View>
        <Txt size={14} color={c.text3}>{templateLabel(template)} · {ago(draft.updatedAt, t)}</Txt>
        {pct < 100 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.bar, { flex: 1, backgroundColor: c.fill2 }]}>
              <View style={{ width: `${pct}%`, height: '100%', backgroundColor: c.accent, borderRadius: 99 }} />
            </View>
            <Txt w={500} size={12.5} color={c.text3}>{t('{n}% complete', { n: pct })}</Txt>
          </View>
        )}
        <View style={styles.actions}>
          <Btn title={t('Open')} kind="secondary" size="sm" onPress={go} />
          <Btn title={t(busy === 'dl' ? 'Preparing…' : 'Download')} kind="secondary" size="sm" icon={Download} onPress={download} busy={busy === 'dl'} />
          {paid && <Btn title={t(busy === 'send' ? 'Sending…' : 'Email again')} kind="secondary" size="sm" icon={Mail} onPress={resend} busy={busy === 'send'} />}
          <View style={{ flex: 1 }} />
          <IconBtn icon={Trash} onPress={onDelete} label={t('Delete')} color={c.text2} />
        </View>
      </View>
    </Card>
  )
}

// "From the blog": the three latest posts (only once there are posts)
function LatestPosts() {
  const { t, lang } = useLang()
  const q = usePosts(lang, null, 3)
  if (!q.data?.length) return null
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Txt w={700} size={18} style={{ flex: 1 }}>{t('From the blog')}</Txt>
        <LinkBtn title={t('Read the blog')} onPress={() => router.push('/blog')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} style={{ marginHorizontal: -16 }}>
        <View style={{ width: 4 }} />
        {q.data.map(p => <PostCard key={p.slug} p={p} compact />)}
        <View style={{ width: 4 }} />
      </ScrollView>
    </View>
  )
}

export default function MyCvs() {
  const { t } = useLang()
  const c = useColors()
  const qc = useQueryClient()
  const current = useCurrentCvId()
  const drafts = useDrafts(true)
  const next = useNextStep()
  const paid = useQuery({ queryKey: ['paid-drafts'], queryFn: () => api<{ draftIds: string[]; legacyAll: boolean }>('/api/payment/paid-drafts') })

  async function askDelete(id: string) {
    const ok = await confirm({ title: t('Delete this CV?'), message: t('It will be permanently deleted from your account.'), ok: t('Delete'), cancel: t('Keep it'), danger: true })
    if (!ok) return
    try {
      await api(`/api/drafts/${id}`, { method: 'DELETE' })
      if (current === id) closeEditor()
      qc.setQueryData<Draft[]>(['drafts'], list => (list || []).filter(x => x.id !== id))
    } catch { toast(t('Could not delete this CV.')) }
  }

  // Like the website: CVs with something in them (and the one being edited)
  const list = (drafts.data || []).filter(d => d.id === current || hasCvContent(normalise(d.data).data) || !!(d.data?.fn || d.data?.ln))
  const isPaid = (id: string) => !!paid.data?.legacyAll || !!paid.data?.draftIds.includes(id)
  const empty = !drafts.isLoading && !list.length

  const big = useLargeTitle()
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title={t('My CVs')} quiet={!big.past} />
      <ScrollView
        onScroll={big.onScroll} scrollEventThrottle={32}
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={drafts.isRefetching} onRefresh={() => { drafts.refetch(); paid.refetch(); next.refetch() }} tintColor={c.accent} />}>
        <PageTitle title={t('My CVs')} sub={t('Open a CV to edit it, or download and send it.')} />
        <Btn title={t('New CV')} icon={Plus} onPress={() => router.push('/new')} />

        {/* The next step, like the website's card (from the CV, and the activity if allowed) */}
        {!!next.data && !empty && (
          <Card style={{ backgroundColor: c.accentSoft, shadowOpacity: 0, borderWidth: 0, gap: 6 }}>
            <Txt w={600} size={14} color={c.accent}>{t('Your next step')}</Txt>
            <Txt w={700} size={19} style={{ letterSpacing: -0.4 }}>{t(next.data.title)}</Txt>
            <Txt size={14.5} color={c.text2} style={{ lineHeight: 21 }}>{t(next.data.body)}</Txt>
            <Btn title={t(NEXT_LABEL[next.data.action] || 'Continue')} size="sm" onPress={() => goNext(next.data!)} style={{ marginTop: 4 }} />
          </Card>
        )}

        {list.map(d => <CvCard key={d.id} draft={d} paid={isPaid(d.id)} onDelete={() => askDelete(d.id)} />)}
        {drafts.error && (
          <Card><Txt color={c.text2}>{drafts.error.message}</Txt><LinkBtn title={t('Try again')} onPress={() => drafts.refetch()} /></Card>
        )}


        <LatestPosts />

        {empty && (
          <Card style={{ gap: 18 }}>
            <View style={{ paddingHorizontal: 28, paddingTop: 6 }}>
              <View style={{ transform: [{ rotate: '-2deg' }], shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 }}>
                <CvThumb template="modern:indigo" data={sampleCv()} height={300} radius={4} />
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
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
})
