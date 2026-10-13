// Job match: the job offer this CV is for, an honest fit check, the ATS score with its missing
// keywords, and tailoring with AI where the user approves every change. Same server checks as
// the website, and the same saved fields (jobOffer, jobFit, jobTarget, jobTailored).
import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Switch, View } from 'react-native'
import { Text } from '@/components/AppText'
import { setField, update, type OpenCv } from '@/lib/editor'
import { atsCheck, errorText, fitCheck, fitKey, tailor, type AtsResult, type TailorResult } from '@/lib/ai'
import { hasCvContent, type CvData } from '@/lib/cv'
import { Button, Card, Field, SmallAction } from '@/components/ui'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import { BrandLoader } from '@/components/BrandLoader'

const MIN_CHARS = 40   // same minimum as the server
const FIT_LABEL = { good: 'Good fit', stretch: 'A stretch', poor: 'Heads-up: may not be a good fit' } as const

type Fit = { key: string; fit: keyof typeof FIT_LABEL; headline: string; reasons: string[]; advice: string; dismissed: boolean }

function JobOffer({ d }: { d: CvData }) {
  const { t } = useLang()
  const c = useColors()
  const [editing, setEditing] = useState(!d.jobOffer)
  const [draft, setDraft] = useState(d.jobOffer)
  const short = draft.trim().length < MIN_CHARS

  if (!editing) {
    return (
      <Card>
        <Text style={[styles.h, { color: c.text }]}>{t('The job you’re applying for')}</Text>
        {!!d.jobTarget?.title && <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>{[d.jobTarget.title, d.jobTarget.company].filter(Boolean).join(' · ')}</Text>}
        <Text style={{ color: c.text2, fontSize: 14, lineHeight: 20 }} numberOfLines={4}>{d.jobOffer}</Text>
        <View style={styles.row}>
          <SmallAction label={t('Change')} onPress={() => { setDraft(d.jobOffer); setEditing(true) }} />
          <SmallAction label={t('Remove job')} color={c.danger} onPress={() => {
            update(x => ({ ...x, jobOffer: '', jobFit: null, jobTarget: null, jobTailored: '' }))
            setDraft(''); setEditing(true)
          }} />
        </View>
      </Card>
    )
  }
  return (
    <Card>
      <Text style={[styles.h, { color: c.text }]}>{t('Match your CV to a job')}</Text>
      <Text style={{ color: c.text2, fontSize: 14, lineHeight: 20 }}>{t('Paste the job advert. AI rewords your CV in the job’s language, then scores how well an applicant tracking system (ATS) would rank you. Nothing changes without your OK.')}</Text>
      <Field
        label={t('Job offer')} value={draft} onChangeText={setDraft} multiline
        placeholder={t('Paste the full job description. Title, responsibilities and requirements…')}
        hint={short && draft.trim() ? t('Paste the full description. A few sentences at least.') : undefined}
        style={{ minHeight: 180 }}
      />
      <Button title={t('Use this job')} disabled={short} onPress={() => {
        update(x => ({ ...x, jobOffer: draft.trim(), jobTailored: '', jobFit: null }))
        setEditing(false)
      }} />
      {!!d.jobOffer && <Button kind="ghost" title={t('Cancel')} onPress={() => { setDraft(d.jobOffer); setEditing(false) }} />}
    </Card>
  )
}

function FitCard({ d }: { d: CvData }) {
  const { t } = useLang()
  const c = useColors()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const key = fitKey(d)
  const fit = (d.jobFit as Fit | null)?.key === key ? (d.jobFit as Fit) : null
  const running = useRef('')

  async function run() {
    if (running.current === key) return
    running.current = key
    setBusy(true); setError('')
    try {
      const r = await fitCheck(d)
      update(x => ({
        ...x,
        jobFit: { key, fit: r.fit, headline: r.headline, reasons: r.reasons, advice: r.advice, dismissed: false },
        jobTarget: r.job?.title ? { title: r.job.title, company: r.job.company || '' } : x.jobTarget,
      }))
    } catch (e) { setError(errorText(e)) }
    running.current = ''
    setBusy(false)
  }
  // Like the website: checked once per job offer, when the CV has something to judge
  const enough = hasCvContent(d) && (d.experiences.some(e => e.title || e.desc) || d.skills.length >= 3 || d.education.some(e => e.degree))
  useEffect(() => {
    if (enough && !fit && !busy && !error) queueMicrotask(() => void run())
  }, [key, enough])   // eslint-disable-line react-hooks/exhaustive-deps

  if (busy) return <Card><View style={styles.row}><BrandLoader size={22} /><Text style={{ color: c.text2 }}>{t('Checking whether this role is a good fit…')}</Text></View></Card>
  if (error) return <Card><Text style={{ color: c.danger }}>{error}</Text><SmallAction label={t('Check again')} onPress={run} /></Card>
  if (!fit || fit.dismissed) return null
  const tone = fit.fit === 'good' ? c.success : fit.fit === 'stretch' ? '#D97706' : c.danger
  return (
    <Card>
      <Text style={{ color: tone, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 }}>{t(FIT_LABEL[fit.fit])}</Text>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: '600', lineHeight: 22 }}>{fit.headline}</Text>
      {fit.reasons.map((r, i) => <Text key={i} style={{ color: c.text2, fontSize: 14, lineHeight: 20 }}>•  {r}</Text>)}
      {!!fit.advice && <Text style={{ color: c.text, fontSize: 14, lineHeight: 20 }}>{fit.advice}</Text>}
      {fit.fit !== 'good' && <Text style={{ color: c.text3, fontSize: 13 }}>{t('It’s your call. You can still tailor your CV and apply.')}</Text>}
      <View style={styles.row}>
        <SmallAction label={t('Check again')} onPress={run} />
        <SmallAction label={t('Hide')} color={c.text2} onPress={() => update(x => ({ ...x, jobFit: { ...(x.jobFit as Fit), dismissed: true } }))} />
      </View>
    </Card>
  )
}

function AtsCard({ d, ats, setAts }: { d: CvData; ats: AtsResult | null; setAts: (a: AtsResult | null) => void }) {
  const { t } = useLang()
  const c = useColors()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function run() {
    setBusy(true); setError('')
    try {
      const r = await atsCheck(d)
      setAts(r)
      if (r.job?.title) setField('jobTarget', { title: r.job.title, company: r.job.company || '' })
    } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }
  const have = new Set(d.skills.map(s => s.toLowerCase()))
  return (
    <Card>
      <Text style={[styles.h, { color: c.text }]}>{t('Your ATS score')}</Text>
      {!ats && <Text style={{ color: c.text2, fontSize: 14 }}>{t('See how well your CV matches the job’s keywords and requirements.')}</Text>}
      {!!ats && (
        <>
          <Text style={{ color: ats.score >= 70 ? c.success : '#D97706', fontSize: 34, fontWeight: '800' }}>{t('{n}% match', { n: ats.score })}</Text>
          {ats.matched.length > 0 && (
            <View style={{ gap: 6 }}>
              <Text style={[styles.sub, { color: c.text2 }]}>{t('Keyword matches')}</Text>
              <View style={styles.chips}>{ats.matched.map(k => <Text key={k} style={[styles.chip, { backgroundColor: c.surface2, color: c.text }]}>{k}</Text>)}</View>
            </View>
          )}
          {ats.missing.length > 0 && (
            <View style={{ gap: 6 }}>
              <Text style={[styles.sub, { color: c.text2 }]}>{t('Keywords from the job you could add')}</Text>
              <Text style={{ color: c.text3, fontSize: 13, lineHeight: 18 }}>{t('Tap a missing keyword to add it to your skills. Only add the ones you really have. Then “Check again”.')}</Text>
              <View style={styles.chips}>
                {ats.missing.map(k => have.has(k.toLowerCase())
                  ? <Text key={k} style={[styles.chip, { backgroundColor: c.surface2, color: c.text3 }]}>✓ {k}</Text>
                  : <Pressable key={k} onPress={() => setField('skills', [...d.skills, k])} accessibilityRole="button"><Text style={[styles.chip, { backgroundColor: c.accentSoft, color: c.accent }]}>+ {k}</Text></Pressable>)}
              </View>
            </View>
          )}
          {[...ats.gaps, ...ats.suggestions].length > 0 && (
            <View style={{ gap: 4 }}>
              <Text style={[styles.sub, { color: c.text2 }]}>{t('How to improve your match')}</Text>
              {[...ats.gaps, ...ats.suggestions].map((m, i) => <Text key={i} style={{ color: c.text2, fontSize: 14, lineHeight: 20 }}>•  {t(m.key, m.params)}</Text>)}
            </View>
          )}
        </>
      )}
      {!!error && <Text style={{ color: c.danger }}>{error}</Text>}
      <Button kind={ats ? 'ghost' : 'primary'} title={busy ? '…' : ats ? t('Check again') : t('Match')} onPress={run} disabled={busy} />
    </Card>
  )
}

function Change({ id, label, before, after, on, setOn }: {
  id: string; label: string; before: string; after: string
  on: Record<string, boolean>; setOn: (fn: (x: Record<string, boolean>) => Record<string, boolean>) => void
}) {
  const { t } = useLang()
  const c = useColors()
  return (
    <View style={[styles.change, { borderColor: c.border }]}>
      <View style={styles.changeHead}>
        <Text style={{ color: c.text, fontWeight: '600', flex: 1 }}>{label}</Text>
        <Switch value={!!on[id]} onValueChange={v => setOn(x => ({ ...x, [id]: v }))} accessibilityLabel={label} />
      </View>
      {!!before && <><Text style={[styles.sub, { color: c.text3 }]}>{t('Before')}</Text><Text style={{ color: c.text3, fontSize: 14, lineHeight: 20 }}>{before}</Text></>}
      <Text style={[styles.sub, { color: c.accent }]}>{t('After')}</Text>
      <Text style={{ color: c.text, fontSize: 14, lineHeight: 20 }}>{after}</Text>
    </View>
  )
}

function TailorCard({ d, ats, onApplied }: { d: CvData; ats: AtsResult | null; onApplied: () => void }) {
  const { t } = useLang()
  const c = useColors()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [res, setRes] = useState<TailorResult | null>(null)
  const [on, setOn] = useState<Record<string, boolean>>({})

  async function run() {
    setBusy(true); setError(''); setRes(null)
    try {
      const r = await tailor(d, ats)
      setRes(r)
      const pick: Record<string, boolean> = {}
      if (r.title && r.title !== d.title) pick.title = true
      if (r.sum && r.sum !== d.sum) pick.sum = true
      r.experiences.forEach(e => { pick[`exp:${e.index}`] = true })
      r.suggestedSkills.forEach(s => { pick[`skill:${s}`] = false })   // only the ones they really have
      setOn(pick)
    } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }

  function apply() {
    if (!res) return
    update(x => {
      const out = { ...x }
      if (on.title) out.title = res.title
      if (on.sum) out.sum = res.sum
      out.experiences = x.experiences.map((e, i) => {
        const p = res.experiences.find(r => r.index === i)
        return p && on[`exp:${i}`] ? { ...e, desc: p.desc } : e
      })
      const add = res.suggestedSkills.filter(s => on[`skill:${s}`])
      const ordered = res.skillsOrder.length ? [...res.skillsOrder, ...x.skills.filter(s => !res.skillsOrder.some(o => o.toLowerCase() === s.toLowerCase()))] : x.skills
      out.skills = [...ordered, ...add.filter(s => !ordered.some(o => o.toLowerCase() === s.toLowerCase()))]
      out.jobTailored = 'applied'
      return out
    })
    setRes(null)
    onApplied()
  }

  const changes = res ? [
    ...(res.title && res.title !== d.title ? [<Change on={on} setOn={setOn} key="title" id="title" label={t('Job Title')} before={d.title} after={res.title} />] : []),
    ...(res.sum && res.sum !== d.sum ? [<Change on={on} setOn={setOn} key="sum" id="sum" label={t('Summary')} before={d.sum} after={res.sum} />] : []),
    ...res.experiences.map(e => {
      const x = d.experiences[e.index]
      return <Change on={on} setOn={setOn} key={e.index} id={`exp:${e.index}`} label={[x?.title, x?.company].filter(Boolean).join(' · ') || t('Work Experience')} before={x?.desc || ''} after={e.desc} />
    }),
  ] : []

  return (
    <Card>
      <Text style={[styles.h, { color: c.text }]}>{t('Tailor your CV with AI')}</Text>
      {!res && <Text style={{ color: c.text2, fontSize: 14, lineHeight: 20 }}>{t('AI rephrases your summary, experience and skills using the job’s keywords. It never invents experience. You tick the changes you want.')}</Text>}
      {!!error && <Text style={{ color: c.danger }}>{error}</Text>}
      {!res && <Button title={busy ? '…' : t('Tailor to the job')} onPress={run} disabled={busy} />}
      {busy && <BrandLoader size={28} />}
      {!!res && (
        <View style={{ gap: 12 }}>
          {changes.length === 0 && res.suggestedSkills.length === 0
            ? <Text style={{ color: c.text2 }}>{t('Your CV already matches this job well. There’s nothing worth changing.')}</Text>
            : <Text style={[styles.sub, { color: c.text2 }]}>{t('Suggested changes')}</Text>}
          {changes}
          {res.suggestedSkills.length > 0 && (
            <View style={{ gap: 6 }}>
              <Text style={[styles.sub, { color: c.text2 }]}>{t('Keywords from the job you could add')}</Text>
              <Text style={{ color: c.text3, fontSize: 13 }}>{t('Only tick the ones you genuinely have. Recruiters will ask about them.')}</Text>
              {res.suggestedSkills.map(s => (
                <View key={s} style={styles.changeHead}>
                  <Text style={{ color: c.text, flex: 1 }}>{s}</Text>
                  <Switch value={!!on[`skill:${s}`]} onValueChange={v => setOn(x => ({ ...x, [`skill:${s}`]: v }))} accessibilityLabel={s} />
                </View>
              ))}
            </View>
          )}
          {res.notes.length > 0 && (
            <View style={{ gap: 4 }}>
              <Text style={[styles.sub, { color: c.text2 }]}>{t('Worth knowing')}</Text>
              {res.notes.map((n, i) => <Text key={i} style={{ color: c.text2, fontSize: 14, lineHeight: 20 }}>•  {n}</Text>)}
            </View>
          )}
          <Button title={t('Apply')} onPress={apply} disabled={!Object.values(on).some(Boolean)} />
          <Button kind="ghost" title={t('Skip and keep my wording')} onPress={() => { setRes(null); setField('jobTailored', 'skipped') }} />
        </View>
      )}
    </Card>
  )
}

export function JobMatchPanel({ cv }: { cv: OpenCv }) {
  const [ats, setAts] = useState<AtsResult | null>(null)
  const d = cv.data
  return (
    <View style={{ gap: 14 }}>
      <JobOffer d={d} key={d.jobOffer ? 'set' : 'empty'} />
      {!!d.jobOffer && (
        <>
          <FitCard d={d} />
          <AtsCard d={d} ats={ats} setAts={setAts} />
          <TailorCard d={d} ats={ats} onApplied={() => setAts(null)} />
        </>
      )}
    </View>
  )
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { padding: 16, gap: 14, paddingBottom: 48 },
  h: { fontSize: 17, fontWeight: '700' },
  sub: { fontSize: 12.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 13, overflow: 'hidden' },
  change: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 4 },
  changeHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
})
