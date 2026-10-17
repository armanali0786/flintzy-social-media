import { groupPostsByDay } from '@/lib/dates'
import { PostCard } from './PostCard'
import { usePosts } from './usePosts'

export function PostQueue() {
  const { data: posts, isPending, isError, refetch } = usePosts()

  if (isPending) {
    return (
      <p role="status" className="card text-center text-muted">
        Loading posts…
      </p>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="card flex flex-col items-center gap-4 text-center"
      >
        <p>We couldn't load your posts.</p>
        <button
          type="button"
          className="btn-primary-sm"
          onClick={() => void refetch()}
        >
          Try again
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="card text-center">
        <p className="font-semibold">No posts yet</p>
        <p className="text-body-sm text-muted">
          Posts you schedule will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {groupPostsByDay(posts).map((group) => (
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
