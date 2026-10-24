import { useEffect, useState } from 'react'
import { supabase, isDemoMode } from '@/lib/supabase'
import { mediaUrl, PUBLIC_BUCKETS } from '@/lib/storage'

const SIGN_TTL = 60 * 30
const cache = new Map()

/**
 * URL for a stored file. Public files resolve instantly; private files are
 * signed on demand (admins may read every file) and cached for a while.
 */
export function useMediaUrl(bucket, path) {
  const sync = mediaUrl(bucket, path)
  const key = `${bucket}/${path}`
  const needsSigning = !!path && !sync && !isDemoMode && !!supabase && !PUBLIC_BUCKETS.has(bucket)
  const cached = needsSigning ? cache.get(key) : null
  const fresh = cached?.url ?? null
  const [signed, setSigned] = useState({ key: null, url: null })

  useEffect(() => {
    if (!needsSigning || fresh) return undefined
    let cancelled = false
    supabase.storage
      .from(bucket)
      .createSignedUrl(path, SIGN_TTL)
      .then(({ data }) => {
        const url = data?.signedUrl ?? null
        if (url) {
          cache.set(key, { url })
          // Forget the URL a minute before it expires so it gets re-signed.
          setTimeout(() => cache.delete(key), (SIGN_TTL - 60) * 1000)
        }
        if (!cancelled) setSigned({ key, url })
      })
    return () => {
      cancelled = true
    }
  }, [bucket, path, key, needsSigning, fresh])

  if (!path) return null
  return sync ?? fresh ?? (signed.key === key ? signed.url : null)
}
