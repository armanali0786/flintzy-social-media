import { Component, type ErrorInfo, type ReactNode } from 'react'
import { StatePanel } from './StatePanel'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** Shows a recoverable message instead of a blank page if rendering crashes. */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="mx-auto max-w-3xl p-4 sm:py-12">
        <StatePanel
          role="alert"
          title="Something went wrong"
          description="An unexpected error occurred. Reloading the page usually fixes it."
          action={
            <button
              type="button"
              className="btn-primary-sm"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          }
        />
      </main>
    )
  }
}
