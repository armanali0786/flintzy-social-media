import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi, type NewPost } from '@/api/postsApi'
import { postsQueryKey } from '@/features/posts/usePosts'

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (post: NewPost) => postsApi.createPost(post),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postsQueryKey })
    },
  })
}
