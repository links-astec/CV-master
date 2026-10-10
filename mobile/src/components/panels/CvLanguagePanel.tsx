// The CV's own language (separate from the app's). Headings switch for any of the 7 languages;
// for English ↔ French the AI can also translate the content, shown field by field to keep or not.
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native'
import { Text } from '@/components/AppText'
import { setField, update, type OpenCv } from '@/lib/editor'
import { errorText, translateCv, TRANSLATABLE, type TranslateResult } from '@/lib/ai'
import { hasCvContent, type CvData } from '@/lib/cv'
import { Button, Card } from '@/components/ui'
import { LANGS, useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

type Item = { id: string; label: string; before: string; after: string; apply: (d: CvData) => CvData; on: boolean }

// One reviewable item per field that the translation actually changes
function itemsFrom(d: CvData, r: TranslateResult, t: (s: string, p?: Record<string, unknown>) => string): Item[] {
  const out: Item[] = []
  const add = (id: string, label: string, before: string, after: string, apply: (x: CvData) => CvData) => {
    if (after && after !== before) out.push({ id, label, before, after, apply, on: true })
  }
  add('title', t('Job Title'), d.title, r.title, x => ({ ...x, title: r.title }))
  add('sum', t('Summary'), d.sum, r.sum, x => ({ ...x, sum: r.sum }))
  r.experiences.forEach(e => {
    const was = d.experiences[e.i]
    if (!was) return
    const name = was.title || was.company || String(e.i + 1)
    const before = [was.title, was.period, was.desc].filter(Boolean).join('\n')
    const after = [e.title, e.period, e.desc].filter(Boolean).join('\n')
    add(`exp:${e.i}`, t('Experience: {name}', { name }), before, after,
      x => ({ ...x, experiences: x.experiences.map((y, k) => (k === e.i ? { ...y, title: e.title, period: e.period, desc: e.desc } : y)) }))
  })
  r.education.forEach(e => {
    const was = d.education[e.i]
    if (!was) return
    add(`edu:${e.i}`, t('Education: {name}', { name: was.degree || was.school || String(e.i + 1) }), [was.degree, was.year].filter(Boolean).join(' · '), [e.degree, e.year].filter(Boolean).join(' · '),
      x => ({ ...x, education: x.education.map((y, k) => (k === e.i ? { ...y, degree: e.degree, year: e.year } : y)) }))
  })
  r.projects.forEach(p => {
    const was = d.projects[p.i]
    if (!was) return
    add(`proj:${p.i}`, t('Project: {name}', { name: was.name || String(p.i + 1) }), was.desc, p.desc,
      x => ({ ...x, projects: x.projects.map((y, k) => (k === p.i ? { ...y, desc: p.desc } : y)) }))
  })
  add('skills', t('Skills'), d.skills.join(', '), r.skills.join(', '), x => ({ ...x, skills: r.skills }))
  add('languages', t('Languages'), d.languages.map(l => [l.name, l.level].filter(Boolean).join(' · ')).join(', '),
    r.languages.map(l => [l.name, l.level].filter(Boolean).join(' · ')).join(', '),
    x => ({ ...x, languages: x.languages.map((l, k) => { const n = r.languages.find(y => y.i === k); return n ? { name: n.name, level: n.level } : l }) }))
  add('certifications', t('Certifications'), d.certifications.join(', '), r.certifications.join(', '), x => ({ ...x, certifications: r.certifications }))
  return out
}

export function CvLanguagePanel({ cv, onDone }: { cv: OpenCv; onDone: () => void }) {
  const { t } = useLang()
  const c = useColors()
  const [target, setTarget] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<Item[] | null>(null)
  const d = cv.data

  async function choose(code: string) {
    setError(''); setItems(null)
    if (code === d.lang) return
    const canTranslate = TRANSLATABLE.includes(code) && TRANSLATABLE.includes(d.lang) && hasCvContent(d)
    if (!canTranslate) { setField('lang', code); onDone(); return }
    setTarget(code); setBusy(true)
    try { setItems(itemsFrom(d, await translateCv(d, code as 'en' | 'fr'), t)) } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }

  function finish(withContent: boolean) {
    if (!target) return
    update(x => {
      let out = { ...x, lang: target }
      if (withContent && items) for (const it of items) if (it.on) out = { ...it.apply(out), lang: target }
      return out
    })
    onDone()
  }

  const selected = items?.filter(i => i.on).length || 0
  return (
    <View style={{ gap: 12 }}>
      {!target && (
        <View style={[styles.group, { backgroundColor: c.surface, borderColor: c.border }]}>
          {LANGS.map((l, i) => (
            <Pressable
              key={l.code} onPress={() => choose(l.code)} accessibilityRole="radio" accessibilityState={{ selected: l.code === d.lang }}
              style={({ pressed }) => [styles.item, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }, pressed && { backgroundColor: c.surface2 }]}>
              <Text style={{ flex: 1, color: l.code === d.lang ? c.accent : c.text, fontSize: 16, fontWeight: l.code === d.lang ? '700' : '500' }}>{l.label}</Text>
              {l.code === d.lang && <Text style={{ color: c.accent, fontSize: 18 }}>✓</Text>}
            </Pressable>
          ))}
        </View>
      )}
      {!!target && (
        <Card>
          <Text style={{ color: c.text2, fontSize: 14, lineHeight: 20 }}>{t('Headings change automatically. We’ll also translate your content. Review it below and keep what you want. Names, companies, schools, technologies and numbers stay as they are.')}</Text>
          {busy && <View style={styles.row}><ActivityIndicator color={c.accent} /><Text style={{ color: c.text2 }}>{t('Translating your CV…')}</Text></View>}
          {!!error && <Text style={{ color: c.danger }}>{error}</Text>}
          {items && (
            <>
              <Text style={{ color: c.text3, fontSize: 13 }}>{t('{n} of {total} selected', { n: selected, total: items.length })}</Text>
              {items.map((it, k) => (
                <View key={it.id} style={[styles.change, { borderColor: c.border, opacity: it.on ? 1 : 0.55 }]}>
                  <View style={styles.row}>
                    <Text style={{ flex: 1, color: c.text, fontWeight: '600' }}>{it.label}</Text>
                    <Switch value={it.on} onValueChange={v => setItems(items.map((x, j) => (j === k ? { ...x, on: v } : x)))} accessibilityLabel={it.label} />
                  </View>
                  <Text style={{ color: c.text3, fontSize: 13.5, lineHeight: 19 }}>{it.before}</Text>
                  <Text style={{ color: c.text, fontSize: 14, lineHeight: 20 }}>{it.after}</Text>
                </View>
              ))}
              <Button title={t('Translate & switch')} onPress={() => finish(true)} />
            </>
          )}
          <Button kind="ghost" title={t('Headings only')} onPress={() => finish(false)} disabled={busy} />
          <Button kind="ghost" title={t('Cancel')} onPress={() => { setTarget(null); setItems(null); setError('') }} disabled={busy} />
        </Card>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { padding: 16, gap: 12, paddingBottom: 48 },
  group: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  change: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 },
})
