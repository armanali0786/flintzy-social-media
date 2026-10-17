import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toggleValue } from '@/lib/arrays'
import {
  PLATFORMS,
  POST_STATUSES,
  type Platform,
  type PostStatus,
} from '@/types/post'
import {
  EMPTY_FILTERS,
  parseFilters,
  toSearchParams,
  type PostFilters,
} from './filterParams'

export const SEARCH_DEBOUNCE_MS = 300

export function usePostFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const [searchText, setSearchText] = useState(filters.query)

  // `replace` keeps filter changes out of the browser history.
  const updateFilters = useCallback(
    (update: (current: PostFilters) => PostFilters) => {
      setSearchParams(
        (current) => toSearchParams(update(parseFilters(current)), current),
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    if (searchText === filters.query) return
    const timer = setTimeout(
      () => updateFilters((current) => ({ ...current, query: searchText })),
      SEARCH_DEBOUNCE_MS,
    )
    return () => clearTimeout(timer)
  }, [searchText, filters.query, updateFilters])

  const togglePlatform = (platform: Platform) =>
    updateFilters((current) => ({
      ...current,
      platforms: toggleValue(current.platforms, platform, PLATFORMS),
    }))

  const toggleStatus = (status: PostStatus) =>
    updateFilters((current) => ({
      ...current,
      statuses: toggleValue(current.statuses, status, POST_STATUSES),
    }))

  const clearFilters = () => {
    setSearchText('')
    updateFilters(() => EMPTY_FILTERS)
  }

  return {
    filters,
    searchText,
    setSearchText,
    togglePlatform,
    toggleStatus,
    clearFilters,
  }
}
