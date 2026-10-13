// "Saving…", "Saved" or a retry button, shown in the editor's header
import { Pressable } from 'react-native'
import { BrandLoader } from '@/components/BrandLoader'
import { Text } from '@/components/AppText'
import { flush, type SaveState } from '@/lib/editor'
import { useLang } from '@/i18n'
import { useColors } from '@/lib/theme'

export function SaveStatus({ state }: { state: SaveState }) {
  const { t } = useLang()
  const c = useColors()
  if (state === 'saving') return <BrandLoader size={18} />
  if (state === 'error') {
    return (
      <Pressable onPress={() => void flush()} hitSlop={8} accessibilityRole="button">
        <Text style={{ color: c.danger, fontSize: 13, fontWeight: '600' }}>{t('Could not save, please try again.')}</Text>
      </Pressable>
    )
  }
  return <Text style={{ color: c.text3, fontSize: 13 }}>{state === 'saved' ? t('Saved') : t('Saving…')}</Text>
}
