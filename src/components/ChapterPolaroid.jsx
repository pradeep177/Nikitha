import { motion, useReducedMotion } from 'framer-motion'
import Polaroid from './Polaroid'
import { CHAPTERS } from '@/app/chapters'
import { useHerPhotos } from '@/hooks/useHerPhotos'

/**
 * A small taped Polaroid of her that hangs beside each chapter title — a
 * different photo for each chapter. On phones it tucks into the top corner
 * next to the chapter sticker; on wide screens it sits outside the text column.
 */
export default function ChapterPolaroid({ chapterId, name }) {
  const reduce = useReducedMotion()
  const { photos } = useHerPhotos('chapters')
  const index = CHAPTERS.findIndex((c) => c.id === chapterId)
  if (index < 1 || !photos.length) return null
  const photo = photos[(index - 1) % photos.length]

  return (
    <motion.div
      className="pointer-events-none absolute top-5 right-3 z-10 w-16 sm:top-4 sm:right-6 sm:w-[4.5rem] md:top-6 md:w-20 lg:top-16 lg:-right-28 lg:w-28 xl:-right-36 xl:w-32"
      initial={{ opacity: 0, y: -18, rotate: -14, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, rotate: 6, scale: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 140, damping: 14 }}
      aria-hidden="true"
    >
      <motion.div
        style={{ transformOrigin: '50% 0%' }}
        animate={reduce ? undefined : { rotate: [0, -3, 0, 2, 0] }}
        transition={{ delay: 1.2, duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Polaroid
          photo={photo}
          name={name}
          aspect="1/1"
          tape
          decorative
          seed={index}
          padding="p-1.5 pb-2.5 lg:p-2 lg:pb-3"
          captionClassName="hidden pt-1 text-base line-clamp-1 lg:block"
          sizes="(min-width: 1280px) 128px, (min-width: 1024px) 112px, 80px"
        />
      </motion.div>
    </motion.div>
  )
}
