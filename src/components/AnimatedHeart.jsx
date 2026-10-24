import { motion } from 'framer-motion'
import { HEART_PATH } from './illustrations/Doodles'

/** A small heart that gently beats. */
export default function AnimatedHeart({ className = 'size-5', color = 'currentColor', label }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      animate={{ scale: [1, 1.18, 1, 1.1, 1] }}
      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
    >
      <path d={HEART_PATH} fill={color} />
    </motion.svg>
  )
}
