import { screen } from '@testing-library/react'
import { postsApi } from '@/api/postsApi'
import { renderWithQueryClient } from '@/test/renderWithQueryClient'
import { App } from './App'

test('renders the app heading and local time zone', () => {
  vi.spyOn(postsApi, 'getPosts').mockResolvedValue([])
  renderWithQueryClient(<App />)

  expect(
    screen.getByRole('heading', { name: 'Flintzy Scheduler' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/Asia\/(Kolkata|Calcutta)/)).toBeInTheDocument()
})
