import { PLATFORM_CONFIG } from '@/lib/platforms'
import { PLATFORMS, POST_STATUSES } from '@/types/post'
import { loadMockPosts } from './loadMockPosts'
import seed from './posts.json'

const DAY_MS = 24 * 60 * 60 * 1000
const generatedAt = Date.parse(seed.generatedAt)

describe('loadMockPosts', () => {
  const now = Date.parse('2026-11-02T08:15:00.000Z')
  const posts = loadMockPosts(now)

  it('provides at least 30 posts with unique ids', () => {
    expect(posts.length).toBeGreaterThanOrEqual(30)
    expect(new Set(posts.map((post) => post.id)).size).toBe(posts.length)
  })

  it('covers every platform and status', () => {
    const platforms = new Set(posts.flatMap((post) => post.platforms))
    const statuses = new Set(posts.map((post) => post.status))
    expect([...platforms].sort()).toEqual([...PLATFORMS].sort())
    expect([...statuses].sort()).toEqual([...POST_STATUSES].sort())
  })

  it('has an error message on failed posts only', () => {
    for (const post of posts) {
      if (post.status === 'failed') {
        expect(post.errorMessage).toBeTruthy()
      } else {
        expect(post.errorMessage).toBeUndefined()
      }
    }
  })

  it('keeps content within every selected platform limit', () => {
    for (const post of posts) {
      expect(post.platforms.length).toBeGreaterThan(0)
      for (const platform of post.platforms) {
        expect(Array.from(post.content).length).toBeLessThanOrEqual(
          PLATFORM_CONFIG[platform].charLimit,
        )
      }
    }
  })

  it('shifts timestamps relative to now and keeps them in UTC ISO format', () => {
    const offset = now - generatedAt
    posts.forEach((post, index) => {
      expect(post.scheduledAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )
      expect(Date.parse(post.scheduledAt)).toBe(
        Date.parse(seed.posts[index].scheduledAt) + offset,
      )
    })
  })

  it('keeps published and failed posts in the past and scheduled ones in the future', () => {
    for (const post of posts) {
      const time = Date.parse(post.scheduledAt)
      if (post.status === 'scheduled') {
        expect(time).toBeGreaterThan(now)
      } else {
        expect(time).toBeLessThan(now)
      }
    }
  })

  it('has posts for today and tomorrow', () => {
    const times = posts.map((post) => Date.parse(post.scheduledAt) - now)
    expect(times.some((t) => t > 0 && t < DAY_MS)).toBe(true)
    expect(times.some((t) => t >= DAY_MS && t < 2 * DAY_MS)).toBe(true)
  })
})
