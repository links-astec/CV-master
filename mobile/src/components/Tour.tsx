// The quick tour, from the website (TutorialOverlay.vue), with the same steps and wording. Like the
// site's spotlight, each step dims the screen except the part it talks about (a tab, the "+"
// button, Export PDF) and puts its card next to it. Steps move to the screen they talk about.
import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Check, Download, FileText, LayoutGrid, PenLine, Plus, Users, type LucideIcon } from '@/components/icons'
import { Btn, Txt } from '@/components/kit'
import { endTour, useTourOpen } from '@/lib/onboarding'
import { measureTarget, type Rect } from '@/lib/tourTargets'
import { track } from '@/lib/track'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

type Step = { title: string; desc: string; tip?: string; icon: LucideIcon; go?: string; target?: string }
const STEPS: Step[] = [
  { title: 'Welcome to CVMaster', desc: 'A one-minute tour of building, tailoring and exporting your CV. You can restart it any time from Settings.', icon: FileText, go: '/' },
  { title: 'My CVs', desc: 'All your CVs live here. Open one to edit it, download it, or email it again once it is paid for.', icon: LayoutGrid, go: '/', target: 'nav-home' },
  { title: 'Start a new CV', desc: 'Fill it in step by step, tell your story and let AI structure it, or import an existing PDF or Word CV.', icon: Plus, target: 'new-cv' },
  { title: 'Templates', desc: '50 layouts in 12 colours: ATS-friendly ones for online applications, creative ones for print and in person. When you pick one you can paste the job offer you are applying for.', tip: 'Switch layout or colour at any time. Your content moves with you.', icon: FileText, go: '/templates', target: 'nav-templates' },
  { title: 'The editor', desc: 'Tap “Edit CV” to change the content and watch the page update. The Job match tab tailors your CV to the job offer and gives you an ATS score.', tip: 'A red line shows where page one ends. You can trim, or shrink the CV to fit.', icon: PenLine, go: '/editor', target: 'nav-editor' },
  { title: 'Export', desc: 'Use “Export PDF” in the editor: €0.99 per CV gets you the clean PDF by email and as a download, re-sendable free after edits. From My CVs you can also download a free copy with a watermark.', icon: Download, go: '/editor', target: 'export' },
  { title: 'Referral credits', desc: 'Share your link from Settings. When a friend you invite gets their first clean CV, you earn a credit that unlocks the clean PDF of one CV.', icon: Users, go: '/settings', target: 'nav-settings' },
  { title: 'You’re ready', desc: 'Pick a layout to get started. Good luck with your applications!', icon: Check, go: '/' },
]
const PAD = 6

export function Tour() {
  const open = useTourOpen()
  const { t } = useLang()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const { width: W, height: H } = useWindowDimensions()
  const [i, setI] = useState(0)
  const [hole, setHole] = useState<Rect | null>(null)
  const [cardH, setCardH] = useState(0)
  const close = () => { endTour(); setI(0); setHole(null) }
  const step = STEPS[i]

  // Go to the step's screen, then find its target once that screen has drawn
  useEffect(() => {
    if (!open) return
    if (step.go) router.navigate(step.go as never)
    let live = true
    const find = (tries: number) => {
      if (!step.target) { setHole(null); return }
      measureTarget(step.target).then(r => {
        if (!live) return
        if (r) setHole({ x: r.x - PAD, y: r.y - PAD, w: r.w + PAD * 2, h: r.h + PAD * 2 })
        else if (tries > 0) setTimeout(() => find(tries - 1), 120)
        else setHole(null)
      })
    }
    const timer = setTimeout(() => find(8), step.go ? 260 : 60)
    return () => { live = false; clearTimeout(timer) }
  }, [open, i, step.go, step.target])

  const last = i === STEPS.length - 1
  const Icon = step.icon
  const dim = 'rgba(12,12,30,0.62)'
  // Card above a target in the lower half of the screen, below one in the upper half
  const below = hole ? hole.y + hole.h / 2 < H / 2 : false
  const cardTop = !hole ? Math.max(insets.top + 16, (H - cardH) / 2)
    : below ? Math.min(hole.y + hole.h + 14, H - cardH - insets.bottom - 12)
    : Math.max(insets.top + 12, hole.y - cardH - 14)

  return (
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <View style={StyleSheet.absoluteFill}>
        {hole ? (
          <>
            <View style={[styles.dim, { backgroundColor: dim, left: 0, top: 0, width: W, height: Math.max(0, hole.y) }]} />
            <View style={[styles.dim, { backgroundColor: dim, left: 0, top: hole.y + hole.h, width: W, bottom: 0 }]} />
            <View style={[styles.dim, { backgroundColor: dim, left: 0, top: hole.y, width: Math.max(0, hole.x), height: hole.h }]} />
            <View style={[styles.dim, { backgroundColor: dim, left: hole.x + hole.w, top: hole.y, right: 0, height: hole.h }]} />
            <View pointerEvents="none" style={[styles.ring, { left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderColor: c.accent }]} />
          </>
        ) : <View style={[StyleSheet.absoluteFill, { backgroundColor: dim }]} />}

        <View
          onLayout={e => setCardH(e.nativeEvent.layout.height)}
          style={[styles.card, { top: cardTop, backgroundColor: c.surface, borderColor: c.border }]} accessibilityLiveRegion="polite">
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
            <Btn title={t(last ? 'Done!' : 'Next')} size="sm" onPress={() => { if (last) { track('tour_done'); close() } else setI(i + 1) }} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  dim: { position: 'absolute' },
  ring: { position: 'absolute', borderWidth: 2.5, borderRadius: 14 },
  card: { position: 'absolute', left: 16, right: 16, borderWidth: 1, borderRadius: 20, padding: 20, gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 24, elevation: 12 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tip: { borderWidth: 1, borderRadius: 10, padding: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
})
