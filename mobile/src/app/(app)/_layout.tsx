import { Stack } from 'expo-router'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

export default function AppLayout() {
  const { t } = useLang()
  const c = useColors()
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.accent,
        headerTitleStyle: { color: c.text, fontWeight: '600' },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: c.bg },
      }}>
      <Stack.Screen name="index" options={{ title: t('My CVs') }} />
      <Stack.Screen name="cv/[id]/index" options={{ title: '' }} />
      <Stack.Screen name="cv/[id]/section/[section]" options={{ title: '' }} />
      <Stack.Screen name="cv/[id]/design" options={{ title: t('Design') }} />
      <Stack.Screen name="cv/[id]/preview" options={{ title: '' }} />
      <Stack.Screen name="cv/[id]/job" options={{ title: '' }} />
      <Stack.Screen name="cv/[id]/check" options={{ title: '' }} />
      <Stack.Screen name="cv/[id]/language" options={{ title: '' }} />
      <Stack.Screen name="new" options={{ title: '' }} />
      <Stack.Screen name="story" options={{ title: '' }} />
      <Stack.Screen name="settings" options={{ title: '' }} />
    </Stack>
  )
}
