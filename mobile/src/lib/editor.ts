// The CV being edited: an account CV (saved to the server like the website's drafts) or the guest
// CV (saved on the phone). Every editor screen reads and changes this one copy; changes are saved
// a moment after the last edit, and straight away when the app goes to the background.
// The open CV is remembered, so the Editor tab reopens it.
import { useEffect, useSyncExternalStore } from 'react'
import { AppState } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { QueryClient } from '@tanstack/react-query'
import { api, type Draft } from '@/lib/api'
import { draftTitle, normalise, type CvData, type CvFmt } from '@/lib/cv'
import { GUEST_ID, writeGuest, type GuestCv } from '@/lib/guest'

export type SaveState = 'saved' | 'saving' | 'unsaved' | 'error'
export type OpenCv = { id: string; data: CvData; fmt: CvFmt; template: string; save: SaveState; savedAt: number }

const CURRENT_KEY = 'cvmaster-current-cv'
let open: OpenCv | null = null
// The CV the Editor tab shows (remembered between launches)
let current: string | null = null
export const currentReady: Promise<void> = SecureStore.getItemAsync(CURRENT_KEY).then(v => { current = v || null }).catch(() => {})
let timer: ReturnType<typeof setTimeout> | null = null
let inFlight: Promise<void> | null = null
let dirty = false
let queryClient: QueryClient | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }

export function setEditorQueryClient(qc: QueryClient) { queryClient = qc }

function setOpen(next: OpenCv) {
  open = next
  dirty = false
  if (current !== next.id) { current = next.id; SecureStore.setItemAsync(CURRENT_KEY, next.id).catch(() => {}) }
  emit()
}

// Open an account CV (keeps unsaved edits if it's already open)
export function openDraft(d: Draft) {
  if (open?.id === d.id) return
  void flush()
  const { data, fmt } = normalise(d.data)
  setOpen({ id: d.id, data, fmt, template: d.template, save: 'saved', savedAt: Date.parse(d.updatedAt) || Date.now() })
}

// Open the guest CV kept on the phone
export function openGuestCv(g: GuestCv) {
  if (open?.id === GUEST_ID) return
  void flush()
  const { data, fmt } = normalise({ ...g.data, fmt: g.fmt })
  setOpen({ id: GUEST_ID, data, fmt, template: g.template, save: 'saved', savedAt: Date.parse(g.updatedAt) || Date.now() })
}

export function closeEditor() {
  void flush()
  open = null
  current = null
  SecureStore.deleteItemAsync(CURRENT_KEY).catch(() => {})
  emit()
}

// Make this CV the one the Editor tab opens (e.g. a guest CV that just moved into the account)
export function setCurrentCv(id: string) {
  if (open && open.id !== id) { void flush(); open = null }
  current = id
  SecureStore.setItemAsync(CURRENT_KEY, id).catch(() => {})
  emit()
}
export function useCurrentCvId() {
  return useSyncExternalStore(subscribe, () => current)
}

export function useEditor() {
  return useSyncExternalStore(subscribe, () => open)
}

function schedule() {
  dirty = true
  if (open) open = { ...open, save: 'unsaved' }
  emit()
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { void flush() }, 900)
}

export function update(fn: (d: CvData) => CvData) {
  if (!open) return
  open = { ...open, data: fn(open.data) }
  schedule()
}
export function setField<K extends keyof CvData>(key: K, value: CvData[K]) {
  update(d => ({ ...d, [key]: value }))
}
export function setTemplate(template: string) {
  if (!open) return
  open = { ...open, template }
  schedule()
}
export function setFmt(patch: Partial<CvFmt>) {
  if (!open) return
  open = { ...open, fmt: { ...open.fmt, ...patch } }
  schedule()
}

// Save now. One save at a time; edits made while saving are saved right after.
export async function flush(): Promise<void> {
  if (timer) { clearTimeout(timer); timer = null }
  if (inFlight) { await inFlight; if (!dirty) return }
  if (!open || !dirty) return
  const snap = open
  dirty = false
  open = { ...open, save: 'saving' }
  emit()
  inFlight = (async () => {
    try {
      if (snap.id === GUEST_ID) {
        writeGuest({ data: snap.data, fmt: snap.fmt, template: snap.template })
        queryClient?.invalidateQueries({ queryKey: ['guest'] })
      } else {
        const saved = await api<Draft>(`/api/drafts/${snap.id}`, {
          method: 'PUT',
          body: { title: draftTitle(snap.data) || undefined, data: { ...snap.data, fmt: snap.fmt }, template: snap.template },
        })
        queryClient?.setQueryData<Draft[]>(['drafts'], list => (list ? [saved, ...list.filter(x => x.id !== saved.id)] : list))
      }
      if (open?.id === snap.id) open = { ...open, save: dirty ? 'unsaved' : 'saved', savedAt: Date.now() }
    } catch {
      dirty = true
      if (open?.id === snap.id) open = { ...open, save: 'error' }
    }
    emit()
  })()
  await inFlight
  inFlight = null
  if (dirty && open?.save !== 'error') return flush()
}

export function useEditorLifecycle() {
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => { if (s !== 'active') void flush() })
    return () => sub.remove()
  }, [])
}
