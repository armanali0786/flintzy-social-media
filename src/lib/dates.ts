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
