// What the tour points at, like the website's data-tour="…" elements: a component attaches
// useTourTarget('nav-home') as the ref of a View, and the tour measures it on screen.
import { useCallback } from 'react'
import type { View } from 'react-native'

export type Rect = { x: number; y: number; w: number; h: number }
const targets = new Map<string, View>()

export function useTourTarget(key: string) {
  return useCallback((v: View | null) => {
    if (v) targets.set(key, v)
    else if (targets.get(key)) targets.delete(key)
  }, [key])
}

// Where the target is on screen, or null if it isn't showing
export function measureTarget(key: string): Promise<Rect | null> {
  const v = targets.get(key)
  if (!v) return Promise.resolve(null)
  return new Promise(resolve => {
    try {
      v.measureInWindow((x, y, w, h) => resolve(w > 0 && h > 0 ? { x, y, w, h } : null))
    } catch { resolve(null) }
  })
}
