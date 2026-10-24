import SmartImage from '@/components/SmartImage'
import { useMediaUrl } from '@/hooks/useMediaUrl'

/** Render-prop helper: gives children the (possibly signed) URL of a stored file. */
export function ResolvedMedia({ bucket, path, children }) {
  return children(useMediaUrl(bucket, path))
}

/** Small square thumbnail for admin lists (signs private files on demand). */
export function MediaThumb({ bucket, path, seed = 0, className = 'size-14' }) {
  const url = useMediaUrl(bucket, path)
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-xl bg-blush/60`}>
      <SmartImage src={url} alt="" aspect="1/1" className="size-full" placeholderLabel="" seed={seed} />
    </div>
  )
}
