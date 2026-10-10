// An AI result the user can take or leave: "Use this" replaces the text, "Dismiss" drops it.
import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/AppText'
import { SmallAction } from '@/components/ui'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

export function AiSuggestion({ title, text, onUse, onDismiss }: { title: string; text: string; onUse: () => void; onDismiss: () => void }) {
  const { t } = useLang()
  const c = useColors()
  return (
    <View style={[styles.box, { backgroundColor: c.accentSoft, borderColor: c.accent }]} accessibilityLiveRegion="polite">
      <Text style={[styles.title, { color: c.accent }]}>{title}</Text>
      <Text style={[styles.text, { color: c.text }]} selectable>{text}</Text>
      <View style={styles.actions}>
        <SmallAction label={t('Use this')} onPress={onUse} />
        <SmallAction label={t('Dismiss')} onPress={onDismiss} color={c.text2} />
      </View>
    </View>
  )
}

export function AiButton({ label, busyLabel, busy, onPress, disabled }: { label: string; busyLabel: string; busy: boolean; onPress: () => void; disabled?: boolean }) {
  return <SmallAction label={`✦ ${busy ? busyLabel : label}`} onPress={onPress} disabled={busy || disabled} />
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  title: { fontSize: 12.5, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  text: { fontSize: 15, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 20, paddingTop: 2 },
})
