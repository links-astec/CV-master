// A small, non-interactive picture of a CV (the top of the page), drawn by the website's renderer
// like the site's CvThumb: used on CV cards and in the template gallery.
import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import { WebView } from 'react-native-webview'
import { render, PAGE_W } from '@web/composables/cvRenderer.js'
import { fontCssFor } from '@/lib/cvFonts'
import { useColors } from '@/lib/theme'

type Props = { template: string; data: Record<string, unknown>; fmt?: Record<string, unknown>; height: number; radius?: number }

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

  const html = useMemo(() => (fontCss == null || !width) ? null : `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=${width}, initial-scale=1, user-scalable=no">${fontCss}
<style>html,body{margin:0;padding:0;overflow:hidden;background:#fff}.page{width:${PAGE_W}px;zoom:${width / PAGE_W}}</style>
</head><body><div class="page">${cv}</div></body></html>`, [cv, fontCss, width])

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width))}
      style={[styles.box, { height, borderRadius: radius, backgroundColor: '#fff', borderColor: c.border }]} pointerEvents="none">
      {html && (
        <WebView
          originWhitelist={['*']} source={{ html }} scrollEnabled={false} bounces={false}
          style={{ backgroundColor: '#fff' }} androidLayerType="hardware" setSupportMultipleWindows={false}
          showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({ box: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, alignSelf: 'stretch' } })
