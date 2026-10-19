import { useState } from 'react'
import logoMark from '@/assets/logo-mark.png'
import { OfflineBanner } from '@/components/OfflineBanner'
import { PlusIcon } from '@/components/ui/PlusIcon'
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
      <header className="sticky top-0 z-20 border-b border-hairline bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-2 px-4 sm:h-18 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-canvas-mint ring-1 ring-primary/40 sm:size-10">
              <img
                src={logoMark}
                alt=""
                width={24}
                height={24}
                className="size-5 sm:size-6"
              />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-body-lg leading-tight font-bold sm:text-heading-5 sm:leading-tight">
                Flintzy <span className="text-muted">Scheduler</span>
              </h1>
              <p className="hidden truncate text-caption text-muted sm:block">
                Plan posts for every channel
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-green shrink-0 px-4 text-nav-link sm:px-6 sm:text-button"
            onClick={() => setComposerOpen(true)}
          >
            <PlusIcon className="size-4 max-[359px]:hidden" />
            New post
          </button>
        </div>
      </header>
      <OfflineBanner />
      <main className="mx-auto max-w-3xl p-4 sm:py-12">
        <div className="mb-6">
          <h2
            id="post-queue"
            tabIndex={-1}
            className="scroll-mt-24 text-heading-5 sm:text-heading-4"
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
