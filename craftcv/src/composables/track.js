// Activity for personalisation, for the few things only the browser sees (most is recorded by
// the server itself). Signed-in users only; kept on our own server, never shared, and switched
// off in Settings ("Personalise with my activity"). See server/activity.js.
import { useAuthStore } from '../stores/auth.js'
import { deviceCountry } from './localPrice.js'

const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p

// Anonymous counts for visitors without an account (server/guests.js): what they do, never who
// they are. Signed-in people are never counted here; browsers with Global Privacy Control are
// ignored by the server. A visit is counted once per browser session.
export function guestEvent(name) {
  const auth = useAuthStore()
  if (auth.loading || auth.isLoggedIn) return
  if (name === 'visit') {
    try { if (sessionStorage.getItem('cvm-visit')) return; sessionStorage.setItem('cvm-visit', '1') } catch {}
  }
  deviceCountry().then(country => fetch(apiUrl('/api/guest/events'), {
    method: 'POST', credentials: 'include', keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'web', events: [name], ...(country ? { country } : {}) }),
  })).catch(() => {})
}

export function track(name, props = {}) {
  const auth = useAuthStore()
  if (!auth.isLoggedIn || auth.user?.personalizeActivity === false) return
  fetch(apiUrl('/api/events'), {
    method: 'POST', credentials: 'include', keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'web', events: [{ name, props }] }),
  }).catch(() => {})
}
