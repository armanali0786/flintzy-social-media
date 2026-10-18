export function QueueSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      <output className="sr-only">Loading posts…</output>
      <div
        aria-hidden="true"
        className="mb-2 h-6 w-28 rounded-sm bg-hairline motion-safe:animate-pulse"
      />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          aria-hidden="true"
          className="card flex flex-col gap-3 p-4 motion-safe:animate-pulse sm:p-5"
        >
          <div className="h-4 w-36 rounded-sm bg-surface-soft" />
          <div className="h-4 w-full rounded-sm bg-surface-soft" />
          <div className="h-4 w-2/3 rounded-sm bg-surface-soft" />
        </div>
      ))}
    </div>
  )
}
