import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import EmptyState from './EmptyState'

/**
 * Renders the right state for a `useContent` query:
 * loading → themed loader, error → retry card, empty → designed placeholder.
 */
export default function ContentState({ query, isEmpty, empty, loadingMessage, children }) {
  const { data, loading, error, reload } = query

  if (loading) return <LoadingState message={loadingMessage} />
  if (error && data === undefined) {
    return (
      <div className="px-5">
        <ErrorState onRetry={reload} />
      </div>
    )
  }
  const emptyNow = isEmpty ? isEmpty(data) : !data || (Array.isArray(data) && data.length === 0)
  if (emptyNow) {
    return (
      <div className="px-5">
        <EmptyState {...empty} />
      </div>
    )
  }
  return children(data)
}
