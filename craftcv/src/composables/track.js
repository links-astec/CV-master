// Activity for personalisation, for the few things only the browser sees (most is recorded by
// the server itself). Signed-in users only; kept on our own server, never shared, and switched
// off in Settings ("Personalise with my activity"). See server/activity.js.
import { useAuthStore } from '../stores/auth.js'

const apiUrl = (p) => (import.meta.env.VITE_API_URL || '') + p

export function track(name, props = {}) {
  const auth = useAuthStore()
  if (!auth.isLoggedIn || auth.user?.personalizeActivity === false) return
  fetch(apiUrl('/api/events'), {
    method: 'POST', credentials: 'include', keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'web', events: [{ name, props }] }),
  }).catch(() => {})
}
