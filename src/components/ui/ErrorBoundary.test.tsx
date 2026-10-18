import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Crash(): never {
  throw new Error('Boom')
}

test('shows a fallback instead of a blank page when rendering crashes', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})

  render(
    <ErrorBoundary>
      <Crash />
    </ErrorBoundary>,
  )

  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  expect(
    screen.getByRole('button', { name: 'Reload page' }),
  ).toBeInTheDocument()
})

test('renders children when nothing fails', () => {
  render(
    <ErrorBoundary>
      <p>All good</p>
    </ErrorBoundary>,
  )

  expect(screen.getByText('All good')).toBeInTheDocument()
})
