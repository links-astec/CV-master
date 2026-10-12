// The editor preview's one-page check for the open CV, shared with the export screen
// (which asks before shrinking a long CV, like the website's export pop-up).
import type { PageInfo } from '@/lib/previewHtml'

const byCv = new Map<string, PageInfo>()
export const setPageInfo = (id: string, p: PageInfo) => { byCv.set(id, p) }
export const pageInfoOf = (id: string): PageInfo | null => byCv.get(id) || null
