import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { postsApi } from '@/api/postsApi'
import { App } from '@/app/App'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { Post } from '@/types/post'

async function fillAndSubmit() {
  const user = userEvent.setup()
  renderWithProviders(<App />)
  await screen.findByText('No posts yet')

  await user.click(screen.getByRole('button', { name: 'New post' }))
  const dialog = within(screen.getByRole('dialog', { name: 'New post' }))
  await user.type(dialog.getByLabelText('Post content'), '  Weekend workshop  ')
  await user.click(dialog.getByRole('checkbox', { name: 'Instagram' }))
  fireEvent.change(dialog.getByLabelText('Schedule for'), {
    target: { value: '2026-10-17T09:30' },
  })
  await user.click(dialog.getByRole('button', { name: 'Schedule post' }))
  return { user, dialog }
}

describe('scheduling a new post', () => {
  const created: Post = {
    id: 'new-1',
    content: 'Weekend workshop',
    platforms: ['instagram'],
    scheduledAt: '2026-10-17T04:00:00.000Z',
    status: 'scheduled',
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-16T06:30:00.000Z')) // 12:00 local
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('stores the time in UTC, confirms in local time and shows the post in the queue', async () => {
    vi.spyOn(postsApi, 'getPosts')
      .mockResolvedValueOnce([])
      .mockResolvedValue([created])
    const createPost = vi
      .spyOn(postsApi, 'createPost')
      .mockResolvedValue(created)

    await fillAndSubmit()

    expect(createPost).toHaveBeenCalledWith({
      content: 'Weekend workshop',
      platforms: ['instagram'],
      mediaUrl: undefined,
      scheduledAt: '2026-10-17T04:00:00.000Z',
    })
    expect(
      await screen.findByText('Post scheduled for Tomorrow at 9:30 AM.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    const tomorrow = await screen.findByRole('region', { name: /Tomorrow/ })
    expect(within(tomorrow).getByText('Weekend workshop')).toBeInTheDocument()
    expect(within(tomorrow).getByText('9:30 AM')).toBeInTheDocument()
  })

  it('keeps the form open with an error when saving fails', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValue([])
    vi.spyOn(postsApi, 'createPost').mockRejectedValue(new Error('Server down'))

    const { dialog } = await fillAndSubmit()

    expect(await dialog.findByRole('alert')).toHaveTextContent(
      "Couldn't schedule the post. Please try again.",
    )
    expect(dialog.getByLabelText('Post content')).toHaveValue(
      '  Weekend workshop  ',
    )
    expect(dialog.getByRole('button', { name: 'Schedule post' })).toBeEnabled()
  })

  it('shows progress while saving', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValue([])
    vi.spyOn(postsApi, 'createPost').mockReturnValue(new Promise(() => {}))

    const { dialog } = await fillAndSubmit()

    expect(dialog.getByRole('button', { name: 'Scheduling…' })).toBeDisabled()
  })
})
