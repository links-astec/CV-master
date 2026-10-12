// Activity for personalisation, for the few things only the app sees (most is recorded by the
// server itself: AI use, job matches, exports, layouts). Kept on CVMaster's own server, never
// shared, and off when the user switches off "Personalise with my activity". Sent in small
// batches; see craftcv/server/activity.js.
import { Platform } from 'react-native'
import { api } from '@/lib/api'

type Ev = { name: string; props?: Record<string, string | number> }
let queue: Ev[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let enabled = false

// Set by the auth provider: signed in, and personalisation on
export function setTracking(on: boolean) {
  enabled = on
  if (!on) queue = []
}

export function track(name: string, props: Record<string, string | number> = {}) {
  if (!enabled) return
  queue.push({ name, props })
  if (!timer) timer = setTimeout(flushEvents, 4000)
}

export async function flushEvents() {
  if (timer) { clearTimeout(timer); timer = null }
  if (!queue.length || !enabled) return
  const events = queue.splice(0, 50)
  await api('/api/events', { body: { platform: Platform.OS, events } }).catch(() => {})
}
