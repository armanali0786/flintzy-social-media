import type { Post } from '@/types/post'
import {
  EMPTY_FILTERS,
  filterPosts,
  hasActiveFilters,
  parseFilters,
  toSearchParams,
} from './filterParams'

const parse = (search: string) => parseFilters(new URLSearchParams(search))

describe('parseFilters', () => {
  it('returns empty filters when params are missing', () => {
    expect(parse('')).toEqual(EMPTY_FILTERS)
  })

  it('accepts repeated and comma-separated values', () => {
    expect(parse('?platform=x&platform=tiktok').platforms).toEqual([
      'x',
      'tiktok',
    ])
    expect(parse('?platform=x,tiktok').platforms).toEqual(['x', 'tiktok'])
  })

  it('ignores unknown and empty values', () => {
    expect(parse('?platform=myspace,,x&status=deleted').platforms).toEqual([
      'x',
    ])
    expect(parse('?status=deleted&status=').statuses).toEqual([])
  })

  it('removes duplicates, ignores case and uses a stable order', () => {
    expect(parse('?platform=X,facebook,x&platform=Facebook').platforms).toEqual(
      ['facebook', 'x'],
    )
    expect(parse('?status=failed,scheduled').statuses).toEqual([
      'scheduled',
      'failed',
    ])
  })

  it('uses the first search query', () => {
    expect(parse('?q=coffee&q=tea').query).toBe('coffee')
  })
})

describe('toSearchParams', () => {
  it('writes repeated params and omits empty filters', () => {
    const params = toSearchParams({
      platforms: ['instagram', 'x'],
      statuses: [],
      query: '  ',
    })
    expect(params.toString()).toBe('platform=instagram&platform=x')
  })

  it('round-trips through parseFilters', () => {
    const filters = {
      platforms: ['facebook' as const],
      statuses: ['failed' as const],
      query: 'flash sale',
    }
    expect(parseFilters(toSearchParams(filters))).toEqual(filters)
  })

  it('keeps unrelated params and replaces old filter values', () => {
    const base = new URLSearchParams('?ref=email&platform=x&q=old')
    const params = toSearchParams({ ...EMPTY_FILTERS, query: 'new' }, base)
    expect(params.toString()).toBe('ref=email&q=new')
  })
})

describe('hasActiveFilters', () => {
  it('ignores a whitespace-only query', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, query: '   ' })).toBe(false)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, statuses: ['failed'] })).toBe(
      true,
    )
  })
})

describe('filterPosts', () => {
  const posts: Post[] = [
    {
      id: '1',
      content: 'Autumn Blend is back',
      platforms: ['instagram', 'facebook'],
      scheduledAt: '2026-10-16T04:00:00.000Z',
      status: 'scheduled',
    },
    {
      id: '2',
      content: 'Flash sale on brewing gear',
      platforms: ['x'],
      scheduledAt: '2026-10-16T05:00:00.000Z',
      status: 'failed',
      errorMessage: 'Rate limited',
    },
    {
      id: '3',
      content: 'Latte art fails',
      platforms: ['tiktok'],
      scheduledAt: '2026-10-16T06:00:00.000Z',
      status: 'published',
    },
  ]
  const ids = (result: Post[]) => result.map((post) => post.id)

  it('returns everything with no filters', () => {
    expect(ids(filterPosts(posts, EMPTY_FILTERS))).toEqual(['1', '2', '3'])
  })

  it('matches any selected platform', () => {
    const result = filterPosts(posts, {
      ...EMPTY_FILTERS,
      platforms: ['facebook', 'tiktok'],
    })
    expect(ids(result)).toEqual(['1', '3'])
  })

  it('matches any selected status', () => {
    const result = filterPosts(posts, {
      ...EMPTY_FILTERS,
      statuses: ['failed', 'published'],
    })
    expect(ids(result)).toEqual(['2', '3'])
  })

  it('searches content case-insensitively and trims the query', () => {
    const result = filterPosts(posts, { ...EMPTY_FILTERS, query: '  BLEND ' })
    expect(ids(result)).toEqual(['1'])
  })

  it('combines platform, status and search', () => {
    const filters = {
      platforms: ['x' as const, 'tiktok' as const],
      statuses: ['failed' as const],
      query: 'sale',
    }
    expect(ids(filterPosts(posts, filters))).toEqual(['2'])
    expect(ids(filterPosts(posts, { ...filters, query: 'latte' }))).toEqual([])
  })
})
