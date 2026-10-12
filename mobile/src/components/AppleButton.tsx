// "Sign in with Apple": Apple's own button in the app's iPhone build. Expo Go doesn't include that
// native button, so there a copy drawn to Apple's rules (black or white, the Apple logo, the
// same wording) stands in; tapping either runs the same sign-in.
import { Pressable, StyleSheet, Text } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { appleNativeButton } from '@/lib/apple'
import { useLang } from '@/i18n'

type Props = { signUp: boolean; dark: boolean; disabled?: boolean; onPress: () => void }

export function AppleButton({ signUp, dark, disabled, onPress }: Props) {
  const { t } = useLang()
  if (appleNativeButton) {
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={signUp ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={dark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={10} style={styles.btn} onPress={() => { if (!disabled) onPress() }} />
    )
  }
  const fg = dark ? '#000' : '#fff'
  const label = t(signUp ? 'Sign up with Apple' : 'Sign in with Apple')
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [styles.btn, styles.copy, { backgroundColor: dark ? '#fff' : '#000', opacity: disabled ? 0.6 : pressed ? 0.85 : 1 }]}>
      {/* The Apple logo is a character of the iPhone's own font */}
      <Text style={[styles.logo, { color: fg }]}>{'\uF8FF'}</Text>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: { height: 50, alignSelf: 'stretch' },
  copy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10 },
  logo: { fontSize: 20, marginTop: -3 },
  label: { fontSize: 18, fontWeight: '600', letterSpacing: -0.2 },
})
