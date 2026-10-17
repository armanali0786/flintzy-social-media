import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { postsApi } from '@/api/postsApi'
import { App } from '@/app/App'
import { renderWithProviders } from '@/test/renderWithProviders'

async function openComposer() {
  const user = userEvent.setup()
  renderWithProviders(<App />)
  await user.click(screen.getByRole('button', { name: 'New post' }))
  return { user, dialog: screen.getByRole('dialog', { name: 'New post' }) }
}

describe('post composer', () => {
  beforeEach(() => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens a dialog with all composer fields', async () => {
    const { dialog } = await openComposer()
    const form = within(dialog)

    expect(form.getByLabelText('Post content')).toBeInTheDocument()
    expect(form.getByRole('group', { name: 'Platforms' })).toBeInTheDocument()
    expect(form.getByLabelText(/Image URL/)).toBeInTheDocument()
    expect(form.getByLabelText('Schedule for')).toHaveAttribute(
      'type',
      'datetime-local',
    )
    expect(form.getByLabelText('Schedule for')).toHaveAccessibleDescription(
      /In your time zone/,
    )
  })

  it('lets the user write content and pick several platforms', async () => {
    const { user, dialog } = await openComposer()
    const form = within(dialog)

    await user.type(form.getByLabelText('Post content'), 'Hello ☕')
    await user.click(form.getByRole('checkbox', { name: 'X' }))
    await user.click(form.getByRole('checkbox', { name: 'Instagram' }))
    await user.click(form.getByRole('checkbox', { name: 'X' }))

    expect(form.getByLabelText('Post content')).toHaveValue('Hello ☕')
    expect(form.getByRole('checkbox', { name: 'Instagram' })).toBeChecked()
    expect(form.getByRole('checkbox', { name: 'X' })).not.toBeChecked()
  })

  it('previews a valid image URL only', async () => {
    const { user, dialog } = await openComposer()
    const form = within(dialog)
    const input = form.getByLabelText(/Image URL/)

    await user.type(input, 'not a url')
    expect(form.queryByAltText('Preview of the attached image')).toBeNull()

    await user.clear(input)
    await user.type(input, 'https://picsum.photos/200')
    expect(form.getByAltText('Preview of the attached image')).toHaveAttribute(
      'src',
      'https://picsum.photos/200',
    )
  })

  it('shows a message when the image cannot be loaded', async () => {
    const { user, dialog } = await openComposer()
    const form = within(dialog)

    await user.type(
      form.getByLabelText(/Image URL/),
      'https://bad.example/x.png',
    )
    fireEvent.error(form.getByAltText('Preview of the attached image'))

    expect(
      form.getByText("Couldn't load a preview for this image."),
    ).toBeInTheDocument()
  })

  it('accepts a date and time', async () => {
    const { dialog } = await openComposer()
    const input = within(dialog).getByLabelText('Schedule for')

    fireEvent.change(input, { target: { value: '2026-10-20T09:30' } })

    expect(input).toHaveValue('2026-10-20T09:30')
  })

  it('keeps scheduling disabled until validation is added', async () => {
    const { dialog } = await openComposer()

    expect(
      within(dialog).getByRole('button', { name: 'Schedule post' }),
    ).toBeDisabled()
  })

  it('closes on Cancel and starts with an empty form next time', async () => {
    const { user, dialog } = await openComposer()

    await user.type(within(dialog).getByLabelText('Post content'), 'Draft')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New post' }))
    expect(
      within(screen.getByRole('dialog')).getByLabelText('Post content'),
    ).toHaveValue('')
  })

  it('closes from the close button', async () => {
    const { user, dialog } = await openComposer()

    await user.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  describe('character counters', () => {
    // The textarea is described by the counters, so its accessible
    // description is exactly what a screen reader announces.
    const expectCounts = (dialog: HTMLElement, description: string) =>
      expect(
        within(dialog).getByLabelText('Post content'),
      ).toHaveAccessibleDescription(description)

    it('asks for a platform before showing limits', async () => {
      const { dialog } = await openComposer()

      expect(
        within(dialog).getByText(
          'Select a platform to see its character limit.',
        ),
      ).toBeInTheDocument()
    })

    it('shows a live count for each selected platform', async () => {
      const { user, dialog } = await openComposer()
      const form = within(dialog)

      await user.click(form.getByRole('checkbox', { name: 'Facebook' }))
      await user.click(form.getByRole('checkbox', { name: 'X' }))
      await user.type(form.getByLabelText('Post content'), 'Hi ☕')

      expectCounts(dialog, 'Facebook:4 / 5,000 X:4 / 280')
    })

    it('accepts exactly 280 characters for X and flags 281', async () => {
      const { user, dialog } = await openComposer()
      const form = within(dialog)
      const content = form.getByLabelText('Post content')

      await user.click(form.getByRole('checkbox', { name: 'X' }))
      await user.click(form.getByRole('checkbox', { name: 'Instagram' }))
      await user.click(content)
      await user.paste('a'.repeat(280))
      expectCounts(dialog, 'Instagram:280 / 2,200 X:280 / 280')
      expect(form.queryByText(/over\)/)).toBeNull()

      await user.type(content, 'b')
      expectCounts(dialog, 'Instagram:281 / 2,200 X:281 / 280 (1 over)')
      const [instagram, x] = within(
        form.getByRole('list', { name: 'Character count' }),
      ).getAllByRole('listitem')
      expect(x).toHaveClass('text-danger')
      expect(instagram).not.toHaveClass('text-danger')
    })
  })
})
