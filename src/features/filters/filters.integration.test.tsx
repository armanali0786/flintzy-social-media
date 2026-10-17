import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { postsApi } from '@/api/postsApi'
import { App } from '@/app/App'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { Post } from '@/types/post'

const posts: Post[] = [
  {
    id: '1',
    content: 'Autumn blend is back',
    platforms: ['instagram'],
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
    content: 'X marks the sale',
    platforms: ['x'],
    scheduledAt: '2026-10-16T06:00:00.000Z',
    status: 'published',
  },
]

const locationSearch = () => screen.getByTestId('location-search').textContent

function chip(group: string, name: string) {
  return within(screen.getByRole('group', { name: group })).getByRole(
    'button',
    {
      name,
    },
  )
}

describe('post filters', () => {
  beforeEach(() => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValue(posts)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('restores filters from the URL, as after a page refresh', async () => {
    renderWithProviders(<App />, { route: '/?platform=x&status=failed&q=sale' })

    expect(
      await screen.findByText('Flash sale on brewing gear'),
    ).toBeInTheDocument()
    expect(screen.queryByText('X marks the sale')).not.toBeInTheDocument()
    expect(screen.queryByText('Autumn blend is back')).not.toBeInTheDocument()

    expect(chip('Platform', 'X')).toHaveAttribute('aria-pressed', 'true')
    expect(chip('Status', 'Failed')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('searchbox', { name: 'Search posts' })).toHaveValue(
      'sale',
    )
    expect(screen.getByText('Showing 1 of 3 posts')).toBeInTheDocument()
  })

  it('ignores invalid URL values', async () => {
    renderWithProviders(<App />, { route: '/?platform=myspace&status=deleted' })

    expect(await screen.findByText('Autumn blend is back')).toBeInTheDocument()
    expect(screen.getByText('X marks the sale')).toBeInTheDocument()
  })

  it('writes chip toggles to the URL', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await screen.findByText('Autumn blend is back')

    await user.click(chip('Platform', 'X'))
    expect(locationSearch()).toBe('?platform=x')
    expect(screen.queryByText('Autumn blend is back')).not.toBeInTheDocument()

    await user.click(chip('Status', 'Published'))
    expect(locationSearch()).toBe('?platform=x&status=published')

    await user.click(chip('Platform', 'X'))
    expect(locationSearch()).toBe('?status=published')
  })

  it('debounces search into the URL', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await screen.findByText('Autumn blend is back')

    await user.type(
      screen.getByRole('searchbox', { name: 'Search posts' }),
      'autumn',
    )

    expect(await screen.findByText('Showing 1 of 3 posts')).toBeInTheDocument()
    expect(locationSearch()).toBe('?q=autumn')
  })

  it('shows a no-results state and clears all filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/?status=failed&q=autumn' })

    expect(
      await screen.findByText('No posts match your filters'),
    ).toBeInTheDocument()

    // One button in the filter bar, one in the no-results state.
    const clearButtons = screen.getAllByRole('button', {
      name: 'Clear filters',
    })
    expect(clearButtons).toHaveLength(2)
    await user.click(clearButtons[1])

    expect(locationSearch()).toBe('')
    expect(screen.getByRole('searchbox', { name: 'Search posts' })).toHaveValue(
      '',
    )
    expect(screen.getByText('X marks the sale')).toBeInTheDocument()
  })
})
