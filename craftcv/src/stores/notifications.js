import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotifStore = defineStore('notifications', () => {
  const items = ref([])
  const unreadCount = computed(() => items.value.filter(n => !n.read).length)

  async function fetch() {
    try {
      const r = await window.fetch('/api/notifications', { credentials: 'include' })
      if (r.ok) items.value = await r.json()
    } catch {}
  }

  async function markRead(id) {
    const n = items.value.find(x => x.id === id)
    if (n) n.read = true
    await window.fetch(`/api/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' })
  }

  async function markAllRead() {
    items.value.forEach(n => n.read = true)
    await window.fetch('/api/notifications/read-all', { method: 'PATCH', credentials: 'include' })
  }

  return { items, unreadCount, fetch, markRead, markAllRead }
})