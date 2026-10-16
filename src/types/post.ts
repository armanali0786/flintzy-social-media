export const PLATFORMS = ['facebook', 'instagram', 'x', 'tiktok'] as const
export type Platform = (typeof PLATFORMS)[number]

export const POST_STATUSES = ['scheduled', 'published', 'failed'] as const
export type PostStatus = (typeof POST_STATUSES)[number]

export interface Post {
  id: string
  content: string
  platforms: Platform[]
  mediaUrl?: string
  /** UTC ISO 8601 timestamp, e.g. "2026-10-16T09:30:00.000Z" */
  scheduledAt: string
  status: PostStatus
  /** Present only when status is "failed" */
  errorMessage?: string
}
