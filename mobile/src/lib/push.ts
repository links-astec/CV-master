// Push notifications: the same messages as the bell (a free CV earned with your invite link,
// reminders about where you left off, news), sent by the server through Expo. After sign-in the
// app asks once (with its own explanation first), then registers this phone's push token with
// the server. Settings can turn them off; signing out removes the phone.
// They need the app's own build and an EAS project id (`eas init`); Expo Go can't receive them.
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'
import { api } from '@/lib/api'
import { track } from '@/lib/track'

const PREF = 'cvmaster-push'          // 'on' | 'off' (the user's choice on this phone)
const ASKED = 'cvmaster-push-asked'   // our own explanation was shown once
const TOKEN = 'cvmaster-push-token'

if (Platform.OS !== 'web') {
  // Shown even while the app is open (like the bell updating)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  })
}

const projectId = () => Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || ''
export const pushSupported = () => Platform.OS !== 'web' && Device.isDevice && !!projectId()

export async function pushPreference(): Promise<'on' | 'off' | null> {
  try { const v = await SecureStore.getItemAsync(PREF); return v === 'on' || v === 'off' ? v : null } catch { return null }
}
export async function wasAsked() {
  try { return (await SecureStore.getItemAsync(ASKED)) === '1' } catch { return true }
}
export const markAsked = () => SecureStore.setItemAsync(ASKED, '1').catch(() => {})

// Ask the phone's permission (if needed) and register. → true when pushes are on.
export async function enablePush(): Promise<boolean> {
  if (!pushSupported()) return false
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', { name: 'CVMaster', importance: Notifications.AndroidImportance.DEFAULT }).catch(() => {})
  }
  let { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status
  if (status !== 'granted') { await SecureStore.setItemAsync(PREF, 'off').catch(() => {}); return false }
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: projectId() })
  await api('/api/push/register', { body: { token, platform: Platform.OS } })
  await SecureStore.setItemAsync(TOKEN, token).catch(() => {})
  await SecureStore.setItemAsync(PREF, 'on').catch(() => {})
  return true
}

// Turn off on this phone (Settings), or forget the phone (signing out)
export async function disablePush({ remember = true } = {}) {
  try {
    const token = await SecureStore.getItemAsync(TOKEN)
    if (token) await api('/api/push/unregister', { body: { token } }).catch(() => {})
    await SecureStore.deleteItemAsync(TOKEN)
    if (remember) await SecureStore.setItemAsync(PREF, 'off')
  } catch {}
}

// Already allowed: register again on each launch (the token can change, or the account)
export async function refreshPush() {
  if (!pushSupported() || (await pushPreference()) !== 'on') return
  const { status } = await Notifications.getPermissionsAsync()
  if (status === 'granted') await enablePush().catch(() => {})
}

// Website links in a notification → the app's screens
const ROUTES: Record<string, string> = { '/': '/', '/settings': '/settings', '/settings#review': '/settings', '/editor': '/editor', '/templates': '/templates' }

// Root layout: open the right screen when a notification is tapped
export function usePushTaps(signedIn: boolean) {
  const last = Notifications.useLastNotificationResponse()
  useEffect(() => {
    if (!signedIn || !last || Platform.OS === 'web') return
    const data = (last.notification.request.content.data || {}) as { link?: string; type?: string }
    track('notification_open', { type: data.type || '' })
    const to = data.link ? ROUTES[data.link] : null
    if (to) setTimeout(() => router.navigate(to as never), 300)
    Notifications.clearLastNotificationResponse()
  }, [last, signedIn])
}
