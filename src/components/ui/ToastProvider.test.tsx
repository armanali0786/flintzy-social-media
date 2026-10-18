import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { TOAST_DURATION_MS, ToastProvider } from './ToastProvider'
import { useToast } from './useToast'

function ShowToastOnMount({ message }: { message: string }) {
  const showToast = useToast()
  useEffect(() => showToast({ message, tone: 'error' }), [message, showToast])
  return null
}

describe('ToastProvider', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('announces a toast and lets the user dismiss it', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ToastProvider>
        <ShowToastOnMount message="Retry failed" />
      </ToastProvider>,
    )

    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'Retry failed',
    )

    await user.click(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    )

    expect(screen.queryByText('Retry failed')).toBeNull()
  })

  it('dismisses toasts automatically', () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <ShowToastOnMount message="Post scheduled" />
      </ToastProvider>,
    )
    expect(screen.getByText('Post scheduled')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 1))
    expect(screen.getByText('Post scheduled')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1))
    expect(screen.queryByText('Post scheduled')).toBeNull()
  })

  it('throws a clear error when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ShowToastOnMount message="x" />)).toThrow(
      'useToast must be used inside <ToastProvider>',
    )
  })
})
