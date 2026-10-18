import { useState } from 'react'
import { NewPostDialog } from '@/features/composer/NewPostDialog'
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
  const [composerOpen, setComposerOpen] = useState(false)

  return (
    <div className="min-h-dvh">
      <a
        href="#post-queue"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-on-dark"
      >
        Skip to post queue
      </a>
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 p-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="size-5 shrink-0 rounded-full border border-ink bg-primary sm:size-6"
            />
            <h1 className="truncate text-body-lg font-bold sm:text-heading-5">
              Flintzy Scheduler
            </h1>
          </div>
          <button
            type="button"
            className="btn-green shrink-0 px-4 text-nav-link sm:px-6 sm:text-button"
            onClick={() => setComposerOpen(true)}
          >
            New post
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4 sm:py-12">
        <div className="mb-6">
          <h2
            id="post-queue"
            tabIndex={-1}
            className="text-heading-5 sm:text-heading-4"
          >
            Post queue
          </h2>
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
        <PostQueue
          filters={filters}
          onClearFilters={clearFilters}
          onCreatePost={() => setComposerOpen(true)}
        />
      </main>

      <NewPostDialog
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </div>
  )
}
