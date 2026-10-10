// Editing one section of a CV. Every change goes into the open CV and is saved automatically.
import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useOpenCv } from '@/lib/useOpenCv'
import { setField, update } from '@/lib/editor'
import { isSection, SECTION_TITLE, type Section } from '@/lib/sections'
import { Button, Card, ChipInput, Field, SmallAction } from '@/components/ui'
import { SaveStatus } from '@/components/SaveStatus'
import { PhotoField } from '@/components/PhotoField'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import type { CvData } from '@/lib/cv'
import { errorText, improveBullets, suggestSkills, writeSummary } from '@/lib/ai'
import { AiButton, AiSuggestion } from '@/components/AiSuggestion'

function ErrorText({ text }: { text: string }) {
  const c = useColors()
  return text ? <Text style={{ color: c.danger, fontSize: 13.5 }} accessibilityLiveRegion="polite">{text}</Text> : null
}

type T = (s: string, p?: Record<string, unknown>) => string

// Move item i of a list up (-1) or down (+1)
function moved<X>(list: X[], i: number, dir: -1 | 1): X[] {
  const j = i + dir
  if (j < 0 || j >= list.length) return list
  const out = [...list]
  ;[out[i], out[j]] = [out[j], out[i]]
  return out
}

function ItemActions({ i, count, onMove, onRemove, t }: { i: number; count: number; onMove: (dir: -1 | 1) => void; onRemove: () => void; t: T }) {
  const c = useColors()
  return (
    <View style={styles.itemActions}>
      <SmallAction label={t('Move up')} onPress={() => onMove(-1)} disabled={i === 0} />
      <SmallAction label={t('Move down')} onPress={() => onMove(1)} disabled={i === count - 1} />
      <View style={{ flex: 1 }} />
      <SmallAction label={t('Remove')} onPress={onRemove} color={c.danger} />
    </View>
  )
}

function Personal({ d, t }: { d: CvData; t: T }) {
  return (
    <Card>
      <PhotoField photo={d.photo} initials={[d.fn, d.ln].map(x => x.trim()[0] || '').join('').toUpperCase()} />
      <Field label={t('First Name')} value={d.fn} onChangeText={v => setField('fn', v)} placeholder={t('Alexandra')} autoComplete="given-name" textContentType="givenName" />
      <Field label={t('Last Name')} value={d.ln} onChangeText={v => setField('ln', v)} placeholder={t('Morrison')} autoComplete="family-name" textContentType="familyName" />
      <Field label={t('Job Title')} value={d.title} onChangeText={v => setField('title', v)} placeholder={t('Senior Product Manager')} textContentType="jobTitle" />
      <Field label={t('Email')} value={d.email} onChangeText={v => setField('email', v)} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <Field label={t('Phone')} value={d.phone} onChangeText={v => setField('phone', v)} placeholder={t('+44 7712 000 000')} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
      <Field label={t('Location')} value={d.loc} onChangeText={v => setField('loc', v)} placeholder={t('London, UK')} textContentType="addressCityAndState" />
      <Field label={t('LinkedIn URL')} value={d.li} onChangeText={v => setField('li', v)} placeholder={t('linkedin.com/in/you')} autoCapitalize="none" keyboardType="url" />
      <Field label={t('Website / Portfolio')} value={d.website} onChangeText={v => setField('website', v)} placeholder="yourportfolio.com" autoCapitalize="none" keyboardType="url" />
    </Card>
  )
}

function Summary({ d, t }: { d: CvData; t: T }) {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  async function generate() {
    setBusy(true); setError(''); setResult('')
    try { setResult((await writeSummary(d)).result) } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }
  return (
    <Card>
      <Field
        label={t('Professional Summary')} value={d.sum} onChangeText={v => setField('sum', v)} multiline
        placeholder={t('Results-driven professional with X years experience in…')}
        hint={t('Aim for 40–60 words. Focus on value, not just experience.')}
      />
      <AiButton label={t('Generate with AI')} busyLabel={t('Writing…')} busy={busy} onPress={generate} />
      <ErrorText text={error} />
      {!!result && <AiSuggestion title={t('AI Suggestion')} text={result} onUse={() => { setField('sum', result); setResult('') }} onDismiss={() => setResult('')} />}
    </Card>
  )
}

function Experience({ d, t }: { d: CvData; t: T }) {
  const list = d.experiences
  const [busyIdx, setBusyIdx] = useState<number | null>(null)
  const [results, setResults] = useState<Record<number, string>>({})
  const [errors, setErrors] = useState<Record<number, string>>({})
  async function quantify(i: number, id: number) {
    setBusyIdx(i); setErrors(x => ({ ...x, [id]: '' }))
    try {
      const { result } = await improveBullets(d, i)
      setResults(x => ({ ...x, [id]: result }))
    } catch (e) { setErrors(x => ({ ...x, [id]: errorText(e) })) }
    setBusyIdx(null)
  }
  const clear = (id: number) => setResults(({ [id]: _, ...rest }) => rest)
  const edit = (i: number, patch: Partial<CvData['experiences'][number]>) =>
    update(x => ({ ...x, experiences: x.experiences.map((e, k) => (k === i ? { ...e, ...patch } : e)) }))
  return (
    <>
      {list.map((e, i) => (
        <Card key={e.id}>
          <Field label={t('Job Title')} value={e.title} onChangeText={v => edit(i, { title: v })} placeholder={t('Senior Product Manager')} />
          <Field label={t('Company')} value={e.company} onChangeText={v => edit(i, { company: v })} />
          <Field label={t('Period')} value={e.period} onChangeText={v => edit(i, { period: v })} placeholder={t('2021 – Present')} />
          <Field
            label={t('Description / Achievements')} value={e.desc} onChangeText={v => edit(i, { desc: v })} multiline
            hint={t('Tip: start each line with • for bullet points on your CV')}
          />
          <AiButton label={t('Quantify with AI')} busyLabel={t('Enhancing…')} busy={busyIdx === i} disabled={busyIdx !== null} onPress={() => quantify(i, e.id)} />
          <ErrorText text={errors[e.id] || ''} />
          {!!results[e.id] && (
            <AiSuggestion
              title={t('Enhanced version. With bullet points & metrics')} text={results[e.id]}
              onUse={() => { edit(i, { desc: results[e.id] }); clear(e.id) }} onDismiss={() => clear(e.id)}
            />
          )}
          <ItemActions
            i={i} count={list.length} t={t}
            onMove={dir => update(x => ({ ...x, experiences: moved(x.experiences, i, dir) }))}
            onRemove={() => update(x => ({ ...x, experiences: x.experiences.filter((_, k) => k !== i) }))}
          />
        </Card>
      ))}
      <Button
        kind="ghost" title={t('Add Another Role')}
        onPress={() => update(x => ({ ...x, experiences: [...x.experiences, { id: Math.max(0, ...x.experiences.map(e => e.id)) + 1, title: '', company: '', period: '', desc: '' }] }))}
      />
    </>
  )
}

function Education({ d, t }: { d: CvData; t: T }) {
  const edit = (i: number, patch: Partial<CvData['education'][number]>) =>
    update(x => ({ ...x, education: x.education.map((e, k) => (k === i ? { ...e, ...patch } : e)) }))
  return (
    <>
      {d.education.map((e, i) => (
        <Card key={i}>
          <Field label={t('Degree / Qualification')} value={e.degree} onChangeText={v => edit(i, { degree: v })} placeholder={t('MSc Product Management')} />
          <Field label={t('School / University')} value={e.school} onChangeText={v => edit(i, { school: v })} placeholder={t('UCL')} />
          <Field label={t('Year')} value={e.year} onChangeText={v => edit(i, { year: v })} placeholder="2020" />
          <ItemActions
            i={i} count={d.education.length} t={t}
            onMove={dir => update(x => ({ ...x, education: moved(x.education, i, dir) }))}
            onRemove={() => update(x => ({ ...x, education: x.education.filter((_, k) => k !== i) }))}
          />
        </Card>
      ))}
      <Button kind="ghost" title={t('Add Another Qualification')} onPress={() => update(x => ({ ...x, education: [...x.education, { degree: '', school: '', year: '' }] }))} />
    </>
  )
}

function Languages({ d, t }: { d: CvData; t: T }) {
  const edit = (i: number, patch: Partial<CvData['languages'][number]>) =>
    update(x => ({ ...x, languages: x.languages.map((l, k) => (k === i ? { ...l, ...patch } : l)) }))
  return (
    <>
      {d.languages.map((l, i) => (
        <Card key={i}>
          <Field label={t('Language')} value={l.name} onChangeText={v => edit(i, { name: v })} />
          <Field label={t('Level')} value={l.level} onChangeText={v => edit(i, { level: v })} placeholder={t('Select level')} />
          <ItemActions
            i={i} count={d.languages.length} t={t}
            onMove={dir => update(x => ({ ...x, languages: moved(x.languages, i, dir) }))}
            onRemove={() => update(x => ({ ...x, languages: x.languages.filter((_, k) => k !== i) }))}
          />
        </Card>
      ))}
      <Button kind="ghost" title={t('Add Language')} onPress={() => update(x => ({ ...x, languages: [...x.languages, { name: '', level: '' }] }))} />
    </>
  )
}

function Projects({ d, t }: { d: CvData; t: T }) {
  const edit = (i: number, patch: Partial<CvData['projects'][number]>) =>
    update(x => ({ ...x, projects: x.projects.map((p, k) => (k === i ? { ...p, ...patch } : p)) }))
  return (
    <>
      {d.projects.map((p, i) => (
        <Card key={i}>
          <Field label={t('Project Name')} value={p.name} onChangeText={v => edit(i, { name: v })} placeholder={t('e.g. Portfolio Website, Open Source Tool')} />
          <Field label={t('Tech / Stack')} value={p.tech} onChangeText={v => edit(i, { tech: v })} placeholder={t('e.g. Vue, Node.js, PostgreSQL')} />
          <Field label={t('URL')} value={p.url} onChangeText={v => edit(i, { url: v })} autoCapitalize="none" keyboardType="url" />
          <Field label={t('Description')} value={p.desc} onChangeText={v => edit(i, { desc: v })} multiline placeholder={t('What did you build? What problem did it solve? Any key results?')} />
          <ItemActions
            i={i} count={d.projects.length} t={t}
            onMove={dir => update(x => ({ ...x, projects: moved(x.projects, i, dir) }))}
            onRemove={() => update(x => ({ ...x, projects: x.projects.filter((_, k) => k !== i) }))}
          />
        </Card>
      ))}
      <Button kind="ghost" title={t('Add Project')} onPress={() => update(x => ({ ...x, projects: [...x.projects, { name: '', tech: '', url: '', desc: '' }] }))} />
    </>
  )
}

function Skills({ d, t }: { d: CvData; t: T }) {
  const c = useColors()
  const [busy, setBusy] = useState(false)
  const [suggested, setSuggested] = useState<string[]>([])
  const [error, setError] = useState('')
  const have = new Set(d.skills.map(s => s.toLowerCase()))
  const open = suggested.filter(s => !have.has(s.toLowerCase()))
  async function suggest() {
    setBusy(true); setError('')
    try { setSuggested((await suggestSkills(d)).skills) } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }
  return (
    <Card>
      <ChipInput items={d.skills} onChange={v => setField('skills', v)} placeholder={t('Type a skill and press Enter')} addLabel={t('Add')} />
      <Hint text={t('6–12 recommended')} />
      <AiButton label={t('Suggest Skills with AI')} busyLabel={t('Suggesting…')} busy={busy} onPress={suggest} />
      <ErrorText text={error} />
      {open.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text2, fontSize: 13, fontWeight: '600' }}>{t('AI Suggestions, click to add')}</Text>
          <View style={styles.chips}>
            {open.map(s => (
              <SmallAction key={s} label={`+ ${s}`} onPress={() => setField('skills', [...d.skills, s])} />
            ))}
          </View>
          <SmallAction label={t('Add all')} onPress={() => setField('skills', [...d.skills, ...open])} />
        </View>
      )}
    </Card>
  )
}

function Hint({ text }: { text: string }) {
  const c = useColors()
  return <Text style={{ fontSize: 12.5, color: c.text3 }}>{text}</Text>
}

function SectionBody({ section, d, t }: { section: Section; d: CvData; t: T }) {
  switch (section) {
    case 'personal': return <Personal d={d} t={t} />
    case 'summary': return <Summary d={d} t={t} />
    case 'experience': return <Experience d={d} t={t} />
    case 'education': return <Education d={d} t={t} />
    case 'languages': return <Languages d={d} t={t} />
    case 'projects': return <Projects d={d} t={t} />
    case 'skills': return <Skills d={d} t={t} />
    case 'certifications':
      return (
        <Card>
          <ChipInput items={d.certifications} onChange={v => setField('certifications', v)} placeholder={t('e.g. AWS Certified, PMP, PSPO II')} addLabel={t('Add')} />
        </Card>
      )
  }
}

export default function SectionScreen() {
  const { id, section } = useLocalSearchParams<{ id: string; section: string }>()
  const { cv, loading } = useOpenCv(id)
  const { t } = useLang()
  const c = useColors()
  if (!isSection(section)) return null
  if (loading || !cv) return <ActivityIndicator style={styles.center} color={c.accent} />

  return (
    <ScrollView
      contentContainerStyle={styles.body}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive">
      <Stack.Screen options={{ title: t(SECTION_TITLE[section]), headerRight: () => <SaveStatus state={cv.save} /> }} />
      <SectionBody section={section} d={cv.data} t={t} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { padding: 16, gap: 14, paddingBottom: 48 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 10 },
})
