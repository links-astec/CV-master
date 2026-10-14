// WebViews that show HTML the app builds itself (CV previews, thumbnails, the layout grid) never
// navigate: the page they were given is the only one they show. A web link tapped on a CV opens in
// the phone's browser instead, so an outside page can never appear inside the app looking like it.
import * as WebBrowser from 'expo-web-browser'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'

export function stayOnPage(req: ShouldStartLoadRequest, openLinks = false): boolean {
  if (/^(about|data|blob):/i.test(req.url)) return true // the page itself (and links within it)
  if (openLinks && /^https?:\/\//i.test(req.url)) WebBrowser.openBrowserAsync(req.url).catch(() => {})
  return false
}
