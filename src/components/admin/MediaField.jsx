import { useContext, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FileAudio, FileImage, FileVideo, Loader2, RotateCcw, Trash2, Upload, X } from 'lucide-react'
import SmartImage from '@/components/SmartImage'
import { MediaSessionContext } from '@/admin/media/mediaSession'
import { MEDIA_RULES, formatBytes, uploadMedia, validateFile } from '@/lib/media'
import { fileNameFromPath } from '@/lib/storage'
import { useMediaUrl } from '@/hooks/useMediaUrl'

const KIND_ICON = { image: FileImage, audio: FileAudio, video: FileVideo }

/**
 * Pick / drag-and-drop a file, upload it with progress, preview it,
 * replace or remove it. Uploads start immediately; the form only stores the
 * resulting storage path when it is saved.
 */
export default function MediaField({ id, value, onChange, media, values, setValue, describedBy }) {
  const kind = media?.kind ?? 'image'
  const rules = MEDIA_RULES[kind]
  const Icon = KIND_ICON[kind]
  const folder = typeof media?.folder === 'function' ? media.folder(values ?? {}) : (media?.folder ?? 'misc')
  const { track } = useContext(MediaSessionContext)
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [failedFile, setFailedFile] = useState(null)
  const [local, setLocal] = useState(null)
  const [dragging, setDragging] = useState(false)

  const remoteUrl = useMediaUrl(media?.bucket, value)
  const isLocal = !!local && !!value && local.path === value
  const previewUrl = isLocal ? local.url : remoteUrl

  const start = async (file) => {
    if (!file) return
    const problem = validateFile(file, kind)
    if (problem) {
      setError(problem)
      setFailedFile(null)
      setStatus('error')
      return
    }
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('uploading')
    setProgress(0)
    setError(null)
    try {
      const result = await uploadMedia({
        file,
        bucket: media.bucket,
        folder,
        kind,
        maxDimension: media.maxDimension,
        onProgress: setProgress,
        signal: controller.signal,
      })
      track(media.bucket, result.path)
      setLocal({ path: result.path, url: result.previewUrl, size: result.size, name: file.name })
      onChange(result.path)
      if (media.dimensions && result.width) {
        setValue?.(media.dimensions.width, result.width)
        setValue?.(media.dimensions.height, result.height)
      }
      setStatus('idle')
      setFailedFile(null)
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('idle')
        return
      }
      setError(err.message)
      setFailedFile(file)
      setStatus('error')
    } finally {
      abortRef.current = null
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (status === 'uploading') return
    start(event.dataTransfer.files?.[0])
  }

  const remove = () => {
    onChange(null)
    if (media.dimensions) {
      setValue?.(media.dimensions.width, null)
      setValue?.(media.dimensions.height, null)
    }
    setError(null)
    setStatus('idle')
  }

  return (
    <div
      id={id}
      aria-describedby={describedBy}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded-2xl border-2 border-dashed p-3 transition-colors ${dragging ? 'border-berry bg-blush/60' : 'border-blush-deep bg-paper'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={rules.accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => start(e.target.files?.[0])}
      />
      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-blush/60">
          {kind === 'image' && value ? (
            <SmartImage src={previewUrl} alt="" aspect="1/1" className="size-full" placeholderLabel="" />
          ) : (
            <div className="grid size-full place-items-center">
              <Icon className="size-8 text-rose" aria-hidden="true" />
            </div>
          )}
          {status === 'uploading' && (
            <div className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 className="size-6 animate-spin text-berry-deep" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 basis-48 text-sm">
          {status === 'uploading' ? (
            <div>
              <p className="font-bold text-ink">Uploading… {Math.round(progress * 100)}%</p>
              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-blush"
                role="progressbar"
                aria-label="Upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <motion.div className="h-full rounded-full bg-berry" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.2 }} />
              </div>
              <button type="button" onClick={() => abortRef.current?.abort()} className="btn btn-ghost mt-2 min-h-9 px-3 py-1 text-xs">
                <X className="size-3.5" aria-hidden="true" /> Cancel
              </button>
            </div>
          ) : (
            <>
              {value ? (
                <p className="truncate font-bold text-ink" title={isLocal ? local.name : fileNameFromPath(value)}>
                  {isLocal ? `${local.name} · ${formatBytes(local.size)}` : fileNameFromPath(value)}
                </p>
              ) : (
                <p className="text-ink-soft">
                  Drag a file here, or choose one. <span className="text-xs">({rules.label}, up to {formatBytes(rules.maxBytes)})</span>
                </p>
              )}
              {kind === 'audio' && value && previewUrl && <audio src={previewUrl} controls preload="none" className="mt-2 h-9 w-full" />}
              {kind === 'video' && value && previewUrl && <video src={previewUrl} controls preload="metadata" className="mt-2 max-h-40 w-full rounded-lg bg-ink" />}
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-soft min-h-9 px-3 py-1 text-xs">
                  <Upload className="size-3.5" aria-hidden="true" /> {value ? 'Replace' : 'Choose file'}
                </button>
                {value && (
                  <button type="button" onClick={remove} className="btn btn-ghost min-h-9 px-3 py-1 text-xs">
                    <Trash2 className="size-3.5" aria-hidden="true" /> Remove
                  </button>
                )}
              </div>
            </>
          )}
          {status === 'error' && error && (
            <div role="alert" className="mt-2 rounded-xl bg-lavender px-3 py-2 text-xs font-bold text-ink">
              {error}
              {failedFile && (
                <button type="button" onClick={() => start(failedFile)} className="ml-2 inline-flex items-center gap-1 text-berry-deep underline">
                  <RotateCcw className="size-3" aria-hidden="true" /> Try again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
