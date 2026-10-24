import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import ErrorState from '@/components/ErrorState'
import FloatingDecorations from '@/components/FloatingDecorations'

/** Last-resort error boundary so a single failure never blanks the whole site. */
export default function RouteError() {
  const error = useRouteError()
  const isChunkError = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message)

  let message = "Something unexpected happened. Let's take you somewhere safe."
  if (isRouteErrorResponse(error) && error.status === 404) message = "This page doesn't exist in our little universe."
  if (isChunkError) message = 'A new version of the site is available. Refreshing usually fixes this.'

  if (import.meta.env.DEV) console.error(error)

  return (
    <div className="relative grid min-h-dvh place-items-center px-4">
      <FloatingDecorations />
      <div className="relative z-10">
        <ErrorState message={message} onRetry={() => window.location.reload()} />
        <p className="mt-6 text-center">
          <Link to="/" className="btn btn-ghost">
            Back to the beginning ♡
          </Link>
        </p>
      </div>
    </div>
  )
}
