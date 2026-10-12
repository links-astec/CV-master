// Web stand-in for LayoutGrid (the phone app uses the WebView version). Only used to screenshot and
// check the app's screens in a browser; same grid, drawn in an iframe.
import { useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { gridDocument, type GridItem } from '@/lib/previewHtml'
import { useTheme } from '@/lib/theme'

type Props = { items: GridItem[]; selected: string; onPick: (id: string) => void; estimate: number }

export function LayoutGrid({ items, selected, onPick, estimate }: Props) {
  const { c } = useTheme()
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(estimate)
  const [first] = useState(selected)
  const colors = useMemo(() => ({ bg: c.bg, text: c.text, text2: c.text2, border: c.border, accent: c.accent, ring: c.accent + '40', surface: c.surface }), [c])
  const html = useMemo(() => gridDocument({ items, selected: first, fontCss: '', colors }), [items, colors, first])
  useEffect(() => { frame.current?.contentWindow?.postMessage(JSON.stringify({ select: selected }), '*') }, [selected])
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return
      try {
        const m = JSON.parse(e.data)
        if (m.type === 'height' && m.h > 0) setHeight(Math.ceil(m.h))
        if (m.type === 'pick') onPick(String(m.id))
      } catch {}
    }
    window.addEventListener('message', on)
    return () => window.removeEventListener('message', on)
  }, [onPick])
  return (
    <View style={{ height }}>
      <iframe ref={frame} title="layouts" srcDoc={html} style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  )
}
