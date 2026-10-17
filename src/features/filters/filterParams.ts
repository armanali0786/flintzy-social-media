import {
  isPlatform,
  isPostStatus,
  PLATFORMS,
  POST_STATUSES,
  type Platform,
  type Post,
  type PostStatus,
} from '@/types/post'

export interface PostFilters {
  platforms: Platform[]
  statuses: PostStatus[]
  query: string
}

export const EMPTY_FILTERS: PostFilters = {
  platforms: [],
  statuses: [],
  query: '',
}

const PARAM = { platforms: 'platform', statuses: 'status', query: 'q' } as const

/**
 * Accepts both `?platform=x&platform=tiktok` and `?platform=x,tiktok`.
 * Unknown values are dropped and the result follows `order`, so the same
 * selection always produces the same filters regardless of how it was typed.
 */
function parseList<T extends string>(
  params: URLSearchParams,
  key: string,
  isValid: (value: string) => value is T,
  order: readonly T[],
): T[] {
  const values = new Set(
    params
      .getAll(key)
      .flatMap((value) => value.split(','))
      .map((value) => value.trim().toLowerCase())
      .filter(isValid),
  )
  return order.filter((value) => values.has(value))
}

export function parseFilters(params: URLSearchParams): PostFilters {
  return {
    platforms: parseList(params, PARAM.platforms, isPlatform, PLATFORMS),
    statuses: parseList(params, PARAM.statuses, isPostStatus, POST_STATUSES),
    query: params.get(PARAM.query) ?? '',
  }
}

/** Writes filters into a copy of `base`, keeping any unrelated params. */
export function toSearchParams(
  filters: PostFilters,
  base = new URLSearchParams(),
): URLSearchParams {
  const params = new URLSearchParams(base)
  Object.values(PARAM).forEach((key) => params.delete(key))

  filters.platforms.forEach((p) => params.append(PARAM.platforms, p))
  filters.statuses.forEach((s) => params.append(PARAM.statuses, s))
  if (filters.query.trim()) {
    params.set(PARAM.query, filters.query)
  }
  return params
}

export function toggleValue<T>(list: T[], value: T, order: readonly T[]): T[] {
  return order.filter((item) =>
    item === value ? !list.includes(item) : list.includes(item),
  )
}

export function hasActiveFilters(filters: PostFilters): boolean {
  return (
    filters.platforms.length > 0 ||
    filters.statuses.length > 0 ||
    filters.query.trim() !== ''
  )
}

export function filterPosts(posts: Post[], filters: PostFilters): Post[] {
  const query = filters.query.trim().toLowerCase()

  return posts.filter(
    (post) =>
      (filters.platforms.length === 0 ||
        post.platforms.some((p) => filters.platforms.includes(p))) &&
      (filters.statuses.length === 0 ||
        filters.statuses.includes(post.status)) &&
      (query === '' || post.content.toLowerCase().includes(query)),
  )
}
