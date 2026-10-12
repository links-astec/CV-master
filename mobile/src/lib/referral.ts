// Invite links, like the website's ?ref=CODE: a friend's code opened in the app (cvmaster://?ref=CODE)
// is remembered until the person creates their account, which then counts as their referral.
// The code can also be typed in on the sign-up screen.
import { useEffect } from 'react'
import * as Linking from 'expo-linking'
import * as SecureStore from 'expo-secure-store'
import { api } from '@/lib/api'

const KEY = 'cvmaster-ref'
const clean = (c: string) => c.trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40)

export async function savedReferral(): Promise<string> {
  try { return (await SecureStore.getItemAsync(KEY)) || '' } catch { return '' }
}
export function saveReferral(code: string) {
  const c = clean(code)
  if (c) SecureStore.setItemAsync(KEY, c).catch(() => {})
}
export function clearReferral() {
  SecureStore.deleteItemAsync(KEY).catch(() => {})
}

// The first name of the friend who shared the code ('' if the code isn't valid)
export async function referrerName(code: string): Promise<string> {
  const c = clean(code)
  if (!c) return ''
  try { return (await api<{ name?: string }>(`/api/referral/lookup?code=${encodeURIComponent(c)}`)).name || '' } catch { return '' }
}

// Root layout: remember a code from the link that opened the app
export function useReferralLinks() {
  const url = Linking.useLinkingURL()
  useEffect(() => {
    if (!url) return
    try {
      const { queryParams } = Linking.parse(url)
      const code = queryParams?.ref || queryParams?.referral
      if (typeof code === 'string') saveReferral(code)
    } catch {}
  }, [url])
}
