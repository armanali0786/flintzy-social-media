import { useIsMutating } from '@tanstack/react-query'
import { useId } from 'react'
import { PlatformIcon } from '@/components/PlatformIcon'
import { formatLocalTime } from '@/lib/dates'
import type { Post } from '@/types/post'
import { RetryButton } from './RetryButton'
import { StatusBadge } from './StatusBadge'
import { retryMutationKey } from './useRetryPost'

export function PostCard({ post }: { post: Post }) {
  const errorId = useId()
  const isRetrying =
    useIsMutating({ mutationKey: retryMutationKey(post.id) }) > 0

  return (
    <article className="card flex gap-4 p-4 sm:p-5">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <time dateTime={post.scheduledAt} className="font-semibold">
            {formatLocalTime(post.scheduledAt)}
          </time>
          <StatusBadge status={post.status} />
          {isRetrying && (
            <span role="status" className="text-caption text-muted">
              Confirming…
            </span>
          )}
          <ul
            aria-label="Platforms"
            className="ml-auto flex items-center gap-2"
          >
            {post.platforms.map((platform) => (
              <li key={platform}>
                <PlatformIcon platform={platform} />
              </li>
            ))}
          </ul>
        </div>

        <p className="line-clamp-3 break-words whitespace-pre-line">
          {post.content}
        </p>

        {post.status === 'failed' && (
          <div className="flex flex-col gap-3 rounded-sm bg-danger-soft p-3 sm:flex-row sm:items-center">
            <p id={errorId} className="flex-1 text-body-sm text-danger">
              {post.errorMessage ?? 'This post failed to publish.'}
            </p>
            <RetryButton postId={post.id} describedBy={errorId} />
          </div>
        )}
      </div>

      {post.mediaUrl && (
        <img
          src={post.mediaUrl}
          alt=""
          loading="lazy"
          className="size-16 shrink-0 rounded-sm bg-surface-soft object-cover sm:size-24"
        />
      )}
    </article>
  )
}
