import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { postsApi } from '@/api/postsApi'
import { useToast } from '@/components/ui/useToast'
import type { Post } from '@/types/post'
import { postsQueryKey } from './usePosts'

export const retryMutationKey = (postId: string) =>
  ['posts', 'retry', postId] as const

function replacePost(queryClient: QueryClient, post: Post) {
  queryClient.setQueryData<Post[]>(postsQueryKey, (posts) =>
    posts?.map((p) => (p.id === post.id ? post : p)),
  )
}

function preview(content: string) {
  const characters = Array.from(content)
  return characters.length > 40
    ? `${characters.slice(0, 40).join('').trimEnd()}…`
    : content
}

/**
 * Optimistically shows the post as published, then confirms or rolls back.
 * Only the retried post is touched, so retries of other posts can run at the
 * same time without overwriting each other.
 */
export function useRetryPost(postId: string) {
  const queryClient = useQueryClient()
  const showToast = useToast()

  return useMutation({
    mutationKey: retryMutationKey(postId),
    mutationFn: () => postsApi.retryPost(postId),

    onMutate: async () => {
      // A refetch landing now would overwrite the optimistic update.
      await queryClient.cancelQueries({ queryKey: postsQueryKey })

      const previous = queryClient
        .getQueryData<Post[]>(postsQueryKey)
        ?.find((post) => post.id === postId)
      if (previous) {
        replacePost(queryClient, {
          ...previous,
          status: 'published',
          errorMessage: undefined,
        })
      }
      return { previous }
    },

    onSuccess: (post) => replacePost(queryClient, post),

    onError: (error, _variables, context) => {
      if (context?.previous) replacePost(queryClient, context.previous)
      const name = context?.previous
        ? `“${preview(context.previous.content)}”`
        : 'this post'
      showToast({
        tone: 'error',
        message: `Retry failed for ${name}: ${error.message}`,
      })
    },
  })
}
