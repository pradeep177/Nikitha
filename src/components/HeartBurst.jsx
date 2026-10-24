import { useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { HeartShape, Sparkle } from './illustrations/Doodles'

const COLORS = ['text-berry', 'text-rose', 'text-blush-deep', 'text-lavender-deep', 'text-butter-deep']

function Burst({ count, spread, seed }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (seed % 7) * 0.3
        const distance = spread * (0.6 + ((i * 37 + seed) % 10) / 22)
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - spread * 0.25,
          size: 10 + ((i * 13 + seed) % 12),
          rotate: ((i * 47) % 60) - 30,
          sparkle: i % 4 === 3,
          color: COLORS[(i + seed) % COLORS.length],
        }
      }),
    [count, spread, seed],
  )

  return particles.map((p, i) => {
    const Shape = p.sparkle ? Sparkle : HeartShape
    return (
      <motion.span
        key={i}
        className={`absolute top-1/2 left-1/2 ${p.color}`}
        initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 1 }}
        animate={{ x: `calc(-50% + ${p.x}px)`, y: `calc(-50% + ${p.y}px)`, scale: [0, 1.2, 1], opacity: [1, 1, 0], rotate: p.rotate }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <Shape style={{ width: p.size, height: p.size }} />
      </motion.span>
    )
  })
}

/**
 * Little explosion of hearts. Change `trigger` (e.g. a counter) to fire a burst.
 * Render inside a `relative` container; it never blocks clicks.
 */
export default function HeartBurst({ trigger, count = 14, spread = 90, className = '' }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <span className={`pointer-events-none absolute inset-0 z-20 overflow-visible ${className}`} aria-hidden="true">
      <AnimatePresence>{trigger ? <Burst key={trigger} count={count} spread={spread} seed={Number(trigger) || 1} /> : null}</AnimatePresence>
    </span>
  )
}
