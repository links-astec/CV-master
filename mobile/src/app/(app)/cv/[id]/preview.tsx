// The CV exactly as its PDF looks, with the latest edits, and the free preview PDF to share.
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOpenCv } from '@/lib/useOpenCv'
import { CvPreview } from '@/components/CvPreview'
import { sharePreviewPdf } from '@/lib/pdf'
import { errorText } from '@/lib/ai'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import { templateLabel } from '@web/composables/cvRenderer.js'

export default function Preview() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { cv, loading } = useOpenCv(id)
  const { t } = useLang()
  const c = useColors()
  const insets = useSafeAreaInsets()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function download() {
    setBusy(true); setError('')
    try { await sharePreviewPdf(id) } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }

  if (loading || !cv) return <ActivityIndicator style={styles.center} color={c.accent} />
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: templateLabel(cv.template) }} />
      <CvPreview template={cv.template} data={cv.data} fmt={cv.fmt} />
      <View style={[styles.bar, { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
        {!!error && <Text style={{ color: c.danger, fontSize: 13.5 }} accessibilityLiveRegion="polite">{error}</Text>}
        <Pressable
          onPress={download} disabled={busy} accessibilityRole="button"
          style={({ pressed }) => [styles.button, { backgroundColor: c.accent, opacity: busy ? 0.7 : pressed ? 0.85 : 1 }]}>
          {busy
            ? <View style={styles.busy}><ActivityIndicator color={c.accentText} /><Text style={[styles.buttonText, { color: c.accentText }]}>{t('Preparing your PDF…')}</Text></View>
            : <Text style={[styles.buttonText, { color: c.accentText }]}>{t('Free preview PDF')}</Text>}
        </Pressable>
        <Text style={[styles.note, { color: c.text3 }]}>{t('Includes a “CVMaster” watermark across the page')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bar: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  button: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  note: { fontSize: 12.5, textAlign: 'center' },
})
