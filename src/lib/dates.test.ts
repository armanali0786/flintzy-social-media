import type { Post } from '@/types/post'
import {
  formatDayLabel,
  formatLocalTime,
  groupPostsByDay,
  parseLocalDateTime,
  toLocalInputValue,
} from './dates'

// Tests run in Asia/Kolkata (UTC+5:30), configured in vite.config.ts.
const now = new Date('2026-10-16T06:30:00.000Z') // Fri 16 Oct, 12:00 local

function post(id: string, scheduledAt: string): Post {
  return { id, content: id, platforms: ['x'], scheduledAt, status: 'scheduled' }
}

describe('formatDayLabel', () => {
  it.each([
    ['2026-10-16T00:00:00', 'Today'],
    ['2026-10-16T23:59:59', 'Today'],
    ['2026-10-17T00:00:00', 'Tomorrow'],
    ['2026-10-18T09:00:00', 'Sun, 18 Oct'],
    ['2026-10-15T09:00:00', 'Thu, 15 Oct'],
    ['2027-01-04T09:00:00', 'Mon, 4 Jan 2027'],
  ])('labels %s as "%s"', (localDateTime, label) => {
    expect(formatDayLabel(new Date(localDateTime), now)).toBe(label)
  })
})

describe('formatLocalTime', () => {
  it('shows UTC timestamps in the local time zone', () => {
    expect(formatLocalTime('2026-10-16T04:00:00.000Z')).toBe('9:30 AM')
    expect(formatLocalTime('2026-10-16T18:45:00.000Z')).toBe('12:15 AM')
  })
})

describe('groupPostsByDay', () => {
  it('returns no groups for no posts', () => {
    expect(groupPostsByDay([], now)).toEqual([])
  })

  it('groups chronologically into Today, Tomorrow, then dates', () => {
    const posts = [
      post('sun', '2026-10-18T04:00:00.000Z'),
      post('today-late', '2026-10-16T12:00:00.000Z'),
      post('tomorrow', '2026-10-17T05:00:00.000Z'),
      post('yesterday', '2026-10-15T05:00:00.000Z'),
      post('today-early', '2026-10-16T03:00:00.000Z'),
    ]

    const groups = groupPostsByDay(posts, now)

    expect(groups.map((g) => [g.label, g.posts.map((p) => p.id)])).toEqual([
      ['Thu, 15 Oct', ['yesterday']],
      ['Today', ['today-early', 'today-late']],
      ['Tomorrow', ['tomorrow']],
      ['Sun, 18 Oct', ['sun']],
    ])
  })

  it('splits days at local midnight, not UTC midnight', () => {
    const posts = [
      post('before-midnight', '2026-10-16T18:29:59.000Z'), // 23:59:59 local
      post('after-midnight', '2026-10-16T18:30:00.000Z'), // 00:00:00 local
    ]

    const groups = groupPostsByDay(posts, now)

    expect(groups).toHaveLength(2)
    expect(groups[0]).toMatchObject({ key: '2026-10-16', label: 'Today' })
    expect(groups[1]).toMatchObject({ key: '2026-10-17', label: 'Tomorrow' })
  })

  it('does not reorder the input array', () => {
    const posts = [
      post('b', '2026-10-17T05:00:00.000Z'),
      post('a', '2026-10-16T05:00:00.000Z'),
    ]

    groupPostsByDay(posts, now)

    expect(posts.map((p) => p.id)).toEqual(['b', 'a'])
  })
})

describe('parseLocalDateTime', () => {
  it('reads datetime-local values as local time and converts to UTC', () => {
    expect(parseLocalDateTime('2026-10-20T09:30')?.toISOString()).toBe(
      '2026-10-20T04:00:00.000Z',
    )
    expect(parseLocalDateTime('2026-10-20T09:30:15')?.toISOString()).toBe(
      '2026-10-20T04:00:15.000Z',
    )
  })

  it('handles local times that fall on the previous UTC day', () => {
    expect(parseLocalDateTime('2026-10-21T03:00')?.toISOString()).toBe(
      '2026-10-20T21:30:00.000Z',
    )
  })

  it.each([
    '',
    'not a date',
    '2026-10-20',
    '2026-10-20 09:30',
    '2026-10-20T09:30Z',
    '2026-02-30T10:00',
    '2026-13-01T10:00',
    '2026-10-20T24:00',
    '2026-10-20T09:60',
  ])('rejects %j', (value) => {
    expect(parseLocalDateTime(value)).toBeNull()
  })
})

describe('toLocalInputValue', () => {
  it('formats a date for a datetime-local input in local time', () => {
    expect(toLocalInputValue(new Date('2026-10-20T04:00:00.000Z'))).toBe(
      '2026-10-20T09:30',
    )
  })

  it('round-trips with parseLocalDateTime', () => {
    expect(
      parseLocalDateTime(
        toLocalInputValue(new Date('2026-12-31T20:15:00.000Z')),
      )?.toISOString(),
    ).toBe('2026-12-31T20:15:00.000Z')
  })
})
