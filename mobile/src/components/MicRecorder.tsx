// "Speak or type your career story", like the website's microphone: tap to record, tap to stop,
// and the words are added to the text (which stays editable). The website uses the browser's
// speech recognition; the app records a clip and the server turns it into text in the app's
// language (it doesn't use up AI requests).
import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, View } from 'react-native'
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio'
import { Mic, Square } from '@/components/icons'
import { Txt } from '@/components/kit'
import { BRAND } from '@/brand'
import { CLIENT_HEADERS } from '@/lib/api'
import { lang, useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

const MAX_MS = 5 * 60 * 1000   // a clip is at most 5 minutes; record again to add more

async function transcribe(uri: string): Promise<string> {
  const form = new FormData()
  form.append('audio', { uri, name: 'speech.m4a', type: 'audio/m4a' } as unknown as Blob)
  form.append('lang', lang.value)
  const res = await fetch(BRAND.api + '/api/ai/transcribe', { method: 'POST', credentials: 'include', headers: CLIENT_HEADERS, body: form })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j?.error || 'We could not understand the recording. Please try again.')
  return String(j.text || '')
}

export function MicRecorder({ onText }: { onText: (text: string) => void }) {
  const { t } = useLang()
  const { c } = useTheme()
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const state = useAudioRecorderState(recorder, 250)
  const [phase, setPhase] = useState<'idle' | 'recording' | 'working' | 'done'>('idle')
  const [error, setError] = useState('')
  const [pulse] = useState(() => new Animated.Value(0))
  const limit = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (phase !== 'recording') { pulse.stopAnimation(); pulse.setValue(0); return }
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }))
    loop.start()
    return () => loop.stop()
  }, [phase, pulse])

  async function start() {
    setError('')
    const p = await requestRecordingPermissionsAsync().catch(() => null)
    if (!p?.granted) { setError(t('Microphone access is off. Allow it for CVMaster in your phone’s settings, or type instead.')); return }
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true })
      await recorder.prepareToRecordAsync()
      recorder.record()
      setPhase('recording')
      limit.current = setTimeout(stop, MAX_MS)   // stop at the time limit
    } catch { setError(t('Microphone access is off. Allow it for CVMaster in your phone’s settings, or type instead.')) }
  }

  async function stop() {
    if (limit.current) { clearTimeout(limit.current); limit.current = null }
    setPhase('working')
    try {
      await recorder.stop()
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {})
      if (!recorder.uri) throw new Error()
      const text = (await transcribe(recorder.uri)).trim()
      if (text) onText(text)
      setPhase('done')
    } catch (e) {
      setError(t(e instanceof Error && e.message ? e.message : 'We could not understand the recording. Please try again.'))
      setPhase('idle')
    }
  }


  const recording = phase === 'recording'
  const secs = Math.floor((state.durationMillis || 0) / 1000)
  const label = phase === 'recording' ? `${t('Recording… tap to stop')}  ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
    : phase === 'working' ? t('Turning your words into text…')
    : phase === 'done' ? t('Recording stopped, review below')
    : t('Tap to start recording')

  return (
    <View style={[styles.card, { borderColor: c.border, backgroundColor: c.surface2 }]}>
      <View style={styles.btnWrap}>
        {recording && (
          <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: c.danger, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }] }]} />
        )}
        <Pressable
          onPress={recording ? stop : start} disabled={phase === 'working'} accessibilityRole="button"
          accessibilityLabel={recording ? t('Recording… tap to stop') : t('Tap to start recording')}
          style={({ pressed }) => [styles.btn, { backgroundColor: recording ? c.danger : c.accent, opacity: phase === 'working' ? 0.5 : pressed ? 0.85 : 1 }]}>
          {recording ? <Square size={24} color="#fff" fill="#fff" /> : <Mic size={30} color="#fff" strokeWidth={1.8} />}
        </Pressable>
      </View>
      <Txt w={600} size={14.5} color={recording ? c.danger : c.text2} style={{ textAlign: 'center' }}>{label}</Txt>
      {!!error && <Txt size={13.5} color={c.danger} style={{ textAlign: 'center', lineHeight: 19 }}>{error}</Txt>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 20, gap: 12, alignItems: 'center' },
  btnWrap: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  btn: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 76, height: 76, borderRadius: 38, borderWidth: 3 },
})
