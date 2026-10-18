import { screen } from '@testing-library/react'
import { postsApi } from '@/api/postsApi'
import { renderWithProviders } from '@/test/renderWithProviders'
import { App } from './App'

test('renders the app heading and local time zone', () => {
  vi.spyOn(postsApi, 'getPosts').mockResolvedValue([])
  renderWithProviders(<App />)

  expect(
    screen.getByRole('heading', { name: 'Flintzy Scheduler' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/Asia\/(Kolkata|Calcutta)/)).toBeInTheDocument()
})

test('offers a skip link to the post queue', () => {
  vi.spyOn(postsApi, 'getPosts').mockResolvedValue([])
  renderWithProviders(<App />)

  const link = screen.getByRole('link', { name: 'Skip to post queue' })
  const target = document.querySelector(link.getAttribute('href')!)
  expect(target).toHaveTextContent('Post queue')
  expect(target).toHaveAttribute('tabindex', '-1')
})
