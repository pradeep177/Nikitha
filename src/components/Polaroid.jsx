import SmartImage from './SmartImage'
import { personalize } from '@/app/chapters'
import { photoAlt } from '@/hooks/useHerPhotos'

/** A white Polaroid frame around one photo of her, with optional tape and handwritten caption. */
export default function Polaroid({
  photo,
  name,
  aspect = '4/5',
  className = '',
  padding = 'p-2 pb-3',
  captionClassName = 'pt-1.5 text-lg',
  showCaption = true,
  tape = false,
  decorative = false,
  eager = false,
  seed = 0,
  placeholderLabel = '',
  sizes,
}) {
  const caption = showCaption && photo?.caption ? personalize(photo.caption, name) : null
  return (
    <div className={`relative rounded-md bg-white shadow-lift ${padding} ${className}`}>
      {tape && (
        <span
          className="absolute -top-2.5 left-1/2 z-10 h-5 w-[45%] max-w-16 -translate-x-1/2 -rotate-3 rounded-sm bg-butter/85 shadow-sm"
          aria-hidden="true"
        />
      )}
      <SmartImage
        src={photo?.image_url}
        alt={decorative ? '' : photoAlt(photo, name)}
        aspect={aspect}
        className="rounded-sm"
        seed={seed}
        eager={eager}
        sizes={sizes}
        placeholderLabel={decorative ? '' : placeholderLabel}
      />
      {caption && <p className={`text-center font-hand leading-tight text-balance text-ink-soft ${captionClassName}`}>{caption}</p>}
    </div>
  )
}
