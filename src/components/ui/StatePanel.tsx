import type { ReactNode } from 'react'

interface StatePanelProps {
  title: string
  description: string
  action?: ReactNode
  role?: 'alert'
}

/** Centred message for empty, no-results and error states. */
export function StatePanel({
  title,
  description,
  action,
  role,
}: StatePanelProps) {
  return (
    <div
      role={role}
      className="card flex flex-col items-center gap-4 py-10 text-center"
    >
      <div className="flex flex-col gap-1">
        <p className="text-body-lg font-semibold">{title}</p>
        <p className="text-body-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}
