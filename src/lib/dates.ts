import { differenceInCalendarDays, format, isSameYear } from 'date-fns'
import type { Post } from '@/types/post'

export interface DayGroup {
  /** Local calendar day, e.g. "2026-10-16" */
  key: string
  label: string
  posts: Post[]
}

export function formatDayLabel(date: Date, now = new Date()): string {
  const daysFromToday = differenceInCalendarDays(date, now)
  if (daysFromToday === 0) return 'Today'
  if (daysFromToday === 1) return 'Tomorrow'
  return format(date, isSameYear(date, now) ? 'EEE, d MMM' : 'EEE, d MMM yyyy')
}

export function formatLocalTime(isoString: string): string {
  return format(new Date(isoString), 'h:mm a')
}

/** Groups posts by the viewer's local calendar day, in chronological order. */
export function groupPostsByDay(posts: Post[], now = new Date()): DayGroup[] {
  const sorted = [...posts].sort(
    (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
  )
  const groups: DayGroup[] = []

  for (const post of sorted) {
    const date = new Date(post.scheduledAt)
    const key = format(date, 'yyyy-MM-dd')
    const current = groups.at(-1)

    if (current?.key === key) {
      current.posts.push(post)
    } else {
      groups.push({ key, label: formatDayLabel(date, now), posts: [post] })
    }
  }

  return groups
}

export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/

/**
 * Parses a datetime-local value such as "2026-10-20T09:30" as local time.
 * Built from its parts rather than `new Date(string)` so the result never
 * depends on how the engine interprets a zone-less string. Returns null for
 * malformed or impossible values (e.g. 30 Feb, or a time skipped by a
 * daylight-saving change), which `Date` would otherwise silently roll over.
 */
export function parseLocalDateTime(value: string): Date | null {
  const match = LOCAL_DATE_TIME.exec(value)
  if (!match) return null

  const [year, month, day, hours, minutes, seconds] = match
    .slice(1)
    .map((part) => Number(part ?? 0))
  const date = new Date(year, month - 1, day, hours, minutes, seconds)

  const roundTrips =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hours &&
    date.getMinutes() === minutes
  return roundTrips ? date : null
}

/** Formats a date as a datetime-local value, e.g. for the input's `min`. */
export function toLocalInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}
