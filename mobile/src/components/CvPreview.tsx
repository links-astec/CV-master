// A CV page drawn by the website's own renderer (the same code that makes the PDF), shown in a
// WebView and scaled to the phone's width. What you see here is what the PDF looks like.
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { render, PAGE_W, PAGE_H } from '@web/composables/cvRenderer.js'
import { useColors } from '@/lib/theme'

// The CV fonts. Loaded from Google Fonts for now; Phase 2 bundles them so previews work offline.
const FONTS_URL = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display&family=EB+Garamond:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Manrope:wght@400;600;700;800&family=Outfit:wght@200;300;400;500;600;700&family=Playfair+Display:wght@400;600;700;900&family=Space+Grotesk:wght@400;500;700&display=block'

type Props = { template: string; data: Record<string, unknown>; fmt?: Record<string, unknown> }

export function CvPreview({ template, data, fmt }: Props) {
  const c = useColors()
  const html = useMemo(() => {
    const cv: string = render(template, data, fmt || {}, { preview: true })
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4">
<link rel="stylesheet" href="${FONTS_URL}">
<style>
  html,body{margin:0;padding:0;background:${c.canvas}}
  .stage{padding:12px 0 32px}
  .page{width:${PAGE_W}px;min-height:${PAGE_H}px;margin:0 auto;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12),0 10px 30px rgba(0,0,0,.12);border-radius:2px;overflow:hidden;transform-origin:top left}
</style></head><body>
<div class="stage"><div class="page" id="page">${cv}</div></div>
<script>
  // Fit the 700px page to the screen width
  function fit(){
    var p = document.getElementById('page');
    var s = Math.min(1, (window.innerWidth - 24) / ${PAGE_W});
    p.style.zoom = s;
  }
  fit(); window.addEventListener('resize', fit);
</script>
</body></html>`
  }, [template, data, fmt, c.canvas])

  return (
    <View style={[styles.wrap, { backgroundColor: c.canvas }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: c.canvas }}
        setSupportMultipleWindows={false}
        // Links on the CV open nothing inside the preview
        onShouldStartLoadWithRequest={req => req.url === 'about:blank' || req.url.startsWith('data:') || req.navigationType !== 'click'}
      />
    </View>
  )
}

const styles = StyleSheet.create({ wrap: { flex: 1 } })
