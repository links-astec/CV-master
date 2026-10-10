// My CVs: the same list as the website's dashboard, newest first.
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Stack, router } from 'expo-router'
import { useDrafts } from '@/lib/drafts'
import { useAuth } from '@/lib/auth'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import { templateLabel } from '../../../craftcv/src/composables/cvRenderer.js'

function ago(iso: string, t: (s: string, p?: Record<string, unknown>) => string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return t('just now')
  if (s < 3600) return t('{n} min ago', { n: Math.round(s / 60) })
  if (s < 86400) return t('{n} h ago', { n: Math.round(s / 3600) })
  return t('{n} d ago', { n: Math.round(s / 86400) })
}

export default function MyCvs() {
  const { user, signOut } = useAuth()
  const { t } = useLang()
  const c = useColors()
  const { data, isLoading, error, refetch, isRefetching } = useDrafts()

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <Stack.Screen options={{
        headerRight: () => (
          <Pressable onPress={signOut} hitSlop={10} accessibilityRole="button">
            <Text style={{ color: c.accent, fontSize: 15 }}>{t('Sign out')}</Text>
          </Pressable>
        ),
      }} />
      {isLoading ? (
        <ActivityIndicator style={styles.center} color={c.accent} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: c.text2, textAlign: 'center', marginBottom: 12 }}>{error.message}</Text>
          <Pressable onPress={() => refetch()}><Text style={{ color: c.accent, fontWeight: '600' }}>{t('Try again')}</Text></Pressable>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={d => d.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={c.accent} />}
          ListHeaderComponent={<Text style={[styles.hello, { color: c.text2 }]}>{user?.email}</Text>}
          ListEmptyComponent={<Text style={[styles.empty, { color: c.text2 }]}>{t('Your saved CVs will appear here.')}</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/cv/[id]', params: { id: item.id } })}
              accessibilityRole="button"
              style={({ pressed }) => [styles.card, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
              <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title || t('Untitled CV')}</Text>
              <Text style={[styles.cardMeta, { color: c.text3 }]} numberOfLines={1}>
                {templateLabel(item.template)} · {ago(item.updatedAt, t)}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  list: { padding: 16, gap: 10 },
  hello: { fontSize: 13, marginBottom: 4 },
  empty: { textAlign: 'center', marginTop: 48, fontSize: 15 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardMeta: { fontSize: 13 },
})
