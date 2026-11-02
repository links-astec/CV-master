// The cover letter as a PDF, from the Letter tab or the editor's top bar. The server builds it from the
// saved CV, so the latest edits are saved first. Resolves 'done', or 'pay' when the letter isn't unlocked
// yet (it comes with the CV's PDF); throws with a message the person can read.
export async function downloadLetterPdf(store) {
  const id = await store.saveDraft({ force: true })
  const r = await fetch((import.meta.env.VITE_API_URL || '') + '/api/cv/letter-pdf', {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftId: id || store.currentDraftId }),
  })
  if (r.status === 402) return 'pay'
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Download failed. Please try again.') }
  const blob = await r.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = ([store.data.fn, store.data.ln].filter(Boolean).join('-') || 'Cover') + '-Cover-letter.pdf'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 3000)
  return 'done'
}
