// Who is signed in. On launch the app asks the server (/api/auth/me) with the saved session
// cookie; signing in or creating an account sets that cookie, signing out clears it.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, ApiError, type User } from '@/lib/api'
import { hasExplicitChoice, lang, setLang } from '@/i18n'
import { clearGuest, guestHasContent, readGuest } from '@/lib/guest'
import { createDraft } from '@/lib/start'
import { closeEditor, setCurrentCv } from '@/lib/editor'

type AuthState = {
  user: User | null
  ready: boolean
  signIn: (email: string, password: string) => Promise<void>
  register: (p: { name: string; email: string; password: string; newsletter: boolean }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  deleteAccount: (confirm: { password?: string; confirmEmail?: string }) => Promise<void>
  signOut: () => Promise<void>
  markOnboarded: () => void
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

  // Signed in: the CV built as a guest moves into the account ("The CV you built comes with you")
  const signedIn = useCallback(async (u: User) => {
    try {
      const g = await readGuest()
      if (g && guestHasContent(g)) {
        const d = await createDraft(g.data, g.fmt, g.template)
        setCurrentCv(d.id)
      }
      clearGuest()
    } catch {}
    qc.clear()
    setUser(u)
    applyAccountLang(u)
  }, [qc])

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: u } = await api<{ user: User }>('/api/auth/login', { body: { email: email.trim(), password } })
    await signedIn(u)
  }, [signedIn])

  const register = useCallback(async (p: { name: string; email: string; password: string; newsletter: boolean }) => {
    const { user: u } = await api<{ user: User }>('/api/auth/register', { body: { name: p.name.trim(), email: p.email.trim(), password: p.password, newsletter: p.newsletter } })
    // New accounts start in the language the app is showing
    api('/api/auth/settings', { method: 'PATCH', body: { uiLang: lang.value } }).catch(() => {})
    await signedIn(u)
  }, [signedIn])

  const forgotPassword = useCallback(async (email: string) => {
    await api('/api/auth/forgot-password', { body: { email: email.trim() } })
  }, [])

  const signOut = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    closeEditor()
    qc.clear()
    setUser(null)
  }, [qc])

  const deleteAccount = useCallback(async (confirm: { password?: string; confirmEmail?: string }) => {
    await api('/api/auth/delete-account', { body: confirm })
    closeEditor()
    qc.clear()
    setUser(null)
  }, [qc])

  const markOnboarded = useCallback(() => setUser(u => (u ? { ...u, onboarded: true } : u)), [])

  const value = useMemo(() => ({ user, ready, signIn, register, forgotPassword, deleteAccount, signOut, markOnboarded }),
    [user, ready, signIn, register, forgotPassword, deleteAccount, signOut, markOnboarded])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { ApiError }
