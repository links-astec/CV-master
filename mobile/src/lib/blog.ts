// The CVMaster blog (articles, product updates, news, links shared from elsewhere), the same
// posts as www.cvmaster.live/blog, in the reader's language when translated (else English).
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BRAND } from '@/brand'

export type Post = {
  slug: string; lang: string; title: string; excerpt: string; cover: string | null; category: 'article' | 'update' | 'news' | 'link'
  sourceName: string | null; sourceUrl: string | null; publishedAt: string; readingMin: number; url: string
}
export const CATEGORY_LABEL: Record<Post['category'], string> = { article: 'Articles', update: 'Product updates', news: 'News', link: 'From around the web' }

export const usePosts = (lang: string, category: string | null = null, limit = 30) =>
  useQuery({
    queryKey: ['posts', lang, category, limit],
    queryFn: () => api<{ items: Post[] }>(`/api/posts?lang=${lang}&limit=${limit}${category ? `&category=${category}` : ''}`).then(r => r.items),
    staleTime: 5 * 60_000,
  })

// The article page, made for the app (no website header or footer) in the app's light or dark look
export const articleUrl = (slug: string, dark: boolean) => `${BRAND.api}/blog/${encodeURIComponent(slug)}?app=1&theme=${dark ? 'dark' : 'light'}`
