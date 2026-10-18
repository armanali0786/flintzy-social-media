import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { addDays, setHours, setMinutes } from 'date-fns'
import { toLocalInputValue } from '@/lib/dates'
import { renderWithProviders } from '@/test/renderWithProviders'
import { App } from './App'

// Runs against the real mock API (seed data, real delays); only the retry
// outcome is made deterministic.
test(
  'a user filters failed posts, retries one, schedules a post and finds it',
  { timeout: 15_000 },
  async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9) // retry succeeds
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const location = () => screen.getByTestId('location-search').textContent
    const statusGroup = () =>
      within(screen.getByRole('group', { name: 'Status' }))

    await screen.findAllByRole('article', {}, { timeout: 3000 })

    // Filter to failed posts; the filter is written to the URL.
    await user.click(statusGroup().getByRole('button', { name: 'Failed' }))
    expect(location()).toBe('?status=failed')
    expect(screen.getByText('Showing 5 of 32 posts')).toBeInTheDocument()

    // Retry one: it leaves the failed list immediately and stays gone.
    const [firstRetry] = screen.getAllByRole('button', { name: 'Retry' })
    await user.click(firstRetry)
    expect(screen.getByText('Showing 4 of 32 posts')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Confirming…')).toBeNull(), {
      timeout: 3000,
    })
    expect(screen.getByText('Showing 4 of 32 posts')).toBeInTheDocument()

    await user.click(statusGroup().getByRole('button', { name: 'Failed' }))
    expect(location()).toBe('')

    // Schedule a new post for tomorrow at 09:30 local time.
    const tomorrowAt930 = setMinutes(setHours(addDays(new Date(), 1), 9), 30)
    await user.click(screen.getByRole('button', { name: 'New post' }))
    const dialog = within(screen.getByRole('dialog', { name: 'New post' }))
    await user.type(
      dialog.getByLabelText('Post content'),
      'Journey test post ☕',
    )
    await user.click(dialog.getByRole('checkbox', { name: 'X' }))
    fireEvent.change(dialog.getByLabelText('Schedule for'), {
      target: { value: toLocalInputValue(tomorrowAt930) },
    })
    await user.click(dialog.getByRole('button', { name: 'Schedule post' }))

    expect(
      await screen.findByText(
        'Post scheduled for Tomorrow at 9:30 AM.',
        undefined,
        {
          timeout: 3000,
        },
      ),
    ).toBeInTheDocument()
    const tomorrow = screen.getByRole('region', { name: /Tomorrow/ })
    expect(
      await within(tomorrow).findByText('Journey test post ☕', undefined, {
        timeout: 3000,
      }),
    ).toBeInTheDocument()

    // Search finds it.
    await user.type(
      screen.getByRole('searchbox', { name: 'Search posts' }),
      'journey test',
    )
    expect(await screen.findByText('Showing 1 of 33 posts')).toBeInTheDocument()
    expect(location()).toBe('?q=journey+test')
  },
)
