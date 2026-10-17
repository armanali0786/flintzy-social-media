import { FilterBar } from '@/features/filters/FilterBar'
import { usePostFilters } from '@/features/filters/usePostFilters'
import { PostQueue } from '@/features/posts/PostQueue'
import { getLocalTimeZone } from '@/lib/dates'

export function App() {
  const {
    filters,
    searchText,
    setSearchText,
    togglePlatform,
    toggleStatus,
    clearFilters,
  } = usePostFilters()

  return (
    <div className="min-h-dvh">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-6 rounded-full border border-ink bg-primary"
            />
            <h1 className="text-2xl font-bold">Flintzy Scheduler</h1>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4 sm:py-12">
        <div className="mb-6">
          <h2 className="text-heading-4">Post queue</h2>
          <p className="text-body-sm text-muted">
            Times shown in your time zone ({getLocalTimeZone()})
          </p>
        </div>
        <FilterBar
          filters={filters}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onTogglePlatform={togglePlatform}
          onToggleStatus={toggleStatus}
          onClear={clearFilters}
        />
        <PostQueue filters={filters} onClearFilters={clearFilters} />
      </main>
    </div>
  )
}
