// The brand loader, the same as the website's (brand/animations/loader.html): the mark draws itself,
// rests, then clears, on a loop. Used wherever a page or a section is loading. Buttons keep their
// small spinner. With "reduce motion" on, the mark simply shows, still.
import { useEffect, useId, useState } from 'react'
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { MARK_PATH, MARK_STROKE, MARK_BOX, THEMES } from '@brand/brand.mjs'
import { Txt } from '@/components/kit'
import { useTheme } from '@/lib/theme'

const AnimatedPath = Animated.createAnimatedComponent(Path)
const LEN = 190                       // the mark's path length (arc 118 + tick 72), in its own units
const [, , BOX_W, BOX_H] = String(MARK_BOX).split(' ').map(Number)
const EASE = Easing.bezier(0.65, 0, 0.35, 1)

export function BrandLoader({ size = 40, label, style }: { size?: number; label?: string; style?: StyleProp<ViewStyle> }) {
  const { c, dark } = useTheme()
  const t = THEMES[dark ? 'dark' : 'light'] as { from: string; to: string }
  const gid = 'bl' + useId().replace(/[^a-zA-Z0-9]/g, '')
  // 0 → hidden, 1 → drawn, 2 → cleared (the dash moves on past the end)
  const [v] = useState(() => new Animated.Value(0))
  const [still, setStill] = useState(false)
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null
    let live = true
    AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (!live) return
      if (reduce) { setStill(true); return }
      loop = Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 855, easing: EASE, useNativeDriver: false }),
        Animated.delay(320),
        Animated.timing(v, { toValue: 2, duration: 725, easing: EASE, useNativeDriver: false }),
      ]))
      loop.start()
    }).catch(() => {})
    return () => { live = false; loop?.stop() }
  }, [v])
  const offset = v.interpolate({ inputRange: [0, 1, 2], outputRange: [LEN, 0, -LEN] })
  const w = (size * BOX_W) / BOX_H
  return (
    <View style={[styles.wrap, style]} accessibilityRole="progressbar" accessibilityLabel={label}>
      <Svg width={w} height={size} viewBox={String(MARK_BOX)}>
        <Defs>
          <LinearGradient id={gid} gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0">
            <Stop offset=".3" stopColor={t.from} /><Stop offset="1" stopColor={t.to} />
          </LinearGradient>
        </Defs>
        {still
          ? <Path d={MARK_PATH} fill="none" stroke={`url(#${gid})`} strokeWidth={MARK_STROKE} strokeLinecap="round" strokeLinejoin="round" />
          : <AnimatedPath d={MARK_PATH} fill="none" stroke={`url(#${gid})`} strokeWidth={MARK_STROKE} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={[LEN, LEN * 2]} strokeDashoffset={offset} />}
      </Svg>
      {!!label && <Txt w={500} size={14} color={c.text2}>{label}</Txt>}
    </View>
  )
}

// A whole page (or panel) that's loading: the loader in the middle of the space
export function PageLoader({ label, style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  return <BrandLoader size={44} label={label} style={[{ flex: 1, justifyContent: 'center' }, style]} />
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 14 },
})
