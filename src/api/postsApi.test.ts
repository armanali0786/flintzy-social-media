import type { Post } from '@/types/post'
import { createPostsApi, RETRY_DELAY_MS } from './postsApi'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'post-1',
    content: 'Hello world',
    platforms: ['x'],
    scheduledAt: '2026-10-16T10:00:00.000Z',
    status: 'failed',
    errorMessage: 'Network timeout',
    ...overrides,
  }
}

describe('postsApi', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns posts after the simulated latency', async () => {
    const api = createPostsApi({ initialPosts: [makePost()], latencyMs: 600 })
    const result = api.getPosts()

    await vi.advanceTimersByTimeAsync(600)

    await expect(result).resolves.toEqual([makePost()])
  })

  it('creates a scheduled post with a generated id', async () => {
    const api = createPostsApi({ initialPosts: [], latencyMs: 0 })
    const created = api.createPost({
      content: 'New post',
      platforms: ['facebook', 'instagram'],
      scheduledAt: '2026-12-01T09:00:00.000Z',
    })
    await vi.advanceTimersByTimeAsync(0)

    const post = await created
    expect(post).toMatchObject({ content: 'New post', status: 'scheduled' })
    expect(post.id).toBeTruthy()

    const all = api.getPosts()
    await vi.advanceTimersByTimeAsync(0)
    await expect(all).resolves.toEqual([post])
  })

  describe('retryPost', () => {
    it('settles only after the one second delay', async () => {
      const api = createPostsApi({
        initialPosts: [makePost()],
        random: () => 0.5,
      })
      let settled = false
      void api.retryPost('post-1').then(() => {
        settled = true
      })

      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS - 1)
      expect(settled).toBe(false)

      await vi.advanceTimersByTimeAsync(1)
      expect(settled).toBe(true)
    })

    it('publishes the post and clears the error on success', async () => {
      const api = createPostsApi({
        initialPosts: [makePost()],
        latencyMs: 0,
        random: () => 0.2,
      })
      const retried = api.retryPost('post-1')
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)

      const post = await retried
      expect(post.status).toBe('published')
      expect(post.errorMessage).toBeUndefined()

      const all = api.getPosts()
      await vi.advanceTimersByTimeAsync(0)
      expect((await all)[0].status).toBe('published')
    })

    it('rejects and leaves the post failed when the simulated request fails', async () => {
      const api = createPostsApi({
        initialPosts: [makePost()],
        latencyMs: 0,
        random: () => 0.19,
      })
      const retried = expect(api.retryPost('post-1')).rejects.toThrow(
        "The platform didn't respond. Try again.",
      )
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
      await retried

      const all = api.getPosts()
      await vi.advanceTimersByTimeAsync(0)
      expect(await all).toEqual([makePost()])
    })

    it('fails roughly 20% of the time with real randomness', async () => {
      const outcomes = await Promise.all(
        Array.from({ length: 2000 }, async () => {
          const api = createPostsApi({ initialPosts: [makePost()] })
          const result = api.retryPost('post-1').then(
            () => 'ok',
            () => 'failed',
          )
          await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
          return result
        }),
      )
      const failureRate =
        outcomes.filter((outcome) => outcome === 'failed').length /
        outcomes.length
      expect(failureRate).toBeGreaterThan(0.15)
      expect(failureRate).toBeLessThan(0.25)
    })

    it('only retries failed posts', async () => {
      const api = createPostsApi({
        initialPosts: [
          makePost({ status: 'scheduled', errorMessage: undefined }),
        ],
        random: () => 0.5,
      })
      const retried = expect(api.retryPost('post-1')).rejects.toThrow(
        'Only failed posts can be retried.',
      )
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
      await retried
    })

    it('rejects unknown posts', async () => {
      const api = createPostsApi({ initialPosts: [], random: () => 0.5 })
      const retried = expect(api.retryPost('missing')).rejects.toThrow(
        'This post no longer exists.',
      )
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
      await retried
    })
  })
})
