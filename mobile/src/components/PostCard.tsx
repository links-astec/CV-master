// A blog post's card (Blog screen, and "From the blog" on My CVs). `featured` is the big one at
// the top of the Blog screen, like the website's blog.
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { Txt } from '@/components/kit'
import { Mark } from '@/components/Logo'
import { CATEGORY_LABEL, type Post } from '@/lib/blog'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

function Byline({ p }: { p: Post }) {
  const { t, locale } = useLang()
  const { c } = useTheme()
  const author = p.author || 'CVMaster team'
  const team = /cvmaster/i.test(author)
  return (
    <View style={styles.by}>
      {team ? <Mark size={30} /> : (
        <View style={[styles.av, { backgroundColor: c.accentSoft }]}>
          <Txt w={800} size={12} color={c.accent}>{author.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()}</Txt>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Txt w={700} size={13}>{author}</Txt>
        <Txt size={12.5} color={c.text3}>
          {new Date(p.publishedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
          {p.category !== 'link' ? ` · ${t('{n} min read', { n: p.readingMin })}` : p.sourceName ? ` · ${p.sourceName}` : ''}
        </Txt>
      </View>
    </View>
  )
}

export function PostCard({ p, compact, featured }: { p: Post; compact?: boolean; featured?: boolean }) {
  const { t } = useLang()
  const { c } = useTheme()
  return (
    <Pressable onPress={() => router.push({ pathname: '/blog/[slug]', params: { slug: p.slug } })} accessibilityRole="button"
      style={({ pressed }) => [styles.card, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.9 : 1 }, compact && { width: 260 }]}>
      {p.cover ? <Image source={{ uri: p.cover }} style={styles.cover} contentFit="cover" transition={150} />
        : <View style={[styles.cover, styles.ph, { backgroundColor: c.accentSoft }]}><View style={{ opacity: 0.4 }}><Mark size={48} /></View></View>}
      <View style={[styles.body, featured && { padding: 18, gap: 8 }]}>
        <Txt w={700} size={13} color={c.accent}>{t(CATEGORY_LABEL[p.category])}</Txt>
        <Txt w={800} size={featured ? 23 : compact ? 16 : 18} numberOfLines={featured ? 4 : compact ? 2 : 3}
          style={{ lineHeight: featured ? 29 : compact ? 21 : 24, letterSpacing: featured ? -0.4 : 0 }}>{p.title}</Txt>
        {!compact && !!p.excerpt && <Txt size={featured ? 15.5 : 14.5} color={c.text2} numberOfLines={3} style={{ lineHeight: featured ? 23 : 21 }}>{p.excerpt}</Txt>}
        {compact ? (
          <Txt size={12.5} color={c.text3}>{p.category !== 'link' ? t('{n} min read', { n: p.readingMin }) : p.sourceName || ''}</Txt>
        ) : <Byline p={p} />}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  cover: { width: '100%', aspectRatio: 16 / 9 },
  ph: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 6 },
  by: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  av: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
})
