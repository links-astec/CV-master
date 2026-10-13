// The app's own confirmation pop-up and toast, like the website's ConfirmModal and toasts
// (never the phone's system alert). Call confirm() or toast() from anywhere; <DialogHost/> in the
// root layout shows them.
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Btn, Txt } from '@/components/kit'
import { useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

type Ask = { title: string; message?: string; ok?: string; cancel?: string; danger?: boolean; resolve: (v: boolean) => void }
let ask: Ask | null = null
let note: { text: string; id: number } | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }

export function confirm(o: Omit<Ask, 'resolve'>): Promise<boolean> {
  ask?.resolve(false)
  return new Promise(resolve => { ask = { ...o, resolve }; emit() })
}

let noteTimer: ReturnType<typeof setTimeout> | null = null
export function toast(text: string) {
  note = { text, id: Date.now() }
  emit()
  if (noteTimer) clearTimeout(noteTimer)
  noteTimer = setTimeout(() => { note = null; emit() }, 3200)
}

function close(v: boolean) {
  const a = ask
  ask = null
  emit()
  a?.resolve(v)
}

export function DialogHost() {
  const { c } = useTheme()
  const { t } = useLang()
  const insets = useSafeAreaInsets()
  const a = useSyncExternalStore(subscribe, () => ask)
  const n = useSyncExternalStore(subscribe, () => note)
  const [fade] = useState(() => new Animated.Value(0))
  useEffect(() => {
    Animated.timing(fade, { toValue: n ? 1 : 0, duration: 180, useNativeDriver: true }).start()
  }, [n, fade])

  return (
    <>
      <Modal visible={!!a} transparent animationType="fade" onRequestClose={() => close(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: c.overlay }]} onPress={() => close(false)}>
          <Pressable style={[styles.box, { backgroundColor: c.surface, borderColor: 'transparent' }]} onPress={() => {}}>
            <Txt w={700} size={18}>{a?.title}</Txt>
            {!!a?.message && <Txt size={15} color={c.text2} style={{ lineHeight: 22 }}>{a.message}</Txt>}
            <View style={styles.row}>
              <Btn title={a?.cancel || t('Cancel')} kind="secondary" onPress={() => close(false)} style={{ flex: 1 }} />
              <Btn title={a?.ok || t('Confirm')} kind={a?.danger ? 'danger' : 'primary'} onPress={() => close(true)} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {!!n && (
        <Animated.View pointerEvents="none" style={[styles.toast, { bottom: insets.bottom + 92, opacity: fade, backgroundColor: c.text }]}>
          <Txt w={600} size={14.5} color={c.bg} style={{ textAlign: 'center' }}>{n.text}</Txt>
        </Animated.View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 28 },
  box: { borderRadius: 26, borderWidth: 1, padding: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  toast: { position: 'absolute', left: 24, right: 24, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 18, alignItems: 'center' },
})
