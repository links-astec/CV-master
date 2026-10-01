import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const loading = ref(true)

  const isLoggedIn  = computed(() => !!user.value)
  const isOnboarded = computed(() => user.value?.onboarded === true)

  async function fetchMe() {
    try {
      const r = await fetch(apiUrl('/api/auth/me'), { credentials: 'include' })
      user.value = r.ok ? await r.json() : null
    } catch { user.value = null }
    loading.value = false
  }

  async function register(email, password, name, referredBy = '', newsletter = false) {
    const r = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, referredBy, newsletter }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    user.value = data.user
    return data.user
  }

  async function login(email, password) {
    const r = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    user.value = data.user
    return data.user
  }

  async function loginWithGoogle(credential, referredBy = '', newsletter = false) {
    const r = await fetch(apiUrl('/api/auth/google'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, referredBy, newsletter }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    user.value = data.user
    return data.user
  }

  async function forgotPassword(email) {
    const r = await fetch(apiUrl('/api/auth/forgot-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    return data
  }

  async function resetPassword(token, password) {
    const r = await fetch(apiUrl('/api/auth/reset-password'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    user.value = data.user
    return data.user
  }

  async function logout() {
    await fetch(apiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' })
    user.value = null
  }

  async function completeOnboarding(payload) {
    const r = await fetch(apiUrl('/api/auth/onboard'), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (r.ok && user.value) {
      user.value.onboarded  = true
      user.value.industry   = payload.industry   || user.value.industry
      user.value.goal       = payload.goal       || user.value.goal
      user.value.experience = payload.experience || user.value.experience
    }
  }

  return {
    user, loading, isLoggedIn, isOnboarded,
    fetchMe, register, login, loginWithGoogle,
    forgotPassword, resetPassword, logout, completeOnboarding,
  }
})
