import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { postsApi } from '@/api/postsApi'
import { EMPTY_FILTERS } from '@/features/filters/filterParams'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { Post } from '@/types/post'
import { PostQueue } from './PostQueue'

function makePost(id: string, scheduledAt: string): Post {
  return {
    id,
    content: `Post ${id}`,
    platforms: ['x'],
    scheduledAt,
    status: 'scheduled',
  }
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
    renderWithProviders(
      <PostQueue filters={EMPTY_FILTERS} onClearFilters={() => {}} />,
    )

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
    renderWithProviders(
      <PostQueue filters={EMPTY_FILTERS} onClearFilters={() => {}} />,
    )

    expect(await screen.findByText('No posts yet')).toBeInTheDocument()
  })

  it('shows an error state and recovers on "Try again"', async () => {
    vi.spyOn(postsApi, 'getPosts')
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValueOnce([makePost('a', '2026-10-16T09:00:00.000Z')])
    renderWithProviders(
      <PostQueue filters={EMPTY_FILTERS} onClearFilters={() => {}} />,
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("We couldn't load your posts.")

    await userEvent.click(
      within(alert).getByRole('button', { name: 'Try again' }),
    )

    expect(await screen.findByText('Post a')).toBeInTheDocument()
  })
})
