// Notifications, like the website's bell: newest first, unread ones highlighted, "Mark all read".
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from '@/components/icons'
import { IconBtn, LinkBtn, Txt, useTopSpace } from '@/components/kit'
import { useMarkRead, useNotifications, type Notification } from '@/lib/notifications'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

type T = (s: string, p?: Record<string, unknown>) => string
function ago(ts: number, t: T) {
  const s = Math.max(0, (Date.now() - ts) / 1000)
  if (s < 60) return t('just now')
  if (s < 3600) return t('{n} min ago', { n: Math.round(s / 60) })
  if (s < 86400) return t('{n} h ago', { n: Math.round(s / 3600) })
  return t('{n} d ago', { n: Math.round(s / 86400) })
}

// Website links → the app's screens
const APP_ROUTE: Record<string, string> = { '/settings': '/settings', '/settings#review': '/settings', '/': '/', '/editor': '/editor', '/templates': '/templates' }

export default function Notifications() {
  const { t } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const top = useTopSpace(10, { sheet: true })
  const q = useNotifications()
  const mark = useMarkRead()
  const list = q.data || []
  const unread = list.filter(n => !n.read).length

  function open(n: Notification) {
    if (!n.read) mark.one(n.id)
    const to = n.link && APP_ROUTE[n.link]
    if (to) { router.back(); setTimeout(() => router.navigate(to as never), 50) }
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.head, { paddingTop: top, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Txt w={700} size={19} style={{ flex: 1 }}>{t('Notifications')}</Txt>
        {unread > 0 && <LinkBtn title={t('Mark all read')} onPress={mark.all} />}
        <IconBtn icon={X} onPress={() => router.back()} label={t('Close')} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 30 }}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={c.accent} />}>
        {!q.isLoading && !list.length && <Txt color={c.text3} style={{ textAlign: 'center', marginTop: 40 }}>{t('No notifications yet')}</Txt>}
        {list.map(n => (
          <Pressable key={n.id} onPress={() => open(n)} accessibilityRole="button"
            style={({ pressed }) => [styles.item, { backgroundColor: n.read ? c.surface : c.accentSoft, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
            {!n.read && <View style={[styles.dot, { backgroundColor: c.accent }]} />}
            <View style={{ flex: 1, gap: 3 }}>
              <Txt w={600} size={15}>{t(n.title)}</Txt>
              <Txt size={14} color={c.text2} style={{ lineHeight: 20 }}>{t(n.body)}</Txt>
              <Txt size={12.5} color={c.text3}>{ago(n.time, t)}</Txt>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  item: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
})
