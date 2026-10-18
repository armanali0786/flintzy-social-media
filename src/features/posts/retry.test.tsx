import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { postsApi } from '@/api/postsApi'
import { App } from '@/app/App'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { Post } from '@/types/post'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const failedPost: Post = {
  id: 'p1',
  content: 'Flash sale on brewing gear',
  platforms: ['x'],
  scheduledAt: '2026-10-16T05:00:00.000Z',
  status: 'failed',
  errorMessage: 'X API rate limit reached.',
}
const otherFailedPost: Post = {
  ...failedPost,
  id: 'p2',
  content: 'Hiring a roaster',
  errorMessage: 'Token expired.',
}

const card = (text: string) => screen.getByText(text).closest('article')!

async function renderQueue(posts: Post[]) {
  vi.spyOn(postsApi, 'getPosts').mockResolvedValue(posts)
  const user = userEvent.setup()
  renderWithProviders(<App />)
  await screen.findByText(posts[0].content)
  return user
}

describe('retrying failed posts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('only offers retry on failed posts, linked to the failure reason', async () => {
    await renderQueue([
      failedPost,
      {
        ...failedPost,
        id: 'p3',
        content: 'Already out',
        status: 'published',
        errorMessage: undefined,
      },
    ])

    const retry = within(card(failedPost.content)).getByRole('button', {
      name: 'Retry',
    })
    expect(retry).toHaveAccessibleDescription('X API rate limit reached.')
    expect(
      within(card('Already out')).queryByRole('button', { name: 'Retry' }),
    ).toBeNull()
  })

  it('updates the post immediately, then confirms on success', async () => {
    const request = deferred<Post>()
    vi.spyOn(postsApi, 'retryPost').mockReturnValue(request.promise)
    const user = await renderQueue([failedPost])

    await user.click(
      within(card(failedPost.content)).getByRole('button', { name: 'Retry' }),
    )

    const optimistic = within(card(failedPost.content))
    expect(optimistic.getByText('Published')).toBeInTheDocument()
    expect(optimistic.getByRole('status')).toHaveTextContent('Confirming…')
    expect(optimistic.queryByText('X API rate limit reached.')).toBeNull()
    expect(optimistic.queryByRole('button', { name: 'Retry' })).toBeNull()

    request.resolve({
      ...failedPost,
      status: 'published',
      errorMessage: undefined,
    })

    await waitFor(() =>
      expect(
        within(card(failedPost.content)).queryByText('Confirming…'),
      ).toBeNull(),
    )
    expect(
      within(card(failedPost.content)).getByText('Published'),
    ).toBeInTheDocument()
  })

  it('rolls back to failed and shows an error when the retry fails', async () => {
    const request = deferred<Post>()
    vi.spyOn(postsApi, 'retryPost').mockReturnValue(request.promise)
    const user = await renderQueue([failedPost])

    await user.click(
      within(card(failedPost.content)).getByRole('button', { name: 'Retry' }),
    )
    expect(
      within(card(failedPost.content)).getByText('Published'),
    ).toBeInTheDocument()

    request.reject(new Error("The platform didn't respond. Try again."))

    expect(
      await screen.findByText(
        "Retry failed for “Flash sale on brewing gear”: The platform didn't respond. Try again.",
      ),
    ).toBeInTheDocument()
    const rolledBack = within(card(failedPost.content))
    expect(rolledBack.getByText('Failed')).toBeInTheDocument()
    expect(
      rolledBack.getByText('X API rate limit reached.'),
    ).toBeInTheDocument()
    expect(rolledBack.getByRole('button', { name: 'Retry' })).toBeEnabled()
  })

  it('sends only one request when Retry is clicked repeatedly', async () => {
    const retryPost = vi
      .spyOn(postsApi, 'retryPost')
      .mockReturnValue(new Promise(() => {}))
    const user = await renderQueue([failedPost])

    await user.dblClick(
      within(card(failedPost.content)).getByRole('button', { name: 'Retry' }),
    )

    expect(retryPost).toHaveBeenCalledTimes(1)
  })

  it('keeps concurrent retries independent', async () => {
    const first = deferred<Post>()
    const second = deferred<Post>()
    vi.spyOn(postsApi, 'retryPost').mockImplementation((id) =>
      id === 'p1' ? first.promise : second.promise,
    )
    const user = await renderQueue([failedPost, otherFailedPost])

    await user.click(
      within(card(failedPost.content)).getByRole('button', { name: 'Retry' }),
    )
    await user.click(
      within(card(otherFailedPost.content)).getByRole('button', {
        name: 'Retry',
      }),
    )

    second.reject(new Error('Network timeout.'))
    await screen.findByText(/Retry failed for “Hiring a roaster”/)

    expect(
      within(card(otherFailedPost.content)).getByText('Failed'),
    ).toBeInTheDocument()
    expect(
      within(card(failedPost.content)).getByText('Published'),
    ).toBeInTheDocument()
    expect(
      within(card(failedPost.content)).getByText('Confirming…'),
    ).toBeInTheDocument()
  })

  it('uses the mock API: one second delay, then rollback on a simulated failure', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1) // below the 20% failure rate
    const user = userEvent.setup()
    renderWithProviders(<App />)

    const content = await screen.findByText(/We're hiring!/, undefined, {
      timeout: 3000,
    })
    const post = content.closest('article')!
    // Taken before the click so the measured time can only overestimate.
    const startedAt = Date.now()
    await user.click(within(post).getByRole('button', { name: 'Retry' }))

    expect(within(post).getByText('Published')).toBeInTheDocument()
    await within(post).findByRole(
      'button',
      { name: 'Retry' },
      { timeout: 3000 },
    )

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(1000)
    expect(within(post).getByText('Failed')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Retry failed for “We're hiring!.*”: The platform didn't respond/,
      ),
    ).toBeInTheDocument()
  })
})
