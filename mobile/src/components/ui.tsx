// Small building blocks shared by the editor screens.
import { useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { useColors } from '@/lib/theme'

export function Field({ label, hint, multiline, ...props }: TextInputProps & { label: string; hint?: string }) {
  const c = useColors()
  const [focused, setFocused] = useState(false)
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.text2 }]}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={c.text3}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={[
          styles.input,
          multiline && styles.multiline,
          { backgroundColor: c.surface, color: c.text, borderColor: focused ? c.accent : c.border },
          props.style,
        ]}
      />
      {!!hint && <Text style={[styles.hint, { color: c.text3 }]}>{hint}</Text>}
    </View>
  )
}

export function Card({ children }: { children: ReactNode }) {
  const c = useColors()
  return <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>{children}</View>
}

export function Button({ title, onPress, kind = 'primary', disabled }: { title: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger'; disabled?: boolean }) {
  const c = useColors()
  const bg = kind === 'primary' ? c.accent : 'transparent'
  const fg = kind === 'primary' ? c.accentText : kind === 'danger' ? c.danger : c.accent
  return (
    <Pressable
      onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({ pressed }) => [styles.button, { backgroundColor: bg, borderColor: kind === 'ghost' ? c.border : bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }]}>
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  )
}

export function SmallAction({ label, onPress, color, disabled }: { label: string; onPress: () => void; color?: string; disabled?: boolean }) {
  const c = useColors()
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} accessibilityRole="button" style={{ opacity: disabled ? 0.35 : 1 }}>
      <Text style={{ color: color || c.accent, fontSize: 14, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  )
}

// Skills, certifications: type one, add it, remove with a tap
export function ChipInput({ items, onChange, placeholder, addLabel }: { items: string[]; onChange: (v: string[]) => void; placeholder: string; addLabel: string }) {
  const c = useColors()
  const [draft, setDraft] = useState('')
  const add = () => {
    const parts = draft.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
    const have = new Set(items.map(s => s.toLowerCase()))
    const next = [...items, ...parts.filter(p => !have.has(p.toLowerCase()))]
    if (next.length !== items.length) onChange(next)
    setDraft('')
  }
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.chipRow}>
        <TextInput
          value={draft} onChangeText={setDraft} onSubmitEditing={add} placeholder={placeholder} placeholderTextColor={c.text3}
          returnKeyType="done" blurOnSubmit={false} accessibilityLabel={placeholder}
          style={[styles.input, { flex: 1, backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
        />
        <Button title={addLabel} onPress={add} disabled={!draft.trim()} />
      </View>
      <View style={styles.chips}>
        {items.map((s, i) => (
          <Pressable
            key={s + i} onPress={() => onChange(items.filter((_, k) => k !== i))}
            accessibilityRole="button" accessibilityLabel={`${s}, ×`}
            style={[styles.chip, { backgroundColor: c.accentSoft }]}>
            <Text style={{ color: c.accent, fontSize: 14, fontWeight: '500' }}>{s}  ×</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16 },
  multiline: { minHeight: 120, textAlignVertical: 'top', paddingTop: 12 },
  hint: { fontSize: 12.5, lineHeight: 17 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 14 },
  button: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 15, fontWeight: '600' },
  chipRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
})
