// The launch moment (from the designer's reveal animation): the launch screen shows the mark in the
// middle; here it glides left and settles while "CVMaster" comes in beside it, then the app appears.
// Runs once per launch, and not at all when the phone is set to reduce motion.
import { useEffect, useState } from 'react'
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { MARK_PATH, MARK_STROKE, WORD_CV, WORD_MASTER, THEMES, LOCKUP_BOX } from '@brand/brand.mjs'
import { useTheme } from '@/lib/theme'

const START = 120            // the mark's width on the launch screen (app.json → expo-splash-screen imageWidth)
const H = 44                 // the finished logo's height
const S = H / 64
const W = 304 * S
const MARK_W = 102 * S
const MARK_H = 66 * S

export function BrandIntro({ onDone }: { onDone: () => void }) {
  const { c, dark } = useTheme()
  const t = THEMES[dark ? 'dark' : 'light'] as { from: string; to: string; text: string }
  // Animated values made once (state, so they can be read while rendering)
  const [move] = useState(() => new Animated.Value(0))
  const [word] = useState(() => new Animated.Value(0))
  const [fade] = useState(() => new Animated.Value(1))

  useEffect(() => {
    let live = true
    AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (!live) return
      if (reduce) { onDone(); return }
      const ease = Easing.bezier(0.6, 0, 0.25, 1)
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(move, { toValue: 1, duration: 720, easing: ease, useNativeDriver: true }),
          Animated.timing(word, { toValue: 1, duration: 620, delay: 260, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: true }),
        ]),
        Animated.delay(380),
        Animated.timing(fade, { toValue: 0, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start(() => live && onDone())
    })
    return () => { live = false }
  }, [move, word, fade, onDone])

  const k = START / MARK_W
  const markStyle = {
    transform: [
      { translateX: move.interpolate({ inputRange: [0, 1], outputRange: [W / 2 - MARK_W / 2, 0] }) },
      { scale: move.interpolate({ inputRange: [0, 1], outputRange: [k, 1] }) },
    ],
  }
  const wordStyle = {
    opacity: word,
    transform: [{ translateX: word.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
  }
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wrap, { backgroundColor: c.bg, opacity: fade }]}>
      <View style={{ width: W, height: H }}>
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: MARK_W, height: MARK_H }, markStyle]}>
          <Svg width={MARK_W} height={MARK_H} viewBox="8 6 102 66">
            <Defs><LinearGradient id="intro" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="104" y2="0"><Stop offset=".3" stopColor={t.from} /><Stop offset="1" stopColor={t.to} /></LinearGradient></Defs>
            <Path d={MARK_PATH} fill="none" stroke="url(#intro)" strokeWidth={MARK_STROKE} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, wordStyle]}>
          <Svg width={W} height={H} viewBox={LOCKUP_BOX}>
            <Path d={WORD_CV} fill={t.text} />
            <Path d={WORD_MASTER} fill={t.text} />
          </Svg>
        </Animated.View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({ wrap: { zIndex: 1000, alignItems: 'center', justifyContent: 'center' } })
