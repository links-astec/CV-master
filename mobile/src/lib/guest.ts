// Guest mode, like the website: without an account, one CV is kept on this phone. When the person
// creates an account or signs in, it moves into their account ("The CV you built comes with you").
import { File, Paths } from 'expo-file-system'
import { defaultFmt, emptyData, hasCvContent, type CvData, type CvFmt } from '@/lib/cv'
import { DEFAULT_TEMPLATE } from '@web/composables/cvRenderer.js'

export const GUEST_ID = 'guest'
export type GuestCv = { data: CvData; fmt: CvFmt; template: string; updatedAt: string }

const file = () => new File(Paths.document, 'guest-cv.json')

export async function readGuest(): Promise<GuestCv | null> {
  try {
    const f = file()
    if (!f.exists) return null
    const j = JSON.parse(await f.text())
    return j && typeof j === 'object' && j.data ? j as GuestCv : null
  } catch { return null }
}

export function writeGuest(cv: Omit<GuestCv, 'updatedAt'>): GuestCv {
  const out = { ...cv, updatedAt: new Date().toISOString() }
  const f = file()
  f.create({ overwrite: true })
  f.write(JSON.stringify(out))
  return out
}

export function newGuest(data: CvData = emptyData(), template: string = DEFAULT_TEMPLATE): GuestCv {
  return writeGuest({ data, fmt: defaultFmt(), template })
}

export function clearGuest() {
  try { const f = file(); if (f.exists) f.delete() } catch {}
}

export const guestHasContent = (g: GuestCv | null) => !!g && (hasCvContent(g.data) || !!(g.data.fn || g.data.ln || g.data.email))
