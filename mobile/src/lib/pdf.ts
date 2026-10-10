// The free preview PDF (with the CVMaster watermark), made by the server exactly like the
// website's, then handed to the phone's share sheet (save to Files, email, print…).
// The clean PDF needs a purchase, which comes with in-app payments.
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { BRAND } from '@/brand'
import { api, ApiError } from '@/lib/api'
import { flush } from '@/lib/editor'
import { t } from '@/i18n'

export async function sharePreviewPdf(draftId: string) {
  await flush()   // the PDF is made from the saved CV, so save the latest edits first
  const { token, fileName } = await api<{ token: string; fileName: string }>('/api/cv/store-for-unlock', { body: { draftId } })

  let res: Response
  try {
    res = await fetch(BRAND.api + '/api/cv/download-watermarked', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
  } catch {
    throw new ApiError(t('Connection error. Please try again.'), 0)
  }
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new ApiError(t(j?.error || 'Download failed. Please try again.'), res.status)
  }
  const bytes = new Uint8Array(await res.arrayBuffer())

  const name = String(fileName || 'cv.pdf').replace(/\.pdf$/i, '').replace(/[^\w.-]+/g, '-') + '-preview.pdf'
  const file = new File(Paths.cache, name)
  file.create({ overwrite: true })
  file.write(bytes)

  if (!(await Sharing.isAvailableAsync())) throw new ApiError(t('Download failed. Please try again.'), 0)
  await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: name })
}
