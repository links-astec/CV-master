// "Speak or type your career story", like the website's microphone: tap to record, tap to stop,
// and the words are added to the text (which stays editable). The website uses the browser's
// speech recognition; the app records a clip and the server turns it into text in the app's
// language (it doesn't use up AI requests).
import { useEffect, useRef, useState } from 'react'
import { Animated, Linking, Platform, Pressable, StyleSheet, View } from 'react-native'
import { File } from 'expo-file-system'
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio'
import { Mic, Square } from '@/components/icons'
import { Txt } from '@/components/kit'
import { BRAND } from '@/brand'
import { CLIENT_HEADERS } from '@/lib/api'
import { lang, useLang } from '@/i18n'
import { useTheme } from '@/lib/theme'

const MAX_MS = 5 * 60 * 1000   // a clip is at most 5 minutes; record again to add more
// A problem worth showing as it is (in English, under the translated message) while we test
const detail = (e: unknown) => (e instanceof Error ? e.message : String(e || '')).slice(0, 160)

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
  const [why, setWhy] = useState('')            // the technical reason, small, for testing
  const [blocked, setBlocked] = useState(false)  // permission refused for good: offer the phone's settings
  const [pulse] = useState(() => new Animated.Value(0))
  const limit = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (phase !== 'recording') { pulse.stopAnimation(); pulse.setValue(0); return }
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }))
    loop.start()
    return () => loop.stop()
  }, [phase, pulse])

  async function start() {
    setError(''); setWhy(''); setBlocked(false)
    const p = await requestRecordingPermissionsAsync().catch(() => null)
    if (!p?.granted) {
      setError(t('Microphone access is off. Allow it for CVMaster in your phone’s settings, or type instead.'))
      setBlocked(p?.canAskAgain === false)
      return
    }
    try {
      // iPhone: the audio session must allow recording before the recorder is prepared
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true })
      try { await recorder.prepareToRecordAsync() }
      catch {
        // The session can need a moment after the permission prompt closes: try once more
        await new Promise(r => setTimeout(r, 400))
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true })
        await recorder.prepareToRecordAsync()
      }
      recorder.record()
      setPhase('recording')
      limit.current = setTimeout(stop, MAX_MS)   // stop at the time limit
    } catch (e) {
      setError(t('The microphone couldn’t start. Close other apps using it (calls, voice notes) and try again.'))
      setWhy(detail(e))
      setAudioModeAsync({ allowsRecording: false }).catch(() => {})
    }
  }

  async function stop() {
    if (limit.current) { clearTimeout(limit.current); limit.current = null }
    setPhase('working')
    let stage = 'stop'
    try {
      const ms = recorder.getStatus().durationMillis || 0
      await recorder.stop()
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {})
      const uri = recorder.uri
      if (!uri) throw new Error('no recording file')
      // Nothing (or almost nothing) was recorded: say so instead of sending silence
      let size = 0
      try { size = new File(uri).size || 0 } catch {}
      if ((ms > 0 && ms < 700) || (size > 0 && size < 2000)) {
        setError(t('Nothing was recorded. Hold the phone close, speak, then tap stop.'))
        setWhy(`${ms} ms, ${size} bytes`)
        setPhase('idle')
        return
      }
      stage = 'upload'
      const text = (await transcribe(uri)).trim()
      if (!text) { setError(t('We could not understand the recording. Please try again.')); setPhase('idle'); return }
      onText(text)
      setPhase('done')
    } catch (e) {
      // Server messages are English keys (translated); anything else is shown as a reason
      const m = detail(e)
      setError(t(stage === 'upload' && m ? m : 'We could not understand the recording. Please try again.'))
      if (stage !== 'upload' || m.startsWith('Network')) setWhy(m)
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
      {!!why && <Txt size={11.5} color={c.text3} style={{ textAlign: 'center' }} selectable>{why}</Txt>}
      {blocked && Platform.OS !== 'web' && (
        <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button" hitSlop={8}>
          <Txt w={600} size={14} color={c.accent}>{t('Open settings')}</Txt>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 20, gap: 12, alignItems: 'center' },
  btnWrap: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  btn: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 76, height: 76, borderRadius: 38, borderWidth: 3 },
})
