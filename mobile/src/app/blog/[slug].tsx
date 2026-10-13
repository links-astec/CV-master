// One blog post, read inside the app: the website's article page made for the app (no site header),
// in the app's light or dark look. Links to other posts stay here; anything else opens in the browser.
import { useState } from 'react'
import { Share, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { WebView } from 'react-native-webview'
import * as WebBrowser from 'expo-web-browser'
import { ChevronLeft, Share2 } from '@/components/icons'
import { IconBtn, Txt, useTopSpace } from '@/components/kit'
import { articleUrl } from '@/lib/blog'
import { BRAND } from '@/brand'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { PageLoader } from '@/components/BrandLoader'

export default function Article() {
  const { slug = '' } = useLocalSearchParams<{ slug?: string }>()
  const { t } = useLang()
  const { c, dark } = useTheme()
  const top = useTopSpace(6)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(String(slug))
  const page = `${BRAND.website}/blog/${current}`
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.head, { paddingTop: top, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <IconBtn icon={ChevronLeft} onPress={() => (router.canGoBack() ? router.back() : router.replace('/blog'))} label={t('Back')} />
        <Txt w={700} size={18} style={{ flex: 1 }}>{t('Blog')}</Txt>
        <IconBtn icon={Share2} onPress={() => Share.share({ message: page, url: page })} label={t('Share')} />
      </View>
      <WebView
        source={{ uri: articleUrl(String(slug), dark) }} style={{ flex: 1, backgroundColor: c.bg }} textZoom={100}
        onLoadEnd={() => setLoading(false)} setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={req => {
          const u = req.url
          // Other posts open here (made for the app); everything else in the browser
          const m = /\/blog\/([^/?#]+)/.exec(u)
          if (m && (u.startsWith(BRAND.api) || u.startsWith(BRAND.website))) {
            if (m[1] !== current && !u.startsWith(BRAND.api)) { setCurrent(m[1]); router.setParams({ slug: m[1] }); return false }
            return u.startsWith(BRAND.api)
          }
          if (u.startsWith('http')) { WebBrowser.openBrowserAsync(u).catch(() => {}); return false }
          return true
        }}
      />
      {loading && <PageLoader style={[StyleSheet.absoluteFill, { backgroundColor: c.bg }]} />}
    </View>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
})
