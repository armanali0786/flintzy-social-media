import type { ReactNode } from 'react'

interface StatePanelProps {
  title: string
  description: string
  action?: ReactNode
  role?: 'alert'
  /** Decorative illustration shown above the title */
  illustration?: string
}

/** Centred message for empty, no-results and error states. */
export function StatePanel({
  title,
  description,
  action,
  role,
  illustration,
}: StatePanelProps) {
  return (
    <div
      role={role}
      className="card flex flex-col items-center gap-4 py-10 text-center"
    >
      {illustration && (
        <img
          src={illustration}
          alt=""
          width={240}
          height={132}
          className="h-auto w-48 sm:w-60"
        />
      )}
      <div className="flex flex-col gap-1">
        <p className="text-body-lg font-semibold">{title}</p>
        <p className="text-body-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}
