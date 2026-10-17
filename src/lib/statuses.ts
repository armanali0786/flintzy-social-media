import type { PostStatus } from '@/types/post'

export const STATUS_LABELS: Record<PostStatus, string> = {
  scheduled: 'Scheduled',
  published: 'Published',
  failed: 'Failed',
}
