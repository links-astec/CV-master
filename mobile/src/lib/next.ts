// The user's personal next step (from their latest CV and, if they allow it, their activity):
// the same suggestion as the website's My CVs card, and their favourite layout.
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { api } from '@/lib/api'
import { setCurrentCv } from '@/lib/editor'

export type NextStep = {
  key: string; title: string; body: string; action: 'new' | 'edit' | 'job' | 'export'
  section?: string; draftId: string | null; favLayout: string | null; personal: boolean
}
export const useNextStep = (enabled = true) =>
  useQuery({ queryKey: ['next'], queryFn: () => api<NextStep>('/api/me/next'), enabled, staleTime: 15_000 })

export const NEXT_LABEL: Record<NextStep['action'], string> = { new: 'Start', edit: 'Continue', job: 'Match to a job', export: 'Get my PDF' }

export function goNext(n: NextStep) {
  if (n.action === 'new' || !n.draftId) { router.push('/new'); return }
  setCurrentCv(n.draftId)
  if (n.action === 'edit') router.push({ pathname: '/edit', params: { section: n.section || 'personal' } })
  else if (n.action === 'job') router.push({ pathname: '/edit', params: { tab: 'job' } })
  else { router.navigate('/editor'); setTimeout(() => router.push('/export'), 250) }
}
