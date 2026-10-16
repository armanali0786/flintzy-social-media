import { isPlatform, isPostStatus, type Post } from '@/types/post'
import seed from './posts.json'

type SeedPost = (typeof seed.posts)[number]

function toPost(raw: SeedPost, offsetMs: number): Post {
  const { platforms, status } = raw
  const time = Date.parse(raw.scheduledAt)

  if (!platforms.every(isPlatform)) {
    throw new Error(`Mock post ${raw.id} has an unknown platform`)
  }
  if (!isPostStatus(status)) {
    throw new Error(`Mock post ${raw.id} has an unknown status "${status}"`)
  }
  if (Number.isNaN(time)) {
    throw new Error(`Mock post ${raw.id} has an invalid scheduledAt`)
  }

  return {
    id: raw.id,
    content: raw.content,
    platforms,
    mediaUrl: raw.mediaUrl,
    scheduledAt: new Date(time + offsetMs).toISOString(),
    status,
    errorMessage: raw.errorMessage,
  }
}

/**
 * Seed timestamps are written relative to `generatedAt`. Shifting them by the
 * time elapsed since then keeps the queue realistic whenever the app is opened:
 * past posts stay published/failed and upcoming posts stay in the future.
 */
export function loadMockPosts(now = Date.now()): Post[] {
  const offsetMs = now - Date.parse(seed.generatedAt)
  return seed.posts.map((raw) => toPost(raw, offsetMs))
}
