import { createContext, useCallback, useEffect, useMemo, useRef } from 'react'
import { removeFileIfUnused } from '@/lib/media'
import { getIn } from '../forms'

export const MediaSessionContext = createContext({ track: () => {} })

const key = (r) => `${r.bucket}|${r.path}`

/** All (bucket, path) pairs referenced by the media fields of a form. */
export function mediaPaths(fields, values) {
  const refs = []
  for (const field of fields) {
    if (!values || !field.media?.bucket) continue
    const value = getIn(values, field.name)
    const list = Array.isArray(value) ? value : [value]
    list.filter(Boolean).forEach((path) => refs.push({ bucket: field.media.bucket, path }))
  }
  return refs
}

/**
 * Tracks files uploaded while an editor is open so that:
 *  • after a successful save, files that were replaced/removed are cleaned up;
 *  • after discarding (or navigating away), unsaved uploads are cleaned up.
 * Every deletion is double-checked against the database first.
 */
export function useMediaSession(fields) {
  const uploads = useRef([])
  const track = useCallback((bucket, path) => uploads.current.push({ bucket, path }), [])

  const afterSave = useCallback(
    async (before, after) => {
      const keep = new Set(mediaPaths(fields, after).map(key))
      const candidates = [...mediaPaths(fields, before), ...uploads.current].filter((r) => !keep.has(key(r)))
      uploads.current = []
      const seen = new Set()
      const unique = candidates.filter((r) => (seen.has(key(r)) ? false : seen.add(key(r))))
      await Promise.allSettled(unique.map((r) => removeFileIfUnused(r.bucket, r.path)))
    },
    [fields],
  )

  const discard = useCallback(() => {
    const pending = uploads.current
    uploads.current = []
    pending.forEach((r) => removeFileIfUnused(r.bucket, r.path))
  }, [])

  // Leaving the editor without saving (closing, navigating away) discards new uploads.
  useEffect(() => discard, [discard])

  const context = useMemo(() => ({ track }), [track])
  return { context, afterSave, discard }
}
