import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MapPin } from 'lucide-react'
import SmartImage from './SmartImage'
import HeartBurst from './HeartBurst'
import PlaceholderBadge from './PlaceholderBadge'
import { formatDate } from '@/utils/format'

const TAPES = ['bg-butter/80', 'bg-lavender/80', 'bg-blush-deep/70', 'bg-peach-deep/70']

/**
 * Polaroid-style photo card with tape, a slight tilt, a caption that appears
 * on hover (desktop) or is always visible (touch), and a favourite heart.
 */
export default function PhotoCard({ memory, index = 0, onOpen, isFavorite, onToggleFavorite }) {
  const [burst, setBurst] = useState(0)
  const tilt = [-2.5, 1.8, -1.2, 2.6, -2, 1.2][index % 6]
  const date = formatDate(memory.taken_on, { month: 'short', year: 'numeric' })

  return (
    <motion.article
      className="group relative mb-5 break-inside-avoid pt-3"
      initial={{ opacity: 0, y: 30, rotate: tilt * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: 'spring', stiffness: 110, damping: 16, delay: (index % 4) * 0.06 }}
      whileHover={{ rotate: 0, scale: 1.03, y: -4 }}
    >
      <span
        className={`absolute top-0 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rotate-[-4deg] rounded-sm ${TAPES[index % TAPES.length]} shadow-sm`}
        aria-hidden="true"
      />
      <div className="rounded-md bg-white p-2.5 pb-3 shadow-card transition-shadow group-hover:shadow-lift sm:p-3">
        <button
          type="button"
          onClick={onOpen}
          className="block w-full overflow-hidden rounded-sm text-left"
          aria-label={`Open photo: ${memory.title || memory.caption || 'memory'}`}
        >
          <SmartImage
            src={memory.image_url}
            alt={memory.alt_text || memory.caption || memory.title || ''}
            aspect={memory.aspect || (memory.width && memory.height ? `${memory.width}/${memory.height}` : '4/5')}
            seed={index}
            placeholderLabel="Photo coming soon"
            className="transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </button>
        <div className="relative flex items-start justify-between gap-2 px-1 pt-3">
          <div className="min-w-0">
            <h2 className="font-hand text-[1.45rem] leading-tight font-bold text-ink">{memory.title}</h2>
            {memory.caption && (
              <p className="mt-0.5 text-sm text-ink-soft transition-all duration-300 can-hover:max-h-0 can-hover:overflow-hidden can-hover:opacity-0 can-hover:group-focus-within:max-h-24 can-hover:group-focus-within:opacity-100 can-hover:group-hover:max-h-24 can-hover:group-hover:opacity-100">
                {memory.caption}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-rose">
              {date && <span>{date}</span>}
              {memory.location && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="size-3" aria-hidden="true" />
                  {memory.location}
                </span>
              )}
              <PlaceholderBadge show={memory.is_placeholder} />
            </div>
          </div>
          <span className="relative">
            <button
              type="button"
              onClick={() => {
                if (!isFavorite) setBurst((n) => n + 1)
                onToggleFavorite?.()
              }}
              aria-pressed={!!isFavorite}
              aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              className="-mt-1 -mr-1 grid size-11 place-items-center rounded-full transition hover:bg-blush"
            >
              <motion.span animate={isFavorite ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
                <Heart className={`size-5 ${isFavorite ? 'fill-berry text-berry' : 'text-rose'}`} aria-hidden="true" />
              </motion.span>
            </button>
            <HeartBurst trigger={burst} count={8} spread={36} />
          </span>
        </div>
      </div>
    </motion.article>
  )
}
