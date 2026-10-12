// The account's notifications (welcome, tips, "You earned a free CV"…), the same list as the
// website's bell. Read state is shared: reading one in the app marks it read on the website too.
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type Notification = { id: string; type: string; title: string; body: string; link: string | null; read: boolean; time: number }

export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: () => api<Notification[]>('/api/notifications'), refetchInterval: 120_000 })
}

export function useMarkRead() {
  const qc = useQueryClient()
  const set = (fn: (n: Notification) => Notification) => qc.setQueryData<Notification[]>(['notifications'], l => (l || []).map(fn))
  return {
    one: (id: string) => { set(n => (n.id === id ? { ...n, read: true } : n)); api(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {}) },
    all: () => { set(n => ({ ...n, read: true })); api('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {}) },
  }
}
