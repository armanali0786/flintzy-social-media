import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { postsApi } from '@/api/postsApi'
import { EMPTY_FILTERS } from '@/features/filters/filterParams'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { Post } from '@/types/post'
import { PostQueue } from './PostQueue'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function makePost(id: string, scheduledAt: string): Post {
  return {
    id,
    content: `Post ${id}`,
    platforms: ['x'],
    scheduledAt,
    status: 'scheduled',
  }
}

function renderQueue(props: { onCreatePost?: () => void } = {}) {
  renderWithProviders(
    <PostQueue
      filters={EMPTY_FILTERS}
      onClearFilters={() => {}}
      onCreatePost={props.onCreatePost ?? (() => {})}
    />,
  )
}

describe('PostQueue', () => {
  beforeEach(() => {
    // Only fake Date so React Query's own timers keep working.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-16T06:30:00.000Z')) // 12:00 local
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows a loading state, then posts grouped by day', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValue([
      makePost('c', '2026-10-20T05:00:00.000Z'),
      makePost('b', '2026-10-17T05:00:00.000Z'),
      makePost('a', '2026-10-16T09:00:00.000Z'),
    ])
    renderQueue()

    expect(screen.getByRole('status')).toHaveTextContent('Loading posts')

    const headings = await screen.findAllByRole('heading', { level: 3 })
    expect(headings.map((h) => h.textContent)).toEqual([
      'Today1 post',
      'Tomorrow1 post',
      'Tue, 20 Oct1 post',
    ])
    const today = screen.getByRole('region', { name: /Today/ })
    expect(within(today).getByText('Post a')).toBeInTheDocument()
  })

  it('shows an empty state when there are no posts', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValue([])
    renderQueue()

    expect(await screen.findByText('No posts yet')).toBeInTheDocument()
  })

  it('shows an error state and recovers on "Try again"', async () => {
    const retry = deferred<Post[]>()
    vi.spyOn(postsApi, 'getPosts')
      .mockRejectedValueOnce(new Error('Network down'))
      .mockReturnValueOnce(retry.promise)
    renderQueue()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("We couldn't load your posts")
    expect(alert).toHaveTextContent('Check your connection and try again.')

    await userEvent.click(
      within(alert).getByRole('button', { name: 'Try again' }),
    )
    // A query without data goes back to pending, so the skeleton returns.
    expect(screen.getByRole('status')).toHaveTextContent('Loading posts…')
    expect(screen.queryByRole('alert')).toBeNull()

    retry.resolve([makePost('a', '2026-10-16T09:00:00.000Z')])
    expect(await screen.findByText('Post a')).toBeInTheDocument()
  })

  it('offers to create a post when the queue is empty', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValue([])
    const onCreatePost = vi.fn()
    renderQueue({ onCreatePost })

    await userEvent.click(
      await screen.findByRole('button', { name: 'Create a post' }),
    )

    expect(onCreatePost).toHaveBeenCalledOnce()
    // The illustration is decorative, so it stays out of the accessibility tree.
    expect(screen.queryByRole('img')).toBeNull()
    expect(document.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('marks the loading skeleton as busy for assistive technology', () => {
    vi.spyOn(postsApi, 'getPosts').mockReturnValue(new Promise(() => {}))
    renderQueue()

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Loading posts…')
    expect(status.closest('[aria-busy]')).toHaveAttribute('aria-busy', 'true')
  })
})
