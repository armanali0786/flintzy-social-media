import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { ComposerForm } from './ComposerForm'

function renderForm(props: Partial<ComponentProps<typeof ComposerForm>> = {}) {
  const onSubmit = vi.fn()
  const user = userEvent.setup()
  render(<ComposerForm onSubmit={onSubmit} onCancel={() => {}} {...props} />)
  return { onSubmit, user }
}

const setScheduledAt = (value: string) =>
  fireEvent.change(screen.getByLabelText('Schedule for'), {
    target: { value },
  })

const submit = () => screen.getByRole('button', { name: 'Schedule post' })
const content = () => screen.getByLabelText('Post content')

describe('composer validation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-16T06:30:00.000Z')) // 12:00 local
  })

  afterEach(() => {
    vi.useRealTimers()
  })

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
    setScheduledAt('2026-12-01T09:00')
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
    setScheduledAt('2026-12-01T09:00')
    await user.click(submit())

    expect(onSubmit).toHaveBeenCalledWith({
      content: 'a'.repeat(280),
      platforms: ['instagram', 'x'],
      mediaUrl: 'https://picsum.photos/200',
      scheduledAt: '2026-12-01T09:00',
    })
  })

  it('limits the picker to future times', () => {
    renderForm()
    expect(screen.getByLabelText('Schedule for')).toHaveAttribute(
      'min',
      '2026-10-16T12:00',
    )
  })

  it('rejects a time in the past', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(content(), 'Hello')
    await user.click(screen.getByRole('checkbox', { name: 'X' }))
    setScheduledAt('2026-10-16T11:30')
    await user.click(submit())

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Schedule for')).toHaveFocus()
    expect(screen.getByText('Choose a time in the future.')).toBeInTheDocument()
  })

  it('re-checks the time on submit in case it passed while the form was open', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(content(), 'Hello')
    await user.click(screen.getByRole('checkbox', { name: 'X' }))
    setScheduledAt('2026-10-16T12:05')
    vi.setSystemTime(new Date('2026-10-16T06:40:00.000Z')) // now 12:10 local
    await user.click(submit())

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Choose a time in the future.')).toBeInTheDocument()
  })

  it('shows progress and blocks double submits while scheduling', () => {
    renderForm({ isSubmitting: true })
    expect(screen.getByRole('button', { name: 'Scheduling…' })).toBeDisabled()
  })

  it('shows a submit error', () => {
    renderForm({ submitError: 'Something went wrong.' })
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })
})
