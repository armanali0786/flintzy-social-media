import clsx from 'clsx'
import type { PostStatus } from '@/types/post'

const STATUS_STYLES: Record<
  PostStatus,
  { label: string; badge: string; dot: string }
> = {
  scheduled: {
    label: 'Scheduled',
    badge: 'bg-surface-soft text-ink',
    dot: 'bg-muted',
  },
  published: {
    label: 'Published',
    badge: 'bg-canvas-mint text-ink',
    dot: 'bg-primary ring-1 ring-ink',
  },
  failed: {
    label: 'Failed',
    badge: 'bg-danger-soft text-danger',
    dot: 'bg-danger',
  },
}

export function StatusBadge({ status }: { status: PostStatus }) {
  const style = STATUS_STYLES[status]

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-caption',
        style.badge,
      )}
    >
      <span
        aria-hidden="true"
        className={clsx('size-1.5 rounded-full', style.dot)}
      />
      {style.label}
    </span>
  )
}
