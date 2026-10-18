import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { BrowserRouter } from 'react-router'
import { ToastProvider } from '@/components/ui/ToastProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  // Automatic retries only delay the error state when the API is a local mock.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  )

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
