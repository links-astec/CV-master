// Opens the CV with this id in the editor ('guest' = the CV kept on the phone) and returns it.
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDrafts } from '@/lib/drafts'
import { openDraft, openGuestCv, useEditor } from '@/lib/editor'
import { GUEST_ID, newGuest, readGuest } from '@/lib/guest'
import { useAuth } from '@/lib/auth'

export function useGuest() {
  return useQuery({ queryKey: ['guest'], queryFn: async () => (await readGuest()) ?? null })
}

export function useOpenCv(id: string | undefined | null) {
  const { user } = useAuth()
  const isGuest = id === GUEST_ID
  const drafts = useDrafts(!!user && !isGuest)
  const guest = useGuest()
  const draft = !isGuest ? drafts.data?.find(d => d.id === id) : undefined

  useEffect(() => {
    if (isGuest && guest.isFetched) openGuestCv(guest.data ?? newGuest())
    else if (draft) openDraft(draft)
  }, [isGuest, guest.isFetched, guest.data, draft])

  const cv = useEditor()
  const loading = isGuest ? !guest.isFetched || cv?.id !== GUEST_ID : drafts.isLoading || (!!draft && cv?.id !== id)
  return { cv: cv && cv.id === id ? cv : null, loading, missing: !isGuest && !drafts.isLoading && !draft }
}
