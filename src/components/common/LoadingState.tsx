export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 h-4 w-2/3 rounded bg-gray-200" />
      <div className="mb-2 h-3 w-full rounded bg-gray-100" />
      <div className="h-3 w-5/6 rounded bg-gray-100" />
    </div>
  )
}

export default function LoadingState({ count = 3, label }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label ?? 'Loading content'}</span>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
