// Older building blocks used by the editor panels, now drawn with the site-styled kit.
import { useState } from 'react'
import { Pressable, StyleSheet, View, type TextInputProps } from 'react-native'
import { Text, TextInput } from '@/components/AppText'
import { Btn, Card as KitCard, Field as KitField, LinkBtn } from '@/components/kit'
import { useColors } from '@/lib/theme'

export function Field(props: TextInputProps & { label: string; hint?: string }) {
  return <KitField {...props} />
}

export function Card({ children }: { children: React.ReactNode }) {
  return <KitCard pad={18}>{children}</KitCard>
}

export function Button({ title, onPress, kind = 'primary', disabled }: { title: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger'; disabled?: boolean }) {
  return <Btn title={title} onPress={onPress} kind={kind === 'ghost' ? 'secondary' : kind} disabled={disabled} full />
}

export function SmallAction({ label, onPress, color, disabled }: { label: string; onPress: () => void; color?: string; disabled?: boolean }) {
  return <LinkBtn title={label} onPress={onPress} color={color} disabled={disabled} />
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
          value={draft} onChangeText={setDraft} onSubmitEditing={add} placeholder={placeholder}
          returnKeyType="done" submitBehavior="submit" accessibilityLabel={placeholder}
          style={[styles.input, { flex: 1, backgroundColor: c.surface, borderColor: c.border }]}
        />
        <Btn title={addLabel} onPress={add} disabled={!draft.trim()} size="sm" style={{ alignSelf: 'stretch' }} />
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
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16 },
  chipRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
})
