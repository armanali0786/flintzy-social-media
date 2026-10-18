import clsx from 'clsx'
import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastOptions, type ToastTone } from './useToast'

export const TOAST_DURATION_MS = 5000

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ message, tone = 'success' }: ToastOptions) => {
      const id = ++nextId.current
      setToasts((current) => [...current, { id, message, tone }])
      setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Top on mobile and bottom-right on larger screens, so toasts never
          cover the centred post list and its Retry buttons. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-4 sm:left-auto sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-md px-4 py-3 text-body-sm shadow-float',
              toast.tone === 'error'
                ? 'bg-danger text-on-dark'
                : 'bg-ink text-on-dark',
            )}
          >
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="btn size-7 rounded-full hover:bg-on-dark/15"
              onClick={() => dismiss(toast.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
