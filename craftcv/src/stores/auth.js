import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { deviceCountry } from '../composables/localPrice.js'

const apiUrl = (path) => (import.meta.env.VITE_API_URL || '') + path

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const loading = ref(true)

  const isLoggedIn  = computed(() => !!user.value)
  const isOnboarded = computed(() => user.value?.onboarded === true)

  // Once per visit, tell the server which country the device is set to (from its time zone, never the
  // internet address), for the admin's people-by-country numbers
  let countryFor = ''
  watch(() => user.value?.id, (id) => {
    if (!id || countryFor === id) return
    countryFor = id
    deviceCountry().then(c => { if (c) fetch(apiUrl('/api/auth/me?c=' + c), { credentials: 'include' }).catch(() => {}) })
  })

  async function fetchMe() {
    try {
      // ?soft=1: without a session the server answers 204 (no error in the console)
      const r = await fetch(apiUrl('/api/auth/me?soft=1'), { credentials: 'include' })
      user.value = r.status === 200 ? await r.json() : null
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
    const j = await r.json().catch(() => ({}))
    if (r.ok && user.value) Object.assign(user.value, j.user || {}, { onboarded: true })
    if (!r.ok) throw new Error(j.error || 'Could not save.')
  }

  return {
    user, loading, isLoggedIn, isOnboarded,
    fetchMe, register, login, loginWithGoogle,
    forgotPassword, resetPassword, logout, completeOnboarding,
  }
})
