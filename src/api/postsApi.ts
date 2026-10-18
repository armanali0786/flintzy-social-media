import { loadMockPosts } from '@/mocks/loadMockPosts'
import type { Post } from '@/types/post'

export type NewPost = Pick<
  Post,
  'content' | 'platforms' | 'mediaUrl' | 'scheduledAt'
>

export const RETRY_DELAY_MS = 1000
export const RETRY_FAILURE_RATE = 0.2

interface PostsApiOptions {
  initialPosts: Post[]
  latencyMs?: number
  random?: () => number
  /** Number of initial getPosts calls that fail, to demo the error state */
  failedLoads?: number
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function createPostsApi({
  initialPosts,
  latencyMs = 600,
  random = () => Math.random(),
  failedLoads = 0,
}: PostsApiOptions) {
  let posts = initialPosts
  let failedLoadsLeft = failedLoads

  return {
    async getPosts(): Promise<Post[]> {
      await wait(latencyMs)
      if (failedLoadsLeft > 0) {
        failedLoadsLeft--
        throw new Error("Couldn't reach the server.")
      }
      return [...posts]
    },

    async createPost(input: NewPost): Promise<Post> {
      await wait(latencyMs)
      const post: Post = {
        ...input,
        id: crypto.randomUUID(),
        status: 'scheduled',
      }
      posts = [...posts, post]
      return post
    },

    async retryPost(id: string): Promise<Post> {
      await wait(RETRY_DELAY_MS)

      const post = posts.find((p) => p.id === id)
      if (!post) {
        throw new Error('This post no longer exists.')
      }
      if (post.status !== 'failed') {
        throw new Error('Only failed posts can be retried.')
      }
      if (random() < RETRY_FAILURE_RATE) {
        throw new Error("The platform didn't respond. Try again.")
      }

      const updated: Post = {
        ...post,
        status: 'published',
        errorMessage: undefined,
      }
      posts = posts.map((p) => (p.id === id ? updated : p))
      return updated
    },
  }
}

export type PostsApi = ReturnType<typeof createPostsApi>

// Opening the app with `?simulate=load-error` makes the first load fail, so
// the error state can be demonstrated on the deployed site.
const simulateLoadError =
  new URLSearchParams(window.location.search).get('simulate') === 'load-error'

export const postsApi = createPostsApi({
  initialPosts: loadMockPosts(),
  failedLoads: simulateLoadError ? 1 : 0,
})
