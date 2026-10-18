import { useQuery } from '@tanstack/react-query'
import { postsApi } from '@/api/postsApi'

export const postsQueryKey = ['posts'] as const

export function usePosts() {
  return useQuery({
    queryKey: postsQueryKey,
    queryFn: () => postsApi.getPosts(),
  })
}
