import { PlatformIcon } from '@/components/PlatformIcon'
import { formatLocalTime } from '@/lib/dates'
import type { Post } from '@/types/post'
import { StatusBadge } from './StatusBadge'

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="card flex gap-4 p-4 sm:p-5">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <time dateTime={post.scheduledAt} className="font-semibold">
            {formatLocalTime(post.scheduledAt)}
          </time>
          <StatusBadge status={post.status} />
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

        {post.status === 'failed' && post.errorMessage && (
          <p className="rounded-sm bg-danger-soft px-3 py-2 text-body-sm text-danger">
            {post.errorMessage}
          </p>
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
