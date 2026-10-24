import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useHerPhotos } from '@/hooks/useHerPhotos'

const CHANGE_MS = 9_000
const OPACITY = 0.38
const BLURRED_OPACITY = 0.26

/**
 * A soft, see-through photo of her filling the whole screen behind a page.
 * It sits above the drifting decorations but below all content, slowly zooms,
 * and cross-fades between photos when more than one is ticked. `start` lets
 * each page open on a different photo; `blurred` keeps it out of focus until
 * the page decides to reveal it (used by the Final Surprise).
 */
export default function PhotoBackdrop({ start = 0, blurred = false }) {
  const reduce = useReducedMotion()
  const { photos: all } = useHerPhotos('backgrounds')
  const photos = all.filter((p) => p.image_url)
  const count = photos.length
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduce || count < 2) return undefined
    const timer = setInterval(() => setStep((s) => s + 1), CHANGE_MS)
    return () => clearInterval(timer)
  }, [reduce, count])

  if (!count || typeof document === 'undefined') return null
  const photo = photos[(start + step) % count]

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ filter: blurred ? 'blur(14px)' : 'blur(0px)', opacity: blurred ? BLURRED_OPACITY / OPACITY : 1 }}
        transition={{ duration: reduce ? 0 : 1.6, ease: 'easeInOut' }}
      >
        <AnimatePresence initial>
          <motion.img
            key={photo.id}
            src={photo.image_url}
            alt=""
            decoding="async"
            className="absolute inset-0 size-full object-cover object-[50%_30%]"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: OPACITY, scale: reduce ? 1.06 : 1.14 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.8, ease: 'easeInOut' }, scale: { duration: CHANGE_MS / 1000 + 2, ease: 'linear' } }}
          />
        </AnimatePresence>
      </motion.div>
      {/* Keeps headings readable over busy parts of the photo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/10 to-cream/60" />
    </div>,
    document.body,
  )
}
