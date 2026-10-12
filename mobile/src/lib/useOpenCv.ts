// Opens the account CV with this id in the editor and returns it.
import { useEffect } from 'react'
import { useDrafts } from '@/lib/drafts'
import { openDraft, useEditor } from '@/lib/editor'

export function useOpenCv(id: string | undefined | null) {
  const drafts = useDrafts(true)
  const draft = drafts.data?.find(d => d.id === id)

  useEffect(() => { if (draft) openDraft(draft) }, [draft])

  const cv = useEditor()
  const loading = drafts.isLoading || (!!draft && cv?.id !== id)
  return { cv: cv && cv.id === id ? cv : null, loading, missing: !drafts.isLoading && !draft }
}
