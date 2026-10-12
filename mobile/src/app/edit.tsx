// The "Edit CV" sheet, like the website's mobile drawer: Content (each section as an accordion,
// plus the "Before you export" checklist), Design (language, colour, layout) and Job match.
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Check, ChevronDown, ChevronUp } from '@/components/icons'
import { Btn, Segmented, Txt, useTopSpace } from '@/components/kit'
import { SaveStatus } from '@/components/SaveStatus'
import { SectionBody } from '@/components/panels/Sections'
import { DesignPanel } from '@/components/panels/DesignPanel'
import { CvLanguagePanel } from '@/components/panels/CvLanguagePanel'
import { JobMatchPanel } from '@/components/panels/JobMatchPanel'
import { ChecklistPanel } from '@/components/panels/ChecklistPanel'
import { setField, useCurrentCvId } from '@/lib/editor'
import { useOpenCv } from '@/lib/useOpenCv'
import { SECTIONS, summaryOf, type Section } from '@/lib/sections'
import { rules } from '@/lib/checklist'
import { useAuth } from '@/lib/auth'
import type { CvData } from '@/lib/cv'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

type Tab = 'content' | 'design' | 'job'
// The website's accordion titles
const TITLE: Record<Section, string> = {
  personal: 'Personal details', summary: 'Professional Summary', experience: 'Work Experience', education: 'Education',
  skills: 'Skills', languages: 'Languages', projects: 'Projects', certifications: 'Certifications',
}

// Who the CV is for: the user's choice, or a guess (a different name from the account's = someone else)
function CvFor({ d }: { d: CvData }) {
  const { t } = useLang()
  const { c } = useTheme()
  const { user } = useAuth()
  if (!user) return null
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/\s+/).filter(w => w.length > 1)
  const cvName = norm(`${d.fn} ${d.ln}`), me = new Set(norm(user.name || ''))
  const who = d.cvFor === 'self' || d.cvFor === 'other' ? d.cvFor : !cvName.length || cvName.some(w => me.has(w)) ? 'self' : 'other'
  return (
    <View style={[styles.cvFor, { borderColor: c.border, backgroundColor: c.surface }]}>
      <Txt w={600} size={14.5}>{t('Who is this CV for?')}</Txt>
      <View style={{ alignSelf: 'flex-start', minWidth: 220 }}>
        <Segmented items={[{ key: 'self', label: t('Me') }, { key: 'other', label: t('Someone else') }]} value={who} onChange={v => setField('cvFor', v)} />
      </View>
      <Txt size={13} color={c.text3} style={{ lineHeight: 18 }}>
        {t(who === 'self' ? 'The AI personalises suggestions with your profile and your other CVs.' : 'The AI uses only what’s in this CV. Nothing from your profile or other CVs.')}
      </Txt>
    </View>
  )
}

function Accordion({ title, sub, done, open, onToggle, children }: { title: string; sub?: string; done: boolean; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  const { c } = useTheme()
  return (
    <View style={[styles.acc, { borderColor: c.border, backgroundColor: c.surface }]}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.accHead}>
        <View style={[styles.tick, done ? { backgroundColor: c.green, borderColor: c.green } : { borderColor: c.border2 }]}>
          {done && <Check size={15} color="#fff" strokeWidth={3} />}
        </View>
        <Txt w={600} size={16} style={{ flex: 1 }}>{title}</Txt>
        {!!sub && !open && <Txt size={13.5} color={c.text3} numberOfLines={1} style={{ maxWidth: '40%' }}>{sub}</Txt>}
        {open ? <ChevronUp size={18} color={c.text3} /> : <ChevronDown size={18} color={c.text3} />}
      </Pressable>
      {open && <View style={[styles.accBody, { borderTopColor: c.border }]}>{children}</View>}
    </View>
  )
}

export default function EditSheet() {
  const params = useLocalSearchParams<{ tab?: string; section?: string }>()
  const { t } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const top = useTopSpace(16, { sheet: true })
  const id = useCurrentCvId()
  const { cv, loading } = useOpenCv(id)
  const [tab, setTab] = useState<Tab>(params.tab === 'design' || params.tab === 'job' ? params.tab : 'content')
  const [open, setOpen] = useState<string>(params.section || 'personal')
  const [langOpen, setLangOpen] = useState(false)

  const toggle = (k: string) => setOpen(o => (o === k ? '' : k))
  const todo = cv ? rules(cv.data).filter(r => r.severity !== 'pass' && !(r.severity === 'warn' && cv.data.checkIgnored.includes(r.id))).length : 0

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.head, { backgroundColor: c.surface, borderBottomColor: c.border, paddingTop: top }]}>
        <Txt w={600} size={18} style={{ flex: 1 }}>{t('Edit CV')}</Txt>
        {cv && <SaveStatus state={cv.save} />}
        <Btn title={t('Done')} size="sm" onPress={() => router.back()} />
      </View>
      <View style={[styles.tabs, { backgroundColor: c.bg, borderBottomColor: c.border }]}>
        <Segmented items={[{ key: 'content', label: t('Content') }, { key: 'design', label: t('Design') }, { key: 'job', label: t('Job match') }]} value={tab} onChange={k => { setTab(k); setLangOpen(false) }} />
      </View>
      {loading || !cv ? <ActivityIndicator style={{ flex: 1 }} color={c.accent} /> : (
        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="interactive">
          {tab === 'content' && (
            <>
              {SECTIONS.map(s => (
                <Accordion key={s} title={t(TITLE[s])} sub={summaryOf(s, cv.data)} done={!!summaryOf(s, cv.data)} open={open === s} onToggle={() => toggle(s)}>
                  {s === 'personal' && <CvFor d={cv.data} />}
                  <SectionBody section={s} d={cv.data} t={t} template={cv.template} />
                </Accordion>
              ))}
              <Accordion title={t('Before you export')} sub={todo ? t(todo === 1 ? '{n} thing to fix' : '{n} things to fix', { n: todo }) : t('Your CV is complete')} done={!todo} open={open === 'check'} onToggle={() => toggle('check')}>
                <ChecklistPanel cv={cv} onAdd={s => setOpen(s)} />
              </Accordion>
            </>
          )}
          {tab === 'design' && (langOpen
            ? <CvLanguagePanel cv={cv} onDone={() => setLangOpen(false)} />
            : <DesignPanel cv={cv} onLanguage={() => setLangOpen(true)} />)}
          {tab === 'job' && <JobMatchPanel cv={cv} />}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  tabs: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  body: { padding: 16, gap: 12 },
  acc: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  accHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  accBody: { borderTopWidth: StyleSheet.hairlineWidth, padding: 14, gap: 14 },
  tick: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  cvFor: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
})
