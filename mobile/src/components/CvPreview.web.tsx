// Web stand-in for CvPreview (the phone app uses the WebView version). Only used to screenshot and
// check the app's screens in a browser; same renderer output, drawn in an iframe.
import { useMemo } from 'react'
import { View } from 'react-native'
import { render, PAGE_W, PAGE_H } from '@web/composables/cvRenderer.js'
import { useColors } from '@/lib/theme'

type Props = { template: string; data: Record<string, unknown>; fmt?: Record<string, unknown>; zoomed?: boolean }

export function CvPreview({ template, data, fmt, zoomed }: Props) {
  const c = useColors()
  const cv = useMemo<string>(() => render(template, data, fmt || {}, { preview: true }), [template, data, fmt])
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:${c.canvas}}.stage{padding:14px 12px 110px;overflow-x:auto}
.page{width:${PAGE_W}px;min-height:${PAGE_H}px;margin:0 auto;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12),0 10px 30px rgba(0,0,0,.12)}
</style></head><body><div class="stage"><div class="page" id="page">${cv}</div></div>
<script>function fit(){document.getElementById('page').style.zoom=${zoomed ? 0.9 : `Math.min(1,(window.innerWidth-24)/${PAGE_W})`}}fit();addEventListener('resize',fit)</script></body></html>`
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <iframe title="cv" srcDoc={html} style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  )
}
