// A CV page drawn by the website's own renderer (the same code that makes the PDF), shown in a
// WebView and scaled to the phone's width. What you see here is what the PDF looks like,
// including the one-page check: `onPage` reports whether the CV is longer than one page.
// The fonts come from the app itself, so previews work offline.
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import { render } from '@web/composables/cvRenderer.js'
import { fontCssFor } from '@/lib/cvFonts'
import { previewDocument, type PageInfo } from '@/lib/previewHtml'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

type Props = {
  template: string; data: Record<string, unknown>; fmt?: Record<string, unknown>
  zoomed?: boolean; shrink?: boolean; onPage?: (p: PageInfo) => void
}

export function CvPreview({ template, data, fmt, zoomed = false, shrink = false, onPage }: Props) {
  const c = useColors()
  const { t } = useLang()
  const cv = useMemo<string>(() => render(template, data, fmt || {}, { preview: true }), [template, data, fmt])
  const [fontCss, setFontCss] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fontCssFor(cv).then(css => { if (live) setFontCss(css) })
    return () => { live = false }
  }, [cv])

  const endLabel = t('End of page 1')
  const html = useMemo(() => fontCss == null ? null : previewDocument({ cv, fontCss, canvas: c.canvas, zoomed, shrink, endLabel }),
    [cv, fontCss, c.canvas, zoomed, shrink, endLabel])

  function onMessage(e: WebViewMessageEvent) {
    try {
      const m = JSON.parse(e.nativeEvent.data)
      if (m.type === 'page') onPage?.({ overflow: !!m.overflow, overBy: Number(m.overBy) || 0, zoom: Number(m.zoom) || 1 })
    } catch {}
  }

  if (!html) return <ActivityIndicator style={styles.center} color={c.accent} />
  return (
    <View style={[styles.wrap, { backgroundColor: c.canvas }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: c.canvas }}
        setSupportMultipleWindows={false}
        onMessage={onMessage}
        // Links on the CV don't navigate away inside the preview
        onShouldStartLoadWithRequest={req => req.navigationType !== 'click'}
      />
    </View>
  )
}

const styles = StyleSheet.create({ wrap: { flex: 1 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' } })
