// Getting a CV out of the app, the same ways as the website: the free preview PDF (with the
// CVMaster watermark), and the clean PDF (€0.99 per CV, or a referral credit), emailed and
// downloadable. PDFs are made by the server and handed to the phone's share sheet
// (save to Files, email, print…).
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { BRAND } from '@/brand'
import { api, ApiError, CLIENT_HEADERS } from '@/lib/api'
import { flush } from '@/lib/editor'
import { t } from '@/i18n'

async function postPdf(path: string, body: unknown): Promise<Uint8Array> {
  let res: Response
  try {
    res = await fetch(BRAND.api + path, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...CLIENT_HEADERS },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(t('Connection error. Please try again.'), 0)
  }
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new ApiError(t(j?.error || 'Download failed. Please try again.'), res.status)
  }
  return new Uint8Array(await res.arrayBuffer())
}

async function share(bytes: Uint8Array, fileName: string) {
  const name = String(fileName || 'cv.pdf').replace(/\.pdf$/i, '').replace(/[^\w.-]+/g, '-') + '.pdf'
  const file = new File(Paths.cache, name)
  file.create({ overwrite: true })
  file.write(bytes)
  if (!(await Sharing.isAvailableAsync())) throw new ApiError(t('Download failed. Please try again.'), 0)
  await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: name })
}

// The free preview, with the watermark
export async function sharePreviewPdf(draftId: string) {
  await flush()   // the PDF is made from the saved CV, so save the latest edits first
  const { token, fileName } = await api<{ token: string; fileName: string }>('/api/cv/store-for-unlock', { body: { draftId } })
  const bytes = await postPdf('/api/cv/download-watermarked', { token })
  await share(bytes, String(fileName || 'cv.pdf').replace(/\.pdf$/i, '') + '-preview')
}

// The clean PDF of a paid CV
export async function shareCleanPdf(draftId: string, fileName: string) {
  await flush()
  const bytes = await postPdf('/api/cv/export-pdf', { draftId })
  await share(bytes, fileName)
}

export const paidStatus = (draftId: string) =>
  api<{ paid: boolean }>(`/api/payment/status/${draftId}`).then(r => !!r.paid).catch(() => false)

export const emailCv = (p: { draftId: string; overrideEmail?: string | null; sessionId?: string | null }) =>
  api<{ sentTo: string }>('/api/cv/email', { body: { draftId: p.draftId, overrideEmail: p.overrideEmail || null, sessionId: p.sessionId || null } })

export const redeemCredit = (draftId: string) =>
  api<{ ok: boolean; credits?: number }>('/api/referral/redeem', { body: { product: 'email_export', draftId } })

// Pay €0.99 by card (Stripe, like the website), in a browser that returns to the app.
// → { paid, sessionId } once checkout comes back, or demo when payments aren't switched on.
// TODO before the store release: Apple and Google require their own in-app purchase here.
export async function checkout(draftId: string, withdrawalConsent: boolean): Promise<{ paid: boolean; sessionId?: string; demo?: boolean; alreadyPaid?: boolean }> {
  const s = await api<{ url?: string; demo?: boolean; alreadyPaid?: boolean }>('/api/payment/create-session', { body: { draftId, withdrawalConsent, from: 'app' } })
  if (s.alreadyPaid) return { paid: true, alreadyPaid: true }
  if (s.demo) return { paid: true, demo: true }
  if (!s.url) throw new ApiError(t('Payment could not be started.'), 0)
  const r = await WebBrowser.openAuthSessionAsync(s.url, 'cvmaster://paid')
  if (r.type === 'success' && r.url) {
    const q = Linking.parse(r.url).queryParams || {}
    if (typeof q.session === 'string' && q.session) return { paid: true, sessionId: q.session }
    return { paid: false }
  }
  // Closed by hand: the payment may still have gone through
  return { paid: await paidStatus(draftId) }
}

// 100 extra AI requests for €0.50 (Stripe, like the website), returning to the app.
// → the account's extra requests afterwards, or null if the payment didn't go through.
export async function checkoutAiPack(withdrawalConsent: boolean): Promise<number | null> {
  const s = await api<{ url?: string; demo?: boolean; credits?: number }>('/api/payment/ai-pack', { body: { withdrawalConsent, from: 'app' } })
  if (s.demo) return s.credits ?? 0
  if (!s.url) throw new ApiError(t('Payment could not be started.'), 0)
  const r = await WebBrowser.openAuthSessionAsync(s.url, 'cvmaster://paid')
  if (r.type !== 'success' || !r.url) return null
  const q = Linking.parse(r.url).queryParams || {}
  if (typeof q.ai_pack !== 'string' || !q.ai_pack) return null
  const v = await api<{ credits: number }>('/api/payment/ai-pack/verify', { body: { sessionId: q.ai_pack } })
  return v.credits
}
