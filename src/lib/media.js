/**
 * Media uploads: validation, in-browser image optimisation, uploads with
 * progress, and safe deletion.
 *
 *  • Every upload gets a brand-new random path, so files are never overwritten.
 *  • Files are only deleted after the database confirms nothing references
 *    them any more (public.media_path_in_use).
 *  • Demo mode keeps files in memory (blob: URLs) — nothing leaves the browser.
 */
import { supabase, isDemoMode, SUPABASE_URL, SUPABASE_KEY } from './supabase'

const MB = 1024 * 1024

export const MEDIA_RULES = {
  image: {
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    maxBytes: 15 * MB,
    label: 'JPG, PNG, WebP, GIF or AVIF',
    accept: 'image/jpeg,image/png,image/webp,image/gif,image/avif',
  },
  audio: {
    types: ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm'],
    maxBytes: 20 * MB,
    label: 'MP3, M4A, AAC, OGG, WAV or WebM audio',
    accept: 'audio/*,.mp3,.m4a,.aac,.ogg,.wav,.webm',
  },
  video: {
    types: ['video/mp4', 'video/webm'],
    maxBytes: 50 * MB,
    label: 'MP4 or WebM video',
    accept: 'video/mp4,video/webm',
  },
}

/** GIFs stay as-is (to keep animation), so they get a tighter limit. */
const GIF_MAX = 8 * MB

const EXTENSION_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', oga: 'audio/ogg', wav: 'audio/wav', weba: 'audio/webm',
  mp4: 'video/mp4', webm: 'video/webm', heic: 'image/heic', heif: 'image/heif',
}
const TYPE_ALIASES = { 'audio/mp3': 'audio/mpeg', 'audio/x-mp3': 'audio/mpeg', 'audio/vnd.wave': 'audio/wav', 'image/jpg': 'image/jpeg' }
const EXTENSIONS = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif',
  'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac', 'audio/ogg': 'ogg',
  'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/webm': 'webm', 'video/mp4': 'mp4', 'video/webm': 'webm',
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / MB).toFixed(1)} MB`
}

/** Browsers sometimes report an empty or non-standard MIME type; fix it up from the extension. */
export function detectType(file) {
  const ext = file.name?.split('.').pop()?.toLowerCase() ?? ''
  const raw = (file.type || EXTENSION_TYPES[ext] || '').toLowerCase()
  return TYPE_ALIASES[raw] ?? (raw === 'audio/x-m4a' ? 'audio/mp4' : raw)
}

/** Returns a friendly error message, or null if the file is acceptable. */
export function validateFile(file, kind) {
  const rules = MEDIA_RULES[kind]
  if (!file) return 'No file selected.'
  const type = detectType(file)
  if (type === 'image/heic' || type === 'image/heif') {
    return 'iPhone HEIC photos can’t be shown in most browsers. Please share or export the photo as JPEG and try again.'
  }
  if (!rules.types.includes(type)) return `That file type isn’t supported here. Please use ${rules.label}.`
  if (file.size === 0) return 'That file is empty.'
  const limit = type === 'image/gif' ? GIF_MAX : rules.maxBytes
  if (file.size > limit) return `That file is ${formatBytes(file.size)} — the limit is ${formatBytes(limit)}.`
  return null
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Resizes large photos (longest side ≤ maxDimension) and re-encodes them as
 * WebP (JPEG fallback), honouring EXIF orientation. Keeps the original if
 * that is already smaller.
 */
export async function prepareImage(file, { maxDimension = 2000, quality = 0.85 } = {}) {
  const type = detectType(file)
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('This image couldn’t be read. It may be damaged or in an unsupported format.')
  }
  const { width, height } = bitmap

  if (type === 'image/gif') {
    bitmap.close?.()
    return { blob: file, type, ext: 'gif', width, height }
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height))
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  let blob = await canvasToBlob(canvas, 'image/webp', quality)
  let outType = 'image/webp'
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality)
    outType = 'image/jpeg'
  }
  if (!blob) throw new Error('This image couldn’t be processed.')

  if (scale === 1 && file.size <= blob.size && MEDIA_RULES.image.types.includes(type)) {
    return { blob: file, type, ext: EXTENSIONS[type], width, height }
  }
  return { blob, type: outType, ext: EXTENSIONS[outType], width: w, height: h }
}

function friendlyStorageError(status, bodyText) {
  let message
  try {
    message = JSON.parse(bodyText)?.message ?? ''
  } catch {
    message = bodyText
  }
  if (status === 413 || /maximum allowed size|too large/i.test(message)) return 'That file is larger than this storage area allows.'
  if (/mime|content type|not supported/i.test(message)) return 'This storage area doesn’t accept that kind of file.'
  if (status === 401 || status === 403 || /row-level security|unauthori[sz]ed/i.test(message)) {
    return 'You don’t have permission to upload. Please sign in again as the admin.'
  }
  return message || `Upload failed (error ${status}).`
}

const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/')

function uploadWithProgress({ bucket, path, blob, contentType, token, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodePath(path)}`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', SUPABASE_KEY)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('cache-control', 'max-age=31536000')
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress?.(event.loaded / event.total)
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(friendlyStorageError(xhr.status, xhr.responseText))))
    xhr.onerror = () => reject(new Error('The upload failed — check your connection and try again.'))
    xhr.onabort = () => reject(Object.assign(new Error('Upload cancelled.'), { name: 'AbortError' }))
    signal?.addEventListener('abort', () => xhr.abort(), { once: true })
    xhr.send(blob)
  })
}

function fakeProgress(onProgress) {
  return new Promise((resolve) => {
    let p = 0
    const timer = setInterval(() => {
      p = Math.min(1, p + 0.25)
      onProgress?.(p)
      if (p >= 1) {
        clearInterval(timer)
        resolve()
      }
    }, 90)
  })
}

/**
 * Validates, optimises (images) and uploads a file.
 * Returns { path, width, height, size, previewUrl }.
 */
export async function uploadMedia({ file, bucket, folder, kind = 'image', maxDimension, onProgress, signal }) {
  const problem = validateFile(file, kind)
  if (problem) throw new Error(problem)

  let blob = file
  let contentType = detectType(file)
  let ext = EXTENSIONS[contentType] ?? file.name.split('.').pop()
  let width = null
  let height = null

  if (kind === 'image') {
    const prepared = await prepareImage(file, { maxDimension })
    ;({ blob, width, height, ext } = prepared)
    contentType = prepared.type
  }

  if (isDemoMode || !supabase) {
    await fakeProgress(onProgress)
    const url = URL.createObjectURL(blob)
    return { path: url, width, height, size: blob.size, previewUrl: url }
  }

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Your session has expired. Please sign in again.')

  const safeFolder = folder.replace(/[^a-z0-9_/-]/gi, '') || 'misc'
  const path = `${safeFolder}/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`
  await uploadWithProgress({ bucket, path, blob, contentType, token, onProgress, signal })
  return { path, width, height, size: blob.size, previewUrl: URL.createObjectURL(blob) }
}

/**
 * Deletes a stored file only if no database row still references it.
 * Never throws — a leftover file is harmless, a wrongly deleted one is not.
 */
export async function removeFileIfUnused(bucket, path) {
  if (!path || path.startsWith('demo:')) return 'skipped'
  if (path.startsWith('blob:')) {
    if (isDemoMode) return 'kept'
    URL.revokeObjectURL(path)
    return 'revoked'
  }
  if (isDemoMode || !supabase) return 'skipped'
  try {
    const { data: inUse, error } = await supabase.rpc('media_path_in_use', { p_bucket: bucket, p_path: path })
    if (error) throw error
    if (inUse) return 'in-use'
    const { error: removeError } = await supabase.storage.from(bucket).remove([path])
    if (removeError) throw removeError
    return 'removed'
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[media] could not clean up', bucket, path, err)
    return 'failed'
  }
}
