import { useEffect, useId, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Native <dialog> opened with showModal(), which provides the focus trap,
 * Escape to close, an inert background and focus return for free.
 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-canvas text-ink backdrop:bg-ink/40 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:max-w-xl sm:rounded-lg sm:shadow-float"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-hairline bg-canvas px-4 py-3 sm:px-6">
        <h2 id={titleId} className="text-body-lg font-bold">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="btn size-9 rounded-full text-body-lg hover:bg-surface-soft"
        >
          ✕
        </button>
      </div>
      {open && <div className="p-4 sm:p-6">{children}</div>}
    </dialog>
  )
}
