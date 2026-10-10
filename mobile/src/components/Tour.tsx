// The quick tour, from the website (TutorialOverlay.vue), with the same wording. Each step moves to
// the screen it talks about, the app's version of the site's spotlight.
import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Check, Download, FileText, LayoutGrid, PenLine, Plus, type LucideIcon } from '@/components/icons'
import { Btn, Txt } from '@/components/kit'
import { endTour, useTourOpen } from '@/lib/onboarding'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

type Step = { title: string; desc: string; tip?: string; icon: LucideIcon; go?: string }
const STEPS: Step[] = [
  { title: 'Welcome to CVMaster', desc: 'A one-minute tour of building, tailoring and exporting your CV. You can restart it any time from Settings.', icon: FileText, go: '/' },
  { title: 'My CVs', desc: 'All your CVs live here. Open one to edit it, download it, or email it again once it is paid for.', icon: LayoutGrid, go: '/' },
  { title: 'Start a new CV', desc: 'Fill it in step by step, tell your story and let AI structure it, or import an existing PDF or Word CV.', icon: Plus },
  { title: 'Templates', desc: '50 layouts in 12 colours: ATS-friendly ones for online applications, creative ones for print and in person. When you pick one you can paste the job offer you are applying for.', tip: 'Switch layout or colour at any time. Your content moves with you.', icon: FileText, go: '/templates' },
  { title: 'The editor', desc: 'Tap “Edit CV” to change the content and watch the page update. The Job match tab tailors your CV to the job offer and gives you an ATS score.', tip: 'A red line shows where page one ends. You can trim, or shrink the CV to fit.', icon: PenLine, go: '/editor' },
  { title: 'Export', desc: 'Use “Export PDF” in the editor: €0.99 per CV gets you the clean PDF by email and as a download, re-sendable free after edits. From My CVs you can also download a free copy with a watermark.', icon: Download },
  { title: 'You’re ready', desc: 'Pick a layout to get started. Good luck with your applications!', icon: Check, go: '/' },
]

export function Tour() {
  const open = useTourOpen()
  const { t } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const [i, setI] = useState(0)
  const close = () => { endTour(); setI(0) }
  const step = STEPS[i]
  useEffect(() => { if (open && step.go) router.navigate(step.go as never) }, [open, i, step.go])
  const last = i === STEPS.length - 1
  const Icon = step.icon
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={[styles.wrap, { backgroundColor: 'rgba(20,20,43,0.35)', paddingBottom: insets.bottom + 90 }]}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]} accessibilityLiveRegion="polite">
          <View style={styles.dots}>
            {STEPS.map((_, k) => <View key={k} style={[styles.dot, { backgroundColor: k <= i ? c.accent : c.border, width: k === i ? 18 : 6 }]} />)}
            <View style={{ flex: 1 }} />
            <Pressable onPress={close} hitSlop={10} accessibilityRole="button"><Txt w={600} size={13.5} color={c.text3}>{t('Skip tour')}</Txt></Pressable>
          </View>
          <View style={[styles.icon, { backgroundColor: c.accentSoft }]}><Icon size={22} color={c.accent} strokeWidth={2} /></View>
          <Txt w={700} size={19}>{t(step.title)}</Txt>
          <Txt size={15} color={c.text2} style={{ lineHeight: 22 }}>{t(step.desc)}</Txt>
          {!!step.tip && (
            <View style={[styles.tip, { backgroundColor: c.surface2, borderColor: c.border }]}>
              <Txt size={13.5} color={c.text2} style={{ lineHeight: 19 }}>{t(step.tip)}</Txt>
            </View>
          )}
          <View style={styles.actions}>
            {i > 0 && <Btn title={t('Back')} kind="secondary" size="sm" onPress={() => setI(i - 1)} />}
            <View style={{ flex: 1 }} />
            <Btn title={t(last ? 'Done!' : 'Next')} size="sm" onPress={() => (last ? close() : setI(i + 1))} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 16 },
  card: { borderWidth: 1, borderRadius: 20, padding: 20, gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 24, elevation: 12 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tip: { borderWidth: 1, borderRadius: 10, padding: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
})
