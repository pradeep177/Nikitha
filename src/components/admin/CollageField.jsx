import { useContext, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, Plus, X } from 'lucide-react'
import { MediaThumb } from './MediaPreview'
import { MediaSessionContext } from '@/admin/media/mediaSession'
import { uploadMedia, MEDIA_RULES } from '@/lib/media'

/** Several photos (e.g. a collage): upload, reorder and remove, up to `max`. */
export default function CollageField({ id, value = [], onChange, media, describedBy }) {
  const { track } = useContext(MediaSessionContext)
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(null)
  const [errors, setErrors] = useState([])
  const max = media.max ?? 6
  const list = value ?? []

  const addFiles = async (files) => {
    const room = max - list.length
    const chosen = [...files].slice(0, room)
    const problems = []
    let next = [...list]
    for (const [i, file] of chosen.entries()) {
      setBusy(`Uploading ${i + 1} of ${chosen.length}…`)
      try {
        const result = await uploadMedia({ file, bucket: media.bucket, folder: media.folder, kind: 'image', maxDimension: media.maxDimension })
        track(media.bucket, result.path)
        next = [...next, result.path]
        onChange(next)
      } catch (err) {
        problems.push(`${file.name}: ${err.message}`)
      }
    }
    if (files.length > room) problems.push(`Only ${max} photos fit in the collage.`)
    setErrors(problems)
    setBusy(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const move = (index, step) => {
    const next = [...list]
    ;[next[index], next[index + step]] = [next[index + step], next[index]]
    onChange(next)
  }

  return (
    <div id={id} aria-describedby={describedBy} className="rounded-2xl border-2 border-dashed border-blush-deep bg-paper p-3">
      <input ref={inputRef} type="file" accept={MEDIA_RULES.image.accept} multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => addFiles(e.target.files)} />
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {list.map((path, i) => (
          <li key={path} className="relative">
            <MediaThumb bucket={media.bucket} path={path} seed={i} className="aspect-square w-full" />
            <div className="absolute inset-x-1 bottom-1 flex justify-between">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-7 place-items-center rounded-full bg-white/90 disabled:opacity-30" aria-label={`Move photo ${i + 1} earlier`}>
                <ArrowLeft className="size-3.5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-full bg-white/90" aria-label={`Remove photo ${i + 1}`}>
                <X className="size-3.5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="grid size-7 place-items-center rounded-full bg-white/90 disabled:opacity-30" aria-label={`Move photo ${i + 1} later`}>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
        {list.length < max && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={!!busy}
              className="grid aspect-square w-full place-items-center rounded-xl border-2 border-dashed border-blush-deep text-berry-deep hover:bg-blush disabled:opacity-60"
              aria-label="Add photos to the collage"
            >
              {busy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Plus className="size-6" aria-hidden="true" />}
            </button>
          </li>
        )}
      </ul>
      <p className="mt-2 text-xs text-ink-soft" aria-live="polite">
        {busy ?? `${list.length} of ${max} photos. You can select several at once.`}
      </p>
      {errors.length > 0 && (
        <ul role="alert" className="mt-2 space-y-1 rounded-xl bg-lavender px-3 py-2 text-xs font-bold text-ink">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
