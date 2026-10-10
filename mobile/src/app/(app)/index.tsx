// My CVs: the same list as the website's dashboard, newest first.
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Stack, router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { useDrafts } from '@/lib/drafts'
import { api, type Draft } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import { templateLabel } from '@web/composables/cvRenderer.js'

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
  const qc = useQueryClient()
  const { data, isLoading, error, refetch, isRefetching } = useDrafts()

  function askDelete(d: Draft) {
    Alert.alert(t('Delete this CV?'), t('It will be permanently deleted from your account.'), [
      { text: t('Keep it'), style: 'cancel' },
      {
        text: t('Delete'), style: 'destructive',
        onPress: async () => {
          try {
            await api(`/api/drafts/${d.id}`, { method: 'DELETE' })
            qc.setQueryData<Draft[]>(['drafts'], list => (list || []).filter(x => x.id !== d.id))
          } catch { Alert.alert(t('Could not delete this CV.')) }
        },
      },
    ])
  }

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <Stack.Screen options={{
        headerRight: () => (
          <Pressable onPress={() => router.push('/new')} hitSlop={10} accessibilityRole="button">
            <Text style={{ color: c.accent, fontSize: 15, fontWeight: '600' }}>{t('New CV')}</Text>
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
          ListEmptyComponent={<Text style={[styles.empty, { color: c.text2 }]}>{t('Your saved CVs will appear here.')}</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/cv/[id]', params: { id: item.id } })}
              onLongPress={() => askDelete(item)}
              accessibilityRole="button"
              accessibilityHint={t('Delete this CV?')}
              style={({ pressed }) => [styles.card, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
              <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title || t('Untitled CV')}</Text>
              <Text style={[styles.cardMeta, { color: c.text3 }]} numberOfLines={1}>
                {templateLabel(item.template)} · {ago(item.updatedAt, t)}
              </Text>
            </Pressable>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={{ color: c.text3, fontSize: 13 }}>{user?.email}</Text>
              <Pressable onPress={signOut} hitSlop={8} accessibilityRole="button">
                <Text style={{ color: c.accent, fontSize: 14, fontWeight: '600' }}>{t('Sign out')}</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  list: { padding: 16, gap: 10 },
  empty: { textAlign: 'center', marginTop: 48, fontSize: 15 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardMeta: { fontSize: 13 },
  footer: { marginTop: 24, alignItems: 'center', gap: 8 },
})
