import { motion } from 'framer-motion'
import Planet from './illustrations/Planet'

const REACTIONS = {
  happy: { y: [0, -6, 0], rotate: 0, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  excited: { y: [0, -22, 0, -10, 0], rotate: [0, -8, 8, 0], transition: { duration: 0.9 } },
  oops: { x: [0, -8, 8, -6, 6, 0], rotate: [0, -6, 6, -3, 0], transition: { duration: 0.6 } },
  thinking: { rotate: [0, -6, 0], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  sleepy: { y: [0, 3, 0], transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } },
}

/** Animated planet mascot that reacts with different moods. */
export default function Mascot({ mood = 'happy', className = 'size-24', reactionKey }) {
  return (
    <motion.div key={`${mood}-${reactionKey ?? ''}`} animate={REACTIONS[mood] ?? REACTIONS.happy} className="inline-block">
      <Planet mood={mood} className={className} />
    </motion.div>
  )
}
