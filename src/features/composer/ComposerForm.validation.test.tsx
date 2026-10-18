import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComposerForm } from './ComposerForm'

function renderForm() {
  const onSubmit = vi.fn()
  const user = userEvent.setup()
  render(<ComposerForm onSubmit={onSubmit} onCancel={() => {}} />)
  return { onSubmit, user }
}

const submit = () => screen.getByRole('button', { name: 'Schedule post' })
const content = () => screen.getByLabelText('Post content')

describe('composer validation', () => {
  it('shows no errors before the user interacts', () => {
    renderForm()

    expect(content()).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('Write something before scheduling.')).toBeNull()
  })

  it('blocks an empty submit, shows every error and focuses the first field', async () => {
    const { onSubmit, user } = renderForm()

    await user.click(submit())

    expect(onSubmit).not.toHaveBeenCalled()
    expect(content()).toHaveFocus()
    expect(content()).toHaveAttribute('aria-invalid', 'true')
    expect(content()).toHaveAccessibleDescription(
      /Write something before scheduling\./,
    )
    expect(
      screen.getByRole('group', { name: 'Platforms' }),
    ).toHaveAccessibleDescription('Select at least one platform.')
    expect(screen.getByLabelText('Schedule for')).toHaveAccessibleDescription(
      /Choose a date and time\./,
    )
  })

  it('shows a field error after leaving the field and clears it once fixed', async () => {
    const { user } = renderForm()

    await user.click(content())
    await user.tab()
    expect(
      screen.getByText('Write something before scheduling.'),
    ).toBeInTheDocument()

    await user.type(content(), 'Hello')
    expect(screen.queryByText('Write something before scheduling.')).toBeNull()
    expect(content()).not.toHaveAttribute('aria-invalid')
  })

  it('focuses the first invalid field in screen order', async () => {
    const { user } = renderForm()

    await user.type(content(), 'Hello')
    await user.click(submit())

    expect(screen.getByRole('checkbox', { name: 'Facebook' })).toHaveFocus()
  })

  it('blocks scheduling when a platform is over its limit', async () => {
    const { onSubmit, user } = renderForm()

    await user.click(content())
    await user.paste('a'.repeat(281))
    await user.click(screen.getByRole('checkbox', { name: 'X' }))
    fireEvent.change(screen.getByLabelText('Schedule for'), {
      target: { value: '2026-12-01T09:00' },
    })
    await user.click(submit())

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Too long for X (max 280).')).toBeInTheDocument()
    expect(content()).toHaveFocus()
  })

  it('rejects an invalid image URL', async () => {
    const { user } = renderForm()

    await user.type(screen.getByLabelText(/Image URL/), 'example.com/a.png')
    await user.tab()

    expect(screen.getByLabelText(/Image URL/)).toHaveAccessibleDescription(
      'Enter a valid image URL (starting with http:// or https://).',
    )
  })

  it('submits valid values', async () => {
    const { onSubmit, user } = renderForm()

    await user.click(content())
    await user.paste('a'.repeat(280))
    await user.click(screen.getByRole('checkbox', { name: 'X' }))
    await user.click(screen.getByRole('checkbox', { name: 'Instagram' }))
    await user.type(
      screen.getByLabelText(/Image URL/),
      'https://picsum.photos/200',
    )
    fireEvent.change(screen.getByLabelText('Schedule for'), {
      target: { value: '2026-12-01T09:00' },
    })
    await user.click(submit())

    expect(onSubmit).toHaveBeenCalledWith({
      content: 'a'.repeat(280),
      platforms: ['instagram', 'x'],
      mediaUrl: 'https://picsum.photos/200',
      scheduledAt: '2026-12-01T09:00',
    })
  })
})
