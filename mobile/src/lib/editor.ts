// The CV being edited. Every screen of the editor reads and changes the same copy; changes are
// saved to the account a moment after the last edit (and straight away when the app goes to
// the background), the same draft the website shows.
import { useEffect, useSyncExternalStore } from 'react'
import { AppState } from 'react-native'
import type { QueryClient } from '@tanstack/react-query'
import { api, type Draft } from '@/lib/api'
import { draftTitle, normalise, type CvData, type CvFmt } from '@/lib/cv'

export type SaveState = 'saved' | 'saving' | 'unsaved' | 'error'
type Open = { id: string; data: CvData; fmt: CvFmt; template: string; save: SaveState; savedAt: number }

let open: Open | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let inFlight: Promise<void> | null = null
let dirty = false
let queryClient: QueryClient | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }

export function setEditorQueryClient(qc: QueryClient) { queryClient = qc }

// Open a draft for editing (keeps unsaved edits if it's already open)
export function openDraft(d: Draft) {
  if (open?.id === d.id) return
  flush()
  const { data, fmt } = normalise(d.data)
  open = { id: d.id, data, fmt, template: d.template, save: 'saved', savedAt: Date.parse(d.updatedAt) || Date.now() }
  dirty = false
  emit()
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
      const saved = await api<Draft>(`/api/drafts/${snap.id}`, {
        method: 'PUT',
        body: { title: draftTitle(snap.data) || undefined, data: { ...snap.data, fmt: snap.fmt }, template: snap.template },
      })
      queryClient?.setQueryData<Draft[]>(['drafts'], list => {
        if (!list) return list
        const rest = list.filter(x => x.id !== saved.id)
        return [saved, ...rest]
      })
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

// Save when the app is backgrounded, and keep the editor in step with the drafts list
export function useEditorLifecycle() {
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => { if (s !== 'active') void flush() })
    return () => sub.remove()
  }, [])
}
