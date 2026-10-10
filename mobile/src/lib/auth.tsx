// Who is signed in. On launch the app asks the server (/api/auth/me) with the saved session
// cookie; signing in sets that cookie, signing out clears it.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, ApiError, type User } from '@/lib/api'
import { hasExplicitChoice, setLang } from '@/i18n'

type AuthState = {
  user: User | null
  ready: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

// Like the website: the account's language applies unless this phone has its own choice
function applyAccountLang(u: User | null) {
  if (u?.uiLang && !hasExplicitChoice()) setLang(u.uiLang, { explicit: false })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api<User>('/api/auth/me')
      .then(u => { setUser(u); applyAccountLang(u) })
      .catch(() => setUser(null))
      .finally(() => setReady(true))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: u } = await api<{ user: User }>('/api/auth/login', { body: { email: email.trim(), password } })
    setUser(u)
    applyAccountLang(u)
  }, [])

  const signOut = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { ApiError }
