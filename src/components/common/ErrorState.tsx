export default function ErrorState({
  title = "We couldn't load this.",
  description = 'Something went wrong loading this content.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
      <p className="font-medium text-red-800">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-red-600">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="focus-ring mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  )
}
