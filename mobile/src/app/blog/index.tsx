// The blog, like www.cvmaster.live/blog: all posts or one kind (articles, product updates, news,
// links shared from elsewhere), newest first, in the app's language when translated.
import { useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft } from '@/components/icons'
import { Chip, IconBtn, Txt, useTopSpace } from '@/components/kit'
import { CATEGORY_LABEL, usePosts } from '@/lib/blog'
import { PostCard } from '@/components/PostCard'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

export default function Blog() {
  const { t, lang } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const top = useTopSpace(6)
  const [cat, setCat] = useState<string | null>(null)
  const q = usePosts(lang, cat)
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.head, { paddingTop: top, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <IconBtn icon={ChevronLeft} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} label={t('Back')} />
        <Txt w={700} size={18}>{t('Blog')}</Txt>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 30 }}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={c.accent} />}>
        <Txt size={15} color={c.text2} style={{ lineHeight: 22 }}>{t('CV advice, job-hunting tips and what’s new in CVMaster.')}</Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('All')} on={!cat} onPress={() => setCat(null)} />
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => <Chip key={k} label={t(v)} on={cat === k} onPress={() => setCat(k)} />)}
        </ScrollView>
        {q.isLoading ? <ActivityIndicator color={c.accent} style={{ marginTop: 30 }} />
          : !q.data?.length ? <Txt color={c.text3} style={{ textAlign: 'center', marginTop: 30 }}>{t('No posts here yet.')}</Txt>
          : q.data.map(p => <PostCard key={p.slug} p={p} />)}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
})
