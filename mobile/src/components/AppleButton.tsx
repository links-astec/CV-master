// "Sign in with Apple" / "Sign up with Apple": Apple's own button (Apple requires it). It only
// appears in the app's iPhone build; Expo Go doesn't include Apple sign-in.
import * as AppleAuthentication from 'expo-apple-authentication'

type Props = { signUp: boolean; dark: boolean; disabled?: boolean; onPress: () => void }

export function AppleButton({ signUp, dark, disabled, onPress }: Props) {
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={signUp ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={dark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={10} style={{ height: 50, alignSelf: 'stretch' }} onPress={() => { if (!disabled) onPress() }} />
  )
}
