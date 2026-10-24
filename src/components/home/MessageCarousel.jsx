import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { HeartShape } from '../illustrations/Doodles'
import PlaceholderBadge from '../PlaceholderBadge'

const INTERVAL = 5200

/**
 * Rotating collection of short affectionate messages. Gentle fade/slide,
 * pauses on hover/focus, has a visible pause button, and never auto-rotates
 * for reduced-motion visitors.
 */
export default function MessageCarousel({ messages }) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovering, setHovering] = useState(false)
  const count = messages.length
  const autoplay = count > 1 && !paused && !hovering && !reduce

  useEffect(() => {
    if (!autoplay) return undefined
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL)
    return () => clearInterval(timer)
  }, [autoplay, count])

  if (!count) return null
  const safeIndex = index % count
  const current = messages[safeIndex]
  const go = (step) => setIndex((i) => (i + step + count) % count)

  return (
    <section
      className="mx-auto max-w-3xl px-5"
      aria-roledescription="carousel"
      aria-label="Little reminders"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div className="card-paper relative overflow-hidden px-6 pt-10 pb-6 text-center sm:px-14">
        <HeartShape className="absolute -top-6 -left-6 size-24 rotate-[-18deg] text-blush" />
        <HeartShape className="absolute -right-5 -bottom-8 size-20 rotate-12 text-lavender" />
        <p className="relative text-xs font-extrabold tracking-[0.2em] text-rose uppercase">A little reminder</p>

        <div className="relative mt-3 grid min-h-[7.5rem] place-items-center" aria-live={autoplay ? 'off' : 'polite'}>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={current.id ?? safeIndex}
              initial={{ opacity: 0, y: 14, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55 }}
              className="font-hand text-[2rem] leading-tight text-balance text-ink sm:text-[2.4rem]"
            >
              “{current.message}”
            </motion.blockquote>
          </AnimatePresence>
        </div>
        {current.is_placeholder && <PlaceholderBadge label="Example message" className="relative mt-2" />}

        <div className="relative mt-5 flex items-center justify-center gap-1 sm:gap-2">
          <button type="button" onClick={() => go(-1)} className="btn btn-ghost size-11 p-0" aria-label="Previous message">
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="flex items-center">
            {messages.map((m, i) => (
              <button
                key={m.id ?? i}
                type="button"
                onClick={() => setIndex(i)}
                className="grid size-6 place-items-center"
                aria-label={`Show message ${i + 1}`}
                aria-current={i === safeIndex}
              >
                <span className={`block h-2 rounded-full transition-all ${i === safeIndex ? 'w-5 bg-berry' : 'w-2 bg-blush-deep'}`} />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => go(1)} className="btn btn-ghost size-11 p-0" aria-label="Next message">
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
          {count > 1 && !reduce && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="btn btn-ghost size-11 p-0"
              aria-label={paused ? 'Resume rotating messages' : 'Pause rotating messages'}
            >
              {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
