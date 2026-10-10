// Web stand-in for CvThumb (the phone app uses the WebView version). Only used to screenshot and
// check the app's screens in a browser; same renderer output, drawn in an iframe.
import { useMemo, useState } from 'react'
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import { render, PAGE_W } from '@web/composables/cvRenderer.js'
import { useColors } from '@/lib/theme'

type Props = { template: string; data: Record<string, unknown>; fmt?: Record<string, unknown>; height: number; radius?: number }

export function CvThumb({ template, data, fmt, height, radius = 6 }: Props) {
  const c = useColors()
  const [width, setWidth] = useState(0)
  const cv = useMemo<string>(() => render(template, data, fmt || {}, { preview: false }), [template, data, fmt])
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden;background:#fff}.page{width:${PAGE_W}px;zoom:${width / PAGE_W}}</style></head><body><div class="page">${cv}</div></body></html>`
  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width))}
      style={[styles.box, { height, borderRadius: radius, borderColor: c.border }]} pointerEvents="none">
      {width > 0 && <iframe title="cv" srcDoc={html} style={{ border: 0, width: '100%', height: '100%' }} />}
    </View>
  )
}

const styles = StyleSheet.create({ box: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: '#fff' } })
