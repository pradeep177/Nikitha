import { CloudRain, RotateCcw } from 'lucide-react'

/** Friendly error card with an optional retry action. */
export default function ErrorState({
  title = 'Oops, a little cloud got in the way',
  message = "Something didn't load properly. Please try again in a moment.",
  onRetry,
  className = '',
}) {
  return (
    <div role="alert" className={`card-paper mx-auto max-w-md px-6 py-10 text-center ${className}`}>
      <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-lavender">
        <CloudRain className="size-9 text-berry-deep" aria-hidden="true" />
      </div>
      <h2 className="font-hand text-3xl font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-ink-soft">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-soft mt-6">
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}
