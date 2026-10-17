import clsx from 'clsx'
import { PlatformIcon } from '@/components/PlatformIcon'
import { getCharacterCounts } from '@/lib/characterCount'
import { PLATFORM_CONFIG } from '@/lib/platforms'
import type { Platform } from '@/types/post'

interface CharacterCountersProps {
  id: string
  content: string
  platforms: Platform[]
}

export function CharacterCounters({
  id,
  content,
  platforms,
}: CharacterCountersProps) {
  if (platforms.length === 0) {
    return (
      <p id={id} className="text-body-sm text-muted">
        Select a platform to see its character limit.
      </p>
    )
  }

  return (
    <ul
      id={id}
      aria-label="Character count"
      className="flex flex-wrap gap-x-4 gap-y-1"
    >
      {getCharacterCounts(content, platforms).map(
        ({ platform, count, limit, remaining, isOverLimit }) => (
          <li
            key={platform}
            className={clsx(
              'flex items-center gap-1.5 text-body-sm tabular-nums',
              isOverLimit ? 'font-semibold text-danger' : 'text-muted',
            )}
          >
            <span aria-hidden="true">
              <PlatformIcon platform={platform} className="size-3.5" />
            </span>
            <span className="sr-only">{PLATFORM_CONFIG[platform].label}:</span>
            {count.toLocaleString()} / {limit.toLocaleString()}
            {isOverLimit && ` (${(-remaining).toLocaleString()} over)`}
          </li>
        ),
      )}
    </ul>
  )
}
