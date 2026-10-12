// A small, non-interactive picture of a CV, drawn by the website's renderer like the site's
// CvThumb: the 700px page scaled down to the card's width (the top of it when `height` is set,
// the whole A4 page otherwise). Used on CV cards and the welcome screens.
// Phones may enlarge text in web views (iPhone text size, Android's font size setting); that is
// switched off here, or the CV's text overflows its layout and the picture looks wrong.
import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import { WebView } from 'react-native-webview'
import { render, PAGE_W, PAGE_H } from '@web/composables/cvRenderer.js'
import { fontCssFor } from '@/lib/cvFonts'
import { useColors } from '@/lib/theme'

type Props = { template: string; data: Record<string, unknown>; fmt?: Record<string, unknown>; height?: number; radius?: number }

export function CvThumb({ template, data, fmt, height, radius = 6 }: Props) {
  const c = useColors()
  const [width, setWidth] = useState(0)
  const cv = useMemo<string>(() => render(template, data, fmt || {}, { preview: false }), [template, data, fmt])
  const [fontCss, setFontCss] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    fontCssFor(cv).then(css => { if (live) setFontCss(css) })
    return () => { live = false }
  }, [cv])

  const scale = width / PAGE_W
  const boxH = height ?? Math.round(PAGE_H * scale)
  const html = useMemo(() => (fontCss == null || !width) ? null : `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=${width}, initial-scale=1, maximum-scale=1, user-scalable=no">${fontCss}
<style>
  html,body{margin:0;padding:0;overflow:hidden;background:#fff;-webkit-text-size-adjust:100%;text-size-adjust:100%}
  .page{position:absolute;top:0;left:0;width:${PAGE_W}px;min-height:${PAGE_H}px;transform:scale(${scale});transform-origin:top left;background:#fff}
</style></head><body><div class="page">${cv}</div></body></html>`, [cv, fontCss, width, scale])

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width))}
      style={[styles.box, { height: width ? boxH : height ?? 200, borderRadius: radius, borderColor: c.border }]} pointerEvents="none">
      {html && (
        <WebView
          originWhitelist={['*']} source={{ html }} scrollEnabled={false} bounces={false} textZoom={100}
          style={{ backgroundColor: '#fff' }} androidLayerType="hardware" setSupportMultipleWindows={false}
          showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({ box: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: '#fff' } })
