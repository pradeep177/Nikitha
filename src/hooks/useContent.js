import { useCallback, useEffect, useState } from 'react'
import { content } from '@/lib/database'
import { useAuth } from './useAuth'

const cache = new Map()
const INVALIDATED = 'olu:content-invalidated'

/** Clears cached content and tells mounted pages to refetch (after sign-in/out or admin edits). */
export function invalidateContent(name) {
  if (name) cache.delete(name)
  else cache.clear()
  window.dispatchEvent(new CustomEvent(INVALIDATED, { detail: name ?? null }))
}

/**
 * Loads one piece of public content by name, e.g. useContent('listMemories').
 * Returns { data, loading, error, reload }. Cached data is shown instantly on
 * revisits while fresh data loads. Waits for the auth session so the database
 * sees the right user, and refetches when the signed-in user changes.
 */
export function useContent(name) {
  const { ready, epoch } = useAuth()
  const [nonce, setNonce] = useState(0)
  const key = `${name}:${epoch}:${nonce}`
  const [result, setResult] = useState(() =>
    cache.has(name) ? { key, data: cache.get(name), error: null } : { key: null, data: undefined, error: null },
  )

  useEffect(() => {
    if (!ready) return undefined
    let cancelled = false
    const loader = content[name]
    if (!loader) throw new Error(`Unknown content "${name}"`)
    loader().then(
      (data) => {
        cache.set(name, data)
        if (!cancelled) setResult({ key, data, error: null })
      },
      (error) => {
        if (import.meta.env.DEV) console.error(`[content] ${name}`, error)
        if (!cancelled) setResult({ key, data: undefined, error })
      },
    )
    return () => {
      cancelled = true
    }
  }, [name, key, ready])

  useEffect(() => {
    const onInvalidated = (event) => {
      if (!event.detail || event.detail === name) setNonce((n) => n + 1)
    }
    window.addEventListener(INVALIDATED, onInvalidated)
    return () => window.removeEventListener(INVALIDATED, onInvalidated)
  }, [name])

  // Stale data from a previous user is discarded rather than shown.
  const sameUser = result.key?.split(':')[1] === String(epoch)
  const data = sameUser || cache.has(name) ? result.data : undefined
  const loading = result.key !== key && data === undefined
  const reload = useCallback(() => {
    cache.delete(name)
    setNonce((n) => n + 1)
  }, [name])

  return { data, loading, error: result.key === key ? result.error : null, reload }
}
