// Who is signed in. On launch the app asks the server (/api/auth/me) with the saved session
// cookie; signing in or creating an account sets that cookie, signing out clears it.
// The app needs an account: signed out, the root layout shows the welcome screens.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AppState } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { api, ApiError, type User } from '@/lib/api'
import { deviceCountry } from '@/lib/local'
import { hasExplicitChoice, lang, setLang } from '@/i18n'
import { closeEditor } from '@/lib/editor'
import { clearReferral } from '@/lib/referral'
import { googleSignOut } from '@/lib/google'
import type { AppleSignIn } from '@/lib/apple'
import { disablePush, refreshPush } from '@/lib/push'
import { flushEvents, setTracking, track } from '@/lib/track'

type AuthState = {
  user: User | null
  ready: boolean
  signIn: (email: string, password: string) => Promise<void>
  register: (p: { name: string; email: string; password: string; newsletter: boolean; referredBy?: string }) => Promise<void>
  signInWithGoogle: (p: { idToken: string; newsletter?: boolean; referredBy?: string }) => Promise<void>
  signInWithApple: (p: AppleSignIn & { newsletter?: boolean; referredBy?: string }) => Promise<void>
  adoptUser: (u: User) => void
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

  // Personalisation from activity follows the account's setting; "app open" marks a visit
  const personal = !!user && user.personalizeActivity !== false
  useEffect(() => {
    setTracking(personal)
    if (!personal) return
    let last = 0
    const open = () => { if (Date.now() - last > 30 * 60 * 1000) { last = Date.now(); track('app_open') } }
    open()
    const sub = AppState.addEventListener('change', st => { if (st === 'active') open(); else flushEvents() })
    return () => sub.remove()
  }, [personal])
  // Pushes: register this phone again for whoever is signed in (if they turned pushes on)
  const userId = user?.id
  useEffect(() => { if (userId) refreshPush() }, [userId])
  // Once per launch, the country the phone is set to (from its time zone, never the internet address),
  // for the admin's people-by-country numbers
  useEffect(() => { if (userId && deviceCountry) api('/api/auth/me?c=' + deviceCountry).catch(() => {}) }, [userId])

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

  // Google: the phone's Google sign-in gives an ID token the server checks, like the website's button
  const signInWithGoogle = useCallback(async (p: { idToken: string; newsletter?: boolean; referredBy?: string }) => {
    const { user: u } = await api<{ user: User }>('/api/auth/google', { body: { credential: p.idToken, newsletter: !!p.newsletter, referredBy: p.referredBy || undefined } })
    clearReferral()
    if (!u.uiLang) api('/api/auth/settings', { method: 'PATCH', body: { uiLang: lang.value } }).catch(() => {})
    signedIn(u.uiLang ? u : { ...u, uiLang: lang.value })
  }, [signedIn])

  // Apple (iPhone): the server checks Apple's identity token
  const signInWithApple = useCallback(async (p: AppleSignIn & { newsletter?: boolean; referredBy?: string }) => {
    const { user: u } = await api<{ user: User }>('/api/auth/apple', {
      body: { identityToken: p.identityToken, authorizationCode: p.authorizationCode, fullName: p.fullName, newsletter: !!p.newsletter, referredBy: p.referredBy || undefined },
    })
    clearReferral()
    if (!u.uiLang) api('/api/auth/settings', { method: 'PATCH', body: { uiLang: lang.value } }).catch(() => {})
    signedIn(u.uiLang ? u : { ...u, uiLang: lang.value })
  }, [signedIn])

  // Signed in another way (e.g. setting a new password from a reset link)
  const adoptUser = useCallback((u: User) => signedIn(u), [signedIn])

  const forgotPassword = useCallback(async (email: string) => {
    await api('/api/auth/forgot-password', { body: { email: email.trim() } })
  }, [])

  const signOut = useCallback(async () => {
    await flushEvents()
    await disablePush({ remember: false })   // this phone stops getting the account's pushes
    await googleSignOut()
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    signedOut()
  }, [signedOut])

  const deleteAccount = useCallback(async (confirm: { password?: string; confirmEmail?: string }) => {
    await api('/api/auth/delete-account', { body: confirm })   // the server forgets the phone too
    await disablePush({ remember: false })
    await googleSignOut()
    signedOut()
  }, [signedOut])

  const markOnboarded = useCallback(() => setUser(u => (u ? { ...u, onboarded: true } : u)), [])
  const patchUser = useCallback((p: Partial<User>) => setUser(u => (u ? { ...u, ...p } : u)), [])

  const value = useMemo(() => ({ user, ready, signIn, register, signInWithGoogle, signInWithApple, adoptUser, forgotPassword, deleteAccount, signOut, markOnboarded, patchUser, refresh }),
    [user, ready, signIn, register, signInWithGoogle, signInWithApple, adoptUser, forgotPassword, deleteAccount, signOut, markOnboarded, patchUser, refresh])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { ApiError }
