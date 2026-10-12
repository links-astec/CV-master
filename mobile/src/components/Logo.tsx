// The CVMaster logo, drawn from the same definition as the website (craftcv/brand/brand.mjs):
// the mark (a "C" that sweeps into a tick), the "CVMaster" wordmark, and the app icon.
import Svg, { ClipPath, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg'
import { MARK_PATH, MARK_STROKE, WORD_CV, WORD_MASTER, THEMES, LOCKUP_BOX } from '@brand/brand.mjs'
import { useTheme } from '@/lib/theme'

type Tone = 'auto' | 'light' | 'dark' | 'blue'
const useTone = (tone: Tone) => { const { dark } = useTheme(); return THEMES[tone === 'auto' ? (dark ? 'dark' : 'light') : tone] as { from: string; to: string; text: string } }
let n = 0
const uid = (p: string) => `${p}${(n++).toString(36)}`

// The mark alone. `size` is its height; it's about 1.5 times as wide.
export function Mark({ size = 32, tone = 'auto' }: { size?: number; tone?: Tone }) {
  const t = useTone(tone)
  const id = uid('mk')
  return (
    <Svg width={size * 102 / 66} height={size} viewBox="8 6 102 66" accessibilityElementsHidden importantForAccessibility="no">
      <Defs><LinearGradient id={id} gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0"><Stop offset=".3" stopColor={t.from} /><Stop offset="1" stopColor={t.to} /></LinearGradient></Defs>
      <Path d={MARK_PATH} fill="none" stroke={`url(#${id})`} strokeWidth={MARK_STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

// Mark + "CVMaster". `size` is the height.
export function Logo({ size = 32, tone = 'auto' }: { size?: number; tone?: Tone }) {
  const t = useTone(tone)
  const id = uid('lg')
  return (
    <Svg width={size * 304 / 64} height={size} viewBox={LOCKUP_BOX} accessible accessibilityRole="image" accessibilityLabel="CVMaster">
      <Defs><LinearGradient id={id} gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0"><Stop offset=".3" stopColor={t.from} /><Stop offset="1" stopColor={t.to} /></LinearGradient></Defs>
      <G transform="translate(0 3)"><Path d={MARK_PATH} fill="none" stroke={`url(#${id})`} strokeWidth={MARK_STROKE} strokeLinecap="round" strokeLinejoin="round" /></G>
      <Path d={WORD_CV} fill={t.text} />
      <Path d={WORD_MASTER} fill={t.text} />
    </Svg>
  )
}

// The app icon (indigo squircle, white mark): for places that want a badge, like a blog byline
export function AppIcon({ size = 32 }: { size?: number }) {
  const id = uid('ai')
  const shape = 'M64 0C113 0 128 15 128 64S113 128 64 128 0 113 0 64 15 0 64 0Z'
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128" accessibilityElementsHidden importantForAccessibility="no">
      <Defs>
        <LinearGradient id={id + 'b'} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#6A60F2" /><Stop offset=".5" stopColor="#4338CA" /><Stop offset="1" stopColor="#2A2390" /></LinearGradient>
        <RadialGradient id={id + 'g'} cx=".5" cy=".52" r=".5"><Stop offset="0" stopColor="#8B85FF" stopOpacity=".55" /><Stop offset="1" stopColor="#8B85FF" stopOpacity="0" /></RadialGradient>
        <LinearGradient id={id + 'm'} gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0"><Stop offset=".25" stopColor="#FFFFFF" /><Stop offset=".7" stopColor="#C7D2FE" /><Stop offset="1" stopColor="#A5B4FC" /></LinearGradient>
        <ClipPath id={id + 'c'}><Path d={shape} /></ClipPath>
      </Defs>
      <G clipPath={`url(#${id}c)`}>
        <Path d={shape} fill={`url(#${id}b)`} />
        <Rect width="128" height="128" fill={`url(#${id}g)`} />
        <G transform="translate(14 30) scale(0.85)"><Path d={MARK_PATH} fill="none" stroke={`url(#${id}m)`} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" /></G>
      </G>
    </Svg>
  )
}
