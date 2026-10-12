// A blog post's card (Blog screen, and "From the blog" on My CVs)
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { Txt } from '@/components/kit'
import { CATEGORY_LABEL, type Post } from '@/lib/blog'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

export function PostCard({ p, compact }: { p: Post; compact?: boolean }) {
  const { t, locale } = useLang()
  const { c } = useTheme()
  return (
    <Pressable onPress={() => router.push({ pathname: '/blog/[slug]', params: { slug: p.slug } })} accessibilityRole="button"
      style={({ pressed }) => [styles.card, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.9 : 1 }, compact && { width: 260 }]}>
      {p.cover ? <Image source={{ uri: p.cover }} style={styles.cover} contentFit="cover" transition={150} />
        : <View style={[styles.cover, { backgroundColor: c.accentSoft }]} />}
      <View style={styles.body}>
        <Txt w={800} size={11} color={c.accent} style={{ letterSpacing: 0.8, textTransform: 'uppercase' }}>{t(CATEGORY_LABEL[p.category])}</Txt>
        <Txt w={700} size={compact ? 16 : 18} numberOfLines={compact ? 2 : 3} style={{ lineHeight: compact ? 21 : 24 }}>{p.title}</Txt>
        {!compact && !!p.excerpt && <Txt size={14.5} color={c.text2} numberOfLines={3} style={{ lineHeight: 21 }}>{p.excerpt}</Txt>}
        <Txt size={12.5} color={c.text3}>
          {new Date(p.publishedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
          {p.category !== 'link' ? ` · ${t('{n} min read', { n: p.readingMin })}` : p.sourceName ? ` · ${p.sourceName}` : ''}
        </Txt>
      </View>
    </Pressable>
  )
}


const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  cover: { width: '100%', aspectRatio: 16 / 9 },
  body: { padding: 16, gap: 6 },
})
