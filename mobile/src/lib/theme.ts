import { useColorScheme } from 'react-native'
import { COLORS, type Palette } from '@/brand'

export function useColors(): Palette {
  return useColorScheme() === 'dark' ? COLORS.dark : COLORS.light
}
