/**
 * Storage helpers. Files live in Supabase Storage; the database stores only
 * their paths. Public files get permanent public URLs; private files get
 * short-lived signed URLs — and Storage only signs them if the database
 * policies allow the current visitor to read that section.
 */
import { supabase, isDemoMode } from './supabase'
import { BUCKET } from './mappers'
import { createDemoChimeUrl } from '@/utils/demoAudio'

export const PUBLIC_BUCKETS = new Set([BUCKET.public])
export const SIGNED_URL_TTL = 60 * 60 * 2 // 2 hours; pages refetch (and re-sign) on every visit

/** Synchronous URL for a path, when one can be produced without a network call. */
export function mediaUrl(bucket, path) {
  if (!path) return null
  if (path === 'demo:chime') return createDemoChimeUrl()
  if (path.startsWith('blob:')) return path
  if (isDemoMode || !supabase) return null
  if (PUBLIC_BUCKETS.has(bucket)) return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  return null
}

/**
 * Resolves many (bucket, path) pairs at once. Private files are signed in one
 * request per bucket. Returns a lookup function `(bucket, path) => url | null`.
 */
export async function resolveMediaUrls(refs) {
  const urls = new Map()
  const privateByBucket = new Map()

  for (const [bucket, path] of refs) {
    if (!path) continue
    const sync = mediaUrl(bucket, path)
    if (sync) urls.set(`${bucket}/${path}`, sync)
    else if (!isDemoMode && supabase && !PUBLIC_BUCKETS.has(bucket)) {
      if (!privateByBucket.has(bucket)) privateByBucket.set(bucket, new Set())
      privateByBucket.get(bucket).add(path)
    }
  }

  await Promise.all(
    [...privateByBucket].map(async ([bucket, paths]) => {
      const { data, error } = await supabase.storage.from(bucket).createSignedUrls([...paths], SIGNED_URL_TTL)
      if (error) {
        if (import.meta.env.DEV) console.warn(`[storage] could not sign ${bucket} files`, error)
        return
      }
      for (const item of data ?? []) {
        if (item.signedUrl && !item.error) urls.set(`${bucket}/${item.path}`, item.signedUrl)
      }
    }),
  )

  return (bucket, path) => (path ? (urls.get(`${bucket}/${path}`) ?? null) : null)
}

export function fileNameFromPath(path) {
  if (!path) return ''
  if (path.startsWith('blob:') || path.startsWith('demo:')) return 'preview file'
  return path.split('/').pop()
}
