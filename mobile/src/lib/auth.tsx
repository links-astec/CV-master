// Who is signed in. On launch the app asks the server (/api/auth/me) with the saved session
// cookie; signing in or creating an account sets that cookie, signing out clears it.
// The app needs an account: signed out, the root layout shows the welcome screens.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AppState } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { api, ApiError, type User } from '@/lib/api'
import { hasExplicitChoice, lang, setLang } from '@/i18n'
import { closeEditor } from '@/lib/editor'
import { clearReferral } from '@/lib/referral'

type AuthState = {
  user: User | null
  ready: boolean
  signIn: (email: string, password: string) => Promise<void>
  register: (p: { name: string; email: string; password: string; newsletter: boolean; referredBy?: string }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  deleteAccount: (confirm: { password?: string; confirmEmail?: string }) => Promise<void>
  signOut: () => Promise<void>
  markOnboarded: () => void
  patchUser: (p: Partial<User>) => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

// Like the website: the account's language applies unless this phone has its own choice
function applyAccountLang(u: User | null) {
  if (u?.uiLang && !hasExplicitChoice()) setLang(u.uiLang, { explicit: false })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api<User>('/api/auth/me')
      .then(u => { setUser(u); applyAccountLang(u) })
      .catch(() => setUser(null))
      .finally(() => setReady(true))
  }, [])

  const signedOut = useCallback(() => {
    closeEditor()
    qc.clear()
    setUser(null)
  }, [qc])

  // Reload the account, e.g. back in the app after confirming the email in the browser.
  // An account deleted on the website (or signed out everywhere) signs the app out too.
  const refresh = useCallback(async () => {
    try { setUser(await api<User>('/api/auth/me')) } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 404)) signedOut()
    }
  }, [signedOut])

  useEffect(() => {
    if (!user) return
    const sub = AppState.addEventListener('change', s => { if (s === 'active') refresh() })
    return () => sub.remove()
  }, [user, refresh])

  const signedIn = useCallback((u: User) => {
    qc.clear()
    setUser(u)
    applyAccountLang(u)
  }, [qc])

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: u } = await api<{ user: User }>('/api/auth/login', { body: { email: email.trim(), password } })
    signedIn(u)
  }, [signedIn])

  const register = useCallback(async (p: { name: string; email: string; password: string; newsletter: boolean; referredBy?: string }) => {
    const { user: u } = await api<{ user: User }>('/api/auth/register', {
      body: { name: p.name.trim(), email: p.email.trim(), password: p.password, newsletter: p.newsletter, referredBy: p.referredBy || undefined },
    })
    clearReferral()
    // New accounts start in the language the app is showing
    api('/api/auth/settings', { method: 'PATCH', body: { uiLang: lang.value } }).catch(() => {})
    signedIn({ ...u, uiLang: lang.value })
  }, [signedIn])

  const forgotPassword = useCallback(async (email: string) => {
    await api('/api/auth/forgot-password', { body: { email: email.trim() } })
  }, [])

  const signOut = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    signedOut()
  }, [signedOut])

  const deleteAccount = useCallback(async (confirm: { password?: string; confirmEmail?: string }) => {
    await api('/api/auth/delete-account', { body: confirm })
    signedOut()
  }, [signedOut])

  const markOnboarded = useCallback(() => setUser(u => (u ? { ...u, onboarded: true } : u)), [])
  const patchUser = useCallback((p: Partial<User>) => setUser(u => (u ? { ...u, ...p } : u)), [])

  const value = useMemo(() => ({ user, ready, signIn, register, forgotPassword, deleteAccount, signOut, markOnboarded, patchUser, refresh }),
    [user, ready, signIn, register, forgotPassword, deleteAccount, signOut, markOnboarded, patchUser, refresh])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { ApiError }
