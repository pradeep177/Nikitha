import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { HeartShape, Sparkle } from './illustrations/Doodles'
import { seededRandom } from '@/utils/random'

const COLORS = ['#d9487c', '#f7c1cf', '#cbbcf0', '#ffe28a', '#ffc7a8', '#c27c8e']

function Pieces({ seed, count }) {
  const pieces = useMemo(() => {
    const rand = seededRandom(seed)
    return Array.from({ length: count }, (_, i) => ({
      left: rand() * 100,
      delay: rand() * 0.6,
      duration: 2.2 + rand() * 1.4,
      drift: (rand() - 0.5) * 160,
      rotate: (rand() - 0.5) * 540,
      size: 9 + rand() * 12,
      color: COLORS[i % COLORS.length],
      shape: i % 3,
    }))
  }, [seed, count])

  return pieces.map((p, i) => (
    <motion.span
      key={i}
      className="absolute -top-8"
      style={{ left: `${p.left}%`, color: p.color }}
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
      animate={{ y: '110vh', x: p.drift, rotate: p.rotate, opacity: [1, 1, 0.8, 0] }}
      transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
    >
      {p.shape === 0 ? (
        <HeartShape style={{ width: p.size, height: p.size }} />
      ) : p.shape === 1 ? (
        <Sparkle style={{ width: p.size, height: p.size }} />
      ) : (
        <span className="block rounded-[2px]" style={{ width: p.size * 0.5, height: p.size, background: p.color }} />
      )}
    </motion.span>
  ))
}

/**
 * Tasteful full-screen confetti of hearts and sparkles. Fires once each time
 * `trigger` changes to a truthy value, then removes itself. Skipped entirely
 * for visitors who prefer reduced motion.
 */
export default function Confetti({ trigger, count = 46 }) {
  const reduce = useReducedMotion()
  const [finished, setFinished] = useState(null)

  useEffect(() => {
    if (!trigger) return undefined
    const timer = setTimeout(() => setFinished(trigger), 4200)
    return () => clearTimeout(timer)
  }, [trigger])

  if (reduce || !trigger || finished === trigger) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      <Pieces key={trigger} seed={Number(trigger) || 7} count={count} />
    </div>,
    document.body,
  )
}
