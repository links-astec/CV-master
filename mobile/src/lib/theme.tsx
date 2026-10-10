// The website's design tokens (craftcv/src/style.css :root and [data-theme="dark"]), so the app
// looks like the site. Dark mode follows the phone unless the user flips the moon (like the site's
// dark mode toggle), and that choice is remembered.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const LIGHT = {
  bg: '#f5f5fa', surface: '#ffffff', surface2: '#fafafd',
  border: '#e4e4ee', border2: '#d0d0de',
  text: '#14142b', text2: '#4a4a63', text3: '#6b6b84',
  accent: '#4338ca', accentText: '#ffffff', accentSoft: '#eef0ff', accentDark: '#3730a3',
  success: '#16a34a', green: '#15803d', greenSoft: '#ecfdf3',
  amber: '#b45309', amberSoft: '#fff8eb',
  danger: '#be123c', dangerSoft: '#fff1f3',
  canvas: '#ececf0', overlay: 'rgba(20,20,43,0.45)', shadow: '#111827',
}
const DARK: typeof LIGHT = {
  bg: '#0c0c10', surface: '#15151b', surface2: '#1b1b22',
  border: '#26262e', border2: '#34343e',
  text: '#f3f4f6', text2: '#a8adb7', text3: '#8b909c',
  accent: '#8b85ff', accentText: '#ffffff', accentSoft: '#1f1d3d', accentDark: '#a5a0ff',
  success: '#4ade80', green: '#4ade80', greenSoft: '#0f2a1b',
  amber: '#fbbf24', amberSoft: '#2c2108',
  danger: '#fb7185', dangerSoft: '#2d1219',
  canvas: '#0f0f14', overlay: 'rgba(0,0,0,0.6)', shadow: '#000000',
}
export type Palette = typeof LIGHT

// Plus Jakarta Sans, the website's interface font, one family per weight (needed on Android)
export const FONT = {
  400: 'PlusJakartaSans_400Regular', 500: 'PlusJakartaSans_500Medium', 600: 'PlusJakartaSans_600SemiBold',
  700: 'PlusJakartaSans_700Bold', 800: 'PlusJakartaSans_800ExtraBold',
} as const
export type Weight = keyof typeof FONT

type Mode = 'system' | 'light' | 'dark'
type ThemeState = { c: Palette; dark: boolean; toggleDark: () => void; setMode: (m: Mode) => void; mode: Mode }
const KEY = 'cvmaster-theme'
const ThemeContext = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme()
  const [mode, setModeState] = useState<Mode>('system')
  useEffect(() => {
    SecureStore.getItemAsync(KEY).then(v => { if (v === 'light' || v === 'dark') setModeState(v) }).catch(() => {})
  }, [])
  const dark = mode === 'system' ? system === 'dark' : mode === 'dark'
  const value = useMemo<ThemeState>(() => {
    const setMode = (m: Mode) => { setModeState(m); SecureStore.setItemAsync(KEY, m).catch(() => {}) }
    return { c: dark ? DARK : LIGHT, dark, mode, setMode, toggleDark: () => setMode(dark ? 'light' : 'dark') }
  }, [dark, mode])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
export const useColors = () => useTheme().c
