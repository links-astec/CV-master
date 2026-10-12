// Design tab of the Edit CV sheet, like the website's DesignPanel: layouts as real previews
// (2 per row), colour, font, text size, spacing, links and the CV language. Same 50 layouts and
// 12 colours as the website; switching keeps all the content.
import { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import { ChevronRight } from '@/components/icons'
import { Segmented, Txt } from '@/components/kit'
import { LayoutGrid } from '@/components/LayoutGrid'
import { setFmt, setTemplate, type OpenCv } from '@/lib/editor'
import { hasCvContent, type CvFmt } from '@/lib/cv'
import { LANGS, useLang } from '@/i18n'
import { useColors } from '@/lib/theme'
import { FONTS, LAYOUTS, LAYOUT_KINDS, THEMES, getLayout, getTheme, parseTemplate, render, templateId } from '@web/composables/cvRenderer.js'
import { sampleCv } from '@web/composables/sampleCv.js'

type Layout = { id: string; kind: 'ats' | 'creative'; name: string; desc: string; photo?: boolean }
type Theme = { id: string; name: string; accent: string }
const SIZE = [{ v: 'small', l: 'Small' }, { v: 'normal', l: 'Normal' }, { v: 'large', l: 'Large' }]
const SPACING = [{ v: 'compact', l: 'Compact' }, { v: 'normal', l: 'Normal' }, { v: 'relaxed', l: 'Relaxed' }]

function Group({ title, value, children }: { title: string; value?: string; children: React.ReactNode }) {
  const c = useColors()
  return (
    <View style={{ gap: 10 }}>
      <Txt w={700} size={15}>{title}{!!value && <Txt w={500} size={14} color={c.text3}>  {value}</Txt>}</Txt>
      {children}
    </View>
  )
}

export function DesignPanel({ cv, onLanguage }: { cv: OpenCv; onLanguage: () => void }) {
  const { t, lang } = useLang()
  const c = useColors()
  const { width } = useWindowDimensions()
  const { layout, theme } = parseTemplate(cv.template)
  const data = hasCvContent(cv.data) ? cv.data : null
  const fmt = cv.fmt

  // The sheet's content is ~32px narrower than the screen
  const cardW = (Math.min(width, 700) - 32 - 12) / 2
  const grids = useMemo(() => (['ats', 'creative'] as const).map(k => {
    const list = (LAYOUTS as Layout[]).filter(l => l.kind === k)
    const d = data || sampleCv()
    return {
      kind: k,
      estimate: Math.ceil(list.length / 2) * (cardW * 990 / 700 + 40),
      items: list.map(l => ({ id: l.id, html: render(templateId(l.id, theme), d, fmt, { preview: false }), name: t(l.name) })),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [theme, data, fmt, lang, cardW])
  const pick = useCallback((id: string) => setTemplate(templateId(id, parseTemplate(cv.template).theme)), [cv.template])
  const seg = <K extends string>(key: keyof CvFmt, items: { v: K; l: string }[]) => (
    <Segmented items={items.map(o => ({ key: o.v, label: t(o.l) }))} value={(fmt[key] || 'normal') as K} onChange={v => setFmt({ [key]: v } as Partial<CvFmt>)} />
  )

  return (
    <View style={{ gap: 26 }}>
      {grids.map(g => (
        <View key={g.kind} style={{ gap: 12 }}>
          <Txt w={700} size={15}>{t(LAYOUT_KINDS[g.kind].name)} <Txt w={500} size={14} color={c.text3}>{t(g.kind === 'ats' ? 'online applications' : 'print & in person')}</Txt></Txt>
          <LayoutGrid items={g.items} selected={layout} onPick={pick} estimate={g.estimate} />
        </View>
      ))}
      <Txt size={13.5} color={c.text3} style={{ lineHeight: 20, marginTop: -12 }}>{t(getLayout(layout)?.desc || '')}</Txt>

      <Group title={t('Colour')} value={t(getTheme(theme)?.name || '')}>
        <View style={styles.colours}>
          {(THEMES as Theme[]).map(th => {
            const on = th.id === theme
            return (
              <Pressable
                key={th.id} onPress={() => setTemplate(templateId(layout, th.id))}
                accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={t(th.name)}
                style={[styles.colour, { borderColor: on ? th.accent : 'transparent' }]}>
                <View style={[styles.dot, { backgroundColor: th.accent }]} />
              </Pressable>
            )
          })}
        </View>
      </Group>

      <Group title={t('Font')}>
        <Segmented items={(FONTS as { id: string; name: string }[]).map(f => ({ key: f.id, label: f.name }))} value={fmt.fontFamily} onChange={v => setFmt({ fontFamily: v })} />
      </Group>
      <Group title={t('Text size')}>{seg('fontSize', SIZE)}</Group>
      <Group title={t('Line spacing')}>{seg('lineSpacing', SPACING)}</Group>
      <Group title={t('Section spacing')}>{seg('sectionSpacing', SPACING)}</Group>
      <Group title={t('Links')}>
        <Segmented items={[{ key: 'plain', label: t('Plain text') }, { key: 'underline', label: t('Underlined') }]}
          value={fmt.linkStyle === 'underline' ? 'underline' : 'plain'} onChange={v => setFmt({ linkStyle: v })} />
        <Segmented items={[{ key: 'short', label: t('Short labels') }, { key: 'full', label: t('Full addresses') }]}
          value={fmt.linkText === 'full' ? 'full' : 'short'} onChange={v => setFmt({ linkText: v })} />
        <Txt size={13} color={c.text3} style={{ lineHeight: 19 }}>{t('Long links show as “LinkedIn” or “Website” with short labels. Tracking junk (like ?utm_source=…) is always removed, and every link stays clickable in your PDF.')}</Txt>
      </Group>

      <Pressable
        onPress={onLanguage} accessibilityRole="button"
        style={({ pressed }) => [styles.langRow, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
        <Txt w={600} size={15.5} style={{ flex: 1 }}>{t('CV language')}</Txt>
        <Txt size={14} color={c.text3}>{LANGS.find(l => l.code === cv.data.lang)?.label || 'English'}</Txt>
        <ChevronRight size={18} color={c.text3} />
      </Pressable>
      <Txt size={13.5} color={c.text3} style={{ lineHeight: 20 }}>{t('Tip: “Compact” spacing and a smaller text size help a long CV fit on one page without shrinking it.')}</Txt>
    </View>
  )
}

const styles = StyleSheet.create({
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  colours: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  colour: { borderWidth: 2, borderRadius: 999, padding: 3 },
  dot: { width: 32, height: 32, borderRadius: 16 },
})
