// A CV page drawn by the website's own renderer (the same code that makes the PDF), shown in a
// WebView and scaled to the phone's width. What you see here is what the PDF looks like.
// The fonts come from the app itself, so previews work offline.
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { render, PAGE_W, PAGE_H } from '@web/composables/cvRenderer.js'
import { fontCssFor } from '@/lib/cvFonts'
import { useColors } from '@/lib/theme'

type Props = { template: string; data: Record<string, unknown>; fmt?: Record<string, unknown>; zoomed?: boolean }

export function CvPreview({ template, data, fmt, zoomed }: Props) {
  const c = useColors()
  const cv = useMemo<string>(() => render(template, data, fmt || {}, { preview: true }), [template, data, fmt])
  const [fontCss, setFontCss] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fontCssFor(cv).then(css => { if (live) setFontCss(css) })
    return () => { live = false }
  }, [cv])

  const html = useMemo(() => fontCss == null ? null : `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4">
${fontCss}
<style>
  html,body{margin:0;padding:0;background:${c.canvas}}
  .stage{padding:14px 12px 110px;overflow-x:auto}
  .page{width:${PAGE_W}px;min-height:${PAGE_H}px;margin:0 auto;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12),0 10px 30px rgba(0,0,0,.12);border-radius:2px;overflow:hidden}
</style></head><body>
<div class="stage"><div class="page" id="page">${cv}</div></div>
<script>
  // Fit the 700px page to the screen width, or show it near real size (zoom) to read and pan
  function fit(){ document.getElementById('page').style.zoom = ${zoomed ? 0.9 : `Math.min(1, (window.innerWidth - 24) / ${PAGE_W})`}; }
  fit(); window.addEventListener('resize', fit);
</script>
</body></html>`, [cv, fontCss, c.canvas, zoomed])

  if (!html) return <ActivityIndicator style={styles.center} color={c.accent} />
  return (
    <View style={[styles.wrap, { backgroundColor: c.canvas }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: c.canvas }}
        setSupportMultipleWindows={false}
        // Links on the CV don't navigate away inside the preview
        onShouldStartLoadWithRequest={req => req.navigationType !== 'click'}
      />
    </View>
  )
}

const styles = StyleSheet.create({ wrap: { flex: 1 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' } })
