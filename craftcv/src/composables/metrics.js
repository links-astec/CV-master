// Placeholders the AI leaves where a figure would help ([X%], [N], [€X], [X months]…), and how to ask for each.
// Same pattern as the CV review's "Placeholders to fill in" check.
export const PLACEHOLDER_RE = /\[[^\]\n]{0,12}\b[XN]\b[^\]\n]{0,12}\]/

export const hasPlaceholders = (text) => PLACEHOLDER_RE.test(String(text || ''))
export const countPlaceholders = (text) => (String(text || '').match(new RegExp(PLACEHOLDER_RE.source, 'g')) || []).length

// "[£X]" → prefix £; "[X%]" → suffix %; "[N users]" → suffix users; "[X]" → plain number
export function placeholderSlot(raw) {
  const inner = raw.slice(1, -1).trim()
  const cur = inner.match(/[£€$]|GH₵|₵/)
  const prefix = cur ? cur[0] : ''
  const rest = inner.replace(/[£€$]|GH₵|₵/, '').replace(/\b[XN]\b/, '').trim()
  const suffix = rest === '%' || rest.startsWith('%') ? '%' : rest.replace(/^[+~]\s*/, '')
  return { prefix, suffix, numeric: true, hint: prefix ? '1,200' : suffix === '%' ? '20' : '8' }
}
