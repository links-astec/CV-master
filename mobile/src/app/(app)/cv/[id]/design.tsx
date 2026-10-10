// Layout and colour. The same 50 layouts and 12 colours as the website; switching keeps all the content.
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useOpenCv } from '@/lib/useOpenCv'
import { setTemplate } from '@/lib/editor'
import { SaveStatus } from '@/components/SaveStatus'
import { LANGS, useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import { LAYOUTS, LAYOUT_KINDS, THEMES, parseTemplate, templateId } from '@web/composables/cvRenderer.js'

type Layout = { id: string; kind: 'ats' | 'creative'; name: string; desc: string; photo?: boolean }
type Theme = { id: string; name: string; accent: string }

export default function Design() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { cv, loading } = useOpenCv(id)
  const { t } = useLang()
  const c = useColors()
  if (loading || !cv) return <ActivityIndicator style={styles.center} color={c.accent} />

  const { layout, theme } = parseTemplate(cv.template)
  const kinds: ('ats' | 'creative')[] = ['ats', 'creative']

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Stack.Screen options={{
        headerRight: () => (
          <View style={styles.headerRight}>
            <SaveStatus state={cv.save} />
            <Pressable onPress={() => router.push({ pathname: '/cv/[id]/preview', params: { id } })} hitSlop={8} accessibilityRole="button">
              <Text style={{ color: c.accent, fontSize: 15, fontWeight: '600' }}>{t('Preview')}</Text>
            </Pressable>
          </View>
        ),
      }} />

      <Pressable
        onPress={() => router.push({ pathname: '/cv/[id]/language', params: { id } })}
        accessibilityRole="button"
        style={({ pressed }) => [styles.langRow, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
        <Text style={{ flex: 1, color: c.text, fontSize: 15.5, fontWeight: '600' }}>{t('CV language')}</Text>
        <Text style={{ color: c.text3, fontSize: 14 }}>{LANGS.find(l => l.code === cv.data.lang)?.label || 'English'}</Text>
        <Text style={{ color: c.text3, fontSize: 22, marginLeft: 6 }}>›</Text>
      </Pressable>

      <Text style={[styles.h, { color: c.text }]}>{t('Colour')}</Text>
      <View style={styles.colours}>
        {(THEMES as Theme[]).map(th => {
          const on = th.id === theme
          return (
            <Pressable
              key={th.id} onPress={() => setTemplate(templateId(layout, th.id))}
              accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={t(th.name)}
              style={[styles.colour, { borderColor: on ? c.text : 'transparent' }]}>
              <View style={[styles.dot, { backgroundColor: th.accent }]} />
            </Pressable>
          )
        })}
      </View>

      {kinds.map(k => (
        <View key={k} style={{ gap: 8 }}>
          <Text style={[styles.h, { color: c.text }]}>{t(LAYOUT_KINDS[k].name)}</Text>
          <Text style={[styles.kindDesc, { color: c.text3 }]}>{t(LAYOUT_KINDS[k].desc)}</Text>
          <View style={[styles.group, { backgroundColor: c.surface, borderColor: c.border }]}>
            {(LAYOUTS as Layout[]).filter(l => l.kind === k).map((l, i) => {
              const on = l.id === layout
              return (
                <Pressable
                  key={l.id} onPress={() => setTemplate(templateId(l.id, theme))}
                  accessibilityRole="radio" accessibilityState={{ selected: on }}
                  style={({ pressed }) => [styles.item, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }, (pressed || on) && { backgroundColor: c.accentSoft }]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.name, { color: on ? c.accent : c.text }]}>{t(l.name)}{l.photo ? `  ·  ${t('Photo')}` : ''}</Text>
                    <Text style={[styles.desc, { color: c.text3 }]}>{t(l.desc)}</Text>
                  </View>
                  {on && <Text style={{ color: c.accent, fontSize: 18 }}>✓</Text>}
                </Pressable>
              )
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { padding: 16, gap: 18, paddingBottom: 48 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  langRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  h: { fontSize: 17, fontWeight: '700' },
  kindDesc: { fontSize: 13, marginTop: -4 },
  colours: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  colour: { borderWidth: 2, borderRadius: 999, padding: 3 },
  dot: { width: 32, height: 32, borderRadius: 16 },
  group: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  name: { fontSize: 15.5, fontWeight: '600' },
  desc: { fontSize: 13, lineHeight: 18 },
})
