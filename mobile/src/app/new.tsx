// New CV: fill it in step by step, import an existing CV, or tell your story. The CV is saved to
// the account, so it is on the website too.
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as DocumentPicker from 'expo-document-picker'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronRight, FileUp, MessageSquareText, PenLine, X, type LucideIcon } from '@/components/icons'
import { IconBtn, PageTitle, Txt } from '@/components/kit'
import type { Draft } from '@/lib/api'
import { importCv, startCv } from '@/lib/start'
import { errorText } from '@/lib/ai'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { BrandLoader } from '@/components/BrandLoader'

const TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']

function Option({ icon: Icon, title, desc, onPress, busy, disabled }: { icon: LucideIcon; title: string; desc: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  const { c } = useTheme()
  return (
    <Pressable
      onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({ pressed }) => [styles.option, { backgroundColor: c.surface, borderColor: 'transparent', opacity: disabled && !busy ? 0.5 : pressed ? 0.85 : 1 }]}>
      <View style={[styles.icon, { backgroundColor: c.accentSoft }]}><Icon size={22} color={c.accent} strokeWidth={1.9} /></View>
      <View style={{ flex: 1, gap: 4 }}>
        <Txt w={700} size={16.5}>{title}</Txt>
        <Txt size={14} color={c.text2} style={{ lineHeight: 20 }}>{desc}</Txt>
      </View>
      {busy ? <BrandLoader size={20} /> : <ChevronRight size={20} color={c.text3} />}
    </Pressable>
  )
}

export default function NewCv() {
  const { t } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const qc = useQueryClient()
  const [busy, setBusy] = useState<'' | 'empty' | 'import'>('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const opened = (d: Draft) => {
    qc.setQueryData<Draft[]>(['drafts'], list => [d, ...(list || [])])
    router.back()
    router.navigate('/editor')
  }

  async function empty() {
    setBusy('empty'); setError('')
    try { opened(await startCv()) } catch (e) { setError(errorText(e)) }
    setBusy('')
  }

  async function importFile() {
    setError(''); setStatus('')
    const res = await DocumentPicker.getDocumentAsync({ type: TYPES, copyToCacheDirectory: true, multiple: false })
    if (res.canceled || !res.assets?.[0]) return
    const file = res.assets[0]
    if (file.size && file.size > 10 * 1024 * 1024) { setError(t('PDF, DOCX or TXT · Max 10MB')); return }
    setBusy('import'); setStatus(t('Reading {file}…', { file: file.name }))
    try { opened(await startCv(await importCv(file))) } catch (e) { setError(errorText(e)) }
    setBusy(''); setStatus('')
  }

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={[styles.body, { paddingTop: insets.top > 30 ? 20 : insets.top + 16 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <IconBtn icon={X} onPress={() => router.back()} label={t('Close')} color={c.text3} />
      </View>
      <PageTitle title={t('New CV')} sub={t('Let’s build your CV')} />
      <Option icon={PenLine} title={t('Fill it in step by step')} desc={t('Fill in each section with AI help along the way.')} onPress={empty} busy={busy === 'empty'} disabled={!!busy} />
      <Option icon={FileUp} title={t('Import Existing CV')} desc={t('Upload your CV and AI will extract all the information and pre-fill every section.')} onPress={importFile} busy={busy === 'import'} disabled={!!busy} />
      <Option icon={MessageSquareText} title={t('Tell your story')} desc={t('Speak or type your career story. AI builds your whole CV from it.')} onPress={() => { router.back(); router.push('/story') }} disabled={!!busy} />
      {!!status && <Txt color={c.text2} style={{ textAlign: 'center' }}>{status}</Txt>}
      {!!error && <Txt color={c.danger} style={{ textAlign: 'center', lineHeight: 21 }} accessibilityLiveRegion="polite">{error}</Txt>}
      <Txt size={13} color={c.text3} style={{ textAlign: 'center', lineHeight: 19 }}>{t('For best results use a text-based PDF (not a scanned image). AI reads the text content and structures it into your CV.')}</Txt>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 48 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 24, padding: 20, shadowColor: '#14142b', shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
})
