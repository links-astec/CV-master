// Reordering CV entries (experience, education, projects) in the editor, and checking
// that dated entries are most-recent-first — the order recruiters and ATS expect.
import { ref } from 'vue'

// ── date order ────────────────────────────────────────────────────────────────
const ONGOING = /present|current|now|today|ongoing|aujourd|actuel|en cours|présent/i

// "2021 – Present" → [Infinity, 2021]; "Mai – Aout 2026" → [2026, 2026]; no year → null
export function periodKey(text) {
  const t = String(text || '')
  const years = (t.match(/\b(19|20)\d{2}\b/g) || []).map(Number)
  if (!years.length && !ONGOING.test(t)) return null
  const end = ONGOING.test(t) ? Infinity : Math.max(...years)
  return [end, years.length ? Math.min(...years) : end]
}
const later = (a, b) => a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1]

// True when a dated entry appears above a more recent one
export function isOutOfOrder(list, field) {
  const keys = (list || []).map(x => periodKey(x?.[field])).filter(Boolean)
  return keys.some((k, i) => i > 0 && later(k, keys[i - 1]))
}

// Most recent first; entries without dates keep their place relative to each other at the end
export function sortByDate(list, field) {
  const withKey = list.map((x, i) => ({ x, i, k: periodKey(x?.[field]) }))
  withKey.sort((a, b) => {
    if (!a.k || !b.k) return (a.k ? -1 : b.k ? 1 : a.i - b.i)
    return later(a.k, b.k) ? -1 : later(b.k, a.k) ? 1 : a.i - b.i
  })
  list.splice(0, list.length, ...withKey.map(w => w.x))
}

// ── drag to reorder ───────────────────────────────────────────────────────────
// Cards only become draggable while the grip is held, so text in their inputs can
// still be selected normally.
export function useReorder(getList) {
  const from  = ref(null)
  const over  = ref(null)
  const armed = ref(null)

  function move(i, j) {
    const l = getList()
    if (j < 0 || j >= l.length || i === j) return
    const [x] = l.splice(i, 1)
    l.splice(j, 0, x)
  }
  const reset = () => { from.value = over.value = armed.value = null }

  const card = (i) => ({
    draggable: armed.value === i,
    class: { 'ro-over': over.value === i && from.value !== null && from.value !== i, 'ro-dragging': from.value === i },
    onDragstart: (e) => { from.value = i; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)) },
    onDragover:  (e) => { if (from.value === null) return; e.preventDefault(); over.value = i },
    onDrop:      (e) => { e.preventDefault(); if (from.value !== null) move(from.value, i); reset() },
    onDragend:   reset,
  })
  const arm = (i) => { armed.value = i }
  return { move, card, arm, disarm: reset }
}
