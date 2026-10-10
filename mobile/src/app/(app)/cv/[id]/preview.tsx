// The CV exactly as its PDF looks, with the latest edits.
import { ActivityIndicator, StyleSheet } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useOpenCv } from '@/lib/useOpenCv'
import { CvPreview } from '@/components/CvPreview'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import { templateLabel } from '@web/composables/cvRenderer.js'

export default function Preview() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { cv, loading } = useOpenCv(id)
  useLang()
  const c = useColors()
  if (loading || !cv) return <ActivityIndicator style={styles.center} color={c.accent} />
  return (
    <>
      <Stack.Screen options={{ title: templateLabel(cv.template) }} />
      <CvPreview template={cv.template} data={cv.data} fmt={cv.fmt} />
    </>
  )
}

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' } })
