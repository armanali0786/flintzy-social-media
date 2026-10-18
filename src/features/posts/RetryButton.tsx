import { useQueryClient } from '@tanstack/react-query'
import { retryMutationKey, useRetryPost } from './useRetryPost'

interface RetryButtonProps {
  postId: string
  /** Id of the element explaining why the post failed */
  describedBy?: string
}

export function RetryButton({ postId, describedBy }: RetryButtonProps) {
  const queryClient = useQueryClient()
  const retry = useRetryPost(postId)

  const handleClick = () => {
    const alreadyRetrying =
      queryClient.isMutating({ mutationKey: retryMutationKey(postId) }) > 0
    if (!alreadyRetrying) retry.mutate()
  }

  return (
    <button
      type="button"
      className="btn-primary-sm self-start"
      aria-describedby={describedBy}
      disabled={retry.isPending}
      onClick={handleClick}
    >
      Retry
    </button>
  )
}
