import { useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Images, Pause, Play } from 'lucide-react'
import Polaroid from '../Polaroid'
import Reveal from '../Reveal'
import Lightbox from '../Lightbox'
import SmartImage from '../SmartImage'
import { personalize } from '@/app/chapters'
import { photoAlt } from '@/hooks/useHerPhotos'

export const RIBBON_MIN_PHOTOS = 3
const MIN_LOOP = 8
const SECONDS_PER_PHOTO = 5
const TILTS = ['-rotate-3 translate-y-1', 'rotate-2 -translate-y-2', '-rotate-1 translate-y-3', 'rotate-3 -translate-y-1']

/**
 * "Look at you ♡": a slow, endless row of Polaroids. Pauses on hover, keyboard
 * focus or the pause button; with reduced motion it becomes a plain swipeable row.
 * Tapping a photo opens it full-screen.
 */
export default function PhotoRibbon({ photos, name }) {
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)

  // Repeat short lists so the row is always wider than the screen, then double it for a seamless loop.
  const items = useMemo(() => {
    if (reduce || !photos.length) return photos
    let loop = [...photos]
    while (loop.length < MIN_LOOP) loop = loop.concat(photos)
    return [...loop, ...loop]
  }, [photos, reduce])

  if (photos.length < RIBBON_MIN_PHOTOS) return null

  return (
    <section aria-labelledby="ribbon-title">
      <Reveal className="mx-auto max-w-3xl px-5 text-center">
        <span className="sticker">Exhibit A ♡</span>
        <h2 id="ribbon-title" className="mt-3 font-hand text-5xl leading-tight font-bold text-balance text-ink">
          Look at you, {name} ♡
        </h2>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">A few of my favourite views. Tap one to see it bigger.</p>
      </Reveal>

      <div
        className={`olu-ribbon relative mt-4 py-8 ${
          reduce ? 'overflow-x-auto' : 'overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]'
        }`}
      >
        <ul
          className={`flex w-max px-3 ${reduce ? '' : 'olu-ribbon-track'}`}
          style={reduce ? undefined : { animationDuration: `${(items.length / 2) * SECONDS_PER_PHOTO}s` }}
          data-paused={paused}
          aria-hidden="true"
        >
          {items.map((photo, i) => {
            const photoIndex = i % photos.length
            return (
              <li key={`${photo.id}-${i}`} className="pr-5 sm:pr-7">
                {/* Moving targets can't be reached reliably by keyboard, so keyboard and screen-reader users get the "See them all" button instead. */}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setOpenIndex(photoIndex)}
                  className={`block w-36 transition duration-300 hover:z-10 hover:-translate-y-2 hover:scale-105 hover:rotate-0 sm:w-44 ${TILTS[i % TILTS.length]}`}
                >
                  <Polaroid
                    photo={photo}
                    name={name}
                    decorative
                    tape={i % 3 === 0}
                    seed={photoIndex + 2}
                    padding="p-2 pb-2.5"
                    captionClassName="line-clamp-1 pt-1.5 text-lg"
                    sizes="(min-width: 640px) 176px, 144px"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-1 flex flex-wrap justify-center gap-1">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-ink-soft transition hover:bg-white/70 hover:text-berry-deep"
        >
          <Images className="size-3.5" aria-hidden="true" />
          See them all ({photos.length})
        </button>
        {!reduce && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-ink-soft transition hover:bg-white/70 hover:text-berry-deep"
          >
            {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
            {paused ? 'Play the photos' : 'Pause the photos'}
          </button>
        )}
      </div>

      <Lightbox
        items={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
        label={`Photos of ${name}`}
        renderMedia={(photo, i) =>
          photo.image_url ? (
            <SmartImage
              src={photo.image_url}
              alt={photoAlt(photo, name)}
              aspect={photo.image_width && photo.image_height ? `${photo.image_width}/${photo.image_height}` : '4/5'}
              className="max-h-[68dvh] w-auto max-w-full rounded-xl bg-transparent shadow-lift"
              imgClassName="object-contain"
              eager
              seed={i}
            />
          ) : (
            <div className="w-[min(80vw,24rem)] overflow-hidden rounded-xl bg-white p-3 shadow-lift">
              <SmartImage src={null} aspect="4/5" seed={i + 2} placeholderLabel="A photo of you ♡" />
            </div>
          )
        }
        renderCaption={(photo) => (photo.caption ? <p className="font-hand text-3xl font-bold">{personalize(photo.caption, name)}</p> : null)}
      />
    </section>
  )
}
