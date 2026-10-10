// Opens the CV with this id in the editor (from the drafts list) and returns it.
import { useEffect } from 'react'
import { useDrafts } from '@/lib/drafts'
import { openDraft, useEditor } from '@/lib/editor'

export function useOpenCv(id: string | undefined) {
  const { data, isLoading } = useDrafts()
  const draft = data?.find(d => d.id === id)
  useEffect(() => { if (draft) openDraft(draft) }, [draft])
  const cv = useEditor()
  return { cv: cv && cv.id === id ? cv : null, loading: isLoading || (!!draft && cv?.id !== id), missing: !isLoading && !draft }
}
