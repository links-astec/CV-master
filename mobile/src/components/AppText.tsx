// Drop-in Text and TextInput that use the website's font (Plus Jakarta Sans). They read the style's
// fontWeight and pick the matching font file (Android needs one family per weight), and default to
// the theme's text colour. Import these instead of react-native's Text/TextInput.
import { forwardRef } from 'react'
import { StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps, type TextStyle } from 'react-native'
import { FONT, useTheme, type Weight } from '@/lib/theme'

function family(style: TextStyle | undefined): string {
  const w = Number(style?.fontWeight) || (style?.fontWeight === 'bold' ? 700 : 400)
  const snapped = (w >= 800 ? 800 : w >= 700 ? 700 : w >= 600 ? 600 : w >= 500 ? 500 : 400) as Weight
  return FONT[snapped]
}

export const Text = forwardRef<RNText, TextProps>(function Text({ style, ...rest }, ref) {
  const { c } = useTheme()
  const flat = StyleSheet.flatten(style) || {}
  const { fontWeight, ...without } = flat
  return <RNText ref={ref} {...rest} style={[{ color: c.text }, without, { fontFamily: family({ fontWeight }) }]} />
})

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput({ style, ...rest }, ref) {
  const { c } = useTheme()
  const flat = StyleSheet.flatten(style) || {}
  const { fontWeight, ...without } = flat
  return <RNTextInput ref={ref} placeholderTextColor={c.text3} {...rest} style={[{ color: c.text }, without, { fontFamily: family({ fontWeight }) }]} />
})
