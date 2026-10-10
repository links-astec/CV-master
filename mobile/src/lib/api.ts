// Talks to the same server as the website (api.cvmaster.live). Signed-in requests use the
// session cookie the server sets at sign-in; the phone's networking keeps it like a browser.
// Server error messages are English keys, translated with the website's dictionaries.
import { BRAND } from '@/brand'
import { t } from '@/i18n'

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
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined,
    })
  } catch {
    throw new ApiError(t('Connection error. Please try again.'), 0)
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(t(json?.error || 'Something went wrong. Please try again.'), res.status, json?.code)
  return json as T
}

export type User = {
  id: string; email: string; name: string; plan: string; onboarded: boolean
  avatar?: string | null; provider?: string; uiLang?: string | null; emailVerified?: boolean
}

export type Draft = {
  id: string; title: string; template: string; data: Record<string, any>
  createdAt: string; updatedAt: string
}
