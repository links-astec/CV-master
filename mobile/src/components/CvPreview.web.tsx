// Web stand-in for CvPreview (the phone app uses the WebView version). Only used to screenshot and
// check the app's screens in a browser; same page, drawn in an iframe.
import { useEffect, useMemo, useRef } from 'react'
import { View } from 'react-native'
import { render } from '@web/composables/cvRenderer.js'
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
  const frame = useRef<HTMLIFrameElement>(null)
  const cv = useMemo<string>(() => render(template, data, fmt || {}, { preview: true }), [template, data, fmt])
  const html = useMemo(() => previewDocument({ cv, fontCss: '', canvas: c.canvas, zoomed, shrink, endLabel: t('End of page 1') }), [cv, c.canvas, zoomed, shrink, t])
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return
      try { const m = JSON.parse(e.data); if (m.type === 'page') onPage?.(m) } catch {}
    }
    window.addEventListener('message', on)
    return () => window.removeEventListener('message', on)
  }, [onPage])
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <iframe ref={frame} title="cv" srcDoc={html} style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  )
}
