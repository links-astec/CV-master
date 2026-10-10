// The CVMaster logo, the same drawing as the website's BrandLogo.vue / brand/cvmaster-mark.svg.
// Swap the mark and the name here when rebranding.
import { View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { Txt } from '@/components/kit'
import { useTheme } from '@/lib/theme'

export function Mark({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityElementsHidden importantForAccessibility="no">
      <Rect width="64" height="64" rx="15" fill="#4338CA" />
      <Path d="M21 11h15l11 11v27a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4V15a4 4 0 0 1 4-4z" fill="#FFFFFF" />
      <Path d="M36 11v7.5a3.5 3.5 0 0 0 3.5 3.5H47z" fill="#A5B4FC" />
      <Path d="M23 19.5h8" stroke="#C7D2FE" strokeWidth={3} strokeLinecap="round" />
      <Path d="M23.5 37.5l6.5 6.5 12-12.5" fill="none" stroke="#4338CA" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function Logo({ size = 32, markOnly }: { size?: number; markOnly?: boolean }) {
  const { c, dark } = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.32 }} accessible accessibilityRole="image" accessibilityLabel="CVMaster">
      <Mark size={size} />
      {!markOnly && (
        <Txt w={800} size={size * 0.6} style={{ letterSpacing: -size * 0.02, lineHeight: size * 0.75 }} color={c.text}>
          <Txt w={800} size={size * 0.6} color={dark ? '#A5B4FC' : '#4338CA'}>CV</Txt>Master
        </Txt>
      )}
    </View>
  )
}
