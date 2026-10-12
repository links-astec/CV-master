// The app's building blocks, styled after the website's components (buttons, cards, inputs,
// segmented tabs, chips), so screens look like the site's mobile view.
import { useState, type ReactNode } from 'react'
import {
  ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextProps, type TextStyle, type ViewStyle,
} from 'react-native'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { LucideIcon } from '@/components/icons'
import { FONT, useTheme, type Weight } from '@/lib/theme'

// ── Top spacing ──────────────────────────────────────────────────────────────
// Full screens start under the status bar (and the iPhone's notch or Dynamic Island), so they
// leave its height. Pop-up screens open as a sheet on iPhone, already below it; on Android they
// fill the screen, so they leave it too.
export function useTopSpace(extra: number, { sheet = false } = {}) {
  const insets = useSafeAreaInsets()
  return sheet && Platform.OS === 'ios' ? extra : insets.top + extra
}

// ── Text ─────────────────────────────────────────────────────────────────────
type TxtProps = TextProps & { w?: Weight; size?: number; color?: string; style?: StyleProp<TextStyle> }
export function Txt({ w = 400, size = 15, color, style, ...rest }: TxtProps) {
  const { c } = useTheme()
  return <Text {...rest} style={[{ fontFamily: FONT[w], fontSize: size, color: color || c.text, lineHeight: Math.round(size * 1.45) }, style]} />
}

// "My CVs" style page heading with its line underneath
export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  const { c } = useTheme()
  return (
    <View style={{ gap: 6 }}>
      <Txt w={800} size={30} style={{ letterSpacing: -0.6, lineHeight: 36 }}>{title}</Txt>
      {!!sub && <Txt size={16} color={c.text2} style={{ lineHeight: 23 }}>{sub}</Txt>}
    </View>
  )
}

// ── Buttons ──────────────────────────────────────────────────────────────────
type BtnProps = {
  title: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'ghost' | 'danger'
  icon?: LucideIcon; busy?: boolean; disabled?: boolean; size?: 'md' | 'lg' | 'sm'; full?: boolean; style?: StyleProp<ViewStyle>
}
export function Btn({ title, onPress, kind = 'primary', icon: Icon, busy, disabled, size = 'md', full, style }: BtnProps) {
  const { c } = useTheme()
  const bg = kind === 'primary' ? c.accent : kind === 'danger' ? c.danger : kind === 'secondary' ? c.surface : 'transparent'
  const fg = kind === 'primary' || kind === 'danger' ? c.accentText : kind === 'ghost' ? c.accent : c.text
  const pad = size === 'lg' ? 15 : size === 'sm' ? 8 : 12
  return (
    <Pressable
      onPress={onPress} disabled={disabled || busy} accessibilityRole="button" accessibilityState={{ disabled: disabled || busy }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, paddingVertical: pad, paddingHorizontal: size === 'sm' ? 14 : 20, borderColor: kind === 'secondary' ? c.border : 'transparent' },
        kind === 'primary' && { shadowColor: c.accent, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
        full && { alignSelf: 'stretch' },
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}>
      {busy ? <ActivityIndicator color={fg} /> : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : 18} color={fg} strokeWidth={2} />}
          <Txt w={600} size={size === 'lg' ? 16.5 : size === 'sm' ? 14 : 15.5} color={fg}>{title}</Txt>
        </>
      )}
    </Pressable>
  )
}

export function IconBtn({ icon: Icon, onPress, label, color, size = 22 }: { icon: LucideIcon; onPress: () => void; label: string; color?: string; size?: number }) {
  const { c } = useTheme()
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.6 : 1 })}>
      <Icon size={size} color={color || c.text} strokeWidth={1.8} />
    </Pressable>
  )
}

export function LinkBtn({ title, onPress, color, icon: Icon, disabled }: { title: string; onPress: () => void; color?: string; icon?: LucideIcon; disabled?: boolean }) {
  const { c } = useTheme()
  const col = color || c.accent
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} accessibilityRole="button" style={({ pressed }) => [styles.link, { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }]}>
      {Icon && <Icon size={16} color={col} strokeWidth={2} />}
      <Txt w={600} size={14.5} color={col}>{title}</Txt>
    </Pressable>
  )
}

// ── Surfaces ─────────────────────────────────────────────────────────────────
export function Card({ children, style, pad = 20 }: { children: ReactNode; style?: StyleProp<ViewStyle>; pad?: number }) {
  const { c, dark } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border, padding: pad, shadowColor: c.shadow, shadowOpacity: dark ? 0 : 0.05 }, style]}>
      {children}
    </View>
  )
}

// ── Inputs ───────────────────────────────────────────────────────────────────
export function Field({ label, hint, multiline, error, ...props }: TextInputProps & { label?: string; hint?: string; error?: string }) {
  const { c } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <View style={{ gap: 7 }}>
      {!!label && <Txt w={500} size={14} color={c.text}>{label}</Txt>}
      <TextInput
        {...props}
        multiline={multiline}
        accessibilityLabel={props.accessibilityLabel || label}
        placeholderTextColor={c.text3}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={[
          styles.input, multiline && styles.multiline,
          { fontFamily: FONT[400], backgroundColor: c.surface, color: c.text, borderColor: error ? c.danger : focused ? c.accent : c.border },
          focused && { shadowColor: c.accent, shadowOpacity: 0.18, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
          props.style,
        ]}
      />
      {!!(error || hint) && <Txt size={12.5} color={error ? c.danger : c.text3} style={{ lineHeight: 18 }}>{error || hint}</Txt>}
    </View>
  )
}

// Small caps group label inside a form ("NAME", "CONTACT")
export function GroupLabel({ children }: { children: string }) {
  const { c } = useTheme()
  return <Txt w={700} size={12} color={c.text3} style={{ letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 }}>{children}</Txt>
}

// ── Segmented tabs (Content | Design | Job match) ────────────────────────────
export function Segmented<K extends string>({ items, value, onChange }: { items: { key: K; label: string; count?: number }[]; value: K; onChange: (k: K) => void }) {
  const { c, dark } = useTheme()
  return (
    <View style={[styles.seg, { backgroundColor: dark ? c.surface2 : '#f0f0f6', borderColor: c.border }]} accessibilityRole="tablist">
      {items.map(it => {
        const on = it.key === value
        return (
          <Pressable
            key={it.key} onPress={() => onChange(it.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}
            style={[styles.segItem, on && { backgroundColor: c.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 }]}>
            <Txt w={on ? 600 : 500} size={14.5} color={on ? c.text : c.text2}>
              {it.label}{it.count != null && <Txt size={13} color={c.text3}> {it.count}</Txt>}
            </Txt>
          </Pressable>
        )
      })}
    </View>
  )
}

// ── Chips (onboarding answers, skills) ───────────────────────────────────────
export function Chip({ label, on, onPress, extra }: { label: string; on?: boolean; onPress?: () => void; extra?: string }) {
  const { c } = useTheme()
  return (
    <Pressable
      onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : 'text'} accessibilityState={{ selected: !!on }}
      style={({ pressed }) => [styles.chip, { borderColor: on ? c.accent : c.border, backgroundColor: on ? c.accentSoft : c.surface, opacity: pressed ? 0.8 : 1 }]}>
      <Txt w={500} size={14.5} color={on ? c.accent : c.text2}>{label}</Txt>
      {!!extra && <Txt size={13} color={c.text3}>{extra}</Txt>}
    </Pressable>
  )
}

// Setting row: title, description and a control on the right
export function SettingRow({ title, desc, right, first }: { title: string; desc?: string; right?: ReactNode; first?: boolean }) {
  const { c } = useTheme()
  return (
    <View style={[styles.settingRow, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt w={600} size={15.5}>{title}</Txt>
        {!!desc && <Txt size={13.5} color={c.text3} style={{ lineHeight: 19 }}>{desc}</Txt>}
      </View>
      {right}
    </View>
  )
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { c } = useTheme()
  return <Switch value={value} onValueChange={onChange} accessibilityLabel={label} trackColor={{ true: c.accent, false: c.border2 }} thumbColor="#fff" />
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  card: { borderWidth: 1, borderRadius: 18, gap: 14, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  multiline: { minHeight: 120, textAlignVertical: 'top', paddingTop: 12 },
  seg: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 4 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
})
