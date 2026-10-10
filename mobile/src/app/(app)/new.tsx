// New CV: fill it in step by step, import an existing CV, or tell your story.
import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, router } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import { useQueryClient } from '@tanstack/react-query'
import type { Draft } from '@/lib/api'
import { createDraft, importCv } from '@/lib/start'
import { errorText } from '@/lib/ai'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

const TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']

function Option({ title, desc, onPress, busy, disabled }: { title: string; desc: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  const c = useColors()
  return (
    <Pressable
      onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({ pressed }) => [styles.option, { backgroundColor: c.surface, borderColor: c.border, opacity: disabled && !busy ? 0.5 : pressed ? 0.85 : 1 }]}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: c.text, fontSize: 16.5, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: c.text2, fontSize: 14, lineHeight: 20 }}>{desc}</Text>
      </View>
      {busy ? <ActivityIndicator color={c.accent} /> : <Text style={{ color: c.text3, fontSize: 24 }}>›</Text>}
    </Pressable>
  )
}

export default function NewCv() {
  const { t } = useLang()
  const c = useColors()
  const qc = useQueryClient()
  const [busy, setBusy] = useState<'' | 'empty' | 'import'>('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const opened = (d: Draft) => {
    qc.setQueryData<Draft[]>(['drafts'], list => [d, ...(list || [])])
    router.replace({ pathname: '/cv/[id]', params: { id: d.id } })
  }

  async function empty() {
    setBusy('empty'); setError('')
    try { opened(await createDraft()) } catch (e) { setError(errorText(e)) }
    setBusy('')
  }

  async function importFile() {
    setError(''); setStatus('')
    const res = await DocumentPicker.getDocumentAsync({ type: TYPES, copyToCacheDirectory: true, multiple: false })
    if (res.canceled || !res.assets?.[0]) return
    const file = res.assets[0]
    if (file.size && file.size > 10 * 1024 * 1024) { setError(t('PDF, DOCX or TXT · Max 10MB')); return }
    setBusy('import'); setStatus(t('Reading {file}…', { file: file.name }))
    try { opened(await createDraft(await importCv(file))) } catch (e) { setError(errorText(e)) }
    setBusy(''); setStatus('')
  }

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Stack.Screen options={{ title: t('New CV') }} />
      <Option title={t('Fill it in step by step')} desc={t('Fill in each section with AI help along the way.')} onPress={empty} busy={busy === 'empty'} disabled={!!busy} />
      <Option title={t('Import Existing CV')} desc={t('Upload your CV and AI will extract all the information and pre-fill every section.')} onPress={importFile} busy={busy === 'import'} disabled={!!busy} />
      <Option title={t('Tell your story')} desc={t('Speak or type your career story. AI builds your whole CV from it.')} onPress={() => router.push('/story')} disabled={!!busy} />
      {!!status && <Text style={{ color: c.text2, textAlign: 'center' }}>{status}</Text>}
      {!!error && <Text style={{ color: c.danger, textAlign: 'center', lineHeight: 20 }} accessibilityLiveRegion="polite">{error}</Text>}
      <Text style={{ color: c.text3, fontSize: 12.5, textAlign: 'center', lineHeight: 18 }}>{t('For best results use a text-based PDF (not a scanned image). AI reads the text content and structures it into your CV.')}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 12, paddingBottom: 48 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 18 },
})
