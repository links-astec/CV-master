// The app's frame, like the website's mobile layout: the top bar (menu, page title, language,
// dark mode), the bottom tab bar with the big "+" in the middle, and the slide-in menu.
import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { router, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import type { ComponentProps } from 'react'
import type { Tabs } from 'expo-router'
import { Bell, BookOpen, Check, ChevronDown, FileText, Globe, LayoutGrid, Menu as MenuIcon, Moon, PenLine, Plus, Settings, Sun, X } from '@/components/icons'
import { BRAND } from '@/brand'
import { LANGS, useLang } from '@/i18n'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { useTheme } from '@/lib/theme'
import { Btn, IconBtn, Txt } from '@/components/kit'
import { Logo } from '@/components/Logo'
import { useNotifications } from '@/lib/notifications'
import { useTourTarget } from '@/lib/tourTargets'

// ── Language pill + picker ───────────────────────────────────────────────────
export function LangPill() {
  const { c } = useTheme()
  const { lang, setLang, t } = useLang()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const choose = (code: string) => {
    setOpen(false)
    setLang(code)
    if (user) api('/api/auth/settings', { method: 'PATCH', body: { uiLang: code } }).catch(() => {})
  }
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={t('Language')}
        style={({ pressed }) => [styles.pill, { borderColor: c.border, backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 }]}>
        <Globe size={17} color={c.text} strokeWidth={1.8} />
        <Txt w={600} size={14}>{LANGS.find(l => l.code === lang)?.short}</Txt>
        <ChevronDown size={14} color={c.text3} strokeWidth={2} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: c.overlay }]} onPress={() => setOpen(false)}>
          <View style={[styles.langSheet, { backgroundColor: c.surface, borderColor: c.border }]}>
            {LANGS.map(l => (
              <Pressable key={l.code} onPress={() => choose(l.code)} style={({ pressed }) => [styles.langRow, pressed && { backgroundColor: c.surface2 }]} accessibilityRole="button">
                <Txt w={l.code === lang ? 700 : 500} size={16} color={l.code === lang ? c.accent : c.text} style={{ flex: 1 }}>{l.label}</Txt>
                {l.code === lang && <Check size={18} color={c.accent} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

// ── Top bar ──────────────────────────────────────────────────────────────────
export function TopBar({ title }: { title: string }) {
  const { c, dark, toggleDark } = useTheme()
  const { t } = useLang()
  const insets = useSafeAreaInsets()
  const [menu, setMenu] = useState(false)
  return (
    <View style={[styles.top, { paddingTop: insets.top + 6, backgroundColor: c.surface, borderBottomColor: c.border }]}>
      <IconBtn icon={MenuIcon} onPress={() => setMenu(true)} label={t('Menu')} />
      <Txt w={600} size={18} style={{ flex: 1, marginLeft: 10 }} numberOfLines={1}>{title}</Txt>
      <LangPill />
      <BellBtn />
      <IconBtn icon={dark ? Sun : Moon} onPress={toggleDark} label={t(dark ? 'Light mode' : 'Dark mode')} />
      <SideMenu open={menu} onClose={() => setMenu(false)} />
    </View>
  )
}

// Notifications bell with the unread count, like the website's
function BellBtn() {
  const { c } = useTheme()
  const { t } = useLang()
  const unread = (useNotifications().data || []).filter(n => !n.read).length
  return (
    <View>
      <IconBtn icon={Bell} onPress={() => router.push('/notifications')} label={t('Notifications')} />
      {unread > 0 && (
        <View pointerEvents="none" style={[styles.badge, { backgroundColor: c.danger, borderColor: c.surface }]}>
          <Txt w={700} size={10.5} color="#fff" style={{ lineHeight: 14 }}>{unread > 9 ? '9+' : unread}</Txt>
        </View>
      )}
    </View>
  )
}

// ── Slide-in menu ────────────────────────────────────────────────────────────
const NAV = [
  { href: '/', label: 'My CVs', icon: LayoutGrid },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/editor', label: 'Editor', icon: PenLine },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

function SideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { c } = useTheme()
  const { t, lang } = useLang()
  const { user } = useAuth()
  const path = usePathname()
  const insets = useSafeAreaInsets()
  const go = (href: string) => { onClose(); router.navigate(href as never) }
  const web = (p: string) => { onClose(); WebBrowser.openBrowserAsync(`${BRAND.website}${p}?lang=${lang}`) }
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={[styles.menu, { backgroundColor: c.surface, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.menuHead}>
            <Logo size={30} />
            <View style={{ flex: 1 }} />
            <IconBtn icon={X} onPress={onClose} label={t('Close')} />
          </View>
          <Btn title={t('New CV')} icon={Plus} onPress={() => go('/new')} full />
          <ScrollView style={{ flex: 1, marginTop: 12 }} contentContainerStyle={{ gap: 4 }}>
            {NAV.map(n => {
              const on = n.href === '/' ? path === '/' : path.startsWith(n.href)
              const Icon = n.icon
              return (
                <Pressable key={n.href} onPress={() => go(n.href)} accessibilityRole="button"
                  style={({ pressed }) => [styles.navItem, (on || pressed) && { backgroundColor: c.accentSoft }]}>
                  <Icon size={21} color={on ? c.accent : c.text2} strokeWidth={1.8} />
                  <Txt w={on ? 600 : 500} size={16} color={on ? c.accent : c.text}>{t(n.label)}</Txt>
                </Pressable>
              )
            })}
            <Pressable onPress={() => go('/blog')} accessibilityRole="button"
              style={({ pressed }) => [styles.navItem, (path.startsWith('/blog') || pressed) && { backgroundColor: c.accentSoft }]}>
              <BookOpen size={21} color={path.startsWith('/blog') ? c.accent : c.text2} strokeWidth={1.8} />
              <Txt w={path.startsWith('/blog') ? 600 : 500} size={16} color={path.startsWith('/blog') ? c.accent : c.text}>{t('Blog')}</Txt>
            </Pressable>
          </ScrollView>
          {!!user && (
            <View style={styles.menuUser}>
              <View style={[styles.avatar, { backgroundColor: c.accentSoft }]}><Txt w={700} size={16} color={c.accent}>{(user.name || user.email || '?')[0].toUpperCase()}</Txt></View>
              <View style={{ flex: 1 }}>
                <Txt w={600} size={15} numberOfLines={1}>{user.name}</Txt>
                <Txt size={13} color={c.text3} numberOfLines={1}>{user.email}</Txt>
              </View>
            </View>
          )}
          <View style={styles.menuLinks}>
            <Txt size={13.5} color={c.text3} onPress={() => go('/feedback')}>{t('Feedback')}</Txt>
            <Txt size={13.5} color={c.text3}>·</Txt>
            <Txt size={13.5} color={c.text3} onPress={() => web('/privacy')}>{t('Privacy')}</Txt>
            <Txt size={13.5} color={c.text3}>·</Txt>
            <Txt size={13.5} color={c.text3} onPress={() => web('/terms')}>{t('Terms')}</Txt>
          </View>
        </View>
        <Pressable style={{ flex: 1, backgroundColor: c.overlay }} onPress={onClose} accessibilityLabel={t('Close')} />
      </View>
    </Modal>
  )
}

// ── Bottom tab bar ───────────────────────────────────────────────────────────
// Expo Router bundles its navigator, so the tab bar's props come from its Tabs component
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0]
const TABS: Record<string, { label: string; icon: typeof LayoutGrid }> = {
  index: { label: 'My CVs', icon: LayoutGrid },
  templates: { label: 'Templates', icon: FileText },
  editor: { label: 'Editor', icon: PenLine },
  settings: { label: 'Settings', icon: Settings },
}

// The tour points at the tabs and the "+" button (the website's data-tour="nav-…" / "new-cv")
const TOUR_KEY: Record<string, string> = { index: 'nav-home', templates: 'nav-templates', editor: 'nav-editor', settings: 'nav-settings' }
function TabButton({ name, on, onPress }: { name: string; on: boolean; onPress: () => void }) {
  const { c } = useTheme()
  const { t } = useLang()
  const target = useTourTarget(TOUR_KEY[name])
  const { label, icon: Icon } = TABS[name]
  return (
    <Pressable ref={target} collapsable={false} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: on }} style={styles.tab}>
      <Icon size={24} color={on ? c.accent : c.text3} strokeWidth={1.7} />
      <Txt w={on ? 600 : 500} size={12} color={on ? c.accent : c.text3}>{t(label)}</Txt>
    </Pressable>
  )
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { c, dark } = useTheme()
  const { t } = useLang()
  const insets = useSafeAreaInsets()
  const plusTarget = useTourTarget('new-cv')
  const tab = (name: string) => state.routes.some(r => r.name === name)
    ? <TabButton key={name} name={name} on={state.routes[state.index]?.name === name} onPress={() => navigation.navigate(name)} />
    : null
  return (
    <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: dark ? c.surface : 'rgba(255,255,255,0.97)', borderTopColor: c.border }]}>
      {tab('index')}
      {tab('templates')}
      <Pressable onPress={() => router.push('/new')} accessibilityRole="button" accessibilityLabel={t('New CV')} style={styles.plusWrap}>
        {({ pressed }) => (
          <View ref={plusTarget} collapsable={false} style={[styles.plus, { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1, shadowColor: c.accent }]}>
            <Plus size={26} color="#fff" strokeWidth={2.2} />
          </View>
        )}
      </Pressable>
      {tab('editor')}
      {tab('settings')}
    </View>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 2 },
  backdrop: { flex: 1, justifyContent: 'center', padding: 32 },
  langSheet: { borderWidth: 1, borderRadius: 16, paddingVertical: 6, overflow: 'hidden' },
  langRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  menu: { width: '78%', maxWidth: 340, paddingHorizontal: 14, gap: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 },
  menuHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingHorizontal: 4 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12 },
  menuUser: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, paddingVertical: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 1, right: 0, minWidth: 17, height: 17, borderRadius: 9, borderWidth: 1.5, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center' },
  menuLinks: { flexDirection: 'row', gap: 8, justifyContent: 'center', paddingTop: 10 },
  tabs: { flexDirection: 'row', alignItems: 'flex-end', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingBottom: 2 },
  plusWrap: { flex: 1, alignItems: 'center' },
  plus: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: -18, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
})
