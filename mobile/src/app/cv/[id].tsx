// One CV, shown exactly as its PDF looks.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useDrafts } from '@/lib/drafts'
import { CvPreview } from '@/components/CvPreview'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

export default function CvScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading } = useDrafts()
  const { t } = useLang()
  const c = useColors()
  const draft = data?.find(d => d.id === id)

  if (isLoading) return <ActivityIndicator style={styles.center} color={c.accent} />
  if (!draft) return <View style={styles.center}><Text style={{ color: c.text2 }}>{t('Draft not found.')}</Text></View>

  const { fmt, ...cv } = (draft.data || {}) as Record<string, any>
  return (
    <>
      <Stack.Screen options={{ title: draft.title || t('Untitled CV') }} />
      <CvPreview template={draft.template} data={cv} fmt={fmt} />
    </>
  )
}

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 } })
