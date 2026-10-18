import { render, screen } from '@testing-library/react'
import { App } from './App'
import { AppProviders } from './providers'

test('the production providers render the app and load posts', async () => {
  render(
    <AppProviders>
      <App />
    </AppProviders>,
  )

  expect(
    screen.getByRole('heading', { name: 'Flintzy Scheduler' }),
  ).toBeInTheDocument()
  expect(
    await screen.findAllByRole('article', {}, { timeout: 3000 }),
  ).not.toHaveLength(0)
})
