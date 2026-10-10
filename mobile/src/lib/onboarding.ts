// First-run state: the welcome screens (shown once) and the quick tour.
import { useSyncExternalStore } from 'react'
import * as SecureStore from 'expo-secure-store'

const WELCOME_KEY = 'cvmaster-welcome-done'
let welcomeDone: boolean | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }

export const onboardingReady: Promise<void> = SecureStore.getItemAsync(WELCOME_KEY)
  .then(v => { welcomeDone = v === '1' })
  .catch(() => { welcomeDone = false })
  .then(emit)

export function markWelcomeDone() {
  welcomeDone = true
  SecureStore.setItemAsync(WELCOME_KEY, '1').catch(() => {})
  emit()
}

export function useWelcomeDone(): boolean | null {
  return useSyncExternalStore(subscribe, () => welcomeDone)
}

// The quick tour (from My CVs, Settings, or right after the onboarding questions)
let tourOpen = false
export function startTour() { tourOpen = true; emit() }
export function endTour() { tourOpen = false; emit() }
export function useTourOpen() { return useSyncExternalStore(subscribe, () => tourOpen) }
