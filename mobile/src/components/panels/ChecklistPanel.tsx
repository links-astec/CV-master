// The CV checklist with "Fix with AI": the same checks as the website. AI fixes are shown as
// before/after suggestions the user can edit, untick, apply or undo.
import { useState } from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import { Text, TextInput } from '@/components/AppText'
import { setField, update, type OpenCv } from '@/lib/editor'
import type { Section } from '@/lib/sections'
import { aiFix, errorText, type FixResult } from '@/lib/ai'
import { PLACEHOLDER, aiFixFor, rules, sortByDate, type Rule } from '@/lib/checklist'
import type { CvData } from '@/lib/cv'
import { Button, Card, SmallAction } from '@/components/ui'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

type Change = FixResult['changes'][number] & { on: boolean }
type Review = { ruleId: string; title: string; changes: Change[]; skills: { name: string; on: boolean }[]; note: string }
const hasPlaceholder = (s: string) => new RegExp(PLACEHOLDER.source).test(s)
// What a change edits: the CV's own field names, or the role it rewrites
const labelOf = (ch: Change, t: (s: string) => string) => (ch.key === 'title' ? t('Job Title') : ch.key === 'sum' ? t('Summary') : ch.label)

function FixReview({ r, setR, onApply, onCancel }: { r: Review; setR: (r: Review) => void; onApply: () => void; onCancel: () => void }) {
  const { t } = useLang()
  const c = useColors()
  const selected = r.changes.filter(x => x.on && x.after.trim()).length + r.skills.filter(s => s.on).length
  const blocked = r.changes.some(x => x.on && hasPlaceholder(x.after))
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: c.text2, fontSize: 13.5, lineHeight: 19 }}>{t('Check the suggestion, edit it if you like, then apply. Nothing changes until you do.')}</Text>
      {!r.changes.length && !r.skills.length && <Text style={{ color: c.text2 }}>{t('The AI didn’t find anything worth changing here.')}</Text>}
      {r.changes.map((ch, i) => (
        <View key={ch.key} style={[styles.change, { borderColor: c.border, opacity: ch.on ? 1 : 0.55 }]}>
          <View style={styles.rowBetween}>
            <Text style={{ color: c.text, fontWeight: '600', flex: 1 }}>{labelOf(ch, t)}</Text>
            <Switch value={ch.on} onValueChange={v => setR({ ...r, changes: r.changes.map((x, k) => (k === i ? { ...x, on: v } : x)) })} accessibilityLabel={labelOf(ch, t)} />
          </View>
          {!!ch.before && <Text style={{ color: c.text3, fontSize: 13.5, lineHeight: 19 }}>{ch.before}</Text>}
          <TextInput
            value={ch.after} multiline accessibilityLabel={t('After')}
            onChangeText={v => setR({ ...r, changes: r.changes.map((x, k) => (k === i ? { ...x, after: v } : x)) })}
            style={[styles.edit, { color: c.text, borderColor: hasPlaceholder(ch.after) ? '#D97706' : c.border, backgroundColor: c.surface }]}
          />
        </View>
      ))}
      {r.skills.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text style={{ color: c.text2, fontSize: 13, fontWeight: '600' }}>{t('Tick the skills you really have')}</Text>
          {r.skills.map((s, i) => (
            <View key={s.name} style={styles.rowBetween}>
              <Text style={{ color: c.text, flex: 1 }}>{s.name}</Text>
              <Switch value={s.on} onValueChange={v => setR({ ...r, skills: r.skills.map((x, k) => (k === i ? { ...x, on: v } : x)) })} accessibilityLabel={s.name} />
            </View>
          ))}
        </View>
      )}
      {!!r.note && <Text style={{ color: c.text2, fontSize: 13.5 }}>{r.note}</Text>}
      <Button
        title={blocked ? t('Fill in the numbers first') : !selected ? t('Apply changes') : t(selected === 1 ? 'Apply {n} change' : 'Apply {n} changes', { n: selected })}
        disabled={blocked || !selected} onPress={onApply}
      />
      <Button kind="ghost" title={t('Cancel')} onPress={onCancel} />
    </View>
  )
}

function Item({ rule, d, onAdd, review, setReview, busy, onFix, onIgnore }: {
  rule: Rule; d: CvData; onAdd: (s: Section) => void; review: Review | null; setReview: (r: Review | null) => void
  busy: boolean; onFix: (issue: string) => void; onIgnore: () => void
}) {
  const { t } = useLang()
  const c = useColors()
  const issue = aiFixFor(rule.id, d)
  const open = review?.ruleId === rule.id
  return (
    <Card>
      <View style={styles.rowTop}>
        <View style={[styles.dot, { backgroundColor: rule.severity === 'error' ? c.danger : '#D97706' }]} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: c.text, fontWeight: '600', fontSize: 15 }}>{t(rule.title.key, rule.title.params)}</Text>
          <Text style={{ color: c.text2, fontSize: 13.5, lineHeight: 19 }}>{t(rule.text.key, rule.text.params)}</Text>
        </View>
      </View>
      {!open && (
        <View style={styles.actions}>
          {issue && <SmallAction label={busy ? '…' : `✦ ${t('Fix with AI')}`} onPress={() => onFix(issue)} disabled={busy} />}
          {rule.id === 'date-order'
            ? <SmallAction label={t('Sort by date')} onPress={() => update(x => ({ ...x, experiences: sortByDate(x.experiences, 'period'), education: sortByDate(x.education, 'year') }))} />
            : rule.section && <SmallAction label={t('Add')} onPress={() => onAdd(rule.section!)} />}
          {rule.severity === 'warn' && <SmallAction label={t('Ignore')} color={c.text3} onPress={onIgnore} />}
        </View>
      )}
      {open && review && (
        <FixReview
          r={review} setR={setReview} onCancel={() => setReview(null)}
          onApply={() => {
            update(x => {
              const out = { ...x }
              for (const ch of review.changes) {
                if (!ch.on || !ch.after.trim()) continue
                if (ch.key === 'title') out.title = ch.after
                else if (ch.key === 'sum') out.sum = ch.after
                else {
                  const m = /^exp:(\d+)$/.exec(ch.key)
                  if (m) out.experiences = out.experiences.map((e, k) => (k === Number(m[1]) ? { ...e, desc: ch.after } : e))
                }
              }
              const add = review.skills.filter(s => s.on).map(s => s.name).filter(s => !x.skills.some(h => h.toLowerCase() === s.toLowerCase()))
              out.skills = [...x.skills, ...add]
              return out
            })
            setReview(null)
          }}
        />
      )}
    </Card>
  )
}

export function ChecklistPanel({ cv, onAdd }: { cv: OpenCv; onAdd: (s: Section) => void }) {
  const { t } = useLang()
  const c = useColors()
  const [review, setReview] = useState<Review | null>(null)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [showPassed, setShowPassed] = useState(false)
  const d = cv.data
  const all = rules(d)
  const ignored = new Set(d.checkIgnored)
  const todo = all.filter(r => r.severity !== 'pass' && !(r.severity === 'warn' && ignored.has(r.id)))
    .sort((a, b) => (a.severity === 'error' ? 0 : 1) - (b.severity === 'error' ? 0 : 1))
  const passed = all.filter(r => r.severity === 'pass')
  const ignoredRules = all.filter(r => r.severity === 'warn' && ignored.has(r.id))
  const total = all.reduce((n, r) => n + r.points, 0)
  const got = passed.reduce((n, r) => n + r.points, 0)

  async function fix(rule: Rule, issue: string) {
    setBusyId(rule.id); setError('')
    try {
      const res = await aiFix(d, issue)
      setReview({
        ruleId: rule.id, title: t(rule.title.key, rule.title.params), note: res.note,
        changes: res.changes.map(x => ({ ...x, on: true })), skills: res.skills.map(name => ({ name, on: false })),
      })
    } catch (e) { setError(errorText(e)) }
    setBusyId('')
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 6 }}>
        <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>
          {todo.length ? t(todo.length === 1 ? '{n} thing to fix' : '{n} things to fix', { n: todo.length }) : t('Your CV is complete')}
        </Text>
        <Text style={{ color: c.text3, fontSize: 13 }}>{t('{n}/{total} checks passed', { n: passed.length, total: all.length })}</Text>
        <View style={[styles.bar, { backgroundColor: c.border }]}><View style={{ width: `${Math.round((got / total) * 100)}%`, height: '100%', backgroundColor: c.success, borderRadius: 99 }} /></View>
      </View>
      {!!error && <Text style={{ color: c.danger }}>{error}</Text>}
      {!todo.length && <Card><Text style={{ color: c.text }}>{t('Every check passed. Contact details, summary, experience, skills and education are all in place.')}</Text></Card>}
      {todo.map(r => (
        <Item
          key={r.id} rule={r} d={d} onAdd={onAdd} review={review} setReview={setReview} busy={busyId === r.id}
          onFix={issue => fix(r, issue)} onIgnore={() => setField('checkIgnored', [...new Set([...d.checkIgnored, r.id])])}
        />
      ))}
      {ignoredRules.length > 0 && (
        <View style={styles.actions}>
          <Text style={{ color: c.text3, fontSize: 13 }}>{t('Ignored:')}</Text>
          {ignoredRules.map(r => (
            <SmallAction key={r.id} label={`↺ ${t(r.title.key, r.title.params)}`} onPress={() => setField('checkIgnored', d.checkIgnored.filter(x => x !== r.id))} />
          ))}
        </View>
      )}
      {passed.length > 0 && (
        <SmallAction
          label={t(showPassed ? (passed.length === 1 ? 'Hide the {n} passed check' : 'Hide the {n} passed checks') : (passed.length === 1 ? 'Show the {n} passed check' : 'Show the {n} passed checks'), { n: passed.length })}
          onPress={() => setShowPassed(!showPassed)}
        />
      )}
      {showPassed && passed.map(r => <Text key={r.id} style={{ color: c.text2, fontSize: 13.5 }}>✓  {t(r.title.key, r.title.params)}</Text>)}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { padding: 16, gap: 12, paddingBottom: 48 },
  bar: { height: 6, borderRadius: 99, overflow: 'hidden' },
  rowTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 18, rowGap: 8 },
  change: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 },
  edit: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14.5, lineHeight: 20, minHeight: 80, textAlignVertical: 'top' },
})
