import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import SmartImage from '../SmartImage'
import { personalize } from '@/app/chapters'
import { photoAlt } from '@/hooks/useHerPhotos'

export const SHUFFLE_MS = 3_000
const MAX_DOTS = 8

// Where each card sits in the pile (relative to the front card), in fractions of the card width.
// Cards further back are hidden.
const SLOTS = [
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { x: -0.08, y: 0.02, rotate: -8, scale: 0.95, opacity: 1 },
  { x: 0.08, y: 0.04, rotate: 7, scale: 0.91, opacity: 1 },
]
const HIDDEN = { x: 0, y: 0.05, rotate: 0, scale: 0.86, opacity: 0 }
const SWING_OUT = { x: 0.78, y: -0.06, rotate: 16, scale: 0.98, opacity: 1 }
const slotFor = (pos) => SLOTS[pos] ?? HIDDEN
const inPx = (slot, width) => ({ ...slot, x: slot.x * width, y: slot.y * width })
const settle = { type: 'spring', stiffness: 170, damping: 22, zIndex: { duration: 0 } }
const swingOut = { duration: 0.42, ease: [0.4, 0, 0.2, 1], zIndex: { duration: 0 } }

function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState === 'visible')
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}

/**
 * The landing-page Polaroid. With more than one photo it becomes a little
 * pile: every 3 seconds the front photo swings out and tucks in at the back.
 * Tap or swipe the front photo to shuffle; dots jump to a photo; it pauses on
 * hover/focus, off-screen, in a hidden tab, or with "reduce motion" switched on.
 */
export default function PhotoStack({ photos, name, placeholderLabel }) {
  const count = photos.length
  const reduce = useReducedMotion()
  const rootRef = useRef(null)
  const inView = useInView(rootRef, { amount: 0.3 })
  const pageVisible = usePageVisible()
  const [{ index, out, tucking }, setState] = useState({ index: 0, out: null, tucking: null })
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const dragged = useRef(false)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const current = count ? index % count : 0
  const frontId = photos[current]?.id

  const goTo = useCallback((i) => setState((s) => (i === s.index % count ? s : { index: i, out: null, tucking: null })), [count])
  // Phase 1: the front photo swings out on top of the pile (skipped with reduced motion).
  const next = useCallback(() => {
    if (count < 2) return
    setState((s) => {
      if (s.out) return s
      if (reduce) return { index: (s.index + 1) % count, out: null, tucking: null }
      return { ...s, out: frontId }
    })
  }, [count, reduce, frontId])
  // Phase 2: the pile moves up and the swung-out photo tucks in at the back.
  const tuckIn = useCallback(
    (id) => setState((s) => (s.out === id ? { index: (s.index + 1) % count, out: null, tucking: id } : s)),
    [count],
  )

  const autoplay = count > 1 && !reduce && !userPaused && !hovered && !focused && inView && pageVisible
  useEffect(() => {
    if (!autoplay) return undefined
    const timer = setTimeout(next, SHUFFLE_MS)
    return () => clearTimeout(timer)
  }, [autoplay, index, next])

  const front = photos[current]

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => e.target.matches?.(':focus-visible') && setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
    >
      <div className="grid">
        {photos.map((photo, i) => {
          const pos = (i - current + count) % count
          const swinging = photo.id === out
          if (pos > 3 && !swinging && photo.id !== tucking) return null
          const z = count - pos
          const isFront = pos === 0
          const animate = swinging ? { ...inPx(SWING_OUT, width), zIndex: count + 1 } : { ...inPx(slotFor(pos), width), zIndex: z }
          const transition = reduce ? { duration: 0 } : swinging ? swingOut : settle

          return (
            <motion.div
              key={photo.id}
              className={`relative [grid-area:1/1] ${isFront && count > 1 ? 'cursor-pointer touch-pan-y' : ''}`}
              initial={i === 0 ? false : inPx(HIDDEN, width)}
              animate={animate}
              transition={transition}
              onAnimationComplete={() => swinging && tuckIn(photo.id)}
              drag={isFront && count > 1 && !out ? 'x' : false}
              dragSnapToOrigin
              dragElastic={0.5}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 400) next()
              }}
              onPointerDown={() => (dragged.current = false)}
              onClick={() => {
                if (!dragged.current && isFront && count > 1) next()
              }}
              aria-hidden={isFront ? undefined : true}
            >
              <div className="relative flex h-full flex-col rounded-md bg-white p-3 pb-4 shadow-lift sm:p-4 sm:pb-5">
                <span
                  className="absolute -top-4 left-1/2 z-10 h-7 w-24 -translate-x-1/2 rotate-[-5deg] rounded-sm bg-butter/85 shadow-sm"
                  aria-hidden="true"
                />
                <SmartImage
                  src={photo.image_url}
                  alt={isFront ? photoAlt(photo, name) : ''}
                  aspect="4/5"
                  eager={i === 0}
                  className="rounded-sm"
                  placeholderLabel={isFront ? placeholderLabel : ''}
                  seed={i + 1}
                />
                <p className="px-8 pt-3 text-center font-hand text-2xl leading-tight text-balance text-ink-soft">
                  {personalize(photo.caption, name)}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 -bottom-12 z-20 flex items-center justify-center gap-1">
          {count <= MAX_DOTS ? (
            <div
              role="group"
              aria-label="Choose a photo"
              className="flex items-center"
              onKeyDown={(e) => {
                const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
                if (!step) return
                e.preventDefault()
                const target = (current + step + count) % count
                goTo(target)
                e.currentTarget.querySelectorAll('button')[target]?.focus()
              }}
            >
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => goTo(i)}
                  tabIndex={i === current ? 0 : -1}
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  aria-current={i === current ? 'true' : undefined}
                  className="grid size-7 place-items-center rounded-full"
                >
                  <span className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-berry' : 'w-2 bg-blush-deep'}`} />
                </button>
              ))}
            </div>
          ) : (
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-sm font-bold text-ink-soft shadow-sm">
              {current + 1} / {count}
            </span>
          )}
          {!reduce && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? 'Play the photo shuffle' : 'Pause the photo shuffle'}
              aria-pressed={userPaused}
              className="ml-1 grid size-8 place-items-center rounded-full bg-white/85 text-berry-deep shadow-sm transition hover:bg-white"
            >
              {userPaused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
            </button>
          )}
        </div>
      )}
      {count > 1 && (
        <p className="sr-only" aria-live={autoplay ? 'off' : 'polite'}>
          {`Photo ${current + 1} of ${count}${front?.caption ? `: ${personalize(front.caption, name)}` : ''}`}
        </p>
      )}
    </div>
  )
}
