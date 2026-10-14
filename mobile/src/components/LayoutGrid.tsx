// Real previews of layouts, 2 per row, like the website's layout pickers on a phone. One WebView
// draws the whole grid (much lighter than a WebView per layout) and grows to its content's
// height, so it sits inside the screen's normal scrolling.
import { useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import { fontCssFor } from '@/lib/cvFonts'
import { gridDocument, type GridItem } from '@/lib/previewHtml'
import { stayOnPage } from '@/lib/webGuard'
import { useTheme } from '@/lib/theme'
import { BrandLoader } from '@/components/BrandLoader'

type Props = { items: GridItem[]; selected: string; onPick: (id: string) => void; estimate: number }

export function LayoutGrid({ items, selected, onPick, estimate }: Props) {
  const { c } = useTheme()
  const web = useRef<WebView>(null)
  const [height, setHeight] = useState(estimate)
  const [fontCss, setFontCss] = useState<string | null>(null)
  const all = useMemo(() => items.map(i => i.html).join(''), [items])
  useEffect(() => {
    let live = true
    fontCssFor(all).then(css => { if (live) setFontCss(css) })
    return () => { live = false }
  }, [all])

  // The selection at the time the grid was built; later changes go in without a reload
  const [first] = useState(selected)
  const colors = useMemo(() => ({ bg: c.bg, text: c.text, text2: c.text2, border: c.border, accent: c.accent, ring: c.accent + '40', surface: c.surface }), [c])
  const html = useMemo(() => fontCss == null ? null : gridDocument({ items, selected: first, fontCss, colors }), [items, fontCss, colors, first])
  useEffect(() => { web.current?.injectJavaScript(`select(${JSON.stringify(selected)});true;`) }, [selected, html])

  function onMessage(e: WebViewMessageEvent) {
    try {
      const m = JSON.parse(e.nativeEvent.data)
      if (m.type === 'height' && m.h > 0) setHeight(Math.ceil(m.h))
      if (m.type === 'pick') onPick(String(m.id))
    } catch {}
  }

  return (
    <View style={{ height }}>
      {html ? (
        <WebView
          ref={web} originWhitelist={['*']} source={{ html }} onMessage={onMessage}
          scrollEnabled={false} bounces={false} setSupportMultipleWindows={false} textZoom={100}
          onShouldStartLoadWithRequest={req => stayOnPage(req)}
          showsVerticalScrollIndicator={false} style={{ backgroundColor: c.bg }}
        />
      ) : <BrandLoader size={40} style={{ marginTop: 40 }} />}
    </View>
  )
}
