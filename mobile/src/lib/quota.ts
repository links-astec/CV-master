// Today's AI allowance (free requests left and paid extras), the same counter as the website's
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type Quota = { tier: 'guest' | 'unverified' | 'verified' | 'pass'; freeLeft: number; limit: number; credits: number }
export const useQuota = () => useQuery({ queryKey: ['ai-quota'], queryFn: () => api<Quota>('/api/ai/quota') })
