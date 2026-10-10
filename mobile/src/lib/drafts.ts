import { useQuery } from '@tanstack/react-query'
import { api, type Draft } from '@/lib/api'

// The signed-in user's CVs (same list as the website's dashboard)
export function useDrafts(enabled = true) {
  return useQuery({ queryKey: ['drafts'], queryFn: () => api<Draft[]>('/api/drafts'), enabled })
}
