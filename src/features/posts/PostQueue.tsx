import {
  filterPosts,
  hasActiveFilters,
  type PostFilters,
} from '@/features/filters/filterParams'
import { StatePanel } from '@/components/ui/StatePanel'
import { groupPostsByDay } from '@/lib/dates'
import { PostCard } from './PostCard'
import { QueueSkeleton } from './QueueSkeleton'
import { usePosts } from './usePosts'

interface PostQueueProps {
  filters: PostFilters
  onClearFilters: () => void
  onCreatePost: () => void
}

export function PostQueue({
  filters,
  onClearFilters,
  onCreatePost,
}: PostQueueProps) {
  const { data: posts, isPending, isError, refetch } = usePosts()

  if (isPending) {
    return <QueueSkeleton />
  }

  if (isError) {
    return (
      <StatePanel
        role="alert"
        title="We couldn't load your posts"
        description="Check your connection and try again."
        action={
          <button
            type="button"
            className="btn-primary-sm"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        }
      />
    )
  }

  if (posts.length === 0) {
    return (
      <StatePanel
        title="No posts yet"
        description="Posts you schedule will appear here."
        action={
          <button
            type="button"
            className="btn-primary-sm"
            onClick={onCreatePost}
          >
            Create a post
          </button>
        }
      />
    )
  }

  const visiblePosts = filterPosts(posts, filters)

  if (visiblePosts.length === 0) {
    return (
      <StatePanel
        title="No posts match your filters"
        description="Try a different search or remove some filters."
        action={
          <button
            type="button"
            className="btn-primary-sm"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {hasActiveFilters(filters) && (
        <p role="status" className="text-body-sm text-muted">
          Showing {visiblePosts.length} of {posts.length} posts
        </p>
      )}
      {groupPostsByDay(visiblePosts).map((group) => (
        <section key={group.key} aria-labelledby={`day-${group.key}`}>
          <h3
            id={`day-${group.key}`}
            className="sticky top-0 z-10 mb-3 flex items-baseline gap-2 bg-canvas-mint py-2 text-body-lg font-bold"
          >
            {group.label}
            <span className="font-sans text-body-sm text-muted">
              {group.posts.length} {group.posts.length === 1 ? 'post' : 'posts'}
            </span>
          </h3>
          <ul className="flex flex-col gap-3">
            {group.posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
