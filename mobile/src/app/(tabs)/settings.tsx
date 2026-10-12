// Settings, the same as the website's: account (name, password, email confirmation, sign out),
// invite friends, AI requests, AI personalisation, preferences (language, dark mode, newsletter,
// quick tour), the review, help and feedback, and deleting the account. Everything is saved to the
// account, so it is the same on the website.
import { useEffect, useState } from 'react'
import { Linking, Modal, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import * as Clipboard from 'expo-clipboard'
import Constants from 'expo-constants'
import { Check, ChevronDown, ChevronRight } from '@/components/icons'
import { LangPill, TopBar } from '@/components/shell'
import { Btn, Card, Field, LinkBtn, PageTitle, SettingRow, Toggle, Txt } from '@/components/kit'
import { ReviewPrompt } from '@/components/ReviewPrompt'
import { confirm, toast } from '@/components/dialogs'
import { useAuth } from '@/lib/auth'
import { api, type User } from '@/lib/api'
import { useQuota } from '@/lib/quota'
import { errorText } from '@/lib/ai'
import { startTour } from '@/lib/onboarding'
import { disablePush, enablePush, pushPreference, pushSupported } from '@/lib/push'
import { track } from '@/lib/track'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'
import { BRAND } from '@/brand'
import { INDUSTRIES, GOALS, LEVELS } from '@web/composables/profileOptions.js'

type Referral = { code: string; credits: number; count: number; rewarded: number; welcomeAi: number; link: string }
type Option = { id: string; label: string; years?: string }

// A setting chosen from a list (the website's <select>)
function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (id: string) => void }) {
  const { t } = useLang()
  const { c } = useTheme()
  const [open, setOpen] = useState(false)
  const cur = options.find(o => o.id === value)
  const text = (o: Option) => t(o.label) + (o.years ? ` (${t(o.years)})` : '')
  return (
    <View style={{ gap: 7 }}>
      <Txt w={500} size={14}>{label}</Txt>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" style={[styles.select, { borderColor: c.border, backgroundColor: c.surface }]}>
        <Txt size={15.5} color={cur ? c.text : c.text3} style={{ flex: 1 }}>{cur ? text(cur) : '—'}</Txt>
        <ChevronDown size={17} color={c.text3} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: c.overlay }]} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: c.surface, borderColor: c.border }]}>
            <ScrollView>
              {options.map(o => (
                <Pressable key={o.id} onPress={() => { setOpen(false); onChange(o.id) }} style={({ pressed }) => [styles.option, pressed && { backgroundColor: c.surface2 }]}>
                  <Txt w={o.id === value ? 700 : 500} size={16} color={o.id === value ? c.accent : c.text} style={{ flex: 1 }}>{text(o)}</Txt>
                  {o.id === value && <Check size={18} color={c.accent} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

export default function Settings() {
  const { user, signOut, deleteAccount, patchUser } = useAuth()
  const { t, lang } = useLang()
  const { c, dark, toggleDark } = useTheme()
  const qc = useQueryClient()
  const quota = useQuota()
  const referral = useQuery({ queryKey: ['referral'], queryFn: () => api<Referral>('/api/referral/info') })
  const newsletter = useQuery({ queryKey: ['newsletter'], queryFn: () => api<{ status: string }>('/api/newsletter/me').then(r => r.status) })
  const hasPassword = user?.hasPassword ?? user?.provider !== 'google'

  // ── Account ──
  const [name, setName] = useState(user?.name || '')
  const [changingPw, setChangingPw] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [resent, setResent] = useState(false)
  const dirty = (!!name.trim() && name.trim() !== user?.name) || !!newPw

  async function saveProfile() {
    setSaveError('')
    if (newPw && newPw.length < 8) { setSaveError(t('Password must be at least 8 characters.')); return }
    setSaving(true)
    try {
      const body: Record<string, string> = {}
      if (name.trim() && name.trim() !== user?.name) body.name = name.trim()
      if (newPw) { body.password = newPw; body.currentPassword = currentPw }
      const r = await api<{ user?: User }>('/api/auth/settings', { method: 'PATCH', body })
      patchUser({ name: r.user?.name || body.name || user?.name, ...(newPw ? { hasPassword: true } : {}) })
      setNewPw(''); setCurrentPw(''); setChangingPw(false)
      toast(t('Saved'))
    } catch (e) { setSaveError(errorText(e)) }
    setSaving(false)
  }
  async function resend() {
    try { await api('/api/auth/resend-verification', { method: 'POST' }); setResent(true); toast(t('Confirmation email sent. Check your inbox.')) } catch (e) { toast(errorText(e)) }
  }
  async function askSignOut() {
    if (await confirm({ title: t('Sign out?'), ok: t('Sign out') })) signOut()
  }

  // ── AI personalisation ──
  async function saveAi(change: Partial<User>) {
    patchUser(change)
    try {
      const r = await api<{ user?: User }>('/api/auth/settings', { method: 'PATCH', body: change })
      if (r.user) patchUser({ aiPersonalize: r.user.aiPersonalize, industry: r.user.industry, goal: r.user.goal, experience: r.user.experience })
      toast(t('Saved'))
    } catch (e) { toast(errorText(e)) }
  }

  // ── Push notifications (this phone) ──
  const [push, setPush] = useState(false)
  useEffect(() => { pushPreference().then(p => setPush(p === 'on')) }, [])
  async function togglePush(on: boolean) {
    setPush(on)
    if (on) {
      const ok = await enablePush().catch(() => false)
      setPush(ok)
      if (!ok) toast(t('Notifications are off for CVMaster in your phone’s settings. Turn them on there first.'))
    } else await disablePush()
  }

  // ── Personalise with my activity (turning it off deletes what was kept) ──
  async function setPersonal(on: boolean) {
    patchUser({ personalizeActivity: on })
    try { await api('/api/auth/settings', { method: 'PATCH', body: { personalizeActivity: on } }); toast(t('Saved')) }
    catch (e) { patchUser({ personalizeActivity: !on }); toast(errorText(e)) }
  }

  // ── Newsletter ──
  async function setNewsletter(on: boolean) {
    try {
      const d = await api<{ status: string }>('/api/newsletter/me', { method: 'PUT', body: { subscribed: on } })
      qc.setQueryData(['newsletter'], d.status)
      toast(t(d.status === 'subscribed' ? 'Subscribed to the newsletter' : d.status === 'pending' ? 'Confirm your email to start the newsletter' : 'Unsubscribed'))
    } catch (e) { toast(errorText(e)) }
  }

  // ── Invite friends ──
  const r = referral.data
  const shareMsg = () => t('I’ve been using CVMaster to build my CV. It tailors it to the job and checks it against ATS. Sign up with my link and get {n} extra AI requests: {link}', { n: r?.welcomeAi || 25, link: r?.link || '' })
  const open = (url: string) => Linking.openURL(url).catch(() => toast(t('Something went wrong. Please try again.')))
  async function copyLink() { if (r?.link) { await Clipboard.setStringAsync(r.link); track('invite_shared', { channel: 'copy' }); toast(t('Copied ✓')) } }

  // ── Delete account ──
  const [deleting, setDeleting] = useState(false)
  const [delConfirm, setDelConfirm] = useState('')
  const [delBusy, setDelBusy] = useState(false)
  const [delError, setDelError] = useState('')
  async function doDelete() {
    if (!delConfirm || delBusy) return
    const ok = await confirm({ title: t('Delete account'), message: t('Deletes your account and every CV in it, on the website and in the app. This cannot be undone.'), ok: t('Delete my account'), danger: true })
    if (!ok) return
    setDelBusy(true); setDelError('')
    try {
      await deleteAccount(hasPassword ? { password: delConfirm } : { confirmEmail: delConfirm })
      toast(t('Your account has been deleted.'))
    } catch (e) { setDelError(errorText(e)); setDelBusy(false) }
  }

  const web = (p: string) => () => WebBrowser.openBrowserAsync(`${BRAND.website}${p}?lang=${lang}`)
  const q = quota.data
  const nl = newsletter.data

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title={t('Settings')} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <PageTitle title={t('Settings')} />

        {/* Account */}
        <Card>
          <View style={[styles.acct, { borderBottomColor: c.border }]}>
            <View style={[styles.avatar, { backgroundColor: c.accent }]}><Txt w={700} size={20} color="#fff">{(user?.name || user?.email || '?')[0].toUpperCase()}</Txt></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt w={700} size={17} numberOfLines={1}>{user?.name}</Txt>
              <Txt size={13.5} color={c.text3} numberOfLines={1}>{user?.email}</Txt>
              {user?.emailVerified === false
                ? <Txt size={13} color={c.amber}>{t('not confirmed')}, <Txt size={13} w={600} color={c.accent} onPress={resend}>{t(resent ? 'Sent ✓' : 'resend link')}</Txt></Txt>
                : <Txt size={13} color={c.green}>{t('confirmed')}</Txt>}
              <Btn title={t('Sign out')} kind="secondary" size="sm" onPress={askSignOut} style={{ marginTop: 8 }} />
            </View>
          </View>
          <Field label={t('Display name')} value={name} onChangeText={setName} autoComplete="name" />
          <View style={{ gap: 8 }}>
            <Txt w={500} size={14}>{t('Password')}</Txt>
            {!changingPw ? <LinkBtn title={t('Change password')} onPress={() => setChangingPw(true)} /> : (
              <>
                {hasPassword && <Field value={currentPw} onChangeText={setCurrentPw} secureTextEntry placeholder={t('Current password')} autoComplete="current-password" textContentType="password" />}
                <Field value={newPw} onChangeText={setNewPw} secureTextEntry placeholder={t('New password (8+ characters)')} autoComplete="new-password" textContentType="newPassword" />
              </>
            )}
          </View>
          {!!saveError && <Txt size={13.5} color={c.danger}>{saveError}</Txt>}
          <Btn title={t(saving ? 'Saving…' : 'Save changes')} disabled={!dirty} busy={saving} onPress={saveProfile} style={{ alignSelf: 'flex-end' }} />
        </Card>

        {/* Invite friends */}
        <Card>
          <Txt w={700} size={17}>{t('Invite friends')}</Txt>
          <Txt size={14.5} color={c.text2} style={{ lineHeight: 21 }}>{t('They get {n} extra AI requests when they join. When a friend gets their first clean CV, you get a free CV.', { n: r?.welcomeAi || 25 })}</Txt>
          {referral.isLoading ? <Txt color={c.text3}>{t('Loading…')}</Txt> : r ? (
            <>
              <View style={styles.stats}>
                {[[r.count, t('joined')], [r.rewarded ?? 0, t('got their CV')], [r.credits, t(r.credits === 1 ? 'free CV to use' : 'free CVs to use')]].map(([n, l], k) => (
                  <View key={k} style={[styles.stat, { backgroundColor: k === 2 ? c.accentSoft : c.bg }]}>
                    <Txt w={800} size={22} color={k === 2 ? c.accent : c.text}>{String(n)}</Txt>
                    <Txt size={12.5} color={c.text3}>{String(l)}</Txt>
                  </View>
                ))}
              </View>
              {r.credits > 0 && <Txt size={13} color={c.green}>{t('Use a free CV at export. Choose “Use a referral credit”.')}</Txt>}
              <View style={[styles.link, { borderColor: c.border, backgroundColor: c.bg }]}>
                <Txt size={13.5} color={c.text2} numberOfLines={1} selectable style={{ flex: 1 }}>{r.link}</Txt>
              </View>
              <View style={styles.row}>
                <Btn title={t('Copy link')} size="sm" onPress={copyLink} />
                <Btn title={t('Share')} kind="secondary" size="sm" onPress={() => { track('invite_shared', { channel: 'share' }); Share.share({ message: shareMsg() }) }} />
              </View>
              <View style={styles.shareRow}>
                <Txt size={13} color={c.text3}>{t('Share on')}</Txt>
                {[
                  ['WhatsApp', `https://wa.me/?text=${encodeURIComponent(shareMsg())}`],
                  ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(r.link)}`],
                  ['X', `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg())}`],
                  [t('Email'), `mailto:?subject=${encodeURIComponent(t('Try CVMaster for your CV'))}&body=${encodeURIComponent(shareMsg())}`],
                ].map(([label, url]) => (
                  <Pressable key={label} onPress={() => { track('invite_shared', { channel: label === 'X' ? 'x' : label.toLowerCase() }); open(url) }} style={[styles.sharePill, { borderColor: c.border, backgroundColor: c.surface }]}>
                    <Txt w={600} size={13} color={c.text2}>{label}</Txt>
                  </Pressable>
                ))}
              </View>
            </>
          ) : <Txt color={c.text3}>{t('Couldn’t load your invite link, try refreshing.')}</Txt>}
        </Card>

        {/* AI requests */}
        <Card>
          <Txt w={700} size={17}>{t('AI requests')}</Txt>
          <Txt size={14.5} color={c.text2} style={{ lineHeight: 21 }}>{t(q?.tier === 'verified' ? '30 free every day, reset at midnight (UTC). Extra requests never expire.' : '5 free a day. 30 once your email is confirmed. Reset at midnight (UTC). Extra requests never expire.')}</Txt>
          {q && (
            <>
              <View style={[styles.meter, { backgroundColor: c.border }]}><View style={{ width: `${Math.min(100, (q.freeLeft / Math.max(1, q.limit)) * 100)}%`, height: '100%', backgroundColor: c.accent, borderRadius: 99 }} /></View>
              <Txt size={13.5} color={c.text2}>{t('{n} of {limit} free left today', { n: q.freeLeft, limit: q.limit })}{q.credits ? ` · ${t('{n} extra', { n: q.credits })}` : ''}</Txt>
            </>
          )}
          <Btn title={t('Get 100 more for €0.50')} kind="secondary" size="sm" onPress={() => router.push('/ai-limit')} />
        </Card>

        {/* AI personalisation */}
        <Card>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt w={700} size={17}>{t('AI personalisation')}</Txt>
              <Txt size={14} color={c.text2} style={{ lineHeight: 20 }}>{t('For CVs in your own name, the AI uses these answers and your other CVs to tailor its suggestions. CVs you make for someone else never use them.')}</Txt>
            </View>
            <Toggle value={user?.aiPersonalize !== false} onChange={v => saveAi({ aiPersonalize: v })} label={t('AI personalisation')} />
          </View>
          {user?.aiPersonalize !== false && (
            <>
              <SelectRow label={t('Your field')} value={user?.industry || ''} options={INDUSTRIES as Option[]} onChange={v => saveAi({ industry: v })} />
              <SelectRow label={t('What are you aiming for?')} value={user?.goal || ''} options={GOALS as Option[]} onChange={v => saveAi({ goal: v })} />
              <SelectRow label={t('Experience')} value={user?.experience || ''} options={LEVELS as Option[]} onChange={v => saveAi({ experience: v })} />
            </>
          )}
        </Card>

        {/* Preferences */}
        <Card style={{ gap: 0 }}>
          <Txt w={700} size={17} style={{ marginBottom: 4 }}>{t('Preferences')}</Txt>
          <SettingRow first title={t('Language')} desc={t('The language of CVMaster itself. Your CV’s language is set in the editor.')} right={<LangPill />} />
          <SettingRow title={t('Dark mode')} desc={t('Easier on the eyes at night')} right={<Toggle value={dark} onChange={toggleDark} label={t('Dark mode')} />} />
          <SettingRow
            title={t('Email newsletter')}
            desc={t(nl === 'pending' ? 'Starts once you confirm your email address' : 'CV tips and CVMaster news. A couple of emails a month at most')}
            right={<Toggle value={nl === 'subscribed' || nl === 'pending'} onChange={setNewsletter} label={t('Email newsletter')} />} />
          {pushSupported() && (
            <SettingRow title={t('Push notifications')} desc={t('A free CV earned with your link, reminders about where you left off, and news. At most a few a month.')}
              right={<Toggle value={push} onChange={togglePush} label={t('Push notifications')} />} />
          )}
          <SettingRow title={t('Personalise with my activity')} desc={t('Suggests your next step and reminds you where you left off, from what you do in CVMaster. Kept on our servers only, never shared. Turning it off deletes it.')}
            right={<Toggle value={user?.personalizeActivity !== false} onChange={setPersonal} label={t('Personalise with my activity')} />} />
          <SettingRow title={t('Quick tour')} desc={t('A one-minute walkthrough of building, tailoring and exporting')} right={<Btn title={t('Start tour')} kind="secondary" size="sm" onPress={startTour} />} />
        </Card>

        {/* Review (only for people who have made a CV) */}
        <ReviewCard />

        {/* Help */}
        <Card style={{ gap: 8 }}>
          <Txt w={700} size={17} style={{ marginBottom: 4 }}>{t('Help & feedback')}</Txt>
          {[
            [t('Send feedback'), t('Ideas or something that isn’t working'), () => router.push({ pathname: '/feedback', params: { kind: 'suggestion' } })],
            [t('Make a complaint'), t('We reply to every complaint'), () => router.push({ pathname: '/feedback', params: { kind: 'complaint' } })],
            [t('Privacy policy'), t('What we collect and why'), web('/privacy')],
            [t('Terms of service'), t('Payments, refunds and complaints'), web('/terms')],
          ].map(([title, desc, onPress]) => (
            <Pressable key={title as string} onPress={onPress as () => void} accessibilityRole="button"
              style={({ pressed }) => [styles.help, { borderColor: c.border, backgroundColor: pressed ? c.surface2 : c.surface }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt w={600} size={15}>{title as string}</Txt>
                <Txt size={13} color={c.text3}>{desc as string}</Txt>
              </View>
              <ChevronRight size={18} color={c.text3} />
            </Pressable>
          ))}
        </Card>

        {/* Delete account */}
        <Card>
          <Txt w={700} size={17}>{t('Delete account')}</Txt>
          <Txt size={14} color={c.text2} style={{ lineHeight: 20 }}>{t('Deletes your account and every CV in it, on the website and in the app. This cannot be undone.')}</Txt>
          {!deleting ? <Btn title={t('Delete account')} kind="secondary" size="sm" onPress={() => setDeleting(true)} /> : (
            <>
              {hasPassword
                ? <Field value={delConfirm} onChangeText={setDelConfirm} secureTextEntry placeholder={t('Current password')} autoComplete="current-password" />
                : <Field value={delConfirm} onChangeText={setDelConfirm} autoCapitalize="none" keyboardType="email-address" placeholder={t('Type your email address to confirm.')} />}
              {!!delError && <Txt size={13.5} color={c.danger}>{delError}</Txt>}
              <View style={styles.row}>
                <Btn title={t(delBusy ? 'Deleting…' : 'Delete my account')} kind="danger" busy={delBusy} disabled={!delConfirm} onPress={doDelete} />
                <Btn title={t('Cancel')} kind="ghost" onPress={() => { setDeleting(false); setDelConfirm(''); setDelError('') }} />
              </View>
            </>
          )}
        </Card>

        <Txt size={12.5} color={c.text3} style={{ textAlign: 'center' }}>{BRAND.name} {Constants.expoConfig?.version}</Txt>
      </ScrollView>
    </View>
  )
}

function ReviewCard() {
  const [shown, setShown] = useState(false)
  return (
    <View style={{ display: shown ? 'flex' : 'none' }}>
      <Card><ReviewPrompt onShown={() => setShown(true)} /></Card>
    </View>
  )
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 22, gap: 16, paddingBottom: 48 },
  acct: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderRadius: 12, padding: 12, gap: 2 },
  link: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  shareRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  sharePill: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  meter: { height: 8, borderRadius: 99, overflow: 'hidden' },
  select: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  backdrop: { flex: 1, justifyContent: 'center', padding: 28 },
  sheet: { borderWidth: 1, borderRadius: 16, paddingVertical: 6, maxHeight: '70%' },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  help: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 14 },
})
