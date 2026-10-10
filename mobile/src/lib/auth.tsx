// Who is signed in. On launch the app asks the server (/api/auth/me) with the saved session
// cookie; signing in or creating an account sets that cookie, signing out clears it.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, ApiError, type User } from '@/lib/api'
import { hasExplicitChoice, lang, setLang } from '@/i18n'

type AuthState = {
  user: User | null
  ready: boolean
  signIn: (email: string, password: string) => Promise<void>
  register: (p: { name: string; email: string; password: string; newsletter: boolean }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  deleteAccount: (confirm: { password?: string; confirmEmail?: string }) => Promise<void>
  signOut: () => Promise<void>
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

  const signedIn = useCallback((u: User) => { qc.clear(); setUser(u); applyAccountLang(u) }, [qc])

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: u } = await api<{ user: User }>('/api/auth/login', { body: { email: email.trim(), password } })
    signedIn(u)
  }, [signedIn])

  const register = useCallback(async (p: { name: string; email: string; password: string; newsletter: boolean }) => {
    const { user: u } = await api<{ user: User }>('/api/auth/register', { body: { name: p.name.trim(), email: p.email.trim(), password: p.password, newsletter: p.newsletter } })
    // New accounts start in the language the app is showing
    api('/api/auth/settings', { method: 'PATCH', body: { uiLang: lang.value } }).catch(() => {})
    signedIn(u)
  }, [signedIn])

  const forgotPassword = useCallback(async (email: string) => {
    await api('/api/auth/forgot-password', { body: { email: email.trim() } })
  }, [])

  const signOut = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    qc.clear()
    setUser(null)
  }, [qc])

  const deleteAccount = useCallback(async (confirm: { password?: string; confirmEmail?: string }) => {
    await api('/api/auth/delete-account', { body: confirm })
    qc.clear()
    setUser(null)
  }, [qc])

  const value = useMemo(() => ({ user, ready, signIn, register, forgotPassword, deleteAccount, signOut }),
    [user, ready, signIn, register, forgotPassword, deleteAccount, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { ApiError }
