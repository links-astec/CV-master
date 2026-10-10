// Profile photo: picked from the library, cropped square, resized to 600px and saved as a JPEG
// data URL, which is how the website stores it (the renderer only accepts data:image/... URLs).
import { useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { setField } from '@/lib/editor'
import { SmallAction } from '@/components/ui'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

export function PhotoField({ photo, initials }: { photo: string | null; initials: string }) {
  const { t } = useLang()
  const c = useColors()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function choose() {
    setError('')
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 1 })
    if (res.canceled || !res.assets?.[0]) return
    setBusy(true)
    try {
      const img = await ImageManipulator.manipulate(res.assets[0].uri).resize({ width: 600, height: null }).renderAsync()
      const out = await img.saveAsync({ base64: true, compress: 0.8, format: SaveFormat.JPEG })
      if (!out.base64) throw new Error('no data')
      setField('photo', `data:image/jpeg;base64,${out.base64}`)
    } catch {
      setError(t('Something went wrong. Please try again.'))
    }
    setBusy(false)
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.avatar, { backgroundColor: c.accentSoft, borderColor: c.border }]}>
        {busy ? <ActivityIndicator color={c.accent} />
          : photo ? <Image source={{ uri: photo }} style={styles.img} accessibilityLabel={t('Profile Photo')} />
          : <Text style={{ color: c.accent, fontSize: 22, fontWeight: '700' }}>{initials}</Text>}
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={[styles.label, { color: c.text2 }]}>{t('Profile Photo')}</Text>
        <View style={styles.actions}>
          <SmallAction label={photo ? t('Change photo') : t('Choose a photo')} onPress={choose} disabled={busy} />
          {!!photo && <SmallAction label={t('Remove photo')} onPress={() => setField('photo', null)} color={c.danger} disabled={busy} />}
        </View>
        {!!error && <Text style={{ color: c.danger, fontSize: 13 }}>{error}</Text>}
        <Text style={[styles.hint, { color: c.text3 }]}>{t('Your photo appears in layouts tagged “Photo”; the others show your initials or no picture.')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  img: { width: 72, height: 72 },
  label: { fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 18 },
  hint: { fontSize: 12.5, lineHeight: 17 },
})
