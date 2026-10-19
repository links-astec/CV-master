// Talks to the same server as the website (api.cvmaster.live). Signed-in requests use the
// session cookie the server sets at sign-in; the phone's networking keeps it like a browser.
// Server error messages are English keys, translated with the website's dictionaries.
import { BRAND } from '@/brand'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import { t } from '@/i18n'

// Which app is calling (the server notes it with the user's activity; the website sends nothing)
export const CLIENT_HEADERS: Record<string, string> = { 'X-CVMaster-Client': Platform.OS }

// A request was refused because today's free AI is used up: show the AI requests screen (once)
let limitShownAt = 0
export function showAiLimit() {
  if (Date.now() - limitShownAt < 3000) return
  limitShownAt = Date.now()
  router.push({ pathname: '/ai-limit', params: { reason: 'limit' } })
}

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(BRAND.api + path, {
      method: init.method || (init.body ? 'POST' : 'GET'),
      credentials: 'include',
      headers: init.body ? { 'Content-Type': 'application/json', ...CLIENT_HEADERS } : CLIENT_HEADERS,
      body: init.body ? JSON.stringify(init.body) : undefined,
    })
  } catch {
    throw new ApiError(t('Connection error. Please try again.'), 0)
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (json?.code === 'AI_LIMIT') showAiLimit()
    throw new ApiError(t(json?.error || 'Something went wrong. Please try again.'), res.status, json?.code)
  }
  return json as T
}

export type User = {
  id: string; email: string; name: string; plan: string; onboarded: boolean
  avatar?: string | null; provider?: string; uiLang?: string | null; emailVerified?: boolean
  hasPassword?: boolean; personalizeActivity?: boolean; aiPersonalize?: boolean; industry?: string | null; goal?: string | null; experience?: string | null
  // Job Hunt Pass (bought on the website): every CV unlocked, 100 AI requests a day
  pass?: { until: string; cancelAtEnd: boolean; plan?: 'month' | 'quarter' } | null
}

export type Draft = {
  id: string; title: string; template: string; data: Record<string, any>
  createdAt: string; updatedAt: string
}
