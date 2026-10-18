import clsx from 'clsx'
import type { ReactNode } from 'react'
import { PlatformIcon } from '@/components/PlatformIcon'
import { PLATFORM_CONFIG } from '@/lib/platforms'
import { STATUS_LABELS } from '@/lib/statuses'
import {
  PLATFORMS,
  POST_STATUSES,
  type Platform,
  type PostStatus,
} from '@/types/post'
import { hasActiveFilters, type PostFilters } from './filterParams'

interface FilterBarProps {
  filters: PostFilters
  searchText: string
  onSearchTextChange: (text: string) => void
  onTogglePlatform: (platform: Platform) => void
  onToggleStatus: (status: PostStatus) => void
  onClear: () => void
}

export function FilterBar({
  filters,
  searchText,
  onSearchTextChange,
  onTogglePlatform,
  onToggleStatus,
  onClear,
}: FilterBarProps) {
  return (
    <div className="card mb-8 flex flex-col gap-4 p-4 sm:p-5">
      <div>
        <label htmlFor="post-search" className="sr-only">
          Search posts
        </label>
        <input
          id="post-search"
          type="search"
          className="input"
          placeholder="Search posts by content"
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
        />
      </div>

      <ChipGroup label="Platform">
        {PLATFORMS.map((platform) => (
          <Chip
            key={platform}
            pressed={filters.platforms.includes(platform)}
            onClick={() => onTogglePlatform(platform)}
          >
            <span aria-hidden="true">
              <PlatformIcon
                platform={platform}
                className="size-3.5"
                monochrome={filters.platforms.includes(platform)}
              />
            </span>
            {PLATFORM_CONFIG[platform].label}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label="Status">
        {POST_STATUSES.map((status) => (
          <Chip
            key={status}
            pressed={filters.statuses.includes(status)}
            onClick={() => onToggleStatus(status)}
          >
            {STATUS_LABELS[status]}
          </Chip>
        ))}
      </ChipGroup>

      {(hasActiveFilters(filters) || searchText !== '') && (
        <button
          type="button"
          className="self-start text-nav-link underline underline-offset-4"
          onClick={onClear}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

function ChipGroup({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2"
    >
      <span
        aria-hidden="true"
        className="w-full text-caption text-muted sm:w-16"
      >
        {label}
      </span>
      {children}
    </div>
  )
}

interface ChipProps {
  pressed: boolean
  onClick: () => void
  children: ReactNode
}

function Chip({ pressed, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={clsx('chip', pressed && 'chip-selected')}
    >
      {children}
    </button>
  )
}
