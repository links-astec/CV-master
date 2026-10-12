// Attaching a file on the phone to an upload. This Expo version's fetch only accepts real file
// objects in FormData (the old React Native { uri, name, type } object fails with
// "Unsupported FormDataPart implementation"), so the file is wrapped in expo-file-system's File,
// which is a Blob. The name is passed too: the server tells the file type from it.
import { Platform } from 'react-native'
import { File } from 'expo-file-system'

export function appendFile(form: FormData, field: string, uri: string, name: string, type: string) {
  if (Platform.OS === 'web') {
    // Browser build (screenshots only): uploads aren't used there
    form.append(field, new Blob([], { type }), name)
    return
  }
  form.append(field, new File(uri) as unknown as Blob, name)
}
